import path from "node:path";
import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import { RuntimeConfig } from "nuxt/schema";
import { getEpisodeData } from "../load";
import { myUuid } from "~~/utils/utils";

const config = useRuntimeConfig() as RuntimeConfig;
const exec = promisify(execAsync);
const storage = useStorage("genimg");

async function ffmpegFrame(
  videoPath: string,
  timestamp: number | string,
  outputPath: string
) {
  const ts = Date.now();
  await exec(
    `ffmpeg -ss ${timestamp} -i ${videoPath} -frames:v 1 -y ${outputPath}`
  );
  const delta = Date.now() - ts;
  console.log("Image outputted in", delta, "ms to", outputPath);
}

export default defineLazyEventHandler(async () => {
  const episodeData = await getEpisodeData(config);

  return defineEventHandler(async () => {
    const imageId = myUuid(config);
    const imagePath = path.join(
      config.imageOutputDir,
      `${imageId}.${config.public.imageOutputExtension}`
    );
    const { filename, lengthSec, season, episode, name } =
      episodeData[Math.floor(Math.random() * episodeData.length)];
    const randomSeekTimeSec = Math.random() * lengthSec;
    const minute = Math.floor(randomSeekTimeSec / 60);
    const second = Math.floor((randomSeekTimeSec % 60) * 1000) / 1000;
    const command = `vlc --start-time ${
      Math.floor(randomSeekTimeSec) - config.replayPreSec
    } ${filename}`;
    await Promise.all([
      ffmpegFrame(filename, randomSeekTimeSec, imagePath),
      // We do await on storing the answer despite this not affecting the query
      // result to prevent a rare data race between the answer being stored and
      // the client checking their guess.
      storage.setItem(imageId, {
        minute,
        second,
        season,
        episode,
        name,
      }),
    ]);
    return { imageId, command, minute, second, season, episode, name };
  });
});
