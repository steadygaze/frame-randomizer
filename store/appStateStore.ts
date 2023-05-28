import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStateStore = defineStore("appState", () => {
  const correctCounter = ref(0);
  const durationMs = ref(0);
  const imageId = ref(0);
  const imageIsLoading = ref(true);
  const imageLoadError = ref(false);
  const readout = ref("Welcome! The first image will load shortly.");
  const startTimestamp = ref(Date.now());
  const streakCounter = ref(0);
  const totalCounter = ref(0);

  /**
   * Resets the app state (tied to the reset button).
   */
  function reset() {
    correctCounter.value = 0;
    durationMs.value = 0;
    startTimestamp.value = Date.now();
    streakCounter.value = 0;
    totalCounter.value = 0;
  }

  return {
    correctCounter,
    durationMs,
    imageId,
    imageIsLoading,
    imageLoadError,
    readout,
    reset,
    startTimestamp,
    streakCounter,
    totalCounter,
  };
});
