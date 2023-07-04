<template>
  <div class="fuzzyInput">
    <div class="logoBar">
      <h1 id="logo">{{ config.public.instanceName }}</h1>
      <div id="languageSelectWrapper"><LanguageSelect></LanguageSelect></div>
      <div id="bigButtonRow">
        <button
          id="newFrameButton"
          ref="newFrameButton"
          :class="{ loading: imageIsLoading }"
          class="buttonWithSpinner"
          :disabled="imageIsLoading || waitingForGuess"
          @click="getImage()"
        >
          <span class="buttonWithSpinnerText"
            >🎞️ {{ $t("input.new_frame") }}</span
          >
        </button>
        <button
          id="skipButton"
          ref="skipButton"
          :disabled="!imageIsLoading && !waitingForGuess"
          @click="
            searchInput = '';
            submitAnswer(-1);
          "
        >
          ⏩ {{ $t("input.skip") }}
        </button>
        <button :disabled="imageIsLoading || waitingForGuess" @click="reset">
          🔁 {{ $t("input.reset") }}
        </button>
        <a
          :href="`/api/frame/get/${imageId}.${config.public.imageOutputExtension}`"
          download
          :class="{ disabledAnchor: !imageId }"
          @click="warnIfFrameMayBeExpired"
          ><button :disabled="imageIsLoading">
            💾 {{ $t("input.save") }}
          </button></a
        >
        <button @click="showAbout = !showAbout">
          📖 {{ $t("input.about") }}
        </button>
        <AboutModal :show="showAbout" @close="showAbout = false"></AboutModal>
      </div>
    </div>
    <LiveStats></LiveStats>
    <div id="readouts">
      <ReadoutDisplay></ReadoutDisplay>
    </div>
    <div id="inputRow">
      <input
        id="searchInput"
        ref="searchTextInput"
        v-model="searchInput"
        type="text"
        autocomplete="off"
        :placeholder="
          waitingForGuess
            ? $t('input.placeholder.fuzzy', {
                characters: fuzzySearchMinMatchLength,
              })
            : $t('input.placeholder.new')
        "
        :disabled="answerIsLoading || !waitingForGuess"
        @keydown="handleKey"
      />
      <div v-if="synopsisAvailable" id="synopsisCheckboxContainer">
        <input id="synopsisCheckbox" v-model="useSynopsis" type="checkbox" />
        <label for="synopsisCheckbox">{{ $t("input.use_synopsis") }}</label>
      </div>
    </div>
    <ol
      id="resultItemList"
      class="resultItemList"
      :class="{ ctrlKey: browser?.name === 'firefox' }"
    >
      <FuzzyResultItem
        v-for="(fuseMatch, index) in searchResults"
        :key="fuseMatch.item.fullName"
        :fuse-match="fuseMatch"
        :show-synopsis="useSynopsis"
        :highlight="highlightIndex === index"
        @mousemove="changeHighlightedIndex(index)"
        @click="submitAnswer(index)"
      ></FuzzyResultItem>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import Fuse from "fuse.js";
import { storeToRefs } from "pinia";
import { useFetch, useRuntimeConfig } from "#app";
import LiveStats from "./LiveStats.vue";
import { useI18n } from "#imports";
import { useAppStateStore } from "~~/store/appStateStore";
import { ProcessedEpisodeData, useShowDataStore } from "~~/store/showDataStore";
import { floatIntPartPad } from "~~/utils/utils";

const { locale } = useI18n();

type FuseOptions<ProcessedEpisodeData> =
  Fuse.IFuseOptions<ProcessedEpisodeData>;

const config = useRuntimeConfig();
const showDataStore = useShowDataStore();
const { initShowData } = showDataStore;
const { showName, synopsisAvailable, episodeData } = storeToRefs(showDataStore);
const appStateStore = useAppStateStore();
const { detectBrowser, reset, readout } = appStateStore;
const {
  browser,
  cleanedUpFrame,
  correctCounter,
  streakCounter,
  totalCounter,
  imageId,
  imageIsLoading,
  imageLoadError,
  imageLoadTimestamp,
  currentGuessTimeStartTimestamp,
  waitingForGuess,
} = storeToRefs(appStateStore);
const searchTextInput = ref<HTMLInputElement>();
const newFrameButton = ref<HTMLButtonElement>();

const fuzzySearchMinMatchLength = computed(() =>
  locale.value === "zh" ? 1 : config.public.fuzzySearchMinMatchLength,
);

const fuseOptions: FuseOptions<ProcessedEpisodeData> = {
  ignoreLocation: true,
  includeMatches: true,
  includeScore: true,
  isCaseSensitive: false,
  minMatchCharLength: fuzzySearchMinMatchLength.value,
  threshold: config.public.fuzzySearchThreshold,
};

const fuseSynopsis = computed(
  () =>
    new Fuse(episodeData.value as ProcessedEpisodeData[], {
      ...fuseOptions,
      keys: [
        {
          name: "name",
          weight: config.public.fuzzySearchWeightName,
        },
        {
          name: "synopsis",
          weight: config.public.fuzzySearchWeightSynopsis,
        },
      ],
    }),
);

const fuseNameOnly = computed(
  () =>
    new Fuse(episodeData.value as ProcessedEpisodeData[], {
      ...fuseOptions,
      keys: ["name"],
    }),
);

const answerIsLoading = ref(false);
const highlightIndex = ref(0);
const searchInput = ref("");
const useSynopsis = ref(true);
const showAbout = ref(false);

const seasonEpisodeInputRe = /^s?(?<season>\d+)[xe](?<episode>\d+)$/i;

await initShowData();

const searchResults = computed(() => {
  const fuseResults = (
    useSynopsis.value && synopsisAvailable.value ? fuseSynopsis : fuseNameOnly
  ).value.search(searchInput.value);
  const match = seasonEpisodeInputRe.exec(searchInput.value);
  if (!match || match.length <= 0 || !match.groups) {
    return fuseResults;
  }
  // sXXeXX search; add result to top. If the same episode somehow also matches
  // in the fuzzy search, it will appear twice, but that's ok.
  const inputSeason = parseInt(match.groups.season);
  const inputEpisode = parseInt(match.groups.episode);
  if (isNaN(inputSeason) || isNaN(inputEpisode)) {
    return fuseResults;
  }
  const episodeDataIndex = episodeData.value.findIndex(
    (ep) => ep.season === inputSeason && ep.episode === inputEpisode,
  );
  return episodeDataIndex === -1
    ? fuseResults
    : [
        {
          item: episodeData.value[episodeDataIndex],
          refIndex: episodeDataIndex,
        },
      ].concat(fuseResults);
});

// If we don't run the first fetch at the top level and instead do so in
// getImage, then something weird happens where useFetch will return from
// awaiting with no result while the fetch is still pending. I suspect it may
// have to do with the way our code will be preprocessed in Vue's composition
// API, but I really don't know.
const fetchGenResult = await useFetch("/api/frame/gen");

/**
 * Request a frame from the API and reactively update the appropriate variables.
 * @param fetchResult Pre-fetched results from calling the frame generation API.
 */
async function getImage(fetchResult?: typeof fetchGenResult): Promise<void> {
  imageIsLoading.value = true;
  imageLoadError.value = false;
  if (typeof window !== "undefined") {
    window.getSelection()?.removeAllRanges();
  }
  const { data, error } =
    fetchResult ||
    (await useFetch(
      `/api/frame/gen?cleanupid=${
        browser.value?.name === "firefox" ? "" : imageId.value
      }`,
    ));
  if (error && error.value) {
    if (error.value.statusCode === 429) {
      readout("readout.rate_limit");
    } else if (error.value.message.startsWith("NetworkError")) {
      readout("readout.network_error");
    } else {
      readout("readout.generation_error", { error: error.value.message });
    }
    imageLoadError.value = true;
    imageIsLoading.value = false;
  } else if (data && data.value) {
    imageId.value = data.value.imageId;
  } else {
    readout("readout.generation_error", {
      error: String(data ? data.value : data),
    });
  }
  // RandomImage knows when image loading (not just getting the image path from
  // the API) is done and will reactively notify us.
}

watch(imageIsLoading, async (imageIsLoading) => {
  if (imageIsLoading) {
    // Switched from not loading to loading.
    document.body.style.cursor = "wait";
  } else {
    // Switched from loading to done loading.
    document.body.style.cursor = "unset";
    if (!imageLoadError.value) {
      waitingForGuess.value = true;
      currentGuessTimeStartTimestamp.value = Date.now();
      readout("readout.guess_prompt", { show: showName.value });
      if (searchTextInput.value && searchTextInput.value) {
        await nextTick();
        searchTextInput.value.focus();
      }
    }
  }
});

// We fetched the image ID on the server side, but we need to wait to do
// reactive things until the client loads the page, otherwise we'll get a
// hydration mismatch.
onMounted(() => {
  detectBrowser();
  getImage(fetchGenResult);
});

/**
 * Scroll to the currently selected search result item.
 */
function scrollToSelected() {
  const selector = `#resultItemList li:nth-child(${highlightIndex.value + 1})`;
  const selected = document.querySelector(selector);
  if (selected) {
    selected.scrollIntoView(false);
  } else {
    console.error(
      `Tried to scroll to result ${highlightIndex.value} but couldn't find it with selector "${selector}"`,
    );
  }
}

/**
 * Handle keyboard inputs to the search box.
 *
 * Up/down arrow keys change the highlighted item. Enter submits the highlighted
 * item. Ctrl or Alt + number submits that numbered entry.
 * @param event Keyboard event.
 */
function handleKey(event: KeyboardEvent) {
  let submitIndex = null;
  if (event.ctrlKey && event.key === "u") {
    searchInput.value = "";
  } else if (event.ctrlKey || event.altKey) {
    if (event.key >= "1" && event.key <= "9") {
      const index = event.key.charCodeAt(0) - "1".charCodeAt(0);
      if (searchResults.value.length > index) {
        highlightIndex.value = index;
        submitIndex = index;
      } else {
        readout("readout.entry_select_fail", { number: event.key });
      }
    }
  } else if (event.key === "Enter") {
    submitIndex = searchResults.value.length > 0 ? highlightIndex.value : -1;
  } else {
    switch (event.key) {
      case "ArrowDown":
        if (highlightIndex.value < searchResults.value.length - 1) {
          ++highlightIndex.value;
          scrollToSelected();
        }
        event.preventDefault();
        break;
      case "ArrowUp":
        if (highlightIndex.value > 0) {
          --highlightIndex.value;
          scrollToSelected();
        }
        event.preventDefault();
        break;
      default:
        // Regular text input; reset to beginning.
        highlightIndex.value = 0;
    }
  }

  if (submitIndex !== null) {
    submitAnswer(submitIndex);
  }
}

/**
 * Highlight search result item when moused over.
 * @param index Search result index to highlight.
 */
function changeHighlightedIndex(index: number) {
  highlightIndex.value = index;
}

/**
 * Submits an answer to the server and checks if it's correct.
 * @param index Search result index to submit.
 */
async function submitAnswer(index: number) {
  if (index < -1 || index >= searchResults.value.length) {
    throw new RangeError(`Index ${index} out of range`);
  }
  waitingForGuess.value = false;
  answerIsLoading.value = true;
  document.body.style.cursor = "wait";
  const found = searchResults.value[index];
  const item = found ? found.item : { season: -1, episode: -1, fullName: "?" };
  const { data, error } = await useFetch(`/api/frame/check/${imageId.value}`, {
    query: { season: item.season, episode: item.episode },
  });

  if (error && error.value) {
    if (error.value.statusCode === 404) {
      readout("readout.answer_not_found");
    } else if (error.value.statusCode === 429) {
      readout("readout.rate_limit");
    } else if (error.value.message.startsWith("NetworkError")) {
      readout("readout.network_error");
    } else {
      readout("readout.answer_error", { error: error.value.message });
    }
  } else if (data && data.value) {
    ++totalCounter.value;
    const correct = data.value.correct;
    const seekTimeSec = data.value.seekTime;
    const minute = seekTimeSec ? Math.floor(seekTimeSec / 60) : -1;
    const second = floatIntPartPad(
      seekTimeSec ? Math.floor((seekTimeSec % 60) * 1000) / 1000 : -1,
    );
    if (index < 0) {
      const correctSeason = data.value.season;
      const correctEpisode = data.value.episode;
      const correctItem = episodeData.value.find(
        (ep) => ep.season === correctSeason && ep.episode === correctEpisode,
      );
      readout({
        type: "skipped",
        answer: {
          fullName: `${correctItem?.fullName} @ ${minute}:${second}`,
          season: correctSeason,
          episode: correctEpisode,
        },
      });
      streakCounter.value = 0;
    } else if (correct) {
      readout({
        type: "correct",
        answer: {
          fullName: `${item.fullName} @ ${minute}:${second}`,
          season: item.season,
          episode: item.episode,
        },
      });
      ++correctCounter.value;
      ++streakCounter.value;
    } else {
      const correctSeason = data.value.season;
      const correctEpisode = data.value.episode;
      const correctItem = episodeData.value?.find(
        (ep) => ep.season === correctSeason && ep.episode === correctEpisode,
      );
      readout({
        type: "incorrect",
        guess: {
          fullName: item.fullName,
          season: item.season,
          episode: item.episode,
        },
        answer: {
          fullName: `${correctItem?.fullName} @ ${minute}:${second}`,
          season: correctSeason,
          episode: correctEpisode,
        },
      });
      streakCounter.value = 0;
    }
  } else {
    readout("readout.unknown_error");
  }

  searchInput.value = "";
  answerIsLoading.value = false;
  document.body.style.cursor = "unset";
  if (newFrameButton.value && newFrameButton.value) {
    await nextTick();
    newFrameButton.value.focus();
  }
}

/**
 * Checks if the frame is expired and warns the user if it may be.
 */
function warnIfFrameMayBeExpired() {
  if (
    browser.value?.name !== "firefox" &&
    (cleanedUpFrame.value ||
      Date.now() - imageLoadTimestamp.value >
        config.public.frameExpiryMs - 1000)
  ) {
    readout("readout.save_maybe_expired");
    // Doesn't prevent default, so we still try saving. The image not have been
    // cleaned up yet, or the browser might be one that doesn't redownload it.
  }
}
</script>

<style scoped>
.fuzzyInput {
  padding: 8px;
}

ol.resultItemList {
  list-style: none;
  counter-reset: searchCounter;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: row wrap;
}
ol.resultItemList li {
  counter-increment: searchCounter;
  flex: 1 1 350px;
}
ol.resultItemList li:nth-child(-n + 9):before {
  content: "Alt-" counter(searchCounter) " ";
  color: #888;
}
ol.resultItemList.ctrlKey li:nth-child(-n + 9):before {
  /* Firefox is the odd one out that binds Alt-N to switch to tab N. */
  content: "Ctrl-" counter(searchCounter) " ";
}

@media screen and (hover: none) {
  li:before {
    /* Hide keyboard shortcut hints on mobile. There is no media query for
     * detecting a physical keyboard, therefore we approximate by detecting
     * whether there is a mouse/fine pointing device. */
    content: "" !important;
    margin-right: 0 !important;
  }
}

#inputRow {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

#searchInput {
  flex: 1 1 auto;
  padding: 8px;
  box-sizing: border-box;
  max-width: 100%;
}

#synopsisCheckboxContainer {
  /* Group checkbox and label so they break on the same line. */
  display: inline-block;
  flex: 0 0 auto;
}

#logo {
  margin: 0;
}

.logoBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 10px;
}

#readouts {
  min-height: 3em;
  margin-bottom: 0.2em;
}

#bigButtonRow {
  flex: 1 content;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  max-width: 100%;
}

#bigButtonRow button,
#bigButtonRow a {
  flex: 1 content;
  font-weight: bold;
}

#bigButtonRow a > button {
  width: 100%;
}

button {
  padding: 1em;
}

button:focus {
  background-color: #ccc;
  border-radius: default;
}

.buttonWithSpinner {
  position: relative;
}

.buttonWithSpinnerText {
  margin: auto;
}

.loading .buttonWithSpinnerText {
  visibility: hidden;
}

.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  border: 8px solid transparent;
  border-top-color: black;
  border-radius: 50%;
  animation: loading-spinner 1s ease infinite;
}

@keyframes loading-spinner {
  from {
    transform: rotate(0turn);
  }
  to {
    transform: rotate(1turn);
  }
}

#languageSelectWrapper {
  margin-left: auto;
}

.disabledAnchor {
  pointer-events: none;
}
</style>
