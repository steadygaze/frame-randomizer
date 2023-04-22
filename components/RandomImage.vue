<template>
  <div>
    <div class="flowIt">
      <button
        :class="{ loading: imageIsLoading }"
        :disabled="imageIsLoading"
        @click="getImage"
      >
        <span class="button-text">Get Image</span>
      </button>
      <p class="command">{{ epNum }} @ {{ minute }}m{{ second }}s</p>
      <pre class="command"><code>{{ command }}</code></pre>
    </div>
    <img v-if="imageId" :src="`/api/genimg/${imageId}`" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFetch } from "#app";
import { storeToRefs } from "pinia";
import { episodeName } from "~~/utils/utils";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";

const store = useEpisodeDataStore();
const { imageId } = storeToRefs(store);

const command = ref("");
const minute = ref(0);
const second = ref(0);
const epNum = ref("");
const imageIsLoading = ref(false);

async function getImage(_event: MouseEvent | null) {
  imageIsLoading.value = true;
  window.getSelection()?.removeAllRanges();
  const { data: rawData } = await useFetch("/api/gen");
  if (rawData && rawData.value) {
    store.imageId = rawData.value.imageId;
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
  imageIsLoading.value = false;
}

onMounted(() => getImage(null));
</script>

<style scoped>
.command {
  color: white;
}

img {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
}

.flowIt {
  display: flex;
  margin-bottom: 0.4rem;
  height: 4rem;
  align-items: center;
}
.flowIt * {
  margin-right: 1em;
}

pre {
  white-space: pre-wrap;
}

button {
  width: 6rem;
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
}

.button-text {
  margin: auto;
}

.loading .button-text {
  visibility: hidden;
}

.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  border: 8px solid transparent;
  border-top-color: black;
  border-radius: 50%;
  animation: loading-spinner 1s ease infinite;
}

@keyframes loading-spinner {
  from {
    transform: rotate(0turn);
  }
  to {
    transform: rotate(1turn);
  }
}
</style>
