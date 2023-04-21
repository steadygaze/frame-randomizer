<template>
  <li :id="fuseMatch.item.fullName" @click="emitItem">
    <span>{{ mySeasonEpisodeTag }}</span
    >&nbsp;
    <span
      v-for="part in chunkedName"
      :key="part?.part"
      :class="part?.matching ? 'matching' : 'not-matching'"
    >
      {{ part?.part }} </span
    ><br />
    <span
      v-for="part in chunkedOverview"
      :key="part?.part"
      :class="part?.matching ? 'matching' : 'not-matching'"
    >
      {{ part?.part }}
    </span>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Fuse from "fuse.js";
import { ProcessedEpisodeData } from "./FuzzyInput.vue";
import { seasonEpisodeTag } from "~~/utils/utils";
import { SearchPart, chunkMatchText } from "~/utils/fuzzy";

type FuseResult<T> = Fuse.FuseResult<T>;

const props = defineProps<{
  fuseMatch: FuseResult<ProcessedEpisodeData>;
}>();

function findAndChunkKeyMatches(key: keyof ProcessedEpisodeData): SearchPart[] {
  const nameMatch = props.fuseMatch.matches?.find((match) => match.key === key);
  return nameMatch
    ? chunkMatchText(nameMatch)
    : [{ part: props.fuseMatch.item[key] as string, matching: false }];
}

const chunkedName = computed(() => {
  const r = findAndChunkKeyMatches("name");
  console.dir(r);
  return r;
});
const chunkedOverview = computed(() => findAndChunkKeyMatches("overview"));

const mySeasonEpisodeTag = computed(() =>
  seasonEpisodeTag(props.fuseMatch.item.season, props.fuseMatch.item.episode)
);

function emitItem(_event: MouseEvent) {
  console.dir(props.fuseMatch.item.fullName);
}
</script>

<style scoped>
.matching {
  font-weight: bold;
  text-decoration: underline;
}
</style>
