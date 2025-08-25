'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WhatsAppConsentProps {
  onConsentChange: (consents: ConsentState) => void;
  defaultConsents?: ConsentState;
  required?: boolean;
  showDetails?: boolean;
}

export interface ConsentState {
  whatsapp_transactional: boolean;
  whatsapp_marketing: boolean;
}

export function WhatsAppConsent({
  onConsentChange,
  defaultConsents = { whatsapp_transactional: false, whatsapp_marketing: false },
  required = false,
  showDetails = true
}: WhatsAppConsentProps) {
  const [consents, setConsents] = useState<ConsentState>(defaultConsents);

  const handleConsentChange = (type: keyof ConsentState, checked: boolean) => {
    const newConsents = { ...consents, [type]: checked };
    setConsents(newConsents);
    onConsentChange(newConsents);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">WhatsApp İletişim Tercihleri</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>WhatsApp Business üzerinden size mesaj gönderebilmemiz için açık onayınız gerekmektedir.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-3">
        {/* Transactional Messages Consent */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="whatsapp_transactional"
            checked={consents.whatsapp_transactional}
            onCheckedChange={(checked) => 
              handleConsentChange('whatsapp_transactional', checked as boolean)
            }
          />
          <div className="space-y-1">
            <Label 
              htmlFor="whatsapp_transactional" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              İşlemsel Mesajlar
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {showDetails && (
              <p className="text-sm text-muted-foreground">
                Sipariş onayı, kargo takibi, randevu hatırlatması gibi hizmetlerimizle ilgili 
                önemli güncellemeleri WhatsApp üzerinden almayı kabul ediyorum. Bu mesajlar 
                sadece satın aldığınız veya kayıt olduğunuz hizmetlerle ilgili bilgilendirme 
                amaçlı gönderilecektir.
              </p>
            )}
          </div>
        </div>

        {/* Marketing Messages Consent */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="whatsapp_marketing"
            checked={consents.whatsapp_marketing}
            onCheckedChange={(checked) => 
              handleConsentChange('whatsapp_marketing', checked as boolean)
            }
          />
          <div className="space-y-1">
            <Label 
              htmlFor="whatsapp_marketing" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pazarlama ve Promosyon Mesajları
            </Label>
            {showDetails && (
              <p className="text-sm text-muted-foreground">
                Kampanyalar, indirimler, yeni ürün/hizmetler ve özel teklifler hakkında 
                WhatsApp üzerinden bilgilendirme almayı kabul ediyorum. Bu onayı istediğiniz 
                zaman "DURDUR" yazarak iptal edebilirsiniz.
              </p>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Gizlilik Notu:</strong> Kişisel verileriniz, KVKK ve GDPR kapsamında korunmaktadır. 
            WhatsApp üzerinden gönderilen mesajlar uçtan uca şifrelidir. Telefon numaranız üçüncü 
            taraflarla paylaşılmayacaktır. Daha fazla bilgi için{' '}
            <a href="/privacy" className="underline text-blue-600 dark:text-blue-400">
              Gizlilik Politikamızı
            </a>{' '}
            inceleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}