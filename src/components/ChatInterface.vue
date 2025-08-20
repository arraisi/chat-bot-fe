<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="0" color="white" class="flexible-app-bar" :style="appBarStyle">
      <!-- Sidebar Toggle Button -->
      <v-app-bar-nav-icon color="black" @click="toggleSidebar" />

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
          <!-- <v-list-item @click="handlePreferences">
            <template #prepend>
              <v-icon color="black" style="opacity: 1">mdi-account-cog</v-icon>
            </template>
            <v-list-item-title class="text-black">Profile Settings</v-list-item-title>
            <v-list-item-subtitle class="text-black" style="opacity: 0.7">User settings</v-list-item-subtitle>
          </v-list-item> -->

          <!-- Theme Settings Expandable -->
          <!-- <v-list-group>
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
          </v-list-group> -->

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
    <v-navigation-drawer v-model="sidebarOpen" :temporary="isSmallScreen" :width="280">
      <ChatSidebar
        :chat-sessions="chatSessions"
        :current-session-id="currentSessionId"
        :is-mobile="isSmallScreen"
        @delete-session="deleteSession"
        @new-chat="handleNewChat"
        @switch-session="handleSwitchSession"
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
                    <img
                      src="../assets/aiva_new_logo.png"
                      style="max-width: 320px; height: auto"
                      alt="AIVA"
                      class="aiva-logo mb-4"
                    />
                    <!-- <v-icon size="80" color="primary" class="mb-4 mt-8">mdi-robot-excited</v-icon> -->
                    <!-- <h2 class="mb-2 text-h4">Welcome to AIVA</h2> -->
                    <p class="text-body-1 text-medium-emphasis mb-4">
                      Aiva, Asisten Virtual AI. Pilih kategori dan mulai percakapan!
                    </p>

                    <!-- Suggestion Questions (Auto-selected first category) -->
                    <div v-if="selectedSuggestionCategory" class="suggestions-section">
                      <div class="d-flex align-center justify-center mb-4">
                        <v-btn icon size="small" variant="text" @click="selectedSuggestionCategory = null">
                          <v-icon>mdi-arrow-left</v-icon>
                        </v-btn>
                        <h3 class="text-h6 mx-3">{{ selectedSuggestionCategory.label }}</h3>
                        <v-spacer />
                        <v-menu>
                          <template #activator="{ props }">
                            <v-btn variant="outlined" size="small" v-bind="props">
                              <v-icon start>mdi-swap-horizontal</v-icon>
                              Ganti Kategori
                            </v-btn>
                          </template>
                          <v-list>
                            <v-list-item
                              v-for="category in filteredCategories"
                              :key="category.value"
                              @click="selectSuggestionCategory(category)"
                            >
                              <template #prepend>
                                <v-icon>{{ category.icon }}</v-icon>
                              </template>
                              <v-list-item-title>{{ category.label }}</v-list-item-title>
                              <v-list-item-subtitle>{{ category.description }}</v-list-item-subtitle>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>

                      <div class="suggestions-grid" :key="suggestionsKey">
                        <v-card
                          v-for="(suggestion, index) in getRandomSuggestions(selectedSuggestionCategory.suggestions)"
                          :key="index"
                          class="suggestion-card"
                          hover
                          @click="handleSuggestionClick(suggestion, selectedSuggestionCategory.value)"
                        >
                          <v-card-text class="pa-4">
                            <div class="suggestion-text">{{ suggestion }}</div>
                            <v-icon class="suggestion-icon" size="20">mdi-arrow-right</v-icon>
                          </v-card-text>
                        </v-card>
                      </div>

                      <!-- Show More Button (only if there are more than 4 suggestions) -->
                      <div
                        v-if="
                          selectedSuggestionCategory.suggestions && selectedSuggestionCategory.suggestions.length > 4
                        "
                        class="text-center mt-4"
                      >
                        <v-btn variant="text" color="primary" size="small" @click="refreshSuggestions">
                          <v-icon start>mdi-refresh</v-icon>
                          Tampilkan Pertanyaan Lain
                        </v-btn>
                      </div>
                    </div>

                    <!-- Category Selection (Fallback - only shown when no category is selected) -->
                    <div v-else class="category-selection mb-6">
                      <h3 class="text-h6 mb-4">Pilih Kategori untuk Melihat Pertanyaan Populer:</h3>
                      <div class="category-grid">
                        <v-card
                          v-for="category in filteredCategories"
                          :key="category.value"
                          class="category-card"
                          hover
                          @click="selectSuggestionCategory(category)"
                        >
                          <v-card-text class="text-center pa-4">
                            <v-icon :icon="category.icon" size="40" color="primary" class="mb-2" />
                            <div class="category-title">{{ category.label }}</div>
                            <div class="category-desc">{{ category.description }}</div>
                          </v-card-text>
                        </v-card>
                      </div>
                    </div>

                    <!-- <v-btn v-if="!selectedSuggestionCategory" color="primary" variant="tonal" @click="createNewSession">
                      <v-icon start>mdi-plus</v-icon>
                      Start New Chat
                    </v-btn> -->
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
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  import { useChat } from '../composables/useChatWithBackend';
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
    sendMessage, // Now using real API
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
      // Auto-select first category when authority changes
      autoSelectFirstCategory();
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

    // Auto-select first category when authority changes
    autoSelectFirstCategory();
  };

  const messagesEnd = ref<HTMLElement>();
  // Remove navigationDrawer ref since we're not using it
  const isSmallScreen = ref(typeof window !== 'undefined' ? window.innerWidth < 600 : false); // Track if viewport width < 600px
  const sidebarOpen = ref(typeof window !== 'undefined' ? window.innerWidth >= 600 : true); // Sidebar closed by default on mobile
  const accountMenuOpen = ref(false); // Account menu open state
  const updateIsSmallScreen = () => {
    isSmallScreen.value = window.innerWidth < 600;
    if (isSmallScreen.value) {
      sidebarOpen.value = false;
    }
  };
  const showUploadView = ref(false); // Upload view state
  const selectedSuggestionCategory = ref<any>(null); // Selected category for suggestions
  const suggestionsKey = ref(0); // Key to force re-render of suggestions

  // Interface for category options with suggestions
  interface CategoryOption {
    value: string;
    label: string;
    description: string;
    icon: string;
    suggestions?: string[];
  }

  // Define categories with suggestions (same as ChatInput.vue)
  const getCategoriesWithSuggestions = (authority: Authority | null): CategoryOption[] => {
    const codeOfConductSuggestions = [
      'Bagaimana Peruri mengelola risiko benturan kepentingan dalam pengambilan keputusan strategis dan pengadaan barang/jasa?',
      'Apa saja tanggung jawab pemimpin Peruri dalam membangun budaya kepatuhan terhadap Pedoman Etika Perilaku, dan bagaimana pelaksanaannya diukur?',
      'Bagaimana pendekatan Peruri terhadap pelestarian lingkungan diintegrasikan dalam kebijakan operasional dan pengembangan jangka panjang perusahaan?',
      'Dalam konteks hubungan dengan stakeholders, bagaimana Peruri memastikan prinsip fairness, transparansi, dan akuntabilitas diterapkan secara menyeluruh?',
      'Apa strategi Peruri dalam menerapkan sistem Whistle Blowing agar tetap efektif, melindungi pelapor, dan menjaga integritas internal?',
    ];

    const corporateGovernanceSuggestions = [
      'Apa tujuan utama penerapan prinsip-prinsip Good Corporate Governance (GCG) di PERURI?',
      'Bagaimana prinsip transparansi diterapkan di PERURI?',
      'Apa saja kriteria yang harus dipenuhi untuk menjadi anggota Direksi PERURI?',
      'Jelaskan peran Dewan Pengawas dalam tata kelola PERURI.',
      'Bagaimana sistem pengendalian internal diterapkan di PERURI?',
    ];

    const dataPerlindunganSuggestions = [
      'Apa latar belakang disusunnya kebijakan Pelindungan Data Pribadi (PDP) di PERURI?',
      'Bagaimana strategi pelindungan data pribadi diimplementasikan di lingkungan PERURI?',
      'Siapa saja pihak-pihak yang termasuk dalam pengelolaan dan pemrosesan data pribadi di PERURI?',
      'Apa saja prinsip utama dalam pemrosesan data pribadi menurut kebijakan ini?',
      'Apa peran dan tanggung jawab Data Protection Officer (DPO) di PERURI?',
    ];

    const itGovernanceSuggestions = [
      'Apa peran strategis IT Governance dalam mendukung prinsip Good Corporate Governance (GCG) di Peruri?',
      'Bagaimana komitmen manajemen Peruri tercermin dalam kebijakan sistem manajemen tata kelola TI?',
      'Mengapa prinsip segregasi tugas penting dalam struktur tata kelola TI Peruri?',
      'Apa saja elemen penting dalam penyusunan Master Plan TI di Peruri?',
      'Bagaimana Peruri menjamin keamanan informasi dalam implementasi teknologi informasi?',
    ];

    const financialPolicySuggestions = [
      'Apa latar belakang disusunnya Financial Policy Manual dalam pengelolaan keuangan perusahaan?',
      'Apa pendekatan yang digunakan dalam penyusunan Manual Kebijakan Keuangan ini?',
      'Sebutkan prinsip-prinsip yang mendasari pengelolaan keuangan!',
      'Bagaimana proses penyusunan RKAP dalam perusahaan?',
      'Apa yang dimaksud dengan Zero Based Budgeting dalam konteks anggaran perusahaan?',
    ];

    const tjslSuggestions = [
      'Apa yang dimaksud dengan Program TJSL BUMN?',
      'Bagaimana definisi Badan Usaha Milik Negara?',
      'Apa saja prinsip yang harus diterapkan dalam pelaksanaan Program TJSL?',
      'Apa tujuan strategis dari Program TJSL sebagaimana dijelaskan dalam dokumen ini?',
      'Siapakah yang termasuk dalam kategori Mitra Binaan dalam Program Pendanaan UMK?',
    ];

    const mspSuggestions = [
      'Apa tujuan utama dari disusunnya dokumen Manual Marketing, Sales & Product ini?',
      'Apa saja ruang lingkup yang diatur dalam buku panduan ini?',
      'Bagaimana definisi dari pemasaran dalam konteks manual ini?',
      'Apa perbedaan mendasar antara pemasaran dan penjualan menurut dokumen ini?',
      "Bagaimana peran 'market intelligence' dalam pengambilan keputusan strategis pemasaran?",
    ];

    const riskManagementSuggestions = [
      'Apa itu Taksonomi Risiko?',
      'Apa yang dimaksud dengan Pemilik Risiko/Risk Owner?',
      'Bagaimana cara menerapkan manajemen risiko yang efektif?',
      'Bagaimana kebijakan BCMS (Business Continuity Management System) di Peruri?',
      'Bagaimana cara atau pertimbangan dalam menetapkan konteks risiko?',
    ];

    const accountingSuggestions = [
      'Bagaimana prosedur pengalihan anggaran?',
      'Bagaimana prosedur atau mekanisme revisi anggaran Perusahaan?',
      'Bagaimana proses untuk Realisasi Perencaan Produksi?',
      'Bagaimana ketentuan atau metode Pengadaan Langsung?',
      'Bagaimana alur penerimaan produk retur?',
    ];

    switch (authority) {
      case 'HUKUM':
        return [
          {
            value: 'code-of-conduct',
            label: 'Code of Conduct',
            description: 'Pedoman etika perilaku dan standar',
            icon: 'mdi-gavel',
            suggestions: codeOfConductSuggestions,
          },
          {
            value: 'code-of-corporate-governance',
            label: 'Code of Corporate Governance',
            description: 'Prinsip tata kelola perusahaan yang baik',
            icon: 'mdi-shield-check',
            suggestions: corporateGovernanceSuggestions,
          },
          {
            value: 'perlindungan-data-pribadi',
            label: 'Perlindungan Data Pribadi',
            description: 'Kebijakan pelindungan data pribadi',
            icon: 'mdi-shield-account',
            suggestions: dataPerlindunganSuggestions,
          },
          {
            value: 'risk-management-compliance',
            label: 'Risk Management and Compliance',
            description: 'Manajemen risiko dan kepatuhan',
            icon: 'mdi-security',
            suggestions: riskManagementSuggestions,
          },
        ];
      case 'SDM':
        return [
          {
            value: 'manual-tjsl',
            label: 'Manual TJSL',
            description: 'Tanggung Jawab Sosial dan Lingkungan',
            icon: 'mdi-hand-heart',
            suggestions: tjslSuggestions,
          },
          {
            value: 'manual-msp',
            label: 'Manual MSP',
            description: 'Marketing, Sales & Product manual',
            icon: 'mdi-chart-line',
            suggestions: mspSuggestions,
          },
        ];
      case 'ADMIN':
        return [
          {
            value: 'it-corporate-governance',
            label: 'IT Corporate Governance',
            description: 'Tata kelola teknologi informasi',
            icon: 'mdi-server-security',
            suggestions: itGovernanceSuggestions,
          },
          {
            value: 'financial-policy-manual',
            label: 'Financial Policy Manual',
            description: 'Manual kebijakan keuangan',
            icon: 'mdi-currency-usd',
            suggestions: financialPolicySuggestions,
          },
          {
            value: 'accounting-procedure',
            label: 'Accounting and Procedure',
            description: 'Prosedur akuntansi dan keuangan',
            icon: 'mdi-calculator',
            suggestions: accountingSuggestions,
          },
        ];
      case 'ALL':
        return [
          {
            value: 'code-of-conduct',
            label: 'Code of Conduct',
            description: 'Pedoman etika perilaku dan standar',
            icon: 'mdi-gavel',
            suggestions: codeOfConductSuggestions,
          },
          {
            value: 'code-of-corporate-governance',
            label: 'Code of Corporate Governance',
            description: 'Prinsip tata kelola perusahaan yang baik',
            icon: 'mdi-shield-check',
            suggestions: corporateGovernanceSuggestions,
          },
          {
            value: 'perlindungan-data-pribadi',
            label: 'Perlindungan Data Pribadi',
            description: 'Kebijakan pelindungan data pribadi',
            icon: 'mdi-shield-account',
            suggestions: dataPerlindunganSuggestions,
          },
          {
            value: 'it-corporate-governance',
            label: 'IT Corporate Governance',
            description: 'Tata kelola teknologi informasi',
            icon: 'mdi-server-security',
            suggestions: itGovernanceSuggestions,
          },
          {
            value: 'financial-policy-manual',
            label: 'Financial Policy Manual',
            description: 'Manual kebijakan keuangan',
            icon: 'mdi-currency-usd',
            suggestions: financialPolicySuggestions,
          },
          {
            value: 'manual-tjsl',
            label: 'Manual TJSL',
            description: 'Tanggung Jawab Sosial dan Lingkungan',
            icon: 'mdi-hand-heart',
            suggestions: tjslSuggestions,
          },
          {
            value: 'manual-msp',
            label: 'Manual MSP',
            description: 'Marketing, Sales & Product manual',
            icon: 'mdi-chart-line',
            suggestions: mspSuggestions,
          },
          {
            value: 'risk-management-compliance',
            label: 'Risk Management and Compliance',
            description: 'Manajemen risiko dan kepatuhan',
            icon: 'mdi-security',
            suggestions: riskManagementSuggestions,
          },
          {
            value: 'accounting-procedure',
            label: 'Accounting and Procedure',
            description: 'Prosedur akuntansi dan keuangan',
            icon: 'mdi-calculator',
            suggestions: accountingSuggestions,
          },
        ];
      default:
        return [
          {
            value: 'general',
            label: 'General',
            description: 'General inquiries',
            icon: 'mdi-help-circle',
            suggestions: [
              'Apa informasi umum tentang Peruri?',
              'Bagaimana cara menghubungi customer service?',
              'Apa jam operasional Peruri?',
            ],
          },
        ];
    }
  };

  // Get filtered categories based on selected authority
  const filteredCategories = computed(() => getCategoriesWithSuggestions(selectedAuthority.value));

  // Auto-select first category function
  const autoSelectFirstCategory = () => {
    const categories = filteredCategories.value;
    if (categories.length > 0 && !selectedSuggestionCategory.value) {
      selectedSuggestionCategory.value = categories[0];
    }
  };

  // Get 4 random suggestions from the available suggestions
  const getRandomSuggestions = (suggestions: string[] = []) => {
    if (!suggestions || suggestions.length === 0) return [];

    // If we have 4 or fewer suggestions, return all of them
    if (suggestions.length <= 4) return suggestions;

    // Use suggestionsKey to ensure different random selections on refresh
    const seed = suggestionsKey.value;
    const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  // Refresh suggestions to show different random questions
  const refreshSuggestions = () => {
    suggestionsKey.value += 1; // This will trigger a re-render with new random suggestions
  };

  // Computed style for flexible app bar - simplified for proper Vuetify behavior
  const appBarStyle = computed(() => {
    return {
      // Let Vuetify handle positioning automatically
    };
  });

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

  // Watch for screen size changes to adjust sidebar behavior
  watch(isSmallScreen, (newIsSmallScreen, oldIsSmallScreen) => {
    console.log('Screen size changed from', oldIsSmallScreen, 'to', newIsSmallScreen);
    // Only auto-manage sidebar when transitioning between mobile and desktop
    if (newIsSmallScreen !== oldIsSmallScreen) {
      if (newIsSmallScreen) {
        console.log('Switching to mobile - closing sidebar');
        sidebarOpen.value = false; // Close sidebar on small screens
      } else {
        console.log('Switching to desktop - opening sidebar');
        sidebarOpen.value = true; // Open sidebar on larger screens
      }
    }
  });

  // Watch sidebar state changes for debugging
  watch(sidebarOpen, (newState, oldState) => {
    console.log('Sidebar state changed from', oldState, 'to', newState);
  });

  // Watch for changes in filtered categories and auto-select first category
  watch(
    filteredCategories,
    newCategories => {
      // Auto-select first category when categories change and no category is currently selected
      if (newCategories.length > 0 && !selectedSuggestionCategory.value) {
        autoSelectFirstCategory();
      }
    },
    { immediate: true }
  );

  // Handle sending messages
  const handleSendMessage = async (message: string, category?: string) => {
    try {
      // Use provided category or default to 'general'
      const messageCategory = category || 'general';

      console.log(`Sending message with category: ${messageCategory}`);
      console.log(`Selected authority: ${selectedAuthority.value}`);

      // Use real API with selectedAuthority from ChatInterface
      await sendMessage(message, messageCategory, selectedAuthority.value);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to user
      console.log('Failed to send message to backend');
      scrollToBottom();
    }
  }; // Handle suggestion category selection
  const selectSuggestionCategory = (category: CategoryOption) => {
    selectedSuggestionCategory.value = category;
    suggestionsKey.value = 0; // Reset suggestions to show fresh random selection
  };

  // Handle suggestion question click
  const handleSuggestionClick = async (suggestion: string, categoryValue: string) => {
    try {
      // First set the category in the input
      await createNewSession({
        authority: selectedAuthority.value,
      });
      // Wait for the next tick to ensure the session is created
      await nextTick();

      console.log(`Sending suggestion with category: ${categoryValue}`);
      console.log(`Selected authority: ${selectedAuthority.value}`);

      // Use real API for suggestions with selectedAuthority from ChatInterface
      await sendMessage(suggestion, categoryValue, selectedAuthority.value);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending suggestion:', error);
      // Show error to user
      console.log('Failed to send suggestion to backend');
      scrollToBottom();
    }
  }; // Account menu handlers
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
      console.log('🚪 Chat: Starting logout process...');

      // Use auth composable to logout (this will clear SSO token and auth data)
      logout();

      // Reinitialize the chat system after logout (this will reload from backend)
      initialize();

      console.log('🚪 Chat: User logged out successfully');
    }

    // Close the menu after action
    accountMenuOpen.value = false;
  };

  // Sidebar action handlers
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  // Remove the handleCloseSidebar function since we're using inline

  const handleNewChat = async () => {
    await createNewSession({
      authority: selectedAuthority.value,
    });
    // Close sidebar on mobile after creating new chat
    if (isSmallScreen.value) {
      sidebarOpen.value = false;
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    // Switch to the selected session
    switchToSession(sessionId);
    // Close sidebar on mobile after switching sessions
    if (isSmallScreen.value) {
      sidebarOpen.value = false;
    }
  };

  const handleUploadFile = () => {
    // Toggle upload view instead of file picker
    showUploadView.value = true;
    // Close sidebar on mobile after action
    if (isSmallScreen.value) {
      sidebarOpen.value = false;
    }
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
  onMounted(async () => {
    updateIsSmallScreen();
    window.addEventListener('resize', updateIsSmallScreen);
    await initialize();
    scrollToBottom();
    // Auto-select first category on mount
    autoSelectFirstCategory();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateIsSmallScreen);
  });
</script>

<style scoped>
  /* CSS Custom Properties for responsive dimensions */
  :root {
    --app-bar-height: 64px;
    --safe-area-top: env(safe-area-inset-top, 0px);
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  }

  .chat-main-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px); /* Account for device notches */
    /* Remove padding-top since v-main should handle the app bar spacing automatically */
  }

  .chat-messages-container {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--v-theme-outline)) transparent;
    background-color: #f5f5f5;
    position: relative;
    min-height: 0; /* Allow flex shrinking */
    max-height: calc(100vh - var(--app-bar-height) - 120px); /* Reserve space for input */
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
    padding: 20px;
    min-height: 100%; /* Ensure it takes at least full container height */
    display: flex;
    flex-direction: column;
    box-sizing: border-box; /* Include padding in height calculations */
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1; /* Take remaining space */
    min-height: 60vh; /* Minimum height for better UX */
    text-align: center;
    padding: 2rem;
  }

  /* Category Selection Styles */
  .category-selection {
    max-width: 900px;
    width: 100%;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(279px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .category-card {
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    background-color: white !important;
  }

  .category-card:hover {
    border-color: #202887;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(32, 40, 135, 0.15);
  }

  .category-title {
    font-weight: 600;
    font-size: 16px;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .category-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }

  /* Suggestions Section Styles */
  .suggestions-section {
    max-width: 900px;
    width: 100%;
  }

  .suggestions-section .d-flex {
    position: relative;
  }

  .suggestions-section .v-btn[variant='outlined'] {
    border-color: #202887;
    color: #202887;
  }

  .suggestions-section .v-btn[variant='outlined']:hover {
    background-color: rgba(32, 40, 135, 0.05);
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .suggestion-card {
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
    cursor: pointer;
    background-color: white !important;
    position: relative;
  }

  .suggestion-card:hover {
    border-color: #202887;
    transform: translateX(8px);
    box-shadow: 0 4px 15px rgba(32, 40, 135, 0.1);
  }

  .suggestion-text {
    font-size: 14px;
    color: #1a1a1a;
    line-height: 1.5;
    padding-right: 40px;
    font-weight: 500;
  }

  .suggestion-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    transition: all 0.3s ease;
  }

  .suggestion-card:hover .suggestion-icon {
    color: #202887;
    transform: translateY(-50%) translateX(4px);
  }

  /* Mobile responsiveness for suggestions */
  @media (max-width: 768px) {
    .category-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .suggestions-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .category-card {
      margin: 0;
    }

    .suggestion-text {
      font-size: 13px;
      padding-right: 35px;
    }

    .suggestion-icon {
      right: 12px;
    }
  }

  /* Tablet responsiveness */
  @media (min-width: 769px) and (max-width: 1024px) {
    .suggestions-grid {
      gap: 14px;
    }

    .suggestion-text {
      font-size: 13px;
    }
  }

  .messages-list {
    padding-bottom: 20px;
    padding-top: 20px;
    margin-top: 50px;
    flex: 1; /* Take available space */
    display: flex;
    flex-direction: column;
    overflow-y: visible; /* Allow content to be visible */
    min-height: fit-content; /* Ensure content is not cut */
  }

  .chat-input-container {
    flex-shrink: 0;
    background-color: #f5f5f5;
    border-top: 1px solid rgb(var(--v-theme-outline-variant));
    position: sticky;
    bottom: 0;
    z-index: 1;
    width: 100%;
    max-height: 30vh; /* Prevent input from taking too much space */
    padding-bottom: var(--safe-area-bottom); /* Account for device safe areas */
    margin-top: auto; /* Push to bottom */
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    :root {
      --app-bar-height: 56px;
    }

    .chat-main-content {
      padding-top: var(--app-bar-height);
    }

    .chat-messages-container {
      max-height: calc(100vh - var(--app-bar-height) - 140px); /* More space for input on mobile */
    }

    .chat-messages {
      padding: 12px;
    }

    .empty-state {
      min-height: 50vh; /* Smaller min height on mobile */
      padding: 1rem;
    }

    .messages-list {
      padding-top: 12px;
      padding-bottom: 12px;
      margin-top: 50px;
      overflow-y: visible; /* Ensure messages are not cut on mobile */
    }
  }

  /* Tablet responsiveness */
  @media (min-width: 481px) and (max-width: 768px) {
    :root {
      --app-bar-height: 60px;
    }

    .chat-main-content {
      padding-top: var(--app-bar-height);
    }

    .chat-messages-container {
      max-height: calc(100vh - var(--app-bar-height) - 130px); /* Space for input on tablet */
    }

    .chat-messages {
      padding: 16px;
    }

    .empty-state {
      min-height: 55vh;
      padding: 1.5rem;
    }

    .messages-list {
      padding-top: 16px;
      padding-bottom: 16px;
      margin-top: 50px;
      overflow-y: visible;
    }
  }

  /* Large tablet/small desktop */
  @media (min-width: 769px) and (max-width: 1024px) {
    .chat-messages {
      padding: 18px;
    }

    .empty-state {
      min-height: 60vh;
    }
  }

  /* Landscape mobile phones */
  @media (max-width: 768px) and (orientation: landscape) {
    .empty-state {
      min-height: 40vh; /* Reduce height in landscape mode */
      padding: 1rem;
    }

    .chat-messages {
      padding: 10px;
    }
  }

  /* Vuetify app layout adjustments */
  :deep(.v-app-bar) {
    z-index: 999;
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
