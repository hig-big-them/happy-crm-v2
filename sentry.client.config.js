import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking for better error tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // User context
  initialScope: {
    tags: {
      component: 'client',
    },
  },
  
  // Filter sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }
    
    // Remove sensitive data from extra context
    if (event.extra) {
      delete event.extra.apiKey;
      delete event.extra.token;
      delete event.extra.password;
    }
    
    // Don't send errors in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_DEV) {
      return null;
    }
    
    // Filter out network errors that are not actionable
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.value?.includes('NetworkError') || 
          exception?.value?.includes('Failed to fetch')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Error filtering
  ignoreErrors: [
    // Browser extensions
    'Non-Error promise rejection captured',
    'ChunkLoadError',
    'Loading chunk',
    'ResizeObserver loop limit exceeded',
    
    // Network errors
    'Network request failed',
    'NetworkError when attempting to fetch resource',
    'The operation was aborted',
    
    // Common user action errors
    'User cancelled',
    'AbortError',
    
    // Development hot reload errors
    'HMR',
    'Hot Module Replacement',
  ],
  
  // Privacy settings
  sendDefaultPii: false,
  
  // Integration configuration
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracingOrigins: [
        'localhost',
        /^https:\/\/[^/]*\.vercel\.app/,
        /^https:\/\/your-domain\.com/,
      ],
    }),
  ],
  
  // Session replay (optional - enable in production if needed)
  replaysSessionSampleRate: 0.0, // Disabled by default for privacy
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
});
