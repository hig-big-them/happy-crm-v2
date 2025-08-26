'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Phone, Building, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WhatsAppSignupData {
  waba_id: string
  phone_number_id: string
  verified_name?: string
  display_phone_number?: string
  status?: string
  quality_rating?: string
}

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  whatsappData: WhatsAppSignupData
  onSuccess: (userData: any) => void
}

export function SignupModal({ isOpen, onClose, whatsappData, onSuccess }: SignupModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessCode: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Eğer zaten yükleniyorsa, tekrar submit etme
    if (isLoading) {
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whatsappData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Hesap Oluşturuldu!",
          description: "WhatsApp Business hesabınız başarıyla bağlandı.",
        })
        onSuccess(result.user)
        onClose()
      } else {
        toast({
          title: "Hata Oluştu",
          description: result.error || "Hesap oluşturulurken hata oluştu.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Ağ Hatası",
        description: "Sunucu ile iletişimde hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            WhatsApp Business Bağlantısı Tamamlandı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* WhatsApp Business Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                WhatsApp Business Bilgileri
              </CardTitle>
              <CardDescription>
                Meta'dan otomatik olarak alınan bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">İşletme Adı</Label>
                  <p className="text-sm text-gray-600">
                    {whatsappData.verified_name || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefon Numarası</Label>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {whatsappData.display_phone_number || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  WABA ID: {whatsappData.waba_id}
                </Badge>
                <Badge variant="outline">
                  Phone ID: {whatsappData.phone_number_id}
                </Badge>
                {whatsappData.status && (
                  <Badge variant={whatsappData.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {whatsappData.status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kullanıcı Bilgileri Formu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Hesap Bilgileri
              </CardTitle>
              <CardDescription>
                Hesabınızı tamamlamak için bilgilerinizi girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessCode">İşletme Kodu *</Label>
                  <Input
                    id="businessCode"
                    value={formData.businessCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessCode: e.target.value }))}
                    placeholder="Örn: HSC001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">İletişim Telefonu</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Oluşturuluyor..." : "Hesabı Oluştur"}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
