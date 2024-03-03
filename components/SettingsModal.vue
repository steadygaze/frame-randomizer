<template>
  <GenericModal
    :show="show"
    :header="$t('settings.header')"
    @close="$emit('close')"
  >
    <h3>{{ $t("settings.display_header") }}</h3>
    <p>
      <label>Theme</label>
      <input
        id="auto"
        v-model="theme"
        type="radio"
        name="auto"
        :value="Theme.DefaultAuto"
      />
      <label for="auto">auto</label>

      <input
        id="light"
        v-model="theme"
        type="radio"
        name="light"
        :value="Theme.DefaultLight"
      />
      <label for="light">light</label>

      <input
        id="dark"
        v-model="theme"
        type="radio"
        name="dark"
        :value="Theme.DefaultDark"
      />
      <label for="dark">dark</label>
      <br />
      {{ $t("game_mode.resource_type_description") }}
    </p>
    <p>
      <label for="upsizeToFit">{{ $t("settings.upsize_label") }}</label>
      <input id="upsizeToFit" v-model="upsizeToFit" type="checkbox" />
      <br />{{ $t("settings.upsize_description") }}
    </p>
    <p>
      <span class="flexOptions">
        <label for="minMatchLength">{{
          $t("settings.min_match_length_label")
        }}</label>
        <input
          id="minMatchLength"
          v-model="minMatchLength"
          type="range"
          min="1"
          max="10"
        />
        {{ minMatchLength }}
      </span>
      {{ $t("settings.min_match_length_description") }}
    </p>
    <h3>{{ $t("settings.search_header") }}</h3>
    <p>
      <span class="flexOptions">
        <label for="fuzziness">{{ $t("settings.fuzziness_label") }}</label>
        <input
          id="fuzziness"
          v-model="fuzziness"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
        {{ floatIntPartPad(fuzziness, 1, 2) }}
      </span>
      {{ $t("settings.fuzziness_description") }}
    </p>
    <p>
      <span class="flexOptions">
        <label for="nameWeight">{{ $t("settings.name_weight_label") }}</label>
        <input
          id="nameWeight"
          v-model="nameWeight"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
        {{ floatIntPartPad(nameWeight, 1, 2) }}
      </span>
      {{ $t("settings.name_weight_description") }}
    </p>
    <p v-if="locale !== originalLanguage">
      <span class="flexOptions">
        <label for="originalNameWeight">{{
          $t("settings.original_language_weight_label")
        }}</label>
        <input
          id="originalNameWeight"
          v-model="originalNameWeight"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
        {{ floatIntPartPad(originalNameWeight, 1, 2) }}
      </span>
      {{ $t("settings.original_language_weight_description") }}
    </p>
    <p>
      <span class="flexOptions">
        <label for="synopsisWeight">{{
          $t("settings.synopsis_weight_label")
        }}</label>
        <input
          id="synopsisWeight"
          v-model="synopsisWeight"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
        {{ floatIntPartPad(synopsisWeight, 1, 2) }}
      </span>
      {{ $t("settings.synopsis_weight_description") }}
    </p>
    <p>
      <label for="caseSensitive">{{
        $t("settings.case_sensitive_label")
      }}</label>
      <input id="caseSensitive" v-model="caseSensitive" type="checkbox" />
      <br />
      {{ $t("settings.case_sensitive_description") }}
    </p>
    <h3>{{ $t("settings.audio_header") }}</h3>
    <p>
      <span class="flexOptions">
        <label for="audioVolume">{{ $t("settings.audio_volume_label") }}</label>
        <input
          id="audioVolume"
          v-model="audioVolume"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
        {{ Math.round(audioVolume * 100) }}
      </span>
      {{ $t("settings.audio_volume_description") }}
    </p>
    <p>
      <span class="flexOptions">
        <label for="playbackRate">{{
          $t("settings.playback_rate_label")
        }}</label>
        <input
          id="playbackRate"
          v-model="playbackRate"
          type="range"
          min="0.25"
          max="2"
          step="0.25"
        />
        {{ playbackRate }}x
      </span>
      {{ $t("settings.playback_rate_description") }}
    </p>
    <p>
      <label for="loopAudio">{{ $t("settings.loop_audio_label") }}</label>
      <input id="loopAudio" v-model="loopAudio" type="checkbox" />
      <br />
      {{ $t("settings.loop_audio_description") }}
    </p>
    <template #footer-buttons>
      <button @click="reset">{{ $t("settings.reset") }}</button>
    </template>
  </GenericModal>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "#imports";
import { floatIntPartPad } from "~~/utils/utils";
import { useShowDataStore } from "~~/store/showDataStore";
import { Theme, useSettingsStore } from "~/store/settingsStore";

defineProps<{
  show: boolean;
}>();
defineEmits<{ (e: "close"): void }>();

const { locale } = useI18n();
const showDataStore = useShowDataStore();
const { originalLanguage } = storeToRefs(showDataStore);

const settingsStore = useSettingsStore();
const { reset } = settingsStore;
const {
  caseSensitive,
  fuzziness,
  minMatchLength,
  nameWeight,
  originalNameWeight,
  synopsisWeight,
  upsizeToFit,
  audioVolume,
  loopAudio,
  playbackRate,
  theme,
} = storeToRefs(settingsStore);

/**
 * Sets a theme on the body tag.
 * @param theme Theme enum value (secretly a string).
 */
function setBodyThemeClass(theme: Theme) {
  for (const className of Object.values(Theme)) {
    document.body.classList.remove(className);
  }
  document.body.classList.add(theme);
}

watch(theme, setBodyThemeClass);
onMounted(() => setBodyThemeClass(theme.value));
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
