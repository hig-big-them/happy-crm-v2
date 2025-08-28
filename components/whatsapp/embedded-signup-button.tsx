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
  skipSignupModal?: boolean; // Welcome sayfası için signup modal'ını atla
}

const EmbeddedSignupButton = ({
  onSuccess,
  onError,
  disabled = false,
  className = "",
  skipSignupModal = false
}: EmbeddedSignupButtonProps) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [whatsappData, setWhatsappData] = useState<any>(null);
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);
  const [onboardingInProgress, setOnboardingInProgress] = useState(false);
  const [messageEventData, setMessageEventData] = useState<any>(null);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [waitingForEvents, setWaitingForEvents] = useState(false);
  
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
    // Eğer onboarding zaten devam ediyorsa, tekrar başlatma
    if (onboardingInProgress) {
      console.log('⚠️ Onboarding already in progress, skipping...');
      return;
    }

    setOnboardingInProgress(true);
    
    try {
      console.log('🔄 Starting onboarding with:', { 
        code: code.substring(0, 10) + '...', 
        sessionInfo,
        messageEventData
      });

      // Message event'ten gelen verileri öncelikli olarak kullan
      const finalSessionInfo = messageEventData || sessionInfo || {};

      const response = await fetch('/api/whatsapp/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          phone_number_id: finalSessionInfo?.phone_number_id || null,
          waba_id: finalSessionInfo?.waba_id || null
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
        
        if (skipSignupModal) {
          // Welcome sayfasında signup modal'ını atla, direkt success callback'ini çağır
          console.log('🔄 Skipping signup modal, calling success callback directly');
          onSuccess?.({
            code: '',
            phone_number_id: result.data?.phone_number_id || '',
            waba_id: result.data?.waba_id || ''
          });
          
          toast({
            title: "WhatsApp Business Bağlandı!",
            description: `WABA ID: ${result.data?.waba_id || 'N/A'}, Phone ID: ${result.data?.phone_number_id || 'N/A'}`,
          });
        } else {
          // Normal akış: signup modal'ını göster
          setWhatsappData(whatsappInfo);
          setShowSignupModal(true);
          
          toast({
            title: "WhatsApp Bağlandı!",
            description: `WABA: ${result.data?.waba_id || 'N/A'}, Phone: ${result.data?.phone_number_id || 'N/A'}`,
          });
        }
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
    } finally {
      setOnboardingInProgress(false);
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

    // Multiple fallback mechanisms
    let popupClosed = false;
    let fallbackTriggered = false;
    
    // Window focus event'ini dinle (popup kapandığında tetiklenir)
    const handleWindowFocus = () => {
      console.log('🔍 Window focus event triggered');
      console.log('🔍 Current state:', { waitingForEvents, popupClosed, fallbackTriggered, onboardingInProgress });
      
      if (waitingForEvents && !popupClosed && !fallbackTriggered) {
        popupClosed = true;
        fallbackTriggered = true;
        console.log('🔍 Window focused - popup likely closed, checking for auth code...');
        console.log('🔍 Current auth code:', window.whatsappAuthCode ? window.whatsappAuthCode.substring(0, 10) + '...' : 'None');
        
        // Kısa bir gecikme sonrası auth code kontrol et
        setTimeout(() => {
          if (window.whatsappAuthCode && !onboardingInProgress) {
            console.log('🎯 Found auth code after window focus, starting onboarding');
            setWaitingForEvents(false);
            handleOnboarding(window.whatsappAuthCode, {});
          } else {
            console.log('❌ No auth code found after window focus');
            triggerManualFallback();
          }
        }, 1000);
      }
    };
    
    // Visibility change event'ini de dinle
    const handleVisibilityChange = () => {
      console.log('🔍 Visibility change event triggered, document.hidden:', document.hidden);
      if (!document.hidden && waitingForEvents && !fallbackTriggered) {
        console.log('🔍 Document became visible - checking for auth code...');
        setTimeout(() => {
          if (window.whatsappAuthCode && !onboardingInProgress) {
            console.log('🎯 Found auth code after visibility change');
            fallbackTriggered = true;
            setWaitingForEvents(false);
            handleOnboarding(window.whatsappAuthCode, {});
          }
        }, 500);
      }
    };
    
    // Manual fallback function
    const triggerManualFallback = () => {
      console.log('🔄 Triggering manual fallback...');
      console.log('🔍 Auth code check:', window.whatsappAuthCode ? 'Found' : 'Not found');
      
      if (window.whatsappAuthCode && !onboardingInProgress) {
        console.log('🎯 Using auth code from manual fallback');
        setWaitingForEvents(false);
        handleOnboarding(window.whatsappAuthCode, {});
      } else {
        console.log('❌ No auth code available for manual fallback');
        setWaitingForEvents(false);
        toast({
          title: "Veri Alınamadı",
          description: "WhatsApp popup'ından authorization code alınamadı. Lütfen tekrar deneyin.",
          variant: "destructive"
        });
      }
    };
    
    // Event listeners ekle
    window.addEventListener('focus', handleWindowFocus, { once: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });

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
            
            // Async işlemi ayrı fonksiyonda yap (sadece onboarding devam etmiyorsa)
            if (!onboardingInProgress) {
              handleOnboarding(response.authResponse.code, enhancedSessionInfo);
            } else {
              console.log('⚠️ Onboarding already in progress via message event, skipping FB.login callback');
            }
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
            console.log('⚠️ Login status unknown - this is normal for embedded signup');
            console.log('👂 Waiting for message events from popup...');
            
            setWaitingForEvents(true);
            
            // Unknown status embedded signup için normal
            // Message event'leri bekleyeceğiz, hata gösterme
            toast({
              title: "Bağlantı Kuruluyor",
              description: "WhatsApp Business bağlantısı kuruluyor, lütfen bekleyin...",
            });
            
            // Popup takibi ve hızlı fallback
            const checkPopupStatus = () => {
              console.log('🔄 Starting popup status check...');
              
              // Hemen popup durumunu kontrol etmeye başla
              const checkInterval = setInterval(() => {
                console.log('🔍 Interval check - Auth code:', window.whatsappAuthCode ? 'Found' : 'Not found');
                
                if (waitingForEvents && !onboardingInProgress && !fallbackTriggered) {
                  // Authorization code varsa hemen fallback'e geç
                  if (window.whatsappAuthCode) {
                    console.warn('🔄 Authorization code found in interval check, starting fallback');
                    fallbackTriggered = true;
                    setWaitingForEvents(false);
                    clearInterval(checkInterval);
                    handleOnboarding(window.whatsappAuthCode, {});
                    return;
                  }
                } else {
                  // Waiting durumu değişmişse interval'ı temizle
                  clearInterval(checkInterval);
                }
              }, 1000); // Her 1 saniye kontrol et
              
              // 10 saniye sonra kesin timeout (daha kısa)
              setTimeout(() => {
                if (waitingForEvents && !onboardingInProgress && !fallbackTriggered) {
                  console.warn('⏰ Final timeout waiting for message events');
                  fallbackTriggered = true;
                  setWaitingForEvents(false);
                  clearInterval(checkInterval);
                  
                  if (window.whatsappAuthCode) {
                    console.log('🔄 Final fallback: Using authorization code');
                    handleOnboarding(window.whatsappAuthCode, {});
                  } else {
                    console.log('❌ No auth code found in final timeout');
                    toast({
                      title: "Zaman Aşımı",
                      description: "WhatsApp bağlantısı zaman aşımına uğradı. Lütfen tekrar deneyin.",
                      variant: "destructive"
                    });
                  }
                }
              }, 10000); // 10 saniye timeout
            };
            
            checkPopupStatus();
          } else if (response.status === 'not_authorized') {
            console.log('❌ User did not authorize the app');
            toast({
              title: "Yetkilendirme Reddedildi",
              description: "WhatsApp Business bağlantısı için yetkilendirme gerekli.",
              variant: "destructive"
            });
          } else {
            console.log('❌ Login failed with status:', response.status);
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
      // Debug: Tüm gelen mesajları log'la
      console.log('📨 Raw message received:', {
        origin: event.origin,
        data: event.data,
        type: typeof event.data,
        timestamp: new Date().toISOString()
      });
      
      // Özel durumlar için ek kontroller
      if (typeof event.data === 'string') {
        if (event.data.includes('whatsapp') || event.data.includes('WABA') || event.data.includes('WA_')) {
          console.log('🔍 Potential WhatsApp related message:', event.data);
        }
      }

      // Güvenlik: Facebook domain'lerini kontrol et (daha esnek)
      const isFacebookDomain = event.origin.includes('facebook.com') || 
                              event.origin.includes('facebook.net') ||
                              event.origin === 'null' || // Bazı popup'lar null origin kullanabilir
                              event.origin === window.location.origin; // Aynı origin
      
      if (!isFacebookDomain) {
        console.log('🚫 Message rejected - invalid origin:', event.origin);
        return;
      } else {
        console.log('✅ Message accepted from origin:', event.origin);
      }

      // JSON parse etmeye çalış
      let data;
      try {
        data = JSON.parse(event.data);
        console.log('📨 Parsed message from Facebook:', data);
      } catch (error) {
        // URL encoded data olabilir (authorization code için)
        if (typeof event.data === 'string' && event.data.includes('code=')) {
          console.log('📄 URL encoded response from popup:', event.data);
          
          // Authorization code'u çıkar
          const urlParams = new URLSearchParams(event.data);
          const code = urlParams.get('code');
          
          if (code) {
            console.log('📋 Authorization code from URL params:', code.substring(0, 10) + '...');
            window.whatsappAuthCode = code;
            setWaitingForEvents(false); // Authorization code geldi, artık bekleme
            
            // Eğer message event verisi varsa onu kullan, yoksa boş obje gönder
            if (messageEventData && !onboardingInProgress) {
              console.log('🔄 Using stored message event data with URL authorization code');
              handleOnboarding(code, messageEventData);
            } else if (!onboardingInProgress) {
              console.log('🔄 Starting onboarding with URL authorization code only');
              handleOnboarding(code, {});
            }
          }
        }
        return;
      }
        
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
          
          // Message event verilerini kaydet
          const enhancedMessageInfo = {
            ...messageSessionInfo,
            waba_id: messageWabaId,
            phone_number_id: messagePhoneId
          };
          setMessageEventData(enhancedMessageInfo);
          setWaitingForEvents(false); // Message event geldi, artık bekleme
          
          // Authorization code'u al
          const authCode = window.whatsappAuthCode;
          if (authCode && !onboardingInProgress) {
            console.log('🔄 Using message event data for onboarding');
            handleOnboarding(authCode, enhancedMessageInfo);
          } else if (!authCode) {
            console.log('📋 Message event received, waiting for authorization code...');
          }
        } else if (data.event === 'CANCEL') {
          console.warn('⚠️ User cancelled at step:', data.data?.current_step);
          toast({
            title: "İptal Edildi",
            description: "WhatsApp entegrasyonu iptal edildi.",
            variant: "destructive"
          });
        } else if (data.event === 'ERROR') {
          console.error('💥 An error occurred:', data.data?.error_message);
          toast({
            title: "Hata Oluştu",
            description: data.data?.error_message || "WhatsApp entegrasyonunda hata oluştu.",
            variant: "destructive"
          });
        }
      }
    };

    // Event listener'ı ekle
    window.addEventListener('message', handleMessage);
    console.log('👂 Message event listener added');

    // Cleanup: Component unmount olduğunda event listener'ı kaldır
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('🔇 Message event listener removed');
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
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50 space-y-1">
          <div>
            Modal: {showSignupModal ? 'OPEN' : 'CLOSED'} | 
            Data: {whatsappData ? 'YES' : 'NO'} |
            WABA: {whatsappData?.waba_id || 'N/A'}
          </div>
          <div>
            Waiting: {waitingForEvents ? 'YES' : 'NO'} |
            Onboarding: {onboardingInProgress ? 'YES' : 'NO'} |
            AuthCode: {window.whatsappAuthCode ? 'YES' : 'NO'}
          </div>
          <div className="flex gap-2 mt-2">
            {waitingForEvents && window.whatsappAuthCode && (
              <button 
                onClick={() => {
                  console.log('🔧 Manual fallback triggered');
                  setWaitingForEvents(false);
                  handleOnboarding(window.whatsappAuthCode, {});
                }}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Force Fallback
              </button>
            )}
            
            <button 
              onClick={() => {
                console.log('🔍 === AUTH CODE DEBUG ===');
                console.log('🔍 window.whatsappAuthCode:', window.whatsappAuthCode || 'undefined');
                console.log('🔍 Type:', typeof window.whatsappAuthCode);
                console.log('🔍 Length:', window.whatsappAuthCode?.length || 0);
                console.log('🔍 waitingForEvents:', waitingForEvents);
                console.log('🔍 onboardingInProgress:', onboardingInProgress);
                console.log('🔍 fallbackTriggered:', fallbackTriggered);
                console.log('🔍 === END DEBUG ===');
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Debug Auth Code
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmbeddedSignupButton;