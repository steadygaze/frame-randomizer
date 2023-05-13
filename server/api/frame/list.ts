import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { getEpisodeData } from "../../load";

export interface ClientEpisodeData {
  season: number;
  episode: number;
  name: string;
  overview: string;
}

const config = useRuntimeConfig() as RuntimeConfig;

/**
 * Gets episode data to return to clients. This is constant once loaded.
 * @param config Runtime config options.
 * @returns A list of all episodes.
 */
async function getClientEpisodeDataInit(
  config: RuntimeConfig,
): Promise<ClientEpisodeData[]> {
  const episodeData = await getEpisodeData(config);
  return episodeData.map(({ season, episode, name, overview }) => {
    return { season, episode, name, overview };
  });
}

const getClientEpisodeData = once(getClientEpisodeDataInit);

export default defineLazyEventHandler(async () => {
  const episodeData = await getClientEpisodeData(config);

  return defineEventHandler(() => {
    return { episodeData };
  });
});
