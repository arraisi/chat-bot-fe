<template>
  <div class="register-container">
    <div class="register-content">
      <!-- Left side - Image -->
      <div class="register-image">
        <div class="image-overlay">
          <img src="../assets/peruri_front_gate_office.png" alt="PERURI" class="peruri-background-image" />
        </div>
      </div>

      <!-- Right side - Register Form -->
      <div class="register-form-container">
        <div class="register-form">
          <div class="register-header">
            <h1 class="register-title">REGISTER</h1>
            <p class="register-subtitle">Buat akun baru untuk mengakses aplikasi PeruriBot!</p>
          </div>

          <v-form @submit.prevent="handleRegister" class="form">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <v-text-field
                v-model="formData.fullName"
                placeholder="Masukkan nama lengkap"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.fullName"
                class="register-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Username / NIP</label>
              <v-text-field
                v-model="formData.username"
                placeholder="Masukkan Username / NIP"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.username"
                class="register-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <v-text-field
                v-model="formData.email"
                type="email"
                placeholder="Masukkan email"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.email"
                class="register-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <v-text-field
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="at least 8 characters"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.password"
                class="register-input"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <v-text-field
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Ulangi password"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :error-messages="errors.confirmPassword"
                class="register-input"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />
            </div>

            <div class="form-options">
              <v-checkbox v-model="agreeToTerms" density="compact" hide-details class="terms-checkbox">
                <template #label>
                  <span class="terms-text">
                    I agree to the
                    <a href="#" class="terms-link">Terms & Conditions</a>
                  </span>
                </template>
              </v-checkbox>
            </div>

            <v-btn
              type="submit"
              color="primary"
              variant="flat"
              size="large"
              block
              class="register-btn"
              :loading="isLoading"
              :disabled="!isFormValid"
            >
              Register
            </v-btn>

            <div class="login-link">
              Sudah punya akun?
              <router-link to="/login" class="login-link-text">Login disini</router-link>
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

  interface RegisterData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  const router = useRouter();

  const formData = ref<RegisterData>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const errors = ref({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const agreeToTerms = ref(false);
  const isLoading = ref(false);

  const isFormValid = computed(() => {
    return (
      formData.value.fullName.length > 0 &&
      formData.value.username.length > 0 &&
      formData.value.email.length > 0 &&
      formData.value.password.length >= 8 &&
      formData.value.confirmPassword === formData.value.password &&
      agreeToTerms.value
    );
  });

  const validateForm = () => {
    errors.value = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!formData.value.fullName) {
      errors.value.fullName = 'Full name is required';
      isValid = false;
    }

    if (!formData.value.username) {
      errors.value.username = 'Username / NIP is required';
      isValid = false;
    }

    if (!formData.value.email) {
      errors.value.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
      errors.value.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.value.password) {
      errors.value.password = 'Password is required';
      isValid = false;
    } else if (formData.value.password.length < 8) {
      errors.value.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.value.confirmPassword) {
      errors.value.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.value.password !== formData.value.confirmPassword) {
      errors.value.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, simulate successful registration
      console.log('Registration data:', formData.value);

      // Navigate to login page with success message
      router.push('/login?registered=true');
    } catch (error) {
      console.error('Registration error:', error);
      errors.value.username = 'Registration failed. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };
</script>

<style scoped>
  .register-container {
    min-height: 100vh;
    display: flex;
    font-family: 'Manrope', sans-serif;
  }

  .register-content {
    display: flex;
    width: 100%;
    min-height: 100vh;
  }

  .register-image {
    flex: 1;
    position: relative;
    background: linear-gradient(135deg, #202887 0%, #1a1f6b 100%);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
  }

  .peruri-background-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .register-form-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    padding: 2rem;
    overflow-y: auto;
  }

  .register-form {
    width: 100%;
    max-width: 450px;
    background: white;
    padding: 3rem 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .register-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .register-title {
    font-size: 2rem;
    font-weight: 700;
    color: #202887;
    margin-bottom: 0.5rem;
  }

  .register-subtitle {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.4;
    margin: 0;
  }

  .form {
    width: 100%;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    display: block;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .register-input :deep(.v-field) {
    border-radius: 8px;
  }

  .register-input :deep(.v-field__input) {
    padding: 12px 16px !important;
    font-family: 'Manrope', sans-serif;
  }

  .form-options {
    margin-bottom: 1.5rem;
  }

  .terms-checkbox :deep(.v-selection-control) {
    min-height: auto;
  }

  .terms-text {
    font-size: 0.85rem;
    color: #666;
    font-family: 'Manrope', sans-serif;
  }

  .terms-link {
    color: #202887;
    text-decoration: none;
    font-weight: 500;
  }

  .terms-link:hover {
    text-decoration: underline;
  }

  .register-btn {
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

  .register-btn:hover {
    background-color: #1a1f6b !important;
  }

  .login-link {
    text-align: center;
    font-size: 0.9rem;
    color: #666;
  }

  .login-link-text {
    color: #202887;
    text-decoration: none;
    font-weight: 600;
  }

  .login-link-text:hover {
    text-decoration: underline;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .register-content {
      flex-direction: column;
    }

    .register-image {
      min-height: 25vh;
      flex: none;
    }

    .register-form-container {
      flex: none;
      padding: 1rem;
    }

    .register-form {
      padding: 2rem 1.5rem;
    }

    .register-title {
      font-size: 1.75rem;
    }
  }
</style>
