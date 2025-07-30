<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="1" color="white" class="flexible-app-bar" :style="appBarStyle">
      <!-- Sidebar Toggle Button -->
      <v-app-bar-nav-icon color="black" @click="sidebarOpen = !sidebarOpen" />

      <!-- App Bar Title -->
      <v-toolbar-title class="d-flex align-center">
        <div class="d-flex align-center">
          <v-avatar size="32" class="me-2" color="primary">
            <v-icon color="white">mdi-robot</v-icon>
          </v-avatar>
          <div>
            <div class="font-weight-medium text-black">{{ currentSession?.title || 'Chat Bot' }}</div>
            <div class="text-caption text-black" style="opacity: 0.7">AI Assistant</div>
          </div>
        </div>
      </v-toolbar-title>

      <v-spacer />

      <!-- App Bar Actions -->
      <v-btn icon @click="createNewSession">
        <v-icon color="black">mdi-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">New Chat</v-tooltip>
      </v-btn>

      <v-btn icon @click="createNewSession">
        <v-icon color="black">mdi-refresh</v-icon>
        <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
      </v-btn>

      <v-btn icon>
        <v-icon color="black">mdi-dots-vertical</v-icon>
        <v-tooltip activator="parent" location="bottom">More options</v-tooltip>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer (Collapsible Sidebar) - Higher hierarchy -->
    <v-navigation-drawer
      v-model="sidebarOpen"
      width="280"
      elevation="2"
      class="navigation-drawer-priority navigation-drawer-fullheight"
      permanent
      app
    >
      <ChatSidebar
        :chat-sessions="chatSessions"
        :current-session-id="currentSessionId"
        @delete-session="deleteSession"
        @new-chat="createNewSession"
        @switch-session="switchToSession"
      />
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main>
      <div class="chat-main-content">
        <!-- Chat Messages - Scrollable -->
        <div class="chat-messages-container">
          <v-container fluid class="pa-0 h-100">
            <div class="chat-messages pa-4">
              <!-- Empty State -->
              <div v-if="messages.length === 0" class="empty-state">
                <div class="text-center">
                  <v-icon size="80" color="primary" class="mb-4">mdi-robot-excited</v-icon>
                  <h2 class="mb-2 text-h4">Welcome to Chat Bot</h2>
                  <p class="text-body-1 text-medium-emphasis mb-4">
                    Start a conversation with our AI assistant. Ask questions, get help, or just chat!
                  </p>
                  <v-btn color="primary" variant="tonal" @click="createNewSession">
                    <v-icon start>mdi-plus</v-icon>
                    Start New Chat
                  </v-btn>
                </div>
              </div>

              <!-- Messages List -->
              <div v-else class="messages-list">
                <ChatMessage v-for="message in messages" :key="message.id" :message="message" class="mb-4" />
              </div>

              <!-- Auto-scroll anchor -->
              <div ref="messagesEnd" />
            </div>
          </v-container>
        </div>

        <!-- Chat Input - Fixed at bottom -->
        <div class="chat-input-container">
          <v-divider />
          <v-container fluid class="pa-4">
            <ChatInput :error="error" :is-loading="isLoading" @send-message="handleSendMessage" />
          </v-container>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { useChat } from '../composables/useChat';

  const {
    chatSessions,
    currentSession,
    messages,
    isLoading,
    error,
    currentSessionId,
    createNewSession,
    switchToSession,
    deleteSession,
    sendMessageMock, // Change to sendMessage when you have real API
    initialize,
  } = useChat();

  const messagesEnd = ref<HTMLElement>();
  const sidebarOpen = ref(true); // Sidebar open state

  // Computed style for flexible app bar
  const appBarStyle = computed(() => ({
    marginLeft: sidebarOpen.value ? '280px' : '0px',
    width: sidebarOpen.value ? 'calc(100% - 280px)' : '100%',
    transition: 'all 0.3s ease-in-out',
  }));

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = async () => {
    await nextTick();
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth' });
  };

  // Watch for new messages and scroll to bottom
  watch(
    () => messages.value.length,
    () => {
      scrollToBottom();
    }
  );

  // Handle sending messages
  const handleSendMessage = async (message: string) => {
    await sendMessageMock(message); // Change to sendMessage when you have real API
    scrollToBottom();
  };

  // Initialize the chat system
  onMounted(() => {
    initialize();
    scrollToBottom();
  });
</script>

<style scoped>
  .chat-main-content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding-top: 64px; /* Account for app bar height */
  }

  .chat-messages-container {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--v-theme-outline)) transparent;
    background-color: #f5f5f5;
  }

  .chat-messages-container::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-messages-container::-webkit-scrollbar-thumb {
    background-color: rgb(var(--v-theme-outline));
    border-radius: 3px;
  }

  .chat-messages-container::-webkit-scrollbar-thumb:hover {
    background-color: rgb(var(--v-theme-outline-variant));
  }

  .chat-messages {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    min-height: calc(100vh - 200px); /* Ensure enough space for scrolling */
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
  }

  .messages-list {
    padding-bottom: 20px;
  }

  .chat-input-container {
    flex-shrink: 0;
    background-color: white;
    border-top: 1px solid rgb(var(--v-theme-outline-variant));
    position: sticky;
    bottom: 0;
    z-index: 1;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .chat-main-content {
      padding-top: 56px; /* Smaller app bar on mobile */
    }

    .chat-messages {
      padding: 1rem;
    }

    .empty-state {
      min-height: 50vh;
      padding: 1rem;
    }
  }

  /* Vuetify app layout adjustments */
  :deep(.v-app-bar) {
    z-index: 999; /* Lower than navigation drawer */
  }

  :deep(.v-navigation-drawer) {
    z-index: 1000; /* Higher than app bar */
  }

  /* Navigation drawer priority class */
  .navigation-drawer-priority {
    z-index: 1001 !important;
  }

  /* Full height navigation drawer */
  .navigation-drawer-fullheight {
    height: 100vh !important;
    top: 0 !important;
  }

  :deep(.navigation-drawer-fullheight .v-navigation-drawer__content) {
    height: 100vh !important;
  }

  /* Flexible app bar that adjusts to navigation drawer */
  .flexible-app-bar {
    transition: all 0.3s ease-in-out !important;
  }

  /* When navigation drawer is open, adjust app bar */
  :deep(.v-navigation-drawer--active) + .v-main .flexible-app-bar,
  :deep(.v-navigation-drawer.v-navigation-drawer--active) ~ .flexible-app-bar {
    margin-left: 280px !important;
    width: calc(100% - 280px) !important;
  }

  /* When navigation drawer is closed */
  :deep(.v-navigation-drawer:not(.v-navigation-drawer--active)) ~ .flexible-app-bar {
    margin-left: 0 !important;
    width: 100% !important;
  }

  /* Ensure proper spacing in light theme */
  :deep(.v-main) {
    background-color: rgb(var(--v-theme-background));
  }
</style>
