<template>
  <audio
    v-if="audioId"
    controls
    autoplay
    :src="audioUrl(config)"
    @canplay="endLoading"
    @error="handleError"
  ></audio>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";
const appStateStore = useAppStateStore();
const { audioUrl, endLoading, handleError } = appStateStore;
const { audioId, showImageError } = storeToRefs(appStateStore);
const config = useRuntimeConfig();

watch(audioId, (audioId) => {
  // Clear error state when getting a new frame.
  if (audioId) {
    showImageError.value = false;
  }
});
</script>

<style scoped>
audio {
  width: 100%;
}
</style>
