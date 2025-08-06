#!/usr/bin/env node

/**
 * WhatsApp Template Lister
 * 
 * WhatsApp Business API'den direkt onaylanmış template'ları listeler
 * API: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 */

// Environment variables yükle
require('dotenv').config({ path: '.env.local' });

const https = require('https');

class WhatsAppTemplateLister {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    if (!this.accessToken || !this.businessAccountId) {
      console.error('❌ WhatsApp Business Account ID ve Access Token gerekli');
      console.log('');
      console.log('📋 .env.local dosyasına şunları ekleyin:');
      console.log('   WHATSAPP_ACCESS_TOKEN=your_access_token_here');
      console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here');
      console.log('');
      console.log('🔗 Bilgileri almanız için:');
      console.log('   1. https://developers.facebook.com/apps/');
      console.log('   2. App seçin > WhatsApp > API Setup');
      console.log('   3. Temporary Access Token + Business Account ID kopyalayın');
      console.log('');
      console.log('💡 Business Account ID: whatsapp-business-account sayısının ID\'si');
      console.log('   Access Token: "Temporary access token" butonundan alın');
      process.exit(1);
    }
    
    console.log(`✅ Business Account ID: ${this.businessAccountId}`);
    console.log(`✅ Access Token: ${this.accessToken.substring(0, 20)}...`);
  }

  // HTTP request helper
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`JSON parse error: ${error.message}`));
          }
        });
        
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  // Template'ları listele
  async listTemplates() {
    console.log('📋 WhatsApp Business API\'den template\'lar alınıyor...\n');
    
    try {
      // WhatsApp Message Templates API
      const url = `https://graph.facebook.com/v17.0/${this.businessAccountId}/message_templates?access_token=${this.accessToken}&fields=name,status,category,language,components,quality_score,reason`;
      
      console.log('📡 API Request yapılıyor...');
      
      const result = await this.makeRequest(url);
      
      if (result.error) {
        throw new Error(`API Error: ${result.error.message}`);
      }
      
      if (!result.data || result.data.length === 0) {
        console.log('📝 Henüz template bulunmuyor.');
        console.log('');
        console.log('💡 Template oluşturmak için:');
        console.log('   1. WhatsApp Business Manager: https://business.facebook.com/');
        console.log('   2. WhatsApp > Message Templates');
        console.log('   3. Create Template');
        return [];
      }

      console.log(`📋 Toplam ${result.data.length} template bulundu:\n`);
      
      // Template'ları kategorilere ayır
      const approvedTemplates = result.data.filter(t => t.status === 'APPROVED');
      const pendingTemplates = result.data.filter(t => t.status === 'PENDING');
      const rejectedTemplates = result.data.filter(t => t.status === 'REJECTED');
      
      // Onaylanmış template'ları göster
      if (approvedTemplates.length > 0) {
        console.log(`✅ ONAYLANMIŞ TEMPLATE'LAR (${approvedTemplates.length}):`);
        console.log('='.repeat(50));
        
        approvedTemplates.forEach((template, index) => {
          console.log(`${index + 1}. 📝 ${template.name}`);
          console.log(`   📊 Status: ${template.status}`);
          console.log(`   🗂️  Category: ${template.category}`);
          console.log(`   🌍 Language: ${template.language}`);
          
          if (template.quality_score) {
            console.log(`   ⭐ Quality: ${template.quality_score.score || 'Unknown'}`);
          }
          
          if (template.components && template.components.length > 0) {
            const bodyComponent = template.components.find(c => c.type === 'BODY');
            if (bodyComponent) {
              console.log(`   💬 Text: ${bodyComponent.text}`);
              
              // Parametreleri göster
              if (bodyComponent.example && bodyComponent.example.body_text) {
                console.log(`   📋 Örnek: ${bodyComponent.example.body_text[0].join(', ')}`);
              }
            }
            
            // Header component
            const headerComponent = template.components.find(c => c.type === 'HEADER');
            if (headerComponent) {
              console.log(`   📌 Header: ${headerComponent.format} - ${headerComponent.text || 'Media'}`);
            }
            
            // Footer component  
            const footerComponent = template.components.find(c => c.type === 'FOOTER');
            if (footerComponent) {
              console.log(`   👇 Footer: ${footerComponent.text}`);
            }
          }
          
          console.log('');
        });
      }
      
      // Bekleyen template'ları göster
      if (pendingTemplates.length > 0) {
        console.log(`⏳ ONAY BEKLEYEN TEMPLATE'LAR (${pendingTemplates.length}):`);
        console.log('='.repeat(50));
        
        pendingTemplates.forEach((template, index) => {
          console.log(`${index + 1}. ⏳ ${template.name} (${template.language})`);
          console.log(`   📊 Category: ${template.category}`);
        });
        console.log('');
      }
      
      // Reddedilen template'ları göster
      if (rejectedTemplates.length > 0) {
        console.log(`❌ REDDEDİLEN TEMPLATE'LAR (${rejectedTemplates.length}):`);
        console.log('='.repeat(50));
        
        rejectedTemplates.forEach((template, index) => {
          console.log(`${index + 1}. ❌ ${template.name} (${template.language})`);
          if (template.reason) {
            console.log(`   📝 Red Sebebi: ${template.reason}`);
          }
        });
        console.log('');
      }
      
      // Özet
      console.log('📊 ÖZET:');
      console.log(`   ✅ Onaylanmış: ${approvedTemplates.length}`);
      console.log(`   ⏳ Bekleyen: ${pendingTemplates.length}`);
      console.log(`   ❌ Reddedilen: ${rejectedTemplates.length}`);
      console.log(`   📋 Toplam: ${result.data.length}`);
      
      return result.data;
      
    } catch (error) {
      console.error('❌ Template listesi alınamadı:', error.message);
      
      if (error.message.includes('Invalid OAuth access token')) {
        console.log('');
        console.log('💡 Access Token Sorunu:');
        console.log('   1. https://developers.facebook.com/apps/ adresine gidin');
        console.log('   2. App\'inizi seçin > WhatsApp > API Setup');
        console.log('   3. Yeni Temporary Access Token alın');
        console.log('   4. .env.local dosyasını güncelleyin');
      }
      
      if (error.message.includes('Unsupported get request')) {
        console.log('');
        console.log('💡 Business Account ID Sorunu:');
        console.log('   1. WhatsApp Business API Setup sayfasından');
        console.log('   2. Doğru Business Account ID\'yi kopyalayın');
        console.log('   3. .env.local dosyasını güncelleyin');
      }
      
      throw error;
    }
  }

  // Specific template detayını al
  async getTemplateDetails(templateName) {
    console.log(`🔍 Template detayı alınıyor: ${templateName}\n`);
    
    try {
      const url = `https://graph.facebook.com/v17.0/${this.businessAccountId}/message_templates?access_token=${this.accessToken}&name=${templateName}&fields=name,status,category,language,components,quality_score,reason`;
      
      const result = await this.makeRequest(url);
      
      if (result.data && result.data.length > 0) {
        const template = result.data[0];
        
        console.log('📋 Template Detayları:');
        console.log('='.repeat(30));
        console.log(`📝 Name: ${template.name}`);
        console.log(`📊 Status: ${template.status}`);
        console.log(`🗂️  Category: ${template.category}`);
        console.log(`🌍 Language: ${template.language}`);
        
        if (template.components) {
          console.log('\n💬 Components:');
          template.components.forEach((comp, i) => {
            console.log(`  ${i + 1}. ${comp.type}: ${comp.text || comp.format || 'Media'}`);
            
            if (comp.example) {
              console.log(`     📋 Örnek: ${JSON.stringify(comp.example)}`);
            }
          });
        }
        
        if (template.quality_score) {
          console.log(`\n⭐ Quality Score: ${template.quality_score.score}`);
          console.log(`📈 Reasons: ${template.quality_score.reasons || 'N/A'}`);
        }
        
        return template;
      } else {
        console.log('❌ Template bulunamadı');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Template detayı alınamadı:', error.message);
      throw error;
    }
  }
}

// CLI kullanımı
async function main() {
  const lister = new WhatsAppTemplateLister();
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 WhatsApp Template Lister\n');
  console.log('📖 API Docs: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates\n');

  try {
    if (command === 'details' && args[1]) {
      await lister.getTemplateDetails(args[1]);
    } else {
      await lister.listTemplates();
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

module.exports = WhatsAppTemplateLister; 