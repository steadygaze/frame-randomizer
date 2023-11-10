import { getShowData } from "../load";
import type {
  ClientEpisodeData as iClientEpisodeData,
  ClientShowData as iClientShowData,
} from "../file";

export type ClientEpisodeData = iClientEpisodeData;
export type ClientShowData = iClientShowData;

const config = useRuntimeConfig();

export default defineLazyEventHandler(async () => {
  const { originalLanguage, clientData } = await getShowData(config);

  return defineEventHandler((event) => {
    let language = String(getQuery(event).language || originalLanguage);
    if (language === "undefined") {
      if (originalLanguage) {
        language = originalLanguage;
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: "No language specified",
        });
      }
    }
    if (!(language in clientData)) {
      if (originalLanguage) {
        language = originalLanguage;
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: `language "${language}" not found and no original configured`,
        });
      }
    }

    return clientData[language];
  });
});
