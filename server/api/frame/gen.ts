import { RuntimeConfig } from "nuxt/schema";
import { getFrameProducerQueue } from "../../load";
import { StoredAnswer, StoredFileState } from "~/server/types";
import logger from "~/server/logger";

const config = useRuntimeConfig() as RuntimeConfig;
const answerStorage = useStorage("answer");
const frameFileStateStorage = useStorage("frameFileState");

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
    frameFileStateStorage.setItem(id, {
      expiryTs: Date.now() + config.frameExpiryMs,
    } as StoredFileState),
  ]);
}

export default defineLazyEventHandler(async () => {
  const queue = await getFrameProducerQueue(config);

  return defineEventHandler(async () => {
    const start = Date.now();
    const result = await queue.next();
    logger.info(
      `Request waited ${
        Date.now() - start
      } ms for image generation and callback queue`,
    );
    // Don't await on adding an expiry time, because it won't affect the result.
    addExpiry(result.imageId);
    return result;
  });
});
