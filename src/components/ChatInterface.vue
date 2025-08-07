<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="0" color="white" class="flexible-app-bar" :style="appBarStyle">
      <!-- Sidebar Toggle Button -->
      <v-app-bar-nav-icon color="black" @click="sidebarOpen = !sidebarOpen" />

      <!-- App Bar Title with Authority Selector -->
      <v-toolbar-title class="d-flex align-center">
        <!-- Authority Selector Dropdown -->
        <v-select
          v-model="selectedAuthority"
          :items="filteredAuthorities"
          item-title="label"
          item-value="value"
          variant="plain"
          density="compact"
          hide-details
          class="authority-select mt-1"
          :disabled="isAuthorityChangeDisabled"
          @update:model-value="handleAuthorityChange"
        >
          <template #selection="{ item }">
            <div class="authority-chip">
              <v-icon size="16" class="me-2">{{ item.raw.icon }}</v-icon>
              <span class="authority-label">{{ item.raw.label }}</span>
            </div>
          </template>
          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps" class="authority-item">
              <template #prepend>
                <v-icon size="16">{{ item.raw.icon }}</v-icon>
              </template>
              <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
              <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>
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
              <ChatInput
                :error="error"
                :is-loading="isLoading"
                :user-authority="selectedAuthority"
                @send-message="handleSendMessage"
              />
            </v-container>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  import { useChat } from '../composables/useChat';
  import type { Authority } from '../types/chat';
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

  const { currentUser, userAuthority, logout, setAuthorityAndAuthenticate } = useAuth();
  const router = useRouter();

  // Authority options for dropdown
  interface AuthorityOption {
    value: Authority;
    label: string;
    description: string;
    icon: string;
  }

  const availableAuthorities: AuthorityOption[] = [
    {
      value: 'ALL',
      label: 'Semua Akses',
      description: 'Full access to all departments',
      icon: 'mdi-shield-crown',
    },
    {
      value: 'SDM',
      label: 'SDM',
      description: 'Human Resources department',
      icon: 'mdi-account-group',
    },
    {
      value: 'HUKUM',
      label: 'Hukum',
      description: 'Legal department',
      icon: 'mdi-gavel',
    },
    {
      value: 'ADMIN',
      label: 'Administrator',
      description: 'System administration',
      icon: 'mdi-cog',
    },
  ];

  // Filter authorities based on user's current authority
  const filteredAuthorities = computed(() => {
    const currentAuth = userAuthority.value;

    // If user is ADMIN or ALL, show all authorities
    if (currentAuth === 'ADMIN' || currentAuth === 'ALL') {
      return availableAuthorities;
    }

    // If user is SDM or HUKUM, only show their own authority
    if (currentAuth === 'SDM' || currentAuth === 'HUKUM') {
      return availableAuthorities.filter(auth => auth.value === currentAuth);
    }

    // Default fallback - show all authorities
    return availableAuthorities;
  });

  // Disable dropdown for SDM/HUKUM users since they can't change authority
  const isAuthorityChangeDisabled = computed(() => {
    const currentAuth = userAuthority.value;
    return currentAuth === 'SDM' || currentAuth === 'HUKUM';
  });

  const selectedAuthority = ref<Authority>(userAuthority.value || 'ALL');
  const isChangingAuthority = ref(false);

  // Watch for changes in userAuthority from auth composable
  watch(userAuthority, newAuthority => {
    if (newAuthority && newAuthority !== selectedAuthority.value) {
      selectedAuthority.value = newAuthority;
    }
  });

  // Handle authority change - only affects categories, not actual user authority
  const handleAuthorityChange = async (newAuthority: Authority) => {
    const currentAuth = userAuthority.value;

    // For SDM/HUKUM users, prevent any changes
    if (currentAuth === 'SDM' || currentAuth === 'HUKUM') {
      console.warn('SDM and HUKUM users cannot change their authority selection');
      selectedAuthority.value = currentAuth;
      return;
    }

    // For ADMIN/ALL users, just update the selection for category filtering
    // Don't change the actual user authority - just the selection for chat input categories
    selectedAuthority.value = newAuthority;
    console.log(`Authority selection changed to: ${newAuthority} (for category filtering only)`);
  };

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
  const handleSendMessage = async (message: string, category?: string) => {
    if (category) {
      console.log(`Sending message in category: ${category}`);
      // You can modify the message to include category context
      // For example: const contextualMessage = `[Category: ${category}] ${message}`;
    }
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

  /* Authority Selector Styles */
  .authority-select {
    min-width: 160px;
    max-width: 220px;
  }

  .authority-select :deep(.v-field) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    min-height: auto !important;
    padding: 0 !important;
  }

  .authority-select :deep(.v-field__input) {
    padding: 8px 12px !important;
    min-height: auto !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    color: #1a1a1a !important;
    display: flex !important;
    align-items: center !important;
  }

  .authority-select :deep(.v-field__append-inner) {
    padding: 0 !important;
    margin-left: 8px !important;
    align-items: center !important;
  }

  .authority-select :deep(.v-icon) {
    font-size: 18px !important;
    color: #666 !important;
  }

  .authority-chip {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1;
  }

  .authority-chip .v-icon {
    color: #202887 !important;
  }

  .authority-label {
    font-size: 16px;
    font-weight: 600;
  }

  /* Authority dropdown items */
  :deep(.authority-item) {
    min-height: 48px !important;
  }

  :deep(.authority-item .v-list-item-title) {
    font-weight: 500 !important;
    color: #1a1a1a !important;
  }

  :deep(.authority-item .v-list-item-subtitle) {
    font-size: 11px !important;
    color: #666 !important;
  }

  :deep(.authority-item:hover) {
    background-color: rgba(32, 40, 135, 0.05) !important;
  }

  :deep(.authority-item .v-icon) {
    color: #202887 !important;
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
