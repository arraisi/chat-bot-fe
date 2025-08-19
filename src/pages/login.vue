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

          <v-select
            v-model="selectedAuthority"
            :items="authorities"
            item-title="name"
            item-value="code"
            label="Pilih Otoritas"
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
          >
            Lanjutkan ke Chat Bot
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
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
  const loading = ref(false);
  const userRoles = ref<string[]>([]);

  const allAuthorities: AuthorityOption[] = [
    {
      code: 'ALL',
      name: 'Semua Akses',
      description: 'Akses penuh ke semua fitur Chat Bot',
    },
    {
      code: 'SDM',
      name: 'SDM',
      description: 'Akses Chat Bot untuk divisi Sumber Daya Manusia',
    },
    {
      code: 'HUKUM',
      name: 'Hukum',
      description: 'Akses Chat Bot untuk divisi Hukum',
    },
    {
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Akses administrasi sistem Chat Bot',
    },
  ];

  // Filter authorities based on user roles
  const authorities = computed(() => {
    if (userRoles.value.length === 0) {
      // If no roles detected, show all authorities (fallback)
      return allAuthorities;
    }

    const hasAllRole = userRoles.value.some(role => role.toUpperCase() === 'ALL');
    const hasAdminRole = userRoles.value.some(role => role.toUpperCase() === 'ADMIN');
    const hasHukumRole = userRoles.value.some(role => role.toUpperCase() === 'HUKUM');
    const hasSdmRole = userRoles.value.some(role => role.toUpperCase() === 'SDM');

    // If user has ALL or ADMIN role, show all authorities
    if (hasAllRole || hasAdminRole) {
      return allAuthorities;
    }

    // Filter based on specific roles - don't include "ALL" option
    const filteredAuthorities: AuthorityOption[] = [];

    if (hasHukumRole) {
      filteredAuthorities.push(allAuthorities.find(auth => auth.code === 'HUKUM')!);
    }

    if (hasSdmRole) {
      filteredAuthorities.push(allAuthorities.find(auth => auth.code === 'SDM')!);
    }

    // Return only the specific role authorities (no "ALL" option for specific roles)
    return filteredAuthorities.length > 0 ? filteredAuthorities : allAuthorities;
  });

  // Get user roles from SSO token on component mount
  onMounted(() => {
    const userProfile = ssoService.getUserProfile();
    if (userProfile && userProfile.roles) {
      userRoles.value = userProfile.roles;
      console.log('🔍 User roles from SSO:', userRoles.value);
      console.log(
        '📋 Available authorities:',
        authorities.value.map(auth => auth.code)
      );
    } else {
      console.log('⚠️ No user profile or roles found - user needs SSO authentication');
    }
  });

  const handleContinue = async () => {
    if (!selectedAuthority.value) return;

    loading.value = true;

    try {
      // Set authority and authenticate user via SSO simulation
      await setAuthorityAndAuthenticate(selectedAuthority.value);

      // Navigate to chat bot page
      router.push('/');
    } catch (error) {
      console.error('Authority selection error:', error);
    } finally {
      loading.value = false;
    }
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
