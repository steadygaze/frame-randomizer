import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "#app";
import { useI18n } from "#imports";
import { episodeName } from "~/utils/utils";
import { ClientEpisodeData, ClientShowData } from "~/server/api/show";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  synopsis?: string;
}

export const useShowDataStore = defineStore("episodeData", () => {
  const { locale } = useI18n();

  const showName = ref("");
  const synopsisAvailable = ref(false);
  const episodeData = ref([] as ProcessedEpisodeData[]);

  const languageCache: { [key: string]: Promise<ClientShowData> } = {};

  /**
   * Initializes show data, using the API if needed.
   *
   * Results for each language are cached, so this is idempotent and can be
   * called from multiple places if needed.
   */
  async function initShowData() {
    if (!(locale.value in languageCache)) {
      languageCache[locale.value] = useFetch(
        `/api/show?language=${locale.value}`,
      ).then(({ data, error }) => {
        if (error && error.value) {
          throw error.value;
        }
        return data.value;
      });
    }
    const data = await languageCache[locale.value];
    if (data) {
      showName.value = data.name;
      synopsisAvailable.value = data.synopsisAvailable;
      episodeData.value = data.episodes.map((ep: ClientEpisodeData) => {
        return {
          ...ep,
          fullName: episodeName(ep.season, ep.episode, ep.name),
        };
      });
    }
  }

  return {
    showName,
    synopsisAvailable,
    episodeData,
    initShowData,
  };
});
