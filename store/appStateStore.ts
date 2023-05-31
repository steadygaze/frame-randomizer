import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export interface MessageReadout {
  type: "message";
  message: string;
}

export interface CorrectReadout {
  type: "correct";
  answer: string;
}

export interface IncorrectReadout {
  type: "incorrect";
  guess: string;
  answer: string;
}

export interface SkippedReadout {
  type: "skipped";
  answer: string;
}

export type Readout =
  | MessageReadout
  | CorrectReadout
  | IncorrectReadout
  | SkippedReadout;

const initialReadout: Readout = {
  type: "message",
  message: "Welcome! The first image will load shortly.",
};

export const useAppStateStore = defineStore("appState", () => {
  const correctCounter = ref(0);
  const currentGuessTimeDurationMs = ref(0);
  const currentGuessTimeStartTimestamp = ref(0);
  const imageId = ref(0);
  const imageIsLoading = ref(true);
  const imageLoadError = ref(false);
  const readouts: Ref<Readout[]> = ref([initialReadout]);
  const realTimeDurationMs = ref(0);
  const realTimeStartTimestamp = ref(0);
  const streakCounter = ref(0);
  const totalCounter = ref(0);
  const totalGuessTimeAccDurationMs = ref(0);
  const waitingForGuess = ref(false);

  /**
   * Convenience method to set the readout.
   * @param messageOrReadout Raw string message or readout object.
   */
  function readout(messageOrReadout: string | Readout) {
    if (typeof messageOrReadout === "string") {
      readouts.value = [{ type: "message", message: messageOrReadout }];
    } else {
      readouts.value = [messageOrReadout];
    }
  }

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
    readouts,
    realTimeDurationMs,
    realTimeStartTimestamp,
    readout,
    reset,
    streakCounter,
    totalCounter,
    totalGuessTimeAccDurationMs,
    waitingForGuess,
  };
});
