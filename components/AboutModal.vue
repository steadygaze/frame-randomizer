<template>
  <section v-if="show" class="modalContainer">
    <div class="aboutLine">
      <h2>About</h2>
      <button @click="$emit('close')">X</button>
    </div>
    <h3>Instructions</h3>
    <p>
      This site generates and shows a completely random frame<span
        v-if="showName"
        >{{ " from " + showName }}</span
      >, selecting from all episodes with equal probability. Play a guessing
      game to test your trivia knowledge, or just enjoy the generated frames.
    </p>

    <ul>
      <li>
        To provide a guess, type at least
        {{ config.public.fuzzySearchMinMatchLength }} characters in the search
        box to fuzzily search episode names and descriptions. Keep typing until
        the desired episode is at the top, or use the
        <code>up/down arrow keys</code> plus <code>Enter</code>, the mouse, or
        <code>Ctrl + number</code> or <code>Alt + number</code> to select a
        specific entry.
      </li>
      <li>
        The "Use synopsis" checkbox can be used to enable or disable showing and
        searching the episode descriptions.
      </li>
      <li>
        You can also search by season and episode number by entering a query
        like <code>s2e3</code> or <code>2x3</code>.
      </li>
      <li>
        In addition to the skip button, if you want to skip guessing, either
        because you're stumped or you just want to enjoy the frames being
        generated, you can submit an empty input to the search box.
      </li>
      <li>
        Images are destroyed as soon as they're loaded, so reloading an image
        (using the refresh function or something else that bypasses your
        browser's cache) won't work. When you find a frame worth saving, you can
        still right click and save an image normally.
      </li>
      <li>
        The font size in the input pane follows from your browser's defaults. If
        you want it to be larger, for example, when presenting or streaming, you
        can zoom in without impacting the page layout too much.
      </li>
    </ul>
    <section
      v-if="config.public.instanceInfoHtml || config.public.instanceInfoText"
    >
      <h3>Instance information</h3>
      <p class="grayedText">
        (The instance operator has provided the following information specific
        to this instance.)
      </p>
      <!-- eslint-disable vue/no-v-html -- Provided by instance operator. -->
      <p
        v-if="config.public.instanceInfoHtml"
        v-html="config.public.instanceInfoHtml"
      ></p>
      <p v-if="config.public.instanceInfoText">
        {{ config.public.instanceInfoText }}
      </p>
    </section>
    <h3>Licensing information</h3>
    <p>
      This site
      <span v-if="config.public.instanceName"
        >({{ config.public.instanceName }})</span
      >
      is running an instance of
      <a :href="originalSourceUrl"><code>frame-randomizer</code></a>
      <code>(v{{ config.public.softwareVersion }})</code>. Know your rights!
      This software is provided to you under the terms of the
      <a href="https://www.gnu.org/licenses/agpl-3.0.html"
        >Affero GNU Public License 3.0 (AGPLv3)</a
      >. That means you, the user, have a right to access a copy of its source
      code, including the code run by this instance, if a modified version is
      running.
      <span v-if="modifiedSource">
        You can find a copy of the code for this instance
        <a :href="config.public.sourceCodeUrl">here</a>.
      </span>
      <span v-else class="grayedText">
        (The instance operator did not provide an instance-specific source code
        URL, and therefore attests that their server software is unmodified.)
      </span>
    </p>
    <p>
      With some setup work and technical knowledge, you can even run an instance
      of the server on your own computer, either to play with a show that has no
      existing instance for it, to set up your own instance for others to use,
      or to play locally without the network latency involved in serving the
      images.
    </p>
    <p>
      Note that this software is agnostic of what show is randomized from. The
      content served is the instance operator's sole responsibility. If you have
      concerns about the content served by an instance, contact the operator of
      that instance and not the maintainers of the software.
    </p>
    <section v-if="config.public.attributeTmdb">
      <h3>TMDB attribution</h3>
      <p>
        <em>
          This product uses the
          <a href="https://developer.themoviedb.org/docs">TMDB API</a> but is
          not endorsed or certified by
          <a href="https://www.themoviedb.org/">TMDB</a>.
        </em>
      </p>
      <a href="https://www.themoviedb.org">
        <img src="/tmdb_logo.svg" alt="TMDB logo"
      /></a>
      <p>
        Episode data, such as names and descriptions, was sourced from TMDB for
        use in this instance.
      </p>
    </section>
    <button @click="$emit('close')">Okay</button>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "#app";
import { useShowDataStore } from "~~/store/showDataStore";

const store = useShowDataStore();
const { showName } = storeToRefs(store);

const originalSourceUrl = "https://github.com/steadygaze/frame-randomizer";
const config = useRuntimeConfig();
const modifiedSource =
  config.public.sourceCodeUrl &&
  config.public.sourceCodeUrl !== originalSourceUrl;

defineProps<{
  show: boolean;
}>();
defineEmits<{ (e: "close"): void }>();
</script>

<style scoped>
.modalContainer {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  border: 8px solid #555;
  margin: auto;
  padding: 1em;
  max-width: 80ch;
  background-color: white;
  text-align: justify;
  max-height: 100vh;
  overflow-y: auto;
}

button {
  padding: 0.5em 1em;
}

ul {
  padding-left: 1.4em;
}

.grayedText {
  color: #555;
}

.aboutLine {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aboutLine button {
  align-self: flex-end;
}
.aboutLine h2 {
  margin: 6px 0 0 0;
}
</style>
