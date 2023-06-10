import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "#app";
import { episodeName } from "~/utils/utils";
import { ClientEpisodeData } from "~/server/api/show";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview?: string;
}

export const useShowDataStore = defineStore("episodeData", () => {
  const episodeData = ref([] as ProcessedEpisodeData[]);
  const showName = ref("");

  const initShowData = async () => {
    const { data } = await useFetch("/api/show");
    if (data.value) {
      showName.value = data.value.name;
      episodeData.value = data.value.episodes.map((ep: ClientEpisodeData) => {
        return {
          ...ep,
          fullName: episodeName(ep.season, ep.episode, ep.name),
        };
      });
    }
  };

  return {
    showName,
    episodeData,
    initShowData,
  };
});
