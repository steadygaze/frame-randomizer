<template>
  <section v-if="show" class="modalContainer">
    <div class="aboutLine">
      <h2>{{ $t("about.header") }}</h2>
      <button @click="$emit('close')">X</button>
    </div>
    <p v-if="locale !== 'en'">
      {{ $t("about.machine_translation_disclaimer") }}
    </p>
    <section
      v-if="
        instanceInfo ||
        config.public.instanceInfoHtml ||
        config.public.instanceInfoText
      "
    >
      <h3>{{ $t("about.site_info_header") }}</h3>
      <p class="grayedText">
        {{ $t("about.instance_specific_disclaimer") }}
      </p>
      <!-- eslint-disable vue/no-v-html -- Provided by instance operator. -->
      <p
        v-if="instanceInfo && instanceInfo.html"
        v-html="instanceInfo.perLocale[locale]"
      ></p>
      <p v-else-if="instanceInfo">
        {{ instanceInfo.perLocale[locale] }}
      </p>
      <!-- eslint-disable vue/no-v-html -- Provided by instance operator. -->
      <p
        v-else-if="config.public.instanceInfoHtml"
        v-html="config.public.instanceInfoHtml"
      ></p>
      <p v-else-if="config.public.instanceInfoText">
        {{ config.public.instanceInfoText }}
      </p>
    </section>
    <h3>{{ $t("about.instructions.header") }}</h3>
    <i18n-t
      keypath="about.instructions.what_is_this_site"
      tag="p"
      scope="global"
    >
      <template #showName>{{ showName }}</template>
    </i18n-t>

    <ul>
      <i18n-t
        keypath="about.instructions.controls.info"
        tag="li"
        scope="global"
      >
        <template #fuzzySearchMinMatchLength>{{
          config.public.fuzzySearchMinMatchLength
        }}</template>
        <template #upDown
          ><code>{{
            $t("about.instructions.controls.up_down")
          }}</code></template
        >
        <template #ctrlNum
          ><code>{{
            $t("about.instructions.controls.ctrl_num")
          }}</code></template
        >
        <template #altNum
          ><code>{{
            $t("about.instructions.controls.alt_num")
          }}</code></template
        >
      </i18n-t>
      <li>
        <i18n-t keypath="about.instructions.synopsis" tag="span" scope="global">
          <template #synopsisLabel>{{ $t("input.use_synopsis") }}</template>
        </i18n-t>
        <span v-if="!synopsisAvailable"
          >{{ $t("space") }}{{ $t("about.instructions.no_synopsis") }}</span
        ><span v-if="!synopsisAvailable && config.public.attributeTmdb"
          >{{ $t("space")
          }}{{ $t("about.instructions.synopsis_update_tmdb_hint") }}</span
        >
      </li>
      <i18n-t
        keypath="about.instructions.episode_search_tip.tip"
        tag="li"
        scope="global"
      >
        <template #example1
          ><code>{{
            $t("about.instructions.episode_search_tip.example1")
          }}</code></template
        >
        <template #example2
          ><code>{{
            $t("about.instructions.episode_search_tip.example2")
          }}</code></template
        >
      </i18n-t>
      <i18n-t keypath="about.instructions.skip_tip" tag="li" scope="global">
        <template #skipLabel>{{ $t("input.skip") }}</template>
      </i18n-t>
      <li>
        {{ $t("about.instructions.image_lifetime_tip") }}
      </li>
      <li>
        {{ $t("about.instructions.font_size_tip") }}
      </li>
    </ul>
    <h4>
      {{ $t("about.stats.header") }}
    </h4>
    <i18n-t keypath="about.stats.intro" tag="p" scope="global">
      <template #moreLabel>{{ $t("stats.more") }}</template>
    </i18n-t>
    <ul>
      <li><strong>X / X (X%): </strong>{{ $t("about.stats.percent") }}</li>
      <li>
        <strong>{{ $t("stats.streak") }}</strong
        >{{ $t("about.stats.streak") }}
      </li>
      <li>
        <strong>{{ $t("stats.real_time") }}</strong
        >{{ $t("about.stats.real_time") }}
      </li>
      <li>
        <strong>{{ $t("stats.total_guess_time") }}</strong
        >{{ $t("about.stats.total_guess_time") }}
      </li>
      <li>
        <strong>{{ $t("stats.current_guess_time") }}</strong> {{ $t("space")
        }}{{ $t("about.stats.current_guess_time") }}
      </li>
    </ul>
    <h3>{{ $t("about.licensing.header") }}</h3>
    <p>
      <i18n-t keypath="about.licensing.main" tag="p" scope="global">
        <template #instanceName>{{ config.public.instanceName }}</template>
        <template #softwareName>
          <a :href="originalSourceUrl"><code>frame-randomizer</code></a>
          <code>(v{{ config.public.softwareVersion }})</code>
        </template>
        <template #licenseName>
          <a :href="$t('about.licensing.url')">{{
            $t("about.licensing.name")
          }}</a>
        </template>
        <template #modDeclaration>
          <i18n-t
            v-if="modifiedSource"
            keypath="about.licensing.modified"
            tag="span"
            scope="global"
          >
            <template #sourceCodeLink>
              <a :href="config.public.sourceCodeUrl">{{
                config.public.sourceCodeUrl
              }}</a
              >.</template
            >
          </i18n-t>
          <span v-else class="grayedText">
            {{ $t("about.licensing.unmodified") }}
          </span>
        </template>
      </i18n-t>
    </p>
    <p>
      {{ $t("about.licensing.local_tip") }}
    </p>
    <p>
      {{ $t("about.licensing.content_disclaimer") }}
    </p>
    <section v-if="config.public.attributeTmdb">
      <h3>{{ $t("about.tmdb.header") }}</h3>
      <p>
        <i18n-t keypath="about.tmdb.attribution" tag="em" scope="global">
          <template #tmdbApiLink>
            <a href="https://developer.themoviedb.org/docs">TMDB API</a>
          </template>
          <template #tmdbLink>
            <a href="https://www.themoviedb.org/">TMDB</a>
          </template>
        </i18n-t>
      </p>
      <a href="https://www.themoviedb.org">
        <img src="/tmdb_logo.svg" alt="TMDB logo"
      /></a>
      <p>
        {{ $t("about.tmdb.explanation") }}
        <a
          v-if="config.public.tmdbTvShowId"
          :href="`https://www.themoviedb.org/tv/${config.public.tmdbTvShowId}`"
          >{{ $t("about.tmdb.tmdb_page") }}</a
        >
      </p>
    </section>
    <button @click="$emit('close')">{{ $t("about.close") }}</button>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "#app";
import { useI18n } from "#imports";
import { useShowDataStore } from "~~/store/showDataStore";

interface InstanceInfoData {
  html: boolean;
  defaultLocale: string;
  perLocale: {
    [key: string]: string;
  };
}

const { locale } = useI18n();
const store = useShowDataStore();
const { showName, synopsisAvailable } = storeToRefs(store);

const originalSourceUrl = "https://github.com/steadygaze/frame-randomizer";
const config = useRuntimeConfig();
const modifiedSource =
  config.public.sourceCodeUrl &&
  config.public.sourceCodeUrl !== originalSourceUrl;

const instanceInfo = config.public.instanceInfoData as unknown as
  | InstanceInfoData
  | undefined;

defineProps<{
  show: boolean;
}>();
defineEmits<{ (e: "close"): void }>();
</script>

<style scoped>
.modalContainer {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  border: 8px solid #555;
  margin: auto;
  padding: 1em;
  max-width: 80ch;
  background-color: white;
  text-align: justify;
  max-height: 100vh;
  overflow-y: auto;
}

button {
  padding: 0.5em 1em;
}

ul {
  padding-left: 1.4em;
}

.grayedText {
  color: #555;
}

.aboutLine {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aboutLine button {
  align-self: flex-end;
}
.aboutLine h2 {
  margin: 6px 0 0 0;
}
</style>
