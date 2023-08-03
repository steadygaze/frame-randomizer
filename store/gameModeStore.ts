import { defineStore } from "pinia";

export const useGameModeStore = defineStore("gameModeStore", () => {
  const subtitlesOn = ref(false);

  return {
    subtitlesOn,
  };
});
