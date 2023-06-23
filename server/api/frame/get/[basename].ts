import fsAsync from "node:fs";
import path from "path";
import { sendStream } from "h3";
import logger from "~/server/logger";

const config = useRuntimeConfig();

const traversingPathRe = /[/\\]|\.\./;

export default defineEventHandler((event) => {
  const imageBasename = event.context?.params?.basename;
  if (!imageBasename) {
    throw createError({ statusCode: 404 });
  }
  if (traversingPathRe.test(imageBasename)) {
    // Prevent path traversal security vulnerability.
    throw createError({ statusCode: 400 });
  }
  const filePath = path.join(config.frameOutputDir, imageBasename);
  try {
    return sendStream(event, fsAsync.createReadStream(filePath));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      // Tried to get a file path that doesn't exist.
      logger.error("Got request for nonexistent frame", {
        file: filePath,
        path: imageBasename,
      });
      throw createError({ statusCode: 404 });
    } else {
      logger.error("Unknown error when serving frame", {
        error,
      });
      throw createError({ statusCode: 500 });
    }
  }
});
