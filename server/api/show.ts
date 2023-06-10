import { RuntimeConfig } from "nuxt/schema";
import { getShowData } from "../load";
import {
  ClientEpisodeData as iClientEpisodeData,
  ClientShowData as iClientShowData,
} from "../file";

export type ClientEpisodeData = iClientEpisodeData;
export type ClientShowData = iClientShowData;

const config = useRuntimeConfig() as RuntimeConfig;

export default defineLazyEventHandler(async () => {
  const { clientData } = await getShowData(config);

  return defineEventHandler((event) => {
    const language = String(getQuery(event).language || "en");
    if (!(language in clientData)) {
      throw createError({
        statusCode: 404,
        statusMessage: `language "${language}" not found`,
      });
    }

    return clientData[language];
  });
});
