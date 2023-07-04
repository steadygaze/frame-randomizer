import fs from "node:fs/promises";
import logger from "~/server/logger";
import { imagePathForId } from "~/server/file";

const config = useRuntimeConfig();
const frameStateStorage = useStorage("frameState");

/**
 * Delete the file and storage entry for a frame.
 * @param id ID of the frame.
 */
export async function cleanupFrame(id: string) {
  const frameFile = imagePathForId(config, id);

  if (!(await frameStateStorage.hasItem(id))) {
    // This happens if the frame expires before the user gets the next frame, so
    // it's not an error/warning.
    logger.info("Cleanup requested on unknown frame", { id });
    return; // Callers don't care.
  }

  await Promise.all([
    frameStateStorage.removeItem(id),
    fs.rm(frameFile).catch((error) => {
      if (error.code !== "ENOENT") {
        logger.error(`Failed to clean up fetched image: ${error}`, {
          file: frameFile,
        });
      }
    }),
  ]);
}
