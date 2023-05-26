// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

/* eslint sort-keys: "error" */
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          href: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${
            process.env.FR_FAVICON_EMOJI || "🎞️"
          }</text></svg>`,
          rel: "icon",
        },
      ],
      meta: [
        {
          content: "width=device-width, initial-scale=1",
          name: "viewport",
        },
        {
          charset: "utf-8",
        },
      ],
      noscript: [
        "Unfortunately, this site requires JavaScript. However, in principle, a no-JavaScript version could be made…",
      ],
    },
  },

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

  routeRules: {
    "/api/frame/get/**": {
      headers: {
        // private: browser cache only, no CDN or Cloudflare cache.
        // immutable: image path is a UUID that will not change.
        // max-age: one week default, a reasonable guess for how long a user
        // might want the image to stick around
        "cache-control": `private, immutable, max-age=${
          process.env.FR_FRAME_CACHE_AGE || 60 * 60 * 24 * 7
        }`,
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
    answerExpiryMs: 4 * 60 * 60 * 1000, // 4 hours.
    // How often to check frameOutputDir, frame state storage, and answer
    // storage for expired or orphaned images.
    cleanupIntervalMs: 30 * 60 * 1000, // 30 minutes.
    // If given, this will be injected into the ffmpeg command used to generate
    // the images. Useful for specifying image encoding/quality options. Consult
    // ffmpeg documentation (https://ffmpeg.org/ffmpeg-codecs.html).
    ffmpegImageCommandInject: undefined,
    // Path to ffmpeg binary, or "ffmpeg" to use the one from the system PATH.
    ffmpegPath: "ffmpeg",
    // On server initialization, ffprobe is used to find how long each episode
    // is. Limit ffprobe invocations to this number at a time. 0 or Infinity for
    // no limit.
    ffprobeInitialLoadLimit: Infinity,
    // Path to ffmpeg binary, or "ffmpeg" to use the one from the system PATH.
    ffprobePath: "ffprobe",
    // How long to keep a frame image around for after a the API points a user
    // to it.
    frameExpiryMs: 5 * 60 * 1000, // 5 minutes.
    // If frameRequiredStandardDeviation is set, a minimum standard deviation is
    // required. If image generation fails this many times, give up and use the
    // last generated image, waiving the standard deviation requirement. While
    // it will prevent frame generation from hanging on frame generation
    // indefinitely, hitting the limit will still increase frame generation
    // times significantly.
    frameGenMaxAttempts: 5,
    // Limit number of simultaneously generated frames to this amount.
    frameGenMaxParallelism: 3,
    // Where generated images will be outputted to and served from. Apparently
    // orphaned images will be cleaned out of this directory, so don't point it
    // to somewhere that has important data!
    frameOutputDir: "/tmp/genimg",
    // Number of images to pregenerate. These will be ready for serving right
    // away, and will be replaced as soon as they're served.
    framePregenCount: 3,
    // Require a standard deviation (from ImageMagick's identify command) of
    // more than this amount. If unsure, consider testing with identify on some
    // borderline frames. Set to 0 to disable.
    frameRequiredStandardDeviation: 2500.0,
    // Path to ImageMagick identify command.
    imageMagickIdentifyPath: "identify",
    // Per Nuxt documentation, these values will be sent to client-side code.
    public: {
      // Whether to include the disclaimer required by TMDB for use of its API
      // (see
      // https://developer.themoviedb.org/docs/faq#what-are-the-attribution-requirements).
      attributeTmdb: false,
      // Number of characters required for a match. If the user inputs a search
      // shorter than this, nothing will happen.
      // https://fusejs.io/api/options.html#minmatchcharlength
      fuzzySearchMinMatchLength: 3,
      // The threshold used by Fuse for what is considered a match. Increasing
      // this will relax the match strictness.
      // https://fusejs.io/api/options.html#threshold.
      fuzzySearchThreshold: 0.2,
      // Weight assigned to the episode name, relative to synopsis.
      // https://fusejs.io/examples.html#weighted-search
      fuzzySearchWeightName: 1.0,
      // Weight assigned to the episode overview/synopsis, relative to name.
      // https://fusejs.io/examples.html#weighted-search
      fuzzySearchWeightSynopsis: 0.25,
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
      softwareVersion: "0.0.3",
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
    // Required. Where the show data is. See README.md and server/load.ts for
    // more info.
    showDataPath: undefined,
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
      tokensPerInterval:
        parseInt(process.env.FR_REQUEST_LIMIT || "0") || 720 * 2,
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
});
