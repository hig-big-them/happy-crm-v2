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

  const handleWhatsappSuccess = (data: { code: string; phone_number_id: string; waba_id: string }) => {
    console.log('✅ WhatsApp Business connected:', data)
    setWhatsappConnected(true)
    setShowWhatsappSetup(false)
    
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
                  <FacebookSDKProvider>
                    <EmbeddedSignupButton
                      onSuccess={handleWhatsappSuccess}
                      onError={handleWhatsappError}
                      disabled={false}
                    />
                  </FacebookSDKProvider>
                  
                  <p className="text-sm text-gray-500">
                    Bu adımı şimdi atlayıp daha sonra ayarlar sayfasından yapabilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-800 mb-2">✅ WhatsApp Business Bağlandı!</h4>
                <p className="text-sm text-green-700">
                  Artık müşterilerinizle WhatsApp üzerinden profesyonel iletişim kurabilirsiniz.
                </p>
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
