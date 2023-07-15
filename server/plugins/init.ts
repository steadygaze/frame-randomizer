import { getFrameProducerQueue } from "../load";

export default defineNitroPlugin(() => {
  // Side effect: result will be cached and ready.
  getFrameProducerQueue(useRuntimeConfig());
});
