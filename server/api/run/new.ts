import { myUuid } from "~/server/utils";
import { StoredRunData } from "~/server/types";
import { logger } from "~/server/logger";

const config = useRuntimeConfig();
const runStateStorage = useStorage("runState");

export default defineEventHandler(async () => {
  const runId = myUuid(config, "run_tracking");

  logger.info("Assigning new run id", { runId });
  await runStateStorage.setItem(runId, {
    creationTs: Date.now(),
    pending: null,
    history: [],
    errors: [],
    expiryTs: Date.now() + config.runExpiryMs,
    version: config.public.softwareVersion,
  } as StoredRunData);

  return { runId };
});
