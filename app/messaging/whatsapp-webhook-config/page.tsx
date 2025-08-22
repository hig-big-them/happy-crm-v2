'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Key, 
  Link, 
  Shield,
  RefreshCw,
  ExternalLink,
  Server,
  Webhook,
  Lock
} from 'lucide-react';

export default function WhatsAppWebhookConfigPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'not_verified'>('checking');
  
  // Production webhook URL
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';
  const fullWebhookUrl = `${productionUrl}/api/whatsapp/webhook`;
  
  // Verify token should be set in environment variables
  const secureVerifyToken = process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'PLEASE_SET_IN_ENV_VARIABLES';

  useEffect(() => {
    setWebhookUrl(fullWebhookUrl);
    setVerifyToken(secureVerifyToken);
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/webhook/verify-status');
      const data = await response.json();
      setVerificationStatus(data.verified ? 'verified' : 'not_verified');
    } catch (error) {
      setVerificationStatus('not_verified');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const testWebhook = async () => {
    try {
      const response = await fetch(`/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test_challenge&hub.verify_token=${verifyToken}`);
      const result = await response.text();
      if (result === 'test_challenge') {
        setVerificationStatus('verified');
        alert('Webhook verification successful!');
      } else {
        setVerificationStatus('not_verified');
        alert('Webhook verification failed');
      }
    } catch (error) {
      alert('Error testing webhook');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Webhook Configuration</h1>
        <p className="text-gray-600">Configure and verify your WhatsApp Business API webhooks</p>
      </div>

      <div className="grid gap-6">
        {/* Verification Status */}
        <Alert className={verificationStatus === 'verified' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
          <div className="flex items-center gap-2">
            {verificationStatus === 'verified' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <AlertDescription className={verificationStatus === 'verified' ? 'text-green-800' : 'text-yellow-800'}>
              {verificationStatus === 'checking' && 'Checking webhook verification status...'}
              {verificationStatus === 'verified' && 'Webhook is verified and ready to receive events'}
              {verificationStatus === 'not_verified' && 'Webhook needs to be configured in Meta Business Suite'}
            </AlertDescription>
          </div>
        </Alert>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Endpoint
                </CardTitle>
                <CardDescription>
                  Use this URL in Meta Business Suite webhook configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Callback URL</label>
                  <div className="flex gap-2">
                    <Input 
                      value={webhookUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(webhookUrl, 'url')}
                    >
                      {copied === 'url' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Verify Token</label>
                  <div className="flex gap-2">
                    <Input 
                      value={verifyToken} 
                      readOnly 
                      type="password"
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(verifyToken, 'token')}
                    >
                      {copied === 'token' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Keep this token secure and never share it publicly</p>
                </div>

                <div className="pt-4">
                  <Button onClick={testWebhook} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Webhook Verification
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Webhook Events
                </CardTitle>
                <CardDescription>
                  Subscribe to these events in Meta Business Suite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">messages</p>
                      <p className="text-sm text-gray-600">Gelen mesajları alın - müşteri mesajları</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Zorunlu</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">message_echoes</p>
                      <p className="text-sm text-gray-600">Gönderdiğiniz mesajların kopyaları</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Zorunlu</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">account_alerts</p>
                      <p className="text-sm text-gray-600">Hesap güvenlik ve limit uyarıları</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Önerilen</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">phone_number_quality_update</p>
                      <p className="text-sm text-gray-600">Kalite puanı değişiklikleri</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Önerilen</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">message_template_status_update</p>
                      <p className="text-sm text-gray-600">Template onay durumu güncellemeleri</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Önerilen</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">business_capability_update</p>
                      <p className="text-sm text-gray-600">İşletme yetenek güncellemeleri</p>
                    </div>
                    <Badge>İsteğe Bağlı</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">security</p>
                      <p className="text-sm text-gray-600">Güvenlik olayları ve uyarıları</p>
                    </div>
                    <Badge>İsteğe Bağlı</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Access Token Management
                </CardTitle>
                <CardDescription>
                  Manage your WhatsApp API access tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Your current token expires in 60 days. Create a permanent token for production use.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Current Token Status</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline">User Token (60 days)</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">~60 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Permissions:</span>
                      <span className="font-medium">whatsapp_business_messaging, whatsapp_business_management</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <h3 className="text-sm font-medium">Create Permanent Token</h3>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="font-medium">1.</span>
                      <span>Go to Meta Business Suite → System Users</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium">2.</span>
                      <span>Create a new System User with "Admin" role</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium">3.</span>
                      <span>Generate token with these permissions:</span>
                    </li>
                  </ol>
                  <div className="ml-6 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>whatsapp_business_messaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>whatsapp_business_management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>business_management</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open('https://business.facebook.com/settings/system-users', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Meta Business Suite
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup Guide Tab */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup Guide</CardTitle>
                <CardDescription>
                  Follow these steps to configure webhooks in Meta Business Suite
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Open WhatsApp Configuration</h3>
                      <p className="text-sm text-gray-600">
                        Go to Meta Business Suite → WhatsApp → Configuration → Webhooks
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Enter Callback URL</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Copy and paste this URL:
                      </p>
                      <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                        {webhookUrl}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Enter Verify Token</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Copy and paste this token:
                      </p>
                      <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                        {verifyToken}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Subscribe to Events</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Enable these webhook fields:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✓ messages (zorunlu)</li>
                        <li>✓ message_echoes (zorunlu)</li>
                        <li>✓ account_alerts (önerilen)</li>
                        <li>✓ phone_number_quality_update (önerilen)</li>
                        <li>✓ message_template_status_update (önerilen)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium text-sm">
                      5
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Verify and Save</h3>
                      <p className="text-sm text-gray-600">
                        Click "Verify and Save" in Meta Business Suite. The webhook should be verified immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Never share your verify token or access token publicly. Store them securely in environment variables.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Webhook signature verification is enabled</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>All webhook events are validated with HMAC-SHA256</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Rate limiting is applied to prevent abuse</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}