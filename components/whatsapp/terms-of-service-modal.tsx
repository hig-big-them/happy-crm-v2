'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { Separator } from '@/components/ui/separator';
import { FileText, ExternalLink, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TermsOfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

// Static translations
const translations = {
  tr: {
    title: "Hizmet Şartları ve Gizlilik Politikası",
    description: "WhatsApp Business entegrasyonunu kullanmadan önce aşağıdaki şartları okuyup kabul etmeniz gerekmektedir.",
    happyCrmTerms: {
      title: "Happy CRM Hizmet Şartları",
      serviceUsage: "Hizmet Kullanımı: Happy CRM platformunu kullanarak müşteri ilişkileri yönetimi ve WhatsApp mesajlaşma hizmetlerinden faydalanabilirsiniz.",
      dataSecurity: "Veri Güvenliği: Tüm müşteri verileri şifrelenmiş olarak saklanır ve üçüncü taraflarla paylaşılmaz.",
      usageResponsibilities: "Kullanım Sorumlulukları: Platform üzerinden gönderilen mesajların içeriğinden kullanıcı sorumludur.",
      serviceInterruptions: "Hizmet Kesintileri: Bakım ve güncelleme çalışmaları sırasında geçici hizmet kesintileri yaşanabilir.",
      checkbox: "Happy CRM Hizmet Şartlarını okudum ve kabul ediyorum"
    },
    privacyPolicy: {
      title: "Gizlilik Politikası",
      dataCollection: "Veri Toplama: Hizmet kalitesini artırmak için kullanım istatistikleri ve mesaj meta verileri toplanır.",
      dataStorage: "Veri Saklama: Kişisel veriler yalnızca hizmet süresi boyunca saklanır ve gerekli güvenlik önlemleri alınır.",
      thirdPartySharing: "Üçüncü Taraf Paylaşımı: Verileriniz yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.",
      dataRights: "Veri Hakları: Verilerinize erişim, düzeltme ve silme haklarınız bulunmaktadır.",
      checkbox: "Gizlilik Politikasını okudum ve kabul ediyorum"
    },
    whatsappTerms: {
      title: "WhatsApp Business API Şartları",
      whatsappPolicies: "WhatsApp Politikaları: WhatsApp Business API kullanımı Meta'nın ticari politikalarına tabidir.",
      messageLimits: "Mesaj Limitleri: WhatsApp tarafından belirlenen günlük mesaj limitleri geçerlidir.",
      contentRules: "İçerik Kuralları: Spam, yanıltıcı veya zararlı içerik gönderilmesi yasaktır.",
      accountSuspension: "Hesap Askıya Alma: Kurallara aykırı kullanım durumunda WhatsApp hesabınız askıya alınabilir.",
      checkbox: "WhatsApp Business API şartlarını okudum ve kabul ediyorum",
      viewPolicy: "WhatsApp Business Politikasını görüntüle"
    },
    importantNotice: {
      title: "⚠️ Önemli Uyarı",
      content: "WhatsApp Business entegrasyonu aktif olduktan sonra, müşterilerinizle olan tüm iletişimler WhatsApp'ın ticari mesajlaşma politikalarına tabi olacaktır. Müşteri onayı olmadan mesaj gönderilmesi hesabınızın askıya alınmasına neden olabilir."
    },
    buttons: {
      decline: "Reddet",
      accept: "Kabul Et ve Devam Et",
      pleaseRead: "Lütfen tüm şartları okuyun"
    }
  },
  en: {
    title: "Terms of Service and Privacy Policy",
    description: "Before using WhatsApp Business integration, you must read and accept the following terms.",
    happyCrmTerms: {
      title: "Happy CRM Terms of Service",
      serviceUsage: "Service Usage: You can benefit from customer relationship management and WhatsApp messaging services by using the Happy CRM platform.",
      dataSecurity: "Data Security: All customer data is stored encrypted and not shared with third parties.",
      usageResponsibilities: "Usage Responsibilities: The user is responsible for the content of messages sent through the platform.",
      serviceInterruptions: "Service Interruptions: Temporary service interruptions may occur during maintenance and update work.",
      checkbox: "I have read and accept the Happy CRM Terms of Service"
    },
    privacyPolicy: {
      title: "Privacy Policy",
      dataCollection: "Data Collection: Usage statistics and message metadata are collected to improve service quality.",
      dataStorage: "Data Storage: Personal data is stored only during the service period and necessary security measures are taken.",
      thirdPartySharing: "Third Party Sharing: Your data is not shared with third parties except for legal obligations.",
      dataRights: "Data Rights: You have the right to access, correct and delete your data.",
      checkbox: "I have read and accept the Privacy Policy"
    },
    whatsappTerms: {
      title: "WhatsApp Business API Terms",
      whatsappPolicies: "WhatsApp Policies: WhatsApp Business API usage is subject to Meta's commercial policies.",
      messageLimits: "Message Limits: Daily message limits set by WhatsApp apply.",
      contentRules: "Content Rules: Sending spam, misleading or harmful content is prohibited.",
      accountSuspension: "Account Suspension: Your WhatsApp account may be suspended in case of violation of rules.",
      checkbox: "I have read and accept the WhatsApp Business API terms",
      viewPolicy: "View WhatsApp Business Policy"
    },
    importantNotice: {
      title: "⚠️ Important Notice",
      content: "After WhatsApp Business integration is activated, all communications with your customers will be subject to WhatsApp's commercial messaging policies. Sending messages without customer consent may result in your account being suspended."
    },
    buttons: {
      decline: "Decline",
      accept: "Accept and Continue",
      pleaseRead: "Please read all terms"
    }
  }
};

export function TermsOfServiceModal({
  open,
  onOpenChange,
  onAccept,
  onDecline
}: TermsOfServiceModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [hasReadWhatsAppTerms, setHasReadWhatsAppTerms] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<'tr' | 'en'>('tr');

  const t = translations[currentLocale];
  const canAccept = hasReadTerms && hasReadPrivacy && hasReadWhatsAppTerms;

  const handleAccept = () => {
    if (canAccept) {
      onAccept();
      // Reset state for next time
      setHasReadTerms(false);
      setHasReadPrivacy(false);
      setHasReadWhatsAppTerms(false);
    }
  };

  const handleDecline = () => {
    onDecline();
    // Reset state
    setHasReadTerms(false);
    setHasReadPrivacy(false);
    setHasReadWhatsAppTerms(false);
  };

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale as 'tr' | 'en');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="whatsapp-modal max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] flex flex-col overflow-hidden relative mx-auto my-auto">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              {t.title}
            </DialogTitle>
            <Select value={currentLocale} onValueChange={handleLocaleChange}>
              <SelectTrigger className="w-24 sm:w-32 text-xs">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <div className="space-y-3 sm:space-y-4 p-2 sm:p-3 text-xs sm:text-sm">
            {/* Happy CRM Terms of Service */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{t.happyCrmTerms.title}</h3>
              <div className="text-xs text-gray-700 space-y-1 bg-gray-50 p-3 rounded-lg">
                <p>
                  <strong>1.</strong> {t.happyCrmTerms.serviceUsage}
                </p>
                <p>
                  <strong>2.</strong> {t.happyCrmTerms.dataSecurity}
                </p>
                <p>
                  <strong>3.</strong> {t.happyCrmTerms.usageResponsibilities}
                </p>
                <p>
                  <strong>4.</strong> {t.happyCrmTerms.serviceInterruptions}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="terms" 
                  checked={hasReadTerms}
                  onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t.happyCrmTerms.checkbox}
                </label>
              </div>
            </div>

            <Separator />

            {/* Privacy Policy */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{t.privacyPolicy.title}</h3>
              <div className="text-xs text-gray-700 space-y-1 bg-gray-50 p-3 rounded-lg">
                <p>
                  <strong>1.</strong> {t.privacyPolicy.dataCollection}
                </p>
                <p>
                  <strong>2.</strong> {t.privacyPolicy.dataStorage}
                </p>
                <p>
                  <strong>3.</strong> {t.privacyPolicy.thirdPartySharing}
                </p>
                <p>
                  <strong>4.</strong> {t.privacyPolicy.dataRights}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="privacy" 
                  checked={hasReadPrivacy}
                  onCheckedChange={(checked) => setHasReadPrivacy(checked as boolean)}
                />
                <label htmlFor="privacy" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t.privacyPolicy.checkbox}
                </label>
              </div>
            </div>

            <Separator />

            {/* WhatsApp Business Terms */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{t.whatsappTerms.title}</h3>
              <div className="text-xs text-gray-700 space-y-1 bg-blue-50 p-3 rounded-lg">
                <p>
                  <strong>1.</strong> {t.whatsappTerms.whatsappPolicies}
                </p>
                <p>
                  <strong>2.</strong> {t.whatsappTerms.messageLimits}
                </p>
                <p>
                  <strong>3.</strong> {t.whatsappTerms.contentRules}
                </p>
                <p>
                  <strong>4.</strong> {t.whatsappTerms.accountSuspension}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox 
                    id="whatsapp-terms" 
                    checked={hasReadWhatsAppTerms}
                    onCheckedChange={(checked) => setHasReadWhatsAppTerms(checked as boolean)}
                  />
                  <label htmlFor="whatsapp-terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t.whatsappTerms.checkbox}
                  </label>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <ExternalLink className="h-3 w-3" />
                  <a 
                    href="https://www.whatsapp.com/legal/business-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {t.whatsappTerms.viewPolicy}
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="font-semibold text-amber-800 mb-1 text-sm">{t.importantNotice.title}</h4>
              <p className="text-xs text-amber-700">
                {t.importantNotice.content}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 pt-3 border-t">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            {t.buttons.decline}
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!canAccept}
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            {canAccept ? t.buttons.accept : 
              `${t.buttons.pleaseRead} (${[hasReadTerms, hasReadPrivacy, hasReadWhatsAppTerms].filter(Boolean).length}/3)`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
