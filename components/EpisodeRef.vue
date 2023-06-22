<template>
  <a v-if="watchUrl" :href="watchUrl">{{ name }}</a>
  <span v-else>{{ name }}</span
  ><span v-if="props.moreButtons"
    >&nbsp;<a v-if="watchUrl" :href="watchUrl" target="_blank"
      ><button>📺 {{ $t("readout.watch") }}</button></a
    >
    <a v-if="tmdbUrl" :href="tmdbUrl" target="_blank"
      ><button>ℹ️ {{ $t("readout.info") }}</button></a
    >
    <button @click="copy">
      📋 {{ copied ? $t("readout.copied") : $t("readout.copy") }}
    </button></span
  >
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onBeforeUnmount,
  useI18n,
  useRuntimeConfig,
} from "#imports";

const config = useRuntimeConfig();
const copied = ref(false);
const { locale } = useI18n();

const props = defineProps<{
  season: string | number;
  episode: string | number;
  name: string;
  moreButtons?: boolean;
}>();

const watchUrl = computed(() =>
  config.public.episodeUrlFormat
    ? config.public.episodeUrlFormat
        .replaceAll("{season}", String(props.season))
        .replaceAll("{episode}", String(props.episode))
    : null,
);

const tmdbUrl = computed(() =>
  config.public.tmdbTvShowId
    ? `https://www.themoviedb.org/tv/${config.public.tmdbTvShowId}/season/${props.season}/episode/${props.episode}?language=${locale.value}`
    : null,
);

let copyExpireTimeout: ReturnType<typeof setTimeout>;
/**
 * Copies the name of the episode shown to the clipboard.
 */
function copy() {
  navigator.clipboard.writeText(props.name);
  if (!copied.value) {
    copyExpireTimeout = setTimeout(() => (copied.value = false), 10000);
  }
  copied.value = true;
}

onBeforeUnmount(() => {
  clearTimeout(copyExpireTimeout);
});
</script>

<style scoped>
/* Make links barely distinguishable from regular text; regular links are
 * too visually distracting. */
a {
  color: #444;
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
