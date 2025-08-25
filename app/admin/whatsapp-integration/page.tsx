'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Phone,
  Users,
  Activity,
  RefreshCw,
  Link2
} from 'lucide-react';
import EmbeddedSignupButton from '@/components/whatsapp/embedded-signup-button';
import { createClient } from '@/lib/supabase/mock-auth-client';

interface WhatsAppAccount {
  id: string;
  waba_id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  status: 'active' | 'inactive' | 'pending';
  quality_rating: string;
  created_at: string;
}

export default function WhatsAppIntegrationPage() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const supabase = createClient();

  // WhatsApp hesaplarını yükle
  const loadAccounts = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual database query
      // const { data, error } = await supabase
      //   .from('whatsapp_accounts')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // Mock data for now
      const mockAccounts: WhatsAppAccount[] = [
        // {
        //   id: '1',
        //   waba_id: '123456789012345',
        //   phone_number_id: '987654321098765',
        //   display_phone_number: '+90 555 123 4567',
        //   verified_name: 'Happy CRM Business',
        //   status: 'active',
        //   quality_rating: 'GREEN',
        //   created_at: new Date().toISOString()
        // }
      ];

      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Error loading WhatsApp accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSignupSuccess = async (data: { code: string; phone_number_id: string; waba_id: string }) => {
    console.log('🎉 WhatsApp connected successfully:', data);
    setConnecting(false);
    
    // Hesapları yeniden yükle
    await loadAccounts();
  };

  const handleSignupError = (error: string) => {
    console.error('❌ WhatsApp connection failed:', error);
    setConnecting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Pasif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQualityBadge = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'green':
        return <Badge className="bg-green-100 text-green-800">Yüksek</Badge>;
      case 'yellow':
        return <Badge className="bg-yellow-100 text-yellow-800">Orta</Badge>;
      case 'red':
        return <Badge className="bg-red-100 text-red-800">Düşük</Badge>;
      default:
        return <Badge variant="outline">{rating}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Entegrasyonu</h1>
          <p className="text-muted-foreground mt-2">
            WhatsApp Business hesaplarınızı yönetin ve müşterilerinizle iletişim kurun
          </p>
        </div>
        <Button onClick={loadAccounts} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Durum Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{accounts.length}</p>
                <p className="text-sm text-muted-foreground">Bağlı Hesap</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Aktif Hesap</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Günlük Mesaj</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Toplam Kontak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yeni Hesap Ekleme */}
      {accounts.length === 0 && (
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Link2 className="h-6 w-6" />
              İlk WhatsApp Business Hesabınızı Bağlayın
            </CardTitle>
            <CardDescription>
              Meta'nın Embedded Signup özelliğini kullanarak güvenli şekilde hesabınızı bağlayın
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Meta OAuth</h3>
                <p className="text-sm text-muted-foreground">Güvenli Facebook/Meta giriş</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Otomatik Kurulum</h3>
                <p className="text-sm text-muted-foreground">Webhook'lar ve izinler otomatik</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Anında Aktif</h3>
                <p className="text-sm text-muted-foreground">Hemen mesaj göndermeye başlayın</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Gereksinimler:</strong> Meta App Dashboard'da yapılandırılmış WhatsApp Business API erişimi ve 
                Facebook Login for Business configuration gereklidir.
              </AlertDescription>
            </Alert>

            <div className="max-w-md mx-auto">
              <EmbeddedSignupButton
                onSuccess={handleSignupSuccess}
                onError={handleSignupError}
                disabled={connecting}
                className="w-full py-3 text-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bağlı Hesaplar */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bağlı WhatsApp Business Hesapları</span>
              <EmbeddedSignupButton
                onSuccess={handleSignupSuccess}
                onError={handleSignupError}
                disabled={connecting}
                className="ml-auto"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">{account.verified_name}</h3>
                        {getStatusBadge(account.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Telefon:</span>
                          <p className="font-medium">{account.display_phone_number}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kalite:</span>
                          <div>{getQualityBadge(account.quality_rating)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bağlandığı Tarih:</span>
                          <p className="font-medium">
                            {new Date(account.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>WABA ID: {account.waba_id}</p>
                        <p>Phone Number ID: {account.phone_number_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Ayarlar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teknik Bilgiler */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Kurulum Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Environment Variables</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <code>NEXT_PUBLIC_FACEBOOK_APP_ID</code>
                  <Badge variant={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? 'default' : 'destructive'}>
                    {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? '✓ Set' : '✗ Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <code>NEXT_PUBLIC_FACEBOOK_CONFIG_ID</code>
                  <Badge variant={process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID ? 'default' : 'destructive'}>
                    {process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID ? '✓ Set' : '✗ Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <code>FACEBOOK_APP_SECRET</code>
                  <Badge variant="outline">Server-side</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">API Endpoints</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <code>/api/whatsapp/onboard</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <code>/api/whatsapp/webhook</code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}