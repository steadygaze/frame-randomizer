import { defineStore } from "pinia";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const upsizeToFit = ref(true);

    /**
     * Resets the settings.
     */
    function reset() {
      upsizeToFit.value = true;
    }

    return {
      upsizeToFit,
      reset,
    };
  },
  {
    persist: true,
  },
);
