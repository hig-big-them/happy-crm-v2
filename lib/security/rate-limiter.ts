import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis client configuration - supports both Vercel integration and manual setup
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Different rate limiters for different types of requests
export const rateLimiters = {
  // General API routes - 100 requests per hour per IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 h"),
    analytics: true,
  }),
  
  // Authentication routes - 5 attempts per 15 minutes per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
  }),
  
  // WhatsApp messaging - 10 messages per minute per phone number
  whatsapp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  }),
  
  // Webhook endpoints - 1000 requests per hour per endpoint
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 h"),
    analytics: true,
  }),
  
  // Password reset - 3 attempts per hour per email
  passwordReset: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
  }),
  
  // User registration - 5 registrations per hour per IP
  registration: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
  }),
};

// Rate limiting types
export type RateLimitType = keyof typeof rateLimiters;

// Rate limit result interface
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Apply rate limiting to a request
 * @param identifier - Unique identifier for the rate limit (IP, user ID, phone number, etc.)
 * @param type - Type of rate limiting to apply
 * @returns Promise<RateLimitResult>
 */
export const applyRateLimit = async (
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> => {
  try {
    const limiter = rateLimiters[type];
    const { success, limit, reset, remaining } = await limiter.limit(identifier);
    
    const result: RateLimitResult = {
      success,
      limit,
      remaining,
      reset,
    };
    
    if (!success) {
      result.retryAfter = Math.round((reset - Date.now()) / 1000);
    }
    
    return result;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request (fail open)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
};

/**
 * Get client IP address from request headers
 * @param request - Request object
 * @returns string - IP address
 */
export const getClientIP = (request: Request): string => {
  // Check for forwarded IP (common in production)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check other common headers
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Fallback for development
  return '127.0.0.1';
};

/**
 * Create rate limit response
 * @param result - Rate limit result
 * @param message - Optional custom message
 * @returns Response object
 */
export const createRateLimitResponse = (
  result: RateLimitResult,
  message?: string
): Response => {
  const headers = new Headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  });
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }
  
  return new Response(
    JSON.stringify({
      error: message || 'Rate limit exceeded',
      retryAfter: result.retryAfter || 0,
    }),
    {
      status: 429,
      headers,
    }
  );
};

/**
 * Rate limit middleware for API routes
 * @param request - Request object
 * @param type - Rate limit type
 * @param customIdentifier - Custom identifier (optional)
 * @returns Promise<RateLimitResult | null>
 */
export const rateLimitMiddleware = async (
  request: Request,
  type: RateLimitType = 'api',
  customIdentifier?: string
): Promise<RateLimitResult | null> => {
  // Skip rate limiting if Redis is not configured
  const hasRedisConfig = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (!hasRedisConfig) {
    console.log('⚠️ Rate limiting skipped - Redis not configured');
    return null;
  }
  
  const identifier = customIdentifier || getClientIP(request);
  const result = await applyRateLimit(identifier, type);
  
  return result;
};

/**
 * WhatsApp specific rate limiting
 * @param phoneNumber - Phone number to rate limit
 * @returns Promise<RateLimitResult>
 */
export const rateLimitWhatsApp = async (phoneNumber: string): Promise<RateLimitResult> => {
  return applyRateLimit(`whatsapp:${phoneNumber}`, 'whatsapp');
};

/**
 * Authentication specific rate limiting
 * @param email - Email address to rate limit
 * @param action - Type of auth action (login, register, reset)
 * @returns Promise<RateLimitResult>
 */
export const rateLimitAuth = async (
  email: string,
  action: 'login' | 'register' | 'reset' = 'login'
): Promise<RateLimitResult> => {
  const type = action === 'register' ? 'registration' : 
               action === 'reset' ? 'passwordReset' : 'auth';
  return applyRateLimit(`auth:${action}:${email}`, type);
};

/**
 * Webhook specific rate limiting
 * @param endpoint - Webhook endpoint identifier
 * @param sourceIP - Source IP address
 * @returns Promise<RateLimitResult>
 */
export const rateLimitWebhook = async (
  endpoint: string,
  sourceIP: string
): Promise<RateLimitResult> => {
  return applyRateLimit(`webhook:${endpoint}:${sourceIP}`, 'webhook');
};

// Export redis client for advanced usage
export { redis };
