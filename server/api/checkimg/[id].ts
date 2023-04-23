import fs from "node:fs/promises";
import path from "path";
import { RuntimeConfig } from "nuxt/schema";
import { QueryObject, getQuery } from "ufo";
import { StoredAnswer } from "~/server/types";

const config = useRuntimeConfig() as RuntimeConfig;
const storage = useStorage("genimg");

function getInt(query: QueryObject, key: keyof QueryObject) {
  const rawValue = query[key] as string;
  return rawValue ? parseInt(rawValue) : -1;
}

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const query = getQuery(event.node.req.url as string);
  if (!id) {
    throw new Error("No imageId param");
  }
  const season = getInt(query, "season");
  const episode = getInt(query, "episode");

  const filePath = path.join(
    config.imageOutputDir,
    `${id}.${config.public.imageOutputExtension}`
  );
  // Remove the file but don't await on it; it doesn't affect the result.
  fs.rm(filePath)
    .then(() => {
      console.log("Cleaned up used image file", filePath);
    })
    .catch((error) => {
      console.error(
        "Failed to clean up used image",
        filePath,
        "due to:",
        error
      );
    });

  const answer = (await storage.getItem(id)) as StoredAnswer | null;
  // Don't await on removing from storage.
  storage
    .removeItem(id)
    .then(() => {
      console.log("Cleaned up stored answer for image", filePath);
    })
    .catch((error) => {
      console.error(
        "Failed to clean up stored answer for image",
        filePath,
        "due to:",
        error
      );
    });
  if (!answer) {
    throw createError({ statusCode: 404 });
  }
  const correct = answer.season === season && answer.episode === episode;
  return { correct, ...answer };
});
