import fsAsync from "node:fs";
import { sendStream } from "h3";

const config = useRuntimeConfig();

export default defineEventHandler((event) => {
  return sendStream(
    event,
    fsAsync.createReadStream(config.showDataPath, { encoding: "utf8" }),
  );
});
