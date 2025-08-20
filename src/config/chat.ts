// Configuration for chat backend integration
export const CHAT_CONFIG = {
  // Enable backend integration (set to false to use localStorage only)
  USE_BACKEND: true,

  // API base URL
  API_BASE_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`,

  // Offline mode settings
  ENABLE_OFFLINE_MODE: true,
  OFFLINE_STORAGE_KEY: 'chat-sessions-offline',

  // Session settings
  MAX_SESSIONS: 100,
  MAX_MESSAGES_PER_SESSION: 1000,
  SESSION_CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // API timeout settings
  API_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second

  // Features
  FEATURES: {
    SEARCH: true,
    STATISTICS: true,
    EXPORT: false, // Future feature
    REAL_TIME: false, // Future feature
  },
};

// Environment-specific overrides
if (import.meta.env.PROD) {
  CHAT_CONFIG.API_BASE_URL = '/api';
  CHAT_CONFIG.API_TIMEOUT = 15000;
}

// Development mode overrides
if (import.meta.env.DEV) {
  CHAT_CONFIG.USE_BACKEND = true; // Enable backend for development
}
