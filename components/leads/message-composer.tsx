'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/client'
import { Send, MessageSquare, Phone, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  sendSMS, 
  sendWhatsApp, 
  sendEmail, 
  createMessage,
  getTwilioContentTemplates 
} from '@/lib/actions/message-actions'
import { TwilioContentTemplate } from '@/lib/actions/message-types'

interface MessageComposerProps {
  leadId: string
  leadName: string
  defaultPhone?: string
  defaultEmail?: string
  onMessageSent?: () => void
}

export default function MessageComposer({ 
  leadId, 
  leadName, 
  defaultPhone, 
  defaultEmail, 
  onMessageSent 
}: MessageComposerProps) {
  const { locale } = useI18n()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<TwilioContentTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TwilioContentTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  
  // SMS Form Data
  const [smsData, setSmsData] = useState({
    recipient_phone: defaultPhone || '',
    content_sid: '',
    custom_message: ''
  })
  
  // WhatsApp Form Data
  const [whatsappData, setWhatsappData] = useState({
    recipient_phone: defaultPhone || '',
    content_sid: '',
    custom_message: ''
  })
  
  // Email Form Data
  const [emailData, setEmailData] = useState({
    recipient_email: defaultEmail || '',
    subject: '',
    content: ''
  })
  
  // Note Form Data
  const [noteData, setNoteData] = useState({
    content: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.variables) {
      // Varsayılan değişken değerlerini ayarla
      const defaultVars: Record<string, string> = {}
      selectedTemplate.variables.forEach(variable => {
        if (variable === 'lead_name' || variable === 'name') {
          defaultVars[variable] = leadName
        } else {
          defaultVars[variable] = ''
        }
      })
      setTemplateVariables(defaultVars)
    }
  }, [selectedTemplate, leadName])

  const loadTemplates = async () => {
    try {
      const templatesData = await getTwilioContentTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Template\'ler yüklenemedi:', error)
    }
  }

  const handleSendSMS = async () => {
    if (!smsData.recipient_phone) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Telefon numarası gerekli' : 'Phone number is required',
        variant: 'destructive'
      })
      return
    }

    if (!smsData.content_sid && !smsData.custom_message) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Template seçin veya özel mesaj yazın' : 'Select a template or write a custom message',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const result = await sendSMS({
        lead_id: leadId,
        recipient_phone: smsData.recipient_phone,
        content_sid: smsData.content_sid || undefined,
        template_variables: Object.keys(templateVariables).length > 0 ? templateVariables : undefined,
        custom_message: smsData.custom_message || undefined
      })

      if (result?.success) {
        toast({
          title: locale === 'tr' ? 'Başarılı' : 'Success',
          description: locale === 'tr' ? 'SMS gönderildi' : 'SMS sent'
        })
        setSmsData({ ...smsData, custom_message: '', content_sid: '' })
        setSelectedTemplate(null)
        setTemplateVariables({})
        onMessageSent?.()
      }
    } catch (error) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'SMS gönderilirken hata oluştu' : 'Failed to send SMS',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendWhatsApp = async () => {
    if (!whatsappData.recipient_phone) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Telefon numarası gerekli' : 'Phone number is required',
        variant: 'destructive'
      })
      return
    }

    if (!whatsappData.content_sid && !whatsappData.custom_message) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Template seçin veya özel mesaj yazın' : 'Select a template or write a custom message',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const result = await sendWhatsApp({
        lead_id: leadId,
        recipient_phone: whatsappData.recipient_phone,
        content_sid: whatsappData.content_sid || undefined,
        template_variables: Object.keys(templateVariables).length > 0 ? templateVariables : undefined,
        custom_message: whatsappData.custom_message || undefined
      })

      if (result?.success) {
        toast({
          title: locale === 'tr' ? 'Başarılı' : 'Success',
          description: locale === 'tr' ? 'WhatsApp mesajı gönderildi' : 'WhatsApp message sent'
        })
        setWhatsappData({ ...whatsappData, custom_message: '', content_sid: '' })
        setSelectedTemplate(null)
        setTemplateVariables({})
        onMessageSent?.()
      }
    } catch (error) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'WhatsApp mesajı gönderilirken hata oluştu' : 'Failed to send WhatsApp message',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailData.recipient_email || !emailData.subject || !emailData.content) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Tüm email alanları gerekli' : 'All email fields are required',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const result = await sendEmail({
        lead_id: leadId,
        recipient_email: emailData.recipient_email,
        subject: emailData.subject,
        content: emailData.content
      })

      if (result?.success) {
        toast({
          title: locale === 'tr' ? 'Başarılı' : 'Success',
          description: locale === 'tr' ? 'E-posta gönderildi' : 'Email sent'
        })
        setEmailData({ recipient_email: defaultEmail || '', subject: '', content: '' })
        onMessageSent?.()
      }
    } catch (error) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'E-posta gönderilirken hata oluştu' : 'Failed to send email',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteData.content) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Not içeriği gerekli' : 'Note content is required',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const result = await createMessage({
        lead_id: leadId,
        content: noteData.content,
        direction: 'outbound',
        channel: 'note'
      })

      if (result?.success) {
        toast({
          title: locale === 'tr' ? 'Başarılı' : 'Success',
          description: locale === 'tr' ? 'Not eklendi' : 'Note added'
        })
        setNoteData({ content: '' })
        onMessageSent?.()
      }
    } catch (error) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Not eklenirken hata oluştu' : 'Failed to add note',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateSid: string, channel: 'sms' | 'whatsapp') => {
    const template = templates.find(t => t.sid === templateSid)
    setSelectedTemplate(template || null)
    
    if (channel === 'sms') {
      setSmsData({ ...smsData, content_sid: templateSid })
    } else {
      setWhatsappData({ ...whatsappData, content_sid: templateSid })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {locale === 'tr' ? 'Mesaj Gönder' : 'Send Message'}
        </CardTitle>
        <CardDescription>
          {locale === 'tr' ? `${leadName} ile iletişime geçin` : `Contact ${leadName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sms" className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              E-posta
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Not
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sms" className="space-y-4">
            <div>
              <Label htmlFor="sms-phone">{locale === 'tr' ? 'Telefon Numarası' : 'Phone Number'}</Label>
              <Input
                id="sms-phone"
                type="tel"
                value={smsData.recipient_phone}
                onChange={(e) => setSmsData({ ...smsData, recipient_phone: e.target.value })}
                placeholder="+90 555 123 4567"
              />
            </div>

            <div>
              <Label htmlFor="sms-template">{locale === 'tr' ? 'Template Seç' : 'Select Template'}</Label>
              <Select 
                value={smsData.content_sid} 
                onValueChange={(value) => handleTemplateSelect(value, 'sms')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'tr' ? 'Template seçin (isteğe bağlı)' : 'Select template (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Template kullanma</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.sid} value={template.sid}>
                      {template.friendly_name} 
                      <Badge variant="outline" className="ml-2">
                        {template.language}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <div className="space-y-2">
                <Label>{locale === 'tr' ? 'Template Değişkenleri' : 'Template Variables'}</Label>
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <Label htmlFor={`var-${variable}`} className="text-sm">
                      {variable}
                    </Label>
                    <Input
                      id={`var-${variable}`}
                      value={templateVariables[variable] || ''}
                      onChange={(e) => setTemplateVariables({
                        ...templateVariables,
                        [variable]: e.target.value
                      })}
                      placeholder={locale === 'tr' ? `${variable} değeri` : `${variable} value`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="sms-message">{locale === 'tr' ? 'Özel Mesaj' : 'Custom Message'}</Label>
              <Textarea
                id="sms-message"
                value={smsData.custom_message}
                onChange={(e) => setSmsData({ ...smsData, custom_message: e.target.value })}
                placeholder={locale === 'tr' ? 'Template kullanmıyorsanız buraya mesajınızı yazın...' : 'Write your message here if not using a template...'}
                rows={3}
              />
            </div>

            <Button onClick={handleSendSMS} disabled={loading} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {loading ? (locale === 'tr' ? 'Gönderiliyor...' : 'Sending...') : (locale === 'tr' ? 'SMS Gönder' : 'Send SMS')}
            </Button>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div>
              <Label htmlFor="wa-phone">{locale === 'tr' ? 'Telefon Numarası' : 'Phone Number'}</Label>
              <Input
                id="wa-phone"
                type="tel"
                value={whatsappData.recipient_phone}
                onChange={(e) => setWhatsappData({ ...whatsappData, recipient_phone: e.target.value })}
                placeholder="+90 555 123 4567"
              />
            </div>

            <div>
              <Label htmlFor="wa-template">{locale === 'tr' ? 'Template Seç' : 'Select Template'}</Label>
              <Select 
                value={whatsappData.content_sid} 
                onValueChange={(value) => handleTemplateSelect(value, 'whatsapp')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'tr' ? 'Template seçin (isteğe bağlı)' : 'Select template (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Template kullanma</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.sid} value={template.sid}>
                      {template.friendly_name}
                      <Badge variant="outline" className="ml-2">
                        {template.language}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <div className="space-y-2">
                <Label>{locale === 'tr' ? 'Template Değişkenleri' : 'Template Variables'}</Label>
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <Label htmlFor={`wa-var-${variable}`} className="text-sm">
                      {variable}
                    </Label>
                    <Input
                      id={`wa-var-${variable}`}
                      value={templateVariables[variable] || ''}
                      onChange={(e) => setTemplateVariables({
                        ...templateVariables,
                        [variable]: e.target.value
                      })}
                      placeholder={locale === 'tr' ? `${variable} değeri` : `${variable} value`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="wa-message">{locale === 'tr' ? 'Özel Mesaj' : 'Custom Message'}</Label>
              <Textarea
                id="wa-message"
                value={whatsappData.custom_message}
                onChange={(e) => setWhatsappData({ ...whatsappData, custom_message: e.target.value })}
                placeholder={locale === 'tr' ? 'Template kullanmıyorsanız buraya mesajınızı yazın...' : 'Write your message here if not using a template...'}
                rows={3}
              />
            </div>

            <Button onClick={handleSendWhatsApp} disabled={loading} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {loading ? (locale === 'tr' ? 'Gönderiliyor...' : 'Sending...') : (locale === 'tr' ? 'WhatsApp Gönder' : 'Send WhatsApp')}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="email-to">{locale === 'tr' ? 'E-posta Adresi' : 'Email Address'}</Label>
              <Input
                id="email-to"
                type="email"
                value={emailData.recipient_email}
                onChange={(e) => setEmailData({ ...emailData, recipient_email: e.target.value })}
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <Label htmlFor="email-subject">{locale === 'tr' ? 'Konu' : 'Subject'}</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder={locale === 'tr' ? 'E-posta konusu' : 'Email subject'}
              />
            </div>

            <div>
              <Label htmlFor="email-content">{locale === 'tr' ? 'İçerik' : 'Content'}</Label>
              <Textarea
                id="email-content"
                value={emailData.content}
                onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                placeholder={locale === 'tr' ? 'E-posta içeriği...' : 'Email content...'}
                rows={6}
              />
            </div>

            <Button onClick={handleSendEmail} disabled={loading} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {loading ? (locale === 'tr' ? 'Gönderiliyor...' : 'Sending...') : (locale === 'tr' ? 'E-posta Gönder' : 'Send Email')}
            </Button>
          </TabsContent>

          <TabsContent value="note" className="space-y-4">
            <div>
              <Label htmlFor="note-content">{locale === 'tr' ? 'Not' : 'Note'}</Label>
              <Textarea
                id="note-content"
                value={noteData.content}
                onChange={(e) => setNoteData({ content: e.target.value })}
                placeholder={locale === 'tr' ? 'Lead hakkında not ekleyin...' : 'Add a note about the lead...'}
                rows={4}
              />
            </div>

            <Button onClick={handleAddNote} disabled={loading} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              {loading ? (locale === 'tr' ? 'Ekleniyor...' : 'Saving...') : (locale === 'tr' ? 'Not Ekle' : 'Add Note')}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}