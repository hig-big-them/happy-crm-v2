/**
 * Direct WhatsApp Cloud API Test Script
 * Test numaranıza gerçek mesaj gönderir
 */

require('dotenv').config();

// Test configuration - Facebook'tan aldığınız değerler
const CONFIG = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE',
  phoneNumberId: '660093600519552', // Sizin test numaranızın ID'si
  businessAccountId: '671283975824118', // Business Account ID
  apiVersion: 'v18.0',
  testPhoneNumber: '+905327994223' // Test edilecek numara
};

// WhatsApp Cloud API'ye direkt mesaj gönderme
async function sendTestMessage() {
  const url = `https://graph.facebook.com/${CONFIG.apiVersion}/${CONFIG.phoneNumberId}/messages`;
  
  const messageData = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: CONFIG.testPhoneNumber.replace(/\D/g, ''), // Sadece rakamlar
    type: 'text',
    text: {
      preview_url: false,
      body: `🚀 Merhaba! Bu Happy CRM'den gönderilen test mesajıdır.\n\nTarih: ${new Date().toLocaleString('tr-TR')}\n\nSistem çalışıyor! ✅`
    }
  };

  try {
    console.log('📱 WhatsApp test mesajı gönderiliyor...');
    console.log('Hedef numara:', CONFIG.testPhoneNumber);
    console.log('API URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Mesaj başarıyla gönderildi!');
      console.log('Message ID:', result.messages[0].id);
      console.log('Detaylar:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Hata oluştu:', result.error);
      console.log('Hata detayları:', JSON.stringify(result, null, 2));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Bağlantı hatası:', error.message);
    throw error;
  }
}

// Template mesaj gönderme (eğer approved template'iniz varsa)
async function sendTemplateMessage() {
  const url = `https://graph.facebook.com/${CONFIG.apiVersion}/${CONFIG.phoneNumberId}/messages`;
  
  // hello_world varsayılan template'i kullanıyoruz
  const messageData = {
    messaging_product: 'whatsapp',
    to: CONFIG.testPhoneNumber.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: 'hello_world', // Meta'nın varsayılan template'i
      language: {
        code: 'en_US'
      }
    }
  };

  try {
    console.log('\n📋 Template mesajı gönderiliyor...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Template mesajı gönderildi!');
      console.log('Message ID:', result.messages[0].id);
    } else {
      console.error('❌ Template hatası:', result.error);
      console.log('Not: hello_world template'i mevcut değilse, önce WhatsApp Business Manager'dan template oluşturun.');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Template gönderim hatası:', error.message);
    throw error;
  }
}

// Media mesajı gönderme (resim örneği)
async function sendImageMessage() {
  const url = `https://graph.facebook.com/${CONFIG.apiVersion}/${CONFIG.phoneNumberId}/messages`;
  
  const messageData = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: CONFIG.testPhoneNumber.replace(/\D/g, ''),
    type: 'image',
    image: {
      link: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Happy+CRM+Test',
      caption: 'Happy CRM Test Görseli 🎨'
    }
  };

  try {
    console.log('\n🖼️ Görsel mesajı gönderiliyor...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Görsel mesajı gönderildi!');
      console.log('Message ID:', result.messages[0].id);
    } else {
      console.error('❌ Görsel gönderim hatası:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Görsel mesaj hatası:', error.message);
    throw error;
  }
}

// Interactive button mesajı
async function sendInteractiveMessage() {
  const url = `https://graph.facebook.com/${CONFIG.apiVersion}/${CONFIG.phoneNumberId}/messages`;
  
  const messageData = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: CONFIG.testPhoneNumber.replace(/\D/g, ''),
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'text',
        text: 'Happy CRM Bildirimi'
      },
      body: {
        text: 'Transfer randevunuz yaklaşıyor. Onaylıyor musunuz?'
      },
      footer: {
        text: 'Bu mesaj otomatik gönderilmiştir'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'confirm_yes',
              title: 'Evet ✅'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'confirm_no',
              title: 'Hayır ❌'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'reschedule',
              title: 'Ertele 📅'
            }
          }
        ]
      }
    }
  };

  try {
    console.log('\n🔘 Interactive mesaj gönderiliyor...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Interactive mesaj gönderildi!');
      console.log('Message ID:', result.messages[0].id);
    } else {
      console.error('❌ Interactive mesaj hatası:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Interactive hata:', error.message);
    throw error;
  }
}

// Ana test fonksiyonu
async function runTests() {
  console.log('🚀 WhatsApp Cloud API Test Başlıyor...');
  console.log('=====================================');
  console.log('Test Numarası:', CONFIG.testPhoneNumber);
  console.log('Phone Number ID:', CONFIG.phoneNumberId);
  console.log('Business Account ID:', CONFIG.businessAccountId);
  console.log('=====================================\n');

  // Access token kontrolü
  if (!CONFIG.accessToken || CONFIG.accessToken === 'YOUR_ACCESS_TOKEN_HERE') {
    console.error('❌ HATA: Access Token bulunamadı!');
    console.log('Lütfen .env dosyanıza WHATSAPP_ACCESS_TOKEN ekleyin');
    console.log('veya bu dosyadaki CONFIG.accessToken değerini güncelleyin.');
    process.exit(1);
  }

  try {
    // 1. Text mesajı test et
    await sendTestMessage();
    
    // 2. Template mesajı dene (opsiyonel)
    console.log('\n--- Template Test ---');
    await sendTemplateMessage().catch(err => {
      console.log('Template testi atlandı:', err.message);
    });
    
    // 3. Görsel mesajı dene
    console.log('\n--- Görsel Test ---');
    await sendImageMessage();
    
    // 4. Interactive mesaj dene
    console.log('\n--- Interactive Test ---');
    await sendInteractiveMessage();
    
    console.log('\n✅ Tüm testler tamamlandı!');
    console.log('\n📱 Telefonunuzu kontrol edin, mesajlar gelmiş olmalı.');
    
  } catch (error) {
    console.error('\n❌ Test başarısız:', error);
  }
}

// Script'i çalıştır
runTests();