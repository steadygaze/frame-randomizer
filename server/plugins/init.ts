import { getFrameProducerQueue } from "../load";

/**
 *
 */
async function clearImageStorage() {
  await useStorage("genimg").clear();
}

export default defineNitroPlugin(() => {
  // Side effect: result will be cached and ready.
  getFrameProducerQueue(useRuntimeConfig());
  clearImageStorage();
});
