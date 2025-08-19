"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Settings,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  Target,
  MapPin,
  Edit,
  Trash2,
  GripVertical,
  ChevronRight,
  Hash,
  User,
  Clock,
  Tag,
  ArrowUpDown,
  Search,
  Filter,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  Zap,
  BarChart3
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

// Types
interface Pipeline {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  stages?: Stage[];
  lead_count?: number;
  total_value?: number;
}

interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  order_position: number;
  color: string;
  is_hidden?: boolean;
  leads?: Lead[];
  lead_count?: number;
  total_value?: number;
}

interface Lead {
  id: string;
  lead_name: string;
  contact_email?: string;
  contact_phone?: string;
  lead_value?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: string;
  description?: string;
  created_at?: string;
  follow_up_date?: string;
  stage_id: string;
  pipeline_id: string;
  company_id?: string;
  event_date?: string;
  event_time?: string;
  tags?: string[];
  assigned_to?: string;
  last_activity?: string;
  company?: {
    id: string;
    company_name: string;
  };
}

// Stage colors
const stageColors = [
  { name: 'Yeşil', value: '#10B981' },
  { name: 'Mavi', value: '#3B82F6' },
  { name: 'Sarı', value: '#F59E0B' },
  { name: 'Kırmızı', value: '#EF4444' },
  { name: 'Mor', value: '#8B5CF6' },
  { name: 'Gri', value: '#6B7280' },
];

// Priority colors
const priorityConfig = {
  urgent: { label: 'Acil', color: 'bg-red-500', icon: AlertCircle },
  high: { label: 'Yüksek', color: 'bg-orange-500', icon: TrendingUp },
  medium: { label: 'Orta', color: 'bg-yellow-500', icon: null },
  low: { label: 'Düşük', color: 'bg-green-500', icon: null }
};

export default function PipelineProductionPage() {
  const { t, locale } = useI18n();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [showCreatePipeline, setShowCreatePipeline] = useState(false);
  const [showCreateStage, setShowCreateStage] = useState(false);
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // Load pipelines
  useEffect(() => {
    loadPipelines();
  }, []);

  // Load stages and leads when pipeline changes
  useEffect(() => {
    if (selectedPipeline) {
      loadStagesAndLeads(selectedPipeline.id);
    }
  }, [selectedPipeline]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      
      // Mock data for now
      const mockPipelines: Pipeline[] = [
        {
          id: '1',
          name: 'Satış Pipeline',
          description: 'Ana satış süreci',
          is_active: true,
          lead_count: 45,
          total_value: 2500000
        },
        {
          id: '2',
          name: 'Destek Pipeline',
          description: 'Müşteri destek süreci',
          is_active: true,
          lead_count: 23,
          total_value: 450000
        }
      ];
      
      setPipelines(mockPipelines);
      setSelectedPipeline(mockPipelines[0]);
      
      // TODO: Real API call
      // const { data, error } = await supabase
      //   .from('pipelines')
      //   .select('*, stages(count), leads(count, sum(lead_value))')
      //   .eq('is_active', true);
      
    } catch (error) {
      console.error('Error loading pipelines:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? "Pipeline'lar yüklenirken hata oluştu" : 'Failed to load pipelines',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStagesAndLeads = async (pipelineId: string) => {
    try {
      // Mock stages
      const mockStages: Stage[] = [
        {
          id: '1',
          pipeline_id: pipelineId,
          name: 'Yeni Lead',
          order_position: 0,
          color: '#10B981',
          lead_count: 12,
          total_value: 450000
        },
        {
          id: '2',
          pipeline_id: pipelineId,
          name: 'İletişim Kuruldu',
          order_position: 1,
          color: '#3B82F6',
          lead_count: 8,
          total_value: 780000
        },
        {
          id: '3',
          pipeline_id: pipelineId,
          name: 'Teklif Gönderildi',
          order_position: 2,
          color: '#F59E0B',
          lead_count: 6,
          total_value: 920000
        },
        {
          id: '4',
          pipeline_id: pipelineId,
          name: 'Müzakere',
          order_position: 3,
          color: '#8B5CF6',
          lead_count: 4,
          total_value: 650000
        },
        {
          id: '5',
          pipeline_id: pipelineId,
          name: 'Kazanıldı',
          order_position: 4,
          color: '#10B981',
          lead_count: 15,
          total_value: 1200000
        }
      ];

      // Mock leads
      const mockLeads: Lead[] = [
        {
          id: '1',
          lead_name: 'Acme Corp - Yazılım Projesi',
          contact_email: 'info@acme.com',
          contact_phone: '+90 555 123 4567',
          lead_value: 150000,
          priority: 'high',
          stage_id: '1',
          pipeline_id: pipelineId,
          tags: ['Yazılım', 'Kurumsal'],
          assigned_to: 'Ahmet Yılmaz',
          last_activity: new Date().toISOString()
        },
        {
          id: '2',
          lead_name: 'Beta Tech - Danışmanlık',
          contact_email: 'contact@betatech.com',
          contact_phone: '+90 555 234 5678',
          lead_value: 85000,
          priority: 'urgent',
          stage_id: '2',
          pipeline_id: pipelineId,
          tags: ['Danışmanlık', 'Acil'],
          assigned_to: 'Ayşe Demir',
          follow_up_date: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: '3',
          lead_name: 'Gamma Ltd - Eğitim Paketi',
          contact_email: 'hr@gamma.com',
          lead_value: 45000,
          priority: 'medium',
          stage_id: '3',
          pipeline_id: pipelineId,
          tags: ['Eğitim'],
          assigned_to: 'Mehmet Kaya'
        }
      ];
      
      setStages(mockStages);
      setLeads(mockLeads);
      
      // TODO: Real API calls
      // const [stagesRes, leadsRes] = await Promise.all([
      //   supabase.from('stages').select('*').eq('pipeline_id', pipelineId).order('order_position'),
      //   supabase.from('leads').select('*, company(*)').eq('pipeline_id', pipelineId)
      // ]);
      
    } catch (error) {
      console.error('Error loading stages and leads:', error);
    }
  };

  // Handle drag and drop
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    try {
      // Update local state immediately
      const lead = leads.find(l => l.id === draggableId);
      if (!lead) return;

      const updatedLead = {
        ...lead,
        stage_id: destination.droppableId
      };

      setLeads(prev => prev.map(l => l.id === draggableId ? updatedLead : l));

      // TODO: API call
      // await supabase
      //   .from('leads')
      //   .update({ stage_id: destination.droppableId })
      //   .eq('id', draggableId);

      // Update stage counts
      const sourceStage = stages.find(s => s.id === source.droppableId);
      const destStage = stages.find(s => s.id === destination.droppableId);

      toast({
        title: "Lead taşındı",
        description: `${lead.lead_name} ${sourceStage?.name} → ${destStage?.name}`,
      });

    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: "Hata",
        description: "Lead taşınırken hata oluştu",
        variant: "destructive"
      });
    }
  };

  // Create new pipeline
  const createPipeline = async (data: Partial<Pipeline>) => {
    try {
      const newPipeline: Pipeline = {
        id: Date.now().toString(),
        name: data.name || '',
        description: data.description,
        is_active: true,
        lead_count: 0,
        total_value: 0
      };

      setPipelines(prev => [...prev, newPipeline]);
      setSelectedPipeline(newPipeline);
      setShowCreatePipeline(false);

      toast({
        title: "Pipeline oluşturuldu",
        description: `${newPipeline.name} başarıyla oluşturuldu`,
      });

      // TODO: API call
      // const { data: created } = await supabase
      //   .from('pipelines')
      //   .insert(data)
      //   .select()
      //   .single();

    } catch (error) {
      console.error('Error creating pipeline:', error);
    }
  };

  // Create new stage
  const createStage = async (data: Partial<Stage>) => {
    try {
      if (!selectedPipeline) return;

      const maxOrder = Math.max(...stages.map(s => s.order_position), -1);
      const newStage: Stage = {
        id: Date.now().toString(),
        pipeline_id: selectedPipeline.id,
        name: data.name || '',
        order_position: maxOrder + 1,
        color: data.color || '#6B7280',
        lead_count: 0,
        total_value: 0
      };

      setStages(prev => [...prev, newStage]);
      setShowCreateStage(false);

      toast({
        title: "Aşama oluşturuldu",
        description: `${newStage.name} başarıyla oluşturuldu`,
      });

    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  // Delete stage
  const deleteStage = async (stageId: string) => {
    try {
      const stage = stages.find(s => s.id === stageId);
      if (!stage) return;

      // Check if stage has leads
      const stageLeads = leads.filter(l => l.stage_id === stageId);
      if (stageLeads.length > 0) {
        toast({
          title: "Uyarı",
          description: "Bu aşamada lead'ler var. Önce lead'leri taşıyın.",
          variant: "destructive"
        });
        return;
      }

      setStages(prev => prev.filter(s => s.id !== stageId));

      toast({
        title: "Aşama silindi",
        description: `${stage.name} başarıyla silindi`,
      });

    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery || 
      lead.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_phone?.includes(searchQuery);
    
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || lead.assigned_to === filterAssignee;
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Get unique assignees
  const assignees = [...new Set(leads.map(l => l.assigned_to).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{locale === 'tr' ? 'Pipeline Yönetimi' : 'Pipeline Management'}</h1>
              {selectedPipeline && (
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Select value={selectedPipeline.id} onValueChange={(id) => setSelectedPipeline(pipelines.find(p => p.id === id) || null)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.map(pipeline => (
                        <SelectItem key={pipeline.id} value={pipeline.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{pipeline.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {pipeline.lead_count}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreatePipeline(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {locale === 'tr' ? 'Pipeline' : 'Pipeline'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreateStage(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {locale === 'tr' ? 'Aşama' : 'Stage'}
              </Button>
              <Button size="sm" onClick={() => setShowCreateLead(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {locale === 'tr' ? 'Lead Ekle' : 'Add Lead'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          {selectedPipeline && (
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{locale === 'tr' ? 'Toplam Lead:' : 'Total Leads:'}</span>
                <span className="font-medium">{selectedPipeline.lead_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{locale === 'tr' ? 'Toplam Değer:' : 'Total Value:'}</span>
                <span className="font-medium">{locale === 'tr' ? `₺${selectedPipeline.total_value?.toLocaleString('tr-TR')}` : `$${selectedPipeline.total_value?.toLocaleString('en-US')}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{locale === 'tr' ? 'Dönüşüm:' : 'Conversion:'}</span>
                <span className="font-medium">%32</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={locale === 'tr' ? 'Lead ara...' : 'Search leads...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={locale === 'tr' ? 'Öncelik' : 'Priority'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'tr' ? 'Tüm Öncelikler' : 'All Priorities'}</SelectItem>
                <SelectItem value="urgent">{locale === 'tr' ? 'Acil' : 'Urgent'}</SelectItem>
                <SelectItem value="high">{locale === 'tr' ? 'Yüksek' : 'High'}</SelectItem>
                <SelectItem value="medium">{locale === 'tr' ? 'Orta' : 'Medium'}</SelectItem>
                <SelectItem value="low">{locale === 'tr' ? 'Düşük' : 'Low'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={locale === 'tr' ? 'Atanan' : 'Assignee'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'tr' ? 'Herkes' : 'All'}</SelectItem>
                {assignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || filterPriority !== 'all' || filterAssignee !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterPriority('all');
                  setFilterAssignee('all');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                {locale === 'tr' ? 'Temizle' : 'Clear'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="container mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-600">{locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage_id === stage.id);
                const stageValue = stageLeads.reduce((sum, lead) => sum + (lead.lead_value || 0), 0);
                
                return (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                            <CardTitle className="text-base">{stage.name}</CardTitle>
                            <Badge variant="secondary" className="ml-1">
                              {stageLeads.length}
                            </Badge>
                          </div>
                          <button
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            onClick={() => setEditingStage(stage)}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                         <p className="text-sm text-gray-600 mt-1">
                           {locale === 'tr' ? `₺${stageValue.toLocaleString('tr-TR')}` : `$${stageValue.toLocaleString('en-US')}`}
                         </p>
                      </CardHeader>
                      
                      <Droppable droppableId={stage.id}>
                        {(provided, snapshot) => (
                          <CardContent
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "space-y-2 min-h-[400px] transition-colors",
                              snapshot.isDraggingOver && "bg-gray-50"
                            )}
                          >
                            {stageLeads.map((lead, index) => (
                              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all",
                                      snapshot.isDragging && "shadow-lg rotate-3"
                                    )}
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowLeadDetail(true);
                                    }}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-sm line-clamp-2">
                                        {lead.lead_name}
                                      </h4>
                                      {lead.priority && (
                                        <div className={cn(
                                          "h-6 px-2 rounded-full flex items-center justify-center",
                                          priorityConfig[lead.priority].color
                                        )}>
                                          {priorityConfig[lead.priority].icon && (() => {
                                            const Icon = priorityConfig[lead.priority].icon;
                                            return Icon ? <Icon className="h-3 w-3 text-white" /> : null;
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {lead.lead_value && (
                                      <p className="text-sm font-medium text-gray-900 mb-2">
                                        ₺{lead.lead_value.toLocaleString('tr-TR')}
                                      </p>
                                    )}
                                    
                                    <div className="space-y-1 text-xs text-gray-600">
                                      {lead.contact_email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          <span className="truncate">{lead.contact_email}</span>
                                        </div>
                                      )}
                                      {lead.contact_phone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          <span>{lead.contact_phone}</span>
                                        </div>
                                      )}
                                      {lead.assigned_to && (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          <span>{lead.assigned_to}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {lead.tags && lead.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {lead.tags.map((tag, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </CardContent>
                        )}
                      </Droppable>
                    </Card>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Create Pipeline Dialog */}
      <Dialog open={showCreatePipeline} onOpenChange={setShowCreatePipeline}>
        <DialogContent>
          <DialogHeader>
             <DialogTitle>{locale === 'tr' ? 'Yeni Pipeline Oluştur' : 'Create New Pipeline'}</DialogTitle>
             <DialogDescription>
               {locale === 'tr' ? 'Yeni bir satış süreci oluşturun' : 'Create a new sales pipeline'}
             </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createPipeline({
              name: formData.get('name') as string,
              description: formData.get('description') as string
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{locale === 'tr' ? 'Pipeline Adı' : 'Pipeline Name'}</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{locale === 'tr' ? 'Açıklama' : 'Description'}</Label>
                <Textarea id="description" name="description" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreatePipeline(false)}>
                {locale === 'tr' ? 'İptal' : 'Cancel'}
              </Button>
              <Button type="submit">{locale === 'tr' ? 'Oluştur' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Stage Dialog */}
      <Dialog open={showCreateStage} onOpenChange={setShowCreateStage}>
        <DialogContent>
          <DialogHeader>
             <DialogTitle>{locale === 'tr' ? 'Yeni Aşama Oluştur' : 'Create New Stage'}</DialogTitle>
             <DialogDescription>
               {selectedPipeline?.name} {locale === 'tr' ? 'için yeni bir aşama ekleyin' : 'add a new stage for'}
             </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createStage({
              name: formData.get('name') as string,
              color: formData.get('color') as string
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stage-name">{locale === 'tr' ? 'Aşama Adı' : 'Stage Name'}</Label>
                <Input id="stage-name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{locale === 'tr' ? 'Renk' : 'Color'}</Label>
                <Select name="color" defaultValue="#6B7280">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stageColors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateStage(false)}>
                {locale === 'tr' ? 'İptal' : 'Cancel'}
              </Button>
              <Button type="submit">{locale === 'tr' ? 'Oluştur' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stage Edit Menu */}
      {editingStage && (
        <div className="fixed inset-0 z-50" onClick={() => setEditingStage(null)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute bg-white rounded-lg shadow-lg p-2 w-48"
            style={{
              top: '200px',
              right: '100px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
              onClick={() => {
                // Edit stage
                setEditingStage(null);
              }}
            >
              <Edit className="h-4 w-4" />
              Düzenle
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 text-red-600"
              onClick={() => {
                deleteStage(editingStage.id);
                setEditingStage(null);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}