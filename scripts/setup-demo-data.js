const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL veya Service Role Key bulunamadı!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDemoData() {
  console.log('🚀 Demo verisi oluşturuluyor...\n');

  try {
    // 1. Create demo lead with consent
    console.log('1️⃣ Demo lead oluşturuluyor...');
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        lead_name: 'Ahmet Yılmaz - CRM Projesi',
        contact_email: 'ahmet.yilmaz@example.com',
        contact_phone: '+905551234567',
        description: 'VIP Müşteri - WhatsApp iletişimi için onay verdi. CRM entegrasyonu talep ediyor.',
        priority: 'high',
        source: 'website'
      })
      .select()
      .single();

    if (leadError) throw leadError;
    console.log('✅ Lead oluşturuldu:', lead.lead_name);

    // 2. Record WhatsApp consent for the lead
    console.log('\n2️⃣ WhatsApp onayı kaydediliyor...');
    const consents = [
      {
        lead_id: lead.id,
        consent_type: 'whatsapp_transactional',
        status: true,
        opted_in_at: new Date().toISOString(),
        consent_text: 'Sipariş onayı, kargo takibi, randevu hatırlatması gibi hizmetlerimizle ilgili önemli güncellemeleri WhatsApp üzerinden almayı kabul ediyorum.',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 Demo Browser'
      },
      {
        lead_id: lead.id,
        consent_type: 'whatsapp_marketing',
        status: true,
        opted_in_at: new Date().toISOString(),
        consent_text: 'Kampanyalar, indirimler, yeni ürün/hizmetler ve özel teklifler hakkında WhatsApp üzerinden bilgilendirme almayı kabul ediyorum.',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 Demo Browser'
      }
    ];

    const { error: consentError } = await supabase
      .from('user_consents')
      .insert(consents);

    if (consentError) throw consentError;
    console.log('✅ WhatsApp onayları kaydedildi');

    // 3. Create approved message templates
    console.log('\n3️⃣ Onaylanmış mesaj şablonları oluşturuluyor...');
    const templates = [
      {
        name: 'siparis_onay',
        category: 'TRANSACTIONAL',
        language: 'tr',
        header_type: 'TEXT',
        header_text: 'Siparişiniz Onaylandı! 🎉',
        body_text: 'Merhaba {{1}},\n\n{{2}} numaralı siparişiniz başarıyla alındı ve işleme konuldu.\n\nToplam Tutar: {{3}} TL\nTahmini Teslimat: {{4}}\n\nSiparişinizi takip etmek için: {{5}}',
        footer_text: 'Happy CRM - Müşteri Hizmetleri',
        variables: [
          { type: 'text', position: '1', description: 'Müşteri Adı' },
          { type: 'text', position: '2', description: 'Sipariş No' },
          { type: 'text', position: '3', description: 'Tutar' },
          { type: 'text', position: '4', description: 'Teslimat Tarihi' },
          { type: 'text', position: '5', description: 'Takip Linki' }
        ],
        status: 'APPROVED',
        meta_template_id: 'demo_template_001',
        approved_at: new Date().toISOString()
      },
      {
        name: 'randevu_hatirlatma',
        category: 'TRANSACTIONAL',
        language: 'tr',
        header_type: 'TEXT',
        header_text: 'Randevu Hatırlatması',
        body_text: 'Sayın {{1}},\n\n{{2}} tarihinde saat {{3}} için {{4}} randevunuz bulunmaktadır.\n\nAdres: {{5}}\n\nRandevunuzu iptal veya değiştirmek için bizi arayabilirsiniz.',
        footer_text: 'Happy CRM',
        variables: [
          { type: 'text', position: '1', description: 'Müşteri Adı' },
          { type: 'text', position: '2', description: 'Tarih' },
          { type: 'text', position: '3', description: 'Saat' },
          { type: 'text', position: '4', description: 'Randevu Tipi' },
          { type: 'text', position: '5', description: 'Adres' }
        ],
        status: 'APPROVED',
        meta_template_id: 'demo_template_002',
        approved_at: new Date().toISOString()
      },
      {
        name: 'kargo_takip',
        category: 'TRANSACTIONAL',
        language: 'tr',
        header_text: 'Kargonuz Yolda! 📦',
        body_text: 'Merhaba {{1}},\n\nSiparişiniz kargoya verildi!\n\nKargo Firması: {{2}}\nTakip No: {{3}}\n\nKargonuzu takip etmek için: {{4}}',
        footer_text: 'Happy CRM',
        variables: [
          { type: 'text', position: '1', description: 'Müşteri Adı' },
          { type: 'text', position: '2', description: 'Kargo Firması' },
          { type: 'text', position: '3', description: 'Takip No' },
          { type: 'text', position: '4', description: 'Takip Linki' }
        ],
        status: 'APPROVED',
        meta_template_id: 'demo_template_003',
        approved_at: new Date().toISOString()
      }
    ];

    const { error: templateError } = await supabase
      .from('message_templates')
      .insert(templates);

    if (templateError) throw templateError;
    console.log('✅ Mesaj şablonları oluşturuldu');

    // 4. Create another demo lead with consent
    console.log('\n4️⃣ İkinci demo lead oluşturuluyor...');
    const { data: lead2, error: lead2Error } = await supabase
      .from('leads')
      .insert({
        lead_name: 'Mehmet Öz - E-ticaret Projesi',
        contact_email: 'mehmet.oz@example.com',
        contact_phone: '+905559876543',
        priority: 'medium',
        source: 'referral',
        description: 'WhatsApp entegrasyonu olan e-ticaret CRM sistemine ihtiyaç var'
      })
      .select()
      .single();

    if (lead2Error) {
      console.log('⚠️ İkinci lead oluşturulamadı:', lead2Error.message);
    } else {
      console.log('✅ İkinci lead oluşturuldu:', lead2.lead_name);

      // Record consent for second lead
      const lead2Consent = {
        lead_id: lead2.id,
        consent_type: 'whatsapp_transactional',
        status: true,
        opted_in_at: new Date().toISOString(),
        consent_text: 'İkinci demo lead için WhatsApp onayı',
        ip_address: '192.168.1.3',
        user_agent: 'Mozilla/5.0 Demo Browser'
      };

      await supabase.from('user_consents').insert(lead2Consent);
      console.log('✅ İkinci lead için WhatsApp onayı kaydedildi');
    }

    // 5. Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ DEMO VERİSİ HAZIR!');
    console.log('='.repeat(50));
    console.log('\n📋 Oluşturulan Veriler:');
    console.log('- 2 Demo Lead (WhatsApp onaylı)');
    console.log('- 3 WhatsApp Onay Kaydı');
    console.log('- 3 Onaylanmış Mesaj Şablonu');
    console.log('\n🎥 Video çekimi için hazırsınız!');
    console.log('\n💡 İpucu: Admin panelden şablonları görüntüleyebilir ve yeni lead eklerken opt-in checkbox\'ını gösterebilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Cleanup function to remove demo data
async function cleanupDemoData() {
  console.log('🧹 Demo verisi temizleniyor...\n');

  try {
    // Delete in reverse order to avoid foreign key constraints
    await supabase.from('template_usage_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_consents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('message_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leads').delete().eq('contact_email', 'ahmet.yilmaz@example.com');
    await supabase.from('leads').delete().eq('contact_email', 'mehmet.oz@example.com');

    console.log('✅ Demo verisi temizlendi');
  } catch (error) {
    console.error('❌ Temizleme hatası:', error.message);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args[0] === 'cleanup') {
  cleanupDemoData();
} else {
  setupDemoData();
}