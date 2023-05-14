<template>
  <div id="main">
    <div id="inputpane">
      <FuzzyInput />
    </div>
    <div id="imagepane">
      <RandomImage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from "#app";

const config = useRuntimeConfig();
useHead({
  title: config.public.instanceName,
  meta: [{ name: "description", content: config.public.metaDescription }],
});
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
  background-color: white;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  align-items: stretch;
  justify-content: stretch;
}

#inputpane {
  overflow-y: auto;
  background-color: #eee;
  width: 100%;
  max-width: 500px;
  min-width: 200px;
  height: 100%;
  flex: 1 3 20%;
  padding: 0;
  margin: 0;
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
