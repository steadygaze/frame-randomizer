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
import { computed, Ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";
import { floatIntPartPad } from "~/utils/utils";

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

/**
 * Make a "hh:mm:ss"-style timer string.
 * @param durationMs Duration in milliseconds.
 * @param secPlaces Precision to show seconds.
 * @returns String representation of the timer.
 */
function makeTimerText(durationMs: number, secPlaces = 1): string {
  const sec = floatIntPartPad((durationMs % 60000) / 1000, 2, secPlaces);
  const min = Math.trunc(durationMs / 1000 / 60) % 60;
  const hour = Math.trunc(durationMs / 1000 / 60 / 60) % 60;
  return hour > 0
    ? `${hour}:${("" + min).padStart(2, "0")}:${sec}`
    : `${("" + min).padStart(2, "0")}:${sec}`;
}

const realTimeText = computed(() => makeTimerText(realTimeDurationMs.value));
const realTimeToGuessText = computed(() =>
  waitingForGuess.value
    ? realTimeText.value
    : makeTimerText(lastGuessTimestamp.value - realTimeStartTimestamp.value, 3),
);
const realTimeToCorrectText = computed(() =>
  waitingForGuess.value
    ? realTimeText.value
    : lastCorrectTimestamp.value
    ? makeTimerText(
        lastCorrectTimestamp.value - realTimeStartTimestamp.value,
        3,
      )
    : // If the user hasn't gotten anything right yet.
      realTimeToGuessText.value,
);
const currentGuessTimeText = computed(() =>
  makeTimerText(
    currentGuessTimeDurationMs.value,
    waitingForGuess.value ? 1 : 3,
  ),
);
const totalGuessTimeText = computed(() => {
  if (waitingForGuess.value) {
    return makeTimerText(
      totalGuessTimeAccDurationMs.value + currentGuessTimeDurationMs.value,
    );
  }
  return makeTimerText(totalGuessTimeAccDurationMs.value, 3);
});

/**
 * Updates the given duration ref to a current value, based on Date.now().
 * @param startRef Start timestamp.
 * @param durationRef Duration value to be updated.
 */
function updateDuration(startRef: Ref<number>, durationRef: Ref<number>) {
  durationRef.value = startRef.value === 0 ? 0 : Date.now() - startRef.value;
}

/**
 * Updates the duration to be shown in a timer. Triggers a reactive update.
 * @param startRef Ref for the start timestamp.
 * @param durationRef Ref for the duration, in milliseconds.
 * @returns Interval ID, to pass to clearInterval later.
 */
function setupTimerUpdateInterval(
  startRef: Ref<number>,
  durationRef: Ref<number>,
): ReturnType<typeof setInterval> {
  const updateFn = () => updateDuration(startRef, durationRef);
  updateFn();
  return setInterval(updateFn, 10);
}

let realTimeIntervalId: ReturnType<typeof setInterval>;
let currentGuessTimeIntervalId: ReturnType<typeof setInterval>;

watch(showMoreStats, (showMoreStats) => {
  if (showMoreStats) {
    realTimeIntervalId = setupTimerUpdateInterval(
      realTimeStartTimestamp,
      realTimeDurationMs,
    );
    if (waitingForGuess.value) {
      currentGuessTimeIntervalId = setupTimerUpdateInterval(
        currentGuessTimeStartTimestamp,
        currentGuessTimeDurationMs,
      );
    }
  } else {
    clearInterval(realTimeIntervalId);
    // clearInterval on null or an already cleared interval does nothing, so
    // this is safe.
    clearInterval(currentGuessTimeIntervalId);
  }
});

watch(waitingForGuess, (waitingForGuess) => {
  if (waitingForGuess) {
    if (realTimeStartTimestamp.value === 0) {
      realTimeStartTimestamp.value = Date.now();
    }
    if (currentGuessTimeStartTimestamp.value === 0) {
      currentGuessTimeStartTimestamp.value = Date.now();
    }
    if (showMoreStats.value) {
      currentGuessTimeIntervalId = setupTimerUpdateInterval(
        currentGuessTimeStartTimestamp,
        currentGuessTimeDurationMs,
      );
    }
  } else {
    updateDuration(currentGuessTimeStartTimestamp, currentGuessTimeDurationMs);
    totalGuessTimeAccDurationMs.value += currentGuessTimeDurationMs.value;
    if (showMoreStats.value) {
      clearInterval(currentGuessTimeIntervalId);
    }
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
