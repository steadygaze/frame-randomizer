<template>
  <input
    v-model="searchInput"
    placeholder="Fuzzy search"
    @keydown="handleKey"
  />
  <ol>
    <FuzzyResultItem
      v-for="obj in computedData"
      :key="obj.datum.id"
      :input="obj"
    ></FuzzyResultItem>
  </ol>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FuzzySearchResult, naiveFuzzySearchParts } from '~~/utils/fuzzy'

export interface RawDatum {
  id: number
  text: string
}

export interface SearchDataBundle {
  searchResult: FuzzySearchResult
  datum: RawDatum
}

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
  const result: SearchDataBundle[] = []
  rawData.forEach((datum) => {
    const searchResult: FuzzySearchResult = naiveFuzzySearchParts(
      searchInput.value,
      datum.text
    )
    if (searchResult.matchingCharacterCount) {
      result.push({ searchResult, datum })
    }
  })
  result.sort(
    (a, b) =>
      b.searchResult.matchingCharacterCount -
      a.searchResult.matchingCharacterCount
  )
  return result
})

function handleKey(event: KeyboardEvent) {
  let submitEntry = null
  if (event.ctrlKey || event.altKey) {
    switch (event.key) {
      case '1':
        submitEntry = computedData.value[0]
        break
      case '2':
        submitEntry = computedData.value[1]
        break
      case '3':
        submitEntry = computedData.value[2]
        break
      case '4':
        submitEntry = computedData.value[3]
        break
      case '5':
        submitEntry = computedData.value[4]
        break
      default:
        return
    }
  } else if (event.key === 'Enter') {
    submitEntry = computedData.value[0]
  }

  if (submitEntry !== null) {
    console.log(`Input submitted ${submitEntry.datum.text}`)
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
  content: 'Alt-' counter(searchCounter);
  color: gray;
  margin-right: 0.4rem;
}
</style>
