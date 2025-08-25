'use client';

import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface FacebookLoginButtonProps {
  onSuccess?: (data: { code: string; phone_number_id: string; waba_id: string }) => void;
  onError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  buttonText?: string;
  className?: string;
}

declare global {
  interface Window {
    checkLoginState: () => void;
  }
}

const FacebookLoginButton = ({
  onSuccess,
  onError,
  size = 'medium',
  buttonText = 'WhatsApp Business\'a Bağlan',
  className = ''
}: FacebookLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Login status callback
  const checkLoginState = () => {
    if (!window.FB) {
      console.warn('Facebook SDK not loaded yet');
      return;
    }

    window.FB.getLoginStatus(function(response) {
      console.log('📋 Login state response:', response);
      
      if (response.status === 'connected') {
        console.log('✅ User connected to Facebook');
        
        // If user is already connected, we might need to get WhatsApp permissions
        if (response.authResponse?.code) {
          console.log('📋 Authorization code received:', response.authResponse.code.substring(0, 10) + '...');
          // Handle the authorization code here
        }
      } else if (response.status === 'not_authorized') {
        console.log('⚠️ User logged into Facebook but not authorized for app');
        toast({
          title: "Yetkilendirme Gerekli",
          description: "Uygulamaya erişim için yetkilendirme yapmanız gerekiyor.",
          variant: "default"
        });
      } else {
        console.log('❌ User not logged into Facebook');
        toast({
          title: "Facebook Girişi Gerekli",
          description: "Önce Facebook'a giriş yapmanız gerekiyor.",
          variant: "default"
        });
      }
    });
  };

  // Message event listener for WhatsApp Embedded Signup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 WhatsApp Embedded Signup event:', data);
          
          if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
            const { code, phone_number_id, waba_id } = data.data;
            console.log('🎉 WhatsApp signup successful!', { code, phone_number_id, waba_id });

            toast({
              title: "Başarılı!",
              description: "WhatsApp Business hesabı başarıyla bağlandı.",
            });

            try {
              const response = await fetch('/api/whatsapp/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  code,
                  phone_number_id,
                  waba_id 
                }),
              });

              const result = await response.json();

              if (response.ok) {
                console.log('✅ Backend onboarding completed:', result);
                onSuccess?.({ code, phone_number_id, waba_id });
                
                toast({
                  title: "Kurulum Tamamlandı",
                  description: "WhatsApp Business entegrasyonu başarıyla tamamlandı.",
                });
              } else {
                console.error('❌ Backend onboarding failed:', result);
                onError?.(result.error || 'Backend onboarding failed');
                
                toast({
                  title: "Kurulum Hatası",
                  description: result.error || "Backend kurulumu sırasında hata oluştu.",
                  variant: "destructive"
                });
              }
            } catch (error) {
              console.error('❌ Error sending code to backend:', error);
              onError?.('Network error during onboarding');
              
              toast({
                title: "Ağ Hatası",
                description: "Backend ile iletişimde hata oluştu.",
                variant: "destructive"
              });
            }
            
          } else if (data.event === 'CANCEL') {
            console.warn('⚠️ User cancelled at step:', data.data.current_step);
            
            toast({
              title: "İptal Edildi",
              description: `Kullanıcı ${data.data.current_step} adımında işlemi iptal etti.`,
              variant: "destructive"
            });
            
          } else if (data.event === 'ERROR') {
            console.error('💥 An error occurred:', data.data.error_message);
            onError?.(data.data.error_message);
            
            toast({
              title: "Hata Oluştu",
              description: data.data.error_message || "WhatsApp entegrasyonu sırasında hata oluştu.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.log('📄 Received non-JSON response from popup:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError]);

  // Set up global callback function
  useEffect(() => {
    window.checkLoginState = checkLoginState;
    
    return () => {
      delete window.checkLoginState;
    };
  }, []);

  // Initialize Facebook Login Button when SDK is ready
  useEffect(() => {
    const initButton = () => {
      if (window.FB && containerRef.current) {
        // Parse any existing fb-login-button elements
        try {
          window.FB.XFBML.parse(containerRef.current);
        } catch (error) {
          console.warn('XFBML parse error:', error);
        }
      }
    };

    // Check if FB is already loaded
    if (window.FB) {
      initButton();
    } else {
      // Listen for FB SDK load
      const checkFB = setInterval(() => {
        if (window.FB) {
          clearInterval(checkFB);
          initButton();
        }
      }, 100);

      return () => clearInterval(checkFB);
    }
  }, []);

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: return 'medium';
    }
  };

  return (
    <div ref={containerRef} className={className}>
      <div
        className="fb-login-button"
        data-config-id={process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID}
        data-button-type="login_with"
        data-layout="default"
        data-size={getSizeClass()}
        data-button-text={buttonText}
        data-use-continue-as="false"
        data-width=""
        data-show-faces="false"
        data-auto-logout-link="false"
        data-onlogin="checkLoginState"
      />
    </div>
  );
};

export default FacebookLoginButton;