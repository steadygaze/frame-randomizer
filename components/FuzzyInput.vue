<template>
  <input v-model="searchInput" placeholder="Fuzzy search" @keydown="handleKey" />
  <ol>
    <FuzzyResultItem
      v-for="obj in computedData"
      :key="obj.datum.id"
      :input="obj"
    ></FuzzyResultItem>
  </ol>
</template>

<script setup>
import { computed, ref } from 'vue'
import { naiveFuzzySearchParts } from '~~/utils/fuzzy'

let id = 0

const rawData = [
  { id: id++, text: 'hello there, this is some example text' },
  { id: id++, text: 'here is more example text' },
  { id: id++, text: 'lorem ipsum sit' },
  { id: id++, text: 'hello huh' },
  { id: id++, text: 'wow!' },
]

const searchInput = ref('')

const computedData = computed(() => {
  const result = []
  rawData.forEach((datum) => {
    const searchResult = naiveFuzzySearchParts(searchInput.value, datum.text)
    if (searchResult.matchingCharacterCount) {
      result.push({ searchResult, datum })
    }
  })
  result.sort((a, b) => a.searchResult.length - b.searchResult.length)
  return result
})

function handleKey(event) {
  let submitEntry = null
  if (event.altKey) {
    switch (event.key) {
      case "1":
        submitEntry = computedData.value[0]
        break;
      case "2":
        submitEntry = computedData.value[1]
        break;
      case "3":
        submitEntry = computedData.value[2]
        break;
      case "4":
        submitEntry = computedData.value[3]
        break;
      case "5":
        submitEntry = computedData.value[4]
        break;
      default:
        break;
    }
  } else if (event.key === "Enter") {
    submitEntry = computedData.value[0]
  }
  console.log(`Input submitted ${submitEntry.text}`)
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
  content: 'Alt-' counter(searchCounter);
  color: gray;
  margin-right: 0.4rem;
}
</style>
