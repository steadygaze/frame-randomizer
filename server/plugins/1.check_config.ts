import { RuntimeConfig } from "nuxt/schema";
import { checkKeys } from "~/utils/utils";

const REQUIRED_KEYS = ["episodeDataPath", "videoSourceDir"];
const REQUIRED_PUBLIC_KEYS = ["instanceName"];

// Checks if config options are ok and throws an error if they aren't.
export default defineNitroPlugin(() => {
  const config = useRuntimeConfig() as RuntimeConfig;
  checkKeys(REQUIRED_KEYS, config);
  checkKeys(REQUIRED_PUBLIC_KEYS, config.public);
});
