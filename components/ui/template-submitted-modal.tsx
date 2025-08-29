/**
 * 🎉 Template Submitted Modal
 * 
 * Template onaya gönderildiğinde gösterilecek bilgi modal'ı
 */

"use client";

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { useI18n } from '@/lib/i18n/client';

interface TemplateSubmittedModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
}

export function TemplateSubmittedModal({
  isOpen,
  onClose,
  templateName
}: TemplateSubmittedModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            {t.common?.notifications?.templateSubmittedModalTitle || 'Template Başarıyla Gönderildi! 🎉'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            {t.common?.notifications?.templateSubmittedModalDesc 
              ? t.common.notifications.templateSubmittedModalDesc(templateName)
              : `"${templateName}" template'iniz Meta WhatsApp Business API'ye onay için gönderildi. Onay süreci genellikle 24-48 saat sürer. Sonuç bildirim olarak size ulaşacaktır.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              🔔
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {t.common?.notifications?.templateSubmittedInfo || 'Template Onaya Gönderildi'}
              </h4>
              <p className="text-xs text-blue-700">
                {t.common?.notifications?.templateSubmittedInfoDesc || 'Template\'iniz onaya gönderildi, onay durumu bildirim olarak gönderilecektir'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">
            {t.common?.notifications?.templateSubmittedModalButton || 'Tamam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
