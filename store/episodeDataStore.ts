import { useFetch } from "#app";
import { defineStore } from "pinia";
import { ref } from "vue";
import { episodeName } from "~/utils/utils";
import { ClientEpisodeData } from "~~/server/api/list";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview: string;
}

export const useEpisodeDataStore = defineStore("episodeData", () => {
  const imageId = ref(0);
  const episodeData = ref(null as ProcessedEpisodeData[] | null);

  const initEpisodeData = async () => {
    const { data: rawData } = await useFetch("/api/list");
    episodeData.value = rawData.value
      ? rawData.value.episodeData.map((ep: ClientEpisodeData) => {
          return {
            ...ep,
            fullName: episodeName(ep.season, ep.episode, ep.name),
          };
        })
      : [];
  };

  return { imageId, episodeData, initEpisodeData };
});
