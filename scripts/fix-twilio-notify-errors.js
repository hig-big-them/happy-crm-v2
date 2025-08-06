#!/usr/bin/env node

/**
 * Twilio Notify Service Hatalarını Düzeltme Script'i
 * 
 * Bu script Twilio Console'da hatalı yapılandırılmış
 * Notify Service'i devre dışı bırakır veya düzeltir
 */

const twilio = require('twilio');

// Twilio client oluştur
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('❌ TWILIO_ACCOUNT_SID ve TWILIO_AUTH_TOKEN gereklidir');
  process.exit(1);
}

const client = new twilio(accountSid, authToken);

// Problematik Notify Service ID
const PROBLEMATIC_SERVICE_SID = 'PVb57d66718afd69c9e59eefff377c1e13';

async function main() {
  try {
    console.log('🔍 Twilio Notify Service durumu kontrol ediliyor...');
    
    // 1. Notify Service'i listele
    const services = await client.notify.v1.services.list();
    console.log(`📋 Toplam ${services.length} Notify Service bulundu`);
    
    // 2. Problematik service'i bul
    const problematicService = services.find(s => s.sid === PROBLEMATIC_SERVICE_SID);
    
    if (!problematicService) {
      console.log('✅ Problematik Notify Service bulunamadı - zaten silinmiş olabilir');
      return;
    }
    
    console.log('🚨 Problematik service bulundu:', {
      sid: problematicService.sid,
      friendlyName: problematicService.friendlyName,
      dateCreated: problematicService.dateCreated
    });
    
    // 3. Service'in credential'larını listele
    const credentials = await client.notify.v1
      .services(PROBLEMATIC_SERVICE_SID)
      .credentials.list();
      
    console.log(`📋 ${credentials.length} credential bulundu:`);
    credentials.forEach(cred => {
      console.log(`  - ${cred.type}: ${cred.friendlyName || 'İsimsiz'}`);
    });
    
    // 4. Hatalı credential'ları temizle
    for (const credential of credentials) {
      if (credential.type === 'apn' || credential.type === 'fcm') {
        console.log(`🗑️  ${credential.type} credential siliniyor: ${credential.sid}`);
        try {
          await client.notify.v1
            .services(PROBLEMATIC_SERVICE_SID)
            .credentials(credential.sid)
            .remove();
          console.log(`✅ ${credential.type} credential silindi`);
        } catch (error) {
          console.error(`❌ ${credential.type} credential silinirken hata:`, error.message);
        }
      }
    }
    
    // 5. Binding'leri temizle
    const bindings = await client.notify.v1
      .services(PROBLEMATIC_SERVICE_SID)
      .bindings.list();
      
    console.log(`📋 ${bindings.length} binding bulundu:`);
    
    for (const binding of bindings) {
      console.log(`🗑️  ${binding.bindingType} binding siliniyor: ${binding.sid}`);
      try {
        await client.notify.v1
          .services(PROBLEMATIC_SERVICE_SID)
          .bindings(binding.sid)
          .remove();
        console.log(`✅ ${binding.bindingType} binding silindi`);
      } catch (error) {
        console.error(`❌ Binding silinirken hata:`, error.message);
      }
    }
    
    // 6. Service'i tamamen sil (isteğe bağlı)
    const shouldDeleteService = process.argv.includes('--delete-service');
    
    if (shouldDeleteService) {
      console.log('🗑️  Notify Service tamamen siliniyor...');
      try {
        await client.notify.v1.services(PROBLEMATIC_SERVICE_SID).remove();
        console.log('✅ Notify Service tamamen silindi');
      } catch (error) {
        console.error('❌ Service silinirken hata:', error.message);
      }
    } else {
      console.log('ℹ️  Service korundu. Tamamen silmek için --delete-service parametresi kullan');
    }
    
    console.log('\n✅ Twilio Notify Service hatası düzeltildi!');
    console.log('📧 Artık template mesajları sorunsuz gönderebilirsin.');
    
  } catch (error) {
    console.error('❌ Script çalıştırılırken hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { main };