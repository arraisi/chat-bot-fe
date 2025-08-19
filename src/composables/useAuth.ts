import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ssoService, { type UserProfile } from '../services/ssoService';
import type { Authority } from '../types/chat';

const isAuthenticated = ref(false);
const currentUser = ref<string | null>(null);
const authToken = ref<string | null>(null);
const userAuthority = ref<Authority | null>(null);
const userProfile = ref<UserProfile | null>(null);
const isInitialized = ref(false);

// Generate a dummy token for SSO simulation (legacy function)
const generateSSOToken = (authority: Authority): string => {
  const timestamp = Date.now();
  const authorityHash = btoa(authority).slice(0, 8);
  return `sso_token_${authorityHash}_${timestamp}`;
};

export const useAuth = () => {
  const router = useRouter();

  // Check if user is authenticated and has authority (using SSO service)
  const checkAuth = (): boolean => {
    try {
      const authData = ssoService.getAuthData();

      console.log('Checking auth:', authData);

      if (authData.isAuthenticated && authData.authority && authData.token) {
        // Check if token is expired
        if (ssoService.isTokenExpired(authData.token)) {
          console.log('Token expired, clearing auth data');
          logout();
          return false;
        }

        isAuthenticated.value = true;
        currentUser.value = authData.profile?.username || 'sso_user';
        authToken.value = authData.token;
        userAuthority.value = authData.authority as Authority;
        userProfile.value = authData.profile;
        isInitialized.value = true;

        // Configure axios with token
        ssoService.configureAxiosToken(authData.token);

        console.log('Auth check: authenticated with authority', authData.authority);
        return true;
      } else {
        // Fall back to legacy localStorage check for backward compatibility
        const legacyAuthStatus = localStorage.getItem('isAuthenticated');
        const legacyUsername = localStorage.getItem('username');
        const legacyToken = localStorage.getItem('authToken');
        const legacyAuthority = localStorage.getItem('userAuthority') as Authority | null;

        if (legacyAuthStatus === 'true' && legacyUsername && legacyToken && legacyAuthority) {
          isAuthenticated.value = true;
          currentUser.value = legacyUsername;
          authToken.value = legacyToken;
          userAuthority.value = legacyAuthority;
          isInitialized.value = true;
          console.log('Auth check: authenticated with legacy data', legacyAuthority);
          return true;
        }

        isAuthenticated.value = false;
        currentUser.value = null;
        authToken.value = null;
        userAuthority.value = null;
        userProfile.value = null;
        isInitialized.value = true;
        console.log('Auth check: not authenticated');
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

  // SSO authority-based authentication (updated to use SSO service)
  const setAuthorityAndAuthenticate = (authority: Authority): Promise<boolean> => {
    return new Promise(resolve => {
      // Simulate SSO API delay for demo purposes
      setTimeout(() => {
        // Check if we have SSO data first
        const authData = ssoService.getAuthData();

        if (authData.isAuthenticated && authData.token && authData.profile) {
          // Use existing SSO data
          isAuthenticated.value = true;
          currentUser.value = authData.profile.username;
          authToken.value = authData.token;
          userAuthority.value = authority;
          userProfile.value = authData.profile;

          console.log('SSO authentication successful with existing data:', {
            username: authData.profile.username,
            authority,
            token: authData.token,
          });
          resolve(true);
        } else {
          // Fall back to legacy simulation
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

          console.log('Legacy SSO authentication successful:', { username, authority, token });
          resolve(true);
        }
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

  // Logout function (updated to use SSO service)
  const logout = () => {
    // Clear SSO data
    ssoService.clearAuthData();

    // Clear local state
    isAuthenticated.value = false;
    currentUser.value = null;
    authToken.value = null;
    userAuthority.value = null;
    userProfile.value = null;

    // Clear legacy localStorage data for backward compatibility
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

  // Helper methods for SSO integration
  const getUserDisplayName = () => {
    return userProfile.value?.name || currentUser.value || 'User';
  };

  const getUserEmail = () => {
    return userProfile.value?.email || '';
  };

  const getUserRoles = () => {
    return userProfile.value?.roles || [];
  };

  const hasAuthority = (requiredAuthority: string): boolean => {
    return ssoService.hasAuthority(requiredAuthority);
  };

  const hasAnyAuthority = (authorities: string[]): boolean => {
    return ssoService.hasAnyAuthority(authorities);
  };

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    authToken: computed(() => authToken.value),
    userAuthority: computed(() => userAuthority.value),
    userProfile: computed(() => userProfile.value),
    isInitialized: computed(() => isInitialized.value),
    login,
    logout,
    checkAuth,
    requireAuth,
    initializeAuth,
    setAuthorityAndAuthenticate,
    getUserDisplayName,
    getUserEmail,
    getUserRoles,
    hasAuthority,
    hasAnyAuthority,
  };
};
