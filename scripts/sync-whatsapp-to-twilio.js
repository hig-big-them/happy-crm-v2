#!/usr/bin/env node

/**
 * WhatsApp to Twilio Template Sync
 * 
 * Syncs approved WhatsApp templates to Twilio Content API
 * This makes templates visible in Twilio Content Builder
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const https = require('https');

class WhatsAppTwilioSync {
  constructor() {
    // WhatsApp credentials
    this.whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.whatsappBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    // Twilio credentials
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    
    this.validateCredentials();
  }

  validateCredentials() {
    const missing = [];
    
    if (!this.whatsappAccessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
    if (!this.whatsappBusinessAccountId) missing.push('WHATSAPP_BUSINESS_ACCOUNT_ID');
    if (!this.twilioAccountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!this.twilioAuthToken) missing.push('TWILIO_AUTH_TOKEN');
    
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:');
      missing.forEach(key => console.log(`   ${key}`));
      console.log('');
      console.log('📋 Add these to .env.local file:');
      console.log('   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token');
      console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id');  
      console.log('   TWILIO_ACCOUNT_SID=your_twilio_sid');
      console.log('   TWILIO_AUTH_TOKEN=your_twilio_token');
      process.exit(1);
    }
    
    console.log('✅ All credentials ready');
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

  // Get WhatsApp templates
  async getWhatsAppTemplates() {
    console.log('📋 Getting WhatsApp templates...');
    
    try {
      const url = `https://graph.facebook.com/v17.0/${this.whatsappBusinessAccountId}/message_templates?access_token=${this.whatsappAccessToken}&fields=name,status,category,language,components&limit=100`;
      
      const result = await this.makeRequest(url);
      
      if (result.error) {
        throw new Error(`WhatsApp API Error: ${result.error.message}`);
      }
      
      // Only get approved templates
      const approvedTemplates = result.data.filter(t => t.status === 'APPROVED');
      
      console.log(`✅ Found ${approvedTemplates.length} approved templates`);
      
      return approvedTemplates;
      
    } catch (error) {
      console.error('❌ Failed to get WhatsApp templates:', error.message);
      throw error;
    }
  }

  // List existing Twilio templates
  async getTwilioTemplates() {
    console.log('📋 Checking Twilio Content API templates...');
    
    try {
      const result = this.runTwilioCommand('api:content:v1:contents:list --output=json');
      
      if (!result || result.trim() === '') {
        console.log('📝 No templates in Twilio yet');
        return [];
      }
      
      const templates = JSON.parse(result);
      console.log(`📋 Found ${templates.length} templates in Twilio`);
      
      return templates;
      
    } catch (error) {
      console.log('📝 Cannot get Twilio template list (probably empty)');
      return [];
    }
  }

  // Twilio CLI command runner
  runTwilioCommand(command) {
    try {
      const result = execSync(`twilio ${command}`, { 
        encoding: 'utf-8',
        env: {
          ...process.env,
          TWILIO_ACCOUNT_SID: this.twilioAccountSid,
          TWILIO_AUTH_TOKEN: this.twilioAuthToken
        }
      });
      return result;
    } catch (error) {
      throw new Error(`Twilio CLI error: ${error.message}`);
    }
  }

  // Convert WhatsApp template to Twilio format
  convertToTwilioFormat(whatsappTemplate) {
    const twilioTemplate = {
      friendly_name: whatsappTemplate.name,
      language: whatsappTemplate.language,
      types: {
        "twilio/text": {
          body: ""
        }
      }
    };

    // Process components
    if (whatsappTemplate.components) {
      const bodyComponent = whatsappTemplate.components.find(c => c.type === 'BODY');
      if (bodyComponent && bodyComponent.text) {
        twilioTemplate.types["twilio/text"].body = bodyComponent.text;
      }

      const headerComponent = whatsappTemplate.components.find(c => c.type === 'HEADER');
      if (headerComponent && headerComponent.text) {
        twilioTemplate.types["twilio/text"].header = headerComponent.text;
      }

      const footerComponent = whatsappTemplate.components.find(c => c.type === 'FOOTER');
      if (footerComponent && footerComponent.text) {
        twilioTemplate.types["twilio/text"].footer = footerComponent.text;
      }
    }

    return twilioTemplate;
  }

  // Create template in Twilio
  async createTwilioTemplate(whatsappTemplate) {
    console.log(`📤 Syncing to Twilio: ${whatsappTemplate.name}`);
    
    try {
      const twilioFormat = this.convertToTwilioFormat(whatsappTemplate);
      
      // Write JSON to temporary file
      const fs = require('fs');
      const tempFile = `temp_template_${Date.now()}.json`;
      fs.writeFileSync(tempFile, JSON.stringify(twilioFormat, null, 2));
      
      try {
        // Create template using Twilio CLI
        const result = this.runTwilioCommand(`api:content:v1:contents:create --friendly-name "${twilioFormat.friendly_name}" --language "${twilioFormat.language}" --types "${tempFile}"`);
        
        console.log(`✅ ${whatsappTemplate.name} successfully synced`);
        
        return result;
        
      } finally {
        // Delete temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
      
    } catch (error) {
      console.error(`❌ ${whatsappTemplate.name} sync failed: ${error.message}`);
      return null;
    }
  }

  // Main sync operation
  async syncTemplates() {
    console.log('🔄 WhatsApp → Twilio Template Sync Starting\n');
    
    try {
      // 1. Get WhatsApp templates
      const whatsappTemplates = await this.getWhatsAppTemplates();
      
      if (whatsappTemplates.length === 0) {
        console.log('❌ No approved templates found in WhatsApp');
        return;
      }

      // 2. Check existing Twilio templates
      const twilioTemplates = await this.getTwilioTemplates();
      const existingNames = twilioTemplates.map(t => t.friendly_name || t.name);

      // 3. Sync each WhatsApp template
      console.log('\n🔄 Starting sync process...\n');
      
      let syncedCount = 0;
      let skippedCount = 0;
      
      for (const template of whatsappTemplates) {
        if (existingNames.includes(template.name)) {
          console.log(`⏭️  ${template.name} already exists, skipping`);
          skippedCount++;
          continue;
        }
        
        const result = await this.createTwilioTemplate(template);
        if (result) {
          syncedCount++;
        }
        
        // Short delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 4. Show results
      console.log('\n📊 SYNC RESULTS:');
      console.log(`   ✅ Synced: ${syncedCount}`);
      console.log(`   ⏭️  Skipped: ${skippedCount}`);
      console.log(`   📋 Total: ${whatsappTemplates.length}`);
      
      if (syncedCount > 0) {
        console.log('\n🎉 Templates successfully synced to Twilio Content Builder!');
        console.log('🔗 Check: https://console.twilio.com/us1/develop/content-api/overview');
      }
      
    } catch (error) {
      console.error('❌ Sync operation failed:', error.message);
      throw error;
    }
  }

  // Compare template lists
  async compareTemplates() {
    console.log('🔍 WhatsApp vs Twilio Template Comparison\n');
    
    try {
      const [whatsappTemplates, twilioTemplates] = await Promise.all([
        this.getWhatsAppTemplates(),
        this.getTwilioTemplates()
      ]);
      
      const whatsappNames = whatsappTemplates.map(t => t.name);
      const twilioNames = twilioTemplates.map(t => t.friendly_name || t.name);
      
      console.log('📋 COMPARISON:');
      console.log(`   WhatsApp approved: ${whatsappNames.length}`);
      console.log(`   Twilio existing: ${twilioNames.length}`);
      
      const missing = whatsappNames.filter(name => !twilioNames.includes(name));
      const extra = twilioNames.filter(name => !whatsappNames.includes(name));
      
      if (missing.length > 0) {
        console.log('\n❌ MISSING in Twilio:');
        missing.forEach(name => console.log(`   • ${name}`));
      }
      
      if (extra.length > 0) {
        console.log('\n➕ EXTRA in Twilio:');
        extra.forEach(name => console.log(`   • ${name}`));
      }
      
      if (missing.length === 0 && extra.length === 0) {
        console.log('\n✅ All templates are in sync!');
      }
      
    } catch (error) {
      console.error('❌ Comparison failed:', error.message);
    }
  }
}

// CLI usage
async function main() {
  const sync = new WhatsAppTwilioSync();
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 WhatsApp → Twilio Template Sync\n');

  try {
    if (command === 'compare') {
      await sync.compareTemplates();
    } else if (command === 'sync') {
      await sync.syncTemplates();
    } else {
      console.log('📋 Usage:');
      console.log('   node scripts/sync-whatsapp-to-twilio.js compare  # Compare templates');
      console.log('   node scripts/sync-whatsapp-to-twilio.js sync     # Sync templates');
      console.log('');
      
      // Default to comparison
      await sync.compareTemplates();
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  }
}

// Run script
if (require.main === module) {
  main();
}

module.exports = WhatsAppTwilioSync; 