import fs from "node:fs/promises";
import { RuntimeConfig } from "nuxt/schema";
import { imagePathForId } from "./file";

const config = useRuntimeConfig() as RuntimeConfig;
const answerStorage = useStorage("answer");
const frameFileStateStorage = useStorage("frameFileState");

/**
 * Cleans up the given answer.
 * @param id ID to clean up.
 * @returns Promise to await on completion.
 */
export async function cleanupAnswer(id: string): Promise<void> {
  const filePath = imagePathForId(config, id);
  await Promise.all([
    fs.rm(filePath).catch((error) => {
      console.error(
        "Failed to clean up used image",
        filePath,
        "due to:",
        error,
      );
    }),
    answerStorage.removeItem(id).catch((error) => {
      console.error(
        "Failed to clean up stored answer for image",
        filePath,
        "due to:",
        error,
      );
    }),
    frameFileStateStorage.removeItem(id).catch((error) => {
      console.error(
        "Failed to clean up stored answer for image",
        filePath,
        "due to:",
        error,
      );
    }),
  ]);
  console.log("Cleaned up stored answer and image for", filePath);
}
