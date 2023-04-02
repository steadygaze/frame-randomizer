<template>
  <li :id="input.datum.id" @click="emitItem">
    <span
      v-for="part in input.searchResult.parts"
      :key="part.part"
      :class="part.matching ? 'matching' : 'not-matching'"
    >
      {{ part.part }}
    </span>
  </li>
</template>

<script setup>
const props = defineProps({
  input: {
    type: Object,
    default(rawProps) {
      return { searchResult: { parts: [] } }
    },
  },
})

function emitItem(event) {
  console.dir(props.input.datum.text)
}
</script>

<style scoped>
.matching {
  font-weight: bold;
  text-decoration: underline;
}
</style>
