'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Send, Eye, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/mock-auth-client';

interface MessageTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'TRANSACTIONAL' | 'OTP';
  language: string;
  header_type?: string;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  variables: any[];
  buttons: any[];
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  meta_template_id?: string;
  meta_status?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export default function MessageTemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'TRANSACTIONAL' as const,
    language: 'tr',
    header_type: 'TEXT',
    header_text: '',
    body_text: '',
    footer_text: '',
    variables: [] as string[],
    buttons: [] as any[]
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Hata',
        description: 'Şablonlar yüklenemedi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const supabase = createClient();
      
      // Extract variables from body text ({{1}}, {{2}}, etc.)
      const variableMatches = formData.body_text.match(/\{\{(\d+)\}\}/g);
      const variables = variableMatches ? variableMatches.map(v => ({
        type: 'text',
        position: v.replace(/[{}]/g, '')
      })) : [];

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          ...formData,
          variables,
          status: 'DRAFT'
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates([data, ...templates]);
      setShowCreateDialog(false);
      resetForm();
      
      toast({
        title: 'Başarılı',
        description: 'Şablon oluşturuldu'
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Hata',
        description: 'Şablon oluşturulamadı',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitForApproval = async (templateId: string) => {
    try {
      // Here we would call Meta's API to submit the template
      // For now, we'll simulate the submission
      const response = await fetch('/api/whatsapp/templates/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      if (!response.ok) throw new Error('Submission failed');

      const supabase = createClient();
      const { error } = await supabase
        .from('message_templates')
        .update({
          status: 'PENDING',
          submitted_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      
      toast({
        title: 'Başarılı',
        description: 'Şablon onaya gönderildi'
      });
    } catch (error) {
      console.error('Error submitting template:', error);
      toast({
        title: 'Hata',
        description: 'Şablon onaya gönderilemedi',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      
      toast({
        title: 'Başarılı',
        description: 'Şablon silindi'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Hata',
        description: 'Şablon silinemedi',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'TRANSACTIONAL',
      language: 'tr',
      header_type: 'TEXT',
      header_text: '',
      body_text: '',
      footer_text: '',
      variables: [],
      buttons: []
    });
    setEditingTemplate(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Taslak</Badge>,
      PENDING: <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Onay Bekliyor</Badge>,
      APPROVED: <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>,
      REJECTED: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      MARKETING: <Badge variant="outline" className="bg-purple-50">Pazarlama</Badge>,
      TRANSACTIONAL: <Badge variant="outline" className="bg-blue-50">İşlemsel</Badge>,
      OTP: <Badge variant="outline" className="bg-green-50">OTP</Badge>
    };
    return badges[category as keyof typeof badges] || <Badge>{category}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Mesaj Şablonları</h1>
          <p className="text-muted-foreground mt-2">WhatsApp Business mesaj şablonlarını yönetin</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Şablon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Mesaj Şablonu Oluştur</DialogTitle>
              <DialogDescription>
                WhatsApp Business API için yeni bir mesaj şablonu oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Şablon Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="siparis_onay_mesaji"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Küçük harf, alt çizgi kullanın
                  </p>
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSACTIONAL">İşlemsel</SelectItem>
                      <SelectItem value="MARKETING">Pazarlama</SelectItem>
                      <SelectItem value="OTP">OTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="header_text">Başlık Metni (Opsiyonel)</Label>
                <Input
                  id="header_text"
                  value={formData.header_text}
                  onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                  placeholder="Siparişiniz Onaylandı!"
                />
              </div>

              <div>
                <Label htmlFor="body_text">Mesaj Metni</Label>
                <Textarea
                  id="body_text"
                  value={formData.body_text}
                  onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                  placeholder="Merhaba {{1}}, {{2}} numaralı siparişiniz onaylandı. Kargo takip numaranız: {{3}}"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Değişkenler için {"{{1}}"}, {"{{2}}"} formatını kullanın
                </p>
              </div>

              <div>
                <Label htmlFor="footer_text">Alt Bilgi (Opsiyonel)</Label>
                <Input
                  id="footer_text"
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  placeholder="Happy CRM - Müşteri Hizmetleri"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateTemplate}>
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Şablonlar</CardTitle>
          <CardDescription>
            Oluşturduğunuz ve Meta tarafından onaylanan şablonlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz şablon oluşturulmamış
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Şablon Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Dil</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{getCategoryBadge(template.category)}</TableCell>
                    <TableCell>{getStatusBadge(template.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {template.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSubmitForApproval(template.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}