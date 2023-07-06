import fsAsync from "node:fs";
import path from "path";
import { sendStream } from "h3";
import logger from "~/server/logger";
import { cleanupFrame } from "~/server/cleanup";

const config = useRuntimeConfig();

const traversingPathRe = /[/\\]|\.\./;

export default defineEventHandler((event) => {
  const basename = getRouterParam(event, "basename");
  const cleanuponload = getQuery(event).cleanuponload;

  if (!basename) {
    throw createError({ statusCode: 404 });
  }
  if (
    traversingPathRe.test(basename) ||
    !basename.endsWith(`.${config.public.imageOutputExtension}`)
  ) {
    // Prevent path traversal security vulnerability, or attempt to acces other
    // file extensions.
    throw createError({ statusCode: 400 });
  }

  const file = path.join(config.frameOutputDir, basename);
  try {
    const stream = fsAsync.createReadStream(file);
    if (cleanuponload && cleanuponload !== "false" && cleanuponload !== "0") {
      stream.on("close", () => {
        const id = basename.slice(
          0,
          basename.length - (config.public.imageOutputExtension.length + 1),
        );
        logger.info("Cleaning up frame on load", { id });
        cleanupFrame(id, false);
      });
    }
    return sendStream(event, stream);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      // Tried to get a file path that doesn't exist.
      logger.error("Got request for nonexistent frame", {
        file,
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
