import fs from "node:fs/promises";
import fsAsync from "node:fs";
import path from "path";
import { sendStream } from "h3";
import { RuntimeConfig } from "nuxt/schema";

const config = useRuntimeConfig() as RuntimeConfig;

export default defineEventHandler(async (event) => {
  const imageId = event.context?.params?.id;
  if (!imageId) {
    throw new Error("No imageId param");
  }
  const filePath = path.join(
    config.imageOutputDir,
    `${imageId}.${config.public.imageOutputExtension}`
  );
  await fs.access(filePath);
  return sendStream(event, fsAsync.createReadStream(filePath));
});
