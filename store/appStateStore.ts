import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export interface KeyReadout {
  type: "message";
  i18nKey: string;
  props?: { [key: string]: string };
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
  | KeyReadout
  | CorrectReadout
  | IncorrectReadout
  | SkippedReadout;

const initialReadout: Readout = {
  type: "message",
  i18nKey: "readout.welcome",
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
   * @param i18nKeyOrReadout Raw string message or readout object.
   * @param props Additional properties, passed to $t.
   */
  function readout(
    i18nKeyOrReadout: string | Readout,
    props?: { [key: string]: string },
  ) {
    if (typeof i18nKeyOrReadout === "string") {
      readouts.value = [{ type: "message", i18nKey: i18nKeyOrReadout, props }];
    } else {
      readouts.value = [i18nKeyOrReadout];
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
