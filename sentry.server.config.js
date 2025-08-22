import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific configuration
  initialScope: {
    tags: {
      component: 'server',
    },
  },
  
  // Enhanced server-side error filtering
  beforeSend(event, hint) {
    // Remove sensitive server data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
      delete event.request.headers['x-auth-token'];
    }
    
    // Remove environment variables from context
    if (event.extra) {
      delete event.extra.env;
      delete event.extra.process;
    }
    
    // Remove sensitive data from request body
    if (event.request?.data) {
      if (typeof event.request.data === 'string') {
        try {
          const data = JSON.parse(event.request.data);
          delete data.password;
          delete data.token;
          delete data.apiKey;
          event.request.data = JSON.stringify(data);
        } catch {
          // If not JSON, don't modify
        }
      }
    }
    
    // Don't send in development unless enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_DEV) {
      return null;
    }
    
    // Filter database connection errors (often not actionable)
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.value?.includes('Connection refused') ||
          exception?.value?.includes('ECONNREFUSED') ||
          exception?.value?.includes('getaddrinfo ENOTFOUND')) {
        // Log locally but don't send to Sentry
        console.error('Database connection error (not sent to Sentry):', exception.value);
        return null;
      }
    }
    
    return event;
  },
  
  // Server-side error filtering
  ignoreErrors: [
    // Database connection issues
    'Connection refused',
    'ECONNREFUSED',
    'getaddrinfo ENOTFOUND',
    'Connection terminated unexpectedly',
    
    // Rate limiting errors (expected behavior)
    'Rate limit exceeded',
    'Too Many Requests',
    
    // Webhook validation errors (often spam)
    'Invalid signature',
    'Webhook verification failed',
    
    // Next.js build errors
    'Module build failed',
    'ModuleNotFoundError',
    
    // Development errors
    'Fast Refresh',
    'webpack-hot-middleware',
  ],
  
  // Don't send personal information
  sendDefaultPii: false,
  
  // Server integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException({
      exitEvenIfOtherHandlersAreRegistered: false,
    }),
    new Sentry.Integrations.OnUnhandledRejection({
      mode: 'warn',
    }),
  ],
  
  // Capture unhandled rejections
  captureUnhandledRejections: true,
  
  // Enhanced context for server errors
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data?.method === 'GET') {
      // Only keep failed GET requests
      if (!breadcrumb.data?.status_code || breadcrumb.data.status_code < 400) {
        return null;
      }
    }
    
    // Remove sensitive data from breadcrumbs
    if (breadcrumb.data) {
      delete breadcrumb.data.apiKey;
      delete breadcrumb.data.token;
      delete breadcrumb.data.password;
    }
    
    return breadcrumb;
  },
});
