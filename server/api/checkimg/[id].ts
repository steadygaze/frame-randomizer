import fs from "node:fs/promises";
import path from "path";
import { RuntimeConfig } from "nuxt/schema";

const config = useRuntimeConfig() as RuntimeConfig;
const storage = useStorage("genimg");

export default defineEventHandler(async (event) => {
  const imageId = event.context?.params?.id;
  if (!imageId) {
    throw new Error("No imageId param");
  }

  const filePath = path.join(
    config.imageOutputDir,
    `${imageId}.${config.public.imageOutputExtension}`
  );
  // Remove the file but don't await on it; it doesn't affect the result.
  fs.rm(filePath)
    .then(() => {
      console.log("Cleaned up used image file", filePath);
    })
    .catch((error) => {
      console.error(
        "Failed to clean up used image",
        filePath,
        "due to:",
        error
      );
    });

  const answer = await storage.getItem(imageId);
  // Don't await on removing from storage.
  storage
    .removeItem(imageId)
    .then(() => {
      console.log("Cleaned up stored answer for image", filePath);
    })
    .catch((error) => {
      console.error(
        "Failed to clean up stored answer for image",
        filePath,
        "due to:",
        error
      );
    });
  return answer;
});
