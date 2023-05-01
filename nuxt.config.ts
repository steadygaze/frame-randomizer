// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

const instanceName = "Showguesser";

/* eslint sort-keys: "error" */
export default defineNuxtConfig({
  app: {
    head: {
      title: instanceName,
    },
  },
  imports: {
    autoImport: false,
  },
  modules: ["@pinia/nuxt"],
  nitro: {
    esbuild: {
      options: {
        target: "node18",
      },
    },
  },
  runtimeConfig: {
    allowMissingEpisodes: true,
    episodeDataPath: `/home/${process.env.USER}/projects/showguesser_data/mlp3.json`,
    imageOutputDir: "/tmp/image_gen",
    public: {
      imageOutputExtension: "png",
      instanceName,
    },
    replayPreSec: 4,
    searchVideoDirRecursively: false,
    uuidNamespace: "b219dcdb-c910-417c-8403-01c6b40c5fb4",
    videoSourceDir: `/home/${process.env.USER}/Downloads/mlp`,
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
});
