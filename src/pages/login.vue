<template>
  <div class="login-container">
    <div class="login-content">
      <!-- Left side - Image -->
      <div class="login-image">
        <img src="../assets/peruri_front_gate_office.png" alt="PERURI" class="peruri-background-image" />
      </div>

      <!-- Right side - Login Form -->
      <div class="login-form-container">
        <div class="login-form">
          <div class="login-header">
            <h1 class="login-title">LOGIN</h1>
            <p class="login-subtitle">Selamat Datang, Silahkan masuk ke akun aplikasi anda!</p>
          </div>

          <v-form @submit.prevent="handleLogin" class="form">
            <div class="form-group">
              <label class="form-label">Username / NIP</label>
              <v-text-field
                v-model="credentials.username"
                placeholder="Masukkan Username / NIP"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.username"
                class="login-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <v-text-field
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="at least 8 characters"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.password"
                class="login-input"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="form-options">
              <v-checkbox
                v-model="rememberMe"
                label="Remember me"
                density="compact"
                hide-details
                class="remember-checkbox"
              />
              <a href="#" class="forgot-password">Forgot Password ?</a>
            </div>

            <v-btn
              type="submit"
              color="primary"
              variant="flat"
              size="large"
              block
              class="login-btn"
              :loading="isLoading"
              :disabled="!isFormValid"
            >
              Login
            </v-btn>

            <!-- Quick Demo Login Button -->
            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              block
              class="demo-login-btn"
              @click="handleDemoLogin"
              :disabled="isLoading"
            >
              Quick Demo Login
            </v-btn>

            <!-- Clear Auth Button for debugging -->
            <v-btn
              color="error"
              variant="text"
              size="small"
              block
              class="clear-auth-btn"
              @click="handleClearAuth"
              :disabled="isLoading"
            >
              Clear Auth Data (Debug)
            </v-btn>

            <div class="register-link">
              Belum terdaftar?
              <router-link to="/register" class="register-link-text">Register disini</router-link>
            </div>
          </v-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';

  interface LoginCredentials {
    username: string;
    password: string;
  }

  const router = useRouter();
  const { login } = useAuth();

  const credentials = ref<LoginCredentials>({
    username: '',
    password: '',
  });

  const errors = ref({
    username: '',
    password: '',
  });

  const showPassword = ref(false);
  const rememberMe = ref(false);
  const isLoading = ref(false);

  const isFormValid = computed(() => {
    return credentials.value.username.length > 0 && credentials.value.password.length >= 8;
  });

  const validateForm = () => {
    errors.value = { username: '', password: '' };
    let isValid = true;

    if (!credentials.value.username) {
      errors.value.username = 'Username / NIP is required';
      isValid = false;
    }

    if (!credentials.value.password) {
      errors.value.password = 'Password is required';
      isValid = false;
    } else if (credentials.value.password.length < 8) {
      errors.value.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
      // Use the auth composable login function
      const success = await login(credentials.value.username, credentials.value.password);

      if (success) {
        // Navigate to home/chat page
        router.push('/');
      } else {
        errors.value.username = 'Invalid credentials';
      }
    } catch (error) {
      console.error('Login error:', error);
      errors.value.username = 'Login failed. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };

  const handleDemoLogin = async () => {
    isLoading.value = true;

    try {
      // Use demo credentials
      const success = await login('demo_user', 'password123');

      if (success) {
        router.push('/');
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const handleClearAuth = () => {
    // Clear all auth data for debugging
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    console.log('Auth data cleared');
    window.location.reload();
  };
</script>

<style scoped>
  .login-container {
    min-height: 100vh;
    max-height: 100vh;
    display: flex;
    font-family: 'Manrope', sans-serif;
    overflow: hidden;
  }

  .login-content {
    display: flex;
    width: 100%;
    height: 100vh;
  }

  .login-image {
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

  .login-form-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    padding: 2rem;
    overflow-y: auto;
    max-height: 100vh;
  }

  .login-form {
    width: 100%;
    max-width: 400px;
    background: white;
    padding: 3rem 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-title {
    font-size: 2rem;
    font-weight: 700;
    color: #202887;
    margin-bottom: 0.5rem;
  }

  .login-subtitle {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.4;
    margin: 0;
  }

  .form {
    width: 100%;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .login-input :deep(.v-field) {
    border-radius: 8px;
  }

  .login-input :deep(.v-field__input) {
    padding: 12px 16px !important;
    font-family: 'Manrope', sans-serif;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .remember-checkbox :deep(.v-selection-control) {
    min-height: auto;
  }

  .remember-checkbox :deep(.v-label) {
    font-size: 0.85rem;
    color: #666;
    font-family: 'Manrope', sans-serif;
  }

  .forgot-password {
    color: #202887;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .forgot-password:hover {
    text-decoration: underline;
  }

  .login-btn {
    background-color: #202887 !important;
    color: white !important;
    font-weight: 600;
    text-transform: none;
    font-size: 1rem;
    border-radius: 8px;
    height: 48px;
    margin-bottom: 1.5rem;
    font-family: 'Manrope', sans-serif;
  }

  .login-btn:hover {
    background-color: #1a1f6b !important;
  }

  .demo-login-btn {
    color: #d398e7 !important;
    border-color: #d398e7 !important;
    font-weight: 600;
    text-transform: none;
    font-size: 0.9rem;
    border-radius: 8px;
    height: 44px;
    margin-bottom: 1.5rem;
    margin-top: 0.5rem;
    font-family: 'Manrope', sans-serif;
  }

  .demo-login-btn:hover {
    background-color: rgba(211, 152, 231, 0.1) !important;
  }

  .clear-auth-btn {
    font-size: 0.75rem !important;
    margin-top: 0.5rem;
    opacity: 0.7;
    font-family: 'Manrope', sans-serif;
  }

  .clear-auth-btn:hover {
    opacity: 1;
  }

  .register-link {
    text-align: center;
    font-size: 0.9rem;
    color: #666;
  }

  .register-link-text {
    color: #202887;
    text-decoration: none;
    font-weight: 600;
  }

  .register-link-text:hover {
    text-decoration: underline;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .login-content {
      flex-direction: column;
    }

    .login-image {
      min-height: 30vh;
      flex: none;
    }

    .login-form-container {
      flex: none;
      padding: 1rem;
    }

    .login-form {
      padding: 2rem 1.5rem;
    }

    .login-title {
      font-size: 1.75rem;
    }
  }

  @media (max-width: 480px) {
    .form-options {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .forgot-password {
      align-self: flex-end;
    }
  }
</style>
