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
      <span class="statLabel">streak:</span>
      {{ streakCounter }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">real time:</span>
      {{ realTimeText }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">total guess time:</span>
      {{ totalGuessTimeText }}
    </div>
    <div v-if="showMoreStats">
      <span class="statLabel">current guess time:</span>
      {{ currentGuessTimeText }}
    </div>
    <button id="moreStatsButton" @click="showMoreStats = !showMoreStats">
      {{ showMoreStats ? "<< Less" : ">> More" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";
import { floatIntPartPad } from "~/utils/utils";

const appStateStore = useAppStateStore();
const {
  correctCounter,
  currentGuessTimeDurationMs,
  currentGuessTimeStartTimestamp,
  realTimeDurationMs,
  realTimeStartTimestamp,
  streakCounter,
  totalCounter,
  totalGuessTimeAccDurationMs,
  waitingForGuess,
} = storeToRefs(appStateStore);

const showMoreStats = ref(false);

/**
 * Make a "hh:mm:ss"-style timer string.
 * @param durationMs Duration in milliseconds.
 * @returns String representation of the timer.
 */
function makeTimerText(durationMs: number): string {
  const sec = floatIntPartPad((durationMs / 1000) % 60, 2, 1);
  const min = Math.trunc(durationMs / 1000 / 60) % 60;
  const hour = Math.trunc(durationMs / 1000 / 60 / 60) % 60;
  return hour > 0
    ? `${hour}:${("" + min).padStart(2, "0")}:${sec}`
    : `${("" + min).padStart(2, "0")}:${sec}`;
}

const realTimeText = computed(() => makeTimerText(realTimeDurationMs.value));
const currentGuessTimeText = computed(() =>
  makeTimerText(currentGuessTimeDurationMs.value),
);
const totalGuessTimeText = computed(() =>
  makeTimerText(
    waitingForGuess.value
      ? totalGuessTimeAccDurationMs.value + currentGuessTimeDurationMs.value
      : totalGuessTimeAccDurationMs.value,
  ),
);

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
  const updateFn = () => {
    durationRef.value = startRef.value === 0 ? 0 : Date.now() - startRef.value;
  };
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
  console.log("waitingforguess ", waitingForGuess);
  if (waitingForGuess && realTimeStartTimestamp.value === 0) {
    realTimeStartTimestamp.value = Date.now();
  }
  if (showMoreStats.value) {
    if (waitingForGuess) {
      currentGuessTimeIntervalId = setupTimerUpdateInterval(
        currentGuessTimeStartTimestamp,
        currentGuessTimeDurationMs,
      );
    } else {
      totalGuessTimeAccDurationMs.value += currentGuessTimeDurationMs.value;
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

#moreStatsButton {
  padding: 0 0.6em;
}
</style>
