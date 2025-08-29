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
    notifications?: {
      title: string
      empty: string
      markAllRead: string
      clearAll: string
      templateApproved: string
      templateRejected: string
      templateSubmitted: string
      templateApprovedDesc: (name: string) => string
      templateRejectedDesc: (name: string) => string
      templateSubmittedDesc: (name: string) => string
      templateSubmittedInfo: string
      templateSubmittedInfoDesc: string
      templateSubmittedModalTitle: string
      templateSubmittedModalDesc: (name: string) => string
      templateSubmittedModalButton: string
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
    whatsappTemplates?: {
      pageTitle: string
      pageDescription: string
      newTemplate: string
      refresh: string
      metaApiSync: string
      templateBuilder: {
        createTitle: string
        editTitle: string
        createDescription: string
        editDescription: string
        title: string
        description: string
        templateName: string
        templateNamePlaceholder: string
        templateNameHelper: string
        category: string
        language: string
        descriptionOptional: string
        descriptionPlaceholder: string
        templateComponents: string
        templateComponentsDesc: string
        livePreview: string
        livePreviewDesc: string
        previewVariables: string
        variableUsage: string
        variableUsageDesc: string[]
        componentTypes: {
          header: string
          body: string
          footer: string
          buttons: string
        }
        componentLabels: {
          header: string
          body: string
          footer: string
          buttons: string
        }
        textContent: string
        textPlaceholder: (type: string) => string
        addVariable: string
        variableManagement: string
        addVariableBtn: string
        sortVariables: string
        noVariables: string
        foundVariables: (count: number) => string
        variableErrors: string
        variablesValid: string
        addButton: string
        buttonText: string
        buttonTypes: {
          quickReply: string
          url: string
          phone: string
        }
        characterLimits: {
          header: string
          body: string
          footer: string
        }
        noComponents: string
        noComponentsDesc: string
        componentPreview: string
        previewEmpty: string
        previewEmptyDesc: string
        validationTitle: string
        ready: string
        hasErrors: string
        componentCount: (count: number) => string
        actions: {
          cancel: string
          apiTest: string
          testTemplate: string
          saveDraft: string
          submitForApproval: string
        }
        categories: {
          utility: string
          utilityDesc: string
          marketing: string
          marketingDesc: string
          authentication: string
          authenticationDesc: string
        }
        languages: {
          turkish: string
          english: string
        }
        status: {
          draft: string
          pending: string
          approved: string
          rejected: string
        }
        toasts: {
          nameRequired: string
          nameRequiredDesc: string
          componentRequired: string
          componentRequiredDesc: string
          validationError: string
          templateSubmitted: string
          templateSubmittedDesc: (name: string) => string
          draftSaved: string
          draftSavedDesc: string
          apiTestSuccess: string
          apiTestSuccessDesc: string
          apiTestError: string
          testTemplateSuccess: string
          testTemplateSuccessDesc: (id: string) => string
          testTemplateError: string
          saveError: string
        }
        validation: {
          nameRequired: string
          componentRequired: string
          bodyRequired: string
          headerMaxLength: (index: number) => string
          bodyMaxLength: (index: number) => string
          footerMaxLength: (index: number) => string
          variableSequential: string
          variableStartEnd: string
          tooManyVariables: string
        }
      }
      templateView: {
        title: string
        description: (name: string) => string
        templateName: string
        category: string
        language: string
        status: string
        header: string
        content: string
        footer: string
        buttons: string
        metaApiInfo: string
        metaTemplateId: string
        createdAt: string
      }
      stats: {
        totalTemplates: string
        approved: string
        pending: string
        sentMessages: string
        avgDelivery: string
        avgRead: string
      }
      filters: {
        searchPlaceholder: string
        allStatuses: string
        allCategories: string
      }
      table: {
        templateName: string
        category: string
        status: string
        usage: string
        deliveryRate: string
        createdAt: string
        actions: string
        messages: string
      }
      actions: {
        view: string
        edit: string
        submitForApproval: string
        delete: string
      }
      status: {
        draft: string
        pending: string
        approved: string
        rejected: string
        disabled: string
      }
      categories: {
        marketing: string
        utility: string
        authentication: string
      }
      confirmDelete: (name: string) => string
      toasts: {
        templateDeleted: string
        templateDeletedDesc: string
        templateSubmitted: string
        templateSubmittedDesc: string
        templateUpdated: string
        templateUpdatedDesc: string
        draftSaved: string
        draftSavedDesc: string
        templateSentForApproval: string
        templateSentForApprovalDesc: string
        syncCompleted: string
        syncCompletedDesc: (count: number) => string
        syncError: string
        syncErrorDesc: string
        loadError: string
        loadErrorDesc: string
        deleteError: string
        deleteErrorDesc: string
        submitError: string
        submitErrorDesc: string
        saveError: string
        saveErrorDesc: string
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
    },
    notifications: {
      title: "Bildirimler",
      empty: "Henüz bildirim yok",
      markAllRead: "Tümünü Okundu İşaretle",
      clearAll: "Temizle",
      templateApproved: "Template Onaylandı! 🎉",
      templateRejected: "Template Reddedildi ❌",
      templateSubmitted: "Template Onaya Gönderildi 📤",
      templateApprovedDesc: (name) => `"${name}" template'iniz Meta tarafından onaylandı ve kullanıma hazır.`,
      templateRejectedDesc: (name) => `"${name}" template'iniz Meta tarafından reddedildi. Lütfen kontrol edin.`,
      templateSubmittedDesc: (name) => `"${name}" template'iniz Meta'ya onay için gönderildi. Sonuç bildirim olarak gelecektir.`,
      templateSubmittedInfo: "Template Onaya Gönderildi",
      templateSubmittedInfoDesc: "Template'iniz onaya gönderildi, onay durumu bildirim olarak gönderilecektir",
      templateSubmittedModalTitle: "Template Başarıyla Gönderildi! 🎉",
      templateSubmittedModalDesc: (name) => `"${name}" template'iniz Meta WhatsApp Business API'ye onay için gönderildi. Onay süreci genellikle 24-48 saat sürer. Sonuç bildirim olarak size ulaşacaktır.`,
      templateSubmittedModalButton: "Tamam"
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
    whatsappTemplates: {
      pageTitle: "WhatsApp Template Yönetimi",
      pageDescription: "WhatsApp Business Cloud API template'lerini oluştur ve yönet",
      newTemplate: "Yeni Template",
      refresh: "Yenile",
      metaApiSync: "Meta API Senkronize Et",
      templateBuilder: {
        createTitle: "Yeni Template Oluştur",
        editTitle: "Template Düzenle",
        createDescription: "WhatsApp template'inizi tasarlayın ve önizleme yapın",
        editDescription: "WhatsApp template'inizi tasarlayın ve önizleme yapın",
        title: "WhatsApp Template Builder",
        description: "Enterprise-grade template editörü ve onay sistemi",
        templateName: "Template Adı *",
        templateNamePlaceholder: "Örn: welcome_message",
        templateNameHelper: "Sadece küçük harfler, rakamlar ve alt çizgi (_) kullanabilirsiniz",
        category: "Kategori *",
        language: "Dil",
        descriptionOptional: "Açıklama (Opsiyonel)",
        descriptionPlaceholder: "Template'in ne için kullanılacağını açıklayın",
        templateComponents: "Template Components",
        templateComponentsDesc: "WhatsApp mesaj bileşenlerini oluşturun ve düzenleyin",
        livePreview: "Canlı Önizleme",
        livePreviewDesc: "Template'in WhatsApp'ta nasıl görüneceği",
        previewVariables: "Önizleme Değişkenleri",
        variableUsage: "📝 Variable Kullanımı:",
        variableUsageDesc: [
          "• {{1}} - İlk değişken",
          "• {{2}} - İkinci değişken", 
          "• {{3}} - Üçüncü değişken",
          "• Variable'lar sıralı olmalı (1, 2, 3...)",
          "• Template variable ile başlayamaz veya bitemez",
          "• #, $, % gibi özel karakterler kullanılamaz"
        ],
        componentTypes: {
          header: "Header",
          body: "Body *",
          footer: "Footer",
          buttons: "Buttons"
        },
        componentLabels: {
          header: "Başlık",
          body: "Ana Metin",
          footer: "Alt Bilgi",
          buttons: "Butonlar"
        },
        textContent: "Metin İçeriği",
        textPlaceholder: (type) => `${type} metni girin... Değişkenler için {{variable_name}} kullanın`,
        addVariable: "+ Variable",
        variableManagement: "Variable Yönetimi",
        addVariableBtn: "Variable Ekle",
        sortVariables: "🔄 Sırala",
        noVariables: "Henüz variable eklenmedi. Metin içinde istediğiniz yere tıklayıp \"Variable Ekle\" butonuna basın.",
        foundVariables: (count) => `Bulunan Variable'lar (${count}):`,
        variableErrors: "⚠️ Variable Hataları:",
        variablesValid: "✅ Variable'lar doğru formatta",
        addButton: "Buton Ekle",
        buttonText: "Buton metni",
        buttonTypes: {
          quickReply: "Hızlı Yanıt",
          url: "Web Sitesi",
          phone: "Telefon"
        },
        characterLimits: {
          header: "Maksimum 60 karakter",
          body: "Maksimum 1024 karakter - Variable eklemek için butona tıklayın",
          footer: "Maksimum 60 karakter"
        },
        noComponents: "Henüz component eklenmedi",
        noComponentsDesc: "Başlamak için yukarıdaki butonları kullanın",
        componentPreview: "Template Önizlemesi",
        previewEmpty: "Component ekleyince önizleme görünecek",
        previewEmptyDesc: "",
        validationTitle: "Düzeltilmesi Gerekenler",
        ready: "Hazır",
        hasErrors: "Eksikler var",
        componentCount: (count) => `${count} component`,
        actions: {
          cancel: "İptal",
          apiTest: "API Test",
          testTemplate: "Test Template",
          saveDraft: "Taslak Kaydet",
          submitForApproval: "Onaya Gönder"
        },
        categories: {
          utility: "Utility (İş)",
          utilityDesc: "Fatura, sipariş, rezervasyon bildirimleri",
          marketing: "Marketing",
          marketingDesc: "Promosyon ve pazarlama mesajları",
          authentication: "Authentication",
          authenticationDesc: "OTP ve doğrulama mesajları"
        },
        languages: {
          turkish: "Türkçe",
          english: "English"
        },
        status: {
          draft: "Taslak",
          pending: "Onay Bekliyor",
          approved: "Onaylandı",
          rejected: "Reddedildi"
        },
        toasts: {
          nameRequired: "Hata",
          nameRequiredDesc: "Template adı gerekli",
          componentRequired: "Hata",
          componentRequiredDesc: "En az bir component gerekli",
          validationError: "Validation Error",
          templateSubmitted: "🎉 Template Onaya Gönderildi!",
          templateSubmittedDesc: (name) => `Template "${name}" Meta'ya gönderildi. Status: onay bekliyor`,
          draftSaved: "Taslak Kaydedildi",
          draftSavedDesc: "Template taslak olarak kaydedildi. Onaya göndermek için \"Onaya Gönder\" butonunu kullanın.",
          apiTestSuccess: "✅ API Bağlantısı Başarılı",
          apiTestSuccessDesc: "Meta WhatsApp API bağlantısı çalışıyor",
          apiTestError: "❌ API Bağlantı Hatası",
          testTemplateSuccess: "✅ Test Template Başarılı",
          testTemplateSuccessDesc: (id) => `Test template oluşturuldu: ${id}`,
          testTemplateError: "❌ Test Template Hatası",
          saveError: "Hata"
        },
        validation: {
          nameRequired: "Template adı gerekli",
          componentRequired: "En az bir component gerekli",
          bodyRequired: "Body component zorunludur",
          headerMaxLength: (index) => `Header ${index + 1}: Maksimum 60 karakter`,
          bodyMaxLength: (index) => `Body ${index + 1}: Maksimum 1024 karakter`,
          footerMaxLength: (index) => `Footer ${index + 1}: Maksimum 60 karakter`,
          variableSequential: "Variable'lar sıralı olmalı (1'den başlayarak). Bulunan:",
          variableStartEnd: "Template variable ile başlayamaz veya bitemez",
          tooManyVariables: "Çok fazla variable var. Variable sayısını azaltın veya metni uzatın"
        }
      },
      templateView: {
        title: "Template Görüntüle",
        description: (name) => `${name} template'inin detaylarını görüntüleyin`,
        templateName: "Template Adı",
        category: "Kategori",
        language: "Dil",
        status: "Durum",
        header: "Başlık",
        content: "İçerik",
        footer: "Alt Bilgi",
        buttons: "Butonlar",
        metaApiInfo: "Meta API Bilgileri",
        metaTemplateId: "Meta Template ID",
        createdAt: "Oluşturma Tarihi"
      },
      stats: {
        totalTemplates: "Toplam Template",
        approved: "Onaylı",
        pending: "Beklemede",
        sentMessages: "Gönderilen Mesaj",
        avgDelivery: "Ort. Teslimat",
        avgRead: "Ort. Okunma"
      },
      filters: {
        searchPlaceholder: "Template ara...",
        allStatuses: "Tüm Durumlar",
        allCategories: "Tüm Kategoriler"
      },
      table: {
        templateName: "Template Adı",
        category: "Kategori",
        status: "Durum",
        usage: "Kullanım",
        deliveryRate: "Teslimat Oranı",
        createdAt: "Oluşturulma",
        actions: "İşlemler",
        messages: "mesaj"
      },
      actions: {
        view: "Görüntüle",
        edit: "Düzenle",
        submitForApproval: "Onaya Gönder",
        delete: "Sil"
      },
      status: {
        draft: "Taslak",
        pending: "Beklemede",
        approved: "Onaylı",
        rejected: "Reddedildi",
        disabled: "Devre Dışı"
      },
      categories: {
        marketing: "Marketing",
        utility: "Utility",
        authentication: "Authentication"
      },
      confirmDelete: (name) => `"${name}" template'ini silmek istediğinize emin misiniz?`,
      toasts: {
        templateDeleted: "Başarılı",
        templateDeletedDesc: "Template silindi",
        templateSubmitted: "Başarılı",
        templateSubmittedDesc: "Template onay için gönderildi",
        templateUpdated: "Template Güncellendi",
        templateUpdatedDesc: "Template başarıyla güncellendi",
        draftSaved: "Taslak Kaydedildi",
        draftSavedDesc: "Template taslak olarak kaydedildi",
        templateSentForApproval: "Template Onaya Gönderildi",
        templateSentForApprovalDesc: "Template Meta'ya gönderildi ve onay bekliyor",
        syncCompleted: "Senkronizasyon Tamamlandı",
        syncCompletedDesc: (count) => `Meta API'den ${count} template bulundu ve güncellendi`,
        syncError: "Senkronizasyon Hatası",
        syncErrorDesc: "Meta API senkronizasyonu sırasında hata oluştu",
        loadError: "Hata",
        loadErrorDesc: "Template'ler yüklenirken hata oluştu",
        deleteError: "Hata",
        deleteErrorDesc: "Template silinirken hata oluştu",
        submitError: "Hata",
        submitErrorDesc: "Template gönderilirken hata oluştu",
        saveError: "Hata",
        saveErrorDesc: "Template kaydedilirken hata oluştu"
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
    },
    notifications: {
      title: "Notifications",
      empty: "No notifications yet",
      markAllRead: "Mark All as Read",
      clearAll: "Clear All",
      templateApproved: "Template Approved! 🎉",
      templateRejected: "Template Rejected ❌",
      templateSubmitted: "Template Submitted 📤",
      templateApprovedDesc: (name) => `Your template "${name}" has been approved by Meta and is ready to use.`,
      templateRejectedDesc: (name) => `Your template "${name}" has been rejected by Meta. Please check and revise.`,
      templateSubmittedDesc: (name) => `Your template "${name}" has been submitted to Meta for approval. You'll receive a notification with the result.`,
      templateSubmittedInfo: "Template Submitted for Approval",
      templateSubmittedInfoDesc: "Your template has been submitted for approval, approval status will be sent as notification",
      templateSubmittedModalTitle: "Template Successfully Submitted! 🎉",
      templateSubmittedModalDesc: (name) => `Your template "${name}" has been submitted to Meta WhatsApp Business API for approval. The approval process typically takes 24-48 hours. You'll receive a notification with the result.`,
      templateSubmittedModalButton: "OK"
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
    whatsappTemplates: {
      pageTitle: "WhatsApp Template Management",
      pageDescription: "Create and manage WhatsApp Business Cloud API templates",
      newTemplate: "New Template",
      refresh: "Refresh",
      metaApiSync: "Sync Meta API",
      templateBuilder: {
        createTitle: "Create New Template",
        editTitle: "Edit Template",
        createDescription: "Design your WhatsApp template and preview",
        editDescription: "Design your WhatsApp template and preview",
        title: "WhatsApp Template Builder",
        description: "Enterprise-grade template editor and approval system",
        templateName: "Template Name *",
        templateNamePlaceholder: "e.g: welcome_message",
        templateNameHelper: "Only lowercase letters, numbers and underscores (_) allowed",
        category: "Category *",
        language: "Language",
        descriptionOptional: "Description (Optional)",
        descriptionPlaceholder: "Describe what this template will be used for",
        templateComponents: "Template Components",
        templateComponentsDesc: "Create and edit WhatsApp message components",
        livePreview: "Live Preview",
        livePreviewDesc: "How the template will look in WhatsApp",
        previewVariables: "Preview Variables",
        variableUsage: "📝 Variable Usage:",
        variableUsageDesc: [
          "• {{1}} - First variable",
          "• {{2}} - Second variable", 
          "• {{3}} - Third variable",
          "• Variables must be sequential (1, 2, 3...)",
          "• Template cannot start or end with variable",
          "• Special characters like #, $, % cannot be used"
        ],
        componentTypes: {
          header: "Header",
          body: "Body *",
          footer: "Footer",
          buttons: "Buttons"
        },
        componentLabels: {
          header: "Header",
          body: "Main Text",
          footer: "Footer",
          buttons: "Buttons"
        },
        textContent: "Text Content",
        textPlaceholder: (type) => `Enter ${type} text... Use {{variable_name}} for variables`,
        addVariable: "+ Variable",
        variableManagement: "Variable Management",
        addVariableBtn: "Add Variable",
        sortVariables: "🔄 Sort",
        noVariables: "No variables added yet. Click anywhere in the text and press \"Add Variable\" button.",
        foundVariables: (count) => `Found Variables (${count}):`,
        variableErrors: "⚠️ Variable Errors:",
        variablesValid: "✅ Variables are in correct format",
        addButton: "Add Button",
        buttonText: "Button text",
        buttonTypes: {
          quickReply: "Quick Reply",
          url: "Website",
          phone: "Phone"
        },
        characterLimits: {
          header: "Maximum 60 characters",
          body: "Maximum 1024 characters - Click button to add variables",
          footer: "Maximum 60 characters"
        },
        noComponents: "No components added yet",
        noComponentsDesc: "Use the buttons above to get started",
        componentPreview: "Template Preview",
        previewEmpty: "Preview will appear when you add components",
        previewEmptyDesc: "",
        validationTitle: "Issues to Fix",
        ready: "Ready",
        hasErrors: "Has Issues",
        componentCount: (count) => `${count} components`,
        actions: {
          cancel: "Cancel",
          apiTest: "API Test",
          testTemplate: "Test Template",
          saveDraft: "Save Draft",
          submitForApproval: "Submit for Approval"
        },
        categories: {
          utility: "Utility (Business)",
          utilityDesc: "Invoices, orders, reservation notifications",
          marketing: "Marketing",
          marketingDesc: "Promotional and marketing messages",
          authentication: "Authentication",
          authenticationDesc: "OTP and verification messages"
        },
        languages: {
          turkish: "Turkish",
          english: "English"
        },
        status: {
          draft: "Draft",
          pending: "Pending Approval",
          approved: "Approved",
          rejected: "Rejected"
        },
        toasts: {
          nameRequired: "Error",
          nameRequiredDesc: "Template name is required",
          componentRequired: "Error",
          componentRequiredDesc: "At least one component is required",
          validationError: "Validation Error",
          templateSubmitted: "🎉 Template Submitted for Approval!",
          templateSubmittedDesc: (name) => `Template "${name}" has been sent to Meta. Status: pending approval`,
          draftSaved: "Draft Saved",
          draftSavedDesc: "Template saved as draft. Use \"Submit for Approval\" button to send for review.",
          apiTestSuccess: "✅ API Connection Successful",
          apiTestSuccessDesc: "Meta WhatsApp API connection is working",
          apiTestError: "❌ API Connection Error",
          testTemplateSuccess: "✅ Test Template Successful",
          testTemplateSuccessDesc: (id) => `Test template created: ${id}`,
          testTemplateError: "❌ Test Template Error",
          saveError: "Error"
        },
        validation: {
          nameRequired: "Template name is required",
          componentRequired: "At least one component is required",
          bodyRequired: "Body component is required",
          headerMaxLength: (index) => `Header ${index + 1}: Maximum 60 characters`,
          bodyMaxLength: (index) => `Body ${index + 1}: Maximum 1024 characters`,
          footerMaxLength: (index) => `Footer ${index + 1}: Maximum 60 characters`,
          variableSequential: "Variables must be sequential (starting from 1). Found:",
          variableStartEnd: "Template cannot start or end with variable",
          tooManyVariables: "Too many variables. Reduce variable count or extend text"
        }
      },
      templateView: {
        title: "View Template",
        description: (name) => `View details of ${name} template`,
        templateName: "Template Name",
        category: "Category",
        language: "Language",
        status: "Status",
        header: "Header",
        content: "Content",
        footer: "Footer",
        buttons: "Buttons",
        metaApiInfo: "Meta API Information",
        metaTemplateId: "Meta Template ID",
        createdAt: "Created At"
      },
      stats: {
        totalTemplates: "Total Templates",
        approved: "Approved",
        pending: "Pending",
        sentMessages: "Sent Messages",
        avgDelivery: "Avg. Delivery",
        avgRead: "Avg. Read"
      },
      filters: {
        searchPlaceholder: "Search templates...",
        allStatuses: "All Statuses",
        allCategories: "All Categories"
      },
      table: {
        templateName: "Template Name",
        category: "Category",
        status: "Status",
        usage: "Usage",
        deliveryRate: "Delivery Rate",
        createdAt: "Created",
        actions: "Actions",
        messages: "messages"
      },
      actions: {
        view: "View",
        edit: "Edit",
        submitForApproval: "Submit for Approval",
        delete: "Delete"
      },
      status: {
        draft: "Draft",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        disabled: "Disabled"
      },
      categories: {
        marketing: "Marketing",
        utility: "Utility",
        authentication: "Authentication"
      },
      confirmDelete: (name) => `Are you sure you want to delete "${name}" template?`,
      toasts: {
        templateDeleted: "Success",
        templateDeletedDesc: "Template deleted",
        templateSubmitted: "Success",
        templateSubmittedDesc: "Template submitted for approval",
        templateUpdated: "Template Updated",
        templateUpdatedDesc: "Template successfully updated",
        draftSaved: "Draft Saved",
        draftSavedDesc: "Template saved as draft",
        templateSentForApproval: "Template Sent for Approval",
        templateSentForApprovalDesc: "Template sent to Meta and awaiting approval",
        syncCompleted: "Sync Completed",
        syncCompletedDesc: (count) => `Found and updated ${count} templates from Meta API`,
        syncError: "Sync Error",
        syncErrorDesc: "Error occurred during Meta API synchronization",
        loadError: "Error",
        loadErrorDesc: "Error loading templates",
        deleteError: "Error",
        deleteErrorDesc: "Error deleting template",
        submitError: "Error",
        submitErrorDesc: "Error submitting template",
        saveError: "Error",
        saveErrorDesc: "Error saving template"
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


