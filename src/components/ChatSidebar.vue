<template>
  <div class="chat-sidebar">
    <!-- Header with New Chat Button -->
    <div class="sidebar-header">
      <v-list-item class="pa-4">
        <v-btn
          block
          color="primary"
          prepend-icon="mdi-plus"
          text="New Chat"
          variant="flat"
          @click="$emit('new-chat')"
        />
      </v-list-item>
    </div>

    <v-divider />

    <!-- Chat History - Scrollable -->
    <div class="sidebar-content">
      <v-list density="comfortable" nav>
        <v-list-subheader class="text-primary font-weight-medium">
          <v-icon start>mdi-history</v-icon>
          Chat History
        </v-list-subheader>

        <template v-if="chatSessions.length > 0">
          <v-list-item
            v-for="session in chatSessions"
            :key="session.id"
            :active="currentSessionId === session.id"
            :value="session.id"
            class="chat-session-item mb-1"
            rounded="lg"
            @click="$emit('switch-session', session.id)"
          >
            <template #prepend>
              <v-icon size="20">mdi-chat-outline</v-icon>
            </template>

            <v-list-item-title class="text-truncate font-weight-medium">
              {{ session.title }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption">
              {{ formatDate(session.updatedAt) }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn icon size="small" variant="text" color="error" @click.stop="$emit('delete-session', session.id)">
                <v-icon size="16">mdi-trash-can-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">Delete Chat</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
        </template>

        <v-list-item v-else class="text-center py-8">
          <div class="text-center w-100">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-chat-plus-outline</v-icon>
            <div class="text-body-2 text-medium-emphasis">No chat history yet</div>
            <div class="text-caption text-disabled">Start a new conversation</div>
          </div>
        </v-list-item>
      </v-list>
    </div>

    <!-- Footer with User Info -->
    <div class="sidebar-footer">
      <v-divider />
      <v-list-item class="pa-4">
        <template #prepend>
          <v-avatar size="36" color="primary">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">User</v-list-item-title>
        <v-list-item-subtitle>Free Plan</v-list-item-subtitle>

        <template #append>
          <v-btn icon size="small" variant="text">
            <v-icon>mdi-cog</v-icon>
            <v-tooltip activator="parent" location="top">Settings</v-tooltip>
          </v-btn>
        </template>
      </v-list-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ChatSession } from '../types/chat';

  interface Props {
    chatSessions: ChatSession[];
    currentSessionId: string | null;
  }

  interface Emits {
    'new-chat': [];
    'switch-session': [sessionId: string];
    'delete-session': [sessionId: string];
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const formatDate = (date: Date | string | number) => {
    // Convert to Date object if it's not already
    const dateObj = new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown';
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };
</script>

<style scoped>
  .chat-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: rgb(var(--v-theme-surface));
  }

  .sidebar-header {
    flex-shrink: 0;
    background-color: rgb(var(--v-theme-surface));
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--v-theme-outline)) transparent;
  }

  .sidebar-content::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-content::-webkit-scrollbar-thumb {
    background-color: rgb(var(--v-theme-outline));
    border-radius: 3px;
  }

  .sidebar-content::-webkit-scrollbar-thumb:hover {
    background-color: rgb(var(--v-theme-outline-variant));
  }

  .sidebar-footer {
    flex-shrink: 0;
    background-color: rgb(var(--v-theme-surface-variant));
  }

  .chat-session-item {
    transition: all 0.2s ease;
    margin: 0 8px 4px 8px;
  }

  .chat-session-item:hover {
    background-color: rgb(var(--v-theme-surface-variant)) !important;
  }

  .chat-session-item.v-list-item--active {
    background-color: rgb(var(--v-theme-primary-lighten-5)) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }

  .chat-session-item.v-list-item--active .v-list-item-title {
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600;
  }

  .chat-session-item.v-list-item--active .v-icon {
    color: rgb(var(--v-theme-primary)) !important;
  }

  /* Light theme specific adjustments */
  :deep(.v-list-subheader) {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 0.75rem;
  }

  :deep(.v-list-item-subtitle) {
    opacity: 0.7;
  }

  /* Smooth hover effects */
  .chat-session-item :deep(.v-btn) {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .chat-session-item:hover :deep(.v-btn) {
    opacity: 1;
  }

  .chat-session-item.v-list-item--active :deep(.v-btn) {
    opacity: 1;
  }
</style>
