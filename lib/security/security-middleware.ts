/**
 * Security Middleware for API Routes
 * 
 * This middleware provides comprehensive security features for API endpoints:
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Error handling with monitoring
 * - Request logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, RateLimitType } from './rate-limiter';
import * as Sentry from "@sentry/nextjs";

export interface SecurityConfig {
  rateLimitType?: RateLimitType;
  customIdentifier?: string;
  requireAuth?: boolean;
  skipRateLimit?: boolean;
  logRequests?: boolean;
  validateInput?: boolean;
  corsOrigins?: string[];
}

export interface SecurityContext {
  clientIP: string;
  userAgent: string;
  timestamp: Date;
  requestId: string;
  rateLimitResult?: any;
}

/**
 * Main security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest, context: SecurityContext) => Promise<Response>,
  config: SecurityConfig = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    // Create security context
    const context: SecurityContext = {
      clientIP: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date(),
      requestId,
    };
    
    try {
      // CORS handling
      const corsResponse = handleCORS(request, config.corsOrigins);
      if (corsResponse) {
        return corsResponse;
      }
      
      // Rate limiting
      if (!config.skipRateLimit) {
        const rateLimitResult = await rateLimitMiddleware(
          request,
          config.rateLimitType,
          config.customIdentifier
        );
        
        if (rateLimitResult && !rateLimitResult.success) {
          return createRateLimitResponse(rateLimitResult);
        }
        
        context.rateLimitResult = rateLimitResult;
      }
      
      // Authentication check (if required)
      if (config.requireAuth) {
        const authResult = await validateAuthentication(request);
        if (!authResult.valid) {
          return createAuthErrorResponse(authResult.error);
        }
      }
      
      // Input validation and sanitization
      if (config.validateInput && request.method !== 'GET') {
        const validationResult = await validateAndSanitizeInput(request);
        if (!validationResult.valid) {
          return createValidationErrorResponse(validationResult.errors);
        }
      }
      
      // Request logging (if enabled)
      if (config.logRequests) {
        logSecureRequest(request, context);
      }
      
      // Execute the handler
      const response = await handler(request, context);
      
      // Add security headers to response
      addSecurityHeaders(response);
      
      // Log successful requests in production
      if (process.env.NODE_ENV === 'production') {
        const duration = Date.now() - startTime;
        console.log(`✅ ${request.method} ${request.url} - ${response.status} (${duration}ms)`);
      }
      
      return response;
      
    } catch (error: any) {
      // Enhanced error handling with Sentry
      const errorDetails = {
        requestId,
        method: request.method,
        url: request.url,
        clientIP: context.clientIP,
        userAgent: context.userAgent,
        error: error.message,
        stack: error.stack,
      };
      
      // Log to Sentry with context
      Sentry.withScope((scope) => {
        scope.setTag('component', 'security-middleware');
        scope.setTag('requestId', requestId);
        scope.setContext('request', {
          method: request.method,
          url: request.url,
          clientIP: context.clientIP,
          userAgent: context.userAgent,
        });
        scope.setLevel('error');
        Sentry.captureException(error);
      });
      
      // Log locally
      console.error('❌ Security middleware error:', errorDetails);
      
      // Return secure error response (don't leak internal details)
      return createErrorResponse(
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  return '127.0.0.1'; // Fallback
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle CORS preflight and validation
 */
function handleCORS(request: NextRequest, allowedOrigins?: string[]): Response | null {
  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const corsHeaders = new Headers({
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    });
    
    // Set origin if allowed
    if (isOriginAllowed(origin, allowedOrigins)) {
      corsHeaders.set('Access-Control-Allow-Origin', origin || '*');
      corsHeaders.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  return null;
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins?: string[]): boolean {
  if (!origin) return false;
  
  if (!allowedOrigins || allowedOrigins.length === 0) {
    // Default allowed origins
    const defaultAllowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
    ];
    
    if (process.env.NODE_ENV === 'production') {
      defaultAllowed.push(
        'https://your-domain.com',
        'https://www.your-domain.com'
      );
    }
    
    return defaultAllowed.includes(origin);
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * Validate authentication token
 */
async function validateAuthentication(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
  user?: any;
}> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Validate JWT token (implement your validation logic here)
    // This is a placeholder - replace with actual JWT validation
    if (token.length < 10) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // TODO: Implement actual JWT validation with your auth provider
    return { valid: true };
    
  } catch (error) {
    return { valid: false, error: 'Token validation failed' };
  }
}

/**
 * Validate and sanitize request input
 */
async function validateAndSanitizeInput(request: NextRequest): Promise<{
  valid: boolean;
  errors?: string[];
  sanitizedData?: any;
}> {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType) {
      return { valid: false, errors: ['Content-Type header is required'] };
    }
    
    if (contentType.includes('application/json')) {
      const text = await request.text();
      
      // Check for suspiciously large payloads
      if (text.length > 1024 * 1024) { // 1MB limit
        return { valid: false, errors: ['Request payload too large'] };
      }
      
      // Parse and validate JSON
      try {
        const data = JSON.parse(text);
        
        // Basic sanitization
        const sanitized = sanitizeObject(data);
        
        return { valid: true, sanitizedData: sanitized };
        
      } catch (error) {
        return { valid: false, errors: ['Invalid JSON format'] };
      }
    }
    
    return { valid: true };
    
  } catch (error) {
    return { valid: false, errors: ['Input validation failed'] };
  }
}

/**
 * Sanitize object by removing/escaping dangerous content
 */
function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous keys
    if (key.startsWith('__') || key.includes('constructor') || key.includes('prototype')) {
      continue;
    }
    
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

/**
 * Sanitize string values
 */
function sanitizeString(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Remove potentially dangerous content
  return value
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: Response): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add CORS headers if needed
  const origin = response.headers.get('Access-Control-Allow-Origin');
  if (!origin) {
    response.headers.set('Access-Control-Allow-Origin', 'null');
  }
}

/**
 * Log secure request details (without sensitive data)
 */
function logSecureRequest(request: NextRequest, context: SecurityContext): void {
  const logData = {
    requestId: context.requestId,
    timestamp: context.timestamp.toISOString(),
    method: request.method,
    url: new URL(request.url).pathname, // Don't log query params (might contain sensitive data)
    clientIP: context.clientIP,
    userAgent: context.userAgent?.substring(0, 100) + '...', // Truncate user agent
    contentType: request.headers.get('content-type'),
  };
  
  console.log('🔒 Secure request:', JSON.stringify(logData));
}

/**
 * Create rate limit error response
 */
function createRateLimitResponse(rateLimitResult: any): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '0',
    'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
    'X-RateLimit-Reset': new Date(rateLimitResult.reset || Date.now()).toISOString(),
  });
  
  if (rateLimitResult.retryAfter) {
    headers.set('Retry-After', rateLimitResult.retryAfter.toString());
  }
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter || 0,
      message: 'Too many requests. Please try again later.',
    }),
    { status: 429, headers }
  );
}

/**
 * Create authentication error response
 */
function createAuthErrorResponse(error: string): Response {
  return new Response(
    JSON.stringify({
      error: 'Authentication failed',
      message: error,
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create validation error response
 */
function createValidationErrorResponse(errors: string[]): Response {
  return new Response(
    JSON.stringify({
      error: 'Validation failed',
      details: errors,
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create generic error response
 */
function createErrorResponse(
  message: string,
  status: number = 500,
  details?: string
): Response {
  const body: any = {
    error: message,
    timestamp: new Date().toISOString(),
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    body.details = details;
  }
  
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
