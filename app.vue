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
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
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
  max-width: 500px;
  height: 100%;
  flex: 1 3 30%;
  padding: 0;
  margin: 0;
}

#imagepane {
  flex: 10 0 60%;
}

@media screen and (max-width: 1000px) {
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
