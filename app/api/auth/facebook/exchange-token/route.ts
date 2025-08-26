/**
 * API Route: Facebook OAuth Token Exchange
 * 
 * Authorization code'u access token ile değiştirir
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// Facebook App credentials
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || "1824928921450494";
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || "";
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || "https://developers.facebook.com/es/oauth/callback/";

// Facebook Graph API base URL
const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v22.0";

interface TokenExchangeRequest {
  code: string;
  redirect_uri?: string;
  business_id?: string;
  nonce?: string;
}

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    const body: TokenExchangeRequest = await request.json();
    const { code, redirect_uri, business_id, nonce } = body;

    console.log('📥 Facebook token exchange request:', {
      code: code ? 'PROVIDED' : 'MISSING',
      redirect_uri,
      business_id,
      nonce: nonce ? 'PROVIDED' : 'MISSING'
    });

    // Validation
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    if (!FACEBOOK_CLIENT_SECRET) {
      console.error('❌ Facebook Client Secret not configured');
      return NextResponse.json(
        { error: 'Facebook integration not configured' },
        { status: 500 }
      );
    }

    // User authentication kontrolü
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Facebook'a token exchange request'i gönder
    const tokenExchangeUrl = `${FACEBOOK_GRAPH_URL}/oauth/access_token`;
    const requestBody = {
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri || FACEBOOK_REDIRECT_URI
    };

    console.log('📤 Sending token exchange request to Facebook:', {
      url: tokenExchangeUrl,
      client_id: FACEBOOK_CLIENT_ID,
      redirect_uri: requestBody.redirect_uri,
      code: 'PROVIDED'
    });

    const response = await fetch(tokenExchangeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HappyCRM/1.0"
      },
      body: JSON.stringify(requestBody)
    });

    const tokenData: FacebookTokenResponse = await response.json();

    console.log('📥 Facebook token response:', {
      success: !!tokenData.access_token,
      has_error: !!tokenData.error,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in
    });

    if (tokenData.error) {
      console.error('❌ Facebook token exchange error:', tokenData.error);
      return NextResponse.json(
        { 
          error: 'Token exchange failed',
          details: tokenData.error.message,
          facebook_error: tokenData.error
        },
        { status: 400 }
      );
    }

    if (!tokenData.access_token) {
      console.error('❌ No access token received from Facebook');
      return NextResponse.json(
        { error: 'No access token received' },
        { status: 400 }
      );
    }

    // Access token'ı güvenli şekilde sakla
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    const { error: saveError } = await supabase
      .from('facebook_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'bearer',
        expires_at: expiresAt,
        business_id: business_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('❌ Token save error:', saveError);
      return NextResponse.json(
        { error: 'Failed to save token' },
        { status: 500 }
      );
    }

    // WhatsApp Business Account bilgilerini al
    let businessInfo = null;
    if (business_id) {
      try {
        const businessResponse = await fetch(
          `${FACEBOOK_GRAPH_URL}/${business_id}?access_token=${tokenData.access_token}&fields=name,id,whatsapp_business_accounts`
        );
        businessInfo = await businessResponse.json();
        console.log('📊 Business info retrieved:', businessInfo);
      } catch (error) {
        console.warn('⚠️ Failed to fetch business info:', error);
      }
    }

    // Activity log
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'facebook_token_exchange',
        details: {
          business_id,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          business_info: businessInfo
        },
        created_at: new Date().toISOString()
      });

    console.log('✅ Facebook token exchange successful');

    return NextResponse.json({
      success: true,
      message: 'Token exchanged successfully',
      data: {
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        expires_at: expiresAt,
        business_id,
        business_info: businessInfo,
        // Token'ı response'ta gönderme - güvenlik için
        access_token_saved: true
      }
    });

  } catch (error: any) {
    console.error('❌ Facebook token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint - token durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Mevcut token'ları kontrol et
    const { data: tokens, error } = await supabase
      .from('facebook_tokens')
      .select('token_type, expires_at, business_id, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Token query error:', error);
      return NextResponse.json(
        { error: 'Failed to query tokens' },
        { status: 500 }
      );
    }

    const activeTokens = tokens?.filter(token => {
      if (!token.expires_at) return true; // Never expires
      return new Date(token.expires_at) > new Date(); // Not expired
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        has_active_tokens: activeTokens.length > 0,
        token_count: tokens?.length || 0,
        active_token_count: activeTokens.length,
        tokens: activeTokens.map(token => ({
          token_type: token.token_type,
          expires_at: token.expires_at,
          business_id: token.business_id,
          created_at: token.created_at,
          is_expired: token.expires_at ? new Date(token.expires_at) <= new Date() : false
        }))
      }
    });

  } catch (error: any) {
    console.error('❌ Token status check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}