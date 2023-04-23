<template>
  <div class="wrapper">
    <img v-if="imageId" :src="`/api/genimg/${imageId}`" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";

const store = useEpisodeDataStore();
const { imageId } = storeToRefs(store);
</script>

<style scoped>
.command {
  color: white;
}

.wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
}

pre {
  white-space: pre-wrap;
}
</style>
