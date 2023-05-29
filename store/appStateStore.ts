import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStateStore = defineStore("appState", () => {
  const correctCounter = ref(0);
  const currentGuessTimeDurationMs = ref(0);
  const currentGuessTimeStartTimestamp = ref(0);
  const imageId = ref(0);
  const imageIsLoading = ref(true);
  const imageLoadError = ref(false);
  const readout = ref("Welcome! The first image will load shortly.");
  const realTimeDurationMs = ref(0);
  const realTimeStartTimestamp = ref(0);
  const streakCounter = ref(0);
  const totalCounter = ref(0);
  const totalGuessTimeAccDurationMs = ref(0);
  const waitingForGuess = ref(false);

  /**
   * Resets the app state (tied to the reset button).
   */
  function reset() {
    correctCounter.value = 0;
    currentGuessTimeDurationMs.value = 0;
    realTimeDurationMs.value = 0;
    realTimeStartTimestamp.value = 0;
    streakCounter.value = 0;
    totalCounter.value = 0;
    totalGuessTimeAccDurationMs.value = 0;
  }

  return {
    correctCounter,
    currentGuessTimeDurationMs,
    currentGuessTimeStartTimestamp,
    imageId,
    imageIsLoading,
    imageLoadError,
    readout,
    realTimeDurationMs,
    realTimeStartTimestamp,
    reset,
    streakCounter,
    totalCounter,
    totalGuessTimeAccDurationMs,
    waitingForGuess,
  };
});
