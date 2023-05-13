import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { glob } from "glob";
import { RuntimeConfig } from "nuxt/schema";
import { cleanupAnswer } from "../answer";
import { StoredAnswer } from "../types";

const config = useRuntimeConfig() as RuntimeConfig;
const sleep = promisify(setTimeout);
const storage = useStorage("genimg");

export default defineNitroPlugin(() => {
  setInterval(async () => {
    const start = Date.now();
    const ext = config.public.imageOutputExtension;
    const globPattern = path.join(config.frameOutputDir, `*.${ext}`);
    const [keys, images1, images2] = await Promise.all([
      storage.getKeys(),
      // List the files twice to avoid race conditions with storage cleanup.
      glob(globPattern),
      sleep(1000).then(() => glob(globPattern)),
    ]);
    const cleanups = [];
    const filenameToKeyRe = new RegExp(`/(?<key>[0-9a-f\\-]+)\\.${ext}$`);
    for (const imagePath of images2) {
      // Search for orphaned files.
      const match = filenameToKeyRe.exec(imagePath);
      if (
        match &&
        match.length > 0 &&
        match.groups &&
        !keys.includes(match.groups.key) &&
        images1.includes(imagePath)
      ) {
        console.log("Cleaning up apparently orphaned image", imagePath);
        cleanups.push(
          fs.rm(imagePath).catch((error) => {
            console.error(
              "Failed to clean up orphaned image",
              imagePath,
              "due to:",
              error,
            );
          }),
        );
      }
    }

    for (const key of keys) {
      // Search for expired answers.
      storage.getItem(key).then((answerInput) => {
        const answer = answerInput as StoredAnswer | null;
        if (answer && answer.expiryTs && answer.expiryTs < Date.now()) {
          console.log("Cleaning up expired answer and image", key);
          cleanups.push(cleanupAnswer(key));
        }
      });
    }

    await Promise.all(cleanups);
    console.log("Image cleanup done in", Date.now() - start, "ms");
  }, config.frameCleanupIntervalMs);
});
