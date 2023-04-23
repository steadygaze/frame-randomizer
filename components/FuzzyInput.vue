<template>
  <div class="fuzzyInput">
    <div class="logoBar">
      <h1 id="logo">{{ siteName }}</h1>
      <button
        ref="getImageButton"
        :class="{ loading: imageIsLoading }"
        :disabled="imageIsLoading || waitingForGuess"
        @click="getImage"
      >
        <span class="button-text">New Image</span>
      </button>
    </div>
    <div id="readout">
      <p>{{ readout }}</p>
    </div>
    <input
      ref="searchTextInput"
      v-model="searchInput"
      type="text"
      placeholder="Fuzzy search..."
      :disabled="answerIsLoading || !waitingForGuess"
      @keydown="handleKey"
    />
    <div id="synopsisCheckboxContainer">
      <input id="synopsisCheckbox" v-model="useSynopsis" type="checkbox" />
      <label for="synopsisCheckbox">Use synopsis</label>
    </div>
    <ol>
      <FuzzyResultItem
        v-for="(fuseMatch, index) in computedData"
        :key="fuseMatch.item.fullName"
        :fuse-match="fuseMatch"
        :show-synopsis="useSynopsis"
        :highlight="highlightIndex === index"
        @mouseover="handleMouseover(index)"
        @click="submitAnswer(index)"
      ></FuzzyResultItem>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useFetch, useRuntimeConfig } from "#app";
import Fuse from "fuse.js";
import { storeToRefs } from "pinia";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";
import { floatIntPartPad } from "~~/utils/utils";

type FuseOptions<ProcessedEpisodeData> =
  Fuse.IFuseOptions<ProcessedEpisodeData>;

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview: string;
}

const config = useRuntimeConfig();
const siteName = ref(config.public.instanceName);
const store = useEpisodeDataStore();
const { initEpisodeData } = store;
const { imageId, episodeData } = storeToRefs(store);
const readout = ref(
  "Enter text to search episodes and guess the episode that the frame is from."
);
const waitingForGuess = ref(false);
const searchTextInput = ref<HTMLInputElement>();
const getImageButton = ref<HTMLButtonElement>();

await initEpisodeData();

const fuseOptions: FuseOptions<ProcessedEpisodeData> = {
  ignoreLocation: true,
  includeMatches: true,
  includeScore: true,
  isCaseSensitive: false,
  minMatchCharLength: 3,
  threshold: 0.2,
};

const fuseSynopsis = new Fuse(episodeData.value as ProcessedEpisodeData[], {
  ...fuseOptions,
  keys: [
    {
      name: "name",
      weight: 1.0,
    },
    {
      name: "overview",
      weight: 0.25,
    },
  ],
});

const fuseNameOnly = new Fuse(episodeData.value as ProcessedEpisodeData[], {
  ...fuseOptions,
  keys: ["name"],
});

const answerIsLoading = ref(false);
const highlightIndex = ref(0);
const imageIsLoading = ref(false);
const searchInput = ref("");
const useSynopsis = ref(true);

const computedData = computed(() =>
  useSynopsis.value
    ? fuseSynopsis.search(searchInput.value)
    : fuseNameOnly.search(searchInput.value)
);

async function getImage(_event: MouseEvent | null) {
  document.body.style.cursor = "wait";
  imageIsLoading.value = true;
  window.getSelection()?.removeAllRanges();
  const { data: rawData } = await useFetch("/api/gen");
  if (rawData && rawData.value) {
    store.imageId = rawData.value.imageId;
  } else {
    console.error("Fetch failed", rawData);
  }
  imageIsLoading.value = false;
  waitingForGuess.value = true;
  readout.value =
    "Enter text to search episodes and guess the episode that the frame is from.";
  if (searchTextInput.value && searchTextInput.value) {
    await nextTick();
    searchTextInput.value.focus();
  }
  document.body.style.cursor = "unset";
}

onMounted(() => {
  getImage(null);
});

function handleKey(event: KeyboardEvent) {
  let submitIndex = null;
  if (event.ctrlKey || event.altKey) {
    if (computedData.value.length > 0 && event.key === "1") {
      submitIndex = 0;
    } else if (computedData.value.length > 1 && event.key === "2") {
      submitIndex = 1;
    } else if (computedData.value.length > 2 && event.key === "3") {
      submitIndex = 2;
    } else if (computedData.value.length > 3 && event.key === "4") {
      submitIndex = 3;
    } else if (computedData.value.length > 4 && event.key === "5") {
      submitIndex = 4;
    } else if (computedData.value.length > 5 && event.key === "6") {
      submitIndex = 5;
    } else if (computedData.value.length > 6 && event.key === "7") {
      submitIndex = 6;
    } else if (computedData.value.length > 7 && event.key === "8") {
      submitIndex = 7;
    } else if (computedData.value.length > 8 && event.key === "9") {
      submitIndex = 8;
    } else if (computedData.value.length > 9 && event.key === "0") {
      submitIndex = 9;
    }
  } else if (event.key === "Enter") {
    submitIndex = computedData.value.length > 0 ? highlightIndex.value : -1;
  } else {
    switch (event.key) {
      case "ArrowDown":
        if (highlightIndex.value < computedData.value.length - 1) {
          ++highlightIndex.value;
        }
        event.preventDefault();
        break;
      case "ArrowUp":
        if (highlightIndex.value > 0) {
          --highlightIndex.value;
        }
        event.preventDefault();
        break;
      default:
        // Regular text input; reset to beginning.
        highlightIndex.value = 0;
    }
  }

  if (submitIndex !== null) {
    submitAnswer(submitIndex);
  }
}

function handleMouseover(index: number) {
  highlightIndex.value = index;
}

async function submitAnswer(index: number) {
  if (index < -1 || index >= computedData.value.length) {
    throw new RangeError(`Index ${index} out of range`);
  }
  waitingForGuess.value = false;
  answerIsLoading.value = true;
  document.body.style.cursor = "wait";
  let query;
  let item;
  if (index < 0) {
    query = { season: -1, episode: -1 };
  } else {
    item = computedData.value[index].item;
    console.log("Submitting input", item.fullName);
    query = { season: item.season, episode: item.episode };
  }
  const { data, error } = await useFetch(`/api/checkimg/${imageId.value}`, {
    query,
  });

  if (error.value) {
    if (error.value.statusCode === 404) {
      readout.value = `Answer not found. It may have expired. Try again.`;
    }
    readout.value = `Error getting answer: ${error.value.message}. Try again?`;
    return;
  }

  const correct = data.value?.correct;
  const seekTimeSec = data.value?.seekTime;
  const minute = seekTimeSec ? Math.floor(seekTimeSec / 60) : -1;
  const second = floatIntPartPad(
    seekTimeSec ? Math.floor((seekTimeSec % 60) * 1000) / 1000 : -1
  );
  if (index < 0) {
    const correctSeason = data.value?.season;
    const correctEpisode = data.value?.episode;
    const correctItem = episodeData.value?.find(
      (ep) => ep.season === correctSeason && ep.episode === correctEpisode
    );
    readout.value = `${correctItem?.fullName} @ ${minute}:${second}`;
  } else if (correct) {
    readout.value = `Correct: ${item?.fullName} @ ${minute}:${second}`;
  } else {
    const correctSeason = data.value?.season;
    const correctEpisode = data.value?.episode;
    const correctItem = episodeData.value?.find(
      (ep) => ep.season === correctSeason && ep.episode === correctEpisode
    );
    readout.value = `${item?.fullName} is incorrect. Answer: ${correctItem?.fullName} @ ${minute}:${second}`;
  }
  searchInput.value = "";
  answerIsLoading.value = false;
  document.body.style.cursor = "unset";
  if (getImageButton.value && getImageButton.value) {
    await nextTick();
    getImageButton.value.focus();
  }
}
</script>

<style scoped>
.fuzzyInput {
  padding: 4px;
}

ol {
  list-style: none;
  counter-reset: searchCounter;
  margin: 0;
  padding: 0;
}
li {
  counter-increment: searchCounter;
}
li:nth-child(10) {
  counter-reset: searchCounter -1;
}
li:nth-child(-n + 10):before {
  content: "Mod-" counter(searchCounter);
  color: #888;
  margin-right: 0.4rem;
}

@media screen and (hover: none) {
  li:before {
    /* Hide keyboard shortcut hints on mobile. There is no media query for
     * detecting a physical keyboard, therefore we approximate by detecting
     * whether there is a mouse/fine pointing device. */
    content: "" !important;
    margin-right: 0 !important;
  }
}

#synopsisCheckboxContainer {
  /* Group checkbox and label so they break on the same line. */
  display: inline-block;
}

#logo {
  margin: 1px 0;
}

.logoBar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  column-gap: 10px;
}

input[type="text"] {
  padding: 4px;
  margin-right: 2px;
}

button {
  width: 8em;
  height: 3.5em;
  position: relative;
}

button:focus {
  background-color: #ccc;
  border-radius: default;
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
