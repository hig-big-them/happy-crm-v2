"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
// Date formatting functions
const formatDate = (date: Date, formatStr: string = 'PPP'): string => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};
import { 
  PlusCircle,
  Plus,
  Loader2, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Target, 
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Activity,
  UserPlus,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  SlidersHorizontal,
  Star,
  MapPin,
  Tag,
  Briefcase,
  Globe,
  Hash,
  CalendarDays,
  BarChart3,
  PieChart,
  RefreshCw,
  Copy,
  ExternalLink,
  Send,
  Archive,
  Inbox,
  Check,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

// Types
interface Stage {
  id: string;
  name: string;
  order_position: number;
  color?: string | null;
  pipeline_id?: string | null;
}

interface Company {
  id: string;
  company_name: string;
  industry?: string;
  website?: string;
  employee_count?: number;
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
}

interface Lead {
  id: string;
  lead_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  lead_value?: number | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | null;
  source?: string | null;
  description?: string | null;
  created_at: string;
  updated_at?: string;
  follow_up_date?: string | null;
  stage_id?: string | null;
  pipeline_id?: string | null;
  company_id?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  assigned_to?: string | null;
  tags?: string[];
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  lead_score?: number;
  last_activity?: string;
  notes_count?: number;
  activities_count?: number;
  company?: Company | null;
  stage?: Stage | null;
  pipeline?: Pipeline | null;
}

interface LeadActivity {
  id: string;
  lead_id: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'status_change';
  description: string;
  created_at: string;
  created_by: string;
  metadata?: any;
}

interface LeadNote {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
  created_by: string;
  is_pinned?: boolean;
}

// Constants
const priorityConfig = {
  urgent: { label: 'Acil', color: 'bg-red-500', textColor: 'text-red-700', icon: AlertCircle },
  high: { label: 'Yüksek', color: 'bg-orange-500', textColor: 'text-orange-700', icon: TrendingUp },
  medium: { label: 'Orta', color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: null },
  low: { label: 'Düşük', color: 'bg-green-500', textColor: 'text-green-700', icon: null }
};

const statusConfig = {
  new: { label: 'Yeni', color: 'bg-blue-500', icon: PlusCircle },
  contacted: { label: 'İletişime Geçildi', color: 'bg-purple-500', icon: MessageSquare },
  qualified: { label: 'Nitelikli', color: 'bg-indigo-500', icon: CheckCircle },
  proposal: { label: 'Teklif', color: 'bg-cyan-500', icon: FileText },
  negotiation: { label: 'Müzakere', color: 'bg-orange-500', icon: Activity },
  won: { label: 'Kazanıldı', color: 'bg-green-500', icon: CheckCircle },
  lost: { label: 'Kaybedildi', color: 'bg-red-500', icon: XCircle }
};

const sourceOptions = [
  'Website',
  'Referral',
  'Social Media',
  'Email Campaign',
  'Cold Call',
  'Trade Show',
  'Partner',
  'Advertisement',
  'Other'
];

// Lead Detail Modal
function LeadDetailModal({ 
  lead, 
  isOpen, 
  onClose,
  onEdit,
  onDelete,
  onAddActivity,
  onAddNote
}: { 
  lead: Lead | null; 
  isOpen: boolean; 
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onAddActivity: (lead: Lead) => void;
  onAddNote: (lead: Lead) => void;
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      loadLeadDetails();
    }
  }, [lead, isOpen]);

  const loadLeadDetails = async () => {
    if (!lead) return;
    
    setLoadingActivities(true);
    try {
      // Mock data for now
      setActivities([
        {
          id: '1',
          lead_id: lead.id,
          type: 'status_change',
          description: 'Status değişti: Yeni → İletişime Geçildi',
          created_at: new Date().toISOString(),
          created_by: 'Ahmet Yılmaz'
        },
        {
          id: '2',
          lead_id: lead.id,
          type: 'call',
          description: 'Müşteri ile görüşme yapıldı',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          created_by: 'Ayşe Demir'
        }
      ]);
      
      setNotes([
        {
          id: '1',
          lead_id: lead.id,
          content: 'Müşteri yeni CRM sistemi arıyor. Bütçesi 50K civarında.',
          created_at: new Date().toISOString(),
          created_by: 'Mehmet Kaya',
          is_pinned: true
        }
      ]);
    } catch (error) {
      console.error('Error loading lead details:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {lead.lead_name}
                {lead.priority && (
                  <Badge className={cn(priorityConfig[lead.priority].color, 'text-white')}>
                    {priorityConfig[lead.priority].label}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-2 space-y-1">
                  {lead.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{lead.company.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {lead.contact_email && (
                      <a href={`mailto:${lead.contact_email}`} className="flex items-center gap-1 hover:underline">
                        <Mail className="h-3 w-3" />
                        {lead.contact_email}
                      </a>
                    )}
                    {lead.contact_phone && (
                      <a href={`tel:${lead.contact_phone}`} className="flex items-center gap-1 hover:underline">
                        <Phone className="h-3 w-3" />
                        {lead.contact_phone}
                      </a>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(lead)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        navigator.clipboard.writeText(lead.id);
                        toast({
                          title: "ID kopyalandı",
                          description: "Lead ID panoya kopyalandı"
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      ID'yi Kopyala
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open(`/leads/${lead.id}/timeline`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Timeline'da Aç
                    </Button>
                    <Separator className="my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600"
                      onClick={() => onDelete(lead)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="activities">
              Aktiviteler {activities.length > 0 && `(${activities.length})`}
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notlar {notes.length > 0 && `(${notes.length})`}
            </TabsTrigger>
            <TabsTrigger value="files">Dosyalar</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              {/* Lead Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Lead Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pipeline</p>
                      <p className="font-medium">{lead.pipeline?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aşama</p>
                      <div className="flex items-center gap-2">
                        {lead.stage && (
                          <>
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: lead.stage.color || '#6B7280' }}
                            />
                            <span className="font-medium">{lead.stage.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Değer</p>
                      <p className="font-medium text-green-600">
                        {lead.lead_value ? `₺${lead.lead_value.toLocaleString('tr-TR')}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kaynak</p>
                      <p className="font-medium">{lead.source || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Atanan</p>
                      <p className="font-medium">{lead.assigned_to || 'Atanmamış'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lead Skoru</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                (lead.lead_score || 0) >= star
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm">({lead.lead_score || 0}/5)</span>
                      </div>
                    </div>
                  </div>
                  
                  {lead.description && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Açıklama</p>
                      <p className="text-sm">{lead.description}</p>
                    </div>
                  )}
                  
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Etiketler</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => onAddActivity(lead)}>
                      <Activity className="h-4 w-4 mr-2" />
                      Aktivite Ekle
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onAddNote(lead)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Not Ekle
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Toplantı Planla
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Email Gönder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Aktivite Geçmişi</h3>
                <Button size="sm" onClick={() => onAddActivity(lead)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              </div>
              
              {loadingActivities ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <Card key={activity.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          activity.type === 'call' ? 'bg-blue-100' :
                          activity.type === 'email' ? 'bg-green-100' :
                          activity.type === 'meeting' ? 'bg-purple-100' :
                          activity.type === 'note' ? 'bg-yellow-100' :
                          activity.type === 'status_change' ? 'bg-gray-100' :
                          'bg-gray-100'
                        )}>
                          {activity.type === 'call' ? <Phone className="h-4 w-4" /> :
                           activity.type === 'email' ? <Mail className="h-4 w-4" /> :
                           activity.type === 'meeting' ? <CalendarIcon className="h-4 w-4" /> :
                           activity.type === 'note' ? <FileText className="h-4 w-4" /> :
                           activity.type === 'status_change' ? <Activity className="h-4 w-4" /> :
                           <Activity className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.created_by} • {new Date(activity.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Henüz aktivite yok</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Notlar</h3>
                <Button size="sm" onClick={() => onAddNote(lead)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Not Ekle
                </Button>
              </div>
              
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Card key={note.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {note.created_by} • {new Date(note.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                        {note.is_pinned && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-2" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Henüz not yok</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="files" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Henüz dosya yok</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Dosya Yükle
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button onClick={() => {
            onClose();
            window.location.href = `/leads/${lead.id}/timeline`;
          }}>
            <Activity className="h-4 w-4 mr-2" />
            Timeline'a Git
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Lead Create/Edit Modal
function LeadFormModal({
  lead,
  isOpen,
  onClose,
  pipelines,
  stages,
  companies,
  onSave
}: {
  lead?: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  pipelines: Pipeline[];
  stages: Stage[];
  companies: Company[];
  onSave: (data: Partial<Lead>) => Promise<void>;
}) {
  const { locale, t } = useI18n();
  const [formData, setFormData] = useState({
    lead_name: '',
    contact_email: '',
    contact_phone: '',
    pipeline_id: '',
    stage_id: '',
    company_id: '',
    lead_value: '',
    priority: 'medium' as Lead['priority'],
    source: '',
    assigned_to: '',
    description: '',
    tags: [] as string[],
    follow_up_date: null as Date | null,
    event_date: '',
    event_time: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompanySearch, setShowCompanySearch] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        lead_name: lead.lead_name || '',
        contact_email: lead.contact_email || '',
        contact_phone: lead.contact_phone || '',
        pipeline_id: lead.pipeline_id || '',
        stage_id: lead.stage_id || '',
        company_id: lead.company_id || '',
        lead_value: lead.lead_value?.toString() || '',
        priority: lead.priority || 'medium',
        source: lead.source || '',
        assigned_to: lead.assigned_to || '',
        description: lead.description || '',
        tags: lead.tags || [],
        follow_up_date: lead.follow_up_date ? new Date(lead.follow_up_date) : null,
        event_date: lead.event_date || '',
        event_time: lead.event_time || ''
      });
    }
  }, [lead]);

  const filteredStages = stages.filter(s => s.pipeline_id === formData.pipeline_id);

  const handleSubmit = async () => {
    if (!formData.lead_name.trim()) {
      toast({
        title: "Hata",
        description: "Lead adı zorunludur",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        lead_value: formData.lead_value ? parseFloat(formData.lead_value) : null,
        follow_up_date: formData.follow_up_date?.toISOString() || null,
        ...(lead && { id: lead.id })
      });
      
      onClose();
      toast({
        title: "Başarılı",
        description: lead ? "Lead güncellendi" : "Lead oluşturuldu"
      });
    } catch (error) {
      console.error('Form submit error:', error);
      toast({
        title: "Hata",
        description: "İşlem başarısız oldu",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? (t.leads?.dialog.editTitle || (locale === 'tr' ? 'Lead Düzenle' : 'Edit Lead')) : (t.leads?.dialog.createTitle || (locale === 'tr' ? 'Yeni Lead Oluştur' : 'Create New Lead'))}</DialogTitle>
          <DialogDescription>
            {lead ? (t.leads?.dialog.editDesc || (locale === 'tr' ? 'Lead bilgilerini güncelleyin' : 'Update the lead details')) : (t.leads?.dialog.createDesc || (locale === 'tr' ? 'Lead bilgilerini doldurun' : 'Fill in the lead details'))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead_name">{t.leads?.dialog.leadName || (locale === 'tr' ? 'Lead Adı *' : 'Lead Name *')}</Label>
                <Input
                  id="lead_name"
                  value={formData.lead_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, lead_name: e.target.value }))}
                  placeholder={locale === 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g., John Doe'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_id">{t.leads?.dialog.company || (locale === 'tr' ? 'Şirket' : 'Company')}</Label>
                <Popover open={showCompanySearch} onOpenChange={setShowCompanySearch}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={showCompanySearch}
                      className="w-full justify-between"
                    >
                      {formData.company_id
                        ? companies.find(c => c.id === formData.company_id)?.company_name
                        : (t.leads?.dialog.companySelect || (locale === 'tr' ? 'Şirket seçin...' : 'Select a company...'))}
                      <Building className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t.leads?.dialog.companySearch || (locale === 'tr' ? 'Şirket ara...' : 'Search company...')} />
                      <CommandEmpty>{t.leads?.dialog.companyEmpty || (locale === 'tr' ? 'Şirket bulunamadı.' : 'No company found.')}</CommandEmpty>
                      <CommandGroup>
                        {companies.map((company) => (
                          <CommandItem
                            key={company.id}
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, company_id: company.id }));
                              setShowCompanySearch(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.company_id === company.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {company.company_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">{t.leads?.dialog.email || 'Email'}</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">{t.leads?.dialog.phone || (locale === 'tr' ? 'Telefon' : 'Phone')}</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+90 555 555 5555"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pipeline & Stage */}
          <div className="space-y-4">
            <h3 className="font-medium">Pipeline & Aşama</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pipeline_id">Pipeline</Label>
                <Select
                  value={formData.pipeline_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pipeline_id: value, stage_id: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pipeline seçin" />
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
              
              <div className="space-y-2">
                <Label htmlFor="stage_id">Aşama</Label>
                <Select
                  value={formData.stage_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stage_id: value }))}
                  disabled={!formData.pipeline_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aşama seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: stage.color || '#6B7280' }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Value & Priority */}
          <div className="space-y-4">
            <h3 className="font-medium">Değer & Öncelik</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead_value">Lead Değeri (₺)</Label>
                <Input
                  id="lead_value"
                  type="number"
                  value={formData.lead_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, lead_value: e.target.value }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Lead['priority'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon && <config.icon className="h-4 w-4" />}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source">Kaynak</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kaynak seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-medium">Etiketler</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Etiket ekle..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        className="ml-1 hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-medium">Tarihler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Takip Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.follow_up_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.follow_up_date ? (
                        formatDate(formData.follow_up_date)
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.follow_up_date || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, follow_up_date: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Atanan Kişi</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                  placeholder="Örn: Mehmet Kaya"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Lead hakkında notlar..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {lead ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
              </>
            ) : (
              lead ? 'Güncelle' : 'Oluştur'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function LeadsProductionPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPipeline, setFilterPipeline] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Sorting
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Selection
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalValue: 0,
    avgDealSize: 0,
    conversionRate: 0,
    newLeadsThisMonth: 0,
    wonDealsThisMonth: 0
  });

  const supabase = createClient();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now
      const mockLeads: Lead[] = [
        {
          id: '1',
          lead_name: 'Acme Corp - CRM Projesi',
          contact_email: 'john@acme.com',
          contact_phone: '+90 555 123 4567',
          lead_value: 150000,
          priority: 'high',
          source: 'Website',
          status: 'proposal',
          stage_id: '1',
          pipeline_id: '1',
          company_id: '1',
          assigned_to: 'Ahmet Yılmaz',
          tags: ['Enterprise', 'CRM', 'Urgent'],
          lead_score: 4,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          notes_count: 3,
          activities_count: 7
        },
        {
          id: '2',
          lead_name: 'Beta Tech - Danışmanlık',
          contact_email: 'sarah@betatech.com',
          contact_phone: '+90 555 234 5678',
          lead_value: 85000,
          priority: 'urgent',
          source: 'Referral',
          status: 'negotiation',
          stage_id: '2',
          pipeline_id: '1',
          company_id: '2',
          assigned_to: 'Ayşe Demir',
          tags: ['Consulting', 'Tech'],
          lead_score: 5,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          follow_up_date: new Date(Date.now() + 86400000).toISOString(),
          notes_count: 5,
          activities_count: 12
        },
        {
          id: '3',
          lead_name: 'Gamma Ltd - Eğitim Paketi',
          contact_email: 'hr@gamma.com',
          lead_value: 45000,
          priority: 'medium',
          source: 'Email Campaign',
          status: 'qualified',
          stage_id: '3',
          pipeline_id: '2',
          company_id: '3',
          assigned_to: 'Mehmet Kaya',
          tags: ['Training', 'HR'],
          lead_score: 3,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          notes_count: 2,
          activities_count: 4
        }
      ];

      const mockStages: Stage[] = [
        { id: '1', name: 'Yeni Lead', order_position: 0, color: '#3B82F6', pipeline_id: '1' },
        { id: '2', name: 'İletişim Kuruldu', order_position: 1, color: '#8B5CF6', pipeline_id: '1' },
        { id: '3', name: 'Teklif Gönderildi', order_position: 2, color: '#F59E0B', pipeline_id: '1' }
      ];

      const mockPipelines: Pipeline[] = [
        { id: '1', name: 'Satış Pipeline', description: 'Ana satış süreci' },
        { id: '2', name: 'Destek Pipeline', description: 'Müşteri destek süreci' }
      ];

      const mockCompanies: Company[] = [
        { id: '1', company_name: 'Acme Corp', industry: 'Technology', website: 'acme.com', employee_count: 500 },
        { id: '2', company_name: 'Beta Tech', industry: 'Consulting', website: 'betatech.com', employee_count: 150 },
        { id: '3', company_name: 'Gamma Ltd', industry: 'Education', website: 'gamma.com', employee_count: 50 }
      ];

      // Add company data to leads
      mockLeads.forEach(lead => {
        lead.company = mockCompanies.find(c => c.id === lead.company_id) || null;
        lead.stage = mockStages.find(s => s.id === lead.stage_id) || null;
        lead.pipeline = mockPipelines.find(p => p.id === lead.pipeline_id) || null;
      });

      setLeads(mockLeads);
      setStages(mockStages);
      setPipelines(mockPipelines);
      setCompanies(mockCompanies);

      // Calculate stats
      calculateStats(mockLeads);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadsData: Lead[]) => {
    const totalValue = leadsData.reduce((sum, lead) => sum + (lead.lead_value || 0), 0);
    const wonDeals = leadsData.filter(lead => lead.status === 'won');
    const thisMonthLeads = leadsData.filter(lead => {
      const createdDate = new Date(lead.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    });

    setStats({
      totalLeads: leadsData.length,
      totalValue,
      avgDealSize: leadsData.length > 0 ? totalValue / leadsData.length : 0,
      conversionRate: leadsData.length > 0 ? (wonDeals.length / leadsData.length) * 100 : 0,
      newLeadsThisMonth: thisMonthLeads.length,
      wonDealsThisMonth: thisMonthLeads.filter(lead => lead.status === 'won').length
    });
  };

  // Filter and sort leads
  useEffect(() => {
    let filtered = [...leads];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact_phone?.includes(searchQuery) ||
        lead.company?.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filters
    if (filterPipeline !== 'all') {
      filtered = filtered.filter(lead => lead.pipeline_id === filterPipeline);
    }
    if (filterStage !== 'all') {
      filtered = filtered.filter(lead => lead.stage_id === filterStage);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(lead => lead.priority === filterPriority);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === filterStatus);
    }
    if (filterSource !== 'all') {
      filtered = filtered.filter(lead => lead.source === filterSource);
    }
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(lead => lead.assigned_to === filterAssignee);
    }

    // Date range
    if (filterDateRange.start || filterDateRange.end) {
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at);
        if (filterDateRange.start && leadDate < filterDateRange.start) return false;
        if (filterDateRange.end && leadDate > filterDateRange.end) return false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredLeads(filtered);
    setCurrentPage(1);
  }, [leads, searchQuery, filterPipeline, filterStage, filterPriority, filterStatus, filterSource, filterAssignee, filterDateRange, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Handlers
  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(currentLeads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setShowFormModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowFormModal(true);
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!confirm(`"${lead.lead_name}" adlı lead'i silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      // API call would go here
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      setShowDetailModal(false);
      toast({
        title: "Lead silindi",
        description: `${lead.lead_name} başarıyla silindi`
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Lead silinirken hata oluştu",
        variant: "destructive"
      });
    }
  };

  const handleSaveLead = async (data: Partial<Lead>) => {
    try {
      if (editingLead) {
        // Update
        setLeads(prev => prev.map(lead => 
          lead.id === editingLead.id ? { ...lead, ...data } : lead
        ));
        toast({
          title: "Lead güncellendi",
          description: "Değişiklikler kaydedildi"
        });
      } else {
        // Create
        const newLead: Lead = {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          ...data
        } as Lead;
        setLeads(prev => [...prev, newLead]);
        toast({
          title: "Lead oluşturuldu",
          description: "Yeni lead başarıyla eklendi"
        });
      }
      setShowFormModal(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız oldu",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedLeads.size} adet lead'i silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      setLeads(prev => prev.filter(lead => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      toast({
        title: "Leadler silindi",
        description: `${selectedLeads.size} lead başarıyla silindi`
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Leadler silinirken hata oluştu",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    // Implement CSV export
    const csvContent = [
      ['Lead Adı', 'Email', 'Telefon', 'Şirket', 'Değer', 'Öncelik', 'Aşama', 'Kaynak', 'Atanan'],
      ...filteredLeads.map(lead => [
        lead.lead_name,
        lead.contact_email || '',
        lead.contact_phone || '',
        lead.company?.company_name || '',
        lead.lead_value?.toString() || '',
        lead.priority || '',
        lead.stage?.name || '',
        lead.source || '',
        lead.assigned_to || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get unique values for filters
  const assignees = useMemo(() => {
    const unique = new Set(leads.map(lead => lead.assigned_to).filter(Boolean));
    return Array.from(unique);
  }, [leads]);

  const sources = useMemo(() => {
    const unique = new Set(leads.map(lead => lead.source).filter(Boolean));
    return Array.from(unique);
  }, [leads]);

  const { locale, t } = useI18n()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">{t.leads?.loading || (locale === 'tr' ? 'Yükleniyor...' : 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t.leads?.pageTitle || t.nav.leads}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {locale === 'tr' ? 'Toplam' : 'Total'} {filteredLeads.length} lead • {selectedLeads.size} {locale === 'tr' ? 'seçili' : 'selected'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button size="sm" onClick={handleCreateLead}>
                <PlusCircle className="h-4 w-4 mr-1" />
                {locale === 'tr' ? 'Yeni Lead' : 'New Lead'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'tr' ? 'Toplam Lead' : 'Total Leads'}</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'tr' ? 'Toplam Değer' : 'Total Value'}</p>
                <p className="text-2xl font-bold">₺{(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'tr' ? 'Ort. Değer' : 'Avg. Value'}</p>
                <p className="text-2xl font-bold">₺{(stats.avgDealSize / 1000).toFixed(0)}K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'tr' ? 'Dönüşüm' : 'Conversion'}</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(0)}%</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'tr' ? 'Bu Ay Yeni' : 'New This Month'}</p>
                <p className="text-2xl font-bold">{stats.newLeadsThisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'tr' ? 'Bu Ay Kazanılan' : 'Won This Month'}</p>
                <p className="text-2xl font-bold">{stats.wonDealsThisMonth}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Main Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                      placeholder={t.leads?.searchPlaceholder || (locale === 'tr' ? 'Lead, email, telefon veya etiket ara...' : 'Search lead, email, phone or tag...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <Select value={filterPipeline} onValueChange={setFilterPipeline}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t.leads?.filters.pipeline || 'Pipeline'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.leads?.filters.allPipelines || 'All Pipelines'}</SelectItem>
                    {pipelines.map(pipeline => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t.leads?.filters.stage || 'Stage'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.leads?.filters.allStages || 'All Stages'}</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: stage.color || '#6B7280' }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder={t.leads?.filters.priority || 'Priority'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.leads?.filters.allPriorities || 'All Priorities'}</SelectItem>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon && <config.icon className="h-4 w-4" />}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t.leads?.filters.advancedFilters || (locale === 'tr' ? 'Gelişmiş Filtreler' : 'Advanced Filters')}
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.leads?.filters.status || 'Status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.leads?.filters.allStatuses || 'All Statuses'}</SelectItem>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.leads?.filters.source || 'Source'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.leads?.filters.allSources || 'All Sources'}</SelectItem>
                      {sources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.leads?.filters.assignee || 'Assignee'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.leads?.filters.everyone || 'Everyone'}</SelectItem>
                      {assignees.map(assignee => (
                        <SelectItem key={assignee} value={assignee}>
                          {assignee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {t.leads?.filters.dateRange || (locale === 'tr' ? 'Tarih Aralığı' : 'Date Range')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: filterDateRange.start || undefined,
                          to: filterDateRange.end || undefined
                        }}
                        onSelect={(range) => {
                          setFilterDateRange({
                            start: range?.from || null,
                            end: range?.to || null
                          });
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            {/* Active Filters */}
            {(searchQuery || filterPipeline !== 'all' || filterStage !== 'all' || 
              filterPriority !== 'all' || filterStatus !== 'all' || filterSource !== 'all' || 
              filterAssignee !== 'all' || filterDateRange.start || filterDateRange.end) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{t.leads?.activeFilters || (locale === 'tr' ? 'Aktif filtreler:' : 'Active filters:')}</p>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      {(t.leads?.searchLabel || (locale === 'tr' ? 'Arama:' : 'Search:'))} {searchQuery}
                      <button onClick={() => setSearchQuery('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterPipeline !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      Pipeline: {pipelines.find(p => p.id === filterPipeline)?.name}
                      <button onClick={() => setFilterPipeline('all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {/* Add other filter badges similarly */}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterPipeline('all');
                    setFilterStage('all');
                    setFilterPriority('all');
                    setFilterStatus('all');
                    setFilterSource('all');
                    setFilterAssignee('all');
                    setFilterDateRange({ start: null, end: null });
                  }}
                >
                  {t.leads?.clearAll || (locale === 'tr' ? 'Tümünü Temizle' : 'Clear All')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedLeads.size} {t.leads?.bulk.selectedSuffix || (locale === 'tr' ? 'lead seçildi' : 'leads selected')}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-1" />
                    {t.leads?.bulk.addTag || (locale === 'tr' ? 'Etiket Ekle' : 'Add Tag')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    {t.leads?.bulk.assign || (locale === 'tr' ? 'Ata' : 'Assign')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-1" />
                    {t.leads?.bulk.archive || (locale === 'tr' ? 'Arşivle' : 'Archive')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t.leads?.bulk.delete || (locale === 'tr' ? 'Sil' : 'Delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={currentLeads.length > 0 && selectedLeads.size === currentLeads.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('lead_name')}
                >
                  <div className="flex items-center gap-1">
                    {t.leads?.table.leadName || (locale === 'tr' ? 'Lead Adı' : 'Lead Name')}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>{t.leads?.table.company || (locale === 'tr' ? 'Şirket' : 'Company')}</TableHead>
                <TableHead>{t.leads?.table.pipelineStage || (locale === 'tr' ? 'Pipeline/Aşama' : 'Pipeline/Stage')}</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('lead_value')}
                >
                  <div className="flex items-center gap-1">
                    {t.leads?.table.value || (locale === 'tr' ? 'Değer' : 'Value')}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>{t.leads?.table.priority || (locale === 'tr' ? 'Öncelik' : 'Priority')}</TableHead>
                <TableHead>{t.leads?.table.status || (locale === 'tr' ? 'Durum' : 'Status')}</TableHead>
                <TableHead>{t.leads?.table.assignee || (locale === 'tr' ? 'Atanan' : 'Assignee')}</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    {t.leads?.table.createdAt || (locale === 'tr' ? 'Oluşturma' : 'Created')}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>{t.leads?.table.activity || (locale === 'tr' ? 'Aktivite' : 'Activity')}</TableHead>
                <TableHead className="text-right">{t.leads?.table.actions || (locale === 'tr' ? 'İşlemler' : 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className={cn(
                    "hover:bg-gray-50 cursor-pointer",
                    selectedLeads.has(lead.id) && "bg-blue-50"
                  )}
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowDetailModal(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => handleSelectLead(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.lead_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {lead.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.contact_email}
                          </span>
                        )}
                        {lead.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.contact_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.company && (
                      <div>
                        <p className="text-sm">{lead.company.company_name}</p>
                        {lead.company.industry && (
                          <p className="text-xs text-muted-foreground">{lead.company.industry}</p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{lead.pipeline?.name}</p>
                      {lead.stage && (
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: lead.stage.color || '#6B7280' }}
                          />
                          <span className="text-xs text-muted-foreground">{lead.stage.name}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.lead_value && (
                      <p className="font-medium text-green-600">
                        ₺{lead.lead_value.toLocaleString('tr-TR')}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.priority && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "border-0",
                          priorityConfig[lead.priority].color,
                          "text-white"
                        )}
                      >
                        {priorityConfig[lead.priority].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.status && (
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          statusConfig[lead.status].color
                        )} />
                        <span className="text-sm">{statusConfig[lead.status].label}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{lead.assigned_to || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {lead.notes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {lead.activities_count || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="end">
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleEditLead(lead)}
                          >
                          <Edit className="h-4 w-4 mr-2" />
                          {t.leads?.table.edit || (locale === 'tr' ? 'Düzenle' : 'Edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => window.open(`/leads/${lead.id}/timeline`, '_blank')}
                          >
                          <Activity className="h-4 w-4 mr-2" />
                          {t.leads?.table.timeline || 'Timeline'}
                          </Button>
                          <Separator className="my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-600"
                            onClick={() => handleDeleteLead(lead)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Empty State */}
          {currentLeads.length === 0 && (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">Lead bulunamadı</p>
              <p className="text-gray-400 text-sm mb-4">
                Filtreleri değiştirmeyi deneyin veya yeni bir lead ekleyin
              </p>
              <Button onClick={handleCreateLead}>
                <PlusCircle className="h-4 w-4 mr-2" />
                İlk Lead'i Ekle
              </Button>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {startIndex + 1} - {Math.min(endIndex, filteredLeads.length)} / {filteredLeads.length} lead
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedLead(null);
        }}
        onEdit={handleEditLead}
        onDelete={handleDeleteLead}
        onAddActivity={(lead) => {
          // Implement activity modal
          toast({
            title: "Özellik yakında",
            description: "Aktivite ekleme özelliği yakında eklenecek"
          });
        }}
        onAddNote={(lead) => {
          // Implement note modal
          toast({
            title: "Özellik yakında",
            description: "Not ekleme özelliği yakında eklenecek"
          });
        }}
      />

      <LeadFormModal
        lead={editingLead}
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingLead(null);
        }}
        pipelines={pipelines}
        stages={stages}
        companies={companies}
        onSave={handleSaveLead}
      />
    </div>
  );
}