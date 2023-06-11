<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "#app";
import { useHead, useI18n, useLocaleHead, watch } from "#imports";
import { useShowDataStore } from "~~/store/showDataStore";

const showDataStore = useShowDataStore();
const { initShowData } = showDataStore;
const { showName } = storeToRefs(showDataStore);

await initShowData();

const { t } = useI18n();

const config = useRuntimeConfig();

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
});

watch(
  showName,
  (show) => {
    useHead({
      htmlAttrs: {
        lang: i18nHead.value.htmlAttrs!.lang,
      },
      link: [...(i18nHead.value.link || [])],
      meta: [
        {
          name: "description",
          content: t("head.description", { show }),
        },
        ...(i18nHead.value.meta || []),
      ],
      title: t("head.title", {
        instance: config.public.instanceName,
        show,
      }),
    });
  },
  { immediate: true },
);
</script>

<style>
html,
body,
body > div,
#__nuxt > div {
  height: 100%;
  width: 100%;
  margin: 0;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  background-color: black;
}
</style>
