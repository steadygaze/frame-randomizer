<template>
  <audio
    v-if="audioId"
    id="mainAudioPlayer"
    controls
    autoplay
    :src="audioUrl(config)"
    :loop="loopAudio"
    @canplay="endLoading"
    @error="handleError"
  ></audio>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";
import { useSettingsStore } from "~~/store/settingsStore";
const appStateStore = useAppStateStore();
const { audioUrl, endLoading, handleError } = appStateStore;
const { audioId, showImageError } = storeToRefs(appStateStore);
const settingsStore = useSettingsStore();
const { audioVolume, loopAudio, playbackRate } = storeToRefs(settingsStore);
const config = useRuntimeConfig();

watch(audioId, async (audioId) => {
  // Clear error state when getting a new frame.
  if (audioId) {
    showImageError.value = false;
  }
  await nextTick();
  setAudioVolume();
  setPlaybackRate();
});

/**
 * Sets the audio volume to the given value.
 * @param vol Volume to set.
 */
function setAudioVolume(vol?: number) {
  const audio = document.getElementById("mainAudioPlayer") as HTMLAudioElement;
  if (audio) {
    audio.volume = vol || audioVolume.value;
  }
}

/**
 * Sets the playback rate to the given value.
 * @param rate Rate to set.
 */
function setPlaybackRate(rate?: number) {
  const audio = document.getElementById("mainAudioPlayer") as HTMLAudioElement;
  if (audio) {
    audio.playbackRate = rate || playbackRate.value;
  }
}

watch(audioVolume, setAudioVolume);
watch(playbackRate, setPlaybackRate);
</script>

<style scoped>
audio {
  width: 100%;
}
</style>
