<template>
  <div class="liveStatsContainer">
    <p>
      <span class="correct">{{ correctCounter }}</span> /
      <span class="total"
        >{{ totalCounter }} ({{
          Math.round((correctCounter / totalCounter) * 100 * 100) / 100 || 0
        }}%)</span
      ><span v-if="showMoreStats"
        >, streak {{ streakCounter }},
        <span class="timer">{{ timerText }}</span></span
      >
      <button id="moreStatsButton" @click="showMoreStats = !showMoreStats">
        {{ showMoreStats ? "<< Less" : ">> More" }}
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";

const appStateStore = useAppStateStore();
const {
  correctCounter,
  durationMs,
  startTimestamp,
  streakCounter,
  totalCounter,
} = storeToRefs(appStateStore);

const showMoreStats = ref(false);

const timerText = computed(() => {
  const sec = Math.round(durationMs.value / 1000) % 60;
  const min = Math.round(durationMs.value / 1000 / 60) % 60;
  const hour = Math.round(durationMs.value / 1000 / 60 / 60) % 60;
  return hour > 0
    ? `${hour}:${("" + min).padStart(2, "0")}:${("" + sec).padStart(2, "0")}`
    : `${("" + min).padStart(2, "0")}:${("" + sec).padStart(2, "0")}`;
});

/**
 * Updates the duration to be shown in the timer. Triggers a reactive update.
 */
function updateDuration() {
  durationMs.value = Date.now() - startTimestamp.value;
}

let intervalId: ReturnType<typeof setInterval>;

watch(showMoreStats, (showMoreStats) => {
  if (showMoreStats) {
    updateDuration();
    intervalId = setInterval(updateDuration, 100);
  } else {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.liveStatsContainer {
  display: flex;
  flex-direction: row;
}

.correct {
  color: green;
}

p {
  margin-bottom: 0px;
}

#moreStatsButton {
  margin-left: 0.5em;
}
</style>
