/**
 * 🔄 Template Status Listener Hook
 * 
 * Template onay durumu değişikliklerini dinler ve bildirim gönderir
 */

"use client";

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/lib/stores/notification-store';

interface Template {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface UseTemplateStatusListenerProps {
  templates: Template[];
  onStatusChange?: (templateId: string, newStatus: Template['status']) => void;
}

export function useTemplateStatusListener({ 
  templates, 
  onStatusChange 
}: UseTemplateStatusListenerProps) {
  const { addTemplateApprovalNotification } = useNotificationStore();
  const previousTemplatesRef = useRef<Template[]>([]);

  useEffect(() => {
    const previousTemplates = previousTemplatesRef.current;
    
    // İlk render'da previous templates'i set et
    if (previousTemplates.length === 0) {
      previousTemplatesRef.current = templates;
      return;
    }

    // Status değişikliklerini kontrol et
    templates.forEach((currentTemplate) => {
      const previousTemplate = previousTemplates.find(t => t.id === currentTemplate.id);
      
      if (previousTemplate && previousTemplate.status !== currentTemplate.status) {
        console.log(`🔄 Template status changed: ${currentTemplate.name} (${previousTemplate.status} → ${currentTemplate.status})`);
        
        // Onay durumu değişikliği bildirimini gönder
        if (currentTemplate.status === 'approved' || currentTemplate.status === 'rejected') {
          addTemplateApprovalNotification(
            currentTemplate.id,
            currentTemplate.name,
            currentTemplate.status
          );
        }
        
        // Callback'i çağır
        onStatusChange?.(currentTemplate.id, currentTemplate.status);
      }
    });

    // Current templates'i previous olarak kaydet
    previousTemplatesRef.current = templates;
  }, [templates, addTemplateApprovalNotification, onStatusChange]);
}

// Demo amaçlı template status simülasyonu
export function useTemplateStatusSimulator() {
  const simulateApproval = (templateId: string, templateName: string) => {
    const { addTemplateApprovalNotification } = useNotificationStore();
    
    // 3 saniye sonra onaylı olarak işaretle (demo)
    setTimeout(() => {
      addTemplateApprovalNotification(templateId, templateName, 'approved');
    }, 3000);
  };

  const simulateRejection = (templateId: string, templateName: string) => {
    const { addTemplateApprovalNotification } = useNotificationStore();
    
    // 3 saniye sonra reddedildi olarak işaretle (demo)
    setTimeout(() => {
      addTemplateApprovalNotification(templateId, templateName, 'rejected');
    }, 3000);
  };

  return {
    simulateApproval,
    simulateRejection
  };
}
