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

const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

watch(locale, (locale) => {
  // Update saved language setting, or the default language will redirect back.
  setLocale(locale);
  // Trigger a page reload because translations doesn't load properly otherwise.
  navigateTo(switchLocalePath(locale), { external: true });
});
</script>

<style scoped>
label {
  margin-right: 0.3em;
}
</style>
