'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: any) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras: {
            sessionInfoVersion: number;
          };
        }
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}

interface EmbeddedSignupButtonProps {
  onSuccess?: (data: { code: string; phone_number_id: string; waba_id: string }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const EmbeddedSignupButton = ({
  onSuccess,
  onError,
  disabled = false,
  className = ""
}: EmbeddedSignupButtonProps) => {

  const handleLogin = () => {
    if (!window.FB) {
      toast({
        title: "Hata",
        description: "Facebook SDK henüz yüklenmedi. Lütfen bekleyin.",
        variant: "destructive"
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID) {
      toast({
        title: "Yapılandırma Hatası",
        description: "Facebook Configuration ID tanımlanmamış.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 Starting WhatsApp Embedded Signup...');

    window.FB.login(
      function (response) {
        // Bu callback, login penceresi kapandığında çalışır.
        console.log('📋 FB.login response:', response);
        
        if (response.authResponse) {
          console.log('✅ Login successful, waiting for session info...');
          // Code burada da alınabilir ama genellikle message event ile geliyor
          if (response.authResponse.code) {
            console.log('📋 Authorization code received:', response.authResponse.code.substring(0, 10) + '...');
          }
        } else {
          console.log('❌ User cancelled login or did not fully authorize.');
          toast({
            title: "İptal Edildi",
            description: "Kullanıcı giriş işlemini iptal etti.",
            variant: "destructive"
          });
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: 3, // WABA ID ve diğer bilgileri almak için zorunlu
          setup: {
            business: {
              id: null,
              name: null,
              email: null,
              phone: { code: null, number: null },
              website: null,
              address: {
                streetAddress1: null,
                streetAddress2: null,
                city: null,
                state: null,
                zipPostal: null,
                country: null
              },
              timezone: null
            },
            phone: {
              displayName: null,
              category: null,
              description: null
            },
            preVerifiedPhone: { ids: null },
            solutionID: null,
            whatsAppBusinessAccount: { ids: null }
          }
        },
      }
    );
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Güvenlik: Sadece Facebook domain'lerinden gelen mesajları kabul et
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 WhatsApp Embedded Signup event:', data);
          
          if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
            const { code, phone_number_id, waba_id } = data.data;
            console.log('🎉 Onboarding successful!', { code, phone_number_id, waba_id });

            toast({
              title: "Başarılı!",
              description: "WhatsApp Business hesabı başarıyla bağlandı.",
            });

            try {
              // Alınan 'code'u backend'e gönder
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

    // Event listener'ı ekle
    window.addEventListener('message', handleMessage);

    // Cleanup: Component unmount olduğunda event listener'ı kaldır
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError]);

  return (
    <Button 
      onClick={handleLogin} 
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      {disabled ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Bağlanıyor...
        </>
      ) : (
        <>
          <MessageSquare className="h-4 w-4" />
          WhatsApp Business'a Bağlan
        </>
      )}
    </Button>
  );
};

export default EmbeddedSignupButton;