<template>
  <input
    v-model="searchInput"
    placeholder="Fuzzy search"
    @keydown="handleKey"
  />
  <ol>
    <FuzzyResultItem
      v-for="obj in computedData"
      :key="obj.episode.fullName"
      :input="obj"
    ></FuzzyResultItem>
  </ol>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFetch } from "#app";
import { FuzzySearchResult, naiveFuzzySearchParts } from "~~/utils/fuzzy";
import { ClientEpisodeData } from "~~/server/api/list";
import { episodeName } from "~/utils/utils";

export interface ProcessedEpisodeData {
  season: number;
  episode: number;
  name: string;
  fullName: string;
}

export interface SearchDataBundle {
  searchResult: FuzzySearchResult;
  episode: ProcessedEpisodeData;
}

const { data: rawData } = await useFetch("/api/list");
const rawEpisodeData: ProcessedEpisodeData[] = rawData.value
  ? rawData.value.episodeData.map((ep: ClientEpisodeData) => {
      return { ...ep, fullName: episodeName(ep.season, ep.episode, ep.name) };
    })
  : [];

const searchInput = ref("");

const computedData = computed(() => {
  const result: SearchDataBundle[] = [];
  rawEpisodeData.forEach((ep) => {
    const searchResult: FuzzySearchResult = naiveFuzzySearchParts(
      searchInput.value,
      ep.fullName
    );
    if (searchResult.matchingCharacterCount) {
      result.push({ searchResult, episode: ep });
    }
  });
  result.sort(
    (a, b) =>
      b.searchResult.matchingCharacterCount -
      a.searchResult.matchingCharacterCount
  );
  return result;
});

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
    submitEntry = computedData.value[0];
  }

  if (submitEntry !== null) {
    console.log("Input submitted ", submitEntry.episode.fullName);
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
li:before {
  content: "Alt-" counter(searchCounter);
  color: gray;
  margin-right: 0.4rem;
}
</style>
