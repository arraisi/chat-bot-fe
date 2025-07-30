/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto';
import { routes } from 'vue-router/auto-routes';

// Fallback routes in case auto-routes fail
const fallbackRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes.length > 0 ? routes : fallbackRoutes,
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
