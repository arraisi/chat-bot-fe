/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto';
import { routes } from 'vue-router/auto-routes';
import ssoService from '../services/ssoService';

// Fallback routes in case auto-routes fail
const fallbackRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/index.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/register.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes.length > 0 ? routes : fallbackRoutes,
});

// Development debug info (can be removed in production)
if (import.meta.env.DEV) {
  console.log('Router initialized with base URL:', import.meta.env.BASE_URL);
  console.log('Using auto-routes:', routes.length > 0 ? 'Yes' : 'No (fallback)');
  console.log('Total routes available:', router.getRoutes().length);
}

// SSO Token handling from query parameters
const handleSSOToken = (route: any) => {
  console.log('Checking for SSO token in query parameters');

  // Check for access_token in query parameters
  const accessToken = route.query.access_token;

  if (accessToken && typeof accessToken === 'string') {
    console.log('Found access_token in query parameters');

    try {
      // Decode JWT token using SSO service
      const tokenPayload = ssoService.decodeToken(accessToken);
      if (!tokenPayload) {
        throw new Error('Failed to decode token');
      }

      console.log('Decoded token payload:', tokenPayload);

      // Extract user authority from aiva-peruri roles
      const userAuthority = ssoService.extractUserAuthority(tokenPayload);

      if (userAuthority) {
        // Create user profile
        const userProfile = ssoService.createUserProfile(tokenPayload);

        // Store authentication data
        ssoService.storeAuthData(accessToken, userAuthority, userProfile);

        console.log('User authenticated with authority:', userAuthority);
        console.log('User profile:', userProfile);

        // Remove access_token from URL to clean up the URL
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('access_token');
        window.history.replaceState({}, document.title, cleanUrl.toString());

        return true; // Token processed successfully
      } else {
        console.error('No aiva-peruri roles found in token');
        ssoService.clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Error processing SSO token:', error);
      ssoService.clearAuthData();
      return false;
    }
  }

  return false; // No token found
};

// Default route guard with SSO support
router.beforeEach((to, from, next) => {
  // Check for SSO token in query parameters first
  const tokenProcessed = handleSSOToken(to);

  if (tokenProcessed) {
    // Token was processed, redirect to clean URL
    next('/');
    return;
  }

  // Check if user is going to login page or already authenticated
  if (to.path === '/login') {
    next();
    return;
  }

  // Check if user is going to register page
  if (to.path === '/register') {
    next();
    return;
  }

  // For all other routes, check authentication and authority
  const authData = ssoService.getAuthData();

  if (authData.isAuthenticated && authData.authority && authData.token) {
    // Check if token is expired
    if (import.meta.env.PROD && ssoService.isTokenExpired(authData.token)) {
      console.log('Token expired, clearing auth data');
      ssoService.clearAuthData();
      next('/login');
      return;
    }

    // Configure axios with stored token
    ssoService.configureAxiosToken(authData.token);
    next();
  } else {
    // User is not authenticated or doesn't have authority, redirect to login
    next('/login');
  }
});

// Enhanced error handling for dynamic import issues
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    const reloadKey = 'vuetify:dynamic-reload';
    const reloadCount = parseInt(localStorage.getItem(reloadKey) || '0');

    if (reloadCount < 2) {
      console.log(`Reloading page to fix dynamic import error (attempt ${reloadCount + 1})`);
      localStorage.setItem(reloadKey, String(reloadCount + 1));
      window.location.reload();
    } else {
      console.error('Dynamic import error persists after 2 reload attempts', err);
      localStorage.removeItem(reloadKey);
      // Clear any cached modules and try a hard refresh
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      window.location.href = window.location.href;
    }
  } else {
    console.error('Router error:', err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;
