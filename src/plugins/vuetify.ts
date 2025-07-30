/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#202887', // Custom primary color for sidebar
          secondary: '#D398E7', // Custom secondary color for hover/active states
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#FFFFFF', // White background
          surface: '#202887', // Primary color for surfaces (sidebar, app bar)
          'on-primary': '#FFFFFF', // White text on primary background
          'on-secondary': '#FFFFFF', // White text on secondary background
          'on-surface': '#FFFFFF', // White text on surface (sidebar)
          'on-background': '#1a1a1a', // Smooth black text on white background
        },
      },
    },
  },
});
