<template>
  <div class="readoutContainer">
    <div v-for="readout in readouts" :key="readout.toString()">
      <i18n-t
        v-if="readout.type === 'correct'"
        keypath="readout.correct_message"
        tag="p"
        scope="global"
      >
        <template #correct>
          <span class="correct">
            {{ $t("readout.correct") }}
          </span>
        </template>
        <template #answer>
          <EpisodeRef
            :season="readout.answer.season"
            :episode="readout.answer.episode"
            :name="readout.answer.fullName"
            more-buttons
          ></EpisodeRef>
        </template>
      </i18n-t>
      <i18n-t
        v-else-if="readout.type === 'incorrect'"
        keypath="readout.incorrect_message"
        tag="p"
        scope="global"
      >
        <template #guess>
          <EpisodeRef
            :season="readout.guess.season"
            :episode="readout.guess.episode"
            :name="readout.guess.fullName"
          ></EpisodeRef>
        </template>
        <template #incorrect>
          <span class="incorrect">
            {{ $t("readout.incorrect") }}
          </span>
        </template>
        <template #answer>
          <EpisodeRef
            :season="readout.answer.season"
            :episode="readout.answer.episode"
            :name="readout.answer.fullName"
            more-buttons
          ></EpisodeRef>
        </template>
      </i18n-t>
      <i18n-t
        v-else-if="readout.type === 'skipped'"
        keypath="readout.skipped_message"
        tag="p"
        scope="global"
      >
        <template #skipped>
          <span class="skipped">
            {{ $t("readout.skipped") }}
          </span>
        </template>
        <template #answer>
          <EpisodeRef
            :season="readout.answer.season"
            :episode="readout.answer.episode"
            :name="readout.answer.fullName"
            more-buttons
          ></EpisodeRef>
        </template>
      </i18n-t>
      <p v-else>{{ $t(readout.i18nKey, readout.props as NamedValue) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NamedValue } from "#i18n";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";

const appStateStore = useAppStateStore();
const { readouts } = storeToRefs(appStateStore);
</script>

<style scoped>
.correct {
  color: green;
  font-weight: bold;
}

.incorrect {
  color: crimson;
  font-weight: bold;
}

.skipped {
  font-weight: bold;
}
</style>
