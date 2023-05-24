import fs from "node:fs/promises";
import { RuntimeConfig } from "nuxt/schema";
import { imagePathForId } from "~/server/file";
import logger from "~/server/logger";

const config = useRuntimeConfig() as RuntimeConfig;
const frameFileStateStorage = useStorage("frameFileState");

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw new Error("No id param");
  }

  frameFileStateStorage.removeItem(id);

  const frameFile = imagePathForId(config, id);
  logger.info(`Clean up image file after loading at ${frameFile}`);
  fs.rm(frameFile).catch((error) => {
    if (error.code !== "ENOENT") {
      logger.error(
        `Failed to clean up fetched image ${frameFile} due to: ${error}`,
      );
    }
  });

  // User doesn't need to await on or know anything about whether the frame
  // image was successfully cleaned up.
  return {};
});
