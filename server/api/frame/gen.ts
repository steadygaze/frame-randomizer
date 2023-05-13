import { RuntimeConfig } from "nuxt/schema";
import { getFrameProducerQueue } from "../../load";
import { StoredAnswer } from "~/server/types";

const config = useRuntimeConfig() as RuntimeConfig;
const storage = useStorage("genimg");

/**
 * Adds an expiration time to an answer.
 *
 * Generally, once an image is served, its answer can expire. (Pregenerated images can't expire of course.)
 * @param id ID to add expiry to.
 * @returns Promise to await on completion.
 */
async function addExpiry(id: string): Promise<void> {
  console.log("Now adding expiry on serving to", id);
  const answer = (await storage.getItem(id)) as StoredAnswer;
  // Rare race condition between cleaning up answer and setting expiry.
  await storage.setItem(id, {
    ...answer,
    expiryTs: Date.now() + config.frameExpiryMs,
  });
}

export default defineLazyEventHandler(async () => {
  const queue = await getFrameProducerQueue(config);

  return defineEventHandler(async () => {
    const start = Date.now();
    const result = await queue.next();
    console.log(
      "Request waited",
      Date.now() - start,
      "ms for image generation and callback queue"
    );
    // Don't await on adding an expiry time, because it won't affect the result.
    addExpiry(result.imageId);
    return result;
  });
});
