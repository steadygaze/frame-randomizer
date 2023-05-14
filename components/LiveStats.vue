<template>
  <div class="liveStatsContainer">
    <p>
      <span class="correct">{{ correctCounter }}</span> /
      <span class="total"
        >{{ totalCounter }} ({{
          Math.round((correctCounter / totalCounter) * 100 * 100) / 100 || 0
        }}%)</span
      >
    </p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStateStore } from "~~/store/appStateStore";

const appStateStore = useAppStateStore();
const { correctCounter, totalCounter } = storeToRefs(appStateStore);
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
</style>
