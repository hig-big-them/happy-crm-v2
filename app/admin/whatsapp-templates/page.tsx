/**
 * 📱 Admin - WhatsApp Template Yönetimi
 * 
 * WhatsApp Cloud API template'leri oluştur, düzenle ve yönet
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Download,
  Upload,
  MessageSquare,
  Settings,
  Globe,
  Filter,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/mock-auth-client';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import TemplateBuilder from '@/components/messaging/template-builder';
import { createWhatsAppService } from '@/lib/services/whatsapp-cloud-service';
import { createMetaTemplateService } from '@/lib/services/meta-whatsapp-template-service';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useI18n } from '@/lib/i18n/client';

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  variables?: any[];
  buttons?: any[];
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_reason?: string;
  usage_count?: number;
  delivery_rate?: number;
  read_rate?: number;
  click_rate?: number;
  cost_per_message?: number;
}

export default function WhatsAppTemplatesPage() {
  const router = useRouter();
  const supabase = createClient();
  const whatsappService = createWhatsAppService();
  const { t, locale } = useI18n();
  
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [stats, setStats] = useState({
    total_templates: 0,
    approved_templates: 0,
    pending_templates: 0,
    total_sent: 0,
    avg_delivery_rate: 0,
    avg_read_rate: 0
  });

  useEffect(() => {
    loadTemplates();
    loadStats();
  }, [statusFilter, categoryFilter]);

    const loadTemplates = async () => {
    try {
      setLoading(true);
      
      console.log('📋 Loading templates from database...');
      
      // Database'den template'leri çek
      let query = supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtreleri uygula
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('✅ Templates loaded from database:', data?.length || 0);
      
      // Meta API'den güncel status'ları al ve senkronize et
      if (data && data.length > 0) {
        await syncTemplateStatuses(data);
      }
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: t.admin?.whatsappTemplates?.toasts.loadError,
        description: t.admin?.whatsappTemplates?.toasts.loadErrorDesc,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Meta API'den template status'larını senkronize et
  const syncTemplateStatuses = async (localTemplates: WhatsAppTemplate[]) => {
    try {
      console.log('🔄 Syncing template statuses from Meta API...');
      
      const metaService = createMetaTemplateService();
      const metaResult = await metaService.getTemplates();
      
      if (metaResult.success && metaResult.data) {
        console.log('📥 Meta API templates:', metaResult.data.length);
        
        // Her local template için Meta API'den status kontrol et
        for (const localTemplate of localTemplates) {
          const metaTemplate = metaResult.data.find(mt => mt.name === localTemplate.name);
          
          if (metaTemplate && metaTemplate.status !== localTemplate.status) {
            console.log(`🔄 Updating ${localTemplate.name}: ${localTemplate.status} → ${metaTemplate.status}`);
            
            // Database'de status'u güncelle
            const { error } = await supabase
              .from('message_templates')
              .update({ 
                status: metaTemplate.status,
                updated_at: new Date().toISOString()
              })
              .eq('id', localTemplate.id);
              
            if (error) {
              console.error(`❌ Error updating ${localTemplate.name}:`, error);
            } else {
              console.log(`✅ Updated ${localTemplate.name} status to ${metaTemplate.status}`);
            }
          }
        }
        
        // Stats'ı yeniden yükle
        loadStats();
      }
    } catch (error) {
      console.error('❌ Error syncing template statuses:', error);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading stats from database...');
      
             // Database'den stats çek
       const { data: templates, error } = await supabase
         .from('message_templates')
         .select('status');

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Stats hesapla
      const totalTemplates = templates?.length || 0;
      const approvedTemplates = templates?.filter(t => t.status === 'APPROVED').length || 0;
      const pendingTemplates = templates?.filter(t => t.status === 'PENDING').length || 0;
      const draftTemplates = templates?.filter(t => t.status === 'DRAFT').length || 0;

      console.log('✅ Stats calculated:', { totalTemplates, approvedTemplates, pendingTemplates, draftTemplates });

             setStats({
         total_templates: totalTemplates,
         approved_templates: approvedTemplates,
         pending_templates: pendingTemplates,
         total_sent: 239, // Mock data
         avg_delivery_rate: 0.935, // Mock data
         avg_read_rate: 0.815 // Mock data
       });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteTemplate = async (template: WhatsAppTemplate) => {
    if (!confirm(t.admin?.whatsappTemplates?.confirmDelete(template.name) || `Are you sure you want to delete "${template.name}" template?`)) return;

    try {
             const { error } = await supabase
         .from('message_templates')
         .delete()
         .eq('id', template.id);

      if (error) throw error;

      toast({
        title: t.admin?.whatsappTemplates?.toasts.templateDeleted,
        description: t.admin?.whatsappTemplates?.toasts.templateDeletedDesc,
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: t.admin?.whatsappTemplates?.toasts.deleteError,
        description: t.admin?.whatsappTemplates?.toasts.deleteErrorDesc,
        variant: "destructive"
      });
    }
  };

  const handleSubmitForApproval = async (template: WhatsAppTemplate) => {
    try {
      // WhatsApp API'ye gönder
      const result = await whatsappService.submitTemplate({
        name: template.name,
        category: template.category,
        language: template.language,
        components: template.components
      });

             // Database'de durumu güncelle
       const { error } = await supabase
         .from('message_templates')
         .update({ 
           status: 'PENDING',
           submitted_at: new Date().toISOString()
         })
         .eq('id', template.id);

      if (error) throw error;

      toast({
        title: t.admin?.whatsappTemplates?.toasts.templateSubmitted,
        description: t.admin?.whatsappTemplates?.toasts.templateSubmittedDesc,
      });

      loadTemplates();
    } catch (error) {
      console.error('Error submitting template:', error);
      toast({
        title: t.admin?.whatsappTemplates?.toasts.submitError,
        description: t.admin?.whatsappTemplates?.toasts.submitErrorDesc,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      DRAFT: { variant: 'secondary' as const, label: t.admin?.whatsappTemplates?.status.draft || 'Draft', icon: Edit },
      PENDING: { variant: 'default' as const, label: t.admin?.whatsappTemplates?.status.pending || 'Pending', icon: Clock },
      APPROVED: { variant: 'success' as const, label: t.admin?.whatsappTemplates?.status.approved || 'Approved', icon: CheckCircle },
      REJECTED: { variant: 'destructive' as const, label: t.admin?.whatsappTemplates?.status.rejected || 'Rejected', icon: XCircle },
      DISABLED: { variant: 'outline' as const, label: t.admin?.whatsappTemplates?.status.disabled || 'Disabled', icon: AlertCircle }
    };

    const { variant, label, icon: Icon } = config[status as keyof typeof config] || config.DRAFT;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const config = {
      MARKETING: { color: 'bg-blue-500', label: t.admin?.whatsappTemplates?.categories.marketing || 'Marketing' },
      UTILITY: { color: 'bg-green-500', label: t.admin?.whatsappTemplates?.categories.utility || 'Utility' },
      AUTHENTICATION: { color: 'bg-purple-500', label: t.admin?.whatsappTemplates?.categories.authentication || 'Authentication' }
    };

    const { color, label } = config[category as keyof typeof config] || { color: 'bg-gray-500', label: category };

    return (
      <Badge variant="outline" className={`${color} text-white`}>
        {label}
      </Badge>
    );
  };

  // Tablo kolonları
  const columns: ColumnDef<WhatsAppTemplate>[] = [
    {
      accessorKey: 'name',
      header: t.admin?.whatsappTemplates?.table.templateName || 'Template Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.language}</div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: t.admin?.whatsappTemplates?.table.category || 'Category',
      cell: ({ row }) => getCategoryBadge(row.original.category)
    },
    {
      accessorKey: 'status',
      header: t.admin?.whatsappTemplates?.table.status || 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
         {
       accessorKey: 'usage_count',
       header: t.admin?.whatsappTemplates?.table.usage || 'Usage',
       cell: ({ row }) => (
         <div className="text-center">
           <div className="font-medium">{(row.original.usage_count || 0).toLocaleString()}</div>
           <div className="text-xs text-muted-foreground">{t.admin?.whatsappTemplates?.table.messages}</div>
         </div>
       )
     },
         {
       accessorKey: 'delivery_rate',
       header: t.admin?.whatsappTemplates?.table.deliveryRate || 'Delivery Rate',
       cell: ({ row }) => (
         <div className="text-center">
           <div className="font-medium">{((row.original.delivery_rate || 0) * 100).toFixed(1)}%</div>
         </div>
       )
     },
    {
      accessorKey: 'created_at',
      header: t.admin?.whatsappTemplates?.table.createdAt || 'Created',
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDistanceToNow(new Date(row.original.created_at), {
            addSuffix: true,
            locale: locale === 'tr' ? tr : enUS
          })}
        </div>
      )
    },
    {
      id: 'actions',
      header: t.admin?.whatsappTemplates?.table.actions || 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedTemplate(row.original);
              setIsViewDialogOpen(true);
            }}>
              <Eye className="h-4 w-4 mr-2" />
              {t.admin?.whatsappTemplates?.actions.view}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedTemplate(row.original);
              setIsBuilderOpen(true);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              {t.admin?.whatsappTemplates?.actions.edit}
            </DropdownMenuItem>
            {row.original.status === 'DRAFT' && (
              <DropdownMenuItem onClick={() => handleSubmitForApproval(row.original)}>
                <Send className="h-4 w-4 mr-2" />
                {t.admin?.whatsappTemplates?.actions.submitForApproval}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteTemplate(row.original)}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              {t.admin?.whatsappTemplates?.actions.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.admin?.whatsappTemplates?.pageTitle}</h1>
            <p className="text-muted-foreground">
              {t.admin?.whatsappTemplates?.pageDescription}
            </p>
          </div>
                     <div className="flex gap-3">
             <Button variant="outline" onClick={loadTemplates}>
               <RefreshCw className="h-4 w-4 mr-2" />
               {t.admin?.whatsappTemplates?.refresh}
             </Button>
                           <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    console.log('🔄 Manual Meta API sync started...');
                    
                    // Meta API'den direkt template'leri al
                    const metaService = createMetaTemplateService();
                    const metaResult = await metaService.getTemplates();
                    
                    if (metaResult.success && metaResult.data) {
                      console.log('📥 Meta API templates found:', metaResult.data.length);
                      
                      // Meta API template'lerinin detaylarını log'la
                      metaResult.data.forEach((template, index) => {
                        console.log(`📋 Template ${index + 1}:`, {
                          name: template.name,
                          category: template.category,
                          language: template.language,
                          status: template.status,
                          components: template.components
                        });
                      });
                      
                      // Database'deki template'leri al
                      const { data: localTemplates } = await supabase.from('message_templates').select('*');
                      
                      // Debug: Mevcut template'leri logla
                      console.log('📋 Local templates found:', localTemplates?.length || 0);
                      console.log('📋 Local template names:', localTemplates?.map(t => t.name) || []);
                      
                      // Mevcut template'lerin status'larını güncelle
                      if (localTemplates && localTemplates.length > 0) {
                        await syncTemplateStatuses(localTemplates);
                      }
                      
                      // Meta API'den gelen yeni template'leri database'e ekle
                      console.log('📝 Adding new Meta API templates to database...');
                      
                      // Mevcut template isimlerini al
                      const existingTemplateNames = localTemplates?.map(t => t.name) || [];
                      console.log('📋 Existing template names:', existingTemplateNames);
                      
                      // Meta API template isimlerini logla
                      console.log('📋 Meta API template names:', metaResult.data.map(t => t.name));
                      
                      // Sadece yeni template'leri filtrele
                      const newTemplates = metaResult.data.filter(metaTemplate => 
                        !existingTemplateNames.includes(metaTemplate.name)
                      );
                      
                      console.log(`📋 Found ${newTemplates.length} new templates to add`);
                      console.log('📋 New template names:', newTemplates.map(t => t.name));
                      
                      if (newTemplates.length > 0) {
                        const templatesToInsert = newTemplates.map(metaTemplate => {
                          const bodyComponent = metaTemplate.components?.find(c => c.type === 'BODY');
                          const headerComponent = metaTemplate.components?.find(c => c.type === 'HEADER');
                          const footerComponent = metaTemplate.components?.find(c => c.type === 'FOOTER');
                          const buttonsComponent = metaTemplate.components?.find(c => c.type === 'BUTTONS');
                          
                          return {
                            name: metaTemplate.name,
                            category: metaTemplate.category || 'MARKETING',
                            language: metaTemplate.language || 'tr',
                            status: metaTemplate.status || 'DRAFT',
                            body_text: bodyComponent?.text || '',
                            header_text: headerComponent?.text || null,
                            footer_text: footerComponent?.text || null,
                            variables: [],
                            buttons: buttonsComponent?.buttons || []
                          };
                        });
                        
                        console.log('📝 Templates to insert:', templatesToInsert);
                        console.log('📝 First template to insert:', templatesToInsert[0]);
                        
                        const { data: insertedData, error: insertError } = await supabase
                          .from('message_templates')
                          .insert(templatesToInsert)
                          .select();
                              
                        if (insertError) {
                          console.error('❌ Error adding templates to database:', insertError);
                          console.error('❌ Error details:', {
                            message: insertError.message,
                            details: insertError.details,
                            hint: insertError.hint,
                            code: insertError.code
                          });
                          console.error('❌ Full error object:', insertError);
                        } else {
                          console.log(`✅ Successfully added ${insertedData?.length || 0} templates to database`);
                          console.log('📋 Inserted templates:', insertedData);
                        }
                      } else {
                        console.log('📋 No new templates to add - all templates already exist');
                      }
                      
                      // Kısa bir bekleme süresi ekle
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      // Database'i yeniden yükle
                      await loadTemplates();
                      await loadStats();
                      
                      toast({
                        title: t.admin?.whatsappTemplates?.toasts.syncCompleted,
                        description: t.admin?.whatsappTemplates?.toasts.syncCompletedDesc(metaResult.data.length)
                      });
                    } else {
                      console.error('❌ Meta API sync failed:', metaResult.error);
                      toast({
                        title: t.admin?.whatsappTemplates?.toasts.syncError,
                        description: metaResult.error || t.admin?.whatsappTemplates?.toasts.syncErrorDesc,
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    console.error('❌ Manual sync error:', error);
                    toast({
                      title: t.admin?.whatsappTemplates?.toasts.syncError,
                      description: t.admin?.whatsappTemplates?.toasts.syncErrorDesc,
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                {t.admin?.whatsappTemplates?.metaApiSync}
              </Button>
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedTemplate(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.admin?.whatsappTemplates?.newTemplate}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTemplate ? t.admin?.whatsappTemplates?.templateBuilder.editTitle : t.admin?.whatsappTemplates?.templateBuilder.createTitle}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate ? t.admin?.whatsappTemplates?.templateBuilder.editDescription : t.admin?.whatsappTemplates?.templateBuilder.createDescription}
                  </DialogDescription>
                </DialogHeader>
                <TemplateBuilder
                  template={selectedTemplate}
                  onSave={async (template) => {
                    console.log('💾 Template saved from builder:', template);
                    
                    try {
                      const templateData = {
                        name: template.name,
                        category: template.category.toUpperCase(),
                        language: template.language,
                        status: template.status || 'DRAFT',
                        header_text: template.components?.find(c => c.type === 'header')?.text || null,
                        body_text: template.components?.find(c => c.type === 'body')?.text || '',
                        footer_text: template.components?.find(c => c.type === 'footer')?.text || null,
                        variables: [], // Variables artık body_text içinde {{1}}, {{2}} formatında
                        buttons: template.components?.find(c => c.type === 'buttons')?.buttons || []
                      };

                      let data, error;
                      
                      if (selectedTemplate?.id) {
                        // Template güncelle
                        console.log('🔄 Updating existing template:', selectedTemplate.id);
                        const result = await supabase
                          .from('message_templates')
                          .update(templateData)
                          .eq('id', selectedTemplate.id)
                          .select()
                          .single();
                        data = result.data;
                        error = result.error;
                      } else {
                        // Yeni template oluştur
                        console.log('➕ Creating new template');
                        const result = await supabase
                          .from('message_templates')
                          .insert([templateData])
                          .select()
                          .single();
                        data = result.data;
                        error = result.error;
                      }

                      if (error) {
                        console.error('Database error:', error);
                        throw error;
                      }

                      console.log('✅ Template saved to database:', data);

                      const isUpdate = !!selectedTemplate?.id;
                      toast({
                        title: isUpdate 
                          ? (template.status === 'DRAFT' ? t.admin?.whatsappTemplates?.toasts.templateUpdated : t.admin?.whatsappTemplates?.toasts.templateSentForApproval)
                          : (template.status === 'DRAFT' ? t.admin?.whatsappTemplates?.toasts.draftSaved : t.admin?.whatsappTemplates?.toasts.templateSentForApproval),
                        description: isUpdate
                          ? t.admin?.whatsappTemplates?.toasts.templateUpdatedDesc
                          : (template.status === 'DRAFT' 
                              ? t.admin?.whatsappTemplates?.toasts.draftSavedDesc 
                              : t.admin?.whatsappTemplates?.toasts.templateSentForApprovalDesc)
                      });
                      
                      setIsBuilderOpen(false);
                      setSelectedTemplate(null);
                      loadTemplates(); // Listeyi yenile
                    } catch (error) {
                      console.error('Error saving template:', error);
                      toast({
                        title: t.admin?.whatsappTemplates?.toasts.saveError,
                        description: t.admin?.whatsappTemplates?.toasts.saveErrorDesc,
                        variant: "destructive"
                      });
                    }
                  }}
                  onCancel={() => {
                    setIsBuilderOpen(false);
                    setSelectedTemplate(null);
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* Template View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t.admin?.whatsappTemplates?.templateView.title}</DialogTitle>
                  <DialogDescription>
                    {selectedTemplate?.name && t.admin?.whatsappTemplates?.templateView.description(selectedTemplate.name)}
                  </DialogDescription>
                </DialogHeader>
                
                {selectedTemplate && (
                  <div className="space-y-6">
                    {/* Template Bilgileri */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.templateName}</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTemplate.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.category}</label>
                        <p className="mt-1">{selectedTemplate.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.language}</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTemplate.language}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.status}</label>
                        <p className="mt-1">{getStatusBadge(selectedTemplate.status)}</p>
                      </div>
                    </div>

                    {/* Template İçeriği */}
                    <div className="space-y-4">
                      {selectedTemplate.header_text && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.header}</label>
                          <div className="mt-1 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm font-medium text-blue-900">{selectedTemplate.header_text}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.content}</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTemplate.body_text}</p>
                        </div>
                      </div>

                      {selectedTemplate.footer_text && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.footer}</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md">
                            <p className="text-xs text-gray-600">{selectedTemplate.footer_text}</p>
                          </div>
                        </div>
                      )}

                      {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t.admin?.whatsappTemplates?.templateView.buttons}</label>
                          <div className="mt-1 space-y-2">
                            {selectedTemplate.buttons.map((button: any, index: number) => (
                              <div key={index} className="p-2 bg-blue-100 rounded-md">
                                <p className="text-sm font-medium text-blue-900">{button.text}</p>
                                {button.url && <p className="text-xs text-blue-700">{button.url}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta API Bilgileri */}
                    {selectedTemplate.meta_template_id && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t.admin?.whatsappTemplates?.templateView.metaApiInfo}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">{t.admin?.whatsappTemplates?.templateView.metaTemplateId}:</span>
                            <p className="font-mono text-xs">{selectedTemplate.meta_template_id}</p>
                          </div>
                          {selectedTemplate.created_at && (
                            <div>
                              <span className="text-gray-600">{t.admin?.whatsappTemplates?.templateView.createdAt}:</span>
                              <p>{new Date(selectedTemplate.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total_templates}</div>
            <p className="text-sm text-muted-foreground">{t.admin?.whatsappTemplates?.stats.totalTemplates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved_templates}</div>
            <p className="text-sm text-muted-foreground">{t.admin?.whatsappTemplates?.stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_templates}</div>
            <p className="text-sm text-muted-foreground">{t.admin?.whatsappTemplates?.stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total_sent.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">{t.admin?.whatsappTemplates?.stats.sentMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{(stats.avg_delivery_rate * 100).toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">{t.admin?.whatsappTemplates?.stats.avgDelivery}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{(stats.avg_read_rate * 100).toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">{t.admin?.whatsappTemplates?.stats.avgRead}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.admin?.whatsappTemplates?.filters.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{t.admin?.whatsappTemplates?.filters.allStatuses}</option>
              <option value="DRAFT">{t.admin?.whatsappTemplates?.status.draft}</option>
              <option value="PENDING">{t.admin?.whatsappTemplates?.status.pending}</option>
              <option value="APPROVED">{t.admin?.whatsappTemplates?.status.approved}</option>
              <option value="REJECTED">{t.admin?.whatsappTemplates?.status.rejected}</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{t.admin?.whatsappTemplates?.filters.allCategories}</option>
              <option value="MARKETING">{t.admin?.whatsappTemplates?.categories.marketing}</option>
              <option value="UTILITY">{t.admin?.whatsappTemplates?.categories.utility}</option>
              <option value="AUTHENTICATION">{t.admin?.whatsappTemplates?.categories.authentication}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Template Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin?.whatsappTemplates?.pageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={templates}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}