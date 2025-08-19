#!/usr/bin/env node

/**
 * Production Environment Validator
 * 
 * Run this script before deploying to production to ensure
 * all required environment variables are properly configured.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Required environment variables for production
const REQUIRED_VARS = {
  // Core
  'NODE_ENV': {
    description: 'Node environment',
    validator: (val) => val === 'production',
    errorMsg: 'Must be set to "production"'
  },
  'NEXT_PUBLIC_APP_URL': {
    description: 'Application URL',
    validator: (val) => val.startsWith('https://'),
    errorMsg: 'Must be a valid HTTPS URL'
  },
  
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    validator: (val) => val.includes('supabase.co'),
    errorMsg: 'Must be a valid Supabase URL'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anonymous key',
    validator: (val) => val.length > 40,
    errorMsg: 'Must be a valid Supabase key'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase service role key',
    validator: (val) => val.length > 40,
    errorMsg: 'Must be a valid service role key',
    sensitive: true
  },
  
  // WhatsApp
  'WHATSAPP_APP_SECRET': {
    description: 'WhatsApp app secret for webhook signature',
    validator: (val) => val.length >= 32,
    errorMsg: 'Must be at least 32 characters',
    sensitive: true
  },
  'WHATSAPP_WEBHOOK_VERIFY_TOKEN': {
    description: 'Webhook verification token',
    validator: (val) => val.length >= 32 && !/\s/.test(val),
    errorMsg: 'Must be at least 32 characters with no spaces',
    sensitive: true
  },
  'WHATSAPP_ACCESS_TOKEN': {
    description: 'WhatsApp API access token',
    validator: (val) => val.startsWith('EAA') || val.length > 100,
    errorMsg: 'Must be a valid Meta access token',
    sensitive: true
  },
  
  // Security
  'NEXTAUTH_SECRET': {
    description: 'NextAuth secret for session encryption',
    validator: (val) => val.length >= 32,
    errorMsg: 'Must be at least 32 characters',
    sensitive: true
  }
};

// Optional but recommended variables
const RECOMMENDED_VARS = {
  'REDIS_URL': 'Redis connection URL for caching',
  'SENTRY_DSN': 'Sentry DSN for error monitoring',
  'SMTP_HOST': 'SMTP host for email notifications'
};

// Security checks
const SECURITY_CHECKS = {
  'No default values': () => {
    const defaults = ['your-', 'example', 'test', 'demo', 'localhost'];
    const issues = [];
    
    Object.keys(process.env).forEach(key => {
      const val = process.env[key];
      if (val && defaults.some(d => val.toLowerCase().includes(d))) {
        issues.push(`${key} contains default/example value`);
      }
    });
    
    return issues;
  },
  
  'Secure tokens': () => {
    const issues = [];
    const tokenVars = ['WHATSAPP_WEBHOOK_VERIFY_TOKEN', 'NEXTAUTH_SECRET'];
    
    tokenVars.forEach(key => {
      const val = process.env[key];
      if (val) {
        // Check entropy
        const entropy = calculateEntropy(val);
        if (entropy < 4) {
          issues.push(`${key} has low entropy (${entropy.toFixed(2)} bits) - use a more random value`);
        }
        
        // Check for common patterns
        if (/^[a-z]+$/.test(val) || /^[A-Z]+$/.test(val) || /^[0-9]+$/.test(val)) {
          issues.push(`${key} uses only one character type - use mixed characters`);
        }
      }
    });
    
    return issues;
  },
  
  'HTTPS URLs': () => {
    const issues = [];
    const urlVars = ['NEXT_PUBLIC_APP_URL', 'WHATSAPP_WEBHOOK_URL'];
    
    urlVars.forEach(key => {
      const val = process.env[key];
      if (val && !val.startsWith('https://')) {
        issues.push(`${key} must use HTTPS in production`);
      }
    });
    
    return issues;
  }
};

// Calculate Shannon entropy
function calculateEntropy(str) {
  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  
  Object.values(freq).forEach(count => {
    const p = count / len;
    entropy -= p * Math.log2(p);
  });
  
  return entropy;
}

// Load environment variables
function loadEnv() {
  // Try to load .env.production
  const envPath = path.join(process.cwd(), '.env.production');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`${colors.cyan}Loaded .env.production${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}Warning: .env.production not found${colors.reset}`);
    console.log('Using current environment variables\n');
  }
}

// Validate environment
function validate() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}Production Environment Validation${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables
  console.log(`${colors.magenta}Required Variables:${colors.reset}`);
  Object.entries(REQUIRED_VARS).forEach(([key, config]) => {
    const value = process.env[key];
    const displayValue = config.sensitive ? '***' : (value || 'NOT SET');
    
    if (!value) {
      console.log(`  ${colors.red}✗${colors.reset} ${key}: NOT SET`);
      console.log(`    ${colors.yellow}${config.description}${colors.reset}`);
      hasErrors = true;
    } else if (!config.validator(value)) {
      console.log(`  ${colors.red}✗${colors.reset} ${key}: INVALID (${displayValue})`);
      console.log(`    ${colors.yellow}${config.errorMsg}${colors.reset}`);
      hasErrors = true;
    } else {
      console.log(`  ${colors.green}✓${colors.reset} ${key}: ${displayValue}`);
    }
  });
  
  console.log();
  
  // Check recommended variables
  console.log(`${colors.magenta}Recommended Variables:${colors.reset}`);
  Object.entries(RECOMMENDED_VARS).forEach(([key, description]) => {
    const value = process.env[key];
    
    if (!value) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${key}: NOT SET`);
      console.log(`    ${colors.cyan}${description}${colors.reset}`);
      hasWarnings = true;
    } else {
      console.log(`  ${colors.green}✓${colors.reset} ${key}: SET`);
    }
  });
  
  console.log();
  
  // Run security checks
  console.log(`${colors.magenta}Security Checks:${colors.reset}`);
  Object.entries(SECURITY_CHECKS).forEach(([checkName, checkFn]) => {
    const issues = checkFn();
    
    if (issues.length === 0) {
      console.log(`  ${colors.green}✓${colors.reset} ${checkName}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${checkName}`);
      issues.forEach(issue => {
        console.log(`    ${colors.yellow}→ ${issue}${colors.reset}`);
      });
      hasErrors = true;
    }
  });
  
  console.log();
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  
  // Summary
  if (hasErrors) {
    console.log(`${colors.red}✗ Validation FAILED${colors.reset}`);
    console.log('Please fix all errors before deploying to production.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}⚠ Validation passed with warnings${colors.reset}`);
    console.log('Consider addressing the warnings for optimal production setup.\n');
    process.exit(0);
  } else {
    console.log(`${colors.green}✓ All checks passed!${colors.reset}`);
    console.log('Environment is ready for production deployment.\n');
    process.exit(0);
  }
}

// Generate secure tokens
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

// Show example secure values
function showExamples() {
  console.log(`${colors.cyan}Example secure values:${colors.reset}`);
  console.log(`WHATSAPP_WEBHOOK_VERIFY_TOKEN=${generateSecureToken(32)}`);
  console.log(`NEXTAUTH_SECRET=${generateSecureToken(32)}`);
  console.log(`WHATSAPP_APP_SECRET=${generateSecureToken(40)}`);
  console.log();
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--examples')) {
    showExamples();
  }
  
  loadEnv();
  validate();
}

module.exports = { validate, loadEnv };