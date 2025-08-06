#!/usr/bin/env node

/**
 * Twilio Template Manager
 * 
 * Twilio Content API ve CLI kullanarak WhatsApp template'larını yönetir
 * Dokümantasyon: https://www.twilio.com/docs/content/content-api-resources
 */

// Environment variables yükle
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TwilioTemplateManager {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!this.accountSid || !this.authToken) {
      console.error('❌ TWILIO_ACCOUNT_SID ve TWILIO_AUTH_TOKEN environment variables gerekli');
      process.exit(1);
    }
  }

  // Twilio CLI command runner
  runTwilioCommand(command) {
    try {
      const result = execSync(`twilio ${command}`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return result.trim();
    } catch (error) {
      console.error(`❌ Twilio CLI hatası: ${error.message}`);
      throw error;
    }
  }

  // Template listele
  async listTemplates() {
    console.log('📋 WhatsApp Template listesi alınıyor...\n');
    
    try {
      // Content API ile template'ları al
      const result = this.runTwilioCommand('api:content:v1:contents:list --output=json');
      
      // Boş response kontrolü
      if (!result || result.trim() === '') {
        console.log('📝 Henüz template bulunmuyor (boş response).');
        return;
      }
      
      const templates = JSON.parse(result);
      
      if (!templates || templates.length === 0) {
        console.log('📝 Henüz template bulunmuyor.');
        return;
      }

      console.log(`📋 Toplam ${templates.length} template bulundu:\n`);
      
      templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.friendlyName || 'İsimsiz Template'}`);
        console.log(`   SID: ${template.sid}`);
        console.log(`   Language: ${template.language || 'tr'}`);
        console.log(`   Date Created: ${new Date(template.dateCreated).toLocaleDateString('tr-TR')}`);
        console.log(`   Status: ${this.getTemplateStatus(template)}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Template listesi alınamadı:', error.message);
    }
  }

  // Template status'ü formatla
  getTemplateStatus(template) {
    // Template approval status kontrol et
    if (template.types && template.types.whatsapp) {
      const whatsappType = template.types.whatsapp;
      return whatsappType.status || 'unknown';
    }
    return 'draft';
  }

  // Template oluştur
  async createTemplate(templateData) {
    console.log(`📝 Yeni template oluşturuluyor: ${templateData.name}\n`);
    
    try {
      // Template content JSON'u oluştur
      const contentJson = {
        friendly_name: templateData.name,
        language: templateData.language || 'tr',
        types: {
          whatsapp: {
            category: templateData.category || 'MARKETING',
            components: [
              {
                type: 'BODY',
                text: templateData.body
              }
            ]
          }
        }
      };

      // Temporary dosya oluştur
      const tempFile = path.join(__dirname, 'temp_template.json');
      fs.writeFileSync(tempFile, JSON.stringify(contentJson, null, 2));

      // Twilio CLI ile template oluştur
      const command = `api:content:v1:contents:create --data='${JSON.stringify(contentJson)}'`;
      const result = this.runTwilioCommand(command);
      
      // Temp dosyayı sil
      fs.unlinkSync(tempFile);
      
      console.log('✅ Template başarıyla oluşturuldu!');
      console.log('📋 Sonuç:', result);
      
      return JSON.parse(result);
      
    } catch (error) {
      console.error('❌ Template oluşturulamadı:', error.message);
      throw error;
    }
  }

  // Template status alerts'ları konfigure et
  async configureAlerts() {
    console.log('🔔 Template Status Alerts konfigüre ediliyor...\n');
    
    try {
      // Twilio Console'da alert setup bilgileri
      console.log('📋 Template Status Alerts Konfigürasyon Bilgileri:');
      console.log('');
      console.log('1. Twilio Console\'a gidin:');
      console.log('   https://console.twilio.com/us1/develop/content-api/overview');
      console.log('');
      console.log('2. Content API > Configuration > Alert Settings');
      console.log('');
      console.log('3. Aşağıdaki webhook URL\'lerini ekleyin:');
      console.log(`   • Webhook URL: ${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook`);
      console.log('   • Event Types: template.status.approved, template.status.rejected');
      console.log('');
      console.log('4. Email notifications için admin email\'leri ekleyin');
      console.log('');
      
      // Alternative: CLI ile webhook setup (eğer destekleniyorsa)
      console.log('📋 CLI ile Alert Setup:');
      console.log('');
      console.log('Template status değişikliklerini takip etmek için:');
      console.log('twilio api:content:v1:content-approval-requests:list');
      console.log('');
      
    } catch (error) {
      console.error('❌ Alert konfigürasyonu hatası:', error.message);
    }
  }

  // Template onay durumunu kontrol et
  async checkApprovalStatus(templateSid) {
    console.log(`🔍 Template onay durumu kontrol ediliyor: ${templateSid}\n`);
    
    try {
      const result = this.runTwilioCommand(`api:content:v1:contents:fetch --sid=${templateSid} --output=json`);
      const template = JSON.parse(result);
      
      console.log(`📋 Template: ${template.friendlyName}`);
      console.log(`📊 Status: ${this.getTemplateStatus(template)}`);
      
      if (template.types && template.types.whatsapp) {
        const whatsapp = template.types.whatsapp;
        if (whatsapp.status === 'approved') {
          console.log('✅ Template onaylandı! Kullanıma hazır.');
        } else if (whatsapp.status === 'rejected') {
          console.log('❌ Template reddedildi.');
          if (whatsapp.rejection_reason) {
            console.log(`📝 Red sebebi: ${whatsapp.rejection_reason}`);
          }
        } else {
          console.log('⏳ Template onay bekliyor...');
        }
      }
      
      return template;
      
    } catch (error) {
      console.error('❌ Status kontrolü başarısız:', error.message);
      throw error;
    }
  }

  // Template approval request gönder
  async submitForApproval(templateSid) {
    console.log(`📤 Template onaya gönderiliyor: ${templateSid}\n`);
    
    try {
      // WhatsApp Business API için approval request
      const result = this.runTwilioCommand(
        `api:content:v1:content-approval-requests:create --content-sid=${templateSid} --output=json`
      );
      
      console.log('✅ Template onaya gönderildi!');
      console.log('⏳ WhatsApp onay sürecini bekleyin (24-48 saat)');
      console.log('📋 Sonuç:', result);
      
      return JSON.parse(result);
      
    } catch (error) {
      console.error('❌ Onaya gönderme başarısız:', error.message);
      throw error;
    }
  }

  // Template'i sil
  async deleteTemplate(templateSid) {
    console.log(`🗑️  Template siliniyor: ${templateSid}\n`);
    
    try {
      const result = this.runTwilioCommand(`api:content:v1:contents:remove --sid=${templateSid}`);
      console.log('✅ Template başarıyla silindi!');
      return true;
      
    } catch (error) {
      console.error('❌ Template silinemedi:', error.message);
      throw error;
    }
  }
}

// CLI kullanımı
async function main() {
  const manager = new TwilioTemplateManager();
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 Twilio Template Manager\n');
  console.log('📖 Dokümantasyon: https://www.twilio.com/docs/content/content-api-resources\n');

  try {
    switch (command) {
      case 'list':
        await manager.listTemplates();
        break;
        
      case 'create':
        const templateData = {
          name: args[1],
          body: args[2],
          category: args[3] || 'MARKETING',
          language: args[4] || 'tr'
        };
        
        if (!templateData.name || !templateData.body) {
          console.log('❌ Kullanım: node twilio-template-manager.js create <name> <body> [category] [language]');
          process.exit(1);
        }
        
        await manager.createTemplate(templateData);
        break;
        
      case 'status':
        if (!args[1]) {
          console.log('❌ Kullanım: node twilio-template-manager.js status <template-sid>');
          process.exit(1);
        }
        await manager.checkApprovalStatus(args[1]);
        break;
        
      case 'submit':
        if (!args[1]) {
          console.log('❌ Kullanım: node twilio-template-manager.js submit <template-sid>');
          process.exit(1);
        }
        await manager.submitForApproval(args[1]);
        break;
        
      case 'delete':
        if (!args[1]) {
          console.log('❌ Kullanım: node twilio-template-manager.js delete <template-sid>');
          process.exit(1);
        }
        await manager.deleteTemplate(args[1]);
        break;
        
      case 'alerts':
        await manager.configureAlerts();
        break;
        
      default:
        console.log('📖 Kullanım:');
        console.log('  node scripts/twilio-template-manager.js <command>');
        console.log('');
        console.log('📋 Komutlar:');
        console.log('  list                          - Template\'ları listele');
        console.log('  create <name> <body>          - Yeni template oluştur');
        console.log('  status <sid>                  - Template onay durumu');
        console.log('  submit <sid>                  - Template\'i onaya gönder');
        console.log('  delete <sid>                  - Template\'i sil');
        console.log('  alerts                        - Alert sistemi kur');
        console.log('');
        console.log('📋 Örnekler:');
        console.log('  node scripts/twilio-template-manager.js list');
        console.log('  node scripts/twilio-template-manager.js create "hoşgeldin" "Merhaba {{1}}, hoşgeldiniz!"');
        console.log('  node scripts/twilio-template-manager.js status HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.log('  node scripts/twilio-template-manager.js alerts');
    }
    
  } catch (error) {
    console.error('❌ Script hatası:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = TwilioTemplateManager; 