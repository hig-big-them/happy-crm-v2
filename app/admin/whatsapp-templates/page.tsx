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
import { tr } from 'date-fns/locale';

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
  
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
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
        title: "Hata",
        description: "Template'ler yüklenirken hata oluştu",
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
    if (!confirm(`"${template.name}" template'ini silmek istediğinize emin misiniz?`)) return;

    try {
             const { error } = await supabase
         .from('message_templates')
         .delete()
         .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Template silindi",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Hata",
        description: "Template silinirken hata oluştu",
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
        title: "Başarılı",
        description: "Template onay için gönderildi",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error submitting template:', error);
      toast({
        title: "Hata",
        description: "Template gönderilirken hata oluştu",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      DRAFT: { variant: 'secondary' as const, label: 'Taslak', icon: Edit },
      PENDING: { variant: 'default' as const, label: 'Beklemede', icon: Clock },
      APPROVED: { variant: 'success' as const, label: 'Onaylı', icon: CheckCircle },
      REJECTED: { variant: 'destructive' as const, label: 'Reddedildi', icon: XCircle },
      DISABLED: { variant: 'outline' as const, label: 'Devre Dışı', icon: AlertCircle }
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
    const colors = {
      MARKETING: 'bg-blue-500',
      UTILITY: 'bg-green-500',
      AUTHENTICATION: 'bg-purple-500'
    };

    return (
      <Badge variant="outline" className={`${colors[category as keyof typeof colors]} text-white`}>
        {category}
      </Badge>
    );
  };

  // Tablo kolonları
  const columns: ColumnDef<WhatsAppTemplate>[] = [
    {
      accessorKey: 'name',
      header: 'Template Adı',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.language}</div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => getCategoryBadge(row.original.category)
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
         {
       accessorKey: 'usage_count',
       header: 'Kullanım',
       cell: ({ row }) => (
         <div className="text-center">
           <div className="font-medium">{(row.original.usage_count || 0).toLocaleString()}</div>
           <div className="text-xs text-muted-foreground">mesaj</div>
         </div>
       )
     },
         {
       accessorKey: 'delivery_rate',
       header: 'Teslimat Oranı',
       cell: ({ row }) => (
         <div className="text-center">
           <div className="font-medium">{((row.original.delivery_rate || 0) * 100).toFixed(1)}%</div>
         </div>
       )
     },
    {
      accessorKey: 'created_at',
      header: 'Oluşturulma',
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDistanceToNow(new Date(row.original.created_at), {
            addSuffix: true,
            locale: tr
          })}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedTemplate(row.original)}>
              <Eye className="h-4 w-4 mr-2" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedTemplate(row.original);
              setIsBuilderOpen(true);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </DropdownMenuItem>
            {row.original.status === 'DRAFT' && (
              <DropdownMenuItem onClick={() => handleSubmitForApproval(row.original)}>
                <Send className="h-4 w-4 mr-2" />
                Onaya Gönder
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteTemplate(row.original)}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Sil
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
            <h1 className="text-3xl font-bold mb-2">WhatsApp Template Yönetimi</h1>
            <p className="text-muted-foreground">
              WhatsApp Business Cloud API template'lerini oluştur ve yönet
            </p>
          </div>
                     <div className="flex gap-3">
             <Button variant="outline" onClick={loadTemplates}>
               <RefreshCw className="h-4 w-4 mr-2" />
               Yenile
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
                      
                      // Mevcut template'lerin status'larını güncelle
                      if (localTemplates && localTemplates.length > 0) {
                        await syncTemplateStatuses(localTemplates);
                      }
                      
                      // Meta API'den gelen yeni template'leri database'e ekle
                      console.log('📝 Adding new Meta API templates to database...');
                      
                      // Mevcut template isimlerini al
                      const existingTemplateNames = localTemplates?.map(t => t.name) || [];
                      
                      // Sadece yeni template'leri filtrele
                      const newTemplates = metaResult.data.filter(metaTemplate => 
                        !existingTemplateNames.includes(metaTemplate.name)
                      );
                      
                      console.log(`📋 Found ${newTemplates.length} new templates to add`);
                      
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
                        title: "Senkronizasyon Tamamlandı",
                        description: `Meta API'den ${metaResult.data.length} template bulundu ve güncellendi`
                      });
                    } else {
                      console.error('❌ Meta API sync failed:', metaResult.error);
                      toast({
                        title: "Senkronizasyon Hatası",
                        description: metaResult.error || "Meta API'den template'ler alınamadı",
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    console.error('❌ Manual sync error:', error);
                    toast({
                      title: "Senkronizasyon Hatası",
                      description: "Meta API senkronizasyonu sırasında hata oluştu",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                Meta API Senkronize Et
              </Button>
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedTemplate(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTemplate ? 'Template Düzenle' : 'Yeni Template Oluştur'}
                  </DialogTitle>
                  <DialogDescription>
                    WhatsApp template'inizi tasarlayın ve önizleme yapın
                  </DialogDescription>
                </DialogHeader>
                <TemplateBuilder
                  template={selectedTemplate}
                  onSave={async (template) => {
                    console.log('💾 Template saved from builder:', template);
                    
                    try {
                      // Template'i database'e kaydet
                      const { data, error } = await supabase
                        .from('message_templates')
                        .insert([{
                          name: template.name,
                          category: template.category.toUpperCase(),
                          language: template.language,
                          status: template.status || 'DRAFT',
                          header_text: template.components?.find(c => c.type === 'header')?.text || null,
                          body_text: template.components?.find(c => c.type === 'body')?.text || '',
                          footer_text: template.components?.find(c => c.type === 'footer')?.text || null,
                          variables: [], // Variables artık body_text içinde {{1}}, {{2}} formatında
                          buttons: template.components?.find(c => c.type === 'buttons')?.buttons || []
                        }])
                        .select()
                        .maybeSingle();

                      if (error) {
                        console.error('Database error:', error);
                        throw error;
                      }

                      console.log('✅ Template saved to database:', data);

                      toast({
                        title: template.status === 'DRAFT' ? "Taslak Kaydedildi" : "Template Onaya Gönderildi",
                        description: template.status === 'DRAFT' 
                          ? "Template taslak olarak kaydedildi" 
                          : "Template Meta'ya gönderildi ve onay bekliyor"
                      });
                      
                      setIsBuilderOpen(false);
                      loadTemplates(); // Listeyi yenile
                    } catch (error) {
                      console.error('Error saving template:', error);
                      toast({
                        title: "Hata",
                        description: "Template kaydedilirken hata oluştu",
                        variant: "destructive"
                      });
                    }
                  }}
                  onCancel={() => setIsBuilderOpen(false)}
                />
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
            <p className="text-sm text-muted-foreground">Toplam Template</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved_templates}</div>
            <p className="text-sm text-muted-foreground">Onaylı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_templates}</div>
            <p className="text-sm text-muted-foreground">Beklemede</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total_sent.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Gönderilen Mesaj</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{(stats.avg_delivery_rate * 100).toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Ort. Teslimat</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{(stats.avg_read_rate * 100).toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Ort. Okunma</p>
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
                placeholder="Template ara..."
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
              <option value="all">Tüm Durumlar</option>
              <option value="DRAFT">Taslak</option>
              <option value="PENDING">Beklemede</option>
              <option value="APPROVED">Onaylı</option>
              <option value="REJECTED">Reddedildi</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Template Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Template'ler</CardTitle>
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