<template>
  <div class="login-container">
    <div class="login-content">
      <div class="authority-selection">
        <!-- <h1 class="welcome-title">AIVA CHAT BOT</h1> -->
        <img
          src="../assets/aiva_new_logo.png"
          alt="AIVA Logo"
          class="aiva-logo mb-4"
          style="max-width: 220px; height: auto"
        />

        <div>
          <p class="welcome-subtitle">Silahkan pilih otoritas untuk mengakses aplikasi</p>

          <!-- User role-based authority filtering feedback -->
          <!-- <v-alert
            v-if="userRoles.length > 0"
            :type="authorityFilterMessage.type"
            variant="tonal"
            density="compact"
            class="mb-4 text-start"
          >
            <div class="d-flex align-center">
              <span class="text-body-2">{{ authorityFilterMessage.text }}</span>
            </div>
          </v-alert> -->

          <v-select
            v-model="selectedAuthority"
            :items="authorities"
            item-title="name"
            item-value="code"
            :label="`Pilih Otoritas (${authorities.length} tersedia)`"
            variant="outlined"
            density="comfortable"
            class="authority-dropdown"
            placeholder="Silakan pilih otoritas Anda"
          >
            <template #prepend-inner>
              <v-icon color="#202887">mdi-shield-account</v-icon>
            </template>
            <template #item="{ item, props }">
              <v-list-item v-bind="props" class="authority-option">
                <template #prepend>
                  <v-icon color="#202887" class="me-3">mdi-shield-account</v-icon>
                </template>
                <!-- <v-list-item-title class="authority-option-title">{{ item.title }}</v-list-item-title> -->
                <v-list-item-subtitle class="authority-option-description">{{
                  item.raw.description
                }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <v-btn
            v-if="selectedAuthority"
            @click="handleContinue"
            class="continue-btn"
            color="primary"
            size="large"
            block
            :loading="loading"
            :disabled="loading"
          >
            Lanjutkan ke aplikasi
          </v-btn>
        </div>
      </div>
    </div>

    <!-- SSO Authentication Modal for Development -->
    <v-dialog v-model="showSSOModal" max-width="500">
      <v-card>
        <v-card-title class="sso-modal-title">
          <v-icon color="#202887" class="me-2">mdi-login</v-icon>
          SSO Authentication Required
        </v-card-title>

        <v-card-text class="sso-modal-content">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <v-alert-title>Authentication Required</v-alert-title>
            You need to authenticate through the SSO portal before accessing the chat bot.
          </v-alert>

          <p class="text-body-2 mb-3">
            To continue with your selected authority, please complete the SSO authentication process first.
          </p>

          <p class="text-body-2 mb-3">
            In development mode, you can use the mock SSO portal to test the authentication flow.
          </p>

          <div class="d-flex align-center justify-center">
            <v-icon color="primary" class="me-2">mdi-information</v-icon>
            <span class="text-caption">This modal only appears in development environments</span>
          </div>
        </v-card-text>

        <v-card-actions class="sso-modal-actions">
          <v-btn variant="text" @click="showSSOModal = false"> Cancel </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" @click="redirectToSSOPortal" :loading="redirecting">
            <v-icon class="me-1">mdi-open-in-new</v-icon>
            Open SSO Portal Mock
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  import ssoService from '../services/ssoService';
  import type { Authority } from '../types/chat';

  interface AuthorityOption {
    code: Authority;
    name: string;
    description: string;
  }

  const router = useRouter();
  const { setAuthorityAndAuthenticate } = useAuth();

  const selectedAuthority = ref<Authority | null>(null);
  const loading = ref(true); // Start with loading active
  const userRoles = ref<string[]>([]);
  const showSSOModal = ref(false);
  const redirecting = ref(false);

  // Check if we're in development environment
  const isDevelopment = computed(() => {
    return import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  });

  const allAuthorities: AuthorityOption[] = [
    {
      code: 'ALL',
      name: 'Semua Akses',
      description: 'Akses penuh ke semua fitur aplikasi',
    },
    {
      code: 'SDM',
      name: 'SDM',
      description: 'Akses aplikasi untuk divisi Sumber Daya Manusia',
    },
    {
      code: 'HUKUM',
      name: 'Hukum',
      description: 'Akses aplikasi untuk divisi Hukum',
    },
    {
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Akses administrasi sistem aplikasi',
    },
  ];

  // Filter authorities based on user roles
  const authorities = computed(() => {
    // If no roles detected, show all authorities (fallback for development/testing)
    if (userRoles.value.length === 0) {
      console.log('⚠️ No user roles detected, showing all authorities as fallback');
      return allAuthorities;
    }

    // Normalize user roles to uppercase for consistent comparison
    const normalizedRoles = userRoles.value.map(role => role.toUpperCase());
    console.log('🔍 Normalized user roles:', normalizedRoles);

    // Check for ALL or ADMIN role - both show all options
    const hasAllRole = normalizedRoles.includes('ALL');
    const hasAdminRole = normalizedRoles.includes('ADMIN');

    if (hasAllRole || hasAdminRole) {
      console.log('✅ User has ALL or ADMIN role, showing all authorities');
      return allAuthorities; // Show ALL, SDM, HUKUM, ADMIN options
    }

    // Filter authorities based on specific user roles
    const availableAuthorities: AuthorityOption[] = [];

    // Map user roles to corresponding authorities
    const roleToAuthorityMap = {
      HUKUM: 'HUKUM',
      SDM: 'SDM',
    };

    // Add authorities that match user roles
    normalizedRoles.forEach(role => {
      const matchingAuthorityCode = roleToAuthorityMap[role as keyof typeof roleToAuthorityMap];
      if (matchingAuthorityCode) {
        const authority = allAuthorities.find(auth => auth.code === matchingAuthorityCode);
        if (authority && !availableAuthorities.find(auth => auth.code === authority.code)) {
          availableAuthorities.push(authority);
        }
      }
    });

    console.log(
      '📋 Filtered authorities based on user roles:',
      availableAuthorities.map(auth => auth.code)
    );

    // Return filtered authorities, or fallback to all authorities if no matches found
    return availableAuthorities.length > 0 ? availableAuthorities : allAuthorities;
  });

  // Computed property for user feedback about available authorities
  const authorityFilterMessage = computed(() => {
    if (userRoles.value.length === 0) {
      return {
        type: 'info' as const,
        text: 'Menunggu informasi peran pengguna dari SSO...',
      };
    }

    const normalizedRoles = userRoles.value.map(role => role.toUpperCase());
    const hasAllRole = normalizedRoles.includes('ALL');
    const hasAdminRole = normalizedRoles.includes('ADMIN');

    if (hasAllRole || hasAdminRole) {
      return {
        type: 'success' as const,
        text: 'Anda memiliki akses ke semua otoritas (ALL, HUKUM, SDM, ADMIN).',
      };
    }

    // Check for specific roles
    const hasHukumRole = normalizedRoles.includes('HUKUM');
    const hasSDMRole = normalizedRoles.includes('SDM');

    if (hasHukumRole && hasSDMRole) {
      return {
        type: 'info' as const,
        text: 'Anda memiliki akses ke otoritas HUKUM dan SDM.',
      };
    } else if (hasHukumRole) {
      return {
        type: 'info' as const,
        text: 'Anda memiliki akses ke otoritas HUKUM.',
      };
    } else if (hasSDMRole) {
      return {
        type: 'info' as const,
        text: 'Anda memiliki akses ke otoritas SDM.',
      };
    }

    return {
      type: 'warning' as const,
      text: 'Tidak ada otoritas khusus yang cocok dengan peran Anda. Menampilkan semua otoritas.',
    };
  });

  // Auto-select authority if only one is available, or prioritize non-ADMIN when ADMIN is present with others
  watch(
    authorities,
    newAuthorities => {
      if (newAuthorities.length === 1 && !selectedAuthority.value) {
        selectedAuthority.value = newAuthorities[0].code;
        console.log('🎯 Auto-selected single available authority:', newAuthorities[0].code);
      } else if (newAuthorities.length > 1 && !selectedAuthority.value) {
        // If user has ADMIN role with other roles, prioritize non-ADMIN authorities
        const normalizedRoles = userRoles.value.map(role => role.toUpperCase());
        const hasAdminRole = normalizedRoles.includes('ADMIN');

        if (hasAdminRole) {
          // Prioritize HUKUM over SDM if both are available
          const hukumAuthority = newAuthorities.find(auth => auth.code === 'HUKUM');
          const sdmAuthority = newAuthorities.find(auth => auth.code === 'SDM');

          if (hukumAuthority) {
            selectedAuthority.value = 'HUKUM';
            console.log('🎯 Auto-selected HUKUM authority (prioritized over ADMIN)');
          } else if (sdmAuthority) {
            selectedAuthority.value = 'SDM';
            console.log('🎯 Auto-selected SDM authority (prioritized over ADMIN)');
          }
        }
      }
    },
    { immediate: true }
  );

  // Get user roles from SSO token on component mount
  onMounted(() => {
    // Listen for SSO tokens from parent window (SSO Portal)
    const handleSSO = (event: MessageEvent) => {
      // Verify origin if needed (in production, add proper origin checking)
      console.log('📨 Received message from parent:', event.data);

      if (event.data === 'ping') {
        // Respond that we're ready
        console.log('📤 Sending ready response to parent');
        (event.source as Window)?.postMessage('ready', '*');
        return;
      }

      // Handle token from SSO portal - support multiple formats
      if (event.data && (event.data.token || event.data.access_token)) {
        console.log('🔑 Received SSO token from parent window');

        try {
          // Get token from either 'token' or 'access_token' field
          const token = event.data.token || event.data.access_token;

          console.log('🔍 Token source:', event.data.token ? 'event.data.token' : 'event.data.access_token');

          // Process token using SSO service
          const tokenPayload = ssoService.decodeToken(token);
          if (tokenPayload) {
            console.log('✅ Token decoded successfully:', tokenPayload);

            // Extract user authority and create profile
            const userAuthority = ssoService.extractUserAuthority(tokenPayload);
            const userProfile = ssoService.createUserProfile(tokenPayload);

            if (userAuthority && userProfile) {
              // Store authentication data
              ssoService.storeAuthData(token, userAuthority, userProfile);

              console.log('🔐 User authenticated via postMessage');
              console.log('👤 User profile:', userProfile);
              console.log('🏷️ User authority:', userAuthority);

              // Notify parent that token was received
              (event.source as Window)?.postMessage('token_received', '*');

              // Update user roles from the received profile
              if (userProfile.roles) {
                userRoles.value = userProfile.roles;
                console.log('🔍 User roles updated from SSO:', userRoles.value);
              }

              // Stop loading after token is processed
              loading.value = false;
              console.log('✅ SSO token processed, stopping loading state');

              // If user has authority, auto-select it and proceed
              if (userAuthority && authorities.value.some(auth => auth.code === userAuthority)) {
                selectedAuthority.value = userAuthority as Authority;
                console.log('🎯 Auto-selected authority:', userAuthority);

                // Automatically proceed to chat if authority is valid
                // setTimeout(() => {
                //   handleContinue();
                // }, 500);
              }
            } else {
              console.warn('⚠️ Failed to extract user authority or profile from token');
              // Stop loading even if token processing fails
              loading.value = false;
            }
          } else {
            console.error('❌ Failed to decode token payload');
            // Stop loading if token decoding fails
            loading.value = false;
          }
        } catch (error) {
          console.error('❌ Error processing SSO token from postMessage:', error);
          // Stop loading if there's an error
          loading.value = false;
        }
      }
    };

    // Add the message listener
    window.addEventListener('message', handleSSO);

    // Check existing user profile
    const userProfile = ssoService.getUserProfile();
    if (userProfile && userProfile.roles) {
      userRoles.value = userProfile.roles;
      console.log('🔍 User roles from SSO:', userRoles.value);
      console.log(
        '📋 Available authorities:',
        authorities.value.map(auth => auth.code)
      );

      // Stop loading if user profile already exists
      loading.value = false;
      console.log('✅ Existing user profile found, stopping loading state');
    } else {
      console.log('⚠️ No user profile or roles found - user needs SSO authentication');
      // Keep loading active until SSO authentication is complete
    }

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', handleSSO);
    };
  });

  // Redirect to SSO Portal Mock (development only)
  const redirectToSSOPortal = () => {
    if (!isDevelopment.value) {
      console.warn('⚠️ SSO Portal Mock redirect only available in development');
      return;
    }

    redirecting.value = true;

    try {
      // Close the modal first
      showSSOModal.value = false;

      // Open SSO portal mock in new window
      const ssoPortalUrl = `${window.location.origin}/sso-portal-mock.html`;
      console.log('🚀 Opening SSO Portal Mock:', ssoPortalUrl);

      window.open(ssoPortalUrl, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');

      // Show info message
      console.log('💡 SSO Portal opened in new window. Complete authentication there and return to this page.');
    } catch (error) {
      console.error('❌ Error opening SSO Portal:', error);
    } finally {
      redirecting.value = false;
    }
  };

  const handleContinue = async () => {
    if (!selectedAuthority.value) return;

    // Check if user has valid authentication before proceeding
    const authData = ssoService.getAuthData();
    const hasValidToken = authData.isAuthenticated && authData.token;
    const hasAuthority = authData.authority;

    console.log(`has valid token: ${hasValidToken}`);
    console.log(`has authority: ${hasAuthority}`);
    console.log(`is development: ${isDevelopment}`);

    // If no valid authentication and in development, show SSO modal
    if ((!hasValidToken || !hasAuthority) && isDevelopment.value) {
      console.log('🔔 No valid authentication found, showing SSO modal');
      showSSOModal.value = true;
      return;
    }

    // If in production and no valid authentication, show error
    if (!hasValidToken || !hasAuthority) {
      console.error('❌ No valid authentication found in production environment');
      // You could show a toast/snackbar here instead of modal
      window.location.href = 'https://portal.peruri.co.id';
      return;
    }

    loading.value = true;
    console.log('🚀 Starting authentication and navigation process');

    try {
      // Set authority and authenticate user via SSO simulation
      await setAuthorityAndAuthenticate(selectedAuthority.value);

      console.log('✅ Authentication successful, navigating to chat');
      // Navigate to chat bot page
      router.push('/');
    } catch (error) {
      console.error('Authority selection error:', error);
      loading.value = false; // Stop loading on error
    }
    // Note: loading will be stopped when the component unmounts due to navigation
  };
</script>

<style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Manrope', sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 2rem;
  }

  .login-content {
    width: 100%;
    max-width: 600px;
    text-align: center;
  }

  .authority-selection {
    background: white;
    padding: 3rem 2.5rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .welcome-title {
    font-size: 2rem;
    font-weight: 700;
    color: #202887;
    margin-bottom: 0.5rem;
    letter-spacing: normal;
  }

  .welcome-subtitle {
    color: #555;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  /* Authority filter alert styling */
  .authority-selection :deep(.v-alert) {
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .authority-selection :deep(.v-alert.v-alert--density-compact) {
    padding: 8px 12px;
  }

  .authority-selection :deep(.v-alert--variant-tonal) {
    border: 1px solid rgba(var(--v-theme-surface-variant), 0.3);
  }

  .authority-dropdown {
    margin-bottom: 2rem;
  }

  .authority-dropdown :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .authority-dropdown :deep(.v-field:hover) {
    border-color: #202887;
    box-shadow: 0 2px 8px rgba(32, 40, 135, 0.1);
  }

  .authority-dropdown :deep(.v-field--focused) {
    border-color: #202887;
    box-shadow: 0 0 0 3px rgba(32, 40, 135, 0.1);
  }

  .authority-dropdown :deep(.v-field__input) {
    font-weight: 500;
    color: #2c3e50;
    background-color: transparent;
  }

  .authority-dropdown :deep(.v-label) {
    color: #6c757d;
    font-weight: 500;
  }

  .authority-dropdown :deep(.v-field--focused .v-label) {
    color: #202887;
  }

  .authority-dropdown :deep(.v-input__details) {
    color: #6c757d;
  }

  /* Dropdown menu styling */
  .authority-dropdown :deep(.v-overlay__content) {
    background-color: #ffffff;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .authority-option {
    padding: 6px 10px;
    transition: all 0.2s ease;
    background-color: #ffffff;
  }

  .authority-option:hover {
    background-color: #f8f9ff;
  }

  .authority-option-title {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1rem;
  }

  .authority-option-description {
    color: #6c757d;
    font-size: 0.85rem;
    line-height: 1.3;
    margin-top: 2px;
  }

  .authority-dropdown :deep(.v-list-item--active) {
    background-color: #f0f7ff !important;
  }

  .authority-dropdown :deep(.v-list-item--active .authority-option-title) {
    color: #202887 !important;
  }

  .continue-btn {
    background-color: #202887 !important;
    color: white !important;
    font-weight: 600;
    text-transform: none;
    font-size: 1rem;
    border-radius: 8px;
    height: 48px;
    font-family: 'Manrope', sans-serif;
    margin-top: 1rem;
  }

  .continue-btn:hover {
    background-color: #1a1f6b !important;
  }

  /* SSO Modal Styles */
  .sso-modal-title {
    background-color: #f8f9ff;
    color: #202887;
    font-weight: 600;
    border-bottom: 1px solid #e3e3e3;
  }

  .sso-modal-content {
    padding: 1.5rem;
  }

  .sso-modal-actions {
    padding: 1rem 1.5rem;
    background-color: #f8f9ff;
    border-top: 1px solid #e3e3e3;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .login-container {
      padding: 1rem;
    }

    .authority-selection {
      padding: 2rem 1.5rem;
    }

    .welcome-title {
      font-size: 1.8rem;
    }

    .welcome-subtitle {
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .continue-btn {
      height: 48px;
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .authority-selection {
      padding: 1.5rem 1rem;
    }

    .welcome-title {
      font-size: 1.8rem;
    }

    .authority-dropdown :deep(.v-field__input) {
      font-size: 0.9rem;
    }

    .authority-option {
      padding: 0.8rem 1rem;
    }

    .authority-option-title {
      font-size: 0.95rem;
    }

    .authority-option-description {
      font-size: 0.8rem;
    }
  }
</style>
