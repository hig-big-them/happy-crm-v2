/**
 * API Route: Redirect URI Validator
 * 
 * OAuth redirect URI'lerini validate eden endpoint
 */

import { NextRequest, NextResponse } from 'next/server';

interface RedirectUriValidationRequest {
  uri: string;
  provider?: string;
  strict?: boolean;
}

interface RedirectUriValidationResponse {
  isValid: boolean;
  uri: string;
  provider?: string;
  errors: string[];
  warnings: string[];
  details: {
    protocol: string;
    domain: string;
    path: string;
    query?: string;
    fragment?: string;
    port?: number;
  };
  recommendations: string[];
}

// WhatsApp Business API specific requirements
const WHATSAPP_REDIRECT_REQUIREMENTS = {
  allowedProtocols: ['https'],
  requiredHttps: true,
  allowedDomains: ['localhost', '127.0.0.1', 'developers.facebook.com'],
  blockedDomains: ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly'],
  maxLength: 2048,
  allowedPorts: [443, 8443, 3000, 8080] // Development ports
};

// Facebook OAuth specific requirements
const FACEBOOK_REDIRECT_REQUIREMENTS = {
  allowedProtocols: ['https', 'http'], // http only for localhost
  requiredHttps: true,
  allowedDomains: ['localhost', '127.0.0.1'],
  blockedDomains: ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly'],
  maxLength: 2048,
  allowedPorts: [443, 80, 3000, 8080, 8443]
};

function parseUri(uri: string) {
  try {
    const url = new URL(uri);
    return {
      protocol: url.protocol.replace(':', ''),
      domain: url.hostname,
      path: url.pathname,
      query: url.search,
      fragment: url.hash,
      port: url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80),
      full: url.toString()
    };
  } catch (error) {
    throw new Error('Invalid URI format');
  }
}

function validateRedirectUri(uri: string, provider: string = 'general', strict: boolean = false): RedirectUriValidationResponse {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  let parsedUri;
  try {
    parsedUri = parseUri(uri);
  } catch (error) {
    return {
      isValid: false,
      uri,
      provider,
      errors: ['Invalid URI format'],
      warnings: [],
      details: {
        protocol: '',
        domain: '',
        path: ''
      },
      recommendations: ['Please provide a valid URI format (e.g., https://example.com/callback)']
    };
  }

  // Get requirements based on provider
  const requirements = provider === 'whatsapp' ? WHATSAPP_REDIRECT_REQUIREMENTS : 
                      provider === 'facebook' ? FACEBOOK_REDIRECT_REQUIREMENTS : 
                      FACEBOOK_REDIRECT_REQUIREMENTS; // Default to Facebook

  // Protocol validation
  if (!requirements.allowedProtocols.includes(parsedUri.protocol)) {
    errors.push(`Protocol "${parsedUri.protocol}" not allowed. Allowed protocols: ${requirements.allowedProtocols.join(', ')}`);
  }

  // HTTPS requirement (except localhost)
  if (requirements.requiredHttps && parsedUri.protocol !== 'https' && 
      !['localhost', '127.0.0.1'].includes(parsedUri.domain)) {
    errors.push('HTTPS is required for non-localhost domains');
  }

  // Domain validation
  if (requirements.blockedDomains.includes(parsedUri.domain)) {
    errors.push(`Domain "${parsedUri.domain}" is not allowed (URL shortener detected)`);
  }

  // Length validation
  if (uri.length > requirements.maxLength) {
    errors.push(`URI too long (${uri.length} chars). Maximum allowed: ${requirements.maxLength}`);
  }

  // Port validation (if specified)
  if (parsedUri.port && !requirements.allowedPorts.includes(parsedUri.port)) {
    warnings.push(`Port ${parsedUri.port} is not commonly used for OAuth callbacks`);
  }

  // WhatsApp specific validations
  if (provider === 'whatsapp') {
    // Must be HTTPS in production
    if (parsedUri.protocol !== 'https' && !['localhost', '127.0.0.1'].includes(parsedUri.domain)) {
      errors.push('WhatsApp Business API requires HTTPS for production redirect URIs');
    }

    // Path recommendations
    if (!parsedUri.path.includes('oauth') && !parsedUri.path.includes('callback') && !parsedUri.path.includes('auth')) {
      recommendations.push('Consider using a descriptive path like /oauth/callback or /auth/whatsapp');
    }

    // Query parameters warning
    if (parsedUri.query) {
      warnings.push('Query parameters in redirect URI may cause issues with OAuth flow');
    }

    // Fragment warning
    if (parsedUri.fragment) {
      errors.push('Fragment (#) not allowed in redirect URI for server-side OAuth');
    }
  }

  // Facebook specific validations
  if (provider === 'facebook') {
    // Domain whitelist check for production
    if (!['localhost', '127.0.0.1'].includes(parsedUri.domain) && 
        !parsedUri.domain.endsWith('.vercel.app') &&
        !parsedUri.domain.endsWith('.herokuapp.com') &&
        !parsedUri.domain.endsWith('.netlify.app')) {
      warnings.push('Make sure this domain is added to your Facebook App settings');
    }

    // Path recommendations
    if (parsedUri.path === '/') {
      recommendations.push('Consider using a specific callback path like /auth/facebook/callback');
    }
  }

  // General security checks
  if (parsedUri.domain.includes('localhost') || parsedUri.domain.includes('127.0.0.1')) {
    warnings.push('Localhost URIs are only for development. Use a public domain for production.');
  }

  if (parsedUri.domain.includes('ngrok') || parsedUri.domain.includes('tunnel')) {
    warnings.push('Tunnel services detected. Ensure this is for development only.');
  }

  // IP address check
  if (/^\d+\.\d+\.\d+\.\d+$/.test(parsedUri.domain)) {
    warnings.push('IP addresses are not recommended. Use a domain name instead.');
  }

  // Subdomain security
  if (parsedUri.domain.split('.').length > 3) {
    warnings.push('Deep subdomain detected. Ensure this domain is under your control.');
  }

  // Additional recommendations
  if (strict) {
    if (parsedUri.path.length < 5) {
      recommendations.push('Consider using a more specific callback path for better security');
    }

    if (!parsedUri.path.endsWith('/')) {
      recommendations.push('Consider ending callback paths with / for consistency');
    }
  }

  return {
    isValid: errors.length === 0,
    uri,
    provider,
    errors,
    warnings,
    details: {
      protocol: parsedUri.protocol,
      domain: parsedUri.domain,
      path: parsedUri.path,
      query: parsedUri.query,
      fragment: parsedUri.fragment,
      port: parsedUri.port
    },
    recommendations
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RedirectUriValidationRequest = await request.json();
    const { uri, provider = 'general', strict = false } = body;

    if (!uri) {
      return NextResponse.json(
        { error: 'URI is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Validating redirect URI:', { uri, provider, strict });

    const validation = validateRedirectUri(uri, provider, strict);

    console.log('📊 Validation result:', {
      isValid: validation.isValid,
      errors: validation.errors.length,
      warnings: validation.warnings.length
    });

    return NextResponse.json(validation);

  } catch (error: any) {
    console.error('❌ Redirect URI validation error:', error);
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint for quick validation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get('uri');
  const provider = searchParams.get('provider') || 'general';
  const strict = searchParams.get('strict') === 'true';

  if (!uri) {
    return NextResponse.json(
      { error: 'URI parameter is required' },
      { status: 400 }
    );
  }

  try {
    const validation = validateRedirectUri(uri, provider, strict);
    return NextResponse.json(validation);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}