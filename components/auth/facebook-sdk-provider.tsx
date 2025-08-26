'use client';

/**
 * Facebook SDK Provider Component
 * 
 * Facebook JavaScript SDK'yi yükler ve initialize eder
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Facebook SDK configuration
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1824928921450494';
const FACEBOOK_SDK_VERSION = 'v23.0';

// Domain kontrolü için helper function
const getCurrentDomain = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
};

// TypeScript definitions for Facebook SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookSDKContextType {
  isSDKLoaded: boolean;
  isInitialized: boolean;
  FB: any;
  domainError: string | null;
  login: (callback?: (response: any) => void, options?: any) => void;
  logout: (callback?: (response: any) => void) => void;
  getLoginStatus: (callback: (response: any) => void) => void;
  api: (path: string, method: string, params: any, callback: (response: any) => void) => void;
}

const FacebookSDKContext = createContext<FacebookSDKContextType | null>(null);

interface FacebookSDKProviderProps {
  children: ReactNode;
  autoLogAppEvents?: boolean;
  xfbml?: boolean;
  cookie?: boolean;
  debug?: boolean;
}

export function FacebookSDKProvider({ 
  children, 
  autoLogAppEvents = true,
  xfbml = true,
  cookie = true,
  debug = false
}: FacebookSDKProviderProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [FB, setFB] = useState<any>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  useEffect(() => {
    // Domain kontrolü
    const currentDomain = getCurrentDomain();
    console.log('🌐 Current domain:', currentDomain);
    
    // Localhost kontrolü
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      console.log('✅ Localhost domain detected');
      setDomainError(null);
    } else {
      // Production domain kontrolü - kullanıcıya uyarı göster
      console.log('⚠️ Production domain detected:', currentDomain);
      setDomainError(`Current domain: ${currentDomain}. Make sure this domain is added to Facebook App Dashboard &gt; Facebook Login &gt; Settings &gt; Allowed Domains for JavaScript SDK`);
    }

    // Eğer SDK zaten yüklenmiş ise skip et
    if (window.FB) {
      setFB(window.FB);
      setIsSDKLoaded(true);
      setIsInitialized(true);
      return;
    }

    console.log('🔄 Loading Facebook SDK...');
    console.log('🌐 Current domain:', getCurrentDomain());

    // Facebook SDK initialization function
    window.fbAsyncInit = function() {
      console.log('🔧 Initializing Facebook SDK...');
      
      try {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          autoLogAppEvents: autoLogAppEvents,
          xfbml: xfbml,
          cookie: cookie,
          version: FACEBOOK_SDK_VERSION
        });

        console.log('✅ Facebook SDK initialized', {
          appId: FACEBOOK_APP_ID,
          version: FACEBOOK_SDK_VERSION,
          domain: getCurrentDomain(),
          autoLogAppEvents,
          xfbml,
          cookie
        });

        setFB(window.FB);
        setIsSDKLoaded(true);
        setIsInitialized(true);

        // Debug mode
        if (debug) {
          window.FB.AppEvents.logPageView();
          console.log('📊 Facebook Analytics: Page view logged');
        }
      } catch (error) {
        console.error('❌ Facebook SDK initialization failed:', error);
        setIsInitialized(false);
      }
    };

    // SDK script'ini dynamically yükle
    const loadSDK = () => {
      const existingScript = document.getElementById('facebook-js-sdk');
      if (existingScript) {
        console.warn('⚠️ Facebook SDK script already exists');
        return;
      }

      const script = document.createElement('script');
      script.id = 'facebook-js-sdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('📦 Facebook SDK script loaded');
        setIsSDKLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Facebook SDK:', error);
        setIsSDKLoaded(false);
      };

      document.head.appendChild(script);
    };

    loadSDK();

    // Cleanup function
    return () => {
      // SDK'yi remove etme - diğer componentler kullanıyor olabilir
      console.log('🧹 Facebook SDK Provider unmounted');
    };
  }, [autoLogAppEvents, xfbml, cookie, debug]);

  // Helper functions
  const login = (callback?: (response: any) => void, options: any = {}) => {
    if (!FB) {
      console.error('❌ Facebook SDK not loaded');
      return;
    }

    const defaultOptions = {
      scope: 'email,public_profile,whatsapp_business_management,whatsapp_business_messaging',
      return_scopes: true,
      ...options
    };

    console.log('🔑 Facebook login attempt with options:', defaultOptions);

    FB.login((response: any) => {
      console.log('📥 Facebook login response:', response);
      
      if (response.authResponse) {
        console.log('✅ Facebook login successful');
        console.log('Access Token:', response.authResponse.accessToken);
        console.log('User ID:', response.authResponse.userID);
        console.log('Granted Scopes:', response.authResponse.grantedScopes);
      } else {
        console.log('❌ Facebook login failed or cancelled');
      }

      if (callback) {
        callback(response);
      }
    }, defaultOptions);
  };

  const logout = (callback?: (response: any) => void) => {
    if (!FB) {
      console.error('❌ Facebook SDK not loaded');
      return;
    }

    console.log('🚪 Facebook logout attempt');

    FB.logout((response: any) => {
      console.log('📥 Facebook logout response:', response);
      
      if (callback) {
        callback(response);
      }
    });
  };

  const getLoginStatus = (callback: (response: any) => void) => {
    if (!FB) {
      console.error('❌ Facebook SDK not loaded');
      return;
    }

    FB.getLoginStatus(callback);
  };

  const api = (path: string, method: string = 'GET', params: any = {}, callback?: (response: any) => void) => {
    if (!FB) {
      console.error('❌ Facebook SDK not loaded');
      return;
    }

    console.log(`📡 Facebook API call: ${method} ${path}`, params);

    FB.api(path, method, params, (response: any) => {
      console.log(`📥 Facebook API response for ${path}:`, response);
      
      if (response.error) {
        console.error('❌ Facebook API error:', response.error);
      }

      if (callback) {
        callback(response);
      }
    });
  };

  const contextValue: FacebookSDKContextType = {
    isSDKLoaded,
    isInitialized,
    FB,
    domainError,
    login,
    logout,
    getLoginStatus,
    api
  };

  return (
    <FacebookSDKContext.Provider value={contextValue}>
      {children}
    </FacebookSDKContext.Provider>
  );
}

// Hook for using Facebook SDK
export function useFacebookSDK() {
  const context = useContext(FacebookSDKContext);
  
  if (!context) {
    throw new Error('useFacebookSDK must be used within a FacebookSDKProvider');
  }
  
  return context;
}

// Type exports
export type { FacebookSDKContextType };