<template>
  <div class="flowIt">
    <button @click="getImage">Get Image</button>
    <p class="command">{{ epNum }}</p>
    <p class="command">{{ minute }}m{{ second }}s</p>
    <pre class="command">{{ command }}</pre>
  </div>
  <img v-if="imageId" :src="`/api/genimg/${imageId}`" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useFetch } from "#app";
import { episodeName } from "~~/utils/utils";

const imageId = ref("");
const command = ref("");
const minute = ref(0);
const second = ref(0);
const epNum = ref("");

async function getImage(_event: MouseEvent) {
  window.getSelection()?.removeAllRanges();
  const { data: rawData } = await useFetch("/api/gen");
  console.dir(rawData);
  if (rawData && rawData.value) {
    imageId.value = rawData.value.imageId;
    command.value = rawData.value.command;
    minute.value = rawData.value.minute;
    second.value = rawData.value.second;
    epNum.value = episodeName(
      rawData.value.season,
      rawData.value.episode,
      rawData.value.name
    );
  } else {
    console.error("Fetch failed", rawData);
  }
}
</script>

<style scoped>
.command {
  color: white;
}

img {
  width: 80%;
  height: auto;
  /* width: auto;
  height: 80%; */

  margin-left: auto;
  margin-right: auto;
}

.flowIt {
  display: flex;
  margin-bottom: 0.4rem;
  height: 4rem;
}
.flowIt * {
  margin-right: 1em;
}

pre {
  white-space: pre-wrap;
}

button {
  width: 6rem;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
