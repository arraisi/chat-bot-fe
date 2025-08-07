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
          primary: '#FFFFFF', // White primary color
          secondary: '#1a1a1a', // Custom secondary color (former primary)
          accent: '#D398E7', // Custom accent color (former secondary)
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#FFFFFF', // White background
          surface: '#202887', // Secondary color for surfaces (sidebar, app bar)
          'on-primary': '#202887', // Secondary color text on white primary background
          'on-secondary': '#FFFFFF', // White text on secondary background
          'on-surface': '#FFFFFF', // White text on surface (sidebar)
          'on-background': '#202887', // Smooth black text on white background
        },
      },
    },
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
    },
    VTextarea: {
      variant: 'outlined',
    },
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
