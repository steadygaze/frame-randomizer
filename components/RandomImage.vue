<template>
  <p
    :class="{ invisible: !showEpilepsyWarning || !isAprilFoolsDay }"
    @click="acknowledgeEpilepsyWarning"
  >
    {{ $t("miscellaneous.epilepsy_warning") }}
  </p>
  <img v-if="runReadyState" :src="`data:image/svg+xml,${readySvg}`" />
  <img
    v-else-if="frameId"
    :src="
      showImageError
        ? `data:image/svg+xml,${errorLoadingImageSvg}`
        : imageUrl(config)
    "
    :class="{
      colorChanging: config.public.aprilFoolsColorChanging && isAprilFoolsDay,
      noResize: !upsizeToFit,
      invisible: showEpilepsyWarning && isAprilFoolsDay,
    }"
    @load="endLoading"
    @error="handleError"
    @click="acknowledgeEpilepsyWarning"
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

const showEpilepsyWarning = ref(false);
const isAprilFoolsDay = ref(false);
onMounted(() => {
  showEpilepsyWarning.value = true;

  const today = new Date();
  // Month (but not day) starts from zero.
  isAprilFoolsDay.value = today.getMonth() === 3 && today.getDate() === 1;
});

/**
 * Handler for when the epilepsy warning is acknowledged.
 */
function acknowledgeEpilepsyWarning() {
  showEpilepsyWarning.value = false;
}

watch(frameId, (frameId) => {
  // Clear error state when getting a new frame.
  if (frameId) {
    showImageError.value = false;
  }
});
</script>

<style scoped>
.command {
  color: white;
}

p {
  font-size: 200%;
  padding: 1em;
  background-color: black;
  color: white;
}

.invisible {
  display: none;
}

img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.colorChanging {
  animation-direction: alternate;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: colorChanging;
  animation-timing-function: linear;
}

@keyframes colorChanging {
  0% {
    filter: hue-rotate(70deg) saturate(1.5);
  }
  100% {
    filter: hue-rotate(290deg) saturate(2);
  }
}

img.noResize {
  object-fit: scale-down;
}

pre {
  white-space: pre-wrap;
}
</style>
