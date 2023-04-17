import path from "node:path";
import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";
import { RuntimeConfig } from "nuxt/schema";
import { getEpisodeData } from "../load";
import { myUuid } from "~~/utils/utils";

const config = useRuntimeConfig() as RuntimeConfig;
const exec = promisify(execAsync);

async function ffmpegFrame(
  videoPath: string,
  timestamp: number | string,
  outputPath: string
) {
  await exec(
    `ffmpeg -ss ${timestamp} -i ${videoPath} -frames:v 1 -y ${outputPath}`
  );
}

export default defineLazyEventHandler(async () => {
  const episodeData = await getEpisodeData(config);

  return defineEventHandler(async () => {
    const imageId = myUuid(config);
    const imagePath = path.join(
      config.imageOutputDir,
      `${imageId}.${config.public.imageOutputExtension}`
    );
    console.log("Image outputted to", imagePath);
    const { filename, lengthSec, season, episode, name } =
      episodeData[Math.floor(Math.random() * episodeData.length)];
    const randomSeekTimeSec = Math.random() * lengthSec;
    const minute = Math.floor(randomSeekTimeSec / 60);
    const second = Math.floor((randomSeekTimeSec % 60) * 1000) / 1000;
    await ffmpegFrame(filename, randomSeekTimeSec, imagePath);
    const command = `vlc --start-time ${
      Math.floor(randomSeekTimeSec) - 5
    } ${filename}`;
    return { imageId, command, minute, second, season, episode, name };
  });
});
