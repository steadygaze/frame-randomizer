// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  imports: {
    autoImport: false,
  },
  nitro: {
    esbuild: {
      options: {
        target: 'node18',
      },
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
