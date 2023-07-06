import { getFrameProducerQueue } from "../../load";
import { StoredAnswer, StoredFileState } from "~/server/types";
import logger from "~/server/logger";
import { cleanupFrame } from "~/server/cleanup";

const config = useRuntimeConfig();
const answerStorage = useStorage("answer");
const frameStateStorage = useStorage("frameState");

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
    frameStateStorage.setItem(id, {
      expiryTs: Date.now() + config.public.frameExpiryMs,
    } as StoredFileState),
  ]);
}

export default defineLazyEventHandler(async () => {
  const queue = await getFrameProducerQueue(config);

  return defineEventHandler(async (event) => {
    const cleanupid = getQuery(event).cleanupid;
    if (cleanupid) {
      // Don't await; this doesn't affect the rest of the request.
      logger.info("Cleaning up frame on navigation", { id: cleanupid });
      cleanupFrame(String(cleanupid), false);
    }

    const start = Date.now();
    let result = null;
    do {
      try {
        result = await queue.next();
      } catch (error) {
        logger.error("Error while reserving pregenerated image", { error });
        result = null;
      }
    } while (result === null);
    logger.info(
      `Request waited ${
        Date.now() - start
      } ms for image generation and callback queue`,
    );
    // Don't await on adding an expiry time, because it won't affect the result.
    addExpiry(result.frameId);
    return result;
  });
});
