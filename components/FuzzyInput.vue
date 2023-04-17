<template>
  <input
    v-model="searchInput"
    placeholder="Fuzzy search"
    @keydown="handleKey"
  />
  <ol>
    <FuzzyResultItem
      v-for="obj in computedData"
      :key="obj.show.fullName"
      :input="obj"
    ></FuzzyResultItem>
  </ol>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFetch } from "#app";
import { FuzzySearchResult, naiveFuzzySearchParts } from "~~/utils/fuzzy";
import { Show } from "~~/server/api/shows";

export interface SearchDataBundle {
  searchResult: FuzzySearchResult;
  show: Show;
}

const { data: rawData } = await useFetch("/api/shows");
const rawShows: Show[] = rawData.value ? rawData.value.shows : [];

const searchInput = ref("");

const computedData = computed(() => {
  const result: SearchDataBundle[] = [];
  rawShows.forEach((show) => {
    const searchResult: FuzzySearchResult = naiveFuzzySearchParts(
      searchInput.value,
      show.fullName
    );
    if (searchResult.matchingCharacterCount) {
      result.push({ searchResult, show });
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
    console.log("Input submitted ", submitEntry.show.fullName);
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
