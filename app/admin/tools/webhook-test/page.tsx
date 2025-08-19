'use client'

import { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Textarea } from '../../../../components/ui/textarea'
import { Badge } from '../../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'

export default function WebhookTestPage() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookType, setWebhookType] = useState('twilio')
  const [transferId, setTransferId] = useState('test-transfer-123')
  const [confirmationCode, setConfirmationCode] = useState('CONFIRMED')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // WhatsApp test data
  const [whatsappMessage, setWhatsappMessage] = useState('Merhaba, test mesajı')
  const [whatsappFrom, setWhatsappFrom] = useState('905327994223')
  const [whatsappTo, setWhatsappTo] = useState('905327994223')

  // Deadline notification test data
  const [dtmfDigits, setDtmfDigits] = useState('1')
  const [callStatus, setCallStatus] = useState('completed')

  const testWebhook = async () => {
    if (!webhookUrl) {
      alert('Webhook URL gerekli')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      let payload: any = {}
      let headers: Record<string, string> = {}
      let method = 'POST'

      switch (webhookType) {
        case 'twilio':
          payload = {
            transfer_id: transferId,
            confirmation_code: confirmationCode,
            ExecutionSid: 'EX' + Math.random().toString(36).substr(2, 9),
            FlowSid: 'FW' + Math.random().toString(36).substr(2, 9),
            ExecutionStatus: 'ended',
            From: '+905327994223',
            To: '+905327994223',
            CallStatus: 'completed'
          }
          headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'TwilioProxy/1.1'
          }
          break

        case 'whatsapp':
          payload = {
            object: 'whatsapp_business_account',
            entry: [{
              id: '123456789',
              changes: [{
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: whatsappTo,
                    phone_number_id: '123456789'
                  },
                  messages: [{
                    from: whatsappFrom,
                    id: 'wamid.' + Math.random().toString(36).substr(2, 9),
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: {
                      body: whatsappMessage
                    }
                  }]
                },
                field: 'messages'
              }]
            }]
          }
          headers = {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': 'sha256=' + Math.random().toString(36).substr(2, 40)
          }
          break

        case 'deadline':
          payload = {
            transfer_id: transferId,
            Digits: dtmfDigits,
            CallSid: 'CA' + Math.random().toString(36).substr(2, 9),
            CallStatus: callStatus,
            ExecutionSid: 'EX' + Math.random().toString(36).substr(2, 9)
          }
          headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
          break
      }

      console.log('Gönderilen data:', payload)

      const response = await fetch(webhookUrl, {
        method,
        headers,
        body: headers['Content-Type'] === 'application/json' 
          ? JSON.stringify(payload)
          : new URLSearchParams(payload).toString()
      })

      const responseText = await response.text()
      
      try {
        const jsonResult = JSON.parse(responseText)
        setResult({
          status: response.status,
          statusText: response.statusText,
          data: jsonResult
        })
      } catch {
        setResult({
          status: response.status,
          statusText: response.statusText,
          data: responseText
        })
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    } finally {
      setLoading(false)
    }
  }

  const testLocalWebhook = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    
    switch (webhookType) {
      case 'twilio':
        setWebhookUrl(`${baseUrl}/api/twilio/test-webhook`)
        break
      case 'whatsapp':
        setWebhookUrl(`${baseUrl}/api/webhooks/whatsapp`)
        break
      case 'deadline':
        setWebhookUrl(`${baseUrl}/api/webhooks/deadline-notification`)
        break
    }
  }

  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin
      setWebhookUrl(`${baseUrl}/api/twilio/test-webhook`)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Webhook Test Tool</h1>
        <p className="text-gray-600 mt-2">
          Farklı webhook türlerini test etmek için bu aracı kullanın
        </p>
      </div>

      <Tabs defaultValue="twilio" value={webhookType} onValueChange={setWebhookType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="twilio">Twilio Webhook</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Webhook</TabsTrigger>
          <TabsTrigger value="deadline">Deadline Notification</TabsTrigger>
        </TabsList>

        <TabsContent value="twilio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Twilio Webhook Test</CardTitle>
              <CardDescription>
                Twilio Studio Flow webhook'larını test edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/twilio/test-webhook"
                />
              </div>
              
              <div>
                <Label htmlFor="transferId">Transfer ID</Label>
                <Input
                  id="transferId"
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmationCode">Confirmation Code</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={() => setConfirmationCode('CONFIRMED')}
                    variant={confirmationCode === 'CONFIRMED' ? 'default' : 'outline'}
                    size="sm"
                  >
                    CONFIRMED
                  </Button>
                  <Button
                    onClick={() => setConfirmationCode('REJECTED')}
                    variant={confirmationCode === 'REJECTED' ? 'default' : 'outline'}
                    size="sm"
                  >
                    REJECTED
                  </Button>
                </div>
                <Input
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Webhook Test</CardTitle>
              <CardDescription>
                WhatsApp Cloud API webhook'larını test edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/webhooks/whatsapp"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsappFrom">From Number</Label>
                <Input
                  id="whatsappFrom"
                  value={whatsappFrom}
                  onChange={(e) => setWhatsappFrom(e.target.value)}
                  placeholder="905327994223"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsappTo">To Number</Label>
                <Input
                  id="whatsappTo"
                  value={whatsappTo}
                  onChange={(e) => setWhatsappTo(e.target.value)}
                  placeholder="905327994223"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsappMessage">Message</Label>
                <Textarea
                  id="whatsappMessage"
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Test mesajı"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deadline Notification Test</CardTitle>
              <CardDescription>
                Deadline notification DTMF webhook'larını test edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/webhooks/deadline-notification"
                />
              </div>
              
              <div>
                <Label htmlFor="transferId">Transfer ID</Label>
                <Input
                  id="transferId"
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="dtmfDigits">DTMF Digits</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={() => setDtmfDigits('1')}
                    variant={dtmfDigits === '1' ? 'default' : 'outline'}
                    size="sm"
                  >
                    1 - Hasta Alındı
                  </Button>
                  <Button
                    onClick={() => setDtmfDigits('2')}
                    variant={dtmfDigits === '2' ? 'default' : 'outline'}
                    size="sm"
                  >
                    2 - Bekleme
                  </Button>
                </div>
                <Input
                  value={dtmfDigits}
                  onChange={(e) => setDtmfDigits(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="callStatus">Call Status</Label>
                <Select value={callStatus} onValueChange={setCallStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="no-answer">No Answer</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Action */}
      <Card>
        <CardHeader>
          <CardTitle>Test Çalıştır</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testLocalWebhook} variant="outline">
              Local Test URL Kullan
            </Button>
            <Button onClick={getCurrentUrl} variant="outline">
              Current Domain Kullan
            </Button>
          </div>
          
          <Button 
            onClick={testWebhook} 
            disabled={loading || !webhookUrl}
            className="w-full"
          >
            {loading ? 'Test Çalışıyor...' : `${webhookType.toUpperCase()} Webhook Test Et`}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Sonucu 
              {result.status && (
                <Badge variant={result.status === 200 ? 'default' : 'destructive'}>
                  {result.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(result, null, 2)}
              readOnly
              rows={10}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanım Talimatları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm">1. Ngrok ile Test:</h3>
            <p className="text-sm text-gray-600">
              Terminal'de <code>ngrok http 3000</code> çalıştırın ve verilen URL'i kullanın
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">2. Local Test:</h3>
            <p className="text-sm text-gray-600">
              "Local Test URL Kullan" butonuna basarak localhost üzerinden test edin
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">3. Production Test:</h3>
            <p className="text-sm text-gray-600">
              Deployed URL'inizi girerek production webhook'unu test edin
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm">4. Webhook Türleri:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Twilio:</strong> Studio Flow webhook'ları için</li>
              <li><strong>WhatsApp:</strong> WhatsApp Cloud API webhook'ları için</li>
              <li><strong>Deadline:</strong> DTMF deadline notification webhook'ları için</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 