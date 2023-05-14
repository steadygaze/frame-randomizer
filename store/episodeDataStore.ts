import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "#app";
import { episodeName } from "~/utils/utils";
import { ClientEpisodeDatum } from "~/server/api/frame/list";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview: string;
}

export const useEpisodeDataStore = defineStore("episodeData", () => {
  const episodeData = ref([] as ProcessedEpisodeData[]);
  const mediaName = ref("");

  const initEpisodeData = async () => {
    const { data: rawData } = await useFetch("/api/frame/list");
    if (rawData.value) {
      mediaName.value = rawData.value.name;
      episodeData.value = rawData.value.episodes.map(
        (ep: ClientEpisodeDatum) => {
          return {
            ...ep,
            fullName: episodeName(ep.season, ep.episode, ep.name),
          };
        },
      );
    }
  };

  return {
    mediaName,
    episodeData,
    initEpisodeData,
  };
});
