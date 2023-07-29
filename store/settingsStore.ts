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
    }

    return {
      caseSensitive,
      fuzziness,
      minMatchLength,
      nameWeight,
      originalNameWeight,
      synopsisWeight,
      upsizeToFit,
      reset,
    };
  },
  {
    persist: true,
  },
);
