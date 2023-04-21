<template>
  <div id="fuzzyInput">
    <input
      v-model="searchInput"
      placeholder="Fuzzy search"
      @keydown="handleKey"
    />
    <label>
      <input v-model="showSynopsis" type="checkbox" />
      Show synopsis
    </label>
    <ol>
      <FuzzyResultItem
        v-for="(fuseMatch, index) in computedData"
        :key="fuseMatch.item.fullName"
        :fuse-match="fuseMatch"
        :show-synopsis="showSynopsis"
        :highlight="highlightIndex === index"
      ></FuzzyResultItem>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFetch } from "#app";
import Fuse from "fuse.js";
import { ClientEpisodeData } from "~~/server/api/list";
import { episodeName } from "~/utils/utils";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
  overview: string;
}

const { data: rawData } = await useFetch("/api/list");
const episodeData: ProcessedEpisodeData[] = rawData.value
  ? rawData.value.episodeData.map((ep: ClientEpisodeData) => {
      return { ...ep, fullName: episodeName(ep.season, ep.episode, ep.name) };
    })
  : [];

const fuse = new Fuse(episodeData, {
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
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
  minMatchCharLength: 3,
  threshold: 0.25,
});

const searchInput = ref("");
const showSynopsis = ref(true);
const highlightIndex = ref(0);

const computedData = computed(() => fuse.search(searchInput.value));

function handleKey(event: KeyboardEvent) {
  let submitEntry = null;
  if (event.ctrlKey || event.altKey) {
    switch (event.key) {
      case "1":
        submitEntry = computedData.value[0];
        break;
      case "2":
        submitEntry = computedData.value[1];
        break;
      case "3":
        submitEntry = computedData.value[2];
        break;
      case "4":
        submitEntry = computedData.value[3];
        break;
      case "5":
        submitEntry = computedData.value[4];
        break;
      default:
        return;
    }
  } else if (event.key === "Enter") {
    submitEntry = computedData.value[highlightIndex.value];
  } else {
    switch (event.key) {
      case "ArrowDown":
        if (highlightIndex.value < computedData.value.length - 1) {
          ++highlightIndex.value;
        }
        break;
      case "ArrowUp":
        if (highlightIndex.value > 0) {
          --highlightIndex.value;
        }
        break;
      default:
        // Regular text input; reset to beginning.
        highlightIndex.value = 0;
    }
  }

  if (submitEntry !== null) {
    console.log("Input submitted ", submitEntry.item.fullName);
  }
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
  color: gray;
  margin-right: 0.4rem;
}

#fuzzyInput {
  padding: 1px;
}
</style>
