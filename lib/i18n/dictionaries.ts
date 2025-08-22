import type { Locale } from "./config"

export interface Dictionaries {
  common: {
    demo: string
    admin: string
    profile: string
    settings: string
    logout: string
    login: string
    menu: string
    loading: string
    loadingAuth: string
    close: string
    edit: string
    cancel: string
    dataTable?: {
      columns: string
      noResults: string
      searchPlaceholder: string
      rowsSelected: (selected: number, total: number) => string
    }
  }
  nav: {
    dashboard: string
    pipeline: string
    leads: string
    messaging: string
    adminPanel: string
    notificationSettings: string
  }
  dashboard: {
    title: string
    welcome: (email: string) => string
    toPipelines: string
    toLeads: string
    stats: {
      totalLeads: string
      activePipelines: string
      totalValue: string
      conversionRate: string
      thisMonthAdded: (count: number) => string
      totalStages: string
      pipelineSummaryTitle: string
      pipelineSummaryDesc: string
      noPipelineData: string
      recentLeadsTitle: string
      recentLeadsDesc: string
      noLeads: string
    }
    quickActionsTitle: string
    quickActionsDesc: string
    quickNewLead: string
    quickPipelineManage: string
    quickPipelineView: string
  }
  home: {
    hero: {
      title: string
      subtitle: string
      description: string
      getStarted: string
      viewDemo: string
    }
    features: {
      title: string
      subtitle: string
      whatsapp: {
        title: string
        description: string
      }
      leadManagement: {
        title: string
        description: string
      }
      analytics: {
        title: string
        description: string
      }
      automation: {
        title: string
        description: string
      }
      teamCollaboration: {
        title: string
        description: string
      }
      security: {
        title: string
        description: string
      }
    }
    cta: {
      title: string
      subtitle: string
      button: string
    }
  }
  settings: {
    pageTitle: string
    account: { title: string, desc: string, cta: string }
    notifications: { title: string, desc: string, cta: string }
  }
  profile: {
    notLogged: string
    title: string
    desc: string
    email: string
    role: string
    userId: string
    createdAt: string
    accountSettings: string
    changePassword: string
  }
  leads?: {
    pageTitle: string
    loading: string
    searchPlaceholder: string
    filters: {
      pipeline: string
      stage: string
      priority: string
      status: string
      source: string
      assignee: string
      dateRange: string
      allPipelines: string
      allStages: string
      allPriorities: string
      allStatuses: string
      allSources: string
      everyone: string
      advancedFilters: string
    }
    activeFilters: string
    searchLabel: string
    clearAll: string
    bulk: {
      selectedSuffix: string
      addTag: string
      assign: string
      archive: string
      delete: string
    }
    table: {
      leadName: string
      company: string
      pipelineStage: string
      value: string
      priority: string
      status: string
      assignee: string
      createdAt: string
      activity: string
      actions: string
      edit: string
      timeline: string
    }
    dialog: {
      createTitle: string
      editTitle: string
      createDesc: string
      editDesc: string
      leadName: string
      company: string
      companySearch: string
      companyEmpty: string
      companySelect: string
      email: string
      phone: string
    }
  }
  messaging: {
    headerTitle: string
    headerSubtitle: string
    allLines: string
    connected: string
    newMessages: string
    searchPlaceholder: string
    channelAll: string
    quickUnread: string
    quickStarred: string
    quickArchived: string
    advancedFilters: {
      tags: string
      priority: string
      allPriorities: string
      urgent: string
      high: string
      medium: string
      low: string
    }
    emptyTitle: string
    emptyDesc: string
    selectChatTitle: string
    selectChatDesc: string
    typing: (name: string) => string
    quickReplies: string
    messagePlaceholder: string
    today: string
    yesterday: string
  }
  admin?: {
    agencies: {
      title: string
      newAgency: string
      name: string
      contact: string
      createdAt: string
      status: string
      actions: string
      active: string
      inactive: string
      manage: string
      empty: string
      error: string
    }
    users?: {
      title: string
      newUser: string
      allUsers: string
      refreshList: string
      table: {
        user: string
        role: string
        agencies: string
        createdAt: string
        actions: string
        noUsers: string
        noUsername: string
        manager: string
        agent: string
        noAgencyMembership: string
        removeFromAgency: string
      }
    }
    settings?: {
      pageTitle: string
      pageDesc: string
      userMgmt: { title: string, desc: string, allUsers: string }
      agencies: { title: string, desc: string, view: string, create: string }
      transfers: { title: string, desc: string, all: string, create: string }
      tools: { title: string, desc: string, twilioTest: string, emailTest: string }
      monitor: { title: string, desc: string, notificationMonitor: string }
      system: { title: string, version: string, lastUpdate: string, permissionSystem: string }
    }
  }
}

const tr: Dictionaries = {
  common: {
    demo: "DEMO",
    admin: "Admin",
    profile: "Profil",
    settings: "Ayarlar",
    logout: "Çıkış Yap",
    login: "Giriş Yap",
    menu: "Menü",
    loading: "Yükleniyor...",
    loadingAuth: "Kimlik doğrulanıyor...",
    close: "Kapat",
    edit: "Düzenle",
    cancel: "İptal",
    dataTable: {
      columns: "Sütunlar",
      noResults: "Sonuç bulunamadı.",
      searchPlaceholder: "Ara...",
      rowsSelected: (s, t) => `${s} / ${t} satır seçildi.`
    }
  },
  leads: {
    pageTitle: "Müşteri Adayları",
    loading: "Yükleniyor...",
    searchPlaceholder: "Lead, email, telefon veya etiket ara...",
    filters: {
      pipeline: "Pipeline",
      stage: "Aşama",
      priority: "Öncelik",
      status: "Durum",
      source: "Kaynak",
      assignee: "Atanan",
      dateRange: "Tarih Aralığı",
      allPipelines: "Tüm Pipeline",
      allStages: "Tüm Aşamalar",
      allPriorities: "Tüm Öncelikler",
      allStatuses: "Tüm Durumlar",
      allSources: "Tüm Kaynaklar",
      everyone: "Herkes",
      advancedFilters: "Gelişmiş Filtreler"
    },
    activeFilters: "Aktif filtreler:",
    searchLabel: "Arama:",
    clearAll: "Tümünü Temizle",
    bulk: {
      selectedSuffix: "lead seçildi",
      addTag: "Etiket Ekle",
      assign: "Ata",
      archive: "Arşivle",
      delete: "Sil"
    },
    table: {
      leadName: "Lead Adı",
      company: "Şirket",
      pipelineStage: "Pipeline/Aşama",
      value: "Değer",
      priority: "Öncelik",
      status: "Durum",
      assignee: "Atanan",
      createdAt: "Oluşturma",
      activity: "Aktivite",
      actions: "İşlemler",
      edit: "Düzenle",
      timeline: "Zaman Çizelgesi"
    },
    dialog: {
      createTitle: "Yeni Lead Oluştur",
      editTitle: "Lead Düzenle",
      createDesc: "Lead bilgilerini doldurun",
      editDesc: "Lead bilgilerini güncelleyin",
      leadName: "Lead Adı *",
      company: "Şirket",
      companySearch: "Şirket ara...",
      companyEmpty: "Şirket bulunamadı.",
      companySelect: "Şirket seçin...",
      email: "Email",
      phone: "Telefon"
    }
  },
  nav: {
    dashboard: "Gösterge Paneli",
    pipeline: "Pipeline",
    leads: "Müşteri Adayları",
    messaging: "Mesajlaşma",
    adminPanel: "Admin Panel",
    notificationSettings: "Bildirim Ayarları",
  },
  dashboard: {
    title: "Dashboard",
    welcome: (email) => `Hoş geldiniz, ${email}`,
    toPipelines: "Pipeline (Şehirler)",
    toLeads: "Müşteri Adayları",
    stats: {
      totalLeads: "Toplam Müşteri Adayı",
      activePipelines: "Aktif Pipeline",
      totalValue: "Toplam Değer",
      conversionRate: "Dönüşüm Oranı",
      thisMonthAdded: (count) => `Bu ay +${count} yeni`,
      totalStages: "Toplam stage sayısı",
      pipelineSummaryTitle: "Pipeline Özeti",
      pipelineSummaryDesc: "Her aşamadaki müşteri adayları ve toplam değerleri",
      noPipelineData: "Henüz pipeline verisi yok",
      recentLeadsTitle: "Son Müşteri Adayları",
      recentLeadsDesc: "En son eklenen 5 müşteri adayı",
      noLeads: "Henüz müşteri adayı yok",
    },
    quickActionsTitle: "Hızlı İşlemler",
    quickActionsDesc: "Sık kullanılan işlemlere hızlı erişim",
    quickNewLead: "Yeni Müşteri Adayı",
    quickPipelineManage: "Pipeline Yönetimi",
    quickPipelineView: "Pipeline Görünümü",
  },
  home: {
    hero: {
      title: "Happy CRM",
      subtitle: "Müşteri ilişkileri ve WhatsApp mesajlaşma platformu",
      description: "Lead'lerinizi yönetin, mesajlaşmayı otomatikleştirin ve işinizi büyütün",
      getStarted: "Başlayın",
      viewDemo: "Demo Görün"
    },
    features: {
      title: "Neden Happy CRM?",
      subtitle: "Müşteri ilişkilerinizi yönetmek ve işinizi büyütmek için ihtiyacınız olan her şey",
      whatsapp: {
        title: "WhatsApp Business API",
        description: "WhatsApp üzerinden müşterilerinizle profesyonel mesajlaşma. Template mesajları ve otomatik yanıtlar."
      },
      leadManagement: {
        title: "Müşteri ve Lead Yönetimi",
        description: "Lead takibi, pipeline yönetimi ve müşteri ilişkileri. Satış süreçlerinizi optimize edin."
      },
      analytics: {
        title: "Analiz ve Raporlama",
        description: "Müşteri etkileşimleriniz, mesaj performansı ve satış metrikleri hakkında detaylı analiz."
      },
      automation: {
        title: "Otomasyon",
        description: "Akıllı iş akışları ile tekrarlayan görevleri otomatikleştirin. Otomatik yanıtlar ve takip dizileri."
      },
      teamCollaboration: {
        title: "Takım İşbirliği",
        description: "Ekibinizle birlikte çalışın. Lead'leri atayın, konuşmaları paylaşın ve takım performansını takip edin."
      },
      security: {
        title: "Güvenli ve Güvenilir",
        description: "Kurumsal düzeyde güvenlik ve veri şifreleme. Müşteri verileriniz güvende ve gizlilik düzenlemelerine uygun."
      }
    },
    cta: {
      title: "Müşteri ilişkilerinizi dönüştürmeye hazır mısınız?",
      subtitle: "Happy CRM kullanarak müşteri yönetimini ve WhatsApp iletişimini kolaylaştıran binlerce işletmeye katılın.",
      button: "Yolculuğunuza Başlayın"
    }
  },
  settings: {
    pageTitle: "Kullanıcı Ayarları",
    account: { title: "Hesap Ayarları", desc: "Hesap bilgilerinizi ve şifrenizi buradan yönetebilirsiniz", cta: "Hesap Ayarlarını Yönet" },
    notifications: { title: "Bildirim Ayarları", desc: "Bildirim tercihlerinizi buradan yönetebilirsiniz", cta: "Bildirim Ayarlarını Yönet" },
  },
  profile: {
    notLogged: "Giriş yapmış bir kullanıcı bulunamadı.",
    title: "Profil Bilgileri",
    desc: "Hesap bilgilerinizi görüntüleyin ve yönetin",
    email: "E-posta Adresi",
    role: "Kullanıcı Rolü",
    userId: "Kullanıcı ID",
    createdAt: "Hesap Oluşturulma Tarihi",
    accountSettings: "Hesap Ayarları",
    changePassword: "Şifre Değiştir",
  },
  messaging: {
    headerTitle: "WhatsApp Business",
    headerSubtitle: "Mesajlaşma Merkezi",
    allLines: "Tüm Hatlar",
    connected: "Bağlı",
    newMessages: "yeni mesaj",
    searchPlaceholder: "Kişi veya mesaj ara...",
    channelAll: "Tümü",
    quickUnread: "Okunmamış",
    quickStarred: "Yıldızlı",
    quickArchived: "Arşiv",
    advancedFilters: {
      tags: "Etiketler",
      priority: "Öncelik",
      allPriorities: "Tüm Öncelikler",
      urgent: "Acil",
      high: "Yüksek",
      medium: "Orta",
      low: "Düşük",
    },
    emptyTitle: "Mesaj bulunamadı",
    emptyDesc: "Arama kriterlerinizi değiştirip tekrar deneyin",
    selectChatTitle: "Sohbet seçin",
    selectChatDesc: "Sol taraftaki listeden bir sohbet seçin veya yeni bir sohbet başlatın",
    typing: (name) => `${name} yazıyor`,
    quickReplies: "Hızlı Yanıtlar",
    messagePlaceholder: "Bir mesaj yazın...",
    today: "Bugün",
    yesterday: "Dün",
  },
  admin: {
    agencies: {
      title: "Ajans Yönetimi",
      newAgency: "Yeni Ajans Oluştur",
      name: "Ajans Adı",
      contact: "İletişim Bilgisi",
      createdAt: "Oluşturulma Tarihi",
      status: "Durum",
      actions: "İşlemler",
      active: "Aktif",
      inactive: "Pasif",
      manage: "Yönet",
      empty: "Henüz ajans bulunmuyor.",
      error: "Ajanslar yüklenirken bir hata oluştu."
    },
    users: {
      title: "Kullanıcı Yönetimi",
      newUser: "Yeni Kullanıcı",
      allUsers: "Tüm Kullanıcılar",
      refreshList: "Listeyi Yenile",
      table: {
        user: "Kullanıcı",
        role: "Rol",
        agencies: "Ajanslar",
        createdAt: "Kayıt Tarihi",
        actions: "İşlemler",
        noUsers: "Kullanıcı bulunamadı",
        noUsername: "Kullanıcı adı yok",
        manager: "Yönetici",
        agent: "Ajans",
        noAgencyMembership: "Ajans üyeliği yok",
        removeFromAgency: "Bu ajanstan çıkar"
      }
    },
    settings: {
      pageTitle: "Admin Ayarları",
      pageDesc: "Sistem yönetimi ve kullanıcı işlemleri için admin araçları",
      userMgmt: { title: "Kullanıcı Yönetimi", desc: "Kullanıcıları görüntüle ve yönet", allUsers: "Tüm Kullanıcılar" },
      agencies: { title: "Ajans Yönetimi", desc: "Ajansları yönet", view: "Ajansları Görüntüle", create: "Ajans & Kullanıcı Oluştur" },
      transfers: { title: "Transfer İşlemleri", desc: "Transfer yönetimi", all: "Tüm Transferler", create: "Yeni Transfer" },
      tools: { title: "Test Araçları", desc: "Sistem testleri", twilioTest: "Twilio Test", emailTest: "E-posta Test" },
      monitor: { title: "Bildirim & Cron İzleme", desc: "Cron işleri ve bildirimleri izleyin", notificationMonitor: "Bildirim İzleme" },
      system: { title: "Sistem Bilgileri", version: "Sürüm", lastUpdate: "Son Güncelleme", permissionSystem: "Yetki Sistemi" }
    }
  }
}

const en: Dictionaries = {
  common: {
    demo: "DEMO",
    admin: "Admin",
    profile: "Profile",
    settings: "Settings",
    logout: "Log Out",
    login: "Log In",
    menu: "Menu",
    loading: "Loading...",
    loadingAuth: "Authenticating...",
    close: "Close",
    edit: "Edit",
    cancel: "Cancel",
    dataTable: {
      columns: "Columns",
      noResults: "No results.",
      searchPlaceholder: "Search...",
      rowsSelected: (s, t) => `${s} / ${t} rows selected.`
    }
  },
  nav: {
    dashboard: "Dashboard",
    pipeline: "Pipeline",
    leads: "Leads",
    messaging: "Messaging",
    adminPanel: "Admin Panel",
    notificationSettings: "Notification Settings",
  },
  dashboard: {
    title: "Dashboard",
    welcome: (email) => `Welcome, ${email}`,
    toPipelines: "Pipeline (Cities)",
    toLeads: "Leads",
    stats: {
      totalLeads: "Total Leads",
      activePipelines: "Active Pipelines",
      totalValue: "Total Value",
      conversionRate: "Conversion Rate",
      thisMonthAdded: (count) => `+${count} this month`,
      totalStages: "Total stages",
      pipelineSummaryTitle: "Pipeline Summary",
      pipelineSummaryDesc: "Leads at each stage and their total values",
      noPipelineData: "No pipeline data yet",
      recentLeadsTitle: "Recent Leads",
      recentLeadsDesc: "Last 5 added leads",
      noLeads: "No leads yet",
    },
    quickActionsTitle: "Quick Actions",
    quickActionsDesc: "Quick access to frequent operations",
    quickNewLead: "New Lead",
    quickPipelineManage: "Manage Pipelines",
    quickPipelineView: "Pipeline View",
  },
  home: {
    hero: {
      title: "Happy CRM",
      subtitle: "Customer relationship and WhatsApp messaging platform",
      description: "Manage leads, automate messaging, and grow your business with our comprehensive solution",
      getStarted: "Get Started",
      viewDemo: "View Demo"
    },
    features: {
      title: "Why Choose Happy CRM?",
      subtitle: "Everything you need to manage customer relationships and grow your business",
      whatsapp: {
        title: "WhatsApp Business API",
        description: "Professional messaging with customers via WhatsApp. Template messages and automated responses."
      },
      leadManagement: {
        title: "Customer & Lead Management",
        description: "Lead tracking, pipeline management and customer relationships. Optimize your sales processes."
      },
      analytics: {
        title: "Analytics & Reporting",
        description: "Detailed performance reports, message analytics and customer behavior analysis."
      },
      automation: {
        title: "Automation",
        description: "Automate repetitive tasks with smart workflows. Set up automatic responses and follow-up sequences."
      },
      teamCollaboration: {
        title: "Team Collaboration",
        description: "Work together with your team. Assign leads, share conversations, and track team performance."
      },
      security: {
        title: "Secure & Reliable",
        description: "Enterprise-grade security with data encryption. Your customer data is safe and compliant with privacy regulations."
      }
    },
    cta: {
      title: "Ready to transform your customer relationships?",
      subtitle: "Join thousands of businesses using Happy CRM to streamline their customer management and WhatsApp communications.",
      button: "Start Your Journey"
    }
  },
  settings: {
    pageTitle: "User Settings",
    account: { title: "Account Settings", desc: "Manage your account details and password", cta: "Manage Account Settings" },
    notifications: { title: "Notification Settings", desc: "Manage your notification preferences", cta: "Manage Notification Settings" },
  },
  profile: {
    notLogged: "No logged in user found.",
    title: "Profile Information",
    desc: "View and manage your account information",
    email: "Email Address",
    role: "User Role",
    userId: "User ID",
    createdAt: "Account Created At",
    accountSettings: "Account Settings",
    changePassword: "Change Password",
  },
  leads: {
    pageTitle: "Leads",
    loading: "Loading...",
    searchPlaceholder: "Search lead, email, phone or tag...",
    filters: {
      pipeline: "Pipeline",
      stage: "Stage",
      priority: "Priority",
      status: "Status",
      source: "Source",
      assignee: "Assignee",
      dateRange: "Date Range",
      allPipelines: "All Pipelines",
      allStages: "All Stages",
      allPriorities: "All Priorities",
      allStatuses: "All Statuses",
      allSources: "All Sources",
      everyone: "Everyone",
      advancedFilters: "Advanced Filters"
    },
    activeFilters: "Active filters:",
    searchLabel: "Search:",
    clearAll: "Clear All",
    bulk: {
      selectedSuffix: "leads selected",
      addTag: "Add Tag",
      assign: "Assign",
      archive: "Archive",
      delete: "Delete"
    },
    table: {
      leadName: "Lead Name",
      company: "Company",
      pipelineStage: "Pipeline/Stage",
      value: "Value",
      priority: "Priority",
      status: "Status",
      assignee: "Assignee",
      createdAt: "Created",
      activity: "Activity",
      actions: "Actions",
      edit: "Edit",
      timeline: "Timeline"
    },
    dialog: {
      createTitle: "Create New Lead",
      editTitle: "Edit Lead",
      createDesc: "Fill in the lead details",
      editDesc: "Update the lead details",
      leadName: "Lead Name *",
      company: "Company",
      companySearch: "Search company...",
      companyEmpty: "No company found.",
      companySelect: "Select a company...",
      email: "Email",
      phone: "Phone"
    }
  },
  messaging: {
    headerTitle: "WhatsApp Business",
    headerSubtitle: "Messaging Center",
    allLines: "All Lines",
    connected: "Connected",
    newMessages: "new messages",
    searchPlaceholder: "Search contacts or messages...",
    channelAll: "All",
    quickUnread: "Unread",
    quickStarred: "Starred",
    quickArchived: "Archived",
    advancedFilters: {
      tags: "Tags",
      priority: "Priority",
      allPriorities: "All Priorities",
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    emptyTitle: "No messages found",
    emptyDesc: "Adjust your search criteria and try again",
    selectChatTitle: "Select a conversation",
    selectChatDesc: "Pick a conversation from the left or start a new one",
    typing: (name) => `${name} is typing`,
    quickReplies: "Quick Replies",
    messagePlaceholder: "Write a message...",
    today: "Today",
    yesterday: "Yesterday",
  },
  admin: {
    agencies: {
      title: "Agency Management",
      newAgency: "Create New Agency",
      name: "Agency Name",
      contact: "Contact",
      createdAt: "Created At",
      status: "Status",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      manage: "Manage",
      empty: "No agencies yet.",
      error: "Failed to load agencies."
    },
    users: {
      title: "User Management",
      newUser: "New User",
      allUsers: "All Users",
      refreshList: "Refresh List",
      table: {
        user: "User",
        role: "Role",
        agencies: "Agencies",
        createdAt: "Created",
        actions: "Actions",
        noUsers: "No users found",
        noUsername: "No username",
        manager: "Admin",
        agent: "Agency",
        noAgencyMembership: "No agency membership",
        removeFromAgency: "Remove from this agency"
      }
    },
    settings: {
      pageTitle: "Admin Settings",
      pageDesc: "Admin tools for system management and user operations",
      userMgmt: { title: "User Management", desc: "View and manage users", allUsers: "All Users" },
      agencies: { title: "Agency Management", desc: "Manage agencies", view: "View Agencies", create: "Create Agency & User" },
      transfers: { title: "Transfer Operations", desc: "Manage transfers", all: "All Transfers", create: "New Transfer" },
      tools: { title: "Test Tools", desc: "System tests", twilioTest: "Twilio Test", emailTest: "Email Test" },
      monitor: { title: "Notifications & Cron Monitor", desc: "Monitor cron jobs and notifications", notificationMonitor: "Notification Monitor" },
      system: { title: "System Info", version: "Version", lastUpdate: "Last Update", permissionSystem: "Permission System" }
    }
  }
}

export const DICTS: Record<Locale, Dictionaries> = { tr, en }


