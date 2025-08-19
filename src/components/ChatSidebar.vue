<template>
  <div class="chat-sidebar">
    <!-- Company Logo -->
    <div class="sidebar-logo">
      <v-list-item class="pa-4">
        <div class="text-center w-100">
          <!-- <h1 class="aiva-logo-text">AIVA</h1> -->
          <img src="../assets/aiva_new_logo.png" alt="AIVA Logo" class="company-logo" />
        </div>
      </v-list-item>
    </div>

    <v-divider color="white" class="custom-divider" />

    <!-- Header with New Chat Button -->
    <div class="sidebar-header">
      <v-list-item class="pa-4">
        <v-btn
          block
          color="white"
          prepend-icon="mdi-plus"
          text="New Chat"
          variant="text"
          class="text-white font-weight-bold mb-2 justify-start"
          @click="$emit('new-chat')"
        />

        <!-- Additional Action Buttons -->
        <v-btn
          block
          color="white"
          prepend-icon="mdi-file-upload-outline"
          text="Upload File"
          variant="text"
          class="text-white font-weight-medium mb-2 justify-start"
          @click="$emit('upload-file')"
        />
        <!-- 
        <v-btn
          block
          color="white"
          prepend-icon="mdi-magnify"
          text="Search"
          variant="text"
          class="text-white font-weight-medium mb-2 justify-start"
          @click="$emit('search-chat')"
        /> -->
      </v-list-item>
    </div>

    <v-divider color="white" class="custom-divider" />

    <!-- Chat History - Scrollable -->
    <div class="sidebar-content">
      <v-list density="comfortable" nav class="text-white">
        <v-list-subheader class="text-white font-weight-bold text-uppercase">
          <v-icon start color="white">mdi-history</v-icon>
          Chat History
        </v-list-subheader>

        <template v-if="chatSessions.length > 0">
          <v-list-item
            v-for="session in chatSessions"
            :key="session.id"
            :active="currentSessionId === session.id"
            :value="session.id"
            class="chat-session-item mb-1 text-white"
            rounded="lg"
            @click="$emit('switch-session', session.id)"
          >
            <template #prepend>
              <v-icon size="20" color="white">mdi-chat-outline</v-icon>
            </template>

            <v-list-item-title class="text-truncate font-weight-medium text-white">
              {{ session.title }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption text-white" style="opacity: 0.8">
              <div class="d-flex align-center justify-space-between">
                <span>{{ formatDate(session.lastActivityAt || session.updatedAt) }}</span>
                <div class="d-flex align-center gap-2">
                  <v-chip v-if="session.authority" size="x-small" color="white" variant="outlined" class="text-white">
                    {{ session.authority }}
                  </v-chip>
                  <span v-if="session.messageCount" class="text-caption"> {{ session.messageCount }} msgs </span>
                </div>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <v-btn icon size="small" variant="text" @click.stop="$emit('delete-session', session.id)">
                <v-icon size="16" color="white">mdi-trash-can-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">Delete Chat</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
        </template>

        <v-list-item v-else class="text-center py-8">
          <div class="text-center w-100">
            <v-icon size="48" color="white" class="mb-2" style="opacity: 0.6">mdi-chat-plus-outline</v-icon>
            <div class="text-body-2 text-white" style="opacity: 0.8">No chat history yet</div>
            <div class="text-caption text-white" style="opacity: 0.6">Start a new conversation</div>
          </div>
        </v-list-item>
      </v-list>
    </div>

    <!-- Footer with User Info -->
    <div class="sidebar-footer">
      <v-divider color="white" class="custom-divider" />
      <v-list-item class="pa-4">
        <template #prepend>
          <v-avatar size="36" color="primary">
            <v-icon color="background">mdi-account</v-icon>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium text-white">User</v-list-item-title>
        <v-list-item-subtitle class="text-white" style="opacity: 0.8">Welcome Back!</v-list-item-subtitle>

        <!-- <template #append>
          <v-btn icon size="small" variant="text">
            <v-icon color="white">mdi-cog</v-icon>
            <v-tooltip activator="parent" location="top">Settings</v-tooltip>
          </v-btn>
        </template> -->
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
    'upload-file': [];
    'search-chat': [];
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
    background-color: rgb(var(--v-theme-background));
  }

  .sidebar-logo {
    flex-shrink: 0;
    background-color: rgb(var(--v-theme-background));
    padding: 16px 0;
  }

  .company-logo {
    max-width: 180px;
    max-height: 50px;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .aiva-logo-text {
    color: white;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 2px;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .sidebar-header {
    flex-shrink: 0;
    background-color: rgb(var(--v-theme-background));
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
    background-color: rgb(var(--v-theme-background));
  }

  /* Custom divider styling */
  .custom-divider {
    width: calc(100% - 32px) !important;
    margin: 0 16px !important;
  }

  .chat-session-item {
    transition: all 0.2s ease;
    margin: 0 8px 4px 8px;
  }

  /* Chat Session Item Hover State */
  .chat-session-item:hover {
    background-color: rgba(211, 152, 231, 1) !important;
  }

  /* Chat Session Item Active State */
  .chat-session-item.v-list-item--active {
    background-color: rgba(211, 152, 231, 1) !important;
    color: white !important;
  }

  /* Ensure text stays white on hover and active */
  .chat-session-item:hover .v-list-item-title,
  .chat-session-item.v-list-item--active .v-list-item-title {
    color: white !important;
    font-weight: 600;
  }

  .chat-session-item:hover .v-list-item-subtitle,
  .chat-session-item.v-list-item--active .v-list-item-subtitle {
    color: white !important;
    opacity: 0.9;
  }

  .chat-session-item:hover .v-icon,
  .chat-session-item.v-list-item--active .v-icon {
    color: white !important;
  }

  /* New Chat Button Hover */
  .sidebar-header .v-btn:hover {
    background-color: rgba(211, 152, 231, 1) !important;
  }

  /* Upload File and Search Button Hover */
  .sidebar-header .v-btn.v-btn--block:hover {
    background-color: rgba(211, 152, 231, 1) !important;
  }

  /* Footer user info hover */
  /* .sidebar-footer .v-list-item:hover {
    background-color: rgba(211, 152, 231, 1) !important;
  }

  .sidebar-footer .v-btn:hover {
    background-color: rgba(211, 152, 231, 1) !important;
  } */

  /* Delete button hover - keep visible on hover */
  .chat-session-item:hover .v-btn,
  .chat-session-item.v-list-item--active .v-btn {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  .chat-session-item .v-btn:hover {
    background-color: rgba(244, 67, 54, 0.8) !important;
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

  /* Override Vuetify's default hover states */
  :deep(.chat-session-item.v-list-item:hover) {
    background-color: rgba(211, 152, 231, 1) !important;
  }

  :deep(.chat-session-item.v-list-item.v-list-item--active) {
    background-color: rgba(211, 152, 231, 1) !important;
  }

  /* Ensure proper text contrast on the secondary color background */
  :deep(.chat-session-item:hover *),
  :deep(.chat-session-item.v-list-item--active *) {
    color: white !important;
  }
</style>
