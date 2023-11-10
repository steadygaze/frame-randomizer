import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "#app";
import { useI18n } from "#imports";
import { episodeName } from "~/utils/utils";
import type { ClientEpisodeData, ClientShowData } from "~/server/api/show";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  originalName?: string;
  synopsis?: string;
}

export const useShowDataStore = defineStore("episodeData", () => {
  const { locale } = useI18n();

  const showName = ref("");
  const originalLanguage = ref("");
  const synopsisAvailable = ref(false);
  const subtitlesAvailable = ref(false);
  const episodeData = ref([] as ProcessedEpisodeData[]);

  const languageCache: { [key: string]: Promise<ClientShowData | null> } = {};

  /**
   * Initializes show data, using the API if needed.
   *
   * Results for each language are cached, so this is idempotent and can be
   * called from multiple places if needed.
   */
  async function initShowData() {
    if (!(locale.value in languageCache)) {
      languageCache[locale.value] = useFetch<ClientShowData>(
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
      originalLanguage.value = data.originalLanguage;
      synopsisAvailable.value = data.synopsisAvailable;
      subtitlesAvailable.value = data.subtitlesAvailable;
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
    originalLanguage,
    synopsisAvailable,
    subtitlesAvailable,
    episodeData,
    initShowData,
  };
});
