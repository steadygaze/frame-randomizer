import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { glob } from "glob";
import intersection from "lodash.intersection";
import type { StoredAnswer, StoredFileState, StoredRunData } from "../types";
import { resourcePathForId } from "../file";
import { logger } from "../logger";

const config = useRuntimeConfig();
const sleep = promisify(setTimeout);
const answerStorage = useStorage("answer");
const archivedRunStorage = useStorage("archivedRun");
const resourceStateStorage = useStorage("resourceState");
const runStateStorage = useStorage("runState");

/**
 * Clean up expired answers.
 */
async function cleanupAnswers() {
  const answerIds = await answerStorage.getKeys();
  await Promise.all(
    answerIds.map(async (answerId) => {
      const answerInput = await answerStorage.getItem(answerId);
      const answer = answerInput as StoredAnswer | null;
      if (answer && answer.expiryTs && answer.expiryTs < Date.now()) {
        logger.info(`Cleaning up expired answer`, { id: answerId });
        await answerStorage.removeItem(answerId).catch((error) => {
          logger.error(`Failed to clean up stored answer: ${error}`, {
            id: answerId,
          });
        });
      }
    }),
  );
}

/**
 * Cleans up images in the output dir not tracked or owned by the server.
 * @param ids IDs of all current files.
 * @param files1 List of frames, first sample.
 * @param files2 List of frames, second sample.
 * @param idExtractionRe Regex to extract id.
 * @returns Promise to await on completion.
 */
function cleanupOrphanedResources(
  ids: Set<string>,
  files1: string[],
  files2: string[],
  idExtractionRe: RegExp,
) {
  return Promise.all(
    intersection(files1, files2)
      .map((file) => {
        const match = idExtractionRe.exec(file);
        if (
          match &&
          match.length > 0 &&
          match.groups &&
          !ids.has(match.groups.key)
        ) {
          logger.info(`Cleaning up apparently orphaned resource`, {
            file,
          });
          return [
            fs.rm(file).catch((error) => {
              logger.error(`Failed to clean up orphaned resource: ${error}`, {
                file,
              });
            }),
          ];
        }
        return [];
      })
      .flat(),
  );
}

/**
 * Checks a single fileId to see if it's expired, and cleans it up if so.
 * @param fileId File ID to check.
 */
async function cleanupOneResource(fileId: string) {
  const storedFileState =
    await resourceStateStorage.getItem<StoredFileState>(fileId);
  if (
    storedFileState &&
    storedFileState?.expiryTs &&
    storedFileState?.expiryTs <= Date.now()
  ) {
    const file = resourcePathForId(config, fileId, storedFileState);
    logger.info(`Cleaning up expired resource`, {
      kind: storedFileState.kind,
      file,
    });
    await Promise.all([
      resourceStateStorage.removeItem(fileId),
      fs.rm(file).catch((error) => {
        if (error.code !== "ENOENT") {
          logger.error(`Failed to clean up expired resource: ${error}`, {
            file,
          });
        }
      }),
    ]);
  }
}

/**
 * Cleans up frames that have expired.
 * @param resourceIds List of frames tracked.
 */
async function cleanupExpiredResources(resourceIds: Set<string>) {
  const cleanups: Promise<void>[] = [];
  resourceIds.forEach((resourceId) =>
    cleanups.push(cleanupOneResource(resourceId)),
  );
  await Promise.all(cleanups);
}

/**
 * Cleans up orphaned and expired frames.
 */
async function cleanupOrphanedAndExpiredImages() {
  const frameExt = config.public.imageOutputExtension;
  const audioExt = config.public.audioOutputExtension;
  const frameGlobPattern = path.join(config.resourceOutputDir, `*.${frameExt}`);
  const audioGlobPattern = path.join(config.resourceOutputDir, `*.${audioExt}`);
  const frameFilenameToKeyRe = new RegExp(
    `/(?<key>[0-9a-f\\-]+)\\.${frameExt}$`,
  );
  const audioFilenameToKeyRe = new RegExp(
    `/(?<key>[0-9a-f\\-]+)\\.${audioExt}$`,
  );

  const [resourceIds, frames1, frames2, audio1, audio2] = await Promise.all([
    resourceStateStorage.getKeys().then((keys) => new Set(keys)),
    // List the files twice to avoid race conditions with storage cleanup.
    // Frames will be cleaned up only if they are present both times.
    glob(frameGlobPattern),
    sleep(1000).then(() => glob(frameGlobPattern)),
    glob(audioGlobPattern),
    sleep(1000).then(() => glob(audioGlobPattern)),
  ]);

  await Promise.all([
    cleanupOrphanedResources(
      resourceIds,
      frames1,
      frames2,
      frameFilenameToKeyRe,
    ),
    cleanupOrphanedResources(resourceIds, audio1, audio2, audioFilenameToKeyRe),
    cleanupExpiredResources(resourceIds),
  ]);
}

/**
 * Cleans up expired, unimportant runs and archives the important runs.
 */
async function cleanupExpiredRuns() {
  const keys = await runStateStorage.getKeys();
  await Promise.all(
    keys.map(async (runId) => {
      const data = await runStateStorage.getItem<StoredRunData>(runId);
      if (data && (!data.expiryTs || data.expiryTs < Date.now())) {
        const work = [runStateStorage.removeItem(runId)];
        if (data.history.length >= config.runRetentionThreshold) {
          data.expiryTs = null;
          work.push(archivedRunStorage.setItem(runId, data));
          logger.info("Archived important run", { runId });
        } else {
          logger.info("Cleaned up unimportant run", { runId });
        }
        await Promise.all(work);
      }
    }),
  );
}

export default defineNitroPlugin(() => {
  setInterval(async () => {
    const start = Date.now();
    await Promise.all([
      cleanupAnswers(),
      cleanupOrphanedAndExpiredImages(),
      cleanupExpiredRuns(),
    ]);
    logger.info(`Cleanup job done in ${Date.now() - start} ms`);
  }, config.cleanupIntervalMs);
});
