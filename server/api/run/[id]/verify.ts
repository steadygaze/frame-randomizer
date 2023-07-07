import crypto from "node:crypto";
import stringify from "json-stringify-deterministic";
import { StoredRunData } from "~/server/types";
import logger from "~/server/logger";

const config = useRuntimeConfig();
const archivedRunStorage = useStorage("archivedRun");
const runStateStorage = useStorage("runState");

const privateKey = config.privateKey
  ? crypto.createPrivateKey(config.privateKey)
  : null;

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

  let signature;
  let signedString;
  if (privateKey) {
    signedString = stringify(runState);
    signature = crypto
      .sign("SHA256", Buffer.from(signedString), privateKey)
      .toString("base64");
  }

  const verifiedData = { runState, signedString, signature };
  logger.info("Returning verified run data", verifiedData);

  return verifiedData;
});
