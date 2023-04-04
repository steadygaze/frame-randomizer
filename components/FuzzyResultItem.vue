<template>
  <li :id="input.show.fullName" @click="emitItem">
    <span
      v-for="part in input.searchResult.parts"
      :key="part.part"
      :class="part.matching ? 'matching' : 'not-matching'"
    >
      {{ part.part }}
    </span>
  </li>
</template>

<script setup lang="ts">
import { SearchDataBundle } from './FuzzyInput.vue'

const props = defineProps<{
  input: SearchDataBundle
}>()

function emitItem(_event: MouseEvent) {
  console.dir(props.input.show.fullName)
}
</script>

<style scoped>
.matching {
  font-weight: bold;
  text-decoration: underline;
}
</style>
