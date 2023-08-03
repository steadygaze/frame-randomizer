<template>
  <GenericModal
    :show="show"
    :header="$t('game_mode.header')"
    @close="$emit('close')"
  >
    <p>
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
  </GenericModal>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGameModeStore } from "~~/store/gameModeStore";

const gameModeStore = useGameModeStore();
const { subtitlesOn } = storeToRefs(gameModeStore);

defineProps<{
  show: boolean;
  subtitlesAvailable: boolean;
}>();
defineEmits<{
  (e: "close"): { subtitlesOn: boolean };
}>();
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
