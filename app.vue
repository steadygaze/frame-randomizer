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

<style>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
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
}

#inputpane {
  overflow-y: auto;
  background-color: #eee;
  width: 100%;
  height: 100%;
  flex: 1 0 400px;
  padding: 0;
  margin: 0;
}

#imagepane {
  flex: 3 0 80%;
  padding: 4px;
}

@media screen and (max-width: 800px) {
  #main {
    flex-direction: column;
  }
  #input {
    height: 200px;
    max-height: 50vh;
    flex: none;
  }
}
</style>
