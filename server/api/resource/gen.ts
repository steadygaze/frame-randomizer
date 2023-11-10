import { getFrameProducerQueue } from "../../load";
import type {
  StoredAnswer,
  StoredFileState,
  StoredRunData,
} from "~/server/types";
import { logger } from "~/server/logger";
import { cleanupFrame } from "~/server/cleanup";
import { boolUrlParam, intUrlParam } from "~/server/utils";

interface GenQueryString {
  resourceType: string | null;
  subtitles: string | null;
  audioLength: string | null;
  cleanupId: string | null;
  runId: string | null;
}

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
  const [answer, fileState] = await Promise.all([
    answerStorage.getItem<StoredAnswer>(id),
    resourceStateStorage.getItem<StoredFileState>(id),
  ]);
  // Avoid rare race condition between cleaning up answer and setting expiry.
  const writes = [];
  if (answer) {
    writes.push(
      answerStorage.setItem<StoredAnswer>(id, {
        ...answer,
        expiryTs: Date.now() + config.answerExpiryMs,
      }),
    );
  }
  if (fileState) {
    writes.push(
      resourceStateStorage.setItem<StoredFileState>(id, {
        ...fileState,
        expiryTs: Date.now() + config.public.frameExpiryMs,
      }),
    );
  }
  await Promise.all(writes);
}

/**
 * Converts a kind of options to a "kind name", a unique string descriptor
 * used to fetch the result.
 * @param query Options describing the kind.
 * @returns Kind name.
 */
export function queryToKind(
  query: ReturnType<typeof getQuery<GenQueryString>>,
): string {
  const resourceType = query.resourceType;
  const subtitles = boolUrlParam(query.subtitles);
  const audioLength = intUrlParam(query.audioLength);
  if (resourceType === "audio") {
    if (audioLength === 5) {
      return "audio5s";
    } else if (audioLength === 10) {
      return "audio10s";
    } else if (audioLength === 15) {
      return "audio15s";
    }
    throw createError({
      statusCode: 400,
      statusMessage: "audioLength value invalid",
    });
  }
  return subtitles ? "frameWithSubtitles" : "frame";
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
    const query = getQuery<GenQueryString>(event);
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
