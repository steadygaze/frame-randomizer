<template>
  <div>
    <form>
      <label for="languageSelect">🌐 {{ $t("language.language") }}</label>
      <select v-model="locale">
        <option
          v-for="myLocale in locales"
          :key="typeof myLocale === 'string' ? myLocale : myLocale.code"
          name="languageSelect"
          :value="typeof myLocale === 'string' ? myLocale : myLocale.code"
        >
          {{
            typeof myLocale === "string"
              ? myLocale
              : myLocale.name || myLocale.code
          }}
        </option>
      </select>
    </form>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { navigateTo } from "#app";
import { useI18n, useSwitchLocalePath } from "#imports";

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

watch(locale, (locale) => {
  navigateTo(switchLocalePath(locale));
});
</script>

<style scoped>
label {
  margin-right: 0.3em;
}
</style>
