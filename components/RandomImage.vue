<template>
  <img v-if="runReadyState" :src="`data:image/svg+xml,${readySvg}`" />
  <img
    v-else-if="frameId"
    :src="
      showImageError
        ? `data:image/svg+xml,${errorLoadingImageSvg}`
        : `/api/frame/get/${frameId}.${extension}?cleanuponload=${
            browser?.name === 'firefox' || false
          }`
    "
    @load="endLoading"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "nuxt/app";
import { useAppStateStore } from "~~/store/appStateStore";

const errorLoadingImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><text x="50" y="205.3" font-size="120" fill="white" style="font-family: sans-serif">ERROR ❌</text></svg>`;
const readySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><text x="50" y="205.3" font-size="120" fill="white" style="font-family: sans-serif">READY 🏁</text></svg>`;

const extension = useRuntimeConfig().public.imageOutputExtension;
const appStateStore = useAppStateStore();
const { detectBrowser, readout } = appStateStore;
const {
  browser,
  cleanedUpFrame,
  frameId,
  imageIsLoading,
  imageLoadError,
  imageLoadTimestamp,
  runReadyState,
  waitingForGuess,
} = storeToRefs(appStateStore);

const showImageError = ref(false);

watch(frameId, (frameId) => {
  // Clear error state when getting a new frame.
  if (frameId) {
    showImageError.value = false;
  }
});

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

onMounted(() => {
  if (!document) return;
  document.addEventListener("visibilitychange", function () {
    if (
      document.visibilityState === "hidden" &&
      (detectBrowser()?.name !== "firefox" || waitingForGuess.value) &&
      !cleanedUpFrame.value
    ) {
      navigator.sendBeacon(`/api/frame/cleanup/${frameId.value}`);
      cleanedUpFrame.value = true;
    }
  });
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

pre {
  white-space: pre-wrap;
}
</style>
