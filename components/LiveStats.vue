<template>
  <div class="liveStatsContainer">
    <div>
      <span class="correct">{{ correctCounter }}</span> /
      <span
        >{{ totalCounter }} ({{
          Math.round((correctCounter / totalCounter) * 100 * 100) / 100 || 0
        }}%)</span
      >
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">{{ $t("stats.streak") }}</span>
      {{ streakCounter }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">{{ $t("stats.real_time") }}</span>
      {{ realTimeText }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">{{ $t("stats.real_time_to_guess") }}</span>
      {{ realTimeToGuessText }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">{{ $t("stats.real_time_to_correct") }}</span>
      {{ realTimeToCorrectText }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">{{ $t("stats.total_guess_time") }}</span>
      {{ totalGuessTimeText }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">{{ $t("stats.current_guess_time") }}</span>
      {{ currentGuessTimeText }}
    </div>
    <button id="moreStatsButton" @click="showMoreStats = !showMoreStats">
      {{ showMoreStats ? `<< ${$t("stats.less")}` : `>> ${$t("stats.more")}` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import type { Ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";
import { timerText } from "~/utils/utils";

const appStateStore = useAppStateStore();
const {
  correctCounter,
  currentGuessTimeDurationMs,
  currentGuessTimeStartTimestamp,
  lastCorrectTimestamp,
  lastGuessTimestamp,
  realTimeDurationMs,
  realTimeStartTimestamp,
  showMoreStats,
  streakCounter,
  totalCounter,
  totalGuessTimeAccDurationMs,
  waitingForGuess,
} = storeToRefs(appStateStore);

const realTimeText = computed(() => timerText(realTimeDurationMs.value));
const realTimeToGuessText = computed(() =>
  waitingForGuess.value
    ? realTimeText.value
    : timerText(lastGuessTimestamp.value - realTimeStartTimestamp.value, 3),
);
const realTimeToCorrectText = computed(() =>
  waitingForGuess.value
    ? realTimeText.value
    : lastCorrectTimestamp.value
      ? timerText(lastCorrectTimestamp.value - realTimeStartTimestamp.value, 3)
      : // If the user hasn't gotten anything right yet.
        realTimeToGuessText.value,
);
const currentGuessTimeText = computed(() =>
  timerText(currentGuessTimeDurationMs.value, waitingForGuess.value ? 1 : 3),
);
const totalGuessTimeText = computed(() => {
  if (waitingForGuess.value) {
    return timerText(
      totalGuessTimeAccDurationMs.value + currentGuessTimeDurationMs.value,
    );
  }
  return timerText(totalGuessTimeAccDurationMs.value, 3);
});

/**
 * Updates the given duration ref to a current value, based on Date.now().
 * @param startRef Start timestamp.
 * @param durationRef Duration value to be updated.
 * @param now Current timestamp.
 */
function updateDuration(
  startRef: Ref<number>,
  durationRef: Ref<number>,
  now = 0,
) {
  durationRef.value =
    startRef.value === 0 ? 0 : (now || Date.now()) - startRef.value;
}

/**
 * Updates all the durations to be shown in the UI. It is important that these
 * all be on the same interval, so that there are no inconsistencies due to
 * running at different times due to Javascript async.
 */
function updateAllDurations(): void {
  const now = Date.now();
  updateDuration(realTimeStartTimestamp, realTimeDurationMs, now);
  if (waitingForGuess.value) {
    updateDuration(
      currentGuessTimeStartTimestamp,
      currentGuessTimeDurationMs,
      now,
    );
  }
}

let timerUpdateIntervalId: ReturnType<typeof setInterval>;

watch(showMoreStats, (showMoreStats) => {
  if (showMoreStats) {
    updateAllDurations();
    timerUpdateIntervalId = setInterval(() => {
      updateAllDurations();
    }, 10);
  } else {
    clearInterval(timerUpdateIntervalId);
  }
});

watch(waitingForGuess, (waitingForGuess) => {
  if (waitingForGuess) {
    const now = Date.now();
    if (realTimeStartTimestamp.value === 0) {
      realTimeStartTimestamp.value = now;
    }
    currentGuessTimeStartTimestamp.value = now;
  } else {
    updateDuration(
      currentGuessTimeStartTimestamp,
      currentGuessTimeDurationMs,
      lastGuessTimestamp.value,
    );
    totalGuessTimeAccDurationMs.value += currentGuessTimeDurationMs.value;
  }
});
</script>

<style scoped>
.liveStatsContainer {
  display: flex;
  flex-flow: row wrap;
  gap: 0.6em;
  row-gap: 0;
  margin: 1em 0;
  align-items: baseline;
}

.correct {
  color: green;
}

.statLabel {
  color: #555;
}

p {
  margin-bottom: 0px;
}
</style>
