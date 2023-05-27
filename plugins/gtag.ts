import VueGtag from "vue-gtag";
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

console.dir(VueGtag);

export default defineNuxtPlugin((nuxtApp) => {
  const id = useRuntimeConfig().public.googleAnalyticsMeasurementId;
  console.error("id", id);
  if (id) {
    console.error("id", id);
    nuxtApp.vueApp.use(VueGtag, {
      enabled: true,
      config: {
        id,
        params: {
          anonymize_ip: true,
        },
      },
    });
  }
});
