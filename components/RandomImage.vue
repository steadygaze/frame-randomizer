<template>
  <img
    v-if="imageId"
    :src="`/api/getimg/${imageId}.${config.imageOutputExtension}`"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "nuxt/app";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";

const config = useRuntimeConfig();
const store = useEpisodeDataStore();
const { imageId } = storeToRefs(store);
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
