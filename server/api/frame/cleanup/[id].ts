import fs from "node:fs/promises";
import { imagePathForId } from "~/server/file";
import logger from "~/server/logger";

const config = useRuntimeConfig();
const frameFileStateStorage = useStorage("frameFileState");

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id param" });
  }

  frameFileStateStorage.removeItem(id);

  const frameFile = imagePathForId(config, id);
  logger.info(`Clean up image file after loading`, { file: frameFile });
  fs.rm(frameFile).catch((error) => {
    if (error.code !== "ENOENT") {
      logger.error(`Failed to clean up fetched image: ${error}`, {
        file: frameFile,
      });
    }
  });

  // User doesn't need to await on or know anything about whether the frame
  // image was successfully cleaned up.
  return {};
});
