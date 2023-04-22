<template>
  <div class="fuzzyInput">
    <input
      v-model="searchInput"
      placeholder="Fuzzy search"
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
import { computed, ref } from "vue";
import { useFetch } from "#app";
import Fuse from "fuse.js";
import { storeToRefs } from "pinia";
import { useEpisodeDataStore } from "~~/store/episodeDataStore";

const store = useEpisodeDataStore();
const { initEpisodeData } = store;
const { imageId, episodeData } = storeToRefs(store);

type FuseOptions<ProcessedEpisodeData> =
  Fuse.IFuseOptions<ProcessedEpisodeData>;

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview: string;
}

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

const searchInput = ref("");
const useSynopsis = ref(true);
const highlightIndex = ref(0);

const computedData = computed(() =>
  useSynopsis.value
    ? fuseSynopsis.search(searchInput.value)
    : fuseNameOnly.search(searchInput.value)
);

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
    submitIndex = highlightIndex.value;
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
  if (index < 0 || index >= computedData.value.length) {
    throw new RangeError(`Index ${index} out of range`);
  }
  console.log("Submitting input", computedData.value[index].item.fullName);
  const result = await useFetch(`/api/checkimg/${imageId.value}`);
  console.dir(result);
}
</script>

<style scoped>
ol {
  list-style: none;
  counter-reset: searchCounter;
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

@media screen and (max-width: 800px) {
  li:before {
    /* Hide keyboard shortcut hints on mobile. */
    content: "" !important;
    margin-right: 0 !important;
  }
}

.fuzzyInput {
  padding: 4px;
}

#synopsisCheckboxContainer {
  /* Group checkbox and label so they break on the same line. */
  display: inline-block;
}
</style>
