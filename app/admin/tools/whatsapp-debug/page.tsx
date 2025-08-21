'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import { Textarea } from '../../../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { Label } from '../../../../components/ui/label'
import { Input } from '../../../../components/ui/input'
import { FileText } from 'lucide-react'

interface WhatsAppMessage {
  id: string
  message_id: string
  from_number: string
  to_number: string
  message_type: string
  content: any
  status: string
  received_at: string
  is_incoming: boolean
  lead_id?: string
}

interface WebhookLog {
  id: string
  service: string
  event_type: string
  payload: any
  processed_at: string
}

interface Lead {
  id: string
  lead_name: string
  contact_phone: string
  source: string
}

export default function WhatsAppDebugPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>({})
  const [testPhone, setTestPhone] = useState('905327994223')
  const [testMessage, setTestMessage] = useState('Test mesajı')
  const [templateName, setTemplateName] = useState('hello_world')
  const [languageCode, setLanguageCode] = useState('en_US')
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([])
  const [onPremisesPhone, setOnPremisesPhone] = useState('7782610222')
  const [onPremisesCountryCode, setOnPremisesCountryCode] = useState('44')
  const [verificationCode, setVerificationCode] = useState('')
  const [certificate] = useState('CnAKLAiywNrqrIiIAxIGZW50OndhIhNIYXBweSBTbWlsZSBDbGluaWNzUJTnnMUGGkB97e3EuJr78LEdK3MGp8fkM8ds+dpUL5488xkHe1N4sNWQ1gSau8PxROuTLMYV16dpZJpYWyoWHvtdvV3hcMYIEi9tGxTk+dPNoPNasracq2ohl1zl5V7H8gXSKx2Nixz8xQcuxu3IC6HN0dWlB2DN7w==')

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/whatsapp-messages')
      const result = await response.json()

      if (result.success) {
        setMessages(result.data.messages)
        setWebhookLogs(result.data.webhookLogs)
        setLeads(result.data.leads)
        setSummary(result.data.summary)
      } else {
        console.error('Veri yüklenirken hata:', result.error)
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWhatsAppTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/templates')
      const result = await response.json()
      
      if (result.success) {
        setWhatsappTemplates(result.templates)
        console.log('📋 WhatsApp template\'leri yüklendi:', result.templates)
      } else {
        console.error('❌ WhatsApp template\'leri yüklenemedi:', result.error)
      }
    } catch (error) {
      console.error('WhatsApp template\'leri yükleme hatası:', error)
    }
  }

  const createTestMessage = async () => {
    try {
      const response = await fetch('/api/debug/whatsapp-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_test_message' })
      })
      const result = await response.json()

      if (result.success) {
        await fetchData()
        alert('Test mesajı oluşturuldu!')
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error) {
      console.error('Test mesajı oluşturulurken hata:', error)
      alert('Hata oluştu')
    }
  }

  const createTestLead = async () => {
    try {
      const response = await fetch('/api/debug/whatsapp-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_test_lead' })
      })
      const result = await response.json()

      if (result.success) {
        await fetchData()
        alert('Test lead oluşturuldu!')
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error) {
      console.error('Test lead oluşturulurken hata:', error)
      alert('Hata oluştu')
    }
  }

  const clearTestData = async () => {
    if (!confirm('Test verilerini temizlemek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch('/api/debug/whatsapp-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_test_data' })
      })
      const result = await response.json()

      if (result.success) {
        await fetchData()
        alert('Test verileri temizlendi!')
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error) {
      console.error('Test verileri temizlenirken hata:', error)
      alert('Hata oluştu')
    }
  }

  const sendTestMessage = async () => {
    try {
      const response = await fetch('/api/whatsapp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage
        })
      })
      const result = await response.json()

      if (result.success) {
        alert('✅ WhatsApp mesajı başarıyla gönderildi! Message ID: ' + result.messageId)
        await fetchData() // Mesajları yenile
      } else {
        alert('❌ Hata: ' + result.error)
      }
    } catch (error) {
      console.error('WhatsApp mesajı gönderilirken hata:', error)
      alert('❌ Hata oluştu')
    }
  }

  const sendTemplateMessage = async () => {
    try {
      const response = await fetch('/api/whatsapp/send-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testPhone,
          templateName: templateName,
          languageCode: languageCode
        })
      })
      const result = await response.json()

      if (result.success) {
        alert('✅ WhatsApp template mesajı başarıyla gönderildi! Message ID: ' + result.messageId)
        await fetchData() // Mesajları yenile
      } else {
        alert('❌ Hata: ' + result.error)
      }
    } catch (error) {
      console.error('WhatsApp template mesajı gönderilirken hata:', error)
      alert('❌ Hata oluştu')
    }
  }

  const registerOnPremisesAccount = async () => {
    try {
      const response = await fetch('/api/whatsapp/on-premises/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cc: onPremisesCountryCode,
          phone_number: onPremisesPhone,
          method: 'sms',
          cert: certificate
        })
      })
      const result = await response.json()

      if (result.success) {
        alert(`On-Premises hesap kaydı: ${result.message}`)
        if (result.status === 'pending_verification') {
          alert('SMS ile doğrulama kodu gönderildi. Kodu girin ve doğrulayın.')
        }
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error) {
      console.error('On-Premises kayıt hatası:', error)
      alert('Hata oluştu')
    }
  }

  const verifyOnPremisesAccount = async () => {
    try {
      const response = await fetch('/api/whatsapp/on-premises/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cc: onPremisesCountryCode,
          phone_number: onPremisesPhone,
          code: verificationCode
        })
      })
      const result = await response.json()

      if (result.success) {
        alert(`On-Premises hesap doğrulaması: ${result.message}`)
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error) {
      console.error('On-Premises doğrulama hatası:', error)
      alert('Hata oluştu')
    }
  }

  useEffect(() => {
    fetchData()
    loadWhatsAppTemplates()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case 'text':
        return <Badge variant="default">Metin</Badge>
      case 'image':
        return <Badge variant="secondary">Resim</Badge>
      case 'video':
        return <Badge variant="outline">Video</Badge>
      case 'audio':
        return <Badge variant="outline">Ses</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="default">Alındı</Badge>
      case 'sent':
        return <Badge variant="secondary">Gönderildi</Badge>
      case 'delivered':
        return <Badge variant="outline">Teslim Edildi</Badge>
      case 'read':
        return <Badge variant="default">Okundu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">WhatsApp Debug Tool</h1>
        <p className="text-gray-600 mt-2">
          WhatsApp mesajlarını, webhook loglarını ve lead'leri debug edin
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mesaj</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMessages || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhook Logları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalWebhookLogs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Lead'leri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalLeads || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Button onClick={fetchData} variant="outline">
          Yenile
        </Button>
        <Button onClick={createTestMessage} variant="outline">
          Test Mesajı Oluştur
        </Button>
        <Button onClick={createTestLead} variant="outline">
          Test Lead Oluştur
        </Button>
        <Button onClick={clearTestData} variant="destructive">
          Test Verilerini Temizle
        </Button>
        <Button onClick={loadWhatsAppTemplates} variant="outline">
          Template'leri Yenile
        </Button>
      </div>

      {/* Test Message Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Mesajı Gönder</CardTitle>
          <CardDescription>
            WhatsApp Cloud API ile test mesajı gönderin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testPhone">Telefon Numarası</Label>
            <Input
              id="testPhone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="905327994223"
            />
          </div>
          <div>
            <Label htmlFor="testMessage">Mesaj</Label>
            <Textarea
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test mesajı"
            />
          </div>
          <Button onClick={sendTestMessage} className="w-full">
            WhatsApp'tan Test Mesajı Gönder
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Mesajı Gönder</CardTitle>
          <CardDescription>
            WhatsApp template mesajı gönderin (24 saat kuralı için)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="templatePhone">Telefon Numarası</Label>
            <Input
              id="templatePhone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="905327994223"
            />
          </div>
          <div>
            <Label htmlFor="templateName">Template Adı</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="hello_world"
            />
          </div>
          <div>
            <Label htmlFor="languageCode">Dil Kodu</Label>
            <Input
              id="languageCode"
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              placeholder="en_US"
            />
          </div>
          <Button onClick={sendTemplateMessage} className="w-full">
            Template Mesajı Gönder
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>WhatsApp Template'leri</CardTitle>
          <CardDescription>
            Mevcut onaylı WhatsApp template'leri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {whatsappTemplates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz template bulunmuyor</p>
              </div>
            ) : (
              whatsappTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <Badge 
                      variant={template.status === 'APPROVED' ? 'default' : 'secondary'}
                      className={template.status === 'APPROVED' ? 'bg-green-500' : ''}
                    >
                      {template.status === 'APPROVED' ? 'Onaylı' : 'Beklemede'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {template.components?.map((component: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-600">
                          {component.type === 'HEADER' ? 'Başlık' : 
                           component.type === 'BODY' ? 'İçerik' : 'Alt Bilgi'}:
                        </span>
                        <p className="text-gray-800 mt-1">{component.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Dil: {template.language}</span>
                    <span>Kategori: {template.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* On-Premises API Registration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>WhatsApp On-Premises API Kayıt</CardTitle>
          <CardDescription>
            On-Premises API ile WhatsApp hesabı kaydı ve doğrulaması
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="onPremisesCountryCode">Ülke Kodu</Label>
              <Input
                id="onPremisesCountryCode"
                value={onPremisesCountryCode}
                onChange={(e) => setOnPremisesCountryCode(e.target.value)}
                placeholder="44"
              />
            </div>
            <div>
              <Label htmlFor="onPremisesPhone">Telefon Numarası</Label>
              <Input
                id="onPremisesPhone"
                value={onPremisesPhone}
                onChange={(e) => setOnPremisesPhone(e.target.value)}
                placeholder="7782610222"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="certificate">Sertifika (Base64)</Label>
            <Textarea
              id="certificate"
              value={certificate}
              readOnly
              rows={2}
              className="font-mono text-xs"
            />
          </div>
          <Button onClick={registerOnPremisesAccount} className="w-full">
            On-Premises Hesap Kaydı Başlat
          </Button>
          
          <div className="border-t pt-4">
            <Label htmlFor="verificationCode">Doğrulama Kodu</Label>
            <div className="flex gap-2">
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="SMS ile gelen kod"
              />
              <Button onClick={verifyOnPremisesAccount}>
                Doğrula
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">WhatsApp Mesajları</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Logları</TabsTrigger>
          <TabsTrigger value="leads">Lead'ler</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Mesajları</CardTitle>
              <CardDescription>
                Son {messages.length} WhatsApp mesajı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMessageTypeBadge(message.message_type)}
                        {getStatusBadge(message.status)}
                        <Badge variant="outline">
                          {message.is_incoming ? 'Gelen' : 'Giden'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(message.received_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Message ID:</strong> {message.message_id}</div>
                      <div><strong>From:</strong> {message.from_number}</div>
                      <div><strong>To:</strong> {message.to_number}</div>
                      {message.lead_id && (
                        <div><strong>Lead ID:</strong> {message.lead_id}</div>
                      )}
                      <div><strong>Content:</strong></div>
                      <Textarea
                        value={JSON.stringify(message.content, null, 2)}
                        readOnly
                        rows={3}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && !loading && (
                  <div className="text-center text-gray-500 py-8">
                    Henüz WhatsApp mesajı bulunmuyor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Logları</CardTitle>
              <CardDescription>
                Son {webhookLogs.length} WhatsApp webhook logu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.event_type}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(log.processed_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div><strong>Payload:</strong></div>
                      <Textarea
                        value={JSON.stringify(log.payload, null, 2)}
                        readOnly
                        rows={5}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
                
                {webhookLogs.length === 0 && !loading && (
                  <div className="text-center text-gray-500 py-8">
                    Henüz webhook logu bulunmuyor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Lead'leri</CardTitle>
              <CardDescription>
                Son {leads.length} WhatsApp lead'i
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{lead.source}</Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Lead Name:</strong> {lead.lead_name}</div>
                      <div><strong>Contact Phone:</strong> {lead.contact_phone}</div>
                      <div><strong>Lead ID:</strong> {lead.id}</div>
                    </div>
                  </div>
                ))}
                
                {leads.length === 0 && !loading && (
                  <div className="text-center text-gray-500 py-8">
                    Henüz WhatsApp lead'i bulunmuyor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
