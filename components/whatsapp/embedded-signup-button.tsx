'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { TermsOfServiceModal } from './terms-of-service-modal';
import { SignupModal } from './signup-modal';

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
    whatsappAuthCode?: string;
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [whatsappData, setWhatsappData] = useState<any>(null);
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);
  
  // Facebook SDK'nın yüklenmesini bekle
  useEffect(() => {
    const checkFbSdk = () => {
      if (window.FB) {
        setIsFbSdkLoaded(true);
        console.log('✅ Facebook SDK loaded successfully');
      } else {
        // SDK henüz yüklenmemiş, tekrar dene
        setTimeout(checkFbSdk, 100);
      }
    };
    
    // fbAsyncInit callback'ini dinle
    const originalFbAsyncInit = window.fbAsyncInit;
    window.fbAsyncInit = function() {
      if (originalFbAsyncInit) {
        originalFbAsyncInit();
      }
      // SDK yüklendiğinde state'i güncelle
      setTimeout(() => {
        if (window.FB) {
          setIsFbSdkLoaded(true);
          console.log('✅ Facebook SDK initialized via fbAsyncInit');
        }
      }, 100);
    };
    
    // Eğer SDK zaten yüklenmişse
    if (window.FB) {
      setIsFbSdkLoaded(true);
      console.log('✅ Facebook SDK already loaded');
    } else {
      checkFbSdk();
    }
    
    // Cleanup
    return () => {
      window.fbAsyncInit = originalFbAsyncInit;
    };
  }, []);

  const handleButtonClick = () => {
    // Eğer zaten bir modal açıksa, yeni modal açma
    if (showTermsModal || showSignupModal) {
      console.log('⚠️ Modal already open, ignoring click');
      return;
    }
    
    // Show terms modal first
    setShowTermsModal(true);
  };

  const handleTermsAccept = () => {
    setShowTermsModal(false);
    // Proceed with actual login
    handleLogin();
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    toast({
      title: "İptal Edildi",
      description: "Hizmet şartlarını kabul etmeden WhatsApp entegrasyonu yapılamaz.",
      variant: "destructive"
    });
  };

  const handleTermsClose = () => {
    setShowTermsModal(false);
  };

  const handleLogin = () => {
    if (!isFbSdkLoaded || !window.FB) {
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
    console.log('🔍 Debug info:', {
      configId: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      currentDomain: window.location.hostname,
      protocol: window.location.protocol
    });

    window.FB.login(
      function (response) {
        
        console.log('📋 FB.login response:', response);
        
        if (response.authResponse) {
          console.log('✅ Login successful, waiting for session info...');
          // Code burada da alınabilir ama genellikle message event ile geliyor
          if (response.authResponse.code) {
            console.log('📋 Authorization code received:', response.authResponse.code.substring(0, 10) + '...');
            // Code'u global olarak sakla
            window.whatsappAuthCode = response.authResponse.code;
          }
        } else {
          console.log('❌ User cancelled login or did not fully authorize.');
          console.log('📋 Response status:', response.status);
          
          // Status'u kontrol et ama daha esnek ol
          if (response.status === 'unknown') {
            console.log('⚠️ Login status unknown - this might be normal for embedded signup');
            // Unknown status normal olabilir, sadece log'la
          } else {
            toast({
              title: "İptal Edildi",
              description: "Kullanıcı giriş işlemini iptal etti.",
              variant: "destructive"
            });
          }
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
    let isProcessing = false; // Popup'ın sürekli açılmasını engellemek için flag
    let messageTimeout: NodeJS.Timeout | null = null;

    const handleMessage = async (event: MessageEvent) => {
      // Güvenlik: Sadece Facebook domain'lerinden gelen mesajları kabul et
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }

      // Eğer zaten işlem yapılıyorsa, yeni mesajları görmezden gel
      if (isProcessing) {
        console.log('⚠️ Already processing a message, ignoring new one');
        return;
      }

      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received message from Facebook:', data);
        
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 WhatsApp Embedded Signup event:', data);
          
          if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
            isProcessing = true; // İşlem başladı
            
            const { phone_number_id, waba_id } = data.data;
            // Code'u önce message event'ten al, yoksa global'den al
            let code = data.data.code;
            if (!code && window.whatsappAuthCode) {
              code = window.whatsappAuthCode;
              console.log('📋 Using authorization code from FB.login response');
            }
            
            console.log('🎉 Onboarding successful!', { code, phone_number_id, waba_id });

            if (!code) {
              console.error('❌ No authorization code available');
              toast({
                title: "Kod Hatası",
                description: "Authorization code bulunamadı. Lütfen tekrar deneyin.",
                variant: "destructive"
              });
              isProcessing = false;
              return;
            }

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
                
                // WhatsApp verilerini state'e kaydet ve signup modal'ını göster
                setWhatsappData({
                  waba_id,
                  phone_number_id,
                  verified_name: result.data?.verified_name,
                  display_phone_number: result.data?.display_phone_number,
                  status: result.data?.status,
                  quality_rating: result.data?.quality_rating
                });
                setShowSignupModal(true);
                
                toast({
                  title: "WhatsApp Bağlandı!",
                  description: "Şimdi hesap bilgilerinizi girin.",
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
            } finally {
              isProcessing = false; // İşlem bitti
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

    // Message timeout'u ayarla (10 dakika)
    messageTimeout = setTimeout(() => {
      console.log('⏰ Message timeout reached - no response from Facebook');
      toast({
        title: "Zaman Aşımı",
        description: "Facebook'tan yanıt alınamadı. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }, 600000); // 10 dakika

    // Event listener'ı ekle
    window.addEventListener('message', handleMessage);

    // Cleanup: Component unmount olduğunda event listener'ı kaldır
    return () => {
      window.removeEventListener('message', handleMessage);
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      // Global code'u temizle
      delete window.whatsappAuthCode;
    };
  }, [onSuccess, onError]);

  return (
    <>
      <Button 
        onClick={handleButtonClick} 
        disabled={disabled || !isFbSdkLoaded}
        className={`flex items-center gap-2 ${className}`}
      >
        {disabled ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Bağlanıyor...
          </>
        ) : !isFbSdkLoaded ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Hazırlanıyor...
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4" />
            WhatsApp Business'a Bağlan
          </>
        )}
      </Button>

      <TermsOfServiceModal
        open={showTermsModal}
        onOpenChange={handleTermsClose}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      {whatsappData && (
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => {
            setShowSignupModal(false);
            setWhatsappData(null); // WhatsApp verilerini temizle
          }}
          whatsappData={whatsappData}
          onSuccess={(userData) => {
            onSuccess?.({ 
              code: '', 
              phone_number_id: whatsappData.phone_number_id, 
              waba_id: whatsappData.waba_id 
            });
            setShowSignupModal(false);
            setWhatsappData(null);
          }}
        />
      )}
    </>
  );
};

export default EmbeddedSignupButton;