import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStateStore = defineStore("appState", () => {
  const correctCounter = ref(0);
  const imageId = ref(0);
  const imageIsLoading = ref(true);
  const readout = ref("Welcome! The first image will load shortly.");
  const totalCounter = ref(0);

  return {
    correctCounter,
    imageId,
    imageIsLoading,
    readout,
    totalCounter,
  };
});
