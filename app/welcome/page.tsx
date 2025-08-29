'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMockAuth } from '../../components/mock-auth-provider'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { CheckCircle, AlertTriangle, MessageCircle, Shield, Clock, Users, Zap, ArrowRight, Info, Link2 } from 'lucide-react'
import { FacebookSDKProvider } from '../../components/auth/facebook-sdk-provider'
import EmbeddedSignupButton from '../../components/whatsapp/embedded-signup-button'

export default function WelcomePage() {
  const { user, loading } = useMockAuth()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [showWhatsappSetup, setShowWhatsappSetup] = useState(false)
  const [whatsappData, setWhatsappData] = useState<{ waba_id: string; phone_number_id: string } | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  const handleContinue = () => {
    setIsReady(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  const handleWhatsappSetup = () => {
    setShowWhatsappSetup(true)
  }

  // Add WABA configuration to WhatsApp Settings
  const addWABAConfiguration = async (wabaData: { code: string; phone_number_id: string; waba_id: string }) => {
    console.log('🔗 [Welcome] Adding new WABA configuration:', wabaData);
    
    try {
      // Fetch phone number details from Facebook Graph API
      const phoneDetailsResponse = await fetch(`/api/whatsapp/phone-details?phone_number_id=${wabaData.phone_number_id}`);
      let phoneDetails = null;
      
      if (phoneDetailsResponse.ok) {
        phoneDetails = await phoneDetailsResponse.json();
        console.log('📱 [Welcome] Phone details fetched:', phoneDetails);
      }
      
      // Get existing configs from localStorage
      const savedConfigs = localStorage.getItem('whatsapp_configs');
      const existingConfigs = savedConfigs ? JSON.parse(savedConfigs) : [];
      
      // Check if this WABA already exists
      const existingConfig = existingConfigs.find((config: any) => 
        config.phone_number_id === wabaData.phone_number_id || 
        config.business_account_id === wabaData.waba_id
      );
      
      if (existingConfig) {
        console.log('⚠️ [Welcome] WABA configuration already exists:', existingConfig);
        return;
      }
      
      // Create new configuration
      const newConfig = {
        id: `waba_${Date.now()}`,
        phone_number_id: wabaData.phone_number_id,
        display_phone_number: phoneDetails?.display_phone_number || `+${wabaData.phone_number_id}`,
        verified_name: phoneDetails?.verified_name || 'New WhatsApp Business',
        business_account_id: wabaData.waba_id,
        access_token: 'EAAxxxxx...', // Will be updated with real token
        api_version: 'v23.0',
        webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
        webhook_verify_token: `verify_${Date.now()}`,
        is_active: true,
        is_primary: existingConfigs.length === 0, // First one is primary
        quality_rating: phoneDetails?.quality_rating || 'GREEN',
        status: 'CONNECTED',
        messaging_limit_tier: phoneDetails?.messaging_limit_tier || '1000',
        max_phone_numbers: phoneDetails?.max_phone_numbers || 1,
        namespace: phoneDetails?.namespace || 'whatsapp_business',
        certificate: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('✅ [Welcome] New WABA configuration created:', newConfig);
      
      // Add to existing configs
      const updatedConfigs = [...existingConfigs, newConfig];
      
      // Save to localStorage
      localStorage.setItem('whatsapp_configs', JSON.stringify(updatedConfigs));
      
      console.log('💾 [Welcome] WABA configuration saved to localStorage');
      
    } catch (error) {
      console.error('❌ [Welcome] Failed to add WABA configuration:', error);
    }
  };

  const handleWhatsappSuccess = (data: { code: string; phone_number_id: string; waba_id: string }) => {
    console.log('✅ WhatsApp Business connected:', data)
    setWhatsappConnected(true)
    setShowWhatsappSetup(false)
    setWhatsappData({
      waba_id: data.waba_id,
      phone_number_id: data.phone_number_id
    })
    
    // Add WABA configuration to WhatsApp Settings
    addWABAConfiguration(data);
    
    // Optional: Show success message
    // toast({ title: "WhatsApp Business bağlandı!", description: "Artık müşterilerinizle WhatsApp üzerinden iletişim kurabilirsiniz." })
  }

  const handleWhatsappError = (error: string) => {
    console.error('❌ WhatsApp Business connection error:', error)
    // Optional: Show error message
    // toast({ title: "Bağlantı hatası", description: error, variant: "destructive" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Welcome Header */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Happy CRM'e Hoş Geldiniz
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Merhaba <strong>{user.email}</strong>, hesabınız başarıyla oluşturuldu ve aktifleştirildi.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* WhatsApp Cloud API Warnings */}
        <Card className="border border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-xl text-amber-800">
                WhatsApp Business API Kullanım Kuralları
              </CardTitle>
            </div>
            <CardDescription>
              WhatsApp Business API kullanırken dikkat etmeniz gereken önemli kurallar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Shield className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Spam Yasağı</h4>
                  <p className="text-sm text-red-700">
                    İstenmeyen mesaj gönderimi kesinlikle yasaktır. Sadece izin verilen kişilere mesaj gönderin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-800">24 Saat Kuralı</h4>
                  <p className="text-sm text-orange-700">
                    Müşteri son mesajından 24 saat sonra sadece onaylı template mesajları gönderebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Opt-in Zorunluluğu</h4>
                  <p className="text-sm text-blue-700">
                    Müşteriler WhatsApp üzerinden iletişim kurmaya açık rıza vermiş olmalıdır.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <MessageCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-800">Template Onayı</h4>
                  <p className="text-sm text-purple-700">
                    Pazarlama mesajları için WhatsApp onaylı template kullanılması zorunludur.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Önemli Uyarı</h4>
                  <p className="text-sm text-red-700 mb-2">
                    Bu kurallara uymamanız durumunda WhatsApp Business hesabınız <strong>kalıcı olarak kapatılabilir</strong>.
                  </p>
                  <p className="text-sm text-red-700">
                    Detaylı bilgi için <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/overview" target="_blank" className="underline font-medium">WhatsApp Business Policy</a> sayfasını inceleyin.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Platform Özellikleri
            </CardTitle>
            <CardDescription>
              Happy CRM ile neler yapabileceğinizi keşfedin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1 text-gray-900">WhatsApp Business API</h4>
                <p className="text-sm text-gray-600">
                  Profesyonel müşteri iletişimi
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1 text-gray-900">Müşteri Yönetimi</h4>
                <p className="text-sm text-gray-600">
                  Lead takibi ve CRM süreçleri
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1 text-gray-900">Otomasyon</h4>
                <p className="text-sm text-gray-600">
                  İş akışları ve otomatik yanıtlar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Business Setup */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link2 className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl text-blue-800">
                WhatsApp Business API Entegrasyonu
              </CardTitle>
            </div>
            <CardDescription>
              Müşterilerinizle WhatsApp üzerinden profesyonel iletişim kurmak için Meta Business hesabınızı bağlayın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!whatsappConnected ? (
              <div className="space-y-4">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">WhatsApp Business API Avantajları</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Müşterilerinizle WhatsApp üzerinden profesyonel mesajlaşma</li>
                    <li>• Otomatik yanıtlar ve template mesajları</li>
                    <li>• Müşteri destek ve pazarlama kampanyaları</li>
                    <li>• Çoklu kullanıcı desteği ve takım yönetimi</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Bağlantı Öncesi Gereksinimler</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Meta Business hesabınız olmalı</li>
                    <li>• WhatsApp Business hesabınız doğrulanmış olmalı</li>
                    <li>• Telefon numaranız WhatsApp Business'a kayıtlı olmalı</li>
                  </ul>
                </div>

                <div className="text-center space-y-3">
                  <Button
                    onClick={() => router.push('/messaging/whatsapp-settings')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Business'ı Ayarla
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    WhatsApp Business entegrasyonunu ayarlar sayfasından yapabilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 mb-2">✅ WhatsApp Business Bağlandı!</h4>
                  <p className="text-sm text-green-700 mb-4">
                    Artık müşterilerinizle WhatsApp üzerinden profesyonel iletişim kurabilirsiniz.
                  </p>
                  
                  {whatsappData && (
                    <div className="bg-white border border-green-200 rounded-lg p-4 space-y-2">
                      <h5 className="font-medium text-gray-900 mb-2">Bağlantı Bilgileri</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="font-medium text-gray-700">WABA ID</label>
                          <p className="font-mono text-gray-900 break-all">{whatsappData.waba_id}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="font-medium text-gray-700">Phone Number ID</label>
                          <p className="font-mono text-gray-900 break-all">{whatsappData.phone_number_id}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Bu bilgiler WhatsApp Business API entegrasyonunuz için kullanılacaktır.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
            disabled={isReady}
          >
            {isReady ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Dashboard'a yönlendiriliyor...
              </>
            ) : (
              <>
                {whatsappConnected ? 'Kurulumu Tamamla' : 'Dashboard\'a Geç'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-3">
            {whatsappConnected 
              ? 'WhatsApp Business bağlantınız aktif. Dashboard\'a geçebilirsiniz.'
              : 'WhatsApp Business entegrasyonunu daha sonra ayarlardan yapabilirsiniz.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
