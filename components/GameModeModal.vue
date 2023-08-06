<template>
  <GenericModal
    :show="show"
    :header="$t('game_mode.header')"
    @close="$emit('close')"
  >
    <form>
      <p>
        <label>{{ $t("game_mode.resource_type_label") }}</label>

        <input
          id="frame"
          v-model="resourceType"
          type="radio"
          name="resourceType"
          value="frame"
        />
        <label for="frame">{{ $t("game_mode.frame") }}</label>

        <input
          id="audio"
          v-model="resourceType"
          type="radio"
          name="resourceType"
          value="audio"
        />
        <label for="audio">{{ $t("game_mode.audio") }}</label>
        <br />
        {{ $t("game_mode.resource_type_description") }}
      </p>

      <p v-if="resourceType === 'frame'">
        <label for="subtitlesOn">{{ $t("game_mode.subtitles_label") }}</label>
        <input
          id="subtitlesOn"
          v-model="subtitlesOn"
          type="checkbox"
          :disabled="!$props.subtitlesAvailable"
        />
        <br />
        {{ $t("game_mode.subtitles_description") }}
      </p>

      <p v-else>
        <label>{{ $t("game_mode.audio_length_label") }}</label>

        <input
          id="5"
          v-model="audioLength"
          type="radio"
          name="audioLength"
          value="5"
        />
        <label for="5">{{ $t("game_mode.five_seconds") }}</label>

        <input
          id="10"
          v-model="audioLength"
          type="radio"
          name="audioLength"
          value="10"
        />
        <label for="10">{{ $t("game_mode.ten_seconds") }}</label>

        <input
          id="15"
          v-model="audioLength"
          type="radio"
          name="audioLength"
          value="15"
        />
        <label for="15">{{ $t("game_mode.fifteen_seconds") }}</label>
        <br />
        {{ $t("game_mode.audio_length_description") }}
      </p>
    </form>
  </GenericModal>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";
import { useGameModeStore } from "~~/store/gameModeStore";

const gameModeStore = useGameModeStore();
const { audioLength, resourceType, subtitlesOn } = storeToRefs(gameModeStore);

const appStateStore = useAppStateStore();
const { reset } = appStateStore;
const { audioId, frameId } = storeToRefs(appStateStore);

defineProps<{
  show: boolean;
  subtitlesAvailable: boolean;
}>();
defineEmits<{
  (e: "close"): { subtitlesOn: boolean };
}>();

watch(resourceType, (resourceType) => {
  if (resourceType === "frame") {
    if (audioId.value) {
      navigator.sendBeacon(`/api/frame/cleanup/${audioId.value}`);
    }
    audioId.value = "";
    reset();
  } else {
    if (frameId.value) {
      navigator.sendBeacon(`/api/frame/cleanup/${audioId.value}`);
    }
    frameId.value = "";
    reset();
  }
});
</script>

<style scoped>
label {
  font-style: italic;
}

.flexOptions {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
