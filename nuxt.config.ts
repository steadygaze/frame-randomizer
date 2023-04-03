// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  imports: {
    autoImport: false,
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
