import { RuntimeConfig } from "nuxt/schema";
import { getFrameProducerQueue } from "../load";
import { StoredAnswer } from "~/server/types";

const config = useRuntimeConfig() as RuntimeConfig;
const storage = useStorage("genimg");

async function addExpiry(id: string) {
  console.log("Now adding expiry to", id);
  const answer = (await storage.getItem(id)) as StoredAnswer;
  // Rare race condition between cleaning up answer and setting expiry.
  await storage.setItem(id, {
    ...answer,
    expiryTs: Date.now() + config.imageExpiryMs,
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
