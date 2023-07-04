<template>
  <img
    v-if="imageId"
    :src="
      showImageError
        ? `data:image/svg+xml,${errorLoadingImageSvg}`
        : `/api/frame/get/${imageId}.${extension}?cleanuponload=${
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

const extension = useRuntimeConfig().public.imageOutputExtension;
const appStateStore = useAppStateStore();
const { detectBrowser, readout } = appStateStore;
const {
  browser,
  cleanedUpFrame,
  imageId,
  imageIsLoading,
  imageLoadError,
  imageLoadTimestamp,
} = storeToRefs(appStateStore);

const showImageError = ref(false);

watch(imageId, (imageId) => {
  // Clear error state when getting a new frame.
  if (imageId) {
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
  if (detectBrowser()?.name !== "firefox") {
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden" && !cleanedUpFrame.value) {
        navigator.sendBeacon(`/api/frame/cleanup/${imageId.value}`);
        cleanedUpFrame.value = true;
      }
    });
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

pre {
  white-space: pre-wrap;
}
</style>
