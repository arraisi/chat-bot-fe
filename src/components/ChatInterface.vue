<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="0" color="white" class="flexible-app-bar" :style="appBarStyle">
      <!-- Sidebar Toggle Button -->
      <v-app-bar-nav-icon color="black" @click="sidebarOpen = !sidebarOpen" />

      <!-- App Bar Title -->
      <v-toolbar-title class="d-flex align-center">
        <div class="d-flex align-center">
          <v-avatar size="32" class="me-2" color="primary">
            <v-icon color="white">mdi-robot</v-icon>
          </v-avatar>
          <div>
            <div class="font-weight-medium text-black">{{ currentSession?.title || 'Peruri Bot' }}</div>
            <div class="text-caption text-black" style="opacity: 0.7" v-if="currentUser && userAuthority">
              Welcome, {{ currentUser }} ({{ authorityDisplayName }})
            </div>
          </div>
        </div>
      </v-toolbar-title>

      <v-spacer />

      <!-- App Bar Actions -->
      <!-- <v-btn icon @click="createNewSession">
        <v-icon color="black">mdi-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">New Chat</v-tooltip>
      </v-btn> -->

      <!-- <v-btn icon @click="createNewSession">
        <v-icon color="black">mdi-refresh</v-icon>
        <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
      </v-btn> -->

      <!-- Settings Menu with Expandable Actions -->
      <v-menu location="bottom end" offset="8" v-model="accountMenuOpen" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon color="#1a1a1a">mdi-cog</v-icon>
            <v-tooltip activator="parent" location="bottom">Account</v-tooltip>
          </v-btn>
        </template>
        <v-list density="comfortable" min-width="200" color="white" class="account-menu">
          <!-- Profile/Account Settings -->
          <v-list-item @click="handlePreferences">
            <template #prepend>
              <v-icon color="black" style="opacity: 1">mdi-account-cog</v-icon>
            </template>
            <v-list-item-title class="text-black">Profile Settings</v-list-item-title>
            <v-list-item-subtitle class="text-black" style="opacity: 0.7">User settings</v-list-item-subtitle>
          </v-list-item>

          <!-- Theme Settings Expandable -->
          <v-list-group>
            <template #activator="{ props: groupProps }">
              <v-list-item v-bind="groupProps">
                <template #prepend>
                  <v-icon color="black" style="opacity: 1">mdi-palette</v-icon>
                </template>
                <v-list-item-title class="text-black">Theme Settings</v-list-item-title>
                <v-list-item-subtitle class="text-black" style="opacity: 0.7">Light/Dark mode</v-list-item-subtitle>
              </v-list-item>
            </template>
            <v-list-item @click="handleToggleTheme('light')">
              <template #prepend>
                <v-icon color="warning" style="opacity: 1">mdi-white-balance-sunny</v-icon>
              </template>
              <v-list-item-title class="text-black">Light</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleToggleTheme('dark')">
              <template #prepend>
                <v-icon color="black" style="opacity: 1">mdi-weather-night</v-icon>
              </template>
              <v-list-item-title class="text-black">Dark</v-list-item-title>
            </v-list-item>
          </v-list-group>

          <!-- Logout -->
          <v-list-item @click="handleLogout">
            <template #prepend>
              <v-icon color="#f44336" style="opacity: 1">mdi-logout</v-icon>
            </template>
            <v-list-item-title class="text-black">Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
        @upload-file="handleUploadFile"
        @search-chat="handleSearchChat"
      />
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main>
      <div class="chat-main-content">
        <!-- Upload Training View -->
        <div v-if="showUploadView" class="upload-view-container">
          <UploadTraining @close="closeUploadView" />
        </div>

        <!-- Chat View -->
        <div v-else class="chat-view-container">
          <!-- Chat Messages - Scrollable -->
          <div class="chat-messages-container">
            <v-container fluid class="pa-0 h-100">
              <div class="chat-messages">
                <!-- Empty State -->
                <div v-if="messages.length === 0" class="empty-state">
                  <div class="text-center">
                    <v-icon size="80" color="primary" class="mb-4">mdi-robot-excited</v-icon>
                    <h2 class="mb-2 text-h4">Welcome to Peruri Chat Bot</h2>
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
            <v-container fluid class="pa-4">
              <ChatInput :error="error" :is-loading="isLoading" @send-message="handleSendMessage" />
            </v-container>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  import { useChat } from '../composables/useChat';
  import UploadTraining from './UploadTraining.vue';

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

  const { currentUser, userAuthority, logout } = useAuth();
  const router = useRouter();

  // Authority display mapping
  const authorityDisplayName = computed(() => {
    switch (userAuthority.value) {
      case 'ALL':
        return 'Semua Akses';
      case 'SDM':
        return 'SDM';
      case 'HUKUM':
        return 'Hukum';
      case 'ADMIN':
        return 'Administrator';
      default:
        return 'Unknown';
    }
  });

  const messagesEnd = ref<HTMLElement>();
  const sidebarOpen = ref(true); // Sidebar open state
  const accountMenuOpen = ref(false); // Account menu open state
  const showUploadView = ref(false); // Upload view state

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

  // Account menu handlers
  const handleToggleTheme = (theme: 'light' | 'dark') => {
    // Toggle between light and dark theme
    console.log(`Switching to ${theme} theme`);
    // Here you would implement theme switching logic
    // For example: useTheme().global.name.value = theme

    // Close the menu after theme selection
    accountMenuOpen.value = false;
  };

  const handlePreferences = () => {
    // Open preferences dialog
    console.log('Preferences - functionality to be implemented');
    // Here you would open a preferences dialog or navigate to settings page

    // Close the menu after action
    accountMenuOpen.value = false;
  };

  const handleLogout = () => {
    // Handle user logout
    if (confirm('Are you sure you want to logout?')) {
      // Use auth composable to logout
      logout();

      // Optionally clear chat data as well
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('currentSessionId');

      // Reinitialize the chat system
      initialize();

      console.log('User logged out successfully');

      // Redirect to login page
      router.push('/login');
    }

    // Close the menu after action
    accountMenuOpen.value = false;
  };

  // Sidebar action handlers
  const handleUploadFile = () => {
    // Toggle upload view instead of file picker
    showUploadView.value = true;
  };

  const closeUploadView = () => {
    showUploadView.value = false;
  };

  const handleSearchChat = () => {
    // Handle search chat functionality
    console.log('Search chat - functionality to be implemented');
    // Here you would implement search functionality
    // For example, opening a search dialog or highlighting search terms
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
    height: calc(100vh - 64px); /* Subtract app bar height from total height */
    margin-top: 64px; /* Push content below app bar */
  }

  .chat-messages-container {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--v-theme-outline)) transparent;
    background-color: #f5f5f5;
    position: relative;
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
    /* Proper padding for better spacing */
    padding: 20px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 200px - 64px); /* Account for app bar in empty state */
    text-align: center;
    padding: 2rem;
  }

  .messages-list {
    padding-bottom: 20px;
    padding-top: 20px; /* Add top padding to prevent messages from being too close to app bar */
    margin-top: 50px; /* Additional margin for extra spacing */
    /* Ensure messages start from the top */
    display: flex;
    flex-direction: column;
  }

  .chat-input-container {
    flex-shrink: 0;
    background-color: #f5f5f5;
    border-top: 1px solid rgb(var(--v-theme-outline-variant));
    position: sticky;
    bottom: 0;
    z-index: 1;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .chat-main-content {
      margin-top: 56px; /* Smaller app bar on mobile */
      height: calc(100vh - 56px);
    }

    .chat-messages {
      padding: 1rem;
    }

    .empty-state {
      height: calc(100vh - 200px - 56px); /* Account for smaller app bar on mobile */
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

  /* Account menu styling */
  .account-menu {
    background-color: white !important;
    border: 1px solid rgb(var(--v-theme-outline-variant));
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :deep(.account-menu .v-list-item) {
    color: black !important;
  }

  :deep(.account-menu .v-list-item:hover) {
    background-color: rgba(211, 152, 231, 0.1) !important;
  }

  :deep(.account-menu .v-list-group__items .v-list-item) {
    padding-left: 56px !important;
  }

  :deep(.account-menu .v-list-group__items .v-list-item:hover) {
    background-color: rgba(211, 152, 231, 0.15) !important;
  }

  /* Make icons appear more vibrant and active */
  :deep(.account-menu .v-icon) {
    opacity: 1 !important;
    filter: saturate(1.2) brightness(1.1) !important;
  }

  /* Primary colored icons (Profile Settings, Theme Settings, Theme options) */
  :deep(.account-menu .v-icon[style*='color: rgb(32, 40, 135)']) {
    color: #202887 !important;
    opacity: 1 !important;
  }

  /* Error colored icons (Logout) */
  :deep(.account-menu .v-icon[style*='color: rgb(244, 67, 54)']) {
    color: #f44336 !important;
    opacity: 1 !important;
  }

  /* Alternative approach - target icons by their specific colors */
  :deep(.account-menu .v-list-item .v-icon) {
    opacity: 1 !important;
    filter: none !important;
  }

  /* Hover state for icons */
  :deep(.account-menu .v-list-item:hover .v-icon) {
    opacity: 1 !important;
    filter: brightness(1.1) saturate(1.3) !important;
  }

  /* Upload View Container */
  .upload-view-container {
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .chat-view-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
