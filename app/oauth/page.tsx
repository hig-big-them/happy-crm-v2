'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * OAuth Redirect Handler Page
 * Meta sometimes redirects to root domain, this handles the redirect
 */
export default function OAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📋 OAuth redirect page:', { code: code?.substring(0, 10) + '...', state, error });

    if (code) {
      // Forward to our API endpoint
      fetch('/api/whatsapp/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          state,
          redirect_source: 'oauth_page'
        }),
      })
      .then(response => response.json())
      .then(result => {
        console.log('✅ OAuth forwarded to API:', result);
        
        if (result.success) {
          // Redirect to dashboard with success message
          router.push('/dashboard?whatsapp_connected=true');
        } else {
          // Redirect to error page
          router.push('/whatsapp-signup?error=' + encodeURIComponent(result.error || 'OAuth failed'));
        }
      })
      .catch(error => {
        console.error('❌ OAuth forwarding failed:', error);
        router.push('/whatsapp-signup?error=' + encodeURIComponent('OAuth processing failed'));
      });
    } else if (error) {
      console.error('❌ OAuth error:', error);
      router.push('/whatsapp-signup?error=' + encodeURIComponent(error));
    } else {
      // No code or error, redirect to signup
      router.push('/whatsapp-signup');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing WhatsApp connection...</p>
      </div>
    </div>
  );
}