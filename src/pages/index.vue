<template>
  <div class="app-container">
    <ChatInterface />
  </div>
</template>

<script lang="ts" setup>
  // Explicit import as fallback for auto-import issues
  import ChatInterface from '../components/ChatInterface.vue';
</script>

<style scoped>
  .app-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
