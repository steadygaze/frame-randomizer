<template>
  <img v-if="runReadyState" :src="`data:image/svg+xml,${readySvg}`" />
  <img
    v-else-if="frameId"
    :src="
      showImageError
        ? `data:image/svg+xml,${errorLoadingImageSvg}`
        : imageUrl(config)
    "
    :class="{ noResize: !upsizeToFit }"
    @load="endLoading"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "nuxt/app";
import { useAppStateStore } from "~~/store/appStateStore";
import { useSettingsStore } from "~/store/settingsStore";

const errorLoadingImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><text x="50" y="205.3" font-size="120" fill="white" style="font-family: sans-serif">ERROR ❌</text></svg>`;
const readySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><text x="50" y="205.3" font-size="120" fill="white" style="font-family: sans-serif">READY 🏁</text></svg>`;

const appStateStore = useAppStateStore();
const { endLoading, imageUrl, handleError } = appStateStore;
const { frameId, runReadyState, showImageError } = storeToRefs(appStateStore);

const settingsStore = useSettingsStore();
const { upsizeToFit } = storeToRefs(settingsStore);

const config = useRuntimeConfig();

watch(frameId, (frameId) => {
  // Clear error state when getting a new frame.
  if (frameId) {
    showImageError.value = false;
    console.log(frameId);
  }
});
</script>

<style scoped>
.command {
  color: white;
}

img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

img.noResize {
  object-fit: scale-down;
}

pre {
  white-space: pre-wrap;
}
</style>
