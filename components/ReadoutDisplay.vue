<template>
  <div class="readoutContainer">
    <div v-for="readout in readouts" :key="readout.toString()">
      <p v-if="readout.type === 'correct'">
        <span class="correct">Correct.</span> {{ readout.answer }}
      </p>
      <p v-else-if="readout.type === 'incorrect'">
        {{ readout.guess }} is <span class="incorrect">incorrect</span>. Answer:
        {{ readout.answer }}.
      </p>
      <p v-else-if="readout.type === 'skipped'">
        <span class="skipped">Skipped</span>. Answer: {{ readout.answer }}.
      </p>
      <p v-else>{{ readout.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";

const appStateStore = useAppStateStore();
const { readouts } = storeToRefs(appStateStore);
</script>

<style>
.correct {
  color: green;
  font-weight: bold;
}

.incorrect {
  color: crimson;
  font-weight: bold;
}

.skipped {
  color: #555;
  font-weight: bold;
}
</style>
