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

<style scoped>
#main {
  display: flex;
  flex-direction: row;
}

#input {
  width: 100%;
  max-width: 40rem;
}

#image {
  width: 100%;
  flex-grow: 2;
}
</style>
