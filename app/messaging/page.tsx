/**
 * 🚀 Next-Gen Messaging Hub - WhatsApp Business API Integration
 * 
 * Revolutionary multi-channel messaging with 4-WABA architecture
 * Features: Real-time sync, AI-powered suggestions, visual thread management
 */

"use client";

import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMockAuth } from '@/components/mock-auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  Search,
  Send,
  User,
  Clock,
  CheckCheck,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Star,
  StarOff,
  Circle,
  CircleDot,
  ChevronRight,
  Check,
  Calendar,
  Target,
  Edit,
  Activity,
  Zap,
  Bot,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Video,
  MapPin,
  MoreVertical,
  Archive,
  Trash2,
  Tag,
  Users,
  PhoneCall,
  MessageCircle,
  Hash,
  Sparkles,
  Wifi,
  WifiOff,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Smartphone,
  PaletteIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Heart,
  Reply,
  Forward,
  Copy,
  Pin,
  Volume2,
  VolumeX,
  Smile
} from 'lucide-react';
// Mock client for messaging page
const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null })
  }),
  auth: {
    getUser: async () => ({ data: { user: { id: 'mock-user' } }, error: null })
  }
});
import { useInfiniteMessages } from '@/lib/providers/query-provider';
import { useMessagingStore } from '@/lib/stores/messaging-store';
// Date formatting utilities (uses locale cookie if present)
function getLocaleTag(): 'tr-TR' | 'en-US' {
  if (typeof document === 'undefined') return 'tr-TR'
  const m = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/)
  const loc = m?.[1] || (typeof navigator !== 'undefined' && navigator.language?.startsWith('en') ? 'en' : 'tr')
  return loc === 'en' ? 'en-US' : 'tr-TR'
}

const formatDistanceToNow = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const loc = getLocaleTag()
  
  if (minutes < 1) return loc === 'tr-TR' ? 'şimdi' : 'now'
  if (minutes < 60) return loc === 'tr-TR' ? `${minutes} dakika önce` : `${minutes} minutes ago`
  if (hours < 24) return loc === 'tr-TR' ? `${hours} saat önce` : `${hours} hours ago`
  if (days < 7) return loc === 'tr-TR' ? `${days} gün önce` : `${days} days ago`
  return date.toLocaleDateString(loc)
}

const format = (date: Date, formatStr: string, options?: any) => {
  const loc = getLocaleTag()
  if (formatStr === 'HH:mm') {
    return date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
  }
  if (formatStr === 'dd MMM HH:mm') {
    return date.toLocaleDateString(loc, { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  return date.toLocaleString(loc)
}
import { toast } from '@/components/ui/use-toast';
import { isBypassMode, mockLeads } from '@/lib/utils/bypass-helper';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useI18n } from '@/lib/i18n/client';

// WhatsApp Business API Types
interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: string;
  language: string;
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER';
    text?: string;
    format?: string;
  }[];
}

interface WhatsAppNumber {
  id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED';
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING';
  messaging_limit: number;
  current_limit: number;
}

interface Lead {
  id: string;
  lead_name: string;
  contact_phone?: string;
  contact_email?: string;
  last_message_at?: string;
  unread_count?: number;
  pipeline_id?: string;
  stage_id?: string;
  event_date?: string;
  event_time?: string;
  avatar_url?: string;
  company?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  location?: string;
  last_seen?: string;
  is_online?: boolean;
}

interface Message {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'template' | 'interactive';
  content: string;
  media_url?: string;
  thumbnail_url?: string;
  is_outbound: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at?: string;
  metadata?: {
    template_name?: string;
    button_payload?: string;
    location?: { lat: number; lng: number; name?: string };
    duration?: number;
    file_size?: number;
    file_name?: string;
  };
  reactions?: { emoji: string; count: number }[];
  reply_to?: string;
  forwarded_from?: string;
  phone_number_id?: string;
}

interface MessageThread {
  lead_id: string;
  lead: Lead;
  last_message?: Message;
  messages?: Message[];
  unread_count: number;
  starred_count?: number;
  total_messages: number;
  is_starred?: boolean;
  is_archived?: boolean;
  is_muted?: boolean;
  channel: 'whatsapp' | 'sms' | 'email' | 'note';
  phone_number_id?: string;
  typing_indicator?: boolean;
  last_activity?: string;
}

export default function MessagingPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { user } = useMockAuth()
  
  // Demo kullanıcı kontrolü - messaging erişimini kısıtla
  const isDemoUser = user?.email?.includes('demo.') || user?.email?.includes('@happycrm.com');
  
  // Demo kullanıcıları bilgilendirme sayfasına yönlendir
  useEffect(() => {
    if (isDemoUser) {
      router.replace('/demo-messaging-info');
    }
  }, [isDemoUser, router]);
  
  // Demo kullanıcılar için boş sayfa göster
  if (isDemoUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <MessageSquare className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600">Messaging Kısıtlı</h2>
          <p className="text-gray-500">Demo kullanıcılar messaging özelliğine erişemez.</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Dashboard'a Dön
          </Button>
        </div>
      </div>
    );
  }
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<'all' | 'whatsapp' | 'sms' | 'email' | 'note'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedWhatsAppNumber, setSelectedWhatsAppNumber] = useState<string>('all');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showTagManager, setShowTagManager] = useState(false);
  const [selectedTagThread, setSelectedTagThread] = useState<string | null>(null);
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessagePhone, setNewMessagePhone] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageTemplate, setNewMessageTemplate] = useState<WhatsAppTemplate | null>(null);
  const [newMessageType, setNewMessageType] = useState<'text' | 'template'>('text');
  
  // Lead ekleme için yeni state'ler
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addLeadPhone, setAddLeadPhone] = useState('');
  const [addLeadForm, setAddLeadForm] = useState({
    lead_name: '',
    company: '',
    contact_email: '',
    notes: ''
  });
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // WhatsApp Business Numbers - Gerçek API ile entegre
  const whatsappNumbers: WhatsAppNumber[] = [
    {
      id: '1',
      phone_number_id: '793146130539824', // TODO: Update to correct Phone Number ID for +447782610222
      display_phone_number: '+447782610222', // Updated to correct number
      verified_name: 'Happy Smile Clinics',
      quality_rating: 'GREEN',
      status: 'CONNECTED',
      messaging_limit: 1000,
      current_limit: 850
    }
  ];

  // Quick Reply Templates
  const quickReplies = [
    { id: '1', text: 'Merhaba! Size nasıl yardımcı olabilirim? 😊' },
    { id: '2', text: 'Randevunuz onaylanmıştır. Görüşmek üzere! 👍' },
    { id: '3', text: 'Belirttiğiniz tarih müsait. Onaylıyor musunuz?' },
    { id: '4', text: 'Teşekkür ederiz! En kısa sürede dönüş yapacağız.' },
    { id: '5', text: 'Daha fazla bilgi için web sitemizi ziyaret edebilirsiniz.' }
  ];

  // Available Tags
  const availableTags = [
    { id: '1', name: 'VIP', color: 'bg-purple-500' },
    { id: '2', name: 'Yeni Müşteri', color: 'bg-green-500' },
    { id: '3', name: 'Destek', color: 'bg-blue-500' },
    { id: '4', name: 'Satış', color: 'bg-orange-500' },
    { id: '5', name: 'Şikayet', color: 'bg-red-500' },
    { id: '6', name: 'Bilgi', color: 'bg-gray-500' }
  ];
  
  // Add/Remove tags
  const toggleTag = async (leadId: string, tagName: string) => {
    try {
      const thread = threads.find(t => t.lead_id === leadId);
      if (!thread) return;
      
      const currentTags = thread.lead.tags || [];
      const hasTag = currentTags.includes(tagName);
      
      const newTags = hasTag 
        ? currentTags.filter(t => t !== tagName)
        : [...currentTags, tagName];
      
      // Update local state
      setThreads(prev => prev.map(t => 
        t.lead_id === leadId 
          ? { 
              ...t, 
              lead: { ...t.lead, tags: newTags }
            }
          : t
      ));
      
      // TODO: API call
      // await supabase.from('leads').update({ tags: newTags }).eq('id', leadId);
      
      toast({
        title: hasTag ? "Etiket kaldırıldı" : "Etiket eklendi",
        description: `${tagName} etiketi ${hasTag ? 'kaldırıldı' : 'eklendi'}`,
      });
    } catch (error) {
      console.error('Error toggling tag:', error);
    }
  };
  
  // Delete message
  const deleteMessage = async (threadId: string, messageId: string) => {
    try {
      // Update local state
      setThreads(prev => prev.map(thread => 
        thread.lead_id === threadId && thread.messages
          ? { 
              ...thread, 
              messages: thread.messages.filter(msg => msg.id !== messageId)
            }
          : thread
      ));
      
      // TODO: API call
      // await supabase.from('messages').delete().eq('id', messageId);
      
      toast({
        title: locale === 'tr' ? 'Mesaj silindi' : 'Message deleted',
        description: locale === 'tr' ? 'Mesaj başarıyla silindi' : 'Message deleted successfully',
      });
      
      setShowMessageActions(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Pipeline ve stage verileri
  const pipelines: any[] = [];
  const stages: any[] = [];
  
  const supabase = createMockClient();
  const { threads: storeThreads } = useMessagingStore();

  // Generate mock messages
  const generateMockMessages = (leadId: string): Message[] => {
    const messages: Message[] = [];
    const messageCount = Math.floor(Math.random() * 15) + 5;
    const phoneNumberId = whatsappNumbers[Math.floor(Math.random() * whatsappNumbers.length)].phone_number_id;
    
    for (let i = 0; i < messageCount; i++) {
      const isOutbound = Math.random() > 0.5;
      const messageTypes: Message['type'][] = ['text', 'text', 'text', 'image', 'video', 'audio', 'document', 'location', 'template'];
      const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      let content = '';
      let media_url: string | undefined;
      let metadata: Message['metadata'] | undefined;
      
      switch (type) {
        case 'text':
          const textTemplates = [
            'Merhaba, randevum hakkında bilgi almak istiyorum.',
            'Teşekkür ederim, çok yardımcı oldunuz!',
            'Belirtmiş olduğunuz tarih benim için uygun.',
            'Biraz daha düşünmem gerekiyor, size dönüş yapacağım.',
            'Fiyat konusunda bilgi alabilir miyim?',
            'Harika! Yarın görüşmek üzere.',
            'Bu konuda size nasıl ulaşabilirim?',
            'Merhaba! Size nasıl yardımcı olabilirim? 😊',
            'Randevunuz başarıyla oluşturuldu. ✅',
            'Lütfen belirtmiş olduğunuz tarihi onaylayınız.',
            'Sizin için en uygun zaman dilimi nedir?',
            'Detaylı bilgi için size bir doküman gönderiyorum.'
          ];
          content = textTemplates[Math.floor(Math.random() * textTemplates.length)];
          break;
        case 'image':
          content = 'Fotoğraf';
          media_url = `https://picsum.photos/seed/${Math.random()}/400/300`;
          break;
        case 'video':
          content = 'Video';
          media_url = 'https://example.com/video.mp4';
          metadata = { duration: Math.floor(Math.random() * 300) + 30 };
          break;
        case 'audio':
          content = 'Ses mesajı';
          media_url = 'https://example.com/audio.mp3';
          metadata = { duration: Math.floor(Math.random() * 60) + 10 };
          break;
        case 'document':
          content = 'Doküman';
          media_url = 'https://example.com/document.pdf';
          metadata = { 
            file_name: 'Randevu_Detayları.pdf',
            file_size: Math.floor(Math.random() * 5000000) + 100000
          };
          break;
        case 'location':
          content = 'Konum paylaşıldı';
          metadata = {
            location: {
              lat: 41.0082 + (Math.random() - 0.5) * 0.1,
              lng: 28.9784 + (Math.random() - 0.5) * 0.1,
              name: 'Happy Clinic'
            }
          };
          break;
        case 'template':
          content = 'Randevu hatırlatması: Yarın saat 14:00';
          metadata = { template_name: 'appointment_reminder' };
          break;
      }
      
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - messageCount + i);
      
      messages.push({
        id: `msg-${leadId}-${i}`,
        type,
        content,
        media_url,
        is_outbound: isOutbound,
        status: isOutbound ? 
          (i === messageCount - 1 ? 'sent' : i === messageCount - 2 ? 'delivered' : 'read') : 
          undefined,
        created_at: createdAt.toISOString(),
        metadata,
        phone_number_id: phoneNumberId,
        reactions: Math.random() > 0.8 ? [
          { emoji: '👍', count: Math.floor(Math.random() * 3) + 1 }
        ] : undefined
      });
    }
    
    return messages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  // Generate mock threads with rich data
  const generateMockThreads = (): MessageThread[] => {
    const priorities: Lead['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const companies = ['Acme Corp', 'TechStart', 'Global Solutions', 'Innovation Labs', 'Digital Agency'];
    const locations = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];
    const assignees = ['Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Fatma Öztürk'];
    
    return mockLeads.map((lead, index) => {
      const messages = generateMockMessages(lead.id);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0;
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const isOnline = Math.random() > 0.6;
      const phoneNumberId = whatsappNumbers[Math.floor(Math.random() * whatsappNumbers.length)].phone_number_id;
      
      const enrichedLead: Lead = {
        ...lead,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        tags: index === 0 ? ['VIP', 'Yeni Müşteri'] : index === 1 ? ['Destek'] : index === 2 ? ['Satış'] : [],
        priority,
        assigned_to: assignees[Math.floor(Math.random() * assignees.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        last_seen: isOnline ? 'Çevrimiçi' : formatDistanceToNow(new Date(lastMessage.created_at)),
        is_online: isOnline
      };
      
      return {
        lead_id: lead.id,
        lead: enrichedLead,
        last_message: lastMessage,
        messages,
        unread_count: unreadCount,
        starred_count: index === 0 ? 2 : index === 1 ? 1 : 0,
        total_messages: messages.length,
        is_starred: index === 0 || index === 2,
        is_archived: false,
        is_muted: index === 4,
        channel: 'whatsapp',
        phone_number_id: phoneNumberId,
        typing_indicator: index === 1 && Math.random() > 0.5,
        last_activity: lastMessage.created_at
      };
    });
  };

  // Mesaj thread'lerini yükle
  useEffect(() => {
    loadMessageThreads();
    loadWhatsAppTemplates();
  }, [activeChannel, showUnreadOnly, showStarredOnly, showArchivedOnly, selectedWhatsAppNumber, selectedTags, selectedPriority]);

  // WhatsApp template'lerini yükle
  const loadWhatsAppTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/templates');
      const result = await response.json();
      
      if (result.success) {
        setWhatsappTemplates(result.templates);
        console.log('📋 WhatsApp template\'leri yüklendi:', result.templates);
      } else {
        console.error('❌ WhatsApp template\'leri yüklenemedi:', result.error);
      }
    } catch (error) {
      console.error('WhatsApp template\'leri yükleme hatası:', error);
    }
  };

  // WhatsApp mesajı gönder
  const sendWhatsAppMessage = async (to: string, message: string, isTemplate: boolean = false, templateName?: string, languageCode?: string) => {
    try {
      const endpoint = isTemplate ? '/api/whatsapp/send-template' : '/api/whatsapp/send-test';
      const body = isTemplate ? {
        to,
        templateName: templateName || 'hello_world',
        languageCode: languageCode || 'en_US'
      } : {
        to,
        message
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        // Başarı mesajını sadece normal gönderimde göster
        if (!isTemplate) {
          toast({
            title: locale === 'tr' ? 'Başarılı' : 'Success',
            description: locale === 'tr' ? 'Mesaj başarıyla gönderildi' : 'Message sent successfully',
          });
        }
        
        return result.messageId;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('WhatsApp mesajı gönderme hatası:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Mesaj gönderilemedi' : 'Failed to send message',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Lead ekleme fonksiyonu
  const addAsLead = async () => {
    if (!addLeadPhone || !addLeadForm.lead_name) {
      toast({
        title: 'Hata',
        description: 'İsim alanı zorunludur',
        variant: 'destructive'
      });
      return;
    }

    try {
      const supabase = createMockClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          lead_name: addLeadForm.lead_name,
          contact_phone: addLeadPhone,
          contact_email: addLeadForm.contact_email,
          company: addLeadForm.company,
          notes: addLeadForm.notes,
          source: 'whatsapp',
          status: 'new',
          created_by: user?.id,
          metadata: {
            added_from: 'messaging'
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Lead başarıyla eklendi',
      });

      // Modal'ı kapat ve formu temizle
      setShowAddLeadModal(false);
      setAddLeadForm({
        lead_name: '',
        company: '',
        contact_email: '',
        notes: ''
      });

      // Thread'leri yenile
      await loadMessageThreads();
      
      // Yeni lead'i seç
      if (newLead) {
        setSelectedLeadId(newLead.id);
      }
    } catch (error) {
      console.error('Lead ekleme hatası:', error);
      toast({
        title: 'Hata',
        description: 'Lead eklenemedi',
        variant: 'destructive'
      });
    }
  };

  // Yeni mesaj gönder
  const sendNewMessage = async () => {
    if (!newMessagePhone.trim()) {
      toast({
        title: 'Hata',
        description: 'Telefon numarası gerekli',
        variant: 'destructive'
      });
      return;
    }

    if (newMessageType === 'text' && !newMessageText.trim()) {
      toast({
        title: 'Hata',
        description: 'Mesaj metni gerekli',
        variant: 'destructive'
      });
      return;
    }

    if (newMessageType === 'template' && !newMessageTemplate) {
      toast({
        title: 'Hata',
        description: 'Template seçimi gerekli',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let messageId;
      const formattedPhone = newMessagePhone.startsWith('+') ? newMessagePhone : `+90${newMessagePhone.replace(/\D/g, '')}`;
      
      if (newMessageType === 'template' && newMessageTemplate) {
        messageId = await sendWhatsAppMessage(
          formattedPhone,
          '',
          true,
          newMessageTemplate.name,
          newMessageTemplate.language
        );
      } else {
        messageId = await sendWhatsAppMessage(
          formattedPhone,
          newMessageText.trim()
        );
      }

      if (messageId) {
        // Modal'ı hemen kapat
        setShowNewMessageModal(false);
        
        // Formu temizle
        setNewMessagePhone('');
        setNewMessageText('');
        setNewMessageTemplate(null);
        setNewMessageType('text');
        
        // Mesaj thread'lerini yenile ve konuşmayı seç
        await loadMessageThreads();
        
        // Thread'leri yenile ve otomatik seç
        setTimeout(async () => {
          await loadMessageThreads();
          
          // State güncellenmiş thread'leri kullan
          setThreads(prevThreads => {
            const cleanPhone = formattedPhone.replace(/[^0-9+]/g, '');
            const threadToSelect = prevThreads.find(t => {
              const threadPhone = t.lead?.contact_phone?.replace(/[^0-9+]/g, '');
              return threadPhone === cleanPhone || 
                     threadPhone === cleanPhone.replace('+90', '') ||
                     threadPhone === '+90' + cleanPhone.replace('+', '');
            });
            
            if (threadToSelect) {
              setSelectedLeadId(threadToSelect.lead_id);
            }
            
            return prevThreads;
          });
        }, 800);
        
        toast({
          title: 'Başarılı',
          description: 'Mesaj gönderildi ve konuşma açılıyor...',
        });
      }
    } catch (error) {
      console.error('Yeni mesaj gönderme hatası:', error);
      toast({
        title: 'Hata',
        description: 'Mesaj gönderilemedi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessageThreads = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Loading message threads from API...');
      
      // Fetch data from API instead of direct Supabase
      const response = await fetch('/api/messaging/threads');
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error fetching threads from API:', result.error);
        throw new Error(result.error);
      }
      
      const realThreads = result.threads || [];
      console.log('🧵 Threads loaded from API:', realThreads.length);
      
      // Apply filters
      let filteredThreads = realThreads;
      
      if (activeChannel !== 'all') {
        filteredThreads = filteredThreads.filter(t => t.channel === activeChannel);
      }
      
      if (showUnreadOnly) {
        filteredThreads = filteredThreads.filter(t => t.unread_count > 0);
      }
      
      if (showStarredOnly) {
        filteredThreads = filteredThreads.filter(t => t.is_starred);
      }
      
      if (showArchivedOnly) {
        filteredThreads = filteredThreads.filter(t => t.is_archived);
      }
      
      if (selectedWhatsAppNumber !== 'all') {
        filteredThreads = filteredThreads.filter(t => t.phone_number_id === selectedWhatsAppNumber);
      }
      
      if (selectedTags.length > 0) {
        filteredThreads = filteredThreads.filter(t => 
          t.lead.tags?.some(tag => selectedTags.includes(tag))
        );
      }
      
      if (selectedPriority !== 'all') {
        filteredThreads = filteredThreads.filter(t => t.lead.priority === selectedPriority);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredThreads = filteredThreads.filter(t => 
          t.lead.lead_name.toLowerCase().includes(query) ||
          t.lead.contact_phone?.includes(query) ||
          t.lead.contact_email?.toLowerCase().includes(query) ||
          t.lead.company?.toLowerCase().includes(query)
        );
      }
      
      console.log('✅ Final filtered threads:', filteredThreads.length);
      setThreads(filteredThreads);
      
      // If no real data found, show a message
      if (filteredThreads.length === 0) {
        console.log('⚠️ No real data found, showing mock data as fallback');
        const mockThreads = generateMockThreads();
        setThreads(mockThreads);
        
        toast({
          title: 'Bilgi',
          description: 'Gerçek veri bulunamadı, örnek veriler gösteriliyor',
        });
      } else {
        console.log('✅ Real data loaded successfully');
      }
      
    } catch (error) {
      console.error('Error loading message threads:', error);
      toast({
        title: locale === 'tr' ? 'Hata' : 'Error',
        description: locale === 'tr' ? 'Mesaj konuşmaları yüklenirken hata oluştu' : 'Failed to load message threads',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'sms':
        return 'bg-blue-500/10 text-blue-600';
      case 'email':
        return 'bg-purple-500/10 text-purple-600';
      case 'note':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-muted';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive';
      case 'high':
        return 'bg-orange-500/80';
      case 'medium':
        return 'bg-amber-500/80';
      case 'low':
        return 'bg-emerald-500/80';
      default:
        return 'bg-muted';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-3 w-3" />;
      case 'high':
        return <TrendingUp className="h-3 w-3" />;
      case 'medium':
        return <TrendingDown className="h-3 w-3" />;
      case 'low':
        return <Circle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return format(messageDate, 'HH:mm');
                    } else if (isYesterday) {
                      return t.messaging.yesterday + ' ' + format(messageDate, 'HH:mm');
    } else {
                      return format(messageDate, 'dd MMM HH:mm');
    }
  };

  const selectedThread = threads.find(t => t.lead_id === selectedLeadId);

  // Mesajı okundu olarak işaretle
  const markAsRead = async (leadId: string) => {
    try {
      // Update local state immediately
      setThreads(prev => prev.map(thread => 
        thread.lead_id === leadId 
          ? { ...thread, unread_count: 0 }
          : thread
      ));
      
      // TODO: API call to mark messages as read
      // await supabase.from('messages').update({ is_read: true }).eq('lead_id', leadId);
      
      toast({
        title: locale === 'tr' ? '✓ Okundu' : '✓ Read',
        description: locale === 'tr' ? 'Mesajlar okundu olarak işaretlendi' : 'Messages marked as read',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Yıldız durumunu değiştir
  const toggleStar = async (leadId: string) => {
    try {
      const thread = threads.find(t => t.lead_id === leadId);
      if (!thread) return;
      
      const newStarredState = !thread.is_starred;
      
      // Update local state
      setThreads(prev => prev.map(t => 
        t.lead_id === leadId 
          ? { ...t, is_starred: newStarredState }
          : t
      ));
      
      // TODO: API call to update starred status
      // await supabase.from('lead_threads').update({ is_starred: newStarredState }).eq('lead_id', leadId);
      
      toast({
        title: newStarredState ? (locale === 'tr' ? '⭐ Yıldızlandı' : '⭐ Starred') : (locale === 'tr' ? '☆ Yıldız kaldırıldı' : '☆ Unstarred'),
        description: newStarredState ? (locale === 'tr' ? 'Konuşma yıldızlı listesine eklendi' : 'Conversation added to starred list') : (locale === 'tr' ? 'Konuşma yıldızlı listesinden çıkarıldı' : 'Conversation removed from starred list'),
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Archive thread
  const toggleArchive = async (leadId: string) => {
    try {
      const thread = threads.find(t => t.lead_id === leadId);
      if (!thread) return;
      
      const newArchivedState = !thread.is_archived;
      
      // Update local state
      setThreads(prev => prev.map(t => 
        t.lead_id === leadId 
          ? { ...t, is_archived: newArchivedState }
          : t
      ));
      
      // TODO: API call
      // await supabase.from('lead_threads').update({ is_archived: newArchivedState }).eq('lead_id', leadId);
      
      toast({
        title: newArchivedState ? (locale === 'tr' ? '📁 Arşivlendi' : '📁 Archived') : (locale === 'tr' ? '📂 Arşivden çıkarıldı' : '📂 Unarchived'),
        description: newArchivedState ? (locale === 'tr' ? 'Konuşma arşive taşındı' : 'Conversation moved to archive') : (locale === 'tr' ? 'Konuşma aktif listeye alındı' : 'Conversation returned to active list'),
      });
      
      // If archived, deselect the thread
      if (newArchivedState && selectedLeadId === leadId) {
        setSelectedLeadId(null);
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  // Mute thread
  const toggleMute = async (leadId: string) => {
    try {
      const thread = threads.find(t => t.lead_id === leadId);
      if (!thread) return;
      
      const newMutedState = !thread.is_muted;
      
      // Update local state
      setThreads(prev => prev.map(t => 
        t.lead_id === leadId 
          ? { ...t, is_muted: newMutedState }
          : t
      ));
      
      // TODO: API call
      // await supabase.from('lead_threads').update({ is_muted: newMutedState }).eq('lead_id', leadId);
      
      toast({
        title: newMutedState ? "🔕 Sessize alındı" : "🔔 Ses açıldı",
        description: newMutedState ? "Bu konuşmadan bildirim almayacaksınız" : "Bu konuşmadan bildirim alacaksınız",
      });
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedLeadId) return;
    
    const selectedThread = threads.find(t => t.lead_id === selectedLeadId);
    if (!selectedThread) return;
    
    try {
      // Create new message
      const tempId = `temp-${Date.now()}`;
      const newMessage: Message = {
        id: tempId,
        type: 'text',
        content: messageText.trim(),
        is_outbound: true,
        status: 'sent',
        created_at: new Date().toISOString(),
        phone_number_id: selectedThread.phone_number_id
      };
      
      // Save original content before clearing
      const originalContent = messageText.trim();
      
      // Clear input immediately
      setMessageText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
      
      // Update thread with new message optimistically
      setThreads(prev => prev.map(thread => 
        thread.lead_id === selectedLeadId 
          ? { 
              ...thread, 
              messages: [...(thread.messages || []), newMessage],
              last_message: newMessage,
              last_activity: newMessage.created_at,
              unread_count: 0
            }
          : thread
      ));
      
      // Scroll to bottom
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Save message to database - basit API kullan
      const response = await fetch('/api/messaging/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: selectedLeadId,
          phoneNumber: selectedThread.lead.contact_phone,
          channel: selectedThread.channel,
          content: originalContent
        }),
      });
    
    if (response.ok) {
      const { message: savedMessage } = await response.json();
      
      // Update with real message ID
      setThreads(prev => prev.map(thread => 
        thread.lead_id === selectedLeadId && thread.messages
          ? { 
              ...thread, 
              messages: thread.messages.map(msg => 
                msg.id === tempId ? { ...msg, id: savedMessage.id } : msg
              )
            }
          : thread
      ));
      
      // Thread'leri yenile
      setTimeout(() => {
        loadMessageThreads();
      }, 500);
    }
      
      // WhatsApp API ile mesaj gönder
      if (selectedThread.channel === 'whatsapp' && selectedThread.lead.contact_phone) {
        const messageId = await sendWhatsAppMessage(
          selectedThread.lead.contact_phone,
          originalContent
        );
        
        if (messageId) {
          // Message ID'yi güncelle
          setThreads(prev => prev.map(thread => 
            thread.lead_id === selectedLeadId && thread.messages
              ? { 
                  ...thread, 
                  messages: thread.messages.map(msg => 
                    msg.id === tempId ? { ...msg, id: messageId, status: 'delivered' } : msg
                  )
                }
              : thread
          ));
        }
      }
      
      // Simulate status updates for other channels
      if (selectedThread.channel !== 'whatsapp') {
        setTimeout(() => {
          setThreads(prev => prev.map(thread => 
            thread.lead_id === selectedLeadId && thread.messages
              ? { 
                  ...thread, 
                  messages: thread.messages.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'delivered' } : msg
                  )
                }
              : thread
          ));
        }, 1500);
        
        setTimeout(() => {
          setThreads(prev => prev.map(thread => 
            thread.lead_id === selectedLeadId && thread.messages
              ? { 
                  ...thread, 
                  messages: thread.messages.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'read' } : msg
                  )
                }
              : thread
          ));
        }, 3000);
      }
      
      toast({
        title: locale === 'tr' ? '✓ Gönderildi' : '✓ Sent',
        description: locale === 'tr' ? 'Mesaj başarıyla gönderildi' : 'Message sent successfully',
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: locale === 'tr' ? '❌ Hata' : '❌ Error',
        description: locale === 'tr' ? 'Mesaj gönderilemedi' : 'Failed to send message',
        variant: 'destructive'
      });
      
      // Revert optimistic update
      setThreads(prev => prev.map(thread => 
        thread.lead_id === selectedLeadId && thread.messages
          ? { 
              ...thread, 
              messages: thread.messages.filter(msg => msg.id !== tempId)
            }
          : thread
      ));
    }
  };

  // Handle file attachment
  const handleFileAttachment = (type: 'image' | 'video' | 'document') => {
    fileInputRef.current?.click();
    setShowAttachmentMenu(false);
  };

  // Handle emoji
  const addEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Lead seçildiğinde okundu olarak işaretle
  React.useEffect(() => {
    if (selectedLeadId) {
      markAsRead(selectedLeadId);
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedLeadId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20">
      {/* WhatsApp Business Header */}
      <div className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-medium text-gray-900">
                    {t.messaging.headerTitle}
                  </h1>
                  <p className="text-xs text-gray-500">{t.messaging.headerSubtitle}</p>
                </div>
              </div>
              
              {/* WhatsApp Number Selector */}
              <div className="flex items-center gap-2 ml-6">
                <select 
                  value={selectedWhatsAppNumber}
                  onChange={(e) => setSelectedWhatsAppNumber(e.target.value)}
                  className="text-sm bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:bg-white"
                >
                  <option value="all">{t.messaging.allLines}</option>
                  {whatsappNumbers.map(num => (
                    <option key={num.id} value={num.phone_number_id}>
                      {num.verified_name} • {num.display_phone_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Stats & Actions */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {whatsappNumbers.slice(0, 1).map(num => (
                  <div key={num.id} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      num.status === 'CONNECTED' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                    <span className="text-gray-600">{t.messaging.connected}</span>
                  </div>
                ))}
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                {threads.filter(t => t.unread_count > 0).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-6 px-2 bg-green-500 text-white rounded-full text-xs font-medium flex items-center">
                      {threads.filter(t => t.unread_count > 0).length}
                    </span>
                    <span className="text-gray-600">{t.messaging.newMessages}</span>
                  </div>
                )}
                
                {/* Refresh Button */}
                <Button
                  onClick={() => loadMessageThreads()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
                
                {/* Yeni Mesaj Butonu */}
                <Button
                  onClick={() => setShowNewMessageModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-green-500/25 transition-all duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  Yeni Mesaj
                </Button>
                
                <button 
                  className="text-green-600 hover:text-green-700 transition-colors"
                  title="WhatsApp Test Console"
                  onClick={() => window.location.href = '/messaging/whatsapp-test'}
                >
                  <Zap className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => window.location.href = '/messaging/whatsapp-settings'}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Sidebar - Thread List */}
        <div className="w-80 lg:w-96 border-r bg-white flex flex-col flex-shrink-0">
          {/* Search & Filters */}
          <div className="p-3 space-y-2 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            {/* Search with advanced toggle */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder={t.messaging.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:bg-white shadow-sm"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className={cn("h-4 w-4 text-gray-400", showAdvancedFilters && "text-green-600")} />
              </button>
            </div>

            {/* Channel Filters */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveChannel('all')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-xl transition-all duration-200 font-medium",
                  activeChannel === 'all' 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25" 
                    : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-md"
                )}
              >
                {t.messaging.channelAll}
              </button>
              <button
                onClick={() => setActiveChannel('whatsapp')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  activeChannel === 'whatsapp' 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25" 
                    : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-md"
                )}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveChannel('sms')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  activeChannel === 'sms' 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25" 
                    : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-md"
                )}
              >
                <Phone className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showUnreadOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="h-7 text-xs gap-1.5"
              >
                <CircleDot className="h-3 w-3" />
                {t.messaging.quickUnread}
                {threads.filter(t => t.unread_count > 0).length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1">
                    {threads.filter(t => t.unread_count > 0).length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={showStarredOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className="h-7 text-xs gap-1.5"
              >
                <Star className="h-3 w-3" />
                {t.messaging.quickStarred}
              </Button>
              <Button
                variant={showArchivedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchivedOnly(!showArchivedOnly)}
                className="h-7 text-xs gap-1.5"
              >
                <Archive className="h-3 w-3" />
                {t.messaging.quickArchived}
              </Button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t.messaging.advancedFilters.tags}</label>
                    <div className="flex flex-wrap gap-1">
                      {availableTags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs h-6",
                            selectedTags.includes(tag.name) && tag.color
                          )}
                          onClick={() => {
                            if (selectedTags.includes(tag.name)) {
                              setSelectedTags(selectedTags.filter(t => t !== tag.name));
                            } else {
                              setSelectedTags([...selectedTags, tag.name]);
                            }
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t.messaging.advancedFilters.priority}</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full text-xs bg-background border rounded-md px-2 py-1.5"
                    >
                      <option value="all">{t.messaging.advancedFilters.allPriorities}</option>
                      <option value="urgent">{t.messaging.advancedFilters.urgent}</option>
                      <option value="high">{t.messaging.advancedFilters.high}</option>
                      <option value="medium">{t.messaging.advancedFilters.medium}</option>
                      <option value="low">{t.messaging.advancedFilters.low}</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Thread List */}
          <ScrollArea className="flex-1 bg-gradient-to-b from-gray-50 to-white">
            <LayoutGroup>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <MessageSquare className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{t.messaging.emptyTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.messaging.emptyDesc}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {threads.map((thread) => {
                    const whatsappNumber = whatsappNumbers.find(n => n.phone_number_id === thread.phone_number_id);
                    return (
                      <motion.div
                        key={thread.lead_id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "group relative hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-200 border-b border-gray-100",
                          selectedLeadId === thread.lead_id && "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500",
                          thread.is_muted && "opacity-60"
                        )}
                      >
                        <div className="flex items-start p-3 gap-3">
                          {/* Checkbox */}
                          <div className="pt-2">
                            <Checkbox
                              checked={selectedThreadIds.includes(thread.lead_id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedThreadIds([...selectedThreadIds, thread.lead_id]);
                                } else {
                                  setSelectedThreadIds(selectedThreadIds.filter(id => id !== thread.lead_id));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          
                          {/* Avatar with Online Status */}
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={thread.lead.avatar_url} />
                              <AvatarFallback className="text-xs bg-muted">
                                {thread.lead.lead_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {thread.lead.is_online && (
                              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                            )}
                            {thread.typing_indicator && (
                              <div className="absolute -bottom-1 -right-1 bg-muted rounded-full p-1">
                                <div className="flex gap-0.5">
                                  <div className="h-1 w-1 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="h-1 w-1 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="h-1 w-1 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setSelectedLeadId(thread.lead_id)}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm truncate">
                                    {thread.lead.lead_name}
                                  </h4>
                                  {thread.is_starred && (
                                    <Star className="h-3 w-3 text-gray-400 fill-gray-400 flex-shrink-0" />
                                  )}
                                  {thread.lead.priority === 'urgent' && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  )}
                                  {thread.is_muted && (
                                    <VolumeX className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  {thread.lead.company && (
                                    <span className="truncate">{thread.lead.company}</span>
                                  )}
                                  {thread.lead.location && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {thread.lead.location}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">
                    {thread.last_message && formatMessageDate(thread.last_message.created_at)}
                  </span>
                                {thread.unread_count > 0 && (
                                  <span className="text-xs font-medium bg-green-500 text-white rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                                    {thread.unread_count}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Message Preview */}
                            {thread.last_message && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {thread.last_message.is_outbound && (
                                    <CheckCheck className={cn(
                                      "h-3.5 w-3.5 flex-shrink-0",
                                      thread.last_message.status === 'read' ? "text-blue-500" : "text-gray-400"
                                    )} />
                                  )}
                                  <p className="text-sm text-gray-600 truncate">
                                     {thread.last_message.type === 'image' && (locale === 'tr' ? '🖼️ Fotoğraf' : '🖼️ Photo')}
                                     {thread.last_message.type === 'video' && '🎥 Video'}
                                     {thread.last_message.type === 'audio' && (locale === 'tr' ? '🎵 Ses mesajı' : '🎵 Voice message')}
                                     {thread.last_message.type === 'document' && (locale === 'tr' ? '📄 Doküman' : '📄 Document')}
                                     {thread.last_message.type === 'location' && (locale === 'tr' ? '📍 Konum' : '📍 Location')}
                                    {thread.last_message.type === 'text' && thread.last_message.content}
                                  </p>
                                </div>
                                
                                {/* Tags & WhatsApp Number */}
                                <div className="flex items-center gap-2">
                                  {whatsappNumber && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        whatsappNumber.quality_rating === 'GREEN' ? 'bg-emerald-500' :
                                        whatsappNumber.quality_rating === 'YELLOW' ? 'bg-amber-500' : 'bg-destructive'
                                      )} />
                                      <span className="truncate">{whatsappNumber.verified_name}</span>
                                    </div>
                                  )}
                                  {thread.lead.tags && thread.lead.tags.length > 0 && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <div className="flex gap-1">
                                        {thread.lead.tags.slice(0, 2).map(tag => {
                                          const tagConfig = availableTags.find(t => t.name === tag);
                                          return (
                                            <span 
                                              key={tag} 
                                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                            >
                                              {tag}
                                            </span>
                                          );
                                        })}
                                        {thread.lead.tags.length > 2 && (
                                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                            +{thread.lead.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions Menu */}
                          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTagThread(selectedTagThread === thread.lead_id ? null : thread.lead_id);
                              }}
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {selectedTagThread === thread.lead_id && (
                               <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                                <button
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStar(thread.lead_id);
                                    setSelectedTagThread(null);
                                  }}
                                >
                                  {thread.is_starred ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                                  {thread.is_starred ? (locale === 'tr' ? 'Yıldızı kaldır' : 'Unstar') : (locale === 'tr' ? 'Yıldızla' : 'Star')}
                                </button>
                                <button
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMute(thread.lead_id);
                                    setSelectedTagThread(null);
                                  }}
                                >
                                  {thread.is_muted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                  {thread.is_muted ? (locale === 'tr' ? 'Sesi aç' : 'Unmute') : (locale === 'tr' ? 'Sessize al' : 'Mute')}
                                </button>
                                <button
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleArchive(thread.lead_id);
                                    setSelectedTagThread(null);
                                  }}
                                >
                                  <Archive className="h-4 w-4" />
                                  {thread.is_archived ? (locale === 'tr' ? 'Arşivden çıkar' : 'Unarchive') : (locale === 'tr' ? 'Arşivle' : 'Archive')}
                                </button>
                                <button
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(thread.lead_id);
                                    setSelectedTagThread(null);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                  {locale === 'tr' ? 'Okundu işaretle' : 'Mark as read'}
                                </button>
                                <div className="h-px bg-gray-200" />
                                <div className="p-2">
                                  <p className="text-xs font-medium text-gray-500 mb-1">{t.messaging.advancedFilters.tags}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {availableTags.map(tag => (
                                      <button
                                        key={tag.id}
                                        className={cn(
                                          "px-2 py-0.5 rounded text-xs transition-all",
                                          thread.lead.tags?.includes(tag.name)
                                            ? "bg-gray-800 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTag(thread.lead_id, tag.name);
                                        }}
                                      >
                                        {tag.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </LayoutGroup>
          </ScrollArea>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedThreadIds.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t bg-background/80 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedThreadIds.length} {locale === 'tr' ? 'seçili' : 'selected'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        selectedThreadIds.forEach(id => markAsRead(id));
                        setSelectedThreadIds([]);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {locale === 'tr' ? 'Okundu' : 'Mark read'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        selectedThreadIds.forEach(id => toggleArchive(id));
                        setSelectedThreadIds([]);
                      }}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      {locale === 'tr' ? 'Arşivle' : 'Archive'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedThreadIds([])}
                    >
                      {locale === 'tr' ? 'İptal' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="h-14 border-b bg-white/95 backdrop-blur-sm px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Lead Info */}
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={selectedThread.lead?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {selectedThread.lead?.lead_name ? 
                        selectedThread.lead.lead_name.split(' ').map(n => n[0]).join('').toUpperCase() :
                        '?'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">
                        {selectedThread.lead?.lead_name || selectedThread.lead?.contact_phone || 'Bilinmeyen'}
                      </h3>
                      
                      {/* Lead yoksa "Lead Olarak Ekle" butonu */}
                      {!selectedThread.lead?.lead_name && selectedThread.lead?.contact_phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => {
                            setAddLeadPhone(selectedThread.lead.contact_phone || '');
                            setShowAddLeadModal(true);
                          }}
                        >
                          <User className="h-3 w-3 mr-1" />
                          Lead Olarak Ekle
                        </Button>
                      )}
                      
                      {selectedThread.lead?.is_online && (
                        <span className="text-xs text-green-600 flex items-center gap-1.5">
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                          {locale === 'tr' ? 'Çevrimiçi' : 'Online'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selectedThread.lead.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedThread.lead.contact_phone}
                        </span>
                      )}
                      {selectedThread.lead.company && (
                        <>
                          <span>•</span>
                          <span>{selectedThread.lead.company}</span>
                        </>
                      )}
                      {!selectedThread.lead.is_online && selectedThread.lead.last_seen && (
                        <>
                          <span>•</span>
                          <span>{locale === 'tr' ? 'Son görülme' : 'Last seen'}: {selectedThread.lead.last_seen}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Search in messages */}
                  <div className="relative">
                    <Input
                      placeholder={locale === 'tr' ? 'Mesajlarda ara...' : 'Search in messages...'}
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="w-48 h-8 text-xs pl-8"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  </div>
                  
                  <div className="h-6 w-px bg-border" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStar(selectedLeadId)}
                    className="h-8 w-8 p-0"
                  >
                    {selectedThread.is_starred ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMute(selectedLeadId)}
                    className="h-8 w-8 p-0"
                  >
                    {selectedThread.is_muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleArchive(selectedLeadId)}
                    className="h-8 w-8 p-0"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(selectedThread.lead);
                      setShowLeadDetail(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="p-4 space-y-2 max-w-3xl mx-auto">
                  {/* Date Separator */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                     <span className="text-xs text-gray-500 px-2">{t.messaging.today}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  
                  {/* Messages */}
                  {selectedThread.messages?.map((message, index) => {
                    const showAvatar = index === 0 || 
                      selectedThread.messages![index - 1].is_outbound !== message.is_outbound;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-2 mb-3",
                          message.is_outbound ? "justify-end" : "justify-start"
                        )}
                      >
                        {/* Sol avatar - sadece incoming mesajlar için */}
                        {!message.is_outbound && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedThread.lead.avatar_url} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {selectedThread.lead.lead_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        {/* Mesaj baloncuğu - düzeltilmiş boyutlar */}
                        <div className={cn(
                          "group relative flex flex-col max-w-[70%] sm:max-w-[60%] lg:max-w-[50%]",
                          message.is_outbound ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "relative inline-block rounded-2xl px-3 py-2 shadow-sm",
                            message.is_outbound 
                              ? "bg-green-500 text-white rounded-br-sm" 
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                          )}>
                            {/* Reply Indicator */}
                            {message.reply_to && (
                              <div className="border-l-2 border-primary/20 pl-2 mb-1 pb-1">
                                <p className="text-xs opacity-70 line-clamp-1">
                                  Replying to message...
                                </p>
                              </div>
                            )}
                            
                            {/* Mesaj içeriği */}
                            {message.type === 'text' && (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            )}
                            
                            {message.type === 'image' && (
                              <div className="space-y-2">
                                <img 
                                  src={message.media_url} 
                                  alt="" 
                                  className="rounded-lg max-w-[250px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(message.media_url)}
                                />
                                {message.content && (
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                )}
                              </div>
                            )}
                            
                            {message.type === 'video' && (
                              <div className="space-y-2">
                                <div className="relative bg-black rounded-lg overflow-hidden cursor-pointer group max-w-[250px]">
                                  <video 
                                    src={message.media_url} 
                                    className="w-full h-auto max-h-[300px] object-cover" 
                                    controls
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <Video className="h-12 w-12 text-white" />
                                  </div>
                                </div>
                                {message.metadata?.duration && (
                                  <span className="text-xs opacity-70">
                                    {Math.floor(message.metadata.duration / 60)}:{String(message.metadata.duration % 60).padStart(2, '0')}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {message.type === 'audio' && (
                              <div className="flex items-center gap-3 min-w-[200px] p-2">
                                <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                  <Mic className="h-5 w-5" />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="h-1 bg-white/30 rounded-full">
                                    <div className="h-full w-1/3 bg-white/70 rounded-full" />
                                  </div>
                                  {message.metadata?.duration && (
                                    <span className="text-xs opacity-70 mt-1 block">
                                      {Math.floor(message.metadata.duration / 60)}:{String(message.metadata.duration % 60).padStart(2, '0')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {message.type === 'document' && (
                              <div className="flex items-center gap-3 min-w-[200px] cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg bg-white/10">
                                <FileText className="h-8 w-8 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{message.metadata?.file_name || 'Document'}</p>
                                  {message.metadata?.file_size && (
                                    <p className="text-xs opacity-70">
                                      {(message.metadata.file_size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {message.type === 'location' && message.metadata?.location && (
                              <div className="space-y-2 min-w-[200px]">
                                <div className="relative h-32 w-full bg-gray-200 rounded-lg overflow-hidden">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <MapPin className="h-8 w-8 text-red-500" />
                                  </div>
                                </div>
                                <div>
                      <p className="text-sm font-medium">{message.metadata.location.name || (locale === 'tr' ? 'Konum' : 'Location')}</p>
                                  <p className="text-xs opacity-70">
                                    {message.metadata.location.lat.toFixed(6)}, {message.metadata.location.lng.toFixed(6)}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {message.type === 'template' && (
                              <div className="space-y-2">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded text-xs">
                                  <FileText className="h-3 w-3" />
                                  {message.metadata?.template_name}
                                </div>
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                            )}
                            
                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {message.reactions.map((reaction, i) => (
                                  <div key={i} className="flex items-center bg-background/50 rounded-full px-1.5 py-0.5">
                                    <span className="text-xs">{reaction.emoji}</span>
                                    {reaction.count > 1 && (
                                      <span className="text-xs ml-0.5">{reaction.count}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Zaman ve durum - daha küçük */}
                            <div className="flex items-center gap-1 mt-1">
                              <span className={cn(
                                "text-[10px]",
                                message.is_outbound ? "text-white/70" : "text-gray-400"
                              )}>
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                              {message.is_outbound && message.status && (
                                <>
                                  {message.status === 'sent' && <Check className="h-3 w-3 text-white/60" />}
                                  {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-white/60" />}
                                  {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-200" />}
                                  {message.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-300" />}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Message Actions - Hidden for cleaner UI */}
                        </div>
                        
                        {message.is_outbound && !showAvatar && (
                          <div className="w-2 flex-shrink-0" />
                        )}
                      </motion.div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {typingUsers.has(selectedThread.lead_id) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedThread.lead.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {selectedThread.lead.lead_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <span>{selectedThread.lead.lead_name} yazıyor</span>
                        <div className="flex gap-0.5">
                          <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
              
              {/* Quick Replies */}
              <AnimatePresence>
                {showQuickReplies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-background/80 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-medium text-muted-foreground">{t.messaging.quickReplies}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowQuickReplies(false)}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map(reply => (
                        <Button
                          key={reply.id}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setMessageText(reply.text);
                            setShowQuickReplies(false);
                            textareaRef.current?.focus();
                          }}
                        >
                          {reply.text}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Message Composer */}
              <div className="border-t bg-white/95 backdrop-blur-sm p-3">
                {/* Attachment Preview */}
                {/* TODO: Add attachment preview */}
                
                {/* Composer */}
                <div className="flex items-end gap-2 max-w-3xl mx-auto w-full">
                  {/* Attachment Button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-200"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    <AnimatePresence>
                      {showAttachmentMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[180px]"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                            onClick={() => handleFileAttachment('image')}
                          >
                           <ImageIcon className="h-4 w-4" />
                           {locale === 'tr' ? 'Fotoğraf' : 'Photo'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                            onClick={() => handleFileAttachment('video')}
                          >
                            <Video className="h-4 w-4" />
                            Video
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                            onClick={() => handleFileAttachment('document')}
                          >
                           <FileText className="h-4 w-4" />
                           {locale === 'tr' ? 'Doküman' : 'Document'}
                          </Button>
                          <Separator className="my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                          >
                           <MapPin className="h-4 w-4" />
                           {locale === 'tr' ? 'Konum' : 'Location'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder={t.messaging.messagePlaceholder}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[44px] max-h-[120px] pr-10 resize-none bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors duration-200"
                      rows={1}
                    />
                    
                    {/* Template Button - Sadece WhatsApp için */}
                    {selectedThread?.channel === 'whatsapp' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-12 bottom-2 h-6 w-6 p-0"
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                        title="Template Seç"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Emoji Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 bottom-2 h-6 w-6 p-0"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <span className="text-lg">😊</span>
                    </Button>
                  </div>
                  
                  {/* Voice Message / Send Button */}
                  {messageText.trim() ? (
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
                      onClick={sendMessage}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-200"
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <Mic className={cn("h-5 w-5", isRecording && "text-red-500 animate-pulse")} />
                    </Button>
                  )}
                </div>
                
                {/* Bottom Info */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>
                        {whatsappNumbers.find(n => n.phone_number_id === selectedThread.phone_number_id)?.verified_name}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      {whatsappNumbers.find(n => n.phone_number_id === selectedThread.phone_number_id)?.display_phone_number}
                    </span>
                  </div>
                  
                  <button
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                  >
                     <Zap className="h-4 w-4" />
                     {t.messaging.quickReplies}
                  </button>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,application/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload
                    console.log('File selected:', file);
                  }
                }}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/20">
              <div className="text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
                  <MessageSquare className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-gray-900">{t.messaging.selectChatTitle}</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    {t.messaging.selectChatDesc}
                  </p>
                </div>
                <Button
                  onClick={() => setShowNewMessageModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Yeni Sohbet Başlat
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Lead Details (Optional) */}
        {selectedThread && false && (
          <div className="w-80 border-l bg-background/50 p-4">
            {/* Lead details, tags, notes, etc. */}
          </div>
        )}
      </div>

      {/* Gerçek Zamanlı Takip - Geçici olarak kapalı */}
      {/* {selectedLeadId && (
        <div className="mt-6">
          <MessageHistoryTracker leadId={selectedLeadId} />
        </div>
      )} */}

      {/* Lead Detay Modalı */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={showLeadDetail}
        onClose={() => setShowLeadDetail(false)}
        pipelines={pipelines}
        stages={stages}
        onEdit={() => {
          // Düzenleme işlevi - şu an boş
          toast({
            title: "Düzenleme",
            description: "Düzenleme özelliği henüz aktif değil",
          });
        }}
      />

      {/* Template Seçici Modal */}
      <TemplateSelectorModal
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        templates={whatsappTemplates}
        onSelectTemplate={(template) => {
          setSelectedTemplate(template);
          setShowTemplateSelector(false);
          
          // Template seçildiğinde mesajı gönder
          if (selectedLeadId && selectedThread?.lead.contact_phone) {
            sendWhatsAppMessage(
              selectedThread.lead.contact_phone,
              '', // Template mesajları için boş
              true, // Template mesajı
              template.name,
              template.language
            );
          }
        }}
      />

      {/* Lead Ekleme Modal'ı */}
      <Dialog open={showAddLeadModal} onOpenChange={setShowAddLeadModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lead Olarak Ekle</DialogTitle>
            <DialogDescription>
              {addLeadPhone} numarasını lead olarak kaydedin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lead_name" className="text-right">
                İsim *
              </Label>
              <Input
                id="lead_name"
                value={addLeadForm.lead_name}
                onChange={(e) => setAddLeadForm(prev => ({ ...prev, lead_name: e.target.value }))}
                className="col-span-3"
                placeholder="Müşteri adı"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Şirket
              </Label>
              <Input
                id="company"
                value={addLeadForm.company}
                onChange={(e) => setAddLeadForm(prev => ({ ...prev, company: e.target.value }))}
                className="col-span-3"
                placeholder="Şirket adı (opsiyonel)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                value={addLeadForm.contact_email}
                onChange={(e) => setAddLeadForm(prev => ({ ...prev, contact_email: e.target.value }))}
                className="col-span-3"
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notlar
              </Label>
              <Textarea
                id="notes"
                value={addLeadForm.notes}
                onChange={(e) => setAddLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                className="col-span-3"
                placeholder="Ek notlar..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLeadModal(false)}>
              İptal
            </Button>
            <Button onClick={addAsLead}>
              Lead Olarak Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Yeni Mesaj Modalı */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => {
          setShowNewMessageModal(false);
          setNewMessagePhone('');
          setNewMessageText('');
          setNewMessageTemplate(null);
          setNewMessageType('text');
        }}
        phone={newMessagePhone}
        onPhoneChange={setNewMessagePhone}
        text={newMessageText}
        onTextChange={setNewMessageText}
        template={newMessageTemplate}
        onTemplateChange={setNewMessageTemplate}
        messageType={newMessageType}
        onMessageTypeChange={setNewMessageType}
        templates={whatsappTemplates}
        onSend={sendNewMessage}
      />
    </div>
  );
}

// Lead Detay Modalı Bileşeni
function LeadDetailModal({ 
  lead, 
  isOpen, 
  onClose,
  pipelines,
  stages,
  onEdit
}: { 
  lead: Lead | null; 
  isOpen: boolean; 
  onClose: () => void;
  pipelines: any[];
  stages: any[];
  onEdit: (lead: Lead) => void;
}) {
  if (!lead) return null;

  const pipeline = pipelines.find((p: any) => p.id === lead.pipeline_id);
  const stage = stages.find((s: any) => s.id === lead.stage_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.lead_name}</DialogTitle>
          <DialogDescription>Müşteri Detayları</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Müşteri Bilgileri */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">MÜŞTERİ BİLGİLERİ</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{lead.lead_name}</span>
              </div>
              
              {lead.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${lead.contact_phone}`}
                    className="text-primary hover:underline"
                  >
                    {lead.contact_phone}
                  </a>
                </div>
              )}
              
              {lead.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${lead.contact_email}`}
                    className="text-primary hover:underline"
                  >
                    {lead.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Pipeline - Stage */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">PIPELINE - STAGE</h3>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>
                {pipeline?.name || 'Belirtilmemiş'} 
                {stage && (
                  <>
                    <ChevronRight className="h-4 w-4 inline mx-1 text-muted-foreground" />
                    <Badge 
                      style={{ backgroundColor: stage.color || '#3B82F6' }}
                      className="text-white"
                    >
                      {stage.name}
                    </Badge>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Event Date - Event Time */}
          {(lead.event_date || lead.event_time) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">EVENT TARİH - SAAT</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {lead.event_date || 'Tarih belirtilmemiş'}
                    {lead.event_time && (
                      <>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <Clock className="h-4 w-4 inline mr-1 text-muted-foreground" />
                        {lead.event_time}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button 
            onClick={() => {
              onClose();
              onEdit(lead);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <Button 
            variant="default"
            onClick={() => {
              onClose();
              window.location.href = `/leads/${lead.id}/timeline`;
            }}
          >
            <Activity className="h-4 w-4 mr-2" />
            Zaman Çizelgesi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Template Seçici Modal
function TemplateSelectorModal({ 
  isOpen, 
  onClose, 
  templates, 
  onSelectTemplate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  templates: WhatsAppTemplate[]; 
  onSelectTemplate: (template: WhatsAppTemplate) => void; 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>WhatsApp Template Seç</DialogTitle>
          <DialogDescription>
            Göndermek istediğiniz template'i seçin. Template'ler Meta tarafından onaylanmıştır.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz template bulunmuyor</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <Badge 
                    variant={template.status === 'APPROVED' ? 'default' : 'secondary'}
                    className={template.status === 'APPROVED' ? 'bg-green-500' : ''}
                  >
                    {template.status === 'APPROVED' ? 'Onaylı' : 'Beklemede'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {template.components.map((component, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-gray-600">
                        {component.type === 'HEADER' ? 'Başlık' : 
                         component.type === 'BODY' ? 'İçerik' : 'Alt Bilgi'}:
                      </span>
                      <p className="text-gray-800 mt-1">{component.text}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>Dil: {template.language}</span>
                  <span>Kategori: {template.category}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button 
            onClick={() => {
              if (selectedTemplate) {
                onSelectTemplate(selectedTemplate);
                onClose();
              }
            }}
            disabled={!selectedTemplate}
          >
            Template Seç
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Yeni Mesaj Modalı
function NewMessageModal({
  isOpen,
  onClose,
  phone,
  onPhoneChange,
  text,
  onTextChange,
  template,
  onTemplateChange,
  messageType,
  onMessageTypeChange,
  templates,
  onSend
}: {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  text: string;
  onTextChange: (text: string) => void;
  template: WhatsAppTemplate | null;
  onTemplateChange: (template: WhatsAppTemplate | null) => void;
  messageType: 'text' | 'template';
  onMessageTypeChange: (type: 'text' | 'template') => void;
  templates: WhatsAppTemplate[];
  onSend: () => void;
}) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Yeni WhatsApp Mesajı
          </DialogTitle>
          <DialogDescription>
            Yeni bir WhatsApp mesajı gönderin. Normal mesaj veya onaylı template kullanabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Telefon Numarası */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefon Numarası *</label>
            <Input
              placeholder="905327994223 (başında 90 ile)"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Türkiye numaraları için 90 ile başlayın, uluslararası format kullanın
            </p>
          </div>

          {/* Mesaj Tipi Seçimi */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mesaj Tipi</label>
            <div className="flex gap-2">
              <Button
                variant={messageType === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMessageTypeChange('text')}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Normal Mesaj
              </Button>
              <Button
                variant={messageType === 'template' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMessageTypeChange('template')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Template Mesaj
              </Button>
            </div>
          </div>

          {/* Mesaj İçeriği */}
          {messageType === 'text' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Mesaj Metni *</label>
              <Textarea
                placeholder="Mesajınızı yazın..."
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Seçimi *</label>
              {template ? (
                <div className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge className="bg-green-500">Onaylı</Badge>
                  </div>
                  <div className="space-y-1">
                    {template.components.map((component, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-600">
                          {component.type === 'HEADER' ? 'Başlık' : 
                           component.type === 'BODY' ? 'İçerik' : 'Alt Bilgi'}:
                        </span>
                        <p className="text-gray-800">{component.text}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTemplateChange(null)}
                    className="mt-2"
                  >
                    Template Değiştir
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Template seçmek için tıklayın</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateSelector(true)}
                  >
                    Template Seç
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Numarası Bilgisi */}
                           <div className="bg-gray-50 rounded-lg p-3">
                   <div className="flex items-center gap-2 text-sm">
                     <div className="h-2 w-2 bg-green-500 rounded-full" />
                     <span className="font-medium">WhatsApp Numarası:</span>
                     <span>+447782610222 (Happy Smile Clinics)</span>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">
                     Mesaj bu numaradan gönderilecektir
                   </p>
                 </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button 
            onClick={onSend}
            disabled={
              !phone.trim() || 
              (messageType === 'text' && !text.trim()) ||
              (messageType === 'template' && !template)
            }
            className="bg-green-500 hover:bg-green-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Mesaj Gönder
          </Button>
        </DialogFooter>

        {/* Template Seçici Modal */}
        <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template Seç</DialogTitle>
              <DialogDescription>
                Göndermek istediğiniz template'i seçin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz template bulunmuyor</p>
                </div>
              ) : (
                templates.map((templateItem) => (
                  <div
                    key={templateItem.id}
                    className="border rounded-lg p-4 cursor-pointer transition-colors hover:border-green-300"
                    onClick={() => {
                      onTemplateChange(templateItem);
                      setShowTemplateSelector(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{templateItem.name}</h3>
                      <Badge 
                        variant={templateItem.status === 'APPROVED' ? 'default' : 'secondary'}
                        className={templateItem.status === 'APPROVED' ? 'bg-green-500' : ''}
                      >
                        {templateItem.status === 'APPROVED' ? 'Onaylı' : 'Beklemede'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {templateItem.components.map((component, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-600">
                            {component.type === 'HEADER' ? 'Başlık' : 
                             component.type === 'BODY' ? 'İçerik' : 'Alt Bilgi'}:
                          </span>
                          <p className="text-gray-800 mt-1">{component.text}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Dil: {templateItem.language}</span>
                      <span>Kategori: {templateItem.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
                İptal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}