<template>
  <img
    v-if="imageId"
    :src="`/api/frame/get/${imageId}.${extension}`"
    @load="endLoading"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFetch, useRuntimeConfig } from "nuxt/app";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";

const extension = useRuntimeConfig().public.imageOutputExtension;
const { imageId, imageIsLoading } = storeToRefs(useEpisodeDataStore());

/**
 * Set loading state to false on load.
 */
function endLoading() {
  imageIsLoading.value = false; // Reactively notifies other components.
  // Ping server to clean up the image. We don't care about the result. Set
  // keepalive to still clean up in case the user closes the tab.
  useFetch(`/api/frame/cleanup/${imageId.value}`, { keepalive: true });
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
