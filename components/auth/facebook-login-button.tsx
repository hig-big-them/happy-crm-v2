'use client';

/**
 * Facebook Login Button Component
 * 
 * Facebook OAuth login işlemini handle eden UI component
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useFacebookSDK } from './facebook-sdk-provider';
import { useToast } from '@/hooks/use-toast';

interface FacebookLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  children?: React.ReactNode;
}

export function FacebookLoginButton({
  onSuccess,
  onError,
  onCancel,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  children
}: FacebookLoginButtonProps) {
  const { isInitialized, login, getLoginStatus, api } = useFacebookSDK();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login status kontrolü
  const checkLoginStatus = useCallback(() => {
    if (!isInitialized) return;

    getLoginStatus((response: any) => {
      if (response.status === 'connected') {
        console.log('✅ User is already logged in to Facebook');
        setIsLoggedIn(true);
      } else {
        console.log('ℹ️ User is not logged in to Facebook');
        setIsLoggedIn(false);
      }
    });
  }, [isInitialized, getLoginStatus]);

  // Facebook login handler
  const handleFacebookLogin = useCallback(async () => {
    if (!isInitialized) {
      toast({
        title: "Facebook SDK Yükleniyor",
        description: "Lütfen bir moment bekleyin...",
        variant: "default"
      });
      return;
    }

    setIsLoading(true);

    try {
      login((response: any) => {
        setIsLoading(false);

        if (response.authResponse) {
          console.log('✅ Facebook login successful');
          
          // User info al
          api('/me', 'GET', { 
            fields: 'id,name,email,picture.type(large)' 
          }, async (userResponse: any) => {
            if (userResponse.error) {
              console.error('❌ Failed to get user info:', userResponse.error);
              onError?.(userResponse.error);
              return;
            }

            console.log('👤 Facebook user info:', userResponse);

            const loginData = {
              ...response,
              userInfo: userResponse
            };

            setIsLoggedIn(true);

            toast({
              title: "Facebook Login Başarılı",
              description: `Hoş geldiniz, ${userResponse.name}!`,
              variant: "default"
            });

            // Server'a token exchange için gönder
            try {
              const exchangeResponse = await fetch('/api/auth/facebook/exchange-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  code: response.authResponse.accessToken, // Geçici - production'da authorization code olmalı
                  user_info: userResponse
                })
              });

              const exchangeResult = await exchangeResponse.json();
              
              if (exchangeResponse.ok) {
                console.log('✅ Token exchange successful');
                onSuccess?.(loginData);
              } else {
                console.warn('⚠️ Token exchange failed:', exchangeResult);
                onSuccess?.(loginData); // Yine de login'i başarılı say
              }

            } catch (exchangeError) {
              console.error('❌ Token exchange error:', exchangeError);
              onSuccess?.(loginData); // Yine de login'i başarılı say
            }
          });

        } else if (response.status === 'not_authorized') {
          console.log('❌ User cancelled login or did not fully authorize');
          
          toast({
            title: "Facebook Login İptal Edildi",
            description: "Giriş işlemi iptal edildi veya yetkilendirme tamamlanamadı.",
            variant: "destructive"
          });

          onCancel?.();

        } else {
          console.log('❌ User did not log in to Facebook');
          
          toast({
            title: "Facebook Login Başarısız",
            description: "Facebook'a giriş yapılamadı.",
            variant: "destructive"
          });

          onError?.(new Error('Facebook login failed'));
        }
      }, {
        scope: 'email,public_profile,whatsapp_business_management,whatsapp_business_messaging',
        return_scopes: true
      });

    } catch (error) {
      setIsLoading(false);
      console.error('❌ Facebook login error:', error);
      
      toast({
        title: "Facebook Login Hatası",
        description: "Beklenmeyen bir hata oluştu.",
        variant: "destructive"
      });

      onError?.(error);
    }
  }, [isInitialized, login, api, toast, onSuccess, onError, onCancel]);

  // Component mount'ta login status kontrol et
  React.useEffect(() => {
    if (isInitialized) {
      checkLoginStatus();
    }
  }, [isInitialized, checkLoginStatus]);

  const buttonSize = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  }[size];

  return (
    <Button
      onClick={handleFacebookLogin}
      disabled={disabled || !isInitialized || isLoading}
      variant={variant}
      className={`${buttonSize} ${className} bg-[#1877F2] hover:bg-[#166FE5] text-white border-0`}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Giriş yapılıyor...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {children || (isLoggedIn ? 'Facebook\'a Bağlı' : 'Facebook ile Giriş Yap')}
        </>
      )}
    </Button>
  );
}

// Facebook Logout Button
interface FacebookLogoutButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  children?: React.ReactNode;
}

export function FacebookLogoutButton({
  onSuccess,
  onError,
  className = '',
  size = 'md',
  variant = 'outline',
  disabled = false,
  children
}: FacebookLogoutButtonProps) {
  const { isInitialized, logout } = useFacebookSDK();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogout = useCallback(() => {
    if (!isInitialized) return;

    setIsLoading(true);

    logout((response: any) => {
      setIsLoading(false);
      console.log('📤 Facebook logout response:', response);

      toast({
        title: "Facebook Logout",
        description: "Facebook oturumu sonlandırıldı.",
        variant: "default"
      });

      onSuccess?.();
    });
  }, [isInitialized, logout, toast, onSuccess]);

  const buttonSize = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  }[size];

  return (
    <Button
      onClick={handleFacebookLogout}
      disabled={disabled || !isInitialized || isLoading}
      variant={variant}
      className={`${buttonSize} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Çıkış yapılıyor...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {children || 'Facebook Çıkış'}
        </>
      )}
    </Button>
  );
}