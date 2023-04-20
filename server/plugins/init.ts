import { RuntimeConfig } from "nuxt/schema";
import { getEpisodeData } from "../load";

export default defineNitroPlugin(() => {
  // Side effect: result will be cached and ready.
  getEpisodeData(useRuntimeConfig() as RuntimeConfig);
});
