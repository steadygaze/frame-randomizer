<template>
  <li :id="fuseMatch.item.fullName" :class="{ highlight: props.highlight }">
    <span>{{ mySeasonEpisodeTag + " " }} </span>
    <span
      v-for="(part, index) in chunkedName"
      :key="index"
      :class="{ matching: part?.matching, title: true }"
    >
      {{ part?.part }} </span
    ><br />
    <span v-if="showSynopsis">
      <span
        v-for="(part, index) in chunkedOverview"
        :key="index"
        :class="{ matching: part?.matching }"
      >
        {{ part?.part }}
      </span>
    </span>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Fuse from "fuse.js";
import { ProcessedEpisodeData } from "./FuzzyInput.vue";
import { seasonEpisodeTag } from "~~/utils/utils";
import { SearchPart, chunkMatchText } from "~~/utils/fuzzy";

type FuseResult<T> = Fuse.FuseResult<T>;

const props = defineProps<{
  fuseMatch: FuseResult<ProcessedEpisodeData>;
  showSynopsis: boolean;
  highlight: boolean;
}>();

function findAndChunkKeyMatches(key: keyof ProcessedEpisodeData): SearchPart[] {
  const nameMatch = props.fuseMatch.matches?.find((match) => match.key === key);
  return nameMatch
    ? chunkMatchText(nameMatch)
    : [{ part: props.fuseMatch.item[key] as string, matching: false }];
}

const chunkedName = computed(() => findAndChunkKeyMatches("name"));
const chunkedOverview = computed(() =>
  props.showSynopsis ? findAndChunkKeyMatches("overview") : []
);

const mySeasonEpisodeTag = computed(() =>
  seasonEpisodeTag(props.fuseMatch.item.season, props.fuseMatch.item.episode)
);
</script>

<style scoped>
.matching {
  font-weight: bold;
  text-decoration: underline;
}

.highlight {
  background-color: black;
  color: white;
}

.title {
  font-style: italic;
}

li {
  border: 1px solid black;
  padding: 6px 4px;
}

li:hover {
  background-color: black;
  color: white;
  cursor: pointer;
}

li:active {
  background-color: #aaa;
}
</style>
