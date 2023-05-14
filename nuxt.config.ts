// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

/* eslint sort-keys: "error" */
export default defineNuxtConfig({
  devtools: {
    enabled: false, // Toggle this to enable devtools.
  },

  imports: {
    autoImport: false,
  },

  modules: ["@pinia/nuxt", "nuxt-security"],

  nitro: {
    esbuild: {
      options: {
        target: "node18",
      },
    },

    storage: {
      answer: {
        driver: "memory",
      },

      frameFileState: {
        driver: "memory",
      },
    },
  },

  // These can be set per the instructions in
  // https://nuxt.com/docs/guide/directory-structure/env. All options that are
  // undefined here are required to be set in env params.
  //
  // This is unstable software; required options, option availability, and
  // option interpretation can change between versions. Check the changelog or
  // commit history when upgrading
  runtimeConfig: {
    // Whether to error out if episodes are missing, or simply print a warning.
    allowMissingEpisodes: true,
    // How long to keep an answer around for after a frame is served.
    answerExpiryMs: 60 * 60 * 1000, // 1 hour.
    // How often to check frameOutputDir, frame state storage, and answer
    // storage for expired or orphaned images.
    cleanupIntervalMs: 30 * 60 * 1000, // 30 minutes.
    // Required. Where the episode data config is. See README.md for more info.
    episodeDataPath: undefined,
    // If given, this will be injected into the ffmpeg command used to generate
    // the images. Useful for specifying image encoding/quality options. Consult
    // ffmpeg documentation (https://ffmpeg.org/ffmpeg-codecs.html).
    ffmpegImageCommandInject: undefined,
    // How long to keep a frame image around for after a the API points a user
    // to it.
    frameExpiryMs: 5 * 60 * 1000, // 5 minutes.
    // Limit number of simultaneously generated frames to this amount.
    frameGenMaxParallelism: 3,
    // Where generated images will be outputted to and served from. Apparently
    // orphaned images will be cleaned out of this directory, so don't point it
    // to somewhere that has important data!
    frameOutputDir: "/tmp/genimg",
    framePregenCount: 3,
    // Per Nuxt documentation, these values will be sent to client-side code.
    public: {
      // Whether to include the disclaimer required by TMDB for use of its API
      // (see
      // https://developer.themoviedb.org/docs/faq#what-are-the-attribution-requirements).
      attributeTmdb: false,
      // What extension to output images as. Naturally, these have different
      // tradeoffs in terms of output filesize, generation/encoding time, etc.
      imageOutputExtension: "webp",
      // Instance info that will be shown in the About section. This allows HTML
      // tags; use this if you want to include HTML. You might want to include a
      // way for users to contact you if there are problems, attribution or
      // acknowledgement to your data source (e.g. TMDB) or contributors, etc.
      instanceInfoHtml: undefined,
      // Instance info, but allowing plain text only; use this for safety if you
      // don't need to include HTML.
      instanceInfoText: undefined,
      // Required. Instance name shown to users.
      instanceName: undefined,
      // Description added to meta tags.
      metaDescription: "Frame randomizer instance",
      // Software version displayed in UI.
      softwareVersion: "0.0.1",
      // Link to your version of the source code. If you build and run a
      // modified version of this software to users over a network, the AGPL
      // requires you to provide users with a link to view/download your
      // modified version. If you don't provide a different link here, you
      // attest that your instance's code is unmodified.
      sourceCodeUrl: "https://github.com/steadygaze/frame-randomizer",
    },
    // Whether to search subdirectories of videoSourceDir. Directory path is not
    // considered when matching files with the right episode, only filename.
    searchVideoDirRecursively: true,
    // Used to give generated images random names. Recommend setting this to a
    // different one for your own instance from:
    // https://www.uuidtools.com/generate/v4
    uuidNamespace: "b219dcdb-c910-417c-8403-01c6b40c5fb4",
    // Required. Where source videos are found. Files should include the season
    // and episode numbers in SxxExx or xx,xx format or similar.
    videoSourceDir: undefined,
  },

  security: {
    headers: {
      // Allow devtools to work.
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === "development" ? "unsafe-none" : "require-corp",
    },
    rateLimiter: {
      interval: "hour",
      throwError: false,
      // One generated image and guess every 5 seconds.
      tokensPerInterval: 720 * 2,
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
});
