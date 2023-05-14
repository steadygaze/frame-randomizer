<template>
  <div class="fuzzyInput">
    <div class="logoBar">
      <h1 id="logo">{{ siteName }}</h1>
      <div id="bigButtonRow">
        <button
          id="newFrameButton"
          ref="newFrameButton"
          :class="{ loading: imageIsLoading }"
          class="buttonWithSpinner"
          :disabled="imageIsLoading || waitingForGuess"
          @click="getImage"
        >
          <span class="buttonWithSpinnerText">New Frame</span>
        </button>
        <button
          :disabled="imageIsLoading || waitingForGuess"
          @click="resetStats"
        >
          Reset
        </button>
        <button @click="showAbout = !showAbout">About</button>
        <AboutModal :show="showAbout" @close="showAbout = false"></AboutModal>
      </div>
    </div>
    <LiveStats></LiveStats>
    <div id="readout">
      <p>{{ readout }}</p>
    </div>
    <div id="inputRow">
      <input
        id="searchInput"
        ref="searchTextInput"
        v-model="searchInput"
        type="text"
        :placeholder="
          waitingForGuess ? 'Fuzzy search (3+ characters)...' : 'Get new frame?'
        "
        :disabled="answerIsLoading || !waitingForGuess"
        @keydown="handleKey"
      />
      <div id="synopsisCheckboxContainer">
        <input id="synopsisCheckbox" v-model="useSynopsis" type="checkbox" />
        <label for="synopsisCheckbox">Use synopsis</label>
      </div>
    </div>
    <ol class="resultItemList">
      <FuzzyResultItem
        v-for="(fuseMatch, index) in computedData"
        :key="fuseMatch.item.fullName"
        :fuse-match="fuseMatch"
        :show-synopsis="useSynopsis"
        :highlight="highlightIndex === index"
        @mousemove="changeHighlightedIndex(index)"
        @click="submitAnswer(index)"
      ></FuzzyResultItem>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import Fuse from "fuse.js";
import { storeToRefs } from "pinia";
import { useFetch, useRuntimeConfig } from "#app";
import LiveStats from "./LiveStats.vue";
import { useAppStateStore } from "~~/store/appStateStore";
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
const siteName = config.public.instanceName;
const episodeDataStore = useEpisodeDataStore();
const { initEpisodeData } = episodeDataStore;
const { mediaName, episodeData } = storeToRefs(episodeDataStore);
const appStateStore = useAppStateStore();
const { correctCounter, totalCounter, imageId, imageIsLoading, readout } =
  storeToRefs(appStateStore);
const waitingForGuess = ref(false);
const searchTextInput = ref<HTMLInputElement>();
const newFrameButton = ref<HTMLButtonElement>();

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
const searchInput = ref("");
const useSynopsis = ref(true);
const showAbout = ref(false);

const computedData = computed(() =>
  useSynopsis.value
    ? fuseSynopsis.search(searchInput.value)
    : fuseNameOnly.search(searchInput.value),
);

/**
 * Request an image from the API.
 * @param _event Mouse event (unused).
 */
async function getImage(_event: MouseEvent | null) {
  imageIsLoading.value = true;
  window.getSelection()?.removeAllRanges();
  const { data: rawData } = await useFetch("/api/frame/gen");
  if (rawData && rawData.value) {
    imageId.value = rawData.value.imageId;
  } else {
    console.error("Fetch failed", rawData);
  }
  // RandomImage knows when image loading (not just getting the image path from
  // the API) is done and will reactively notify us.
}

watch(imageIsLoading, async (imageIsLoading) => {
  if (imageIsLoading) {
    // Switched from not loading to loading.
    document.body.style.cursor = "wait";
  } else {
    // Switched from loading to done loading.
    document.body.style.cursor = "unset";
    waitingForGuess.value = true;
    readout.value = `Guess the ${mediaName.value} episode that the frame is randomly selected from using the search box.`;
    if (searchTextInput.value && searchTextInput.value) {
      await nextTick();
      searchTextInput.value.focus();
    }
  }
});

onMounted(() => {
  getImage(null);
});

/**
 * Handle keyboard inputs to the search box.
 *
 * Up/down arrow keys change the highlighted item. Enter submits the highlighted
 * item. Ctrl or Alt + number submits that numbered entry.
 * @param event Keyboard event.
 */
function handleKey(event: KeyboardEvent) {
  let submitIndex = null;
  if (event.ctrlKey || event.altKey) {
    if (event.key >= "0" && event.key <= "9") {
      const index =
        event.key === "0" ? 9 : event.key.charCodeAt(0) - "1".charCodeAt(0);
      if (computedData.value.length > index) {
        submitIndex = index;
      } else {
        readout.value = `No entry ${event.key} in search results.`;
      }
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

/**
 * Highlight search result item when moused over.
 * @param index Search result index to highlight.
 */
function changeHighlightedIndex(index: number) {
  highlightIndex.value = index;
}

/**
 * Submits an answer to the server and checks if it's correct.
 * @param index Search result index to submit.
 */
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
  const { data, error } = await useFetch(`/api/frame/check/${imageId.value}`, {
    query,
  });

  if (error.value) {
    if (error.value.statusCode === 404) {
      readout.value = "Answer not found. It may have expired. Try again.";
    } else if (error.value.statusCode === 429) {
      readout.value = "Request limit reached. Try again later.";
    } else {
      readout.value = `Error getting answer: ${error.value.message}. Try again?`;
    }
  } else {
    ++totalCounter.value;
    const correct = data.value?.correct;
    const seekTimeSec = data.value?.seekTime;
    const minute = seekTimeSec ? Math.floor(seekTimeSec / 60) : -1;
    const second = floatIntPartPad(
      seekTimeSec ? Math.floor((seekTimeSec % 60) * 1000) / 1000 : -1,
    );
    if (index < 0) {
      const correctSeason = data.value?.season;
      const correctEpisode = data.value?.episode;
      const correctItem = episodeData.value?.find(
        (ep) => ep.season === correctSeason && ep.episode === correctEpisode,
      );
      readout.value = `${correctItem?.fullName} @ ${minute}:${second}`;
    } else if (correct) {
      readout.value = `Correct: ${item?.fullName} @ ${minute}:${second}`;
      ++correctCounter.value;
    } else {
      const correctSeason = data.value?.season;
      const correctEpisode = data.value?.episode;
      const correctItem = episodeData.value?.find(
        (ep) => ep.season === correctSeason && ep.episode === correctEpisode,
      );
      readout.value = `${item?.fullName} is incorrect. Answer: ${correctItem?.fullName} @ ${minute}:${second}`;
    }
  }

  searchInput.value = "";
  answerIsLoading.value = false;
  document.body.style.cursor = "unset";
  if (newFrameButton.value && newFrameButton.value) {
    await nextTick();
    newFrameButton.value.focus();
  }
}

/**
 * Reset counters to zero.
 */
function resetStats() {
  correctCounter.value = 0;
  totalCounter.value = 0;
}
</script>

<style scoped>
.fuzzyInput {
  padding: 8px;
}

ol.resultItemList {
  list-style: none;
  counter-reset: searchCounter;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: row wrap;
}
ol.resultItemList li {
  counter-increment: searchCounter;
  flex: 1 1 350px;
}
ol.resultItemList li:nth-child(10) {
  counter-reset: searchCounter -1;
}
ol.resultItemList li:nth-child(-n + 10):before {
  content: "Mod-" counter(searchCounter) " ";
  color: #888;
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

#inputRow {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

#searchInput {
  flex: 1 1 auto;
  padding: 8px;
  box-sizing: border-box;
  max-width: 100%;
}

#synopsisCheckboxContainer {
  /* Group checkbox and label so they break on the same line. */
  display: inline-block;
  flex: 0 0 auto;
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

#readout {
  min-height: 3.5em;
}

#bigButtonRow button {
  margin-right: 2px;
}

button {
  height: 3.5em;
  padding: 0.9em;
}

button:focus {
  background-color: #ccc;
  border-radius: default;
}

.buttonWithSpinner {
  position: relative;
}

.buttonWithSpinnerText {
  margin: auto;
}

.loading .buttonWithSpinnerText {
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
