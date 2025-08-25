'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { createLead } from '@/lib/actions/lead-actions'
import { getPipelines } from '@/lib/actions/pipeline-actions'
import { Pipeline, CreateLeadInput } from '@/lib/actions/pipeline-types'
import { createClient } from '@/lib/utils/supabase/client'
import { useI18n } from '@/lib/i18n/client'
import { WhatsAppConsent, ConsentState } from '@/components/consent/whatsapp-consent'

export default function NewLeadPage() {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [loading, setLoading] = useState(false)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [consents, setConsents] = useState<ConsentState>({
    whatsapp_transactional: false,
    whatsapp_marketing: false
  })
  const [formData, setFormData] = useState<CreateLeadInput>({
    lead_name: '',
    company_id: 'none',
    contact_email: '',
    contact_phone: '',
    stage_id: '',
    pipeline_id: '',
    follow_up_date: '',
    lead_value: 0,
    source: 'other',
    priority: 'medium',
    description: '',
    assigned_user_id: 'unassigned'
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.pipeline_id) {
      const pipeline = pipelines.find(p => p.id === formData.pipeline_id)
      if (pipeline && pipeline.stages && pipeline.stages.length > 0) {
        setFormData(prev => ({ ...prev, stage_id: pipeline.stages![0].id }))
      }
    }
  }, [formData.pipeline_id, pipelines])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      const [pipelinesData, usersResponse, companiesResponse] = await Promise.all([
        getPipelines(),
        supabase.from('user_profiles').select('id, full_name, email').order('full_name'),
        supabase.from('companies').select('id, company_name').eq('is_active', true).order('company_name')
      ])

      setPipelines(pipelinesData)
      setUsers(usersResponse.data || [])
      setCompanies(companiesResponse.data || [])
    } catch (error) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Veriler yüklenirken hata oluştu' : 'Failed to load data',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.lead_name || !formData.pipeline_id || !formData.stage_id) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Lütfen zorunlu alanları doldurun' : 'Please fill in the required fields',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const result = await createLead({
        ...formData,
        lead_value: formData.lead_value || undefined,
        company_id: formData.company_id === 'none' ? undefined : formData.company_id || undefined,
        assigned_user_id: formData.assigned_user_id === 'unassigned' ? undefined : formData.assigned_user_id || undefined,
        follow_up_date: formData.follow_up_date || undefined
      })
      
      if (result?.data) {
        // Record consent if phone number is provided and consent is given
        if (formData.contact_phone && (consents.whatsapp_transactional || consents.whatsapp_marketing)) {
          try {
            await fetch('/api/consent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: result.data.id,
                consents: consents,
                ip_address: null, // Will be captured from request headers
                user_agent: navigator.userAgent
              })
            })
          } catch (consentError) {
            console.error('Failed to record consent:', consentError)
          }
        }
        
        toast({
          title: locale === 'tr' ? 'Başarılı' : 'Success',
          description: locale === 'tr' ? 'Lead oluşturuldu' : 'Lead created'
        })
        router.push('/leads')
      }
    } catch (error) {
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Lead oluşturulurken hata oluştu' : 'Failed to create lead',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedPipeline = pipelines.find(p => p.id === formData.pipeline_id)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {locale === 'tr' ? 'Geri' : 'Back'}
        </Button>
        
        <h1 className="text-3xl font-bold">{t.leads?.dialog.createTitle || (locale === 'tr' ? 'Yeni Lead Oluştur' : 'Create New Lead')}</h1>
        <p className="text-muted-foreground mt-2">{locale === 'tr' ? 'Yeni bir müşteri adayı ekleyin' : 'Add a new lead'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Temel Bilgiler' : 'Basic Information'}</CardTitle>
              <CardDescription>{locale === 'tr' ? "Lead'in temel bilgilerini girin" : 'Enter basic lead information'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lead_name">{t.leads?.dialog.leadName || (locale === 'tr' ? 'Lead Adı *' : 'Lead Name *')}</Label>
                <Input
                  id="lead_name"
                  value={formData.lead_name}
                  onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                  placeholder={locale === 'tr' ? 'Örn: Acme Corp - Yazılım Projesi' : 'e.g., Acme Corp - CRM Project'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company_id">{t.leads?.dialog.company || (locale === 'tr' ? 'Şirket' : 'Company')}</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.leads?.dialog.companySelect || (locale === 'tr' ? 'Şirket seçin' : 'Select a company')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{locale === 'tr' ? 'Yok' : 'None'}</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pipeline_id">{locale === 'tr' ? 'Pipeline (Şehir) *' : 'Pipeline (City) *'}</Label>
                  <Select value={formData.pipeline_id} onValueChange={(value) => setFormData({ ...formData, pipeline_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.leads?.filters.pipeline || 'Pipeline'} />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.map((pipeline) => (
                        <SelectItem key={pipeline.id} value={pipeline.id}>
                          {pipeline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stage_id">{locale === 'tr' ? 'Stage *' : 'Stage *'}</Label>
                  <Select 
                    value={formData.stage_id} 
                    onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
                    disabled={!formData.pipeline_id}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder={locale === 'tr' ? 'Stage seçin' : 'Select a stage'} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPipeline?.stages?.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="lead_value">{locale === 'tr' ? 'Tahmini Değer (₺)' : 'Estimated Value (₺)'}</Label>
                <Input
                  id="lead_value"
                  type="number"
                  value={formData.lead_value || ''}
                  onChange={(e) => setFormData({ ...formData, lead_value: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="description">{locale === 'tr' ? 'Açıklama' : 'Description'}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Lead hakkında notlar..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'İletişim ve Takip' : 'Contact & Follow-up'}</CardTitle>
              <CardDescription>{locale === 'tr' ? 'İletişim bilgileri ve takip detayları' : 'Contact details and follow-up info'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_email">{locale === 'tr' ? 'İletişim Email' : 'Contact Email'}</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">{locale === 'tr' ? 'İletişim Telefon' : 'Contact Phone'}</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+90 555 123 4567"
                />
              </div>

              {/* WhatsApp Consent - Only show if phone number is provided */}
              {formData.contact_phone && (
                <WhatsAppConsent
                  onConsentChange={setConsents}
                  defaultConsents={consents}
                  showDetails={true}
                />
              )}

              <div>
                <Label htmlFor="assigned_user_id">{locale === 'tr' ? 'Atanan Kullanıcı' : 'Assigned User'}</Label>
                <Select value={formData.assigned_user_id} onValueChange={(value) => setFormData({ ...formData, assigned_user_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'tr' ? 'Kullanıcı seçin' : 'Select a user'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">{locale === 'tr' ? 'Atanmamış' : 'Unassigned'}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="follow_up_date">{locale === 'tr' ? 'Takip Tarihi' : 'Follow-up Date'}</Label>
                <Input
                  id="follow_up_date"
                  type="datetime-local"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="urgent">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="source">Kaynak</Label>
                  <Select value={formData.source} onValueChange={(value: any) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="phone">Telefon</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social">Sosyal Medya</SelectItem>
                      <SelectItem value="referral">Referans</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (locale === 'tr' ? 'Oluşturuluyor...' : 'Creating...') : (t.leads?.dialog.createTitle || (locale === 'tr' ? 'Lead Oluştur' : 'Create Lead'))}
          </Button>
        </div>
      </form>
    </div>
  )
}