import fs from "node:fs/promises";
import fsAsync from "node:fs";
import path from "path";
import { sendStream } from "h3";
import { RuntimeConfig } from "nuxt/schema";

const config = useRuntimeConfig() as RuntimeConfig;

const traversingPathRe = /[/\\]|\.\./;

export default defineEventHandler(async (event) => {
  const imageBasename = event.context?.params?.basename;
  if (!imageBasename) {
    throw createError({ statusCode: 404 });
  }
  if (traversingPathRe.test(imageBasename)) {
    // Prevent path traversal security vulnerability.
    throw createError({ statusCode: 400 });
  }
  const filePath = path.join(config.frameOutputDir, imageBasename);
  await fs.access(filePath);
  return sendStream(event, fsAsync.createReadStream(filePath));
});
