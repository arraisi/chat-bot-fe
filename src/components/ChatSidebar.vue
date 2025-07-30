<template>
  <div class="chat-sidebar">
    <!-- Header -->
    <div class="sidebar-header pa-4">
      <v-btn block color="primary" prepend-icon="mdi-plus" text="New Chat" variant="tonal" @click="$emit('new-chat')" />
    </div>

    <v-divider />

    <!-- Chat History - Scrollable -->
    <div class="sidebar-content">
      <v-list class="pa-2">
        <v-list-subheader>Chat History</v-list-subheader>

        <v-list-item
          v-for="session in chatSessions"
          :key="session.id"
          :active="currentSessionId === session.id"
          class="chat-session-item mb-1"
          rounded="lg"
          @click="$emit('switch-session', session.id)"
        >
          <template #prepend>
            <v-icon>mdi-chat</v-icon>
          </template>

          <v-list-item-title class="text-truncate">
            {{ session.title }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ formatDate(session.updatedAt) }}
          </v-list-item-subtitle>

          <template #append>
            <v-btn icon="mdi-delete" size="small" variant="text" @click.stop="$emit('delete-session', session.id)" />
          </template>
        </v-list-item>

        <v-list-item v-if="chatSessions.length === 0" class="text-center text-disabled">
          No chat history yet
        </v-list-item>
      </v-list>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer pa-4">
      <v-divider class="mb-4" />
      <div class="d-flex align-center">
        <v-avatar size="32" class="me-2">
          <v-icon>mdi-account</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-body-2 font-weight-medium">User</div>
          <div class="text-caption text-medium-emphasis">Free Plan</div>
        </div>
        <v-btn icon="mdi-cog" size="small" variant="text" />
      </div>
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
    border-right: 1px solid rgb(var(--v-theme-outline-variant));
  }

  .sidebar-header {
    flex-shrink: 0;
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

  .sidebar-footer {
    flex-shrink: 0;
    background-color: rgb(var(--v-theme-surface-variant));
  }

  .chat-session-item {
    transition: all 0.2s ease;
  }

  .chat-session-item:hover {
    background-color: rgb(var(--v-theme-surface-variant)) !important;
  }

  .chat-session-item.v-list-item--active {
    background-color: rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
</style>
