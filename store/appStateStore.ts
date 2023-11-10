import { defineStore } from "pinia";
import { detect } from "detect-browser";
import { ref, Ref } from "vue";

export interface ShortEpisodeData {
  fullName: string;
  season: number;
  episode: number;
}

export interface KeyReadout {
  type: "message";
  i18nKey: string;
  props?: { [key: string]: string };
}

export interface CorrectReadout {
  type: "correct";
  answer: ShortEpisodeData;
}

export interface IncorrectReadout {
  type: "incorrect";
  guess: ShortEpisodeData;
  answer: ShortEpisodeData;
}

export interface SkippedReadout {
  type: "skipped";
  answer: ShortEpisodeData;
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
  const audioId = ref("");
  const browser: Ref<ReturnType<typeof detect>> = ref(null);
  const cleanedUpFrame = ref(false);
  const correctCounter = ref(0);
  const currentGuessTimeDurationMs = ref(0);
  const currentGuessTimeStartTimestamp = ref(0);
  const frameId = ref("");
  const imageIsLoading = ref(true);
  const imageLoadError = ref(false);
  const imageLoadTimestamp = ref(0);
  const lastCorrectTimestamp = ref(0);
  const lastGuessTimestamp = ref(0);
  const readouts: Ref<Readout[]> = ref([initialReadout]);
  const realTimeDurationMs = ref(0);
  const realTimeStartTimestamp = ref(0);
  const runId = ref("");
  const runReadyState = ref(false);
  const showImageError = ref(false);
  const showMoreStats = ref(false);
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
    cleanedUpFrame.value = false;
    correctCounter.value = 0;
    currentGuessTimeDurationMs.value = 0;
    currentGuessTimeStartTimestamp.value = 0;
    lastCorrectTimestamp.value = 0;
    lastGuessTimestamp.value = 0;
    realTimeDurationMs.value = 0;
    realTimeStartTimestamp.value = 0;
    runId.value = "";
    showImageError.value = false;
    streakCounter.value = 0;
    totalCounter.value = 0;
    totalGuessTimeAccDurationMs.value = 0;
    waitingForGuess.value = false;
  }

  /**
   * Detects what browser is being used, if it hasn't already been detected.
   * @returns Browser detection result.
   */
  function detectBrowser() {
    if (!browser.value) {
      browser.value = detect();
    }
    return browser.value;
  }

  let priorUrl: { [k: string]: string } = {};

  /**
   * Returns the expected image path. This must be deterministic for the same
   * frame ID so that it matches exactly between the image and the save button
   * to ensure that caching works properly, if it's used.
   * @param config Runtime config.
   * @returns Image path.
   */
  function imageUrl(config: ReturnType<typeof useRuntimeConfig>) {
    if (priorUrl[frameId.value]) {
      // When clearing the run, the runId will be reset, but we don't want to
      // change the image URL, or this will result in an error in Firefox,
      // because the image will have been cleaned up and can't be reloaded from
      // a non-cached URL.
      return priorUrl[frameId.value];
    }

    const params = [runId.value ? `runId=${runId.value}` : ""]
      .filter((e) => e)
      .join("&");
    const url = `/api/resource/get/${frameId.value}.${
      config.public.imageOutputExtension
    }${params ? `?${params}` : ""}`;

    priorUrl = {};
    priorUrl[frameId.value] = url;

    return url;
  }

  let priorAudioUrl: { [k: string]: string } = {};

  /**
   * Returns the expected audio path.
   * @param config Runtime config.
   * @returns Audio path.
   */
  function audioUrl(config: ReturnType<typeof useRuntimeConfig>) {
    if (priorAudioUrl[audioId.value]) {
      return priorAudioUrl[audioId.value];
    }

    const params = [runId.value ? `runId=${runId.value}` : ""]
      .filter((e) => e)
      .join("&");
    const url = `/api/resource/getAudio/${audioId.value}.${
      config.public.audioOutputExtension
    }${params ? `?${params}` : ""}`;

    priorAudioUrl = {};
    priorAudioUrl[audioId.value] = url;

    return url;
  }

  /**
   * Set loading state to false on load.
   */
  function endLoading() {
    imageIsLoading.value = false; // Reactively notifies other components.
    cleanedUpFrame.value = false;
    imageLoadTimestamp.value = Date.now();
  }

  /**
   * Handle an error loading the image. Will be called if the image is a broken
   * link/404, which can happen if the server fails to generate an image but
   * doesn't realize.
   */
  function handleError() {
    readout(
      "Error loading image. The server may have failed when generating this frame. Try again?",
    );
    imageLoadError.value = true;
    imageIsLoading.value = false;
    showImageError.value = true;
  }

  return {
    endLoading,
    audioId,
    audioUrl,
    browser,
    cleanedUpFrame,
    correctCounter,
    currentGuessTimeDurationMs,
    currentGuessTimeStartTimestamp,
    detectBrowser,
    frameId,
    imageIsLoading,
    imageLoadError,
    imageLoadTimestamp,
    imageUrl,
    lastCorrectTimestamp,
    lastGuessTimestamp,
    handleError,
    readout,
    readouts,
    realTimeDurationMs,
    realTimeStartTimestamp,
    reset,
    runId,
    runReadyState,
    showImageError,
    showMoreStats,
    streakCounter,
    totalCounter,
    totalGuessTimeAccDurationMs,
    waitingForGuess,
  };
});
