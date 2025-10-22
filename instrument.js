// =====================
// instrument.js – Sentry error tracking setup
// =====================

const { init, captureException, captureMessage } = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry
init({
  dsn: process.env.SENTRY_DSN || null, // Set to null if no DSN provided
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [nodeProfilingIntegration()],
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  // Capture uncaught exceptions
  captureUncaughtException: true,
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
});

// Export Sentry functions for use in other files
module.exports = {
  captureException,
  captureMessage,
};
