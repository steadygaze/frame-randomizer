<template>
  <section v-if="show" class="modalContainer">
    <div class="aboutLine">
      <h2>About</h2>
      <button @click="$emit('close')">X</button>
    </div>
    <h3>Instructions</h3>
    <p>
      This site generates and shows a completely random frame<span
        v-if="config.public.mediaName"
        >{{ " from " + config.public.mediaName }}</span
      >, selecting from all episodes with equal probability. Play a guessing
      game to test your trivia knowledge, or just enjoy the generated frames.
    </p>
    <p>
      To provide a guess, type at least three characters in the search box to
      fuzzily search episode names and descriptions. Keep typing until the
      desired episode is at the top, or use the <code>arrow keys</code> plus
      <code>Enter</code>, the mouse, or <code>Ctrl + number</code> or
      <code>Alt + number</code> to select a specific entry. The "Use synopsis"
      checkbox can be used to enable or disable showing and searching the
      episode descriptions.
    </p>
    <p>
      If you'd rather not guess and instead just enjoy the frames being
      generated, simply press <code>Enter</code> with the search box selected to
      submit an empty input.
    </p>
    <section
      v-if="config.public.instanceInfoHtml || config.public.instanceInfoText"
    >
      <h3>Instance information</h3>
      <p>
        The instance operator has provided the following information specific to
        this instance.
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
      <a :href="originalSourceUrl"><code>frame-randomizer</code></a
      >. Know your rights! This software is provided to you under the terms of
      the Affero GNU Public License 3.0 (AGPLv3). That means you, the user, have
      a right to access a copy of its source code, including the modified
      version, if a modified version of the original is running.
      <span v-if="modifiedSource">
        You can find a copy of the code for this instance
        <a :href="sourceCodeUrl">here</a>.
      </span>
      <span v-else id="modifiedSourceDisclaimer">
        (The instance operator did not provide an instance-specific source code
        URL, and therefore attests that their server software is unmodified.)
      </span>
    </p>
    <p>
      With some degree of setup work and technical knowledge, you can even run
      an instance of the server on your own computer, either to play with a show
      that has no existing instance for it, to set up your own instance for
      others to use, or to play locally without the network latency involved in
      serving the images.
    </p>
    <p>
      Note that this software is agnostic of what show is randomized from. The
      content served is the instance operator's sole responsibility. If you have
      concerns about the content served by an instance, contact the operator of
      that instance and not the maintainers of the software.
    </p>
    <button @click="$emit('close')">Okay</button>
  </section>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from "#app";
import { ref } from "vue";

const originalSourceUrl = "https://github.com/steadygaze/frame-randomizer/";
const config = useRuntimeConfig();
const sourceCodeUrl = ref(config.public.sourceCodeLink || originalSourceUrl);
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

#modifiedSourceDisclaimer {
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
