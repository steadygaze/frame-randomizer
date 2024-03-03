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
    <span
      v-if="
        showOriginalLanguageName &&
        chunkedOriginalLanguageName &&
        chunkedOriginalLanguageName.length
      "
    >
      <span
        v-for="(part, index) in chunkedOriginalLanguageName"
        :key="index"
        :class="{ matching: part?.matching, title: true }"
      >
        {{ part?.part }} </span
      ><br
    /></span>
    <span v-if="showSynopsis">
      <span
        v-for="(part, index) in chunkedSynopsis"
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
import type { FuseResult } from "fuse.js";
import type { ProcessedEpisodeData } from "~~/store/showDataStore";
import { seasonEpisodeTag } from "~~/utils/utils";
import { chunkMatchText } from "~~/utils/fuzzy";
import type { SearchPart } from "~~/utils/fuzzy";

const props = defineProps<{
  fuseMatch: FuseResult<ProcessedEpisodeData>;
  showOriginalLanguageName: boolean;
  showSynopsis: boolean;
  highlight: boolean;
}>();

/**
 * Given a match object with match indices, constructs a list of substrings to
 * display.
 * @param key What key was searched/matched.
 * @returns List of displayable substrings, augmented with match status.
 */
function findAndChunkKeyMatches(key: keyof ProcessedEpisodeData): SearchPart[] {
  const nameMatch = props.fuseMatch.matches?.find((match) => match.key === key);
  return nameMatch
    ? chunkMatchText(nameMatch)
    : props.fuseMatch.item[key]
      ? [{ part: props.fuseMatch.item[key] as string, matching: false }]
      : [];
}

const chunkedName = computed(() => findAndChunkKeyMatches("name"));
const chunkedOriginalLanguageName = computed(() =>
  findAndChunkKeyMatches("originalName"),
);
const chunkedSynopsis = computed(() =>
  props.showSynopsis ? findAndChunkKeyMatches("synopsis") : [],
);

const mySeasonEpisodeTag = computed(() =>
  seasonEpisodeTag(props.fuseMatch.item.season, props.fuseMatch.item.episode),
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
  cursor: pointer;
  /* Other changes covered by .highlight. */
}

li:active {
  background-color: #aaa;
}
</style>
