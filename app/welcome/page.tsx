'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, MessageSquare, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [wabaData, setWabaData] = useState<any>(null)

  useEffect(() => {
    const processWhatsAppAuth = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      
      console.log('🎉 [WhatsApp Success] Processing WhatsApp authentication')
      console.log('📋 [WhatsApp Success] Auth code:', code ? code.substring(0, 10) + '...' : 'none')
      console.log('🔗 [WhatsApp Success] State:', state)

      if (!code) {
        console.log('❌ [WhatsApp Success] No authorization code found')
        toast({
          title: 'Hata',
          description: 'WhatsApp yetkilendirme kodu bulunamadı.',
          variant: 'destructive'
        })
        setProcessing(false)
        return
      }

      try {
        console.log('🔄 [WhatsApp Success] Calling onboard API...')
        
        // WhatsApp onboard API'yi çağır
        const response = await fetch('/api/whatsapp/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code,
            phone_number_id: null,
            waba_id: null,
            redirect_uri: `${window.location.origin}/welcome`
          }),
        })

        const result = await response.json()
        console.log('📋 [WhatsApp Success] Onboard API response:', result)

        if (result.success && result.data) {
          console.log('✅ [WhatsApp Success] WABA setup successful')
          setWabaData(result.data)
          setSuccess(true)
          
          // WhatsApp Settings sayfasına veri aktarımı için localStorage'a kaydet
          const wabaConfig = {
            id: `waba_${result.data.waba_id}_${Date.now()}`,
            phone_number_id: result.data.phone_number_id,
            display_phone_number: result.data.display_phone_number || result.data.phone_number,
            verified_name: result.data.verified_name || 'WhatsApp Business',
            business_account_id: result.data.waba_id,
            access_token: 'EAAxxxxx...', // Masked for security
            api_version: 'v23.0',
            webhook_url: `${window.location.origin}/api/webhooks/whatsapp`,
            webhook_verify_token: 'whatsapp_verify_token_' + Math.random().toString(36).substr(2, 9),
            is_active: true,
            is_primary: false,
            quality_rating: result.data.quality_rating || 'GREEN',
            status: 'PENDING' as const, // Yeni bağlanan numaralar PENDING başlar
            messaging_limit_tier: result.data.messaging_limit_tier || '1000',
            max_phone_numbers: 1,
            namespace: result.data.namespace || 'whatsapp_business',
            certificate: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Mevcut konfigürasyonları al ve yenisini ekle
          const existingConfigs = JSON.parse(localStorage.getItem('whatsapp_configs') || '[]')
          const updatedConfigs = [...existingConfigs, wabaConfig]
          localStorage.setItem('whatsapp_configs', JSON.stringify(updatedConfigs))
          
          console.log('💾 [WhatsApp Success] WABA config saved to localStorage:', wabaConfig)

          toast({
            title: 'WhatsApp Business Bağlandı!',
            description: `WABA ID: ${result.data.waba_id}, Phone ID: ${result.data.phone_number_id}`,
          })
        } else {
          console.log('❌ [WhatsApp Success] WABA setup failed:', result.error)
          toast({
            title: 'Bağlantı Hatası',
            description: result.error || 'WhatsApp Business bağlantısı kurulamadı.',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('❌ [WhatsApp Success] Error processing auth:', error)
        toast({
          title: 'İşlem Hatası',
          description: 'WhatsApp Business bağlantısı işlenirken hata oluştu.',
          variant: 'destructive'
        })
      } finally {
        setProcessing(false)
      }
    }

    processWhatsAppAuth()
  }, [searchParams])

  const handleComplete = () => {
    console.log('🔄 [WhatsApp Success] Redirecting to WhatsApp Settings')
    router.push('/messaging/whatsapp-settings')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {processing ? (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            ) : success ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <MessageSquare className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl">
            {processing ? 'WhatsApp Business Bağlanıyor...' : 
             success ? 'Bağlantı Başarılı!' : 'Bağlantı Hatası'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {processing && (
            <div className="text-center text-gray-600">
              <p>WhatsApp Business hesabınız yapılandırılıyor...</p>
              <p className="text-sm mt-2">Bu işlem birkaç saniye sürebilir.</p>
            </div>
          )}

          {success && wabaData && (
            <div className="space-y-3">
              <div className="text-center text-green-800 bg-green-50 p-3 rounded-lg">
                <p className="font-medium">WhatsApp Business hesabınız başarıyla bağlandı!</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">WABA ID:</span>
                  <span className="font-mono">{wabaData.waba_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone ID:</span>
                  <span className="font-mono">{wabaData.phone_number_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefon:</span>
                  <span>{wabaData.display_phone_number || wabaData.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doğrulanmış Ad:</span>
                  <span>{wabaData.verified_name || 'WhatsApp Business'}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p><strong>Sonraki Adım:</strong> Numaranızı kaydetmek için WhatsApp Settings sayfasına gidin ve PIN kodunuzu girin.</p>
              </div>
            </div>
          )}

          {!processing && !success && (
            <div className="text-center text-red-600">
              <p>WhatsApp Business bağlantısı kurulamadı.</p>
              <p className="text-sm mt-2">Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.</p>
            </div>
          )}

          <div className="flex gap-2">
            {success ? (
              <Button onClick={handleComplete} className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                WhatsApp Ayarlarına Git
              </Button>
            ) : !processing && (
              <Button 
                onClick={() => router.push('/messaging/whatsapp-settings')} 
                variant="outline" 
                className="w-full"
              >
                Ayarlara Dön
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}