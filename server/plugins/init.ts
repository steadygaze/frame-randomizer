import { RuntimeConfig } from "nuxt/schema";
import { getEpisodeData } from "../load";

async function clearImageStorage() {
  await useStorage("genimg").clear();
}

export default defineNitroPlugin(() => {
  // Side effect: result will be cached and ready.
  getEpisodeData(useRuntimeConfig() as RuntimeConfig);
  clearImageStorage();
});
