import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const isAuthenticated = ref(true);
const currentUser = ref<string | null>('demo_user');
const authToken = ref<string | null>('dummy_token_default_12345');
const isInitialized = ref(true);

// Generate a dummy token for demo purposes
const generateDummyToken = (username: string): string => {
  const timestamp = Date.now();
  const userHash = btoa(username).slice(0, 8);
  return `dummy_token_${userHash}_${timestamp}`;
};

export const useAuth = () => {
  const router = useRouter();

  // Check if user is logged in (from localStorage)
  const checkAuth = (): boolean => {
    try {
      const authStatus = localStorage.getItem('isAuthenticated');
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('authToken');

      console.log('Checking auth:', { authStatus, username, token: token ? 'exists' : 'missing' });

      if (authStatus === 'true' && username && token) {
        isAuthenticated.value = true;
        currentUser.value = username;
        authToken.value = token;
        isInitialized.value = true;
        console.log('Auth check: authenticated');
        return true;
      } else {
        isAuthenticated.value = false;
        currentUser.value = null;
        authToken.value = null;
        isInitialized.value = true;
        console.log('Auth check: not authenticated');
        return false;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      isAuthenticated.value = false;
      currentUser.value = null;
      authToken.value = null;
      isInitialized.value = true;
      return false;
    }
  };

  // Login function with dummy token
  const login = (username: string, password: string): Promise<boolean> => {
    return new Promise(resolve => {
      // Simulate API delay
      setTimeout(() => {
        // Simple validation for demo - accept any username with password >= 8 chars
        if (username.trim() && password.length >= 8) {
          const token = generateDummyToken(username);

          isAuthenticated.value = true;
          currentUser.value = username;
          authToken.value = token;

          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('authToken', token);

          console.log('Login successful:', { username, token });
          resolve(true);
        } else {
          console.log('Login failed: Invalid credentials');
          resolve(false);
        }
      }, 800); // Simulate network delay
    });
  };

  // Logout function
  const logout = () => {
    isAuthenticated.value = false;
    currentUser.value = null;
    authToken.value = null;

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');

    router.push('/login');
  };

  // Require authentication - redirect to login if not authenticated
  const requireAuth = (): boolean => {
    const currentRoute = router.currentRoute.value.path;

    if (!checkAuth()) {
      // Only redirect if not already on login or register page
      if (currentRoute !== '/login' && currentRoute !== '/register') {
        router.push('/login');
      }
      return false;
    }
    return true;
  };

  // Initialize auth state immediately
  const initializeAuth = () => {
    if (!isInitialized.value) {
      checkAuth();
    }
  };

  // Auto-initialize
  initializeAuth();

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    authToken: computed(() => authToken.value),
    isInitialized: computed(() => isInitialized.value),
    login,
    logout,
    checkAuth,
    requireAuth,
    initializeAuth,
  };
};
