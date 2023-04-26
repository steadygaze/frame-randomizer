<template>
  <img
    v-if="imageId"
    :src="`/api/getimg/${imageId}.${extension}`"
    @load="handleLoad"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "nuxt/app";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";

const extension = useRuntimeConfig().public.imageOutputExtension;
const { imageId, imageIsLoading } = storeToRefs(useEpisodeDataStore());

function handleLoad() {
  imageIsLoading.value = false; // Reactively notifies other components.
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
