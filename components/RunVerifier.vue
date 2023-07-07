<template>
  <div>
    <hr />
    <div class="verifyBar">
      <em>v{{ config.public.softwareVersion }}</em>
      <div>
        <button v-if="!trackRun" @click="trackRun = true">
          🏁 {{ $t("input.start") }}
        </button>
        <button v-else @click="trackRun = false">
          ❌ {{ $t("input.clear") }}
        </button>
        <button v-if="trackRun" @click="saveRun">
          💾 {{ $t("input.save") }}
        </button>
      </div>

      <div v-if="trackRun && runId">{{ $t("verify.run_in_progress") }}</div>
      <div v-else class="grayed">{{ $t("verify.no_run") }}</div>
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
  runReadyState,
  trackRun,
  runId,
  imageIsLoading,
  waitingForGuess,
  showMoreStats,
  totalGuessTimeAccDurationMs,
  realTimeDurationMs,
} = storeToRefs(appStateStore);

/**
 * Save a run using the API.
 */
async function saveRun() {
  if (!runId.value) {
    return;
  }
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
    const combinedData = {
      runId: runId.value,
      server: data.value,
      client: {
        realTimeMs: realTimeDurationMs.value,
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

watch(trackRun, async (track) => {
  if (!track) {
    runId.value = "";
    return;
  }

  showMoreStats.value = true;
  reset();
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
});
</script>

<style>
.verifyBar {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.grayed {
  color: #555;
}
</style>
