<template>
  <div class="landing-container">
    <div class="landing-content">
      <!-- Left side - Image -->
      <div class="landing-image">
        <img src="../assets/peruri_front_gate_office.png" alt="PERURI" class="peruri-background-image" />
      </div>

      <!-- Right side - Authority Selection -->
      <div class="landing-form-container">
        <div class="landing-form">
          <div class="landing-header">
            <h1 class="landing-title">SELAMAT DATANG</h1>
            <p class="landing-subtitle">Silahkan pilih otoritas untuk mengakses aplikasi Chat Bot PERURI</p>
          </div>

          <div class="authority-selection">
            <h2 class="authority-title">Pilih Otoritas Anda</h2>

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
                  <v-list-item-title class="authority-option-title">{{ item.title }}</v-list-item-title>
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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
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

  const authorities: AuthorityOption[] = [
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
  .landing-container {
    min-height: 100vh;
    max-height: 100vh;
    display: flex;
    font-family: 'Manrope', sans-serif;
    overflow: hidden;
  }

  .landing-content {
    display: flex;
    width: 100%;
    height: 100vh;
  }

  .landing-image {
    flex: 1;
    position: relative;
    background: linear-gradient(135deg, #202887 0%, #1a1f6b 100%);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    overflow: hidden;
  }

  .peruri-background-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .landing-form-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    padding: 2rem;
    overflow-y: auto;
    max-height: 100vh;
  }

  .landing-form {
    width: 100%;
    max-width: 500px;
    background: white;
    padding: 3rem 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .landing-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .landing-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: #202887;
    margin-bottom: 0.5rem;
  }

  .landing-subtitle {
    color: #666;
    font-size: 1rem;
    line-height: 1.4;
    margin: 0;
  }

  .authority-selection {
    width: 100%;
  }

  .authority-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
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
    padding: 12px 16px;
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

  /* Selected item styling */
  .authority-dropdown :deep(.v-field--active .v-field__input) {
    color: #202887;
    font-weight: 600;
  }

  /* Dropdown arrow styling */
  .authority-dropdown :deep(.v-field__append-inner .v-icon) {
    color: #6c757d;
    transition: color 0.3s ease;
  }

  .authority-dropdown :deep(.v-field--focused .v-field__append-inner .v-icon) {
    color: #202887;
  }

  /* Selection highlight */
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
    .landing-content {
      flex-direction: column;
    }

    .landing-image {
      min-height: 30vh;
      flex: none;
    }

    .landing-form-container {
      flex: none;
      padding: 1rem;
    }

    .landing-form {
      padding: 2rem 1.5rem;
    }

    .landing-title {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 480px) {
    .landing-form {
      max-width: 100%;
    }

    .authority-dropdown :deep(.v-field__input) {
      font-size: 0.9rem;
    }

    .authority-option-title {
      font-size: 0.95rem;
    }

    .authority-option-description {
      font-size: 0.8rem;
    }
  }
</style>
