import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Authority } from '../types/chat';

const isAuthenticated = ref(true);
const currentUser = ref<string | null>('sso_user');
const authToken = ref<string | null>('sso_token_12345');
const userAuthority = ref<Authority | null>(null);
const isInitialized = ref(true);

// Generate a dummy token for SSO simulation
const generateSSOToken = (authority: Authority): string => {
  const timestamp = Date.now();
  const authorityHash = btoa(authority).slice(0, 8);
  return `sso_token_${authorityHash}_${timestamp}`;
};

export const useAuth = () => {
  const router = useRouter();

  // Check if user is authenticated and has authority (from localStorage)
  const checkAuth = (): boolean => {
    try {
      const authStatus = localStorage.getItem('isAuthenticated');
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('authToken');
      const authority = localStorage.getItem('userAuthority') as Authority | null;

      console.log('Checking auth:', { authStatus, username, token: token ? 'exists' : 'missing', authority });

      if (authStatus === 'true' && username && token && authority) {
        isAuthenticated.value = true;
        currentUser.value = username;
        authToken.value = token;
        userAuthority.value = authority;
        isInitialized.value = true;
        console.log('Auth check: authenticated with authority', authority);
        return true;
      } else {
        isAuthenticated.value = false;
        currentUser.value = null;
        authToken.value = null;
        userAuthority.value = null;
        isInitialized.value = true;
        console.log('Auth check: not authenticated or missing authority');
        return false;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      isAuthenticated.value = false;
      currentUser.value = null;
      authToken.value = null;
      userAuthority.value = null;
      isInitialized.value = true;
      return false;
    }
  };

  // SSO authority-based authentication
  const setAuthorityAndAuthenticate = (authority: Authority): Promise<boolean> => {
    return new Promise(resolve => {
      // Simulate SSO API delay
      setTimeout(() => {
        const token = generateSSOToken(authority);
        const username = `sso_user_${authority.toLowerCase()}`;

        isAuthenticated.value = true;
        currentUser.value = username;
        authToken.value = token;
        userAuthority.value = authority;

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userAuthority', authority);

        console.log('SSO authentication successful:', { username, authority, token });
        resolve(true);
      }, 1000); // Simulate SSO processing delay
    });
  };

  // Legacy login function (kept for register page if needed)
  const login = (username: string, password: string): Promise<boolean> => {
    return new Promise(resolve => {
      // Simulate API delay
      setTimeout(() => {
        // Simple validation for demo - accept any username with password >= 8 chars
        if (username.trim() && password.length >= 8) {
          const token = generateSSOToken('ALL'); // Default to ALL authority for legacy login

          isAuthenticated.value = true;
          currentUser.value = username;
          authToken.value = token;
          userAuthority.value = 'ALL';

          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('authToken', token);
          localStorage.setItem('userAuthority', 'ALL');

          console.log('Legacy login successful:', { username, token });
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
    userAuthority.value = null;

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAuthority');

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
    userAuthority: computed(() => userAuthority.value),
    isInitialized: computed(() => isInitialized.value),
    login,
    logout,
    checkAuth,
    requireAuth,
    initializeAuth,
    setAuthorityAndAuthenticate,
  };
};
