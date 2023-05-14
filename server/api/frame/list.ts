import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { getEpisodeData } from "../../load";

export interface ClientEpisodeDatum {
  season: number;
  episode: number;
  name: string;
  overview: string;
}

export interface ClientEpisodeData {
  name: string;
  episodes: ClientEpisodeDatum[];
}

const config = useRuntimeConfig() as RuntimeConfig;

/**
 * Gets episode data to return to clients. This is constant once loaded.
 * @param config Runtime config options.
 * @returns A list of all episodes.
 */
async function getClientEpisodeDataInit(
  config: RuntimeConfig,
): Promise<ClientEpisodeData> {
  const { name, episodes } = await getEpisodeData(config);
  return {
    name,
    episodes: episodes.map(({ season, episode, name, overview }) => {
      return { season, episode, name, overview };
    }),
  };
}

const getClientEpisodeData = once(getClientEpisodeDataInit);

export default defineLazyEventHandler(async () => {
  const episodeData = await getClientEpisodeData(config);

  return defineEventHandler(() => {
    return episodeData;
  });
});
