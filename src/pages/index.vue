<template>
  <div class="app-container">
    <ChatInterface v-if="isAuthenticated && isInitialized" />
    <div v-else-if="!isInitialized" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="loading-text">Checking authentication...</p>
    </div>
    <div v-else class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="loading-text">Redirecting to login...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  // Explicit import as fallback for auto-import issues
  import ChatInterface from '../components/ChatInterface.vue';

  const { isAuthenticated, isInitialized, checkAuth } = useAuth();
  const router = useRouter();

  // Watch for initialization completion and handle routing
  watch(
    [isInitialized, isAuthenticated],
    ([initialized, authenticated]) => {
      if (initialized) {
        if (!authenticated) {
          // Use nextTick to avoid immediate redirect issues
          nextTick(() => {
            router.push('/login');
          });
        }
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    // Just check auth state, don't force redirect here
    checkAuth();
  });
</script>

<style scoped>
  .app-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #f8f9fa;
  }

  .loading-text {
    margin-top: 1rem;
    color: #666;
    font-family: 'Manrope', sans-serif;
  }
</style>
