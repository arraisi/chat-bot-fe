<template>
  <div class="chat-container">
    <!-- Sidebar -->
    <div class="chat-sidebar-container">
      <ChatSidebar
        :chat-sessions="chatSessions"
        :current-session-id="currentSessionId"
        @delete-session="deleteSession"
        @new-chat="createNewSession"
        @switch-session="switchToSession"
      />
    </div>

    <!-- Main Chat Area -->
    <div class="chat-main">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="d-flex align-center pa-4">
          <v-avatar size="32" class="me-2">
            <v-icon color="primary">mdi-robot</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="chat-title">{{ currentSession?.title || 'Chat Bot' }}</div>
            <div class="chat-subtitle text-caption">AI Assistant</div>
          </div>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="createNewSession"
          />
        </div>
        <v-divider />
      </div>

      <!-- Chat Messages - Scrollable -->
      <div class="chat-messages-container">
        <div class="chat-messages pa-4">
          <div v-if="messages.length === 0" class="empty-state">
            <v-icon size="64" color="primary" class="mb-4">mdi-robot</v-icon>
            <h3 class="mb-2">Start a conversation</h3>
            <p class="text-body-2 text-medium-emphasis">Send a message to begin chatting with the AI assistant</p>
          </div>
          
          <div v-else class="messages-list">
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
              class="mb-4"
            />
          </div>
          
          <!-- Auto-scroll anchor -->
          <div ref="messagesEnd" />
        </div>
      </div>

      <!-- Chat Input - Fixed at bottom -->
      <div class="chat-input-container">
        <v-divider />
        <div class="pa-4">
          <ChatInput
            :error="error"
            :is-loading="isLoading"
            @send-message="handleSendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useChat } from '../composables/useChat'

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
} = useChat()

const messagesEnd = ref<HTMLElement>()

// Auto-scroll to bottom when new messages arrive
const scrollToBottom = async () => {
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

// Watch for new messages and scroll to bottom
watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  },
)

// Handle sending messages
const handleSendMessage = async (message: string) => {
  await sendMessageMock(message) // Change to sendMessage when you have real API
  scrollToBottom()
}

// Initialize the chat system
onMounted(() => {
  initialize()
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: rgb(var(--v-theme-background));
}

.chat-sidebar-container {
  width: 280px;
  height: 100vh;
  flex-shrink: 0;
  background-color: rgb(var(--v-theme-surface));
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: rgb(var(--v-theme-background));
}

.chat-header {
  flex-shrink: 0;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.chat-title {
  font-weight: 600;
  font-size: 18px;
  color: rgb(var(--v-theme-on-surface));
}

.chat-subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
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
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
}

.messages-list {
  padding-bottom: 20px;
}

.chat-input-container {
  flex-shrink: 0;
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

.chat-input-container .pa-4 {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .chat-sidebar-container {
    position: fixed;
    left: -280px;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .chat-sidebar-container.open {
    left: 0;
  }
  
  .chat-main {
    width: 100%;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background-color: rgb(18, 18, 18);
  }
}
</style>
