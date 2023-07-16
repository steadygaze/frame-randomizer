<template>
  <GenericModal
    :show="show"
    :header="$t('settings.header')"
    @close="$emit('close')"
  >
    <p>
      <label for="upsizeToFit">{{ $t("settings.upsize_label") }}</label>
      <input id="upsizeToFit" v-model="upsizeToFit" type="checkbox" />
      <br />{{ $t("settings.upsize_description") }}
    </p>
    <template #footer-buttons>
      <button @click="reset">{{ $t("settings.reset") }}</button>
    </template>
  </GenericModal>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSettingsStore } from "~/store/settingsStore";

defineProps<{
  show: boolean;
}>();
defineEmits<{ (e: "close"): void }>();

const settingsStore = useSettingsStore();
const { reset } = settingsStore;
const { upsizeToFit } = storeToRefs(settingsStore);
</script>

<style scoped>
label {
  font-style: italic;
}
</style>
