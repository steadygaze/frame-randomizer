import { StoredRunData } from "~/server/types";
import logger from "~/server/logger";

const archivedRunStorage = useStorage("archivedRun");
const runStateStorage = useStorage("runState");

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400 });
  }

  const runState =
    (await runStateStorage.getItem<StoredRunData>(id)) ||
    (await archivedRunStorage.getItem<StoredRunData>(id));
  if (!runState) {
    throw createError({
      statusCode: 404,
    });
  }

  logger.info("Returning verified run data", runState);

  return { runState };
});
