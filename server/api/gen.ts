import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import { RuntimeConfig } from "nuxt/schema";
import { getEpisodeData } from "../load";
import { ProducerQueue } from "../queue";
import { myUuid } from "~~/utils/utils";
import { StoredAnswer } from "~/server/types";
import {
  EpisodeDatum,
  imagePathForId,
  offsetTimeBySkipRanges,
} from "~/utils/file";

const config = useRuntimeConfig() as RuntimeConfig;
const exec = promisify(execAsync);
const storage = useStorage("genimg");

function randomTimeInEpisode(episode: EpisodeDatum) {
  const randomUnoffsetTime = Math.random() * episode.genLength;
  const offsetTime = Math.min(
    offsetTimeBySkipRanges(randomUnoffsetTime, episode.skipRanges),
    episode.lengthSec
  );
  return offsetTime;
}

async function ffmpegFrame(
  videoPath: string,
  timecode: number | string,
  outputPath: string
) {
  const start = Date.now();
  await exec(
    `ffmpeg -ss ${timecode} -i ${videoPath} -frames:v 1 -update true -lossless 0 -quality 90 -y ${outputPath}`
  );
  console.log(
    "New image generated in",
    Date.now() - start,
    "ms at",
    outputPath
  );
}

async function addExpiry(id: string) {
  console.log("Now adding expiry to", id);
  const answer = (await storage.getItem(id)) as StoredAnswer;
  // Rare race condition between cleaning up answer and setting expiry.
  await storage.setItem(id, {
    ...answer,
    expiryTs: Date.now() + config.imageExpiryMs,
  });
}

export default defineLazyEventHandler(async () => {
  const episodeData = await getEpisodeData(config);

  async function generateFrame() {
    const imageId = myUuid(config);
    const imagePath = imagePathForId(config, imageId);
    const episode = episodeData[Math.floor(Math.random() * episodeData.length)];
    const seekTime = randomTimeInEpisode(episode);
    await Promise.all([
      // If we returned the image path to the client without awaiting on ffmpeg,
      // they might try to load the image before it's done generating.
      ffmpegFrame(episode.filename, seekTime, imagePath),
      // We do await on storing the answer despite this not affecting the query
      // result to prevent a rare data race between the answer being stored and
      // the client checking their guess.
      storage.setItem(imageId, {
        season: episode.season,
        episode: episode.episode,
        seekTime,
      } as StoredAnswer),
    ]);
    return { imageId };
  }

  const queue = new ProducerQueue(generateFrame, {
    length: config.imagePregenCount,
  });

  return defineEventHandler(async () => {
    const start = Date.now();
    const result = await queue.next();
    console.log(
      "Request waited",
      Date.now() - start,
      "ms for image generation and callback queue"
    );
    // Don't await on adding an expiry time, because it won't affect the result.
    addExpiry(result.imageId);
    return result;
  });
});
