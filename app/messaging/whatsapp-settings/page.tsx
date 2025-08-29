"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Settings, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Phone,
  Key,
  Link,
  Globe,
  Webhook,
  Server,
  Info,
  Copy,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  TestTube,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Smartphone,
  Building2,
  User,
  Hash,
  FileText,
  Clock,
  Activity,
  Zap,
  Database,
  Cloud,
  Lock,
  Unlock,
  Send,
  ChevronRight,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/client';
import { EmbeddedSignupButton } from '@/components/whatsapp/embedded-signup-button';

// WhatsApp Cloud API Configuration Types
interface WhatsAppConfig {
  id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  business_account_id: string;
  access_token: string;
  api_version: string;
  webhook_url: string;
  webhook_verify_token: string;
  is_active: boolean;
  is_primary: boolean;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR';
  messaging_limit_tier: string;
  max_phone_numbers: number;
  namespace: string;
  certificate: string;
  created_at?: string;
  updated_at?: string;
}

interface WebhookEvent {
  id: string;
  event_type: string;
  description: string;
  is_enabled: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: any[];
}

export default function WhatsAppSettingsPage() {
  const { locale } = useI18n()
  const [configs, setConfigs] = useState<WhatsAppConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<WhatsAppConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('numbers');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  
  const supabase = createClient();

  // Default webhook events
  const webhookEvents: WebhookEvent[] = [
    { id: '1', event_type: 'messages', description: 'Gelen mesajlar', is_enabled: true },
    { id: '2', event_type: 'message_status', description: 'Mesaj durumu güncellemeleri', is_enabled: true },
    { id: '3', event_type: 'message_template_status_update', description: 'Şablon durumu güncellemeleri', is_enabled: true },
    { id: '4', event_type: 'phone_number_name_update', description: 'Telefon numarası adı güncellemeleri', is_enabled: false },
    { id: '5', event_type: 'account_review_update', description: 'Hesap inceleme güncellemeleri', is_enabled: true },
    { id: '6', event_type: 'phone_number_quality_update', description: 'Numara kalite güncellemeleri', is_enabled: true },
  ];

  // Load configurations
  useEffect(() => {
    loadConfigurations();
    loadTemplates();
  }, []);

  // Register WhatsApp number with PIN
  const registerWhatsAppNumber = async (phoneNumberId: string, pin: string = "111111") => {
    console.log('📱 [WhatsApp Settings] Starting number registration:', phoneNumberId);
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/whatsapp/register-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number_id: phoneNumberId,
          pin: pin
        }),
      });

      const result = await response.json();
      console.log('📋 [WhatsApp Settings] Registration response:', result);

      if (result.success) {
        console.log('✅ [WhatsApp Settings] Number registered successfully');
        
        // Update config status to CONNECTED
        const updatedConfigs = configs.map(config => 
          config.phone_number_id === phoneNumberId 
            ? { ...config, status: 'CONNECTED' as const, updated_at: new Date().toISOString() }
            : config
        );
        
        setConfigs(updatedConfigs);
        localStorage.setItem('whatsapp_configs', JSON.stringify(updatedConfigs));
        
        toast({
          title: locale === 'tr' ? 'Numara Kaydedildi!' : 'Number Registered!',
          description: locale === 'tr' 
            ? 'WhatsApp numara kaydı başarıyla tamamlandı' 
            : 'WhatsApp number registration completed successfully',
        });
        
        return true;
      } else {
        console.error('❌ [WhatsApp Settings] Number registration failed:', result.error);
        
        toast({
          title: locale === 'tr' ? 'Kayıt Hatası' : 'Registration Error',
          description: result.error || (locale === 'tr' 
            ? 'Numara kaydı sırasında hata oluştu' 
            : 'Failed to register number'),
          variant: 'destructive'
        });
        
        return false;
      }
    } catch (error) {
      console.error('❌ [WhatsApp Settings] Registration error:', error);
      
      toast({
        title: locale === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
        description: locale === 'tr' 
          ? 'Numara kaydı sırasında bağlantı hatası oluştu' 
          : 'Connection error during number registration',
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete setup for PENDING configurations
  const completeSetup = async (config: WhatsAppConfig) => {
    console.log('🔧 [WhatsApp Settings] Starting setup completion for:', config.phone_number_id);
    
    if (config.status === 'PENDING') {
      const success = await registerWhatsAppNumber(config.phone_number_id);
      if (success) {
        console.log('✅ [WhatsApp Settings] Setup completed successfully');
      }
    } else {
      toast({
        title: locale === 'tr' ? 'Bilgi' : 'Info',
        description: locale === 'tr' 
          ? 'Bu numara zaten aktif durumda' 
          : 'This number is already active',
      });
    }
  };

  // Add new WABA configuration from embedded signup
  const addWABAConfiguration = async (wabaData: { code: string; phone_number_id: string; waba_id: string }) => {
    console.log('🔗 [WhatsApp Settings] Adding new WABA configuration:', wabaData);
    
    try {
      // Fetch phone number details from Facebook Graph API
      const phoneDetailsResponse = await fetch(`/api/whatsapp/phone-details?phone_number_id=${wabaData.phone_number_id}`);
      let phoneDetails = null;
      
      if (phoneDetailsResponse.ok) {
        phoneDetails = await phoneDetailsResponse.json();
        console.log('📱 [WhatsApp Settings] Phone details fetched:', phoneDetails);
      }
      
      // Create new configuration with PENDING status (needs registration)
      const newConfig: WhatsAppConfig = {
        id: `waba_${Date.now()}`,
        phone_number_id: wabaData.phone_number_id,
        display_phone_number: phoneDetails?.display_phone_number || `+${wabaData.phone_number_id}`,
        verified_name: phoneDetails?.verified_name || 'New WhatsApp Business',
        business_account_id: wabaData.waba_id,
        access_token: 'EAAxxxxx...', // Will be updated with real token
        api_version: 'v23.0',
        webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
        webhook_verify_token: generateVerifyToken(),
        is_active: true,
        is_primary: configs.length === 0, // First one is primary
        quality_rating: phoneDetails?.quality_rating || 'UNKNOWN',
        status: 'PENDING', // Set as PENDING until registration is completed
        messaging_limit_tier: phoneDetails?.messaging_limit_tier || '1000',
        max_phone_numbers: phoneDetails?.max_phone_numbers || 1,
        namespace: phoneDetails?.namespace || 'whatsapp_business',
        certificate: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('✅ [WhatsApp Settings] New WABA configuration created with PENDING status:', newConfig);
      
      // Add to existing configs
      const updatedConfigs = [...configs, newConfig];
      setConfigs(updatedConfigs);
      
      // Save to localStorage
      localStorage.setItem('whatsapp_configs', JSON.stringify(updatedConfigs));
      
      console.log('💾 [WhatsApp Settings] WABA configuration saved to localStorage');
      
      // Select the new configuration
      setSelectedConfig(newConfig);
      
      toast({
        title: locale === 'tr' ? 'WABA Bağlandı!' : 'WABA Connected!',
        description: locale === 'tr' 
          ? `${newConfig.display_phone_number} numarası eklendi. Kurulumu tamamlamak için "Kurulumu Tamamla" butonuna tıklayın.` 
          : `${newConfig.display_phone_number} number added. Click "Complete Setup" to finish registration.`,
      });
      
    } catch (error) {
      console.error('❌ [WhatsApp Settings] Failed to add WABA configuration:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' 
          ? 'WABA konfigürasyonu eklenirken hata oluştu' 
          : 'Failed to add WABA configuration',
        variant: 'destructive'
      });
    }
  };

  // Load authenticated WABAs from Facebook Graph API
  const loadAuthenticatedWABAs = async () => {
    console.log('🔍 [WhatsApp Settings] Loading authenticated WABAs from Facebook Graph API');
    
    try {
      // Get current user's authenticated WABAs
      const wabaResponse = await fetch('/api/whatsapp/list-authenticated-wabas');
      
      if (wabaResponse.ok) {
        const wabaResult = await wabaResponse.json();
        console.log('✅ [WhatsApp Settings] Authenticated WABAs API response:', wabaResult);
        
        if (wabaResult.success && wabaResult.data) {
          const authenticatedWABAs = wabaResult.data.map((waba: any) => ({
            id: `auth_waba_${waba.id}`,
            phone_number_id: waba.phone_number_id,
            display_phone_number: waba.display_phone_number.startsWith('+') ? waba.display_phone_number : `+${waba.display_phone_number}`,
            verified_name: waba.verified_name,
            business_account_id: waba.id,
            access_token: 'EAAxxxxx...', // Masked for security
            api_version: 'v23.0',
            webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
            webhook_verify_token: generateVerifyToken(),
            is_active: true,
            is_primary: false,
            quality_rating: waba.quality_rating || 'GREEN',
            status: 'CONNECTED' as const,
            messaging_limit_tier: waba.messaging_limit_tier || '1000',
            max_phone_numbers: waba.max_phone_numbers || 1,
            namespace: waba.namespace || 'whatsapp_business',
            certificate: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          
          console.log('🎯 [WhatsApp Settings] Processed authenticated WABAs:', authenticatedWABAs);
          return authenticatedWABAs;
        }
      } else {
        console.log('⚠️ [WhatsApp Settings] Failed to load authenticated WABAs:', wabaResponse.status);
        const errorText = await wabaResponse.text();
        console.log('📄 [WhatsApp Settings] Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ [WhatsApp Settings] Error loading authenticated WABAs:', error);
    }
    
    return [];
  };

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      
      // Load from localStorage
      const savedConfigs = localStorage.getItem('whatsapp_configs');
      let localConfigs: WhatsAppConfig[] = [];
      
      if (savedConfigs) {
        localConfigs = JSON.parse(savedConfigs);
        console.log('📱 [WhatsApp Settings] Local configs loaded:', localConfigs.length);
      }
      
      // Load authenticated WABAs from Facebook Graph API
      const authenticatedWABAs = await loadAuthenticatedWABAs();
      
      // Merge local configs with authenticated WABAs (avoid duplicates)
      const allConfigs = [...localConfigs];
      
      authenticatedWABAs.forEach((authWaba: WhatsAppConfig) => {
        const exists = allConfigs.find(config => 
          config.phone_number_id === authWaba.phone_number_id ||
          config.business_account_id === authWaba.business_account_id
        );
        
        if (!exists) {
          console.log('➕ [WhatsApp Settings] Adding authenticated WABA:', authWaba.verified_name);
          allConfigs.push(authWaba);
        } else {
          console.log('⚠️ [WhatsApp Settings] WABA already exists locally:', authWaba.verified_name);
        }
      });
      
      // If no configs at all, add default mock configurations
      if (allConfigs.length === 0) {
        console.log('📱 [WhatsApp Settings] No configs found, adding defaults');
        const defaultConfigs: WhatsAppConfig[] = [
          {
            id: '1',
            phone_number_id: '793146130539824',
            display_phone_number: '+447782610222',
            verified_name: 'Happy Smile Clinics',
            business_account_id: 'WABA_ID_123456789',
            access_token: 'EAAxxxxx...', // Masked for security
            api_version: 'v21.0',
            webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
            webhook_verify_token: generateVerifyToken(),
            is_active: true,
            is_primary: true,
            quality_rating: 'GREEN',
            status: 'CONNECTED',
            messaging_limit_tier: '1000',
            max_phone_numbers: 2,
            namespace: 'happy_smile_clinics',
            certificate: '',
          },
          {
            id: '2',
            phone_number_id: '456789123456789',
            display_phone_number: '+90 532 799 42 23',
            verified_name: 'Happy CRM Destek Hattı',
            business_account_id: 'WABA_ID_123456789',
            access_token: 'EAAxxxxx...', // Masked for security
            api_version: 'v21.0',
            webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
            webhook_verify_token: generateVerifyToken(),
            is_active: true,
            is_primary: false,
            quality_rating: 'GREEN',
            status: 'CONNECTED',
            messaging_limit_tier: '1000',
            max_phone_numbers: 2,
            namespace: 'happy_crm_support',
            certificate: '',
          },
          {
            id: '3',
            phone_number_id: '660093600519552',
            display_phone_number: '+1 555 999 0001',
            verified_name: 'Happy CRM Test Line',
            business_account_id: 'WABA_ID_123456789',
            access_token: 'EAAxxxxx...', // Masked for security
            api_version: 'v21.0',
            webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
            webhook_verify_token: generateVerifyToken(),
            is_active: true,
            is_primary: false,
            quality_rating: 'YELLOW',
            status: 'CONNECTED',
            messaging_limit_tier: '250',
            max_phone_numbers: 2,
            namespace: 'happy_crm_test',
            certificate: '',
          }
        ];
        allConfigs.push(...defaultConfigs);
      }
      
      // Set all configurations (local + authenticated WABAs)
      setConfigs(allConfigs);
      console.log('🎯 [WhatsApp Settings] Total configurations loaded:', allConfigs.length);
      
      // Update localStorage with merged configs
      localStorage.setItem('whatsapp_configs', JSON.stringify(allConfigs));
      
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Yapılandırmalar yüklenirken hata oluştu' : 'Failed to load configurations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    // Mock templates for now
    setTemplates([
      {
        id: '1',
        name: 'appointment_reminder',
        category: 'UTILITY',
        language: 'tr',
        status: 'APPROVED',
        components: []
      },
      {
        id: '2',
        name: 'welcome_message',
        category: 'MARKETING',
        language: 'tr',
        status: 'APPROVED',
        components: []
      }
    ]);
  };

  const generateVerifyToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const saveConfiguration = async (config: WhatsAppConfig) => {
    try {
      setLoading(true);
      
      // Update configs
      const updatedConfigs = configs.map(c => c.id === config.id ? config : c);
      setConfigs(updatedConfigs);
      
      // Save to localStorage for now
      localStorage.setItem('whatsapp_configs', JSON.stringify(updatedConfigs));
      
      // TODO: Save to Supabase
      // await supabase.from('whatsapp_configs').upsert(config);
      
      toast({
        title: locale === 'tr' ? 'Başarılı' : 'Success',
        description: locale === 'tr' ? 'WhatsApp yapılandırması kaydedildi' : 'WhatsApp configuration saved',
      });
      
      setIsEditing(false);
      setSelectedConfig(config);
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Yapılandırma kaydedilirken hata oluştu' : 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewNumber = () => {
    const newConfig: WhatsAppConfig = {
      id: Date.now().toString(),
      phone_number_id: '',
      display_phone_number: '',
      verified_name: '',
      business_account_id: '',
      access_token: '',
      api_version: 'v21.0',
      webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
      webhook_verify_token: generateVerifyToken(),
      is_active: false,
      is_primary: configs.length === 0,
      quality_rating: 'UNKNOWN',
      status: 'PENDING',
      messaging_limit_tier: '1',
      max_phone_numbers: 2,
      namespace: '',
      certificate: '',
    };
    
    setConfigs([...configs, newConfig]);
    setSelectedConfig(newConfig);
    setIsEditing(true);
  };

  const deleteConfiguration = async (configId: string) => {
    try {
      const updatedConfigs = configs.filter(c => c.id !== configId);
      setConfigs(updatedConfigs);
      localStorage.setItem('whatsapp_configs', JSON.stringify(updatedConfigs));
      
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null);
      }
      
      toast({
        title: locale === 'tr' ? 'Başarılı' : 'Success',
        description: locale === 'tr' ? 'Numara yapılandırması silindi' : 'Number configuration deleted',
      });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Yapılandırma silinirken hata oluştu' : 'Failed to delete configuration',
        variant: 'destructive'
      });
    }
  };

  const testConnection = async (config: WhatsAppConfig) => {
    try {
      setTestingConnection(config.id);
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Actual API test
      // const response = await fetch(`https://graph.facebook.com/${config.api_version}/${config.phone_number_id}`, {
      //   headers: {
      //     'Authorization': `Bearer ${config.access_token}`
      //   }
      // });
      
      toast({
        title: locale === 'tr' ? 'Test Başarılı' : 'Test Succeeded',
        description: locale === 'tr' ? `${config.verified_name} bağlantısı başarılı` : `Connection succeeded for ${config.verified_name}`,
      });
      
      // Update status
      const updatedConfig = { ...config, status: 'CONNECTED' as const };
      saveConfiguration(updatedConfig);
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: locale === 'tr' ? 'Test Başarısız' : 'Test Failed',
        description: locale === 'tr' ? 'API bağlantısı kurulamadı' : 'Failed to establish API connection',
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const sendTestMessage = async (config: WhatsAppConfig) => {
    try {
      setTestingConnection(config.id);
      
      // TODO: Send actual test message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: locale === 'tr' ? 'Test Mesajı Gönderildi' : 'Test Message Sent',
        description: locale === 'tr' ? 'Test mesajı başarıyla gönderildi' : 'Test message sent successfully',
      });
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Test mesajı gönderilemedi' : 'Failed to send test message',
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: locale === 'tr' ? 'Kopyalandı' : 'Copied',
      description: locale === 'tr' ? `${label} panoya kopyalandı` : `${label} copied to clipboard`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-600" />
            {locale === 'tr' ? 'WhatsApp Cloud API Ayarları' : 'WhatsApp Cloud API Settings'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'tr' ? 'WhatsApp Business numaralarınızı yönetin ve yeni numara bağlayın' : 'Manage your WhatsApp Business numbers and connect new ones'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadConfigurations}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            {locale === 'tr' ? 'Yenile' : 'Refresh'}
          </Button>
          
          {/* WABA Connect Button */}
          <EmbeddedSignupButton
            skipSignupModal={true}
            onSuccess={(data) => {
              console.log('🎉 [WhatsApp Settings] WABA Connected successfully:', data);
              // Add the new WABA configuration
              addWABAConfiguration(data);
            }}
            onError={(error) => {
              console.error('WABA Connection Error:', error);
              toast({
                title: locale === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
                description: locale === 'tr' ? 'WhatsApp Business hesabı bağlanırken hata oluştu' : 'Failed to connect WhatsApp Business account',
                variant: 'destructive'
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {locale === 'tr' ? 'WABA Numara Bağla' : 'Connect WABA Number'}
          </EmbeddedSignupButton>
          
          <Button onClick={addNewNumber} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {locale === 'tr' ? 'Manuel Ekle' : 'Add Manually'}
          </Button>
        </div>
      </div>

      {/* WABA Connection Info */}
      <Alert className="border-green-200 bg-green-50">
        <MessageSquare className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>{locale === 'tr' ? 'WhatsApp Business API Bağlantısı:' : 'WhatsApp Business API Connection:'}</strong>
              <span className="ml-2">
                {locale === 'tr' 
                  ? '"WABA Numara Bağla" butonuna tıklayarak Meta\'nın resmi onboarding sürecini başlatabilirsiniz.' 
                  : 'Click "Connect WABA Number" to start Meta\'s official onboarding process.'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>{locale === 'tr' ? 'Hazır' : 'Ready'}</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Phone Numbers List */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{locale === 'tr' ? 'Telefon Numaraları' : 'Phone Numbers'}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? `${configs.length} numara yapılandırıldı` : `${configs.length} number(s) configured`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2">
                  {configs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm mb-4">{locale === 'tr' ? 'Henüz numara eklenmedi' : 'No numbers yet'}</p>
                      
                      <div className="space-y-2">
                        <EmbeddedSignupButton
                          skipSignupModal={true}
                          onSuccess={(data) => {
                            console.log('🎉 [WhatsApp Settings] WABA Connected from empty state:', data);
                            // Add the new WABA configuration
                            addWABAConfiguration(data);
                          }}
                          onError={(error) => {
                            console.error('WABA Connection Error:', error);
                            toast({
                              title: locale === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
                              description: locale === 'tr' ? 'WhatsApp Business hesabı bağlanırken hata oluştu' : 'Failed to connect WhatsApp Business account',
                              variant: 'destructive'
                            });
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {locale === 'tr' ? 'WABA ile Bağlan' : 'Connect with WABA'}
                        </EmbeddedSignupButton>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addNewNumber}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {locale === 'tr' ? 'Manuel Ekle' : 'Add Manually'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    configs.map(config => (
                      <div
                        key={config.id}
                        className={cn(
                          "w-full p-3 rounded-lg border transition-all",
                          selectedConfig?.id === config.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        <button
                          onClick={() => {
                            setSelectedConfig(config);
                            setIsEditing(false);
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  {config.display_phone_number || (locale === 'tr' ? 'Numara girilmedi' : 'No number')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {config.verified_name || (locale === 'tr' ? 'İsim belirtilmedi' : 'No name')}
                            </p>
                            <div className="flex items-center gap-2">
                              {config.is_primary && (
                                <Badge variant="secondary" className="text-xs">
                                  {locale === 'tr' ? 'Birincil' : 'Primary'}
                                </Badge>
                              )}
                              {config.id.startsWith('auth_waba_') && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {locale === 'tr' ? 'Doğrulanmış' : 'Authenticated'}
                                </Badge>
                              )}
                              <Badge
                                variant={config.status === 'CONNECTED' ? 'default' : 'secondary'}
                                className={cn(
                                  "text-xs",
                                  config.status === 'CONNECTED' && "bg-green-600",
                                  config.status === 'ERROR' && "bg-destructive"
                                )}
                              >
                                {config.status === 'CONNECTED' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {config.status === 'ERROR' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {config.status}
                              </Badge>
                            </div>
                          </div>
                          {config.quality_rating !== 'UNKNOWN' && (
                            <div className={cn(
                              "h-2 w-2 rounded-full mt-1",
                              config.quality_rating === 'GREEN' && "bg-green-500",
                              config.quality_rating === 'YELLOW' && "bg-yellow-500",
                              config.quality_rating === 'RED' && "bg-red-500"
                            )} />
                          )}
                        </div>
                        </button>
                        
                        {/* Complete Setup Button for PENDING status */}
                        {config.status === 'PENDING' && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                completeSetup(config);
                              }}
                              size="sm"
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {locale === 'tr' ? 'Kaydediliyor...' : 'Registering...'}
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-2" />
                                  {locale === 'tr' ? 'Kurulumu Tamamla' : 'Complete Setup'}
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              {locale === 'tr' 
                                ? 'Numara kaydını tamamlamak için tıklayın' 
                                : 'Click to complete number registration'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
              <CardHeader className="pb-3">
              <CardTitle className="text-sm">{locale === 'tr' ? 'Genel Durum' : 'Overview'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'tr' ? 'Toplam Numara' : 'Total Numbers'}</span>
                <span className="font-medium">{configs.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'tr' ? 'Aktif' : 'Active'}</span>
                <span className="font-medium text-green-600">
                  {configs.filter(c => c.is_active).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'tr' ? 'Bağlı' : 'Connected'}</span>
                <span className="font-medium">
                  {configs.filter(c => c.status === 'CONNECTED').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {locale === 'tr' ? 'Doğrulanmış' : 'Authenticated'}
                </span>
                <span className="font-medium text-blue-600">
                  {configs.filter(c => c.id.startsWith('auth_waba_')).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'tr' ? 'Toplam Limit' : 'Total Limit'}</span>
                <span className="font-medium text-blue-600">
                  {configs.reduce((sum, c) => sum + parseInt(c.messaging_limit_tier || '0'), 0)}/gün
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Configuration Details */}
        <div className="col-span-9">
          {selectedConfig ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Edit2 className="h-5 w-5" />
                          {locale === 'tr' ? 'Yapılandırmayı Düzenle' : 'Edit Configuration'}
                        </>
                      ) : (
                        <>
                          <Settings className="h-5 w-5" />
                          {selectedConfig.verified_name || (locale === 'tr' ? 'Yapılandırma Detayları' : 'Configuration Details')}
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedConfig.display_phone_number || (locale === 'tr' ? 'Telefon numarası henüz girilmedi' : 'Phone number not set')}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Complete Setup Button for PENDING status */}
                    {selectedConfig.status === 'PENDING' && !isEditing && (
                      <Button
                        onClick={() => completeSetup(selectedConfig)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {locale === 'tr' ? 'Kaydediliyor...' : 'Registering...'}
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {locale === 'tr' ? 'Kurulumu Tamamla' : 'Complete Setup'}
                          </>
                        )}
                      </Button>
                    )}
                    
                    {!isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(selectedConfig)}
                          disabled={testingConnection === selectedConfig.id}
                        >
                          {testingConnection === selectedConfig.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                          )}
                          {locale === 'tr' ? 'Bağlantıyı Test Et' : 'Test Connection'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {locale === 'tr' ? 'Düzenle' : 'Edit'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteConfiguration(selectedConfig.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            loadConfigurations();
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {locale === 'tr' ? 'İptal' : 'Cancel'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveConfiguration(selectedConfig)}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {locale === 'tr' ? 'Kaydet' : 'Save'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">{locale === 'tr' ? 'Temel Bilgiler' : 'Basic Info'}</TabsTrigger>
                    <TabsTrigger value="api">{locale === 'tr' ? 'API Ayarları' : 'API Settings'}</TabsTrigger>
                    <TabsTrigger value="webhook">Webhook</TabsTrigger>
                    <TabsTrigger value="templates">{locale === 'tr' ? 'Şablonlar' : 'Templates'}</TabsTrigger>
                  </TabsList>
                  
                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">{locale === 'tr' ? 'Telefon Numarası' : 'Phone Number'}</Label>
                        <Input
                          id="phone"
                          value={selectedConfig.display_phone_number}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            display_phone_number: e.target.value
                          })}
                          placeholder={locale === 'tr' ? '+90 5XX XXX XX XX' : '+90 5XX XXX XX XX'}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">{locale === 'tr' ? 'Doğrulanmış İsim' : 'Verified Name'}</Label>
                        <Input
                          id="name"
                          value={selectedConfig.verified_name}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            verified_name: e.target.value
                          })}
                          placeholder={locale === 'tr' ? 'İşletme Adı' : 'Business Name'}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone_id">Phone Number ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="phone_id"
                            value={selectedConfig.phone_number_id}
                            onChange={(e) => setSelectedConfig({
                              ...selectedConfig,
                              phone_number_id: e.target.value
                            })}
                             placeholder={locale === 'tr' ? "Meta'dan alınan ID" : 'ID from Meta'}
                            disabled={!isEditing}
                          />
                          {!isEditing && selectedConfig.phone_number_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(selectedConfig.phone_number_id, 'Phone Number ID')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_id">Business Account ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="business_id"
                            value={selectedConfig.business_account_id}
                            onChange={(e) => setSelectedConfig({
                              ...selectedConfig,
                              business_account_id: e.target.value
                            })}
                            placeholder="WhatsApp Business Account ID"
                            disabled={!isEditing}
                          />
                          {!isEditing && selectedConfig.business_account_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(selectedConfig.business_account_id, 'Business Account ID')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="namespace">Namespace</Label>
                        <Input
                          id="namespace"
                          value={selectedConfig.namespace}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            namespace: e.target.value
                          })}
                          placeholder="Message template namespace"
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tier">{locale === 'tr' ? 'Mesajlaşma Limiti' : 'Messaging Limit'}</Label>
                        <Input
                          id="tier"
                          value={selectedConfig.messaging_limit_tier}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            messaging_limit_tier: e.target.value
                          })}
                          placeholder="1, 2, 3..."
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>{locale === 'tr' ? 'Aktif' : 'Active'}</Label>
                          <p className="text-xs text-muted-foreground">
                            {locale === 'tr' ? 'Bu numarayı mesajlaşma için kullan' : 'Use this number for messaging'}
                          </p>
                        </div>
                        <Switch
                          checked={selectedConfig.is_active}
                          onCheckedChange={(checked) => setSelectedConfig({
                            ...selectedConfig,
                            is_active: checked
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>{locale === 'tr' ? 'Birincil Numara' : 'Primary Number'}</Label>
                          <p className="text-xs text-muted-foreground">
                            {locale === 'tr' ? 'Varsayılan gönderim numarası olarak kullan' : 'Use as default sending number'}
                          </p>
                        </div>
                        <Switch
                          checked={selectedConfig.is_primary}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Set all others as non-primary
                              const updatedConfigs = configs.map(c => ({
                                ...c,
                                is_primary: c.id === selectedConfig.id
                              }));
                              setConfigs(updatedConfigs);
                            }
                            setSelectedConfig({
                              ...selectedConfig,
                              is_primary: checked
                            });
                          }}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* API Settings Tab */}
                  <TabsContent value="api" className="space-y-4 mt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {locale === 'tr' ? 'Bu bilgileri Meta for Developers konsolundan alabilirsiniz.' : 'You can obtain these details from the Meta for Developers console.'}
                        <a 
                          href="https://developers.facebook.com/apps" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-primary underline"
                        >
                          {locale === 'tr' ? 'Konsola Git' : 'Go to Console'}
                        </a>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="token">Access Token</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="token"
                              type={showTokens[selectedConfig.id] ? "text" : "password"}
                              value={selectedConfig.access_token}
                              onChange={(e) => setSelectedConfig({
                                ...selectedConfig,
                                access_token: e.target.value
                              })}
                              placeholder="EAAxxxxx..."
                              disabled={!isEditing}
                              className="pr-10"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowTokens({
                                ...showTokens,
                                [selectedConfig.id]: !showTokens[selectedConfig.id]
                              })}
                            >
                              {showTokens[selectedConfig.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!isEditing && selectedConfig.access_token && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(selectedConfig.access_token, 'Access Token')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                          <p className="text-xs text-muted-foreground">
                            {locale === 'tr' ? "Kalıcı veya geçici erişim token'ı" : 'Permanent or temporary access token'}
                          </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="api_version">API Version</Label>
                        <Input
                          id="api_version"
                          value={selectedConfig.api_version}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            api_version: e.target.value
                          })}
                          placeholder="v21.0"
                          disabled={!isEditing}
                        />
                          <p className="text-xs text-muted-foreground">
                            {locale === 'tr' ? 'Önerilen: v21.0 veya üzeri' : 'Recommended: v21.0 or higher'}
                          </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="certificate">Business Verification Certificate</Label>
                        <Textarea
                          id="certificate"
                          value={selectedConfig.certificate}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            certificate: e.target.value
                          })}
                          placeholder={locale === 'tr' ? 'İşletme doğrulama sertifikası (opsiyonel)' : 'Business verification certificate (optional)'}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    {!isEditing && selectedConfig.access_token && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => testConnection(selectedConfig)}
                          disabled={testingConnection === selectedConfig.id}
                        >
                          {testingConnection === selectedConfig.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                          )}
                          {locale === 'tr' ? 'API Bağlantısını Test Et' : 'Test API Connection'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => sendTestMessage(selectedConfig)}
                          disabled={testingConnection === selectedConfig.id}
                        >
                          {testingConnection === selectedConfig.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {locale === 'tr' ? 'Test Mesajı Gönder' : 'Send Test Message'}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Webhook Settings Tab */}
                  <TabsContent value="webhook" className="space-y-4 mt-4">
                    <Alert>
                      <Webhook className="h-4 w-4" />
                      <AlertDescription>
                        {locale === 'tr' ? "Meta'dan gelen webhook bildirimleri için aşağıdaki URL'yi kullanın." : 'Use the URL below for incoming webhooks from Meta.'}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={selectedConfig.webhook_url}
                            onChange={(e) => setSelectedConfig({
                              ...selectedConfig,
                              webhook_url: e.target.value
                            })}
                            disabled={!isEditing}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(selectedConfig.webhook_url, 'Webhook URL')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'tr' ? "Bu URL'yi Meta konsolu webhook ayarlarına ekleyin" : 'Add this URL to Meta console webhook settings'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Verify Token</Label>
                        <div className="flex gap-2">
                          <Input
                            value={selectedConfig.webhook_verify_token}
                            onChange={(e) => setSelectedConfig({
                              ...selectedConfig,
                              webhook_verify_token: e.target.value
                            })}
                            disabled={!isEditing}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(selectedConfig.webhook_verify_token, 'Verify Token')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {isEditing && (
                            <Button
                              variant="outline"
                              onClick={() => setSelectedConfig({
                                ...selectedConfig,
                                webhook_verify_token: generateVerifyToken()
                              })}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {locale === 'tr' ? 'Yenile' : 'Regenerate'}
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'tr' ? "Webhook doğrulaması için güvenlik token'ı" : 'Security token used for webhook verification'}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <Label>{locale === 'tr' ? 'Webhook Olayları' : 'Webhook Events'}</Label>
                        <div className="space-y-2">
                          {webhookEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">{event.event_type}</p>
                                <p className="text-xs text-muted-foreground">{event.description}</p>
                              </div>
                              <Switch
                                checked={event.is_enabled}
                                disabled={!isEditing}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Templates Tab */}
                  <TabsContent value="templates" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium">{locale === 'tr' ? 'Mesaj Şablonları' : 'Message Templates'}</h3>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'tr' ? 'Meta tarafından onaylanmış mesaj şablonları' : 'Templates approved by Meta'}
                        </p>
                      </div>
                        <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                          {locale === 'tr' ? 'Şablon Ekle' : 'Add Template'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {templates.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {locale === 'tr' ? 'Henüz şablon bulunmuyor' : 'No templates yet'}
                          </p>
                        </div>
                      ) : (
                        templates.map(template => (
                          <div key={template.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{template.name}</span>
                                  <Badge
                                    variant={template.status === 'APPROVED' ? 'default' : 
                                            template.status === 'PENDING' ? 'secondary' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {template.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{template.category}</span>
                                  <span>•</span>
                                  <span>{template.language}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{locale === 'tr' ? 'Numara Seçin' : 'Select a Number'}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {locale === 'tr' ? 'Sol taraftan bir telefon numarası seçin veya yeni bir numara ekleyin' : 'Select a phone number from the left or add a new one'}
                </p>
                
                <div className="flex flex-col gap-2 mt-4">
                  <EmbeddedSignupButton
                    skipSignupModal={true}
                    onSuccess={(data) => {
                      console.log('🎉 [WhatsApp Settings] WABA Connected from config details:', data);
                      // Add the new WABA configuration
                      addWABAConfiguration(data);
                    }}
                    onError={(error) => {
                      console.error('WABA Connection Error:', error);
                      toast({
                        title: locale === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
                        description: locale === 'tr' ? 'WhatsApp Business hesabı bağlanırken hata oluştu' : 'Failed to connect WhatsApp Business account',
                        variant: 'destructive'
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {locale === 'tr' ? 'WABA Numara Bağla' : 'Connect WABA Number'}
                  </EmbeddedSignupButton>
                  
                  <Button
                    variant="outline"
                    onClick={addNewNumber}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {locale === 'tr' ? 'Manuel Ekle' : 'Add Manually'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Card>
          <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
              {locale === 'tr' ? 'Hızlı Yardım' : 'Quick Help'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <h4 className="text-sm font-medium">{locale === 'tr' ? '1. Meta Business Hesabı' : '1. Meta Business Account'}</h4>
                <p className="text-xs text-muted-foreground">
                  {locale === 'tr' ? "Meta Business Manager'da WhatsApp Business API hesabı oluşturun" : 'Create a WhatsApp Business API account in Meta Business Manager'}
                </p>
              <a 
                href="https://business.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                  {locale === 'tr' ? "Business Manager'a Git →" : 'Open Business Manager →'}
              </a>
            </div>
            
            <div className="space-y-2">
                <h4 className="text-sm font-medium">{locale === 'tr' ? '2. API Bilgilerini Alın' : '2. Get API Details'}</h4>
                <p className="text-xs text-muted-foreground">
                  {locale === 'tr' ? 'Developers konsolundan Phone Number ID ve Access Token alın' : 'Get Phone Number ID and Access Token from Developers console'}
                </p>
              <a 
                href="https://developers.facebook.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                  {locale === 'tr' ? 'Developers Console →' : 'Developers Console →'}
              </a>
            </div>
            
            <div className="space-y-2">
                <h4 className="text-sm font-medium">{locale === 'tr' ? '3. Webhook Yapılandırması' : '3. Webhook Configuration'}</h4>
                <p className="text-xs text-muted-foreground">
                  {locale === 'tr' ? "Webhook URL ve Verify Token'ı Meta konsoluna ekleyin" : 'Add Webhook URL and Verify Token to Meta console'}
                </p>
              <a 
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                  {locale === 'tr' ? 'Dokümantasyon →' : 'Docs →'}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}