import fs from "node:fs/promises";
import path from "path";
import { RuntimeConfig } from "nuxt/schema";

const config = useRuntimeConfig() as RuntimeConfig;
const storage = useStorage("genimg");

export function cleanupAnswer(id: string) {
  const filePath = path.join(
    config.imageOutputDir,
    `${id}.${config.public.imageOutputExtension}`
  );
  return Promise.all([
    fs
      .rm(filePath)
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
      }),
    storage
      .removeItem(id)
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
      }),
  ]);
}
