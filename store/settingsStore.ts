import { defineStore } from "pinia";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const config = useRuntimeConfig();

    const caseSensitive = ref(false);
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

    /**
     * Resets the settings.
     */
    function reset() {
      caseSensitive.value = false;
      minMatchLength.value = config.public.fuzzySearchMinMatchLength;
      nameWeight.value = config.public.fuzzySearchWeightName;
      fuzziness.value = config.public.fuzzySearchThreshold;
      synopsisWeight.value = config.public.fuzzySearchWeightSynopsis;
      upsizeToFit.value = true;
      loopAudio.value = false;
      audioVolume.value = 0.8;
      playbackRate.value = 1.0;
    }

    return {
      caseSensitive,
      fuzziness,
      minMatchLength,
      nameWeight,
      originalNameWeight,
      synopsisWeight,
      upsizeToFit,
      audioVolume,
      loopAudio,
      playbackRate,
      reset,
    };
  },
  {
    persist: true,
  },
);
