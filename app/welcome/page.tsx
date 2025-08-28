'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMockAuth } from '../../components/mock-auth-provider'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { CheckCircle, AlertTriangle, MessageCircle, Shield, Clock, Users, Zap, ArrowRight, Info } from 'lucide-react'

export default function WelcomePage() {
  const { user, loading } = useMockAuth()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Welcome Header */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              🎉 Happy CRM'e Hoş Geldiniz!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Merhaba <strong>{user.email}</strong>, hesabınız başarıyla oluşturuldu ve aktifleştirildi.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* WhatsApp Cloud API Warnings */}
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-xl text-orange-800">
                WhatsApp Cloud API Kullanım Uyarıları
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Önemli Uyarı</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Bu kurallara uymamanız durumunda WhatsApp Business hesabınız <strong>kalıcı olarak kapatılabilir</strong>.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Detaylı bilgi için <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/overview" target="_blank" className="underline font-medium">WhatsApp Business Policy</a> sayfasını inceleyin.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Happy CRM Özellikleri
            </CardTitle>
            <CardDescription>
              Platformumuzda neler yapabileceğinizi keşfedin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">WhatsApp Entegrasyonu</h4>
                <p className="text-sm text-gray-600">
                  Business API ile profesyonel mesajlaşma
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Müşteri Yönetimi</h4>
                <p className="text-sm text-gray-600">
                  Lead takibi ve müşteri ilişkileri
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Otomasyon</h4>
                <p className="text-sm text-gray-600">
                  Akıllı iş akışları ve otomatik yanıtlar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg"
            disabled={isReady}
          >
            {isReady ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Dashboard'a Yönlendiriliyor...
              </>
            ) : (
              <>
                Dashboard'a Geç
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-3">
            Bu uyarıları okuduğunuzu ve anladığınızı onaylayarak devam ediyorsunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
