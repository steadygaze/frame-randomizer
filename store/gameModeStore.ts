import { defineStore } from "pinia";

export const useGameModeStore = defineStore("gameModeStore", () => {
  const audioLength = ref("10");
  const resourceType = ref("frame");
  const subtitlesOn = ref(false);

  return {
    audioLength,
    resourceType,
    subtitlesOn,
  };
});
