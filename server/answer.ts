import fs from "node:fs/promises";
import path from "path";
import { RuntimeConfig } from "nuxt/schema";

const config = useRuntimeConfig() as RuntimeConfig;
const storage = useStorage("genimg");

export async function cleanupAnswer(id: string) {
  const filePath = path.join(
    config.imageOutputDir,
    `${id}.${config.public.imageOutputExtension}`
  );
  await Promise.all([
    fs.rm(filePath).catch((error) => {
      console.error(
        "Failed to clean up used image",
        filePath,
        "due to:",
        error
      );
    }),
    storage.removeItem(id).catch((error) => {
      console.error(
        "Failed to clean up stored answer for image",
        filePath,
        "due to:",
        error
      );
    }),
  ]);
  console.log("Cleaned up stored answer and image for", filePath);
}
