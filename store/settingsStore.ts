import { defineStore } from "pinia";

// Values are CSS class names and must match CSS.
export enum Theme {
  DefaultAuto = "theme-default-auto",
  DefaultLight = "theme-default-light",
  DefaultDark = "theme-default-dark",
}

export enum DownloadFilename {
  Random = "random",
  EpisodeAndTimestamp = "episode-and-timestamp",
}

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const config = useRuntimeConfig();

    const caseSensitive = ref(false);
    const downloadFilename = ref(DownloadFilename.Random);
    const fuzziness = ref(config.public.fuzzySearchThreshold);
    const minMatchLength = ref(config.public.fuzzySearchMinMatchLength);
    const nameWeight = ref(config.public.fuzzySearchWeightName);
    const originalNameWeight = ref(
      config.public.fuzzySearchWeightOriginalLanguage,
    );
    const synopsisWeight = ref(config.public.fuzzySearchWeightSynopsis);
    const upsizeToFit = ref(true);
    const audioVolume = ref(0.8);
    const loopAudio = ref(false);
    const playbackRate = ref(1.0);
    const theme = ref(Theme.DefaultAuto);

    /**
     * Resets the settings.
     */
    function reset() {
      caseSensitive.value = false;
      downloadFilename.value = DownloadFilename.Random;
      minMatchLength.value = config.public.fuzzySearchMinMatchLength;
      nameWeight.value = config.public.fuzzySearchWeightName;
      fuzziness.value = config.public.fuzzySearchThreshold;
      synopsisWeight.value = config.public.fuzzySearchWeightSynopsis;
      upsizeToFit.value = true;
      loopAudio.value = false;
      audioVolume.value = 0.8;
      playbackRate.value = 1.0;
      theme.value = Theme.DefaultAuto;
    }

    return {
      caseSensitive,
      downloadFilename,
      fuzziness,
      minMatchLength,
      nameWeight,
      originalNameWeight,
      synopsisWeight,
      upsizeToFit,
      audioVolume,
      loopAudio,
      playbackRate,
      theme,
      reset,
    };
  },
  {
    persist: true,
  },
);
