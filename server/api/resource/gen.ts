import { getFrameProducerQueue } from "../../load";
import { StoredAnswer, StoredFileState, StoredRunData } from "~/server/types";
import { logger } from "~/server/logger";
import { cleanupFrame } from "~/server/cleanup";
import { queryToKind } from "~/server/utils";

const config = useRuntimeConfig();
const answerStorage = useStorage("answer");
const resourceStateStorage = useStorage("resourceState");
const runStateStorage = useStorage("runState");

/**
 * Adds an expiration time to an answer.
 *
 * Generally, once an image is served, its answer can expire. (Pregenerated images can't expire of course.)
 * @param id ID to add expiry to.
 * @returns Promise to await on completion.
 */
async function addExpiry(id: string): Promise<void> {
  logger.info(`Adding expiry on serving`, { id });
  const answer = (await answerStorage.getItem(id)) as StoredAnswer;
  // Rare race condition between cleaning up answer and setting expiry.
  await Promise.all([
    answerStorage.setItem(id, {
      ...answer,
      expiryTs: Date.now() + config.answerExpiryMs,
    } as StoredAnswer),
    resourceStateStorage.setItem(id, {
      expiryTs: Date.now() + config.public.frameExpiryMs,
    } as StoredFileState),
  ]);
}

export default defineLazyEventHandler(async () => {
  const queue = await getFrameProducerQueue(config);

  /**
   * Gets a queued frame from the frame producer queue. This involves retries if
   * there are bad frames.
   * @param kind Type of frame to generate.
   * @returns Frame data.
   */
  async function getQueuedResource(kind: string) {
    let result = null;
    do {
      try {
        result = await queue.next(kind);
      } catch (error) {
        logger.error("Error while reserving pregenerated frame", { error });
        result = null;
      }
    } while (result === null);
    return result;
  }

  return defineEventHandler(async (event) => {
    const query = getQuery(event);
    const cleanupId = query.cleanupId;
    if (cleanupId) {
      // Don't await; this doesn't affect the rest of the request.
      logger.info("Cleaning up frame on navigation", { id: cleanupId });
      cleanupFrame(String(cleanupId), false);
    }

    const startTs = Date.now();
    const kind = queryToKind(query);
    const resourceData = await getQueuedResource(kind);
    const assignLatencyMs = Date.now() - startTs;
    logger.info(
      `Request waited ${assignLatencyMs} ms for image generation and callback queue`,
    );
    // Don't await on adding an expiry time, because it won't affect the result.
    addExpiry(resourceData.id);

    let runId = query.runId;
    const newPending = {
      id: resourceData.id,
      kind,
      assignTs: startTs,
      assignLatencyMs,
    };
    if (runId) {
      runId = String(runId);

      const runData = await runStateStorage.getItem<StoredRunData>(runId);

      if (!runData) {
        throw createError({
          statusCode: 400,
          statusMessage: "runId does not exist",
        });
      }

      if (runData.pending) {
        runData.errors.push({
          type: "regen",
          description:
            "Generated a new frame without answering for the previous frame",
          ts: startTs,
          oldPending: runData.pending,
          newPending,
        });
        logger.error("Generating a new frame when one is already pending");
      }

      runData.pending = newPending;

      logger.info("Logging frame generation to verified run", { runId });
      runStateStorage.setItem(runId, runData);
    }

    return { ...resourceData };
  });
});
