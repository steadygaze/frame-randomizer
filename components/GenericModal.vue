<template>
  <section v-if="show" class="modalContainer">
    <div class="headerLine">
      <h2>{{ header }}</h2>
      <button @click="$emit('close')">X</button>
    </div>
    <hr />
    <slot name="default"></slot>
    <hr />
    <slot name="footer-buttons"></slot>
    <button @click="$emit('close')">{{ $t("about.close") }}</button>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  header: string;
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
  width: min(80ch, 100vw);
  background-color: white;
  text-align: justify;
  max-height: 100vh;
  overflow-y: auto;
}

:deep(button) {
  padding: 0.5em 1em;
}

:deep(ul) {
  padding-left: 1.4em;
}

.headerLine {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.headerLine button {
  align-self: flex-end;
}
.headerLine h2 {
  margin: 6px 0 0 0;
}
</style>
