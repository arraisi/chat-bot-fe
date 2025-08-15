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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/chat-bot-fe/'),
  routes: routes.length > 0 ? routes : fallbackRoutes,
});

// SSO Token handling
const handleSSOToken = () => {
  console.log("SSO token handler initialized");
  
  window.addEventListener("message", (event) => {
    console.log("Received SSO event", event);
    
    // Validate origin - update this to match your SSO origin
    if (event.origin !== import.meta.env.VITE_APP_ORIGIN) return;

    if (event.data === "ping") {
      (event.source as Window)?.postMessage("ready", event.origin);
    }

    if (event.data.token) {
      console.log("Received SSO token:", event.data.token);
      
      try {
        // Decode JWT token using SSO service
        const tokenPayload = ssoService.decodeToken(event.data.token);
        if (!tokenPayload) {
          throw new Error("Failed to decode token");
        }

        console.log("Decoded token payload:", tokenPayload);

        // Extract user authority from aiva-peruri roles
        const userAuthority = ssoService.extractUserAuthority(tokenPayload);

        if (userAuthority) {
          // Create user profile
          const userProfile = ssoService.createUserProfile(tokenPayload);
          
          // Store authentication data
          ssoService.storeAuthData(event.data.token, userAuthority, userProfile);

          console.log("User authenticated with authority:", userAuthority);
          console.log("User profile:", userProfile);
          
          // Send confirmation back to parent
          (event.source as Window)?.postMessage("token_received", event.origin);
          
          // Redirect to home if currently on login/register page
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            window.location.href = '/';
          }
        } else {
          console.error("No aiva-peruri roles found in token");
          ssoService.clearAuthData();
        }
      } catch (error) {
        console.error("Error processing SSO token:", error);
        ssoService.clearAuthData();
      }
    }
  });
};

// Default route guard with SSO support
router.beforeEach((to, from, next) => {
  // Initialize SSO token handler
  handleSSOToken();

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
    if (ssoService.isTokenExpired(authData.token)) {
      console.log("Token expired, clearing auth data");
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
