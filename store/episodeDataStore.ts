import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "#app";
import { episodeName } from "~/utils/utils";
import { ClientEpisodeData } from "~/server/api/frame/list";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview: string;
}

export const useEpisodeDataStore = defineStore("episodeData", () => {
  const episodeData = ref(null as ProcessedEpisodeData[] | null);
  const imageId = ref(0);
  const imageIsLoading = ref(true);
  const readout = ref("Welcome! The first image will load shortly.");

  const initEpisodeData = async () => {
    const { data: rawData } = await useFetch("/api/frame/list");
    episodeData.value = rawData.value
      ? rawData.value.episodeData.map((ep: ClientEpisodeData) => {
          return {
            ...ep,
            fullName: episodeName(ep.season, ep.episode, ep.name),
          };
        })
      : [];
  };

  return { episodeData, imageId, imageIsLoading, readout, initEpisodeData };
});
