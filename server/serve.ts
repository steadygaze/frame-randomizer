import { logger } from "./logger";
import type { StoredRunData } from "./types";

/**
 * Log an image fetch to a verified run.
 * @param id ID of the resource being fetched.
 * @param runId Verified run ID.
 * @param runStateStorage Run storage.
 * @returns Promise to await on completion.
 */
export async function logFetchToRun(
  id: string,
  runId: string,
  runStateStorage: ReturnType<typeof useStorage>,
) {
  const runState = await runStateStorage.getItem<StoredRunData>(String(runId));
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
      description: "Attempted to load the wrong frame (unexpected path)",
      ts: now,
      mismatched: runState.pending,
      attemptedId: id,
    });
  } else {
    runState.pending.startTs = now;
    logger.info("Logging frame loading to verified run", { runId });
  }
  await runStateStorage.setItem(String(runId), runState);
}
