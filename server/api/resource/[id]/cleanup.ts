import { logger } from "~/server/logger";
import { cleanupFrame } from "~/server/cleanup";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id param" });
  }

  logger.info("Cleaning up frame on close", { id });
  cleanupFrame(id, true);

  // User doesn't need to await on or know anything about whether the frame
  // image was successfully cleaned up.
  return {};
});
