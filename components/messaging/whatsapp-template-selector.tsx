/**
 * WhatsApp Template Selector Component
 * 
 * Allows selection and configuration of WhatsApp templates with variables
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { TwilioContentTemplate } from '@/lib/actions/message-types';

interface WhatsAppTemplateSelectorProps {
  onTemplateSelect: (templateSid: string, variables: Record<string, string>) => void;
  recipientName?: string;
  recipientPhone?: string;
  disabled?: boolean;
}

// Mock templates - in real implementation, these would come from Twilio API
const mockTemplates: TwilioContentTemplate[] = [
  {
    sid: 'HX1234567890abcdef1234567890abcdef',
    friendly_name: 'welcome_message',
    language: 'tr',
    variables: ['customer_name', 'company_name'],
    types: {
      'twilio/text': {
        body: 'Merhaba {{customer_name}}, {{company_name}} ailesine hoş geldiniz! Size nasıl yardımcı olabiliriz?'
      }
    }
  },
  {
    sid: 'HX2234567890abcdef1234567890abcdef',
    friendly_name: 'appointment_reminder',
    language: 'tr',
    variables: ['customer_name', 'appointment_date', 'appointment_time'],
    types: {
      'twilio/text': {
        body: 'Sayın {{customer_name}}, {{appointment_date}} tarihinde saat {{appointment_time}} randevunuzu hatırlatmak isteriz.'
      }
    }
  },
  {
    sid: 'HX3234567890abcdef1234567890abcdef',
    friendly_name: 'quote_ready',
    language: 'tr',
    variables: ['customer_name', 'quote_amount'],
    types: {
      'twilio/text': {
        body: 'Merhaba {{customer_name}}, talebiniz doğrultusunda hazırladığımız {{quote_amount}} TL tutarındaki teklifimizi inceleyebilirsiniz.'
      }
    }
  },
  {
    sid: 'HX4234567890abcdef1234567890abcdef',
    friendly_name: 'payment_reminder',
    language: 'tr',
    variables: ['customer_name', 'amount', 'due_date'],
    types: {
      'twilio/text': {
        body: 'Sayın {{customer_name}}, {{amount}} TL tutarındaki ödemenizin son tarihi {{due_date}} dir. Ödeme için destek alabilirsiniz.'
      }
    }
  }
];

export function WhatsAppTemplateSelector({ 
  onTemplateSelect, 
  recipientName = '',
  recipientPhone = '',
  disabled = false 
}: WhatsAppTemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TwilioContentTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewText, setPreviewText] = useState('');
  const [templates, setTemplates] = useState<TwilioContentTemplate[]>(mockTemplates);
  const [loading, setLoading] = useState(false);

  // Load templates from API in real implementation
  useEffect(() => {
    // loadTemplatesFromTwilio();
  }, []);

  // Update preview when template or variables change
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.types['twilio/text']) {
      let preview = selectedTemplate.types['twilio/text'].body;
      
      // Replace variables in preview
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        preview = preview.replace(regex, value || `{{${key}}}`);
      });
      
      setPreviewText(preview);
    }
  }, [selectedTemplate, variables]);

  // Set default variables when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const defaultVars: Record<string, string> = {};
      
      selectedTemplate.variables?.forEach(varName => {
        switch (varName) {
          case 'customer_name':
            defaultVars[varName] = recipientName || '';
            break;
          case 'company_name':
            defaultVars[varName] = 'Happy CRM';
            break;
          case 'appointment_date':
            defaultVars[varName] = new Date().toLocaleDateString('tr-TR');
            break;
          case 'appointment_time':
            defaultVars[varName] = '14:00';
            break;
          case 'quote_amount':
            defaultVars[varName] = '5.000';
            break;
          case 'amount':
            defaultVars[varName] = '1.500';
            break;
          case 'due_date':
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            defaultVars[varName] = nextWeek.toLocaleDateString('tr-TR');
            break;
          default:
            defaultVars[varName] = '';
        }
      });
      
      setVariables(defaultVars);
    }
  }, [selectedTemplate, recipientName]);

  const handleTemplateSelect = (template: TwilioContentTemplate) => {
    setSelectedTemplate(template);
  };

  const handleVariableChange = (varName: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value
    }));
  };

  const handleSendTemplate = () => {
    if (!selectedTemplate) return;
    
    // Validate all variables are filled
    const missingVars = selectedTemplate.variables?.filter(varName => !variables[varName]?.trim()) || [];
    
    if (missingVars.length > 0) {
      alert(`Lütfen şu değişkenleri doldurun: ${missingVars.join(', ')}`);
      return;
    }
    
    onTemplateSelect(selectedTemplate.sid, variables);
    
    // Reset and close
    setSelectedTemplate(null);
    setVariables({});
    setIsOpen(false);
  };

  const formatTemplateName = (friendlyName: string) => {
    return friendlyName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Template Seç
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>WhatsApp Template Seç</DialogTitle>
          <DialogDescription>
            Müşteriye göndermek istediğiniz template'i seçin ve değişkenleri doldurun
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Template List */}
          <div>
            <h3 className="text-sm font-medium mb-3">Mevcut Template'ler</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card 
                    key={template.sid}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate?.sid === template.sid 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          {formatTemplateName(template.friendly_name)}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {template.language}
                        </Badge>
                      </div>
                      
                      {template.types['twilio/text'] && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {template.types['twilio/text'].body.substring(0, 100)}...
                        </p>
                      )}
                      
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.variables.map((varName) => (
                            <Badge key={varName} variant="secondary" className="text-xs">
                              {varName}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Template Configuration */}
          <div>
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Template Yapılandırması</h3>
                  <p className="text-xs text-gray-600">
                    {formatTemplateName(selectedTemplate.friendly_name)}
                  </p>
                </div>
                
                {/* Variables Input */}
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Değişkenler</h4>
                    <div className="space-y-3">
                      {selectedTemplate.variables.map((varName) => (
                        <div key={varName}>
                          <Label htmlFor={varName} className="text-xs">
                            {varName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={varName}
                            value={variables[varName] || ''}
                            onChange={(e) => handleVariableChange(varName, e.target.value)}
                            placeholder={`${varName} değerini girin...`}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Preview */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Önizleme</h4>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">WhatsApp Business</p>
                          <div className="bg-gray-100 rounded-lg p-2">
                            <p className="text-sm whitespace-pre-wrap">{previewText}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {recipientPhone && `Alıcı: ${recipientPhone}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Button 
                  onClick={handleSendTemplate}
                  className="w-full"
                  disabled={!selectedTemplate || (selectedTemplate.variables?.some(v => !variables[v]?.trim()))}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Template Gönder
                </Button>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Soldan bir template seçin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WhatsAppTemplateSelector;