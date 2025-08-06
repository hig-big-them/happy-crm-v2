#!/usr/bin/env node

/**
 * WhatsApp Template Status Sync
 * 
 * Syncs WhatsApp template status to Twilio Content API
 * Forces status update for templates that are approved in WhatsApp but pending in Twilio
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const https = require('https');

class TemplateStatusSync {
  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // YENİ: Direct Phone Number ID
    
    this.validateCredentials();
  }

  validateCredentials() {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      console.error('❌ Twilio credentials missing');
      process.exit(1);
    }
    
    console.log('✅ Credentials loaded');
    console.log(`🔧 Twilio Account: ${this.twilioAccountSid}`);
    console.log(`📱 Phone Number ID: ${this.phoneNumberId || 'Not set - will try Business Account'}`);
    console.log(`🏢 Business Account ID: ${this.businessAccountId || 'Not set'}`);
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

  // Run Twilio CLI command
  runTwilioCommand(command) {
    try {
      const result = execSync(`twilio ${command}`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return result.trim();
    } catch (error) {
      console.error(`❌ Twilio CLI Error: ${error.message}`);
      return null;
    }
  }

  // Get specific template from Twilio Content API
  async getTwilioTemplate(contentSid) {
    console.log(`🔍 Getting Twilio template: ${contentSid}\n`);
    
    try {
      // Use curl for better error handling
      const command = `curl -X GET "https://content.twilio.com/v1/Content/${contentSid}" ` +
        `-u "${this.twilioAccountSid}:${this.twilioAuthToken}" ` +
        `-H "Accept: application/json"`;
      
      const result = execSync(command, { encoding: 'utf-8' });
      const templateData = JSON.parse(result);
      
      if (templateData.error) {
        console.error('❌ Twilio API Error:', templateData.error.message);
        return null;
      }
      
      console.log('✅ Twilio Template Data:');
      console.log(`   Name: ${templateData.friendly_name}`);
      console.log(`   Language: ${templateData.language}`);
      console.log(`   Status: ${templateData.whatsapp?.status || 'Unknown'}`);
      console.log(`   Category: ${templateData.whatsapp?.category || 'Unknown'}`);
      console.log(`   Type: ${templateData.whatsapp?.type || 'Unknown'}`);
      
      return templateData;
      
    } catch (error) {
      console.error('❌ Failed to get Twilio template:', error.message);
      return null;
    }
  }

  // Check WhatsApp template status (if access token available)
  async checkWhatsAppStatus(templateName) {
    if (!this.whatsappAccessToken) {
      console.log('⚠️  WhatsApp Access Token not available, skipping WhatsApp check');
      return null;
    }
    
    console.log(`🔍 Checking WhatsApp status for: ${templateName}\n`);
    
    try {
      let phoneNumberId = this.phoneNumberId;
      
      // If Phone Number ID not provided, try to get it from Business Account
      if (!phoneNumberId) {
        if (!this.businessAccountId) {
          console.log('❌ Neither Phone Number ID nor Business Account ID available');
          return null;
        }
        
        console.log(`📋 Phone Number ID not set, trying Business Account: ${this.businessAccountId}`);
        
        const phoneNumbersUrl = `https://graph.facebook.com/v19.0/${this.businessAccountId}/phone_numbers?access_token=${this.whatsappAccessToken}`;
        const phoneResult = await this.makeRequest(phoneNumbersUrl);
        
        if (phoneResult.error || !phoneResult.data || phoneResult.data.length === 0) {
          console.log('❌ Could not access WhatsApp phone numbers via Business Account');
          console.log('💡 Please set WHATSAPP_PHONE_NUMBER_ID in .env.local');
          console.log('💡 Follow manual steps: node scripts/get-whatsapp-phone-id.js manual');
          return null;
        }
        
        phoneNumberId = phoneResult.data[0].id;
        console.log(`📱 Found Phone Number ID via Business Account: ${phoneNumberId}`);
      } else {
        console.log(`📱 Using configured Phone Number ID: ${phoneNumberId}`);
      }
      
      // Get templates - Use Business Account as it works better
      const useBusinessAccount = this.businessAccountId && !this.phoneNumberId;
      const templatesId = useBusinessAccount ? this.businessAccountId : phoneNumberId;
      const templatesUrl = `https://graph.facebook.com/v19.0/${templatesId}/message_templates?access_token=${this.whatsappAccessToken}&fields=name,status,category,language&limit=100`;
      
      console.log(`🔍 Getting templates from: ${useBusinessAccount ? 'Business Account' : 'Phone Number'} (${templatesId})`);
      const templateResult = await this.makeRequest(templatesUrl);
      
      if (templateResult.error) {
        console.error('❌ WhatsApp API Error:', templateResult.error.message);
        console.log('💡 This might be due to insufficient permissions or incorrect Phone Number ID');
        return null;
      }
      
      console.log(`✅ Successfully accessed WhatsApp templates! Found ${templateResult.data?.length || 0} templates`);
      
      // Find our template (try exact match first, then with suffix)
      let template = templateResult.data?.find(t => t.name === templateName);
      
      if (!template) {
        // Try with Twilio suffix pattern
        const suffixPattern = templateName + '_hx';
        template = templateResult.data?.find(t => t.name.startsWith(suffixPattern));
        
        if (template) {
          console.log(`✅ Found template with Twilio suffix: ${template.name}`);
        }
      }
      
      if (template) {
        console.log('✅ WhatsApp Template Found:');
        console.log(`   Name: ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Category: ${template.category}`);
        console.log(`   Language: ${template.language}`);
        
        return template;
      } else {
        console.log(`❌ Template '${templateName}' not found in WhatsApp`);
        console.log('📋 Available templates:');
        templateResult.data?.forEach((t, index) => {
          console.log(`   ${index + 1}. ${t.name} (${t.status})`);
        });
        return null;
      }
      
    } catch (error) {
      console.error('❌ WhatsApp check failed:', error.message);
      return null;
    }
  }

  // Force template approval in Twilio (if possible)
  async forceApproval(contentSid) {
    console.log(`🔧 Attempting to force approval for: ${contentSid}\n`);
    
    try {
      // Try to update the template status
      const updateData = {
        whatsapp: {
          status: 'approved'
        }
      };
      
      const command = `curl -X POST "https://content.twilio.com/v1/Content/${contentSid}" ` +
        `-u "${this.twilioAccountSid}:${this.twilioAuthToken}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${JSON.stringify(updateData)}'`;
      
      const result = execSync(command, { encoding: 'utf-8' });
      const updateResult = JSON.parse(result);
      
      if (updateResult.error) {
        console.error('❌ Update failed:', updateResult.error.message);
        console.log('💡 This is expected - Twilio status is controlled by WhatsApp');
        return false;
      }
      
      console.log('✅ Update result:');
      console.log(JSON.stringify(updateResult, null, 2));
      
      return true;
      
    } catch (error) {
      console.error('❌ Force approval failed:', error.message);
      console.log('💡 This is expected - template status is controlled by WhatsApp');
      return false;
    }
  }

  // Trigger sync by re-submitting template
  async triggerSync(contentSid) {
    console.log(`🔄 Triggering sync for template: ${contentSid}\n`);
    
    try {
      // Get current template data
      const templateData = await this.getTwilioTemplate(contentSid);
      
      if (!templateData) {
        console.log('❌ Could not get template data');
        return false;
      }
      
      console.log('💡 Suggestions to fix sync issue:');
      console.log('');
      console.log('1. 🌐 Twilio Console Manual Check:');
      console.log(`   https://console.twilio.com/us1/develop/content-api/content/${contentSid}`);
      console.log('');
      console.log('2. 📱 WhatsApp Business Manager:');
      console.log('   https://business.facebook.com/wa/manage/message-templates/');
      console.log(`   Search for: ${templateData.friendly_name}`);
      console.log('');
      console.log('3. 🔄 Manual Actions:');
      console.log('   - Click "Re-submit for approval" in Twilio Console');
      console.log('   - Or delete and recreate the template');
      console.log('   - Check webhook configuration');
      console.log('');
      console.log('4. ⏰ Wait Time:');
      console.log('   - WhatsApp approval can take 24-48 hours to sync to Twilio');
      console.log('   - Status will automatically update when sync completes');
      
      return true;
      
    } catch (error) {
      console.error('❌ Sync trigger failed:', error.message);
      return false;
    }
  }

  // Main sync function
  async syncTemplate(contentSid, templateName = null) {
    console.log('🚀 WhatsApp → Twilio Template Status Sync\n');
    console.log(`📋 Content SID: ${contentSid}`);
    console.log(`📝 Template Name: ${templateName || 'Auto-detect'}`);
    console.log('');
    
    // Get Twilio template data
    const twilioTemplate = await this.getTwilioTemplate(contentSid);
    
    if (!twilioTemplate) {
      console.log('❌ Could not access Twilio template');
      return;
    }
    
    const detectedName = twilioTemplate.friendly_name || templateName;
    
    // Check WhatsApp status
    const whatsappTemplate = await this.checkWhatsAppStatus(detectedName);
    
    console.log('\n📊 Status Comparison:');
    console.log(`   Twilio Status: ${twilioTemplate.whatsapp?.status || 'Unknown'}`);
    console.log(`   WhatsApp Status: ${whatsappTemplate?.status || 'Unknown'}`);
    
    if (whatsappTemplate?.status === 'APPROVED' && twilioTemplate.whatsapp?.status === 'pending') {
      console.log('\n🎯 SYNC ISSUE DETECTED!');
      console.log('   WhatsApp: APPROVED ✅');
      console.log('   Twilio: pending ⏳');
      console.log('');
      
      await this.triggerSync(contentSid);
      
    } else if (whatsappTemplate?.status === 'APPROVED' && twilioTemplate.whatsapp?.status === 'approved') {
      console.log('\n✅ STATUS IN SYNC!');
      console.log('   Both systems show: APPROVED');
      
    } else {
      console.log('\n⚠️  Status unclear or not approved yet');
      await this.triggerSync(contentSid);
    }
  }
}

// Run the sync
const contentSid = process.argv[2];
const templateName = process.argv[3];

if (!contentSid) {
  console.log('Usage: node sync-whatsapp-template-status.js <CONTENT_SID> [template_name]');
  console.log('');
  console.log('Example:');
  console.log('  node sync-whatsapp-template-status.js HX8815ea9e9c98ea11f928728a678eb741 copy_happy_test34');
  process.exit(1);
}

const syncer = new TemplateStatusSync();
syncer.syncTemplate(contentSid, templateName).catch(error => {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
}); 