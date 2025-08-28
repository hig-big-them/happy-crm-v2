"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Giriş işlemi kontrol ediliyor...');
  const supabase = createClient();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const code = searchParams.get('code');
        const type = searchParams.get('type');
        const bypass = searchParams.get('bypass');
        const userId = searchParams.get('user');
        
        // Check if this is an email confirmation (has token/token_hash)
        const token = searchParams.get('token');
        const tokenHash = searchParams.get('token_hash');
        const isEmailConfirmation = !!(token || tokenHash);
        
        // Set next page - welcome for email confirmation, dashboard for others
        const next = isEmailConfirmation ? '/welcome' : (searchParams.get('next') || '/dashboard');
        
        // Error handling for URL parameters
        const error = searchParams.get('error');
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('❌ [AUTH-CALLBACK] URL Error:', { error, errorCode, errorDescription });
          
          if (errorCode === 'otp_expired') {
            setStatus('⏰ Email linki süresi dolmuş. Yeni bir onay emaili gönderin.');
            setTimeout(() => {
              router.push('/login?error=otp_expired&message=' + encodeURIComponent('Email linki süresi dolmuş. Yeni hesap oluşturun veya şifre sıfırlayın.'));
            }, 3000);
            return;
          }
          
          setStatus(`❌ Hata: ${errorDescription || error}`);
          setTimeout(() => {
            router.push('/login?error=' + error);
          }, 3000);
          return;
        }

        setStatus('Auth callback işleniyor...');

        // Handle auth code exchange first
        if (code) {
          setStatus('Kimlik doğrulama kodu işleniyor...');
          console.log('🔑 [AUTH-CALLBACK] Processing auth code...');
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('❌ [AUTH-CALLBACK] Code exchange error:', error);
            setStatus('Kimlik doğrulama hatası: ' + error.message);
            setTimeout(() => {
              router.push('/login?error=auth_failed');
            }, 3000);
            return;
          }
          
          if (data.session) {
            console.log('✅ [AUTH-CALLBACK] Session created successfully');
            setStatus('Giriş başarılı! Yönlendiriliyor...');
            
            // Wait a moment for session to be stored
            setTimeout(() => {
              router.push(next);
            }, 1000);
            return;
          }
        }

        // Handle email confirmation (token-based)
        if (token || tokenHash) {
          setStatus('Email onayı işleniyor...');
          console.log('📧 [AUTH-CALLBACK] Processing email confirmation...', { token: !!token, tokenHash: !!tokenHash });
          
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash || token || '',
              type: 'email'
            });
            
            console.log('📧 [AUTH-CALLBACK] Verification result:', { 
              hasError: !!error, 
              hasSession: !!data?.session, 
              hasUser: !!data?.user,
              error: error?.message 
            });
            
            if (error) {
              console.error('❌ [AUTH-CALLBACK] Email verification error:', error);
              setStatus('Email onay hatası: ' + error.message);
              setTimeout(() => {
                router.push('/login?error=verification_failed&message=' + encodeURIComponent(error.message));
              }, 3000);
              return;
            }
            
            if (data.session) {
              console.log('✅ [AUTH-CALLBACK] Email verified, session created - redirecting to welcome');
              setStatus('Email onaylandı! Karşılama sayfasına yönlendiriliyor...');
              
              setTimeout(() => {
                console.log('🔄 [AUTH-CALLBACK] Navigating to /welcome');
                router.push('/welcome');
              }, 1000);
              return;
            } else if (data.user) {
              console.log('✅ [AUTH-CALLBACK] Email verified, but no session - redirecting to login');
              setStatus('Email onaylandı! Login sayfasına yönlendiriliyor...');
              
              setTimeout(() => {
                router.push('/login?success=email_verified&message=' + encodeURIComponent('Email adresiniz onaylandı. Şimdi giriş yapabilirsiniz.'));
              }, 2000);
              return;
            }
          } catch (verifyError) {
            console.error('❌ [AUTH-CALLBACK] Verification failed:', verifyError);
            setStatus('Onay işlemi başarısız');
          }
        }

        if (type === 'recovery') {
          setStatus('Recovery token işleniyor...');
          
          // Handle recovery token
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Recovery error:', error);
            setStatus('Recovery hatası, bypass deneniyor...');
          } else if (data.session) {
            setStatus('Recovery başarılı, yönlendiriliyor...');
            router.push(next);
            return;
          }
        }

        if (bypass === 'true' && userId) {
          setStatus('Bypass login aktif, kullanıcı verisi yükleniyor...');
          
          // Check if user exists in localStorage
          const bypassUser = localStorage.getItem('bypass_user');
          if (bypassUser) {
            setStatus('Bypass kullanıcısı bulundu, dashboard\'a yönlendiriliyor...');
            router.push('/dashboard?bypass=true');
            return;
          }
        }

        // Check current session
        setStatus('Mevcut session kontrol ediliyor...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('Session hatası: ' + sessionError.message);
        } else if (session) {
          setStatus('Session bulundu, yönlendiriliyor...');
          router.push(next);
        } else {
          setStatus('Session bulunamadı, login\'e yönlendiriliyor...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('Hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
        
        // Fallback redirect
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    }

    handleAuthCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">🔐 Giriş İşlemi</h2>
        <p className="text-gray-600 mb-4">{status}</p>
        <div className="text-sm text-gray-500">
          Lütfen bekleyin, otomatik olarak yönlendirileceksiniz...
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">🔐 Giriş İşlemi</h2>
          <p className="text-gray-600 mb-4">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}