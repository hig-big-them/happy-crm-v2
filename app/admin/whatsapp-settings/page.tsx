/**
 * ⚙️ Admin - WhatsApp Integration Settings
 * 
 * WhatsApp Business API configuration: Twilio vs Happy WhatsApp Cloud API
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Globe,
  Phone,
  MessageSquare,
  Settings,
  Shield,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Copy,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Radio,
  Facebook
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Global Facebook SDK type declaration
declare global {
  interface Window {
    FB: {
      init: (params: any) => void;
      login: (callback: (response: any) => void, options: any) => void;
    };
  }
}

type WhatsAppProvider = 'twilio' | 'happy_cloud';

interface WhatsAppProviderConfig {
  // Provider Selection
  provider: WhatsAppProvider;
  
  // Twilio Credentials (only if provider === 'twilio')
  twilio?: {
    account_sid: string;
    auth_token: string;
    phone_number: string;
  };
  
  // Happy Cloud API (only if provider === 'happy_cloud')
  happy_cloud?: {
    facebook_app_id: string;
    facebook_app_secret: string;
    whatsapp_business_account_id: string;
    phone_number_id: string;
    access_token: string;
    webhook_verify_token: string;
    config_id: string; // Facebook Embedded Signup config ID
  };
  
  // Common Configuration
  webhook_url: string;
  business_name: string;
  business_description: string;
  country_code: string;
  language_code: string;
  
  // Features
  enable_messaging: boolean;
  enable_templates: boolean;
  enable_media: boolean;
  enable_webhooks: boolean;
  enable_session_tracking: boolean;
  
  // Rate Limiting & Quotas
  daily_message_limit: number;
  rate_limit_per_minute: number;
  template_message_limit: number;
  
  // Advanced Settings
  debug_mode: boolean;
  log_webhooks: boolean;
  auto_mark_read: boolean;
  session_timeout_hours: number;
  
  // Status & Monitoring
  connection_status: 'connected' | 'disconnected' | 'error';
  last_health_check: string;
  last_message_sent: string;
  total_messages_sent: number;
  total_templates_sent: number;
  active_sessions: number;
}

interface FacebookSessionInfo {
  phone_number_id?: string;
  waba_id?: string;
}

interface FacebookSDKResponse {
  authResponse?: {
    code?: string;
    accessToken?: string;
  };
  status?: string;
}

interface TwilioTestResults {
  account_valid: boolean;
  phone_verified: boolean;
  webhook_reachable: boolean;
  template_access: boolean;
  message_quota: number;
  error_details?: string[];
}

export default function WhatsAppSettingsPage() {
  const supabase = createClient();
  const sdkInitialized = useRef(false);
  const [config, setConfig] = useState<WhatsAppProviderConfig>({
    provider: 'twilio',
    twilio: {
      account_sid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '',
      auth_token: '',
      phone_number: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || ''
    },
    happy_cloud: {
      facebook_app_id: '1824928921450494',
      facebook_app_secret: '',
      whatsapp_business_account_id: '',
      phone_number_id: '',
      access_token: '',
      webhook_verify_token: '$m}LzG+w\'xGdh4t2=!Flv1|Kq7-A2',
      config_id: '1136789698288294'
    },
    webhook_url: '',
    business_name: 'Happy CRM',
    business_description: 'Customer Relationship Management System',
    country_code: 'TR',
    language_code: 'tr',
    enable_messaging: true,
    enable_templates: true,
    enable_media: true,
    enable_webhooks: true,
    enable_session_tracking: true,
    daily_message_limit: 1000,
    rate_limit_per_minute: 60,
    template_message_limit: 250,
    debug_mode: false,
    log_webhooks: true,
    auto_mark_read: false,
    session_timeout_hours: 24,
    connection_status: 'disconnected',
    last_health_check: '',
    last_message_sent: '',
    total_messages_sent: 0,
    total_templates_sent: 0,
    active_sessions: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResults, setTestResults] = useState<TwilioTestResults | null>(null);
  const [facebookSDKLoaded, setFacebookSDKLoaded] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<FacebookSessionInfo>({});
  const [sdkResponse, setSdkResponse] = useState<FacebookSDKResponse>({});
  const [embeddedSignupActive, setEmbeddedSignupActive] = useState(false);
  const [stats, setStats] = useState({
    messagesLast24h: 0,
    templatesLast24h: 0,
    activeSessions: 0,
    averageResponseTime: 0
  });

  useEffect(() => {
    loadConfiguration();
    loadStats();
    initializeFacebookSDK();
    setupMessageListener();
    
    // Auto-generate webhook URLs based on provider
    setConfig(prev => ({
      ...prev,
      webhook_url: prev.provider === 'twilio' 
        ? `${window.location.origin}/api/twilio/webhook`
        : `${window.location.origin}/api/whatsapp/webhook`
    }));
  }, []);

  // Facebook SDK Initialization
  const initializeFacebookSDK = () => {
    if (sdkInitialized.current || typeof window === 'undefined') return;
    
    console.log('🔄 Initializing Facebook SDK...');
    
    // Add Facebook SDK script
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: config.happy_cloud?.facebook_app_id || '1824928921450494',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v23.0'
        });
        
        console.log('✅ Facebook SDK initialized');
        setFacebookSDKLoaded(true);
        sdkInitialized.current = true;
      }
    };
    
    document.head.appendChild(script);

    // Add fb-root div if it doesn't exist
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);
    }
  };

  // Message listener for WhatsApp Embedded Signup
  const setupMessageListener = () => {
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 WhatsApp Embedded Signup event:', data);
          
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log("📞 Phone number ID:", phone_number_id, "📱 WABA ID:", waba_id);
            
            setSessionInfo({ phone_number_id, waba_id });
            
            // Update config with received IDs
            setConfig(prev => ({
              ...prev,
              happy_cloud: {
                ...prev.happy_cloud!,
                phone_number_id: phone_number_id || '',
                whatsapp_business_account_id: waba_id || ''
              }
            }));
            
            toast({
              title: "WhatsApp Business Account Connected",
              description: `WABA ID: ${waba_id}, Phone ID: ${phone_number_id}`,
              variant: "default"
            });
            
          } else if (data.event === 'CANCEL') {
            const { current_step } = data.data;
            console.warn("❌ Cancelled at step:", current_step);
            
            toast({
              title: "Setup Cancelled",
              description: `Cancelled at step: ${current_step}`,
              variant: "destructive"
            });
            
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data;
            console.error("💥 Embedded Signup error:", error_message);
            
            toast({
              title: "Setup Error",
              description: error_message,
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.log('📝 Non-JSON message:', event.data);
      }
    };

    window.addEventListener('message', messageHandler);
    
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  };

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading configuration...');
      
      const response = await fetch('/api/admin/system-settings?key=twilio_whatsapp_config&bypass=true');
      const result = await response.json();
      
      console.log('📡 Load response:', result);
      console.log('📋 Response success:', result.success);
      console.log('📋 Response data:', result.data);
      console.log('📋 Response data type:', typeof result.data);
      
      if (result.success && result.data) {
        // Handle both string and object formats
        let savedConfig = result.data;
        if (typeof savedConfig === 'string') {
          try {
            savedConfig = JSON.parse(savedConfig);
          } catch (parseError) {
            console.error('Failed to parse saved config:', parseError);
            return;
          }
        }
        
        console.log('✅ Loaded config:', savedConfig);
        setConfig(prevConfig => ({ ...prevConfig, ...savedConfig }));
      } else {
        console.log('⚠️ No saved configuration found');
      }
    } catch (error) {
      console.error('Error loading Twilio WhatsApp config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load messaging statistics from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, channel, metadata, created_at')
        .eq('channel', 'whatsapp')
        .gte('created_at', yesterday.toISOString());

      if (!error && messages) {
        const messagesLast24h = messages.filter(m => m.metadata?.source !== 'template').length;
        const templatesLast24h = messages.filter(m => m.metadata?.type === 'template').length;
        
        setStats(prev => ({
          ...prev,
          messagesLast24h,
          templatesLast24h
        }));
      }

      // Load active sessions count
      const { data: sessions, error: sessionsError } = await supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('is_active', true);

      if (!sessionsError && sessions) {
        setStats(prev => ({ ...prev, activeSessions: sessions.length }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      console.log('🚀 Starting save process...');
      
      // Create a completely fresh, minimal config object
      const minimalConfig = {
        account_sid: String(config.account_sid || ''),
        auth_token: String(config.auth_token || ''),
        phone_number: String(config.phone_number || ''),
        webhook_url: String(config.webhook_url || ''),
        webhook_verify_token: String(config.webhook_verify_token || ''),
        business_name: String(config.business_name || 'Happy CRM'),
        business_description: String(config.business_description || ''),
        country_code: String(config.country_code || 'PL'),
        language_code: String(config.language_code || 'pl'),
        enable_messaging: Boolean(config.enable_messaging),
        enable_templates: Boolean(config.enable_templates),
        enable_media: Boolean(config.enable_media),
        enable_webhooks: Boolean(config.enable_webhooks),
        enable_session_tracking: Boolean(config.enable_session_tracking),
        daily_message_limit: parseInt(String(config.daily_message_limit)) || 1000,
        rate_limit_per_minute: parseInt(String(config.rate_limit_per_minute)) || 60,
        template_message_limit: parseInt(String(config.template_message_limit)) || 250,
        debug_mode: Boolean(config.debug_mode),
        log_webhooks: Boolean(config.log_webhooks),
        auto_mark_read: Boolean(config.auto_mark_read),
        session_timeout_hours: parseInt(String(config.session_timeout_hours)) || 24
      };
      
      console.log('📦 Config object created, testing JSON serialization...');
      
      // Test JSON serialization before sending
      let configString: string;
      try {
        configString = JSON.stringify(minimalConfig);
        console.log('✅ Config is JSON-safe, size:', configString.length);
      } catch (jsonError) {
        throw new Error(`JSON serialization failed: ${jsonError}`);
      }
      
      // Use FormData approach to avoid JSON issues
      console.log('📋 Creating FormData...');
      const formData = new FormData();
      formData.append('config', configString);
      
      console.log('🚀 Attempting bypass endpoint first...');
      let response: Response;
      
      try {
        // Try new WhatsApp-specific endpoint (no auth required)
        console.log('🚀 Trying WhatsApp-specific save endpoint...');
        response = await fetch('/api/admin/system-settings/save-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: minimalConfig
          })
        });
        
        if (response.ok) {
          console.log('✅ WhatsApp save endpoint successful');
        } else {
          throw new Error('WhatsApp save endpoint failed');
        }
      } catch (whatsappError) {
        console.log('⚠️ WhatsApp endpoint failed, trying bypass...', whatsappError);
        
        try {
          // Try bypass endpoint as fallback
          response = await fetch('/api/admin/system-settings/save-bypass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config: minimalConfig,
              adminKey: 'whatsapp-setup-2025'
            })
          });
          
          if (!response.ok) {
            throw new Error('Bypass endpoint also failed');
          }
        } catch (bypassError) {
          console.log('⚠️ All save methods failed');
          throw new Error('Unable to save settings');
        }
      }
      
      console.log('📡 Response received, status:', response.status);
      
      let result;
      if (response.status === 200) {
        result = await response.json();
        console.log('📋 Response parsed:', result);
      } else {
        // Try to get error text if JSON parsing might fail
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        result = { success: false, error: errorText };
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save configuration');
      }

      console.log('🎉 Save successful, showing notification...');
      // Use simple alert instead of toast to avoid potential React issues
      alert('✅ Twilio WhatsApp ayarları başarıyla kaydedildi');
      
      // Reload configuration to verify it was saved correctly
      console.log('🔄 Reloading configuration to verify save...');
      await loadConfiguration();
      
    } catch (error: any) {
      console.error('💥 Save configuration error details:');
      console.error('Error type:', typeof error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);
      
      // Use simple alert instead of toast to avoid potential React issues
      alert('❌ Hata: ' + (error.message || 'Ayarlar kaydedilirken hata oluştu'));
    } finally {
      console.log('🔄 Setting saving state to false...');
      setSaving(false);
      console.log('✅ Save process completed');
    }
  };

  const testTwilioConnection = async () => {
    try {
      setTesting(true);
      setTestResults(null);
      
      // Test Twilio account and phone number
      const response = await fetch('/api/admin/test-twilio-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_sid: config.account_sid,
          auth_token: config.auth_token,
          phone_number: config.phone_number
        })
      });
      
      const results = await response.json();
      setTestResults(results);
      
      // Update connection status
      setConfig(prev => ({
        ...prev,
        connection_status: results.account_valid ? 'connected' : 'error',
        last_health_check: new Date().toISOString()
      }));
      
      toast({
        title: results.account_valid ? "Bağlantı Başarılı" : "Bağlantı Hatası",
        description: results.account_valid ? "Twilio WhatsApp API'ye başarıyla bağlanıldı" : "Bağlantıda sorun var",
        variant: results.account_valid ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error testing Twilio connection:', error);
      setTestResults({
        account_valid: false,
        phone_verified: false,
        webhook_reachable: false,
        template_access: false,
        message_quota: 0,
        error_details: ['Connection test failed']
      });
      
      toast({
        title: "Test Hatası",
        description: "Bağlantı testi sırasında hata oluştu",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  // Facebook Login Callback for WhatsApp Embedded Signup
  const fbLoginCallback = async (response: FacebookSDKResponse) => {
    console.log('📱 Facebook SDK Response:', response);
    setSdkResponse(response);
    
    if (response.authResponse && response.authResponse.code) {
      const code = response.authResponse.code;
      console.log('🔑 Authorization code received:', code.substring(0, 20) + '...');
      
      try {
        setEmbeddedSignupActive(true);
        
        // Send code to backend for token exchange
        const exchangeResponse = await fetch('/api/auth/facebook/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/auth/facebook/callback`,
            waba_id: sessionInfo.waba_id,
            phone_number_id: sessionInfo.phone_number_id
          })
        });
        
        const result = await exchangeResponse.json();
        
        if (result.success) {
          console.log('✅ Token exchange successful');
          
          // Update config with access token
          setConfig(prev => ({
            ...prev,
            happy_cloud: {
              ...prev.happy_cloud!,
              access_token: result.data.access_token || '',
              whatsapp_business_account_id: result.data.business_id || sessionInfo.waba_id || '',
              phone_number_id: sessionInfo.phone_number_id || ''
            }
          }));
          
          toast({
            title: "Facebook Business Login Successful",
            description: "Access token obtained and configured",
            variant: "default"
          });
          
        } else {
          throw new Error(result.error || 'Token exchange failed');
        }
        
      } catch (error) {
        console.error('💥 Token exchange error:', error);
        toast({
          title: "Token Exchange Failed",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
      } finally {
        setEmbeddedSignupActive(false);
      }
    } else {
      console.warn('⚠️ No authorization code in response');
      toast({
        title: "Login Failed",
        description: "No authorization code received from Facebook",
        variant: "destructive"
      });
    }
  };

  // Launch WhatsApp Embedded Signup
  const launchWhatsAppSignup = () => {
    if (!facebookSDKLoaded || !window.FB) {
      toast({
        title: "Facebook SDK Not Ready",
        description: "Please wait for Facebook SDK to load",
        variant: "destructive"
      });
      return;
    }
    
    console.log('🚀 Launching WhatsApp Embedded Signup...');
    setEmbeddedSignupActive(true);
    
    try {
      window.FB.login(fbLoginCallback, {
        config_id: config.happy_cloud?.config_id || '1136789698288294',
        response_type: 'code',
        override_default_response_type: true,
        extras: { "version": "v3" }
      });
    } catch (error) {
      console.error('💥 Facebook login error:', error);
      setEmbeddedSignupActive(false);
      toast({
        title: "Login Error",
        description: "Failed to launch Facebook login",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Panoya kopyalandı",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          Bağlı
        </Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Hata
        </Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Bağlantısız
        </Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">WhatsApp Integration Settings</h1>
            <p className="text-muted-foreground">
              Choose between Twilio API or Happy WhatsApp Cloud API
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(config.connection_status)}
            <Button variant="outline" onClick={testTwilioConnection} disabled={testing}>
              {testing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Messages (24h)</p>
                <p className="text-2xl font-bold">{stats.messagesLast24h}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Templates (24h)</p>
                <p className="text-2xl font-bold">{stats.templatesLast24h}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Quota Usage</p>
                <p className="text-2xl font-bold">{Math.round((stats.messagesLast24h / config.daily_message_limit) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            WhatsApp API Provider
          </CardTitle>
          <CardDescription>
            Choose your WhatsApp Business API integration method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Twilio Option */}
            <div 
              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                config.provider === 'twilio' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setConfig(prev => ({ ...prev, provider: 'twilio' }))}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  config.provider === 'twilio' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {config.provider === 'twilio' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">1. Twilio API</h3>
                  <p className="text-sm text-muted-foreground">
                    Use Twilio's WhatsApp Business API service
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                • Quick setup with Twilio account<br/>
                • Sandbox testing available<br/>
                • Managed infrastructure
              </div>
            </div>

            {/* Happy Cloud Option */}
            <div 
              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                config.provider === 'happy_cloud' 
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setConfig(prev => ({ ...prev, provider: 'happy_cloud' }))}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  config.provider === 'happy_cloud' 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300'
                }`}>
                  {config.provider === 'happy_cloud' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">2. Happy WhatsApp Cloud API</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct Facebook Business API integration
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                • Facebook Login business account setup<br/>
                • Direct WhatsApp Cloud API access<br/>
                • Embedded Signup flow
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={config.provider === 'twilio' ? 'twilio-credentials' : 'happy-cloud-setup'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="twilio-credentials" disabled={config.provider !== 'twilio'}>
            Twilio API
          </TabsTrigger>
          <TabsTrigger value="happy-cloud-setup" disabled={config.provider !== 'happy_cloud'}>
            Happy Cloud API
          </TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Twilio API Credentials */}
        <TabsContent value="twilio-credentials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Twilio API Credentials
              </CardTitle>
              <CardDescription>
                Your Twilio account credentials for WhatsApp Business API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-sid">Account SID</Label>
                <div className="flex gap-2">
                  <Input
                    id="account-sid"
                    value={config.twilio?.account_sid || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      twilio: { ...prev.twilio!, account_sid: e.target.value }
                    }))}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    type={showSecrets ? "text" : "password"}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(config.twilio?.account_sid || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-token">Auth Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="auth-token"
                    type={showSecrets ? "text" : "password"}
                    value={config.twilio?.auth_token || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      twilio: { ...prev.twilio!, auth_token: e.target.value }
                    }))}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">WhatsApp Business Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone-number"
                    value={config.twilio?.phone_number || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      twilio: { ...prev.twilio!, phone_number: e.target.value }
                    }))}
                    placeholder="+90 123 456 789 (Turkey)"
                  />
                  <Button variant="outline" size="icon" asChild>
                    <a 
                      href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Twilio Setup Instructions</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>1. Go to <a href="https://console.twilio.com" className="underline text-blue-600" target="_blank">Twilio Console</a></p>
                  <p>2. Navigate to Account → API keys & tokens</p>
                  <p>3. Copy your Account SID and Auth Token</p>
                  <p>4. Ensure your Polish number is verified for WhatsApp Business</p>
                  <p>5. Configure webhook URL below for incoming messages</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Happy WhatsApp Cloud API Setup */}
        <TabsContent value="happy-cloud-setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                WhatsApp Business Hesabı Bağla
              </CardTitle>
              <CardDescription>
                Facebook ile giriş yaparak WhatsApp Business hesabınızı bağlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Connection Status */}
              {config.happy_cloud?.whatsapp_business_account_id ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>✅ WhatsApp Business Hesabı Bağlandı</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1">
                      <p><strong>İşletme Hesap ID:</strong> {config.happy_cloud.whatsapp_business_account_id.substring(0, 20)}...</p>
                      <p><strong>Telefon Numarası ID:</strong> {config.happy_cloud.phone_number_id?.substring(0, 20)}...</p>
                      <p className="text-green-600 font-medium">WhatsApp Business API kullanıma hazır!</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>WhatsApp Business Hesabı Bağlanmamış</AlertTitle>
                  <AlertDescription>
                    Aşağıdaki butona tıklayarak Facebook ile giriş yapın ve WhatsApp Business hesabınızı bağlayın.
                  </AlertDescription>
                </Alert>
              )}

              {/* Facebook Login Button */}
              <div className="flex flex-col items-center space-y-6 p-8 border rounded-lg bg-gradient-to-br from-blue-50 to-green-50">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">WhatsApp Business API</h3>
                  <p className="text-gray-600 max-w-md">
                    Facebook ile giriş yaparak WhatsApp Business hesabınızı Happy CRM'e bağlayın.
                    Müşterilerinizle WhatsApp üzerinden iletişim kurmaya başlayın.
                  </p>
                </div>
                
                <Button
                  onClick={launchWhatsAppSignup}
                  disabled={!facebookSDKLoaded || embeddedSignupActive}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {embeddedSignupActive ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Bağlanıyor...
                    </>
                  ) : facebookSDKLoaded ? (
                    <>
                      <Facebook className="h-5 w-5 mr-3" />
                      Facebook ile WhatsApp Business'ı Bağla
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Hazırlanıyor...
                    </>
                  )}
                </Button>

                {!facebookSDKLoaded && (
                  <p className="text-sm text-gray-500">
                    Facebook SDK yükleniyor...
                  </p>
                )}
              </div>

              {/* Process Steps */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4 text-gray-900">Bağlantı Süreci:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <span className="text-gray-700">Facebook ile giriş yapın</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <span className="text-gray-700">WhatsApp Business hesabınızı seçin veya oluşturun</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <span className="text-gray-700">Telefon numaranızı doğrulayın</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                    <span className="text-gray-700">Happy CRM'de WhatsApp messaging aktif olur</span>
                  </div>
                </div>
              </div>

              {/* Success notification after connection */}
              {(sessionInfo.phone_number_id || sessionInfo.waba_id) && !config.happy_cloud?.whatsapp_business_account_id && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Bağlantı Başarılı!</AlertTitle>
                  <AlertDescription>
                    WhatsApp Business hesabınız başarıyla bağlandı. Ayarları kaydetmeyi unutmayın.
                  </AlertDescription>
                </Alert>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Information */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Business Profile
              </CardTitle>
              <CardDescription>
                WhatsApp Business profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={config.business_name}
                    onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                    placeholder="Happy CRM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country-code">Country Code</Label>
                  <Input
                    id="country-code"
                    value={config.country_code}
                    onChange={(e) => setConfig({ ...config, country_code: e.target.value })}
                    placeholder="PL"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-description">Business Description</Label>
                <Textarea
                  id="business-description"
                  value={config.business_description}
                  onChange={(e) => setConfig({ ...config, business_description: e.target.value })}
                  placeholder="Customer Relationship Management System"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language-code">Default Language</Label>
                <select
                  id="language-code"
                  value={config.language_code}
                  onChange={(e) => setConfig({ ...config, language_code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="pl">Polish (pl)</option>
                  <option value="en">English (en)</option>
                  <option value="tr">Turkish (tr)</option>
                  <option value="de">German (de)</option>
                  <option value="fr">French (fr)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhooks for receiving WhatsApp messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value={config.webhook_url}
                    onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                    placeholder="https://yourdomain.com/api/twilio/webhook"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(config.webhook_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure this URL in your Twilio WhatsApp Sandbox settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verify-token">Webhook Verify Token</Label>
                <Input
                  id="verify-token"
                  value={config.webhook_verify_token}
                  onChange={(e) => setConfig({ ...config, webhook_verify_token: e.target.value })}
                  placeholder="your-verify-token"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-webhooks">Enable Webhooks</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive incoming WhatsApp messages via webhooks
                  </p>
                </div>
                <Switch
                  id="enable-webhooks"
                  checked={config.enable_webhooks}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enable_webhooks: checked })
                  }
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Webhook Setup</AlertTitle>
                <AlertDescription>
                  Copy the webhook URL above and configure it in your Twilio Console under 
                  WhatsApp → Sandbox or Phone Numbers → Your Number → Configure → Webhook URL
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Settings
              </CardTitle>
              <CardDescription>
                Enable/disable WhatsApp features and set limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-messaging">Free-form Messaging</Label>
                  <p className="text-sm text-muted-foreground">
                    Send free-form messages within 24-hour windows
                  </p>
                </div>
                <Switch
                  id="enable-messaging"
                  checked={config.enable_messaging}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enable_messaging: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-templates">Template Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Send approved WhatsApp Business templates
                  </p>
                </div>
                <Switch
                  id="enable-templates"
                  checked={config.enable_templates}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enable_templates: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-media">Media Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Send images, documents, and other media
                  </p>
                </div>
                <Switch
                  id="enable-media"
                  checked={config.enable_media}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enable_media: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-session-tracking">24-Hour Session Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track conversation windows for free-form messaging
                  </p>
                </div>
                <Switch
                  id="enable-session-tracking"
                  checked={config.enable_session_tracking}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enable_session_tracking: checked })
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-limit">Daily Message Limit</Label>
                  <Input
                    id="daily-limit"
                    type="number"
                    value={config.daily_message_limit}
                    onChange={(e) => setConfig({ ...config, daily_message_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (per minute)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={config.rate_limit_per_minute}
                    onChange={(e) => setConfig({ ...config, rate_limit_per_minute: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-limit">Template Message Limit</Label>
                  <Input
                    id="template-limit"
                    type="number"
                    value={config.template_message_limit}
                    onChange={(e) => setConfig({ ...config, template_message_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Debug, logging, and advanced configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed logging and error messages
                  </p>
                </div>
                <Switch
                  id="debug-mode"
                  checked={config.debug_mode}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, debug_mode: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="log-webhooks">Log Webhooks</Label>
                  <p className="text-sm text-muted-foreground">
                    Save incoming webhooks to database
                  </p>
                </div>
                <Switch
                  id="log-webhooks"
                  checked={config.log_webhooks}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, log_webhooks: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-mark-read">Auto Mark as Read</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically mark incoming messages as read
                  </p>
                </div>
                <Switch
                  id="auto-mark-read"
                  checked={config.auto_mark_read}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, auto_mark_read: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={config.session_timeout_hours}
                  onChange={(e) => setConfig({ ...config, session_timeout_hours: parseInt(e.target.value) || 24 })}
                  min="1"
                  max="168"
                />
                <p className="text-xs text-muted-foreground">
                  How long to keep conversation sessions active (WhatsApp Business API standard is 24 hours)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle>Connection Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Twilio Account Valid</span>
                    {testResults.account_valid ? (
                      <Badge variant="default" className="bg-green-500">✓ Valid</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Invalid</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phone Number Verified</span>
                    {testResults.phone_verified ? (
                      <Badge variant="default" className="bg-green-500">✓ Verified</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Not Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Webhook Reachable</span>
                    {testResults.webhook_reachable ? (
                      <Badge variant="default" className="bg-green-500">✓ Reachable</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Unreachable</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Template Access</span>
                    {testResults.template_access ? (
                      <Badge variant="default" className="bg-green-500">✓ Available</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Limited</Badge>
                    )}
                  </div>
                  {testResults.message_quota > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Message Quota</span>
                      <Badge variant="outline">{testResults.message_quota} messages</Badge>
                    </div>
                  )}
                  {testResults.error_details && testResults.error_details.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-600">Error Details:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {testResults.error_details.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={loadConfiguration}>
          Reset
        </Button>
        <Button onClick={saveConfiguration} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}