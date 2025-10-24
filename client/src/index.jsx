import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
// Initialize Sentry FIRST
import * as Sentry from '@sentry/react';
import App from './App';
import mainReducer from './Reducers';
import watchNotes from './Sagas';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

// Determine environment
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Performance monitoring
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Session replay - capture user sessions on errors
  replaysSessionSampleRate: isProduction ? 0.1 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Release tracking
  release: process.env.REACT_APP_VERSION || `notes-app-frontend@${environment}`,

  // Additional context
  initialScope: {
    tags: {
      component: 'frontend',
      platform: 'react',
    },
  },

  // Debug mode
  debug: environment === 'development',
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(mainReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchNotes);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Sentry.ErrorBoundary
    fallback={({ error }) => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>We&apos;ve been notified of this error and are working to fix it.</p>
        <details style={{ marginTop: '1rem' }}>
          <summary>Error details</summary>
          <pre
            style={{
              textAlign: 'left',
              background: '#f5f5f5',
              padding: '1rem',
              marginTop: '1rem',
            }}
          >
            {error.toString()}
          </pre>
        </details>
      </div>
    )}
  >
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </Sentry.ErrorBoundary>
);
