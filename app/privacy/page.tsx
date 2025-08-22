'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';

export default function PrivacyPolicy() {
  const { locale } = useI18n();

  const content = {
    tr: {
      title: "Gizlilik Politikası",
      lastUpdated: "Son Güncelleme: 23 Ocak 2025",
      backHome: "Ana Sayfa",
      sections: [
        {
          title: "1. Giriş",
          content: "Happy CRM olarak, müşterilerimizin ve kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullandığınızda kişisel verilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklamaktadır."
        },
        {
          title: "2. Topladığımız Bilgiler",
          content: "Hizmetlerimizi sunarken aşağıdaki bilgileri toplayabiliriz:",
          list: [
            "Ad, soyad ve iletişim bilgileri",
            "Telefon numaraları ve e-posta adresleri",
            "Şirket bilgileri ve iş unvanı",
            "Müşteri iletişim geçmişi",
            "Hizmet kullanım verileri ve tercihler"
          ]
        },
        {
          title: "3. Bilgilerin Kullanım Amaçları",
          content: "Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:",
          list: [
            "Müşteri ilişkileri yönetimi hizmetlerinin sağlanması",
            "WhatsApp Business üzerinden iletişim kurulması",
            "Müşteri destek hizmetlerinin sunulması",
            "Hizmet kalitesinin geliştirilmesi",
            "Yasal yükümlülüklerin yerine getirilmesi"
          ]
        },
        {
          title: "4. Bilgi Paylaşımı",
          content: "Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:",
          list: [
            "Açık onayınızın bulunduğu durumlar",
            "Yasal zorunlulukların gerektirdiği haller",
            "Hizmet sağlayıcılarımızla (gizlilik sözleşmesi kapsamında)",
            "İş ortaklarımızla (yalnızca hizmet sunumu için gerekli bilgiler)"
          ]
        },
        {
          title: "5. Veri Güvenliği",
          content: "Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri uyguluyoruz. Bu önlemler arasında şifreleme, güvenli sunucular, erişim kontrolleri ve düzenli güvenlik denetimleri bulunmaktadır."
        },
        {
          title: "6. Veri Saklama",
          content: "Kişisel verilerinizi, ilgili hizmetleri sağlamak için gerekli olduğu sürece veya yasal düzenlemelerin gerektirdiği süre boyunca saklarız. İlişkiniz sona erdiğinde, yasal saklama süreleri dışındaki verileriniz güvenli bir şekilde silinir veya anonim hale getirilir."
        },
        {
          title: "7. Haklarınız",
          content: "KVKK kapsamında aşağıdaki haklara sahipsiniz:",
          list: [
            "Kişisel verilerinize erişim hakkı",
            "Verilerin düzeltilmesini isteme hakkı",
            "Verilerin silinmesini talep etme hakkı",
            "Veri işlemenin kısıtlanmasını isteme hakkı",
            "Veri taşınabilirliği hakkı",
            "İtiraz etme hakkı"
          ]
        },
        {
          title: "8. WhatsApp Business Kullanımı",
          content: "WhatsApp Business Platform üzerinden gönderilen mesajlar için Meta'nın gizlilik politikaları da geçerlidir. Mesajlaşma hizmetini kullanarak, Meta'nın veri işleme şartlarını da kabul etmiş olursunuz."
        },
        {
          title: "9. Çerezler",
          content: "Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz. Çerez kullanımı hakkında detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz."
        },
        {
          title: "10. Değişiklikler",
          content: "Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikler olması durumunda sizi bilgilendireceğiz. Güncel politikayı her zaman bu sayfadan inceleyebilirsiniz."
        },
        {
          title: "11. İletişim",
          content: "Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:",
          contactInfo: {
            email: "privacy@happycrm.com",
            phone: "+90 212 XXX XX XX",
            address: "Happy CRM, İstanbul, Türkiye"
          }
        }
      ],
      footer: "Tüm hakları saklıdır."
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 23, 2025",
      backHome: "Home",
      sections: [
        {
          title: "1. Introduction",
          content: "At Happy CRM, we are committed to protecting the privacy of our customers and users. This Privacy Policy explains how we collect, use, share and protect your personal data when you use our services."
        },
        {
          title: "2. Information We Collect",
          content: "We may collect the following information when providing our services:",
          list: [
            "Name and contact information",
            "Phone numbers and email addresses",
            "Company information and job title",
            "Customer communication history",
            "Service usage data and preferences"
          ]
        },
        {
          title: "3. How We Use Your Information",
          content: "We use the collected information for the following purposes:",
          list: [
            "Providing customer relationship management services",
            "Communicating through WhatsApp Business",
            "Delivering customer support services",
            "Improving service quality",
            "Fulfilling legal obligations"
          ]
        },
        {
          title: "4. Information Sharing",
          content: "We do not share your personal data with third parties except in the following cases:",
          list: [
            "When you have given explicit consent",
            "When required by legal obligations",
            "With our service providers (under confidentiality agreements)",
            "With business partners (only information necessary for service delivery)"
          ]
        },
        {
          title: "5. Data Security",
          content: "We implement industry-standard security measures to protect your personal data. These measures include encryption, secure servers, access controls, and regular security audits."
        },
        {
          title: "6. Data Retention",
          content: "We retain your personal data for as long as necessary to provide the relevant services or as required by legal regulations. When your relationship ends, your data outside legal retention periods is securely deleted or anonymized."
        },
        {
          title: "7. Your Rights",
          content: "Under GDPR, you have the following rights:",
          list: [
            "Right to access your personal data",
            "Right to rectification of data",
            "Right to erasure of data",
            "Right to restrict processing",
            "Right to data portability",
            "Right to object"
          ]
        },
        {
          title: "8. WhatsApp Business Usage",
          content: "Meta's privacy policies also apply to messages sent through WhatsApp Business Platform. By using the messaging service, you also accept Meta's data processing terms."
        },
        {
          title: "9. Cookies",
          content: "We use cookies on our website to improve user experience. For detailed information about cookie usage, please review our Cookie Policy."
        },
        {
          title: "10. Changes",
          content: "We may update this Privacy Policy from time to time. We will notify you of significant changes. You can always review the current policy on this page."
        },
        {
          title: "11. Contact",
          content: "For questions about our privacy policy, you can contact us:",
          contactInfo: {
            email: "privacy@happycrm.com",
            phone: "+90 212 XXX XX XX",
            address: "Happy CRM, Istanbul, Turkey"
          }
        }
      ],
      footer: "All rights reserved."
    }
  };

  const currentContent = content[locale as 'tr' | 'en'] || content.tr;
  const emailLabel = locale === 'tr' ? 'E-posta:' : 'Email:';
  const phoneLabel = locale === 'tr' ? 'Telefon:' : 'Phone:';
  const addressLabel = locale === 'tr' ? 'Adres:' : 'Address:';

  return (
    <div className="min-h-screen bg-gray-50">
          {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {currentContent.backHome}
            </Button>
          </Link>
          </div>
              </div>
              
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentContent.title}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {currentContent.lastUpdated}
          </p>

          {/* Sections */}
          <div className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {section.title}
            </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {section.content}
                </p>
                
                {section.list && (
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
            </ul>
                )}
                
                {section.contactInfo && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                      <strong>{emailLabel}</strong> {section.contactInfo.email}
              </p>
              <p className="text-gray-700">
                      <strong>{phoneLabel}</strong> {section.contactInfo.phone}
              </p>
              <p className="text-gray-700">
                      <strong>{addressLabel}</strong> {section.contactInfo.address}
              </p>
            </div>
                )}
          </section>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © 2025 Happy CRM. {currentContent.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}