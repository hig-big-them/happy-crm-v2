#!/usr/bin/env node

/**
 * Get WhatsApp Phone Number ID
 * 
 * Finds Phone Number ID for template access
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');

class PhoneNumberFinder {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
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

  // Get phone numbers
  async getPhoneNumbers() {
    console.log('🔍 Getting WhatsApp Phone Numbers...\n');
    
    try {
      const url = `https://graph.facebook.com/v19.0/${this.businessAccountId}/phone_numbers?access_token=${this.accessToken}`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.error('❌ Error:', result.error.message);
        return;
      }
      
      if (!result.data || result.data.length === 0) {
        console.log('❌ No phone numbers found');
        return;
      }
      
      console.log(`✅ Found ${result.data.length} phone number(s):\n`);
      
      result.data.forEach((phone, index) => {
        console.log(`${index + 1}. Phone Number: ${phone.display_phone_number}`);
        console.log(`   📱 Phone Number ID: ${phone.id}`);
        console.log(`   📊 Status: ${phone.status}`);
        console.log(`   🔗 Name Status: ${phone.name_status}`);
        console.log(`   📋 Quality Rating: ${phone.quality_rating || 'N/A'}`);
        console.log('');
      });
      
      // Test template access with first phone number
      if (result.data.length > 0) {
        const phoneNumberId = result.data[0].id;
        console.log(`🧪 Testing template access with Phone Number ID: ${phoneNumberId}\n`);
        
        await this.testTemplateAccess(phoneNumberId);
        
        console.log('\n📋 Add this to your .env.local:');
        console.log(`WHATSAPP_PHONE_NUMBER_ID=${phoneNumberId}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to get phone numbers:', error.message);
    }
  }

  // Test template access with phone number ID
  async testTemplateAccess(phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/message_templates?access_token=${this.accessToken}&limit=5`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.error('❌ Template Access Error:', result.error.message);
        return false;
      }
      
      console.log('✅ Template Access SUCCESS!');
      
      if (result.data && result.data.length > 0) {
        console.log(`📋 Found ${result.data.length} template(s):`);
        
        result.data.forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name} (${template.status}) - ${template.language}`);
        });
      } else {
        console.log('📝 No templates found yet (this is normal for new accounts)');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Template test failed:', error.message);
      return false;
    }
  }
}

// Run the finder
const finder = new PhoneNumberFinder();
finder.getPhoneNumbers(); 