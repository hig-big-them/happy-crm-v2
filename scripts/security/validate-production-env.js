#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * 
 * This script validates that all production environment variables
 * are properly configured and secure before deployment.
 */

// Basic validation without importing TypeScript modules
function validateBasicEnvironment() {
  const env = 'production';
  const missing = [];
  const invalid = [];
  const warnings = [];
  
  // Required environment variables for production
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'META_APP_ID',
    'META_APP_SECRET',
    // Note: SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN (Vercel integration)
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'NODE_ENV'
  ];
  
  // Check required variables
  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
      continue;
    }
    
    // Basic validation
    if (key.includes('URL') && !value.startsWith('https://')) {
      invalid.push({ key, message: 'Must use HTTPS' });
    }
    
    if (key.includes('SECRET') && value.length < 32) {
      invalid.push({ key, message: 'Must be at least 32 characters' });
    }
  }
  
  // Check Redis configuration (Vercel KV integration or manual setup)
  const hasRedisConfig = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const hasRedisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!hasRedisConfig) {
    warnings.push('Redis not configured - rate limiting will be disabled');
  }
  
  if (hasRedisConfig && !hasRedisToken) {
    invalid.push({ key: 'REDIS_TOKEN', message: 'Redis URL configured but token missing' });
  }
  
  // Check Sentry configuration (Vercel integration or manual setup)
  const hasSentryConfig = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!hasSentryConfig) {
    warnings.push('Sentry not configured - error monitoring will be disabled');
  }
  
  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings,
    environment: env
  };
}

console.log('🔍 Validating production environment...\n');

try {
  // Force production mode for validation
  process.env.NODE_ENV = 'production';
  
  // Run validation
  const result = validateBasicEnvironment();
  
  console.log(`Environment: ${result.environment}`);
  console.log(`Valid: ${result.isValid ? '✅' : '❌'}`);
  
  if (result.missing.length > 0) {
    console.log('\n❌ Missing required variables:');
    result.missing.forEach(key => {
      console.log(`  - ${key}`);
    });
  }
  
  if (result.invalid.length > 0) {
    console.log('\n❌ Invalid variables:');
    result.invalid.forEach(({ key, message }) => {
      console.log(`  - ${key}: ${message}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
  }
  
  // Check key rotation status (basic version)
  console.log('\n🔑 Key rotation status:');
  const keysToCheck = [
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'WHATSAPP_ACCESS_TOKEN',
    'META_APP_SECRET'
  ];
  
  const needsRotation = [];
  const likelyRotated = [];
  
  for (const key of keysToCheck) {
    const value = process.env[key];
    if (value) {
      // Basic heuristic - check if key looks rotated
      if (value.length < 50 || 
          value.includes('test') || 
          value.includes('dev') || 
          value.includes('example')) {
        needsRotation.push(key);
      } else {
        likelyRotated.push(key);
      }
    }
  }
  
  if (needsRotation.length > 0) {
    console.log('\n🚨 Keys that may need rotation:');
    needsRotation.forEach(key => {
      console.log(`  - ${key}`);
    });
  }
  
  if (likelyRotated.length > 0) {
    console.log('\n✅ Keys that appear rotated:');
    likelyRotated.forEach(key => {
      console.log(`  - ${key}`);
    });
  }
  
  // Final assessment
  console.log('\n' + '='.repeat(50));
  
  if (result.isValid && needsRotation.length === 0) {
    console.log('✅ PRODUCTION READY - All checks passed!');
    console.log('   Environment is properly configured and secure.');
    process.exit(0);
  } else {
    console.log('❌ NOT PRODUCTION READY');
    
    if (!result.isValid) {
      console.log('   Fix missing/invalid environment variables.');
    }
    
    if (needsRotation.length > 0) {
      console.log('   Rotate compromised API keys before deployment.');
    }
    
    console.log('\n📖 See SECURITY.md for detailed instructions.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
