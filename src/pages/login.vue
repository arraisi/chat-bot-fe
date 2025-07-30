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

            <div class="authority-grid">
              <v-card
                v-for="authority in authorities"
                :key="authority.code"
                class="authority-card"
                :class="{ selected: selectedAuthority === authority.code }"
                @click="selectAuthority(authority.code)"
                hover
                elevation="2"
              >
                <v-card-title class="authority-card-title">
                  {{ authority.name }}
                </v-card-title>
                <v-card-text class="authority-card-description">
                  {{ authority.description }}
                </v-card-text>
              </v-card>
            </div>

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

  const selectAuthority = (authority: Authority) => {
    selectedAuthority.value = authority;
  };

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

  .authority-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .authority-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid #e0e0e0;
    border-radius: 12px !important;
    background-color: white;
  }

  .authority-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    border-color: #202887;
  }

  .authority-card.selected {
    border-color: #202887;
    background-color: rgba(32, 40, 135, 0.05);
  }

  /* Default (inactive) state - dark text for better visibility */
  .authority-card-title {
    font-weight: 600 !important;
    font-size: 1.1rem !important;
    color: #333 !important;
    text-align: center;
    padding-bottom: 0.5rem !important;
    transition: color 0.3s ease;
  }

  .authority-card-description {
    font-size: 0.85rem !important;
    color: #666 !important;
    text-align: center;
    line-height: 1.4;
    padding-top: 0 !important;
    transition: color 0.3s ease;
  }

  /* Selected state - primary color text */
  .authority-card.selected .authority-card-title {
    color: #202887 !important;
  }

  .authority-card.selected .authority-card-description {
    color: #444 !important;
  }

  /* Hover state - primary color text */
  .authority-card:hover .authority-card-title {
    color: #202887 !important;
  }

  .authority-card:hover .authority-card-description {
    color: #444 !important;
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

    .authority-grid {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .landing-form {
      max-width: 100%;
    }

    .authority-card-title {
      font-size: 1rem !important;
    }

    .authority-card-description {
      font-size: 0.8rem !important;
    }
  }
</style>
