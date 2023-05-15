import { RuntimeConfig } from "nuxt/schema";
import once from "lodash.once";
import { getShowData } from "../../load";

export interface ClientEpisodeData {
  season: number;
  episode: number;
  name: string;
  overview: string;
}

export interface ClientShowData {
  name: string;
  episodes: ClientEpisodeData[];
}

const config = useRuntimeConfig() as RuntimeConfig;

/**
 * Gets episode data to return to clients. This is constant once loaded.
 * @param config Runtime config options.
 * @returns A list of all episodes.
 */
async function getClientEpisodeDataInit(
  config: RuntimeConfig,
): Promise<ClientShowData> {
  const { name, episodes } = await getShowData(config);
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
