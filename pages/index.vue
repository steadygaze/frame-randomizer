<template>
  <div id="main">
    <div id="inputpane">
      <FuzzyInput />
    </div>
    <div v-if="resourceType === 'frame'" id="imagepane">
      <RandomImage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGameModeStore } from "~~/store/gameModeStore";

const gameModeStore = useGameModeStore();
const { resourceType } = storeToRefs(gameModeStore);
</script>

<style lang="scss">
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  background-color: black;
  /* No page-level scrollbars. */
  overflow: hidden;
}

body > * {
  /* The parent div that Nuxt adds. */
  height: 100%;
  width: 100%;
}

#main {
  background-color: #eee;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  align-items: stretch;
  justify-content: stretch;
}

#inputpane {
  /* Otherwise scrollbar appears/disappears as searches happen, which is distracting. */
  overflow-y: scroll;
  background-color: #eee;
  width: 100%;
  max-width: 33vw;
  min-width: 12.5em;
  height: 100%;
  flex: 1 3 24rem;
  padding: 0;
  margin: 0 auto;
}

#imagepane {
  flex: 10 0 60%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  background-color: black;
}

@mixin theme-styles(
  $base-color,
  $text-color,
  $text-accent-color,
  $text-correct-color,
  $text-incorrect-color,
  $border-color,
  $active-color,
  $disabled-color
) {
  .grayed,
  .skipped {
    color: $text-accent-color;
  }

  .correct {
    color: $text-correct-color;
  }

  .incorrect {
    color: $text-incorrect-color;
  }

  #main,
  #inputpane {
    background-color: $base-color;
  }

  .modalContainer,
  input,
  select {
    background-color: $base-color;
    border-color: $border-color;
    color: $text-color;
    border-radius: 4px;
  }

  input,
  select {
    /* Set separately to not override modal border. */
    border: 1px solid $border-color;
  }

  button {
    color: $text-color;
    background-color: $base-color;
    border: 1px solid $border-color;
    border-radius: 4px;
  }

  button:hover,
  button:focus,
  button:active {
    background-color: $active-color;
  }

  button:disabled {
    background-color: $disabled-color;
  }
}

@mixin dark-styles {
  @include theme-styles(#333, #ccc, #aaa, lawngreen, salmon, #000, #000, #555);
}

@mixin dark-link-styles {
  color: #ddd;

  a {
    color: aquamarine;
  }

  a:active,
  a:hover {
    color: azure;
  }
}

body.theme-default-dark {
  color-scheme: dark;
  @include dark-styles();
  @include dark-link-styles();
}

@media screen and (prefers-color-scheme: dark) {
  body:not(.theme-default-light) {
    color-scheme: dark;
    @include dark-styles();
    @include dark-link-styles();
  }
}

@media screen and (max-aspect-ratio: 12/10) {
  #main {
    flex-direction: column;
  }

  #inputpane {
    max-width: 100%;
    flex: 5 0 40%;
    order: 2;
  }

  #imagepane {
    flex: 1 0 0%;
    order: 1;
  }
}
</style>
