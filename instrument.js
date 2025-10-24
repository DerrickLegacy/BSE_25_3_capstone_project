// =====================
// instrument.js – Sentry error tracking setup
// =====================

const { init, captureException, captureMessage } = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

// Determine environment
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

// Initialize Sentry
init({
  dsn: process.env.SENTRY_DSN || null,
  environment: environment,
  
  // Performance monitoring - more aggressive in dev/staging
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  profilesSampleRate: isProduction ? 0.1 : 1.0,
  
  integrations: [nodeProfilingIntegration()],
  
  // Error capture settings
  captureUnhandledRejections: true,
  captureUncaughtException: true,
  
  // Debug mode
  debug: environment === 'development',
  
  // Release tracking
  release: process.env.VERSION || `notes-app@${environment}`,
  
  // Additional context
  initialScope: {
    tags: {
      component: 'backend',
      platform: 'node',
    },
  },
});

// Export Sentry functions for use in other files
module.exports = {
  captureException,
  captureMessage,
};
