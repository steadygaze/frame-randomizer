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
  const { defaultLanguage, clientData } = await getShowData(config);

  return defineEventHandler((event) => {
    const language = String(getQuery(event).language || defaultLanguage);
    if (language === "undefined" && !defaultLanguage) {
      throw createError({
        statusCode: 400,
        statusMessage: "No language specified",
      });
    }
    if (!(language in clientData)) {
      throw createError({
        statusCode: 404,
        statusMessage: `language "${language}" not found`,
      });
    }

    return clientData[language];
  });
});
