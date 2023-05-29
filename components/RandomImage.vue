<template>
  <img
    v-if="imageId"
    :src="
      showImageError
        ? `data:image/svg+xml,${errorLoadingImageSvg}`
        : `/api/frame/get/${imageId}.${extension}`
    "
    @load="endLoading"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useFetch, useRuntimeConfig } from "nuxt/app";
import { useAppStateStore } from "~~/store/appStateStore";

const errorLoadingImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><text x="50" y="205.3" font-size="120" fill="white" style="font-family: sans-serif">ERROR ❌</text></svg>`;

const extension = useRuntimeConfig().public.imageOutputExtension;
const { imageId, imageIsLoading, imageLoadError, readout } = storeToRefs(
  useAppStateStore(),
);

const showImageError = ref(false);

watch(imageId, () => {
  // Clear error state when getting a new frame.
  showImageError.value = false;
});

/**
 * Set loading state to false on load.
 */
function endLoading() {
  imageIsLoading.value = false; // Reactively notifies other components.
  // Ping server to clean up the image. We don't care about the result. Set
  // keepalive to still clean up in case the user closes the tab.
  useFetch(`/api/frame/cleanup/${imageId.value}`, { keepalive: true });
}

/**
 * Handle an error loading the image. Will be called if the image is a broken
 * link/404, which can happen if the server fails to generate an image but
 * doesn't realize.
 */
function handleError() {
  readout.value =
    "Error loading image. The server may have failed when generating this frame. Try again?";
  imageLoadError.value = true;
  imageIsLoading.value = false;
  showImageError.value = true;
}
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
