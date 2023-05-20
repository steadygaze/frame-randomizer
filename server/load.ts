import { exec as execAsync } from "node:child_process";
import fs from "fs/promises";
import { promisify } from "node:util";
import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { ProducerQueue } from "./queue";
import { StoredAnswer } from "./types";
import {
  EpisodeData,
  ShowData,
  findFiles,
  imagePathForId,
  lsAllFiles,
  offsetTimeBySkipRanges,
} from "./file";
import { myUuid } from "./utils";

const exec = promisify(execAsync);

/**
 * Gets episode data from the specified config file, and joins it with file
 * information.
 * @param runtimeConfig Runtime config options.
 * @returns Episode data list, with an entry for each episode.
 */
async function getShowdataUncached(
  runtimeConfig: RuntimeConfig,
): Promise<ShowData> {
  const start = Date.now();
  const [episodeConfigString, fileData] = await Promise.all([
    fs.readFile(runtimeConfig.showDataPath, { encoding: "utf-8" }),
    lsAllFiles(runtimeConfig),
    fs
      .mkdir(runtimeConfig.frameOutputDir, { recursive: true })
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
    episodeData.episodes.length,
    "episodes in",
    Date.now() - start,
    "ms",
  );
  return episodeData;
}

const getShowData = once(getShowdataUncached);

/**
 * Generates a random time in an episode in seconds, considering skip ranges.
 *
 * For example, if an episode is 60 seconds long, and the first 10 seconds are
 * skipped, we will generate a number between 0 and 50, and then return that
 * number plus 10.
 * @param episode Episode data object.
 * @returns Random time, in seconds.
 */
function randomTimeInEpisode(episode: EpisodeData): number {
  const randomUnoffsetTime = Math.random() * episode.genLength;
  const offsetTime = Math.min(
    offsetTimeBySkipRanges(randomUnoffsetTime, episode.skipRanges),
    episode.lengthSec,
  );
  return offsetTime;
}

/**
 * Calls ffmpeg to run the command to extract a particular frame.
 * @param config Nuxt runtime config.
 * @param videoPath Path to video file.
 * @param timecode Timecode accepted by ffmpeg (seconds, or XX:XX format).
 * @param outputPath Path to output the image to (including file extension).
 * @returns Promise to await on completion.
 */
async function ffmpegFrame(
  config: RuntimeConfig,
  videoPath: string,
  timecode: number | string,
  outputPath: string,
): Promise<void> {
  const ffmpeg = config.ffmpegPath;
  const identify = config.imageMagickIdentifyPath;
  const inject = config.ffmpegImageCommandInject;
  const maxRejects = config.frameGenMaxAttempts;
  const stddev = config.frameRequiredStandardDeviation;

  const start = Date.now();
  let rejected = -1;
  do {
    ++rejected;
    await exec(
      `${ffmpeg} -ss ${timecode} -i ${videoPath} -frames:v 1 -update true ${
        inject || ""
      } -y ${outputPath}`,
    );
  } while (
    /* eslint-disable-next-line no-unmodified-loop-condition -- Other conditions modified. */
    stddev > 0 &&
    rejected < maxRejects &&
    parseInt(
      (await exec(`${identify} -format '%[standard_deviation]' ${outputPath}`))
        .stdout,
    ) > stddev
  );
  console.log(
    "New image generated in",
    Date.now() - start,
    `ms (${rejected} of ${maxRejects} rejects) at`,
    outputPath,
  );
}

/**
 * Gets a frame producer queue, which manages generating new frames, returning
 * pregenerated frames, etc.
 * @param config Runtime config options.
 * @returns Producer queue on the image IDs generated.
 */
async function getFrameProducerQueueUncached(
  config: RuntimeConfig,
): Promise<ProducerQueue<{ imageId: string }>> {
  const { episodes } = await getShowData(config);
  const answerStorage = useStorage("answer");
  const frameFileStateStorage = useStorage("frameFileState");

  /**
   * Performs all jobs associated with generating a frame.
   *
   * This includes generating the frame, and storing the "answer" (what episode
   * the frame is from) in storage.
   * @returns ID of the image generated.
   */
  async function generateFrame() {
    const imageId = myUuid(config);
    const imagePath = imagePathForId(config, imageId);
    const episode = episodes[Math.floor(Math.random() * episodes.length)];
    const seekTime = randomTimeInEpisode(episode);
    await Promise.all([
      // If we returned the image path to the client without awaiting on ffmpeg,
      // they might try to load the image before it's done generating.
      ffmpegFrame(config, episode.filename, seekTime, imagePath),
      // Record that we generated this file. We have to await on this because
      // otherwise it can race with setting the expiry time on serving.
      frameFileStateStorage.setItem(imageId, { expiryTs: null }),
      // We do await on storing the answer despite this not affecting the query
      // result to prevent a rare data race between the answer being stored and
      // the client checking their guess.
      answerStorage.setItem(imageId, {
        season: episode.season,
        episode: episode.episode,
        seekTime,
        expiryTs: null,
      } as StoredAnswer),
    ]);
    return { imageId };
  }

  return new ProducerQueue(generateFrame, {
    length: config.framePregenCount,
    maxPending: config.frameGenMaxParallelism,
  });
}

const getFrameProducerQueue = once(getFrameProducerQueueUncached);

export { getShowData, getFrameProducerQueue };
