'use client';

import { useState } from 'react';
import EmbeddedSignupButton from '@/components/whatsapp/embedded-signup-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, MessageSquare, Settings, Globe, Shield } from 'lucide-react';

export default function WhatsAppSignupPage() {
  const [signupData, setSignupData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuccess = (data: { code: string; phone_number_id: string; waba_id: string }) => {
    console.log('🎉 Signup successful:', data);
    setSignupData(data);
    setIsProcessing(false);
  };

  const handleError = (error: string) => {
    console.error('❌ Signup error:', error);
    setIsProcessing(false);
  };

  const handleSignupStart = () => {
    setIsProcessing(true);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">WhatsApp Business Entegrasyonu</h1>
        <p className="text-xl text-muted-foreground mb-6">
          WhatsApp Business hesabınızı Happy CRM'e bağlayarak müşterilerinizle doğrudan iletişim kurun
        </p>
      </div>

      {/* Özellikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-lg">Direkt Mesajlaşma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              WhatsApp Business API ile müşterilerinize template mesajları gönderin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-lg">Otomatik Kurulum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Embedded Signup ile hesap kurulumu otomatik olarak tamamlanır
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-lg">Güvenli Entegrasyon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Meta onaylı OAuth 2.0 akışı ile güvenli bağlantı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ana Signup Kartı */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Globe className="h-6 w-6" />
            WhatsApp Business Bağlantısı
          </CardTitle>
          <CardDescription>
            Aşağıdaki butona tıklayarak WhatsApp Business hesabınızı Happy CRM'e bağlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {!signupData && (
            <>
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Bağlantı Süreci</h3>
                <ul className="text-sm text-left space-y-1">
                  <li>• Facebook ile giriş yapın</li>
                  <li>• WhatsApp Business hesabınızı seçin</li>
                  <li>• Telefon numaranızı onaylayın</li>
                  <li>• Otomatik kurulum tamamlanır</li>
                </ul>
              </div>

              <EmbeddedSignupButton
                onSuccess={handleSuccess}
                onError={handleError}
                disabled={isProcessing}
                className="px-8 py-3 text-lg"
              />

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Kurulum devam ediyor...</span>
                </div>
              )}
            </>
          )}

          {signupData && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-8 w-8" />
                <h3 className="text-xl font-semibold">Bağlantı Başarılı!</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">WABA ID</label>
                  <p className="font-mono text-sm bg-white p-2 rounded">
                    {signupData.waba_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number ID</label>
                  <p className="font-mono text-sm bg-white p-2 rounded">
                    {signupData.phone_number_id}
                  </p>
                </div>
              </div>

              <Badge className="bg-green-100 text-green-800">
                WhatsApp Business API artık aktif
              </Badge>

              <div className="text-sm text-muted-foreground">
                <p>✅ Hesap başarıyla bağlandı</p>
                <p>✅ Webhook'lar yapılandırıldı</p>
                <p>✅ Template mesajları gönderilebilir</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teknik Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Teknik Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold">Environment Variables</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
              <div>
                NEXT_PUBLIC_FACEBOOK_APP_ID: {' '}
                <Badge variant={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? 'Set' : 'Missing'}
                </Badge>
              </div>
              <div>
                NEXT_PUBLIC_FACEBOOK_CONFIG_ID: {' '}
                <Badge variant={process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID ? 'Set' : 'Missing'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">API Endpoints</h4>
            <div className="space-y-1 text-sm">
              <p><code>/api/whatsapp/onboard</code> - Authorization code işleme</p>
              <p><code>/api/whatsapp/webhook</code> - WhatsApp mesaj webhook'u</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Meta App Dashboard Gereksinimleri</h4>
            <ul className="text-sm space-y-1">
              <li>• Facebook Login for Business yapılandırması</li>
              <li>• WhatsApp Embedded Signup Configuration ID</li>
              <li>• İzin verilen domain'ler (localhost:3000 dahil)</li>
              <li>• Webhook URL'i Meta'da yapılandırılmalı</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}