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

<style>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  background-color: black;
  overflow: hidden; /* No page-level scrollbars. */
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
  overflow-y: scroll; /* Otherwise scrollbar appears/disappears as searches happen, which is distracting. */
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
