<template>
  <div id="main">
    <div id="input">
      <FuzzyInput />
    </div>
    <div id="image">
      <RandomImage />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
}

#main {
  background-color: white;
  display: flex;
  flex-direction: row;
  margin: 4px;
  align-items: stretch;
  align-content: stretch;
}

#input {
  overflow-y: auto;
  background-color: gainsboro;
  width: 100%;
  height: 98vh;
  flex: 1 0 400px;
  padding: 1px;
  border: 1px solid black;
}

#image {
  width: 100%;
  flex: 3 0 80%;
  padding: 1px;
  border: 1px solid black;
  height: 98vh;
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
