import fsAsync from "node:fs";
import path from "path";
import { sendStream } from "h3";
import logger from "~/server/logger";
import { cleanupFrame } from "~/server/cleanup";
import { StoredRunData } from "server/types";

const config = useRuntimeConfig();
const runStateStorage = useStorage("runState");

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

  const runId = getQuery(event).runId;

  const file = path.join(config.frameOutputDir, basename);
  try {
    const stream = fsAsync.createReadStream(file);
    const id = basename.slice(
      0,
      basename.length - (config.public.imageOutputExtension.length + 1),
    );
    if (runId) {
      // The "close" and "ready" events usually occur within milliseconds, and
      // don't actually reflect when the image is done sending to the client.
      stream.on("close", async () => {
        const runState = await runStateStorage.getItem<StoredRunData>(
          String(runId),
        );
        if (!runState) {
          logger.error("Requested run not found when getting frame for run", {
            runId,
          });
          return;
        }
        const now = Date.now();
        if (!runState.pending) {
          runState.errors.push({
            type: "no_pending_on_load",
            description: "No pending frame found in run when loading frame",
            ts: now,
            attemptedId: id,
          });
        } else if (runState.pending.id !== id) {
          runState.errors.push({
            type: "pending_mismatch_on_load",
            description: "Answer given for the wrong frame (ids mismatched)",
            ts: now,
            mismatched: runState.pending,
            attemptedId: id,
          });
        } else {
          runState.pending.startTs = now;
          logger.info("Logging frame loading to verified run", { runId });
        }
        await runStateStorage.setItem(String(runId), runState);
      });
    }
    if (cleanuponload && cleanuponload !== "false" && cleanuponload !== "0") {
      stream.on("close", () => {
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
