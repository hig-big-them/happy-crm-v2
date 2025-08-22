/**
 * Environment Variable Validation and Security Checks
 * 
 * This module validates that all required environment variables are present
 * and properly configured for each environment (development, production).
 */

// Required environment variables for each environment
const requiredEnvVars = {
  production: [
    // Supabase (CRITICAL - MUST BE ROTATED)
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    
    // WhatsApp Business API (CRITICAL - MUST BE ROTATED)
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    
    // Meta App Configuration (CRITICAL - MUST BE ROTATED)
    'META_APP_ID',
    'META_APP_SECRET',
    
    // Security & Monitoring
    'SENTRY_DSN',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    
    // Rate Limiting (Redis) - Vercel integration or manual setup
    // Note: KV_REST_API_URL and KV_REST_API_TOKEN are auto-created by Vercel integration
    
    // Production Environment
    'NODE_ENV',
  ],
  development: [
    // Minimum required for development
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NODE_ENV',
  ],
  test: [
    'NODE_ENV',
  ]
};

// Optional environment variables (with warnings if missing)
const optionalEnvVars = {
  production: [
    'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
    'WHATSAPP_APP_SECRET',
    'SENTRY_AUTH_TOKEN',
    'VERCEL_GIT_COMMIT_SHA',
  ],
  development: [
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'SENTRY_DSN',
  ]
};

// Environment variable format validators
const validators = {
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  https: (value: string) => {
    return value.startsWith('https://');
  },
  
  uuid: (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },
  
  jwt: (value: string) => {
    // Check if it looks like a JWT (three parts separated by dots)
    return value.split('.').length === 3;
  },
  
  base64: (value: string) => {
    try {
      return btoa(atob(value)) === value;
    } catch {
      return false;
    }
  },
  
  minLength: (min: number) => (value: string) => {
    return value.length >= min;
  },
  
  phoneNumberId: (value: string) => {
    // WhatsApp phone number ID is typically 15+ digits
    return /^\d{15,}$/.test(value);
  }
};

// Security validation rules for each environment variable
const securityRules = {
  'NEXT_PUBLIC_SUPABASE_URL': [
    { validator: validators.url, message: 'Must be a valid URL' },
    { validator: validators.https, message: 'Must use HTTPS' },
  ],
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': [
    { validator: validators.minLength(50), message: 'Must be at least 50 characters' },
  ],
  'SUPABASE_SERVICE_ROLE_KEY': [
    { validator: validators.minLength(50), message: 'Must be at least 50 characters' },
  ],
  'WHATSAPP_ACCESS_TOKEN': [
    { validator: validators.minLength(50), message: 'Must be at least 50 characters' },
    { validator: (v: string) => v.startsWith('EAA'), message: 'Must start with EAA' },
  ],
  'WHATSAPP_PHONE_NUMBER_ID': [
    { validator: validators.phoneNumberId, message: 'Must be a valid phone number ID' },
  ],
  'SENTRY_DSN': [
    { validator: validators.url, message: 'Must be a valid URL' },
    { validator: validators.https, message: 'Must use HTTPS' },
  ],
  'JWT_SECRET': [
    { validator: validators.minLength(32), message: 'Must be at least 32 characters for security' },
  ],
  'ENCRYPTION_KEY': [
    { validator: validators.minLength(32), message: 'Must be at least 32 characters for security' },
  ],
  'KV_REST_API_URL': [
    { validator: validators.url, message: 'Must be a valid URL' },
    { validator: validators.https, message: 'Must use HTTPS' },
  ],
  'UPSTASH_REDIS_REST_URL': [
    { validator: validators.url, message: 'Must be a valid URL' },
    { validator: validators.https, message: 'Must use HTTPS' },
  ],
};

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: Array<{ key: string; message: string }>;
  warnings: string[];
  environment: string;
}

/**
 * Validate environment variables for the current environment
 */
export function validateEnvironment(): ValidationResult {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env as keyof typeof requiredEnvVars] || requiredEnvVars.development;
  const optional = optionalEnvVars[env as keyof typeof optionalEnvVars] || [];
  
  const missing: string[] = [];
  const invalid: Array<{ key: string; message: string }> = [];
  const warnings: string[] = [];
  
  // Check if Redis is configured (either Vercel integration or manual setup)
  const hasRedisConfig = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const hasRedisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  // Check required variables
  for (const key of required) {
    const value = process.env[key];
    
    if (!value) {
      missing.push(key);
      continue;
    }
    
    // Apply security validation rules
    const rules = securityRules[key as keyof typeof securityRules];
    if (rules) {
      for (const rule of rules) {
        if (!rule.validator(value)) {
          invalid.push({ key, message: rule.message });
        }
      }
    }
  }
  
  // Check optional variables and add warnings
  for (const key of optional) {
    const value = process.env[key];
    
    if (!value) {
      warnings.push(`Optional environment variable '${key}' is not set`);
    } else {
      // Apply validation to optional vars too
      const rules = securityRules[key as keyof typeof securityRules];
      if (rules) {
        for (const rule of rules) {
          if (!rule.validator(value)) {
            warnings.push(`Optional environment variable '${key}': ${rule.message}`);
          }
        }
      }
    }
  }
  
  // Redis configuration check
  if (env === 'production' && !hasRedisConfig) {
    warnings.push('Redis not configured - rate limiting will be disabled');
  }
  
  if (hasRedisConfig && !hasRedisToken) {
    invalid.push({ key: 'REDIS_TOKEN', message: 'Redis URL configured but token missing' });
  }
  
  // Additional security checks for production
  if (env === 'production') {
    // Check for development patterns in production
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      invalid.push({ key: 'NEXT_PUBLIC_SUPABASE_URL', message: 'Cannot use localhost in production' });
    }
    
    // Check for default/example values
    const defaultValues = {
      'JWT_SECRET': ['your-secret-key', 'change-me', 'development-secret'],
      'ENCRYPTION_KEY': ['your-encryption-key', 'change-me', 'development-key'],
      'WHATSAPP_WEBHOOK_VERIFY_TOKEN': ['your-verify-token', 'change-me'],
    };
    
    for (const [key, defaults] of Object.entries(defaultValues)) {
      const value = process.env[key];
      if (value && defaults.includes(value.toLowerCase())) {
        invalid.push({ key, message: 'Cannot use default/example value in production' });
      }
    }
  }
  
  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings,
    environment: env,
  };
}

/**
 * Validate environment and throw error if invalid
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();
  
  if (!result.isValid) {
    let errorMessage = `❌ Environment validation failed for ${result.environment} environment:\n`;
    
    if (result.missing.length > 0) {
      errorMessage += `\nMissing required variables:\n`;
      result.missing.forEach(key => {
        errorMessage += `  - ${key}\n`;
      });
    }
    
    if (result.invalid.length > 0) {
      errorMessage += `\nInvalid variables:\n`;
      result.invalid.forEach(({ key, message }) => {
        errorMessage += `  - ${key}: ${message}\n`;
      });
    }
    
    errorMessage += `\nPlease check your environment variables and try again.\n`;
    errorMessage += `See SECURITY.md for detailed setup instructions.\n`;
    
    throw new Error(errorMessage);
  }
  
  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    result.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
  
  console.log(`✅ Environment variables validated successfully for ${result.environment} environment`);
}

/**
 * Check if environment variables appear to have been rotated from defaults
 */
export function checkKeyRotationStatus(): {
  needsRotation: string[];
  likelyRotated: string[];
} {
  const needsRotation: string[] = [];
  const likelyRotated: string[] = [];
  
  const keysToCheck = [
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'WHATSAPP_ACCESS_TOKEN',
    'META_APP_SECRET',
  ];
  
  for (const key of keysToCheck) {
    const value = process.env[key];
    if (value) {
      // Very basic heuristic - check if key looks like it might be rotated
      // This is not foolproof but can catch obvious development keys
      if (value.length < 50 || 
          value.includes('test') || 
          value.includes('dev') || 
          value.includes('example') ||
          value === value.toLowerCase() || // All lowercase might be example
          /(.)\1{5,}/.test(value)) { // Repeated characters
        needsRotation.push(key);
      } else {
        likelyRotated.push(key);
      }
    }
  }
  
  return { needsRotation, likelyRotated };
}

/**
 * Generate secure random string for secrets
 */
export function generateSecureSecret(length: number = 32): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }
}

/**
 * Initialize environment validation on module load
 */
export function initializeEnvironmentValidation(): void {
  try {
    validateEnvironmentOrThrow();
    
    // Check key rotation status in production
    if (process.env.NODE_ENV === 'production') {
      const rotationStatus = checkKeyRotationStatus();
      
      if (rotationStatus.needsRotation.length > 0) {
        console.error('🚨 SECURITY WARNING: The following keys may need rotation:');
        rotationStatus.needsRotation.forEach(key => {
          console.error(`  - ${key}`);
        });
        console.error('Please rotate these keys before deploying to production!');
        console.error('See SECURITY.md for rotation procedures.');
      }
      
      if (rotationStatus.likelyRotated.length > 0) {
        console.log('✅ The following keys appear to be properly rotated:');
        rotationStatus.likelyRotated.forEach(key => {
          console.log(`  - ${key}`);
        });
      }
    }
    
  } catch (error) {
    console.error(error.message);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, exit if environment is invalid
      process.exit(1);
    } else {
      // In development, just warn
      console.warn('⚠️ Continuing in development mode with invalid environment...');
    }
  }
}

// Auto-validate on import (can be disabled with SKIP_ENV_VALIDATION=true)
if (!process.env.SKIP_ENV_VALIDATION) {
  initializeEnvironmentValidation();
}
