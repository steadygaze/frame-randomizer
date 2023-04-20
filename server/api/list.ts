import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { getEpisodeData } from "../load";

export interface ClientEpisodeData {
  season: number;
  episode: number;
  name: string;
}

const config = useRuntimeConfig() as RuntimeConfig;

async function getClientEpisodeDataInit(config: RuntimeConfig) {
  const episodeData = await getEpisodeData(config);
  return episodeData.map(({ season, episode, name }) => {
    return { season, episode, name };
  });
}

const getClientEpisodeData = once(getClientEpisodeDataInit);

export default defineLazyEventHandler(async () => {
  const episodeData = await getClientEpisodeData(config);

  return defineEventHandler(() => {
    return { episodeData };
  });
});
