<template>
  <div>
    <hr />
    <div class="verifyBar">
      <em>v{{ config.public.softwareVersion }}</em>
      <div>
        <button v-if="!runId" @click="startRun">
          🏁 {{ $t("verify.start") }}
        </button>
        <button v-else @click="runId = ''">❌ {{ $t("verify.clear") }}</button>
        <button v-if="runId" @click="saveRun">
          💾 {{ $t("verify.save") }}
        </button>
      </div>

      <div v-if="runId">
        {{ $t("verify.run_in_progress", { id: runId.slice(0, 8) }) }}
      </div>
      <div v-else class="grayed">{{ $t("verify.practice_mode") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";

const config = useRuntimeConfig();
const appStateStore = useAppStateStore();
const { readout, reset } = appStateStore;
const {
  audioId,
  frameId,
  runReadyState,
  runId,
  imageIsLoading,
  waitingForGuess,
  showMoreStats,
  totalGuessTimeAccDurationMs,
  realTimeStartTimestamp,
  lastCorrectTimestamp,
  lastGuessTimestamp,
} = storeToRefs(appStateStore);

const emit = defineEmits<{ (e: "start"): void }>();

/**
 * Save a run using the API.
 */
async function saveRun() {
  if (!runId.value) {
    return;
  }
  const now = Date.now();
  const { data, error } = await useFetch(`/api/run/${runId.value}/verify`);

  if (error && error.value) {
    if (error.value.statusCode === 429) {
      readout("readout.rate_limit");
    } else if (error.value.message.startsWith("NetworkError")) {
      readout("readout.network_error");
    } else {
      readout("readout.unknown_error", { error: error.value.message });
    }
  } else if (data && data.value) {
    const realTimeMs = now - realTimeStartTimestamp.value;
    const realTimeGuessMs = waitingForGuess
      ? realTimeMs
      : lastGuessTimestamp.value - realTimeStartTimestamp.value;
    const realTimeCorrectMs = waitingForGuess
      ? realTimeMs
      : lastCorrectTimestamp
      ? lastCorrectTimestamp.value - realTimeStartTimestamp.value
      : realTimeGuessMs;

    const combinedData = {
      runId: runId.value,
      server: data.value,
      client: {
        realTimeMs,
        realTimeGuessMs,
        realTimeCorrectMs,
        guessTimeMs: totalGuessTimeAccDurationMs.value,
        version: config.public.softwareVersion,
      },
      publicKey: config.public.publicKey,
    };
    // Create a blob and a fake anchor to download the data.
    const blob = new Blob([JSON.stringify(combinedData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `run_${data.value.runState.creationTs}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } else {
    readout("readout.unknown_error");
  }
}

/**
 * Starts a new run.
 */
async function startRun() {
  reset();
  showMoreStats.value = true;
  runReadyState.value = true;
  imageIsLoading.value = false;
  waitingForGuess.value = false;

  const { data, error } = await useFetch(`/api/run/new`);

  if (error && error.value) {
    if (error.value.statusCode === 429) {
      readout("readout.rate_limit");
    } else if (error.value.message.startsWith("NetworkError")) {
      readout("readout.network_error");
    } else {
      readout("readout.unknown_error", { error: error.value.message });
    }
  } else if (data && data.value) {
    runId.value = data.value.runId;
    readout("readout.new_run");
  } else {
    readout("readout.unknown_error");
  }

  navigator.sendBeacon(
    `/api/resource/${frameId.value || audioId.value}/cleanup`,
  );
  emit("start");
}
</script>

<style>
.verifyBar {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  column-gap: 8px;
}

.grayed {
  color: #555;
}
</style>
