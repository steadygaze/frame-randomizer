<template>
  <a
    v-if="urlFormat"
    :href="getUrl({ season: props.season, episode: props.episode })"
    ><slot></slot
  ></a>
  <span v-else><slot></slot></span>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from "#imports";

const config = useRuntimeConfig();
const urlFormat = config.public.episodeUrlFormat;

interface SeasonEpisodeData {
  season: string | number;
  episode: string | number;
}

/**
 * Generate a URL associated with the given episode.
 * @param data Season and episode number.
 * @returns Returns the URL.
 */
function getUrl(data: SeasonEpisodeData) {
  const { season, episode } = data;
  let result = urlFormat.replaceAll("{season}", String(season));
  result = result.replaceAll("{episode}", String(episode));
  return result;
}

const props = defineProps<{
  season: string | number;
  episode: string | number;
}>();
</script>

<style scoped>
/* Make links barely distinguishable from regular text; regular links are
 * too visually distracting. */
a {
  color: #333;
  text-decoration: none;
}

a:hover,
a:active {
  text-decoration: underline;
}

a:visited {
  color: #333;
}
</style>
