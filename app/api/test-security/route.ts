import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, getClientIP } from '@/lib/security/rate-limiter';
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Security Test Endpoint Called');
    
    // Test 1: Rate Limiting
    console.log('🚦 Testing Rate Limiting...');
    const rateLimitResult = await rateLimitMiddleware(request, 'api');
    
    if (rateLimitResult) {
      console.log('✅ Rate limiting is ACTIVE');
      console.log(`   Limit: ${rateLimitResult.limit}`);
      console.log(`   Remaining: ${rateLimitResult.remaining}`);
      console.log(`   Reset: ${new Date(rateLimitResult.reset).toLocaleString()}`);
      
      if (!rateLimitResult.success) {
        return NextResponse.json({
          error: 'Rate limit exceeded',
          rateLimitResult
        }, { status: 429 });
      }
    } else {
      console.log('⚠️ Rate limiting is DISABLED (Redis not configured)');
    }
    
    // Test 2: Environment Variables
    console.log('🌍 Testing Environment Variables...');
    const envStatus = {
      sentry: {
        dsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN || !!process.env.SENTRY_DSN,
        org: !!process.env.SENTRY_ORG,
        project: !!process.env.SENTRY_PROJECT
      },
      redis: {
        url: !!process.env.KV_REST_API_URL || !!process.env.UPSTASH_REDIS_REST_URL,
        token: !!process.env.KV_REST_API_TOKEN || !!process.env.UPSTASH_REDIS_REST_TOKEN
      }
    };
    
    console.log('   Sentry configured:', envStatus.sentry.dsn ? '✅' : '❌');
    console.log('   Redis configured:', envStatus.redis.url && envStatus.redis.token ? '✅' : '❌');
    
    // Test 3: Sentry Error Capture
    console.log('📊 Testing Sentry Error Monitoring...');
    try {
      // Create a test error
      throw new Error('Test error for Sentry monitoring');
    } catch (testError: any) {
      // Capture with Sentry
      Sentry.withScope((scope) => {
        scope.setTag('test', 'security-endpoint');
        scope.setLevel('info');
        Sentry.captureMessage('Security test endpoint - Sentry is working!');
      });
      
      console.log('✅ Sentry error capture test completed');
    }
    
    // Return comprehensive status
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      clientIP: getClientIP(request),
      securityStatus: {
        rateLimiting: {
          enabled: !!rateLimitResult,
          result: rateLimitResult || null
        },
        errorMonitoring: {
          sentryConfigured: envStatus.sentry.dsn,
          testMessageSent: true
        },
        environment: {
          ...envStatus,
          nodeEnv: process.env.NODE_ENV
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ Security test error:', error);
    
    // Capture error with Sentry
    Sentry.captureException(error);
    
    return NextResponse.json({
      error: 'Security test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Test rate limiting with POST endpoint too
export async function POST(request: NextRequest) {
  try {
    // Apply stricter rate limiting for POST
    const rateLimitResult = await rateLimitMiddleware(request, 'auth');
    
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json({
        error: 'Rate limit exceeded for POST requests',
        rateLimitResult
      }, { status: 429 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'POST rate limiting test passed',
      rateLimitResult: rateLimitResult || 'disabled'
    });
    
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({
      error: 'POST test failed',
      message: error.message
    }, { status: 500 });
  }
}
