import { exec as execAsync } from "node:child_process";
import fs from "fs/promises";
import { promisify } from "node:util";
import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { ProducerQueue } from "./queue";
import { StoredAnswer } from "./types";
import {
  EpisodeDatum,
  findFiles,
  imagePathForId,
  lsAllFiles,
  offsetTimeBySkipRanges,
} from "~/utils/file";
import { myUuid } from "~/utils/utils";

const exec = promisify(execAsync);

async function getEpisodeDataUncached(runtimeConfig: RuntimeConfig) {
  const start = Date.now();
  const [episodeConfigString, fileData] = await Promise.all([
    fs.readFile(runtimeConfig.episodeDataPath, { encoding: "utf-8" }),
    lsAllFiles(runtimeConfig),
    fs
      .mkdir(runtimeConfig.imageOutputDir, { recursive: true })
      .catch((error) => {
        if (error instanceof Object && "code" in error) {
          // Ignore if dir already exists.
          if (error.code !== "EEXIST") {
            throw error;
          }
        } else {
          throw error;
        }
      }),
  ]);
  const episodeConfig = JSON.parse(episodeConfigString);
  const episodeData = await findFiles(runtimeConfig, episodeConfig, fileData);
  console.log(
    "Loaded",
    episodeData.length,
    "episodes in",
    Date.now() - start,
    "ms"
  );
  return episodeData;
}

const getEpisodeData = once(getEpisodeDataUncached);

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

async function getFrameProducerQueueUncached(
  config: RuntimeConfig
): Promise<ProducerQueue<{ imageId: string }>> {
  const episodeData = await getEpisodeData(config);
  const storage = useStorage("genimg");

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

  return new ProducerQueue(generateFrame, {
    length: config.imagePregenCount,
  });
}

const getFrameProducerQueue = once(getFrameProducerQueueUncached);

export { getEpisodeData, getFrameProducerQueue };
