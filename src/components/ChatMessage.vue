<template>
  <v-card class="message-bubble" :class="messageClass" elevation="1">
    <v-card-text class="py-2 px-3">
      <div class="d-flex align-center">
        <v-avatar class="me-2" size="24">
          <v-icon v-if="message.role === 'user'" color="primary">
            mdi-account
          </v-icon>
          <v-icon v-else color="secondary">
            mdi-robot
          </v-icon>
        </v-avatar>
        
        <div class="flex-grow-1">
          <div class="text-caption text-medium-emphasis mb-1">
            {{ message.role === 'user' ? 'You' : 'Assistant' }}
          </div>
          
          <div v-if="message.isTyping" class="typing-indicator">
            <span>Typing</span>
            <div class="typing-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
          
          <div v-else class="message-content">
            {{ message.content }}
          </div>
          
          <div class="text-caption text-disabled mt-1">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import type { Message } from '../types/chat'

  interface Props {
    message: Message
  }

  const props = defineProps<Props>()

  const messageClass = computed(() => ({
    'user-message': props.message.role === 'user',
    'assistant-message': props.message.role === 'assistant',
  }))

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
</script>

<style scoped>
.message-bubble {
  max-width: 80%;
  margin-bottom: 12px;
}

.user-message {
  margin-left: auto;
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.assistant-message {
  margin-right: auto;
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  animation: typing 1.5s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}
</style>
