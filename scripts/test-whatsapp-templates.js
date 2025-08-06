#!/usr/bin/env node

/**
 * WhatsApp Templates API Tester
 * 
 * Tests different API endpoints and field names for WhatsApp templates
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');

class WhatsAppTemplatesTester {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    console.log('🧪 WhatsApp Templates API Tester\n');
    console.log(`📱 Phone Number ID: ${this.phoneNumberId}`);
    console.log(`🏢 Business Account ID: ${this.businessAccountId}`);
    console.log('');
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

  // Test different API endpoints and versions
  async testAllEndpoints() {
    const tests = [
      {
        name: 'Phone Number Basic Info',
        url: `https://graph.facebook.com/v19.0/${this.phoneNumberId}?access_token=${this.accessToken}&fields=display_phone_number,verified_name,status`
      },
      {
        name: 'Message Templates (v19.0)',
        url: `https://graph.facebook.com/v19.0/${this.phoneNumberId}/message_templates?access_token=${this.accessToken}&limit=5`
      },
      {
        name: 'Message Templates (v18.0)',
        url: `https://graph.facebook.com/v18.0/${this.phoneNumberId}/message_templates?access_token=${this.accessToken}&limit=5`
      },
      {
        name: 'Message Templates (v17.0)',
        url: `https://graph.facebook.com/v17.0/${this.phoneNumberId}/message_templates?access_token=${this.accessToken}&limit=5`
      },
      {
        name: 'Business Account Templates',
        url: `https://graph.facebook.com/v19.0/${this.businessAccountId}/message_templates?access_token=${this.accessToken}&limit=5`
      },
      {
        name: 'Templates (Alternative Field)',
        url: `https://graph.facebook.com/v19.0/${this.phoneNumberId}/templates?access_token=${this.accessToken}&limit=5`
      },
      {
        name: 'WhatsApp Templates',
        url: `https://graph.facebook.com/v19.0/${this.phoneNumberId}/whatsapp_templates?access_token=${this.accessToken}&limit=5`
      },
      {
        name: 'Content Templates',
        url: `https://graph.facebook.com/v19.0/${this.phoneNumberId}/content_templates?access_token=${this.accessToken}&limit=5`
      }
    ];

    console.log('🧪 Testing different API endpoints...\n');

    for (const test of tests) {
      console.log(`📋 Testing: ${test.name}`);
      
      try {
        const result = await this.makeRequest(test.url);
        
        if (result.error) {
          console.log(`   ❌ Error: ${result.error.message}`);
        } else if (result.data) {
          console.log(`   ✅ Success! Found ${result.data.length} items`);
          
          if (result.data.length > 0) {
            console.log('   📄 Sample data:');
            result.data.slice(0, 2).forEach((item, index) => {
              console.log(`      ${index + 1}. ${item.name || item.id} (${item.status || 'No status'})`);
            });
          }
        } else if (result.display_phone_number) {
          console.log(`   ✅ Phone info: ${result.display_phone_number} (${result.status})`);
        } else {
          console.log(`   ⚠️  Unexpected response format`);
          console.log(`   📄 Raw response: ${JSON.stringify(result).substring(0, 200)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
      
      console.log('');
    }
  }

  // Test specific template search
  async searchTemplate(templateName) {
    console.log(`🔍 Searching for template: ${templateName}\n`);
    
    // Try the endpoint that worked
    const workingEndpoints = [
      `https://graph.facebook.com/v19.0/${this.businessAccountId}/message_templates?access_token=${this.accessToken}&fields=name,status,category,language&limit=100`,
      `https://graph.facebook.com/v18.0/${this.businessAccountId}/message_templates?access_token=${this.accessToken}&fields=name,status,category,language&limit=100`
    ];

    for (const url of workingEndpoints) {
      try {
        console.log(`📋 Trying: ${url.includes('v19.0') ? 'v19.0' : 'v18.0'} Business Account`);
        
        const result = await this.makeRequest(url);
        
        if (!result.error && result.data) {
          console.log(`   ✅ Found ${result.data.length} templates total`);
          
          // Search for our template
          const exactMatch = result.data.find(t => t.name === templateName);
          const suffixMatch = result.data.find(t => t.name.includes(templateName));
          
          if (exactMatch) {
            console.log(`   🎯 Exact match found: ${exactMatch.name} (${exactMatch.status})`);
            return exactMatch;
          } else if (suffixMatch) {
            console.log(`   🎯 Suffix match found: ${suffixMatch.name} (${suffixMatch.status})`);
            return suffixMatch;
          } else {
            console.log(`   ❌ Template '${templateName}' not found`);
            console.log('   📋 Available templates:');
            result.data.slice(0, 10).forEach((t, index) => {
              console.log(`      ${index + 1}. ${t.name} (${t.status})`);
            });
          }
        } else {
          console.log(`   ❌ Error: ${result.error?.message || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
      
      console.log('');
    }
    
    return null;
  }
}

// Main execution
async function main() {
  const tester = new WhatsAppTemplatesTester();
  
  const command = process.argv[2];
  const templateName = process.argv[3];
  
  if (command === 'search' && templateName) {
    await tester.searchTemplate(templateName);
  } else {
    await tester.testAllEndpoints();
    
    if (templateName) {
      console.log('\n' + '='.repeat(50));
      await tester.searchTemplate(templateName);
    }
  }
}

main().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}); 