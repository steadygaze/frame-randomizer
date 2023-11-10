import { myUuid } from "~/server/utils";
import type { StoredRunData } from "~/server/types";
import { logger } from "~/server/logger";

const config = useRuntimeConfig();
const runStateStorage = useStorage("runState");
let runCounter = 0;

export default defineEventHandler(async () => {
  const runId = myUuid(config, runCounter++, "run_tracking");

  logger.info("Assigning new run id", { runId });
  await runStateStorage.setItem<StoredRunData>(runId, {
    creationTs: Date.now(),
    pending: null,
    history: [],
    errors: [],
    expiryTs: Date.now() + config.runExpiryMs,
    version: config.public.softwareVersion,
  });

  return { runId };
});
