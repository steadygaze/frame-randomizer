import { exec as execAsync } from "node:child_process";
import fs from "fs/promises";
import { promisify } from "node:util";
import once from "lodash.once";
import { ProducerQueue } from "./queue";
import { StoredAnswer, StoredFileState } from "./types";
import {
  ServerEpisodeData,
  ShowData,
  findFiles,
  imagePathForId,
  lsAllFiles,
  offsetTimeBySkipRanges,
} from "./file";
import { myUuid } from "./utils";
import { logger } from "./logger";

const exec = promisify(execAsync);

/**
 * Gets episode data from the specified config file, and joins it with file
 * information.
 * @param runtimeConfig Runtime config options.
 * @returns Episode data list, with an entry for each episode.
 */
async function getShowDataUncached(
  runtimeConfig: ReturnType<typeof useRuntimeConfig>,
): Promise<ShowData> {
  const start = Date.now();
  const [rawShowDataString, fileData] = await Promise.all([
    fs.readFile(runtimeConfig.showDataPath, { encoding: "utf-8" }),
    lsAllFiles(runtimeConfig),
    fs
      .mkdir(runtimeConfig.frameOutputDir, { recursive: true })
      .catch((error) => {
        if (
          !(error instanceof Object) ||
          !("code" in error) ||
          error.code !== "EEXIST"
        ) {
          throw error;
        }
        // Ignore if dir already exists.
      }),
  ]);
  const rawShowData = JSON.parse(rawShowDataString);
  const showData = await findFiles(runtimeConfig, rawShowData, fileData);
  logger.info(
    `Loaded ${showData.episodes.length} episodes in ${Date.now() - start} ms`,
  );
  return showData;
}

const getShowData = once(getShowDataUncached);

/**
 * Generates a random time in an episode in seconds, considering skip ranges.
 *
 * For example, if an episode is 60 seconds long, and the first 10 seconds are
 * skipped, we will generate a number between 0 and 50, and then return that
 * number plus 10.
 * @param episode Episode data object.
 * @returns Random time, in seconds.
 */
function randomTimeInEpisode(episode: ServerEpisodeData): number {
  const randomUnoffsetTime = Math.random() * episode.genLength;
  const offsetTime = Math.min(
    offsetTimeBySkipRanges(randomUnoffsetTime, episode.skipRanges),
    episode.lengthSec,
  );
  return offsetTime;
}

interface RandomEpisode {
  episode: ServerEpisodeData;
  seekTime: number;
}

/**
 * Calls ffmpeg to run the command to extract a particular frame.
 * @param config Nuxt runtime config.
 * @param chooseFrame Function to call to try another frame.
 * @param outputPath Path to output the image to (including file extension).
 * @param subtitles Whether to burn subtitles into the image.
 * @returns Promise to await on completion.
 */
async function ffmpegFrame(
  config: ReturnType<typeof useRuntimeConfig>,
  chooseFrame: () => RandomEpisode,
  outputPath: string,
  subtitles: boolean,
): Promise<RandomEpisode> {
  const ffmpeg = config.ffmpegPath;
  const identify = config.imageMagickIdentifyPath;
  const inject = config.ffmpegImageCommandInject;
  const maxRejects = config.frameGenMaxAttempts;
  const requiredStddev = config.frameRequiredStandardDeviation;
  const fontName = config.subtitleFontName;
  const fontSize = config.subtitleFontSize;

  const start = Date.now();
  let rejected = -1;
  let random;
  do {
    ++rejected;
    random = chooseFrame();
    const command =
      subtitles && random.episode.subtitleFilename
        ? `${ffmpeg} -ss ${random.seekTime} -copyts -i ${random.episode.filename} -frames:v 1 -filter_complex "subtitles=filename=${random.episode.subtitleFilename}:force_style='Fontname=${fontName},Fontsize=${fontSize}'" -update true -y ${outputPath}`
        : `${ffmpeg} -ss ${random.seekTime} -i ${
            random.episode.filename
          } -frames:v 1 -update true ${inject || ""} -y ${outputPath}`;
    logger.verbose("Executing ffmpeg command", { command });
    await exec(command);
  } while (
    /* eslint-disable-next-line no-unmodified-loop-condition -- Other conditions modified. */
    requiredStddev > 0 &&
    rejected < maxRejects &&
    parseInt(
      (await exec(`${identify} -format '%[standard_deviation]' ${outputPath}`))
        .stdout,
    ) < requiredStddev
  );
  logger.info(`New image generated in ${Date.now() - start} ms`, {
    file: outputPath,
    rejected,
  });
  return random;
}

/**
 * Scans persistent storage to find all unserved frames that can be requeued.
 * @param config Runtime config options.
 * @returns List of recoverable frames.
 */
async function recoverFrames(config: ReturnType<typeof useRuntimeConfig>) {
  const answerStorage = useStorage("answer");
  const frameStorage = useStorage("frameState");

  const ids = await frameStorage.getKeys();
  let noAnswer = 0;
  let unservedAnswer = 0;
  let cleanedFileAnswer = 0;
  let servedFile = 0;
  let recoveredCount = 0;
  let missingFile = 0;

  const recovered = (
    await Promise.all(
      ids.map(async (frameId) => {
        const [fileData, answerData] = await Promise.all([
          frameStorage.getItem<StoredFileState>(frameId),
          answerStorage.getItem<StoredAnswer>(frameId),
        ]);
        if (!fileData) {
          // This shouldn't actually happen because we're querying by the keys
          // we just listed, but we handle it anyway.
          if (answerData) {
            if (!answerData.expiryTs) {
              ++unservedAnswer;
              // Answer is supposedly for an unserved frame, but there is no frame
              // data. Delete this inconsistent data.
              answerStorage.removeItem(frameId);
            } else {
              ++cleanedFileAnswer;
            }
            // Otherwise, file may be cleaned up but there may be a pending answer;
            // don't delete the answer.
            return null;
          }
          // No file data nor answer data? No problem!
          return null;
        }

        if (!answerData) {
          ++noAnswer;
          // Answer lost, so even if we have the file, it's unusable.
          frameStorage.removeItem(frameId);
          // Don't care if this fails with ENOENT.
          fs.rm(imagePathForId(config, frameId)).catch();
          return null;
        }
        if (fileData.expiryTs) {
          ++servedFile;
          // Already served image.
          return null;
        }
        try {
          await fs.stat(imagePathForId(config, frameId));
          ++recoveredCount;
          return { genSeries: fileData.genSeries, frameId };
        } catch (e) {
          ++missingFile;
          // Probably ENOENT, or the image file is otherwise inaccessible.
          // No need to await.
          frameStorage.removeItem(frameId);
          if (!answerData || !answerData.expiryTs) {
            answerStorage.removeItem(frameId);
          }
          return null;
        }
      }),
    )
  ).filter((e) => e && e.frameId) as [{ genSeries: string; frameId: string }];

  return {
    recovered,
    stats: {
      noAnswer,
      unservedAnswer,
      cleanedFileAnswer,
      servedFile,
      recoveredCount,
      missingFile,
    },
  };
}

/**
 * Sorts recovered frames into separate lists by series.
 * @param arr Recovered frames to sort.
 * @returns Frames sorted by series.
 */
function sortBySeries(arr: [{ genSeries: string; frameId: string }]): {
  [key: string]: [{ frameId: string }];
} {
  const result: ReturnType<typeof sortBySeries> = {};
  arr.forEach(({ genSeries, frameId }) => {
    genSeries = genSeries || "frame";
    if (genSeries in result) {
      result[genSeries].push({ frameId });
    } else {
      result[genSeries] = [{ frameId }];
    }
  });
  return result;
}

/**
 * Gets a frame producer queue, which manages generating new frames, returning
 * pregenerated frames, etc.
 * @param config Runtime config options.
 * @returns Producer queue on the image IDs generated.
 */
async function getFrameProducerQueueUncached(
  config: ReturnType<typeof useRuntimeConfig>,
): Promise<ProducerQueue<{ frameId: string }>> {
  const { episodes } = await getShowData(config);

  const answerStorage = useStorage("answer");
  const frameStateStorage = useStorage("frameState");

  /**
   * Generate a random episode and a random time in the episode.
   * @returns Episode data and seek time.
   */
  function chooseRandomFrame(): RandomEpisode {
    const episode = episodes[Math.floor(Math.random() * episodes.length)];
    const seekTime = randomTimeInEpisode(episode);
    return { episode, seekTime };
  }

  /**
   * Performs all jobs associated with generating a frame.
   *
   * This includes generating the frame, and storing the "answer" (what episode
   * the frame is from) in storage.
   * @param subtitles Whether to burn in subtitles.
   * @returns ID of the image generated.
   */
  async function generateFrame(subtitles: boolean) {
    const frameId = myUuid(config);
    const imagePath = imagePathForId(config, frameId);

    // Record that we generated this file.
    const storeFrameIdP = frameStateStorage.setItem(frameId, {
      expiryTs: null,
    });
    const { episode, seekTime } = await ffmpegFrame(
      config,
      chooseRandomFrame,
      imagePath,
      subtitles,
    );

    await Promise.all([
      // If we returned the image path to the client without awaiting on ffmpeg,
      // they might try to load the image before it's done generating.
      // We do await on storing the answer despite this not affecting the query
      // result to prevent a rare data race between the answer being stored and
      // the client checking their guess.
      answerStorage.setItem(frameId, {
        season: episode.season_number,
        episode: episode.episode_number,
        seekTime,
        expiryTs: null,
      } as StoredAnswer),
      // We have to await on this because otherwise it can race with setting the
      // expiry time when serving.
      storeFrameIdP,
    ]);
    return { frameId };
  }

  const { recovered, stats } = await recoverFrames(config);
  const recoveredBySeries = sortBySeries(recovered);
  logger.info(
    `Recovered ${recovered.length} unserved frames from previous runs`,
    {
      stats,
      series: Object.fromEntries(
        Object.entries(recoveredBySeries).map(([series, recovered]) => [
          series,
          recovered.length,
        ]),
      ),
    },
  );

  return new ProducerQueue<{ frameId: string }>(
    {
      frame: {
        produceFn: () => generateFrame(false),
        preproduced: recoveredBySeries.frame || [],
      },
      frameWithSubtitles: {
        produceFn: () => generateFrame(true),
        preproduced: recoveredBySeries.frameWithSubtitles || [],
      },
    },
    {
      length: config.framePregenCount,
      maxPending: config.frameGenMaxParallelism,
      maxRetries: config.frameGenMaxAttempts,
      queueExhaustionQueueCount: config.queueExhaustionQueueCount,
    },
  );
}

const getFrameProducerQueue = once(getFrameProducerQueueUncached);

export { getShowData, getFrameProducerQueue };
