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

  const handleOnboarding = async (code: string, sessionInfo?: any) => {
    try {
      console.log('🔄 Starting onboarding with:', { 
        code: code.substring(0, 10) + '...', 
        sessionInfo 
      });

      const response = await fetch('/api/whatsapp/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          phone_number_id: sessionInfo?.phone_number_id || null,
          waba_id: sessionInfo?.waba_id || null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Backend onboarding completed:', result);
        console.log('📊 Backend response data:', result.data);
        
        // WABA bilgilerini kontrol et
        if (!result.data?.waba_id || !result.data?.phone_number_id) {
          console.warn('⚠️ Missing WABA or Phone Number ID in backend response:', {
            waba_id: result.data?.waba_id,
            phone_number_id: result.data?.phone_number_id,
            full_data: result.data
          });
        }
        
        // WhatsApp verilerini state'e kaydet ve signup modal'ını göster
        const whatsappInfo = {
          waba_id: result.data?.waba_id,
          phone_number_id: result.data?.phone_number_id,
          verified_name: result.data?.verified_name,
          display_phone_number: result.data?.display_phone_number,
          status: result.data?.status,
          quality_rating: result.data?.quality_rating
        };
        
        console.log('📱 Setting WhatsApp data for modal:', whatsappInfo);
        setWhatsappData(whatsappInfo);
        setShowSignupModal(true);
        
        toast({
          title: "WhatsApp Bağlandı!",
          description: `WABA: ${result.data?.waba_id || 'N/A'}, Phone: ${result.data?.phone_number_id || 'N/A'}`,
        });
      } else {
        console.error('❌ Backend onboarding failed:', result);
        
        // Detaylı hata mesajı göster
        let errorMessage = result.error || "Backend kurulumu sırasında hata oluştu.";
        if (result.details) {
          errorMessage += ` Detay: ${result.details}`;
        }
        if (result.missing_vars) {
          errorMessage += ` Eksik değişkenler: ${result.missing_vars.join(', ')}`;
        }
        
        toast({
          title: "Kurulum Hatası",
          description: errorMessage,
          variant: "destructive"
        });
        
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error sending code to backend:', error);
      toast({
        title: "Ağ Hatası",
        description: "Backend ile iletişimde hata oluştu.",
        variant: "destructive"
      });
    }
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
          console.log('✅ Login successful, processing authorization...');
          
          if (response.authResponse.code) {
            console.log('📋 Authorization code received:', response.authResponse.code.substring(0, 10) + '...');
            
            // Authorization code'u window'a kaydet (message event için fallback)
            window.whatsappAuthCode = response.authResponse.code;
            
            // Session info'yu çıkar (WABA ID ve Phone Number ID burada olabilir)
            const sessionInfo = response.authResponse.sessionInfo || {};
            console.log('📊 Session info from Facebook:', sessionInfo);
            
            // Session info'dan WABA bilgilerini çıkarmaya çalış
            let extractedWabaId = null;
            let extractedPhoneId = null;
            
            // Farklı yollarla WABA bilgilerini çıkarmaya çalış
            if (sessionInfo.whatsapp_business_account) {
              extractedWabaId = sessionInfo.whatsapp_business_account.id;
            }
            if (sessionInfo.phone_number) {
              extractedPhoneId = sessionInfo.phone_number.id;
            }
            
            // Alternatif yapılar için kontrol et
            if (sessionInfo.setup && sessionInfo.setup.whatsapp_business_account) {
              extractedWabaId = sessionInfo.setup.whatsapp_business_account.id;
            }
            if (sessionInfo.setup && sessionInfo.setup.phone_number) {
              extractedPhoneId = sessionInfo.setup.phone_number.id;
            }
            
            console.log('🔍 Extracted from session info:', {
              waba_id: extractedWabaId,
              phone_number_id: extractedPhoneId
            });
            
            // Enhanced session info ile gönder
            const enhancedSessionInfo = {
              ...sessionInfo,
              waba_id: extractedWabaId,
              phone_number_id: extractedPhoneId
            };
            
            // Async işlemi ayrı fonksiyonda yap
            handleOnboarding(response.authResponse.code, enhancedSessionInfo);
          } else {
            console.log('⚠️ No authorization code in response');
            toast({
              title: "Kod Hatası",
              description: "Authorization code alınamadı. Lütfen tekrar deneyin.",
              variant: "destructive"
            });
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
        config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID || '1806045803357264',
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
        console.log('📨 Received message from Facebook:', data);
        
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 WhatsApp Embedded Signup event:', data);
          
          if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
            console.log('🎉 WhatsApp Embedded Signup completed via message event');
            
            // Message event'ten gelen verileri de kontrol et
            const messageSessionInfo = data.data || {};
            console.log('📊 Session info from message event:', messageSessionInfo);
            
            // Message event'ten WABA bilgilerini çıkarmaya çalış
            let messageWabaId = messageSessionInfo.waba_id || messageSessionInfo.whatsapp_business_account_id;
            let messagePhoneId = messageSessionInfo.phone_number_id;
            
            // Alternatif field'ları kontrol et
            if (!messageWabaId && messageSessionInfo.whatsapp_business_account) {
              messageWabaId = messageSessionInfo.whatsapp_business_account.id;
            }
            if (!messagePhoneId && messageSessionInfo.phone_number) {
              messagePhoneId = messageSessionInfo.phone_number.id;
            }
            
            console.log('🔍 Extracted from message event:', {
              waba_id: messageWabaId,
              phone_number_id: messagePhoneId
            });
            
            // Eğer FB.login callback'i henüz çalışmadıysa, bu verileri kullan
            if (messageWabaId && messagePhoneId) {
              console.log('🔄 Using session info from message event as fallback');
              // Bu durumda authorization code'u window'dan al (eğer varsa)
              if (window.whatsappAuthCode) {
                const enhancedMessageInfo = {
                  ...messageSessionInfo,
                  waba_id: messageWabaId,
                  phone_number_id: messagePhoneId
                };
                handleOnboarding(window.whatsappAuthCode, enhancedMessageInfo);
              }
            }
          } else if (data.event === 'CANCEL') {
            console.warn('⚠️ User cancelled at step:', data.data?.current_step);
          } else if (data.event === 'ERROR') {
            console.error('💥 An error occurred:', data.data?.error_message);
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
  }, []);

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
            console.log('🔒 Closing signup modal');
            setShowSignupModal(false);
            setWhatsappData(null); // WhatsApp verilerini temizle
          }}
          whatsappData={whatsappData}
          onSuccess={(userData) => {
            console.log('✅ Signup modal success:', userData);
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
      
      {/* Debug: Modal state'ini göster */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50">
          Modal: {showSignupModal ? 'OPEN' : 'CLOSED'} | 
          Data: {whatsappData ? 'YES' : 'NO'} |
          WABA: {whatsappData?.waba_id || 'N/A'}
        </div>
      )}
    </>
  );
};

export default EmbeddedSignupButton;