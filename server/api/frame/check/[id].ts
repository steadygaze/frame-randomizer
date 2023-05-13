import { QueryObject, getQuery } from "ufo";
import { cleanupAnswer } from "~/server/answer";
import { StoredAnswer } from "~/server/types";

const storage = useStorage("genimg");

/**
 * Gets an int from query params.
 * @param query Query object from Nitro.
 * @param key Query param name.
 * @returns Integer from the given query param.
 */
function getInt(query: QueryObject, key: keyof QueryObject): number {
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

  const answer = (await storage.getItem(id)) as StoredAnswer | null;
  if (!answer) {
    throw createError({ statusCode: 404 });
  }
  // Remove the image file and stored answer but don't await on it; it doesn't affect the result.
  cleanupAnswer(id);

  const correct = answer.season === season && answer.episode === episode;
  return { correct, ...answer };
});
