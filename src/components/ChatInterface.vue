<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="1" color="primary" dark>
      <!-- Sidebar Toggle Button -->
      <v-app-bar-nav-icon @click="sidebarOpen = !sidebarOpen" />

      <!-- App Bar Title -->
      <v-toolbar-title class="d-flex align-center">
        <div class="d-flex align-center">
          <v-avatar size="32" class="me-2">
            <v-icon>mdi-robot</v-icon>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ currentSession?.title || 'Chat Bot' }}</div>
            <div class="text-caption opacity-80">AI Assistant</div>
          </div>
        </div>
      </v-toolbar-title>

      <v-spacer />

      <!-- App Bar Actions -->
      <v-btn icon @click="createNewSession">
        <v-icon>mdi-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">New Chat</v-tooltip>
      </v-btn>

      <v-btn icon @click="createNewSession">
        <v-icon>mdi-refresh</v-icon>
        <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
        <v-tooltip activator="parent" location="bottom">More options</v-tooltip>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer (Collapsible Sidebar) -->
    <v-navigation-drawer v-model="sidebarOpen" width="280" elevation="1">
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
    background-color: rgb(var(--v-theme-surface));
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
    z-index: 1001;
  }

  :deep(.v-navigation-drawer) {
    z-index: 1000;
  }

  /* Ensure proper spacing in light theme */
  :deep(.v-main) {
    background-color: rgb(var(--v-theme-background));
  }
</style>
