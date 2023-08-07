import { exec as execAsync } from "node:child_process";
import fs from "fs/promises";
import { promisify } from "node:util";
import once from "lodash.once";
import { ProducerQueue } from "./queue";
import { StoredAnswer, StoredFileState } from "./types";
import {
  ServerEpisodeData,
  ShowData,
  audioPathForId,
  findFiles,
  imagePathForId,
  lsAllFiles,
  offsetTimeBySkipRanges,
  randomTimeRangeInEpisode,
  resourcePathForId,
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
  logger.info(`New frame generated in ${Date.now() - start} ms`, {
    file: outputPath,
    rejected,
  });
  return random;
}

/**
 * Generates an audio file over the given range.
 * @param config RuntimeConfig options.
 * @param episode Random episode and seek time.
 * @param outputPath Path to output the image to (including file extension).
 * @param audioLength Length of the audio range.
 * @returns Promise to await on completion.
 */
async function ffmpegAudio(
  config: ReturnType<typeof useRuntimeConfig>,
  episode: RandomEpisode,
  outputPath: string,
  audioLength: number,
): Promise<RandomEpisode> {
  const ffmpeg = config.ffmpegPath;
  const inject = config.ffmpegAudioCommandInject;

  const start = Date.now();
  const command = `${ffmpeg} -ss ${episode.seekTime} -i ${episode.episode.filename} -t ${audioLength} -vn -map a:0 -ac 1 ${inject} -y ${outputPath}`;
  logger.verbose("Executing ffmpeg command", { command });
  await exec(command);

  logger.info(`New audio generated in ${Date.now() - start} ms`, {
    file: outputPath,
  });
  return episode;
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
      ids.map(async (id) => {
        const [fileData, answerData] = await Promise.all([
          frameStorage.getItem<StoredFileState>(id),
          answerStorage.getItem<StoredAnswer>(id),
        ]);
        if (!fileData) {
          // This shouldn't actually happen because we're querying by the keys
          // we just listed, but we handle it anyway.
          if (answerData) {
            if (!answerData.expiryTs) {
              ++unservedAnswer;
              // Answer is supposedly for an unserved frame, but there is no frame
              // data. Delete this inconsistent data.
              answerStorage.removeItem(id);
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
          frameStorage.removeItem(id);
          // Don't care if this fails with ENOENT.
          fs.rm(imagePathForId(config, id)).catch();
          return null;
        }
        if (fileData.expiryTs) {
          ++servedFile;
          // Already served image.
          return null;
        }
        try {
          await fs.stat(resourcePathForId(config, id, fileData));
          ++recoveredCount;
          return { kind: fileData.kind, id };
        } catch (e) {
          ++missingFile;
          // Probably ENOENT, or the image file is otherwise inaccessible.
          // No need to await.
          frameStorage.removeItem(id);
          if (!answerData || !answerData.expiryTs) {
            answerStorage.removeItem(id);
          }
          return null;
        }
      }),
    )
  ).filter((e) => e && e.id) as [{ kind: string; id: string }];

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
 * Sorts recovered frames into separate lists by kind.
 * @param arr Recovered frames to sort.
 * @returns Frames sorted by kind.
 */
function sortByKind(arr: [{ kind: string; id: string }]): {
  [key: string]: [{ id: string }];
} {
  const result: ReturnType<typeof sortByKind> = {};
  arr.forEach(({ kind, id }) => {
    kind = kind || "frame";
    if (kind in result) {
      result[kind].push({ id });
    } else {
      result[kind] = [{ id }];
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
): Promise<ProducerQueue<{ id: string }>> {
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
    const storeFrameIdP = resourceStateStorage.setItem<StoredFileState>(
      frameId,
      {
        kind: subtitles ? "frameWithSubtitles" : "frame",
        expiryTs: null,
      },
    );
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
    return { id: frameId };
  }

  /**
   * Select a random episode and generate a random time in it.
   * @param length Length of the audio range to generate.
   * @returns Start offset in video.
   */
  function chooseRandomAudio(length: number): RandomEpisode {
    const episode = episodes[Math.floor(Math.random() * episodes.length)];
    const seekTime = randomTimeRangeInEpisode(episode, length);
    return { episode, seekTime };
  }

  /**
   * Generate a random audio clip.
   * @param length Length of the audio range to generate.
   * @returns Promise to await on completion.
   */
  async function generateAudio(length: number): Promise<{ id: string }> {
    const audioId = myUuid(config);
    const audioPath = audioPathForId(config, audioId);

    const storeAudioIdP = frameStateStorage.setItem<StoredFileState>(audioId, {
      kind: `audio${length}s`,
      expiryTs: null,
    });
    const { episode, seekTime } = await ffmpegAudio(
      config,
      chooseRandomAudio(length),
      audioPath,
      length,
    );

    await Promise.all([
      answerStorage.setItem<StoredAnswer>(audioId, {
        season: episode.season_number,
        episode: episode.episode_number,
        seekTime,
        expiryTs: null,
      }),
      storeAudioIdP,
    ]);
    return { id: audioId };
  }

  const { recovered, stats } = await recoverFrames(config);
  const recoveredByKind = sortByKind(recovered);
  logger.info(
    `Recovered ${recovered.length} unserved resources from previous runs`,
    {
      stats,
      kind: Object.fromEntries(
        Object.entries(recoveredByKind).map(([kind, recovered]) => [
          kind,
          recovered.length,
        ]),
      ),
    },
  );

  return new ProducerQueue<{ id: string }>(
    {
      frame: {
        produceFn: () => generateFrame(false),
        preproduced: recoveredByKind.frame || [],
      },
      frameWithSubtitles: {
        produceFn: () => generateFrame(true),
        preproduced: recoveredByKind.frameWithSubtitles || [],
      },
      audio5s: {
        produceFn: () => generateAudio(5),
        preproduced: recoveredByKind.audio5s || [],
      },
      audio10s: {
        produceFn: () => generateAudio(10),
        preproduced: recoveredByKind.audio10s || [],
      },
      audio15s: {
        produceFn: () => generateAudio(15),
        preproduced: recoveredByKind.audio15s || [],
      },
    },
    {
      length: config.framePregenCount,
      perKindMinimum: config.perKindMinimum,
      maxPending: config.frameGenMaxParallelism,
      maxRetries: config.frameGenMaxAttempts,
      queueExhaustionQueueCount: config.queueExhaustionQueueCount,
    },
  );
}

const getFrameProducerQueue = once(getFrameProducerQueueUncached);

export { getShowData, getFrameProducerQueue };
