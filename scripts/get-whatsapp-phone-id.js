#!/usr/bin/env node

/**
 * WhatsApp Phone Number ID Helper
 * 
 * Helps you find and configure WhatsApp Phone Number ID for API access
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');

class WhatsAppPhoneHelper {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    
    console.log('🔍 WhatsApp Phone Number ID Helper\n');
    console.log(`✅ Access Token: ${this.accessToken ? this.accessToken.substring(0, 20) + '...' : 'Missing'}`);
    console.log(`✅ Business Account ID: ${this.businessAccountId || 'Missing'}`);
    console.log(`✅ App ID: ${this.appId || 'Missing'}`);
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

  // Try multiple methods to get phone number ID
  async findPhoneNumberId() {
    console.log('🔍 Trying multiple methods to find Phone Number ID...\n');
    
    // Method 1: Direct business account access
    if (this.businessAccountId && this.accessToken) {
      console.log('📋 Method 1: Direct Business Account Access');
      const result1 = await this.tryBusinessAccount();
      if (result1) return result1;
    }
    
    // Method 2: App-based access
    if (this.appId && this.accessToken) {
      console.log('📋 Method 2: App-based Access');
      const result2 = await this.tryAppAccess();
      if (result2) return result2;
    }
    
    // Method 3: Manual discovery via different API versions
    if (this.businessAccountId && this.accessToken) {
      console.log('📋 Method 3: API Version Testing');
      const result3 = await this.tryDifferentVersions();
      if (result3) return result3;
    }
    
    // Method 4: Show manual steps
    console.log('📋 Method 4: Manual Steps');
    this.showManualSteps();
    
    return null;
  }

  // Method 1: Direct business account
  async tryBusinessAccount() {
    try {
      const versions = ['v19.0', 'v18.0', 'v17.0'];
      
      for (const version of versions) {
        console.log(`   Testing API ${version}...`);
        
        const url = `https://graph.facebook.com/${version}/${this.businessAccountId}/phone_numbers?access_token=${this.accessToken}`;
        const result = await this.makeRequest(url);
        
        if (!result.error && result.data && result.data.length > 0) {
          console.log(`   ✅ Success with ${version}!`);
          console.log(`   📱 Found ${result.data.length} phone number(s):`);
          
          result.data.forEach((phone, index) => {
            console.log(`      ${index + 1}. ${phone.display_phone_number} (ID: ${phone.id})`);
          });
          
          return result.data[0].id;
        } else if (result.error) {
          console.log(`   ❌ ${version}: ${result.error.message}`);
        }
      }
      
      return null;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return null;
    }
  }

  // Method 2: App access
  async tryAppAccess() {
    try {
      const url = `https://graph.facebook.com/v19.0/${this.appId}/whatsapp_business_accounts?access_token=${this.accessToken}`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error.message}`);
        return null;
      }
      
      if (!result.data || result.data.length === 0) {
        console.log('   ❌ No business accounts found');
        return null;
      }
      
      console.log(`   ✅ Found ${result.data.length} business account(s)`);
      
      // Try to get phone numbers for each business account
      for (const account of result.data) {
        console.log(`   📋 Checking account: ${account.id} (${account.name || 'No name'})`);
        
        const phoneUrl = `https://graph.facebook.com/v19.0/${account.id}/phone_numbers?access_token=${this.accessToken}`;
        const phoneResult = await this.makeRequest(phoneUrl);
        
        if (!phoneResult.error && phoneResult.data && phoneResult.data.length > 0) {
          console.log(`   ✅ Found phone numbers for ${account.id}:`);
          
          phoneResult.data.forEach((phone, index) => {
            console.log(`      ${index + 1}. ${phone.display_phone_number} (ID: ${phone.id})`);
          });
          
          return phoneResult.data[0].id;
        }
      }
      
      return null;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return null;
    }
  }

  // Method 3: Different API versions
  async tryDifferentVersions() {
    const endpoints = [
      'phone_numbers',
      'owned_whatsapp_business_accounts',
      'whatsapp_business_accounts'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing endpoint: ${endpoint}`);
        
        const url = `https://graph.facebook.com/v19.0/${this.businessAccountId}/${endpoint}?access_token=${this.accessToken}`;
        const result = await this.makeRequest(url);
        
        if (!result.error && result.data) {
          console.log(`   ✅ ${endpoint} returned data:`, JSON.stringify(result.data, null, 2));
          
          // Look for phone number ID in response
          if (result.data.length > 0 && result.data[0].id) {
            return result.data[0].id;
          }
        } else if (result.error) {
          console.log(`   ❌ ${endpoint}: ${result.error.message}`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${endpoint} error: ${error.message}`);
      }
    }
    
    return null;
  }

  // Method 4: Manual steps
  showManualSteps() {
    console.log('📋 Manual Steps to Find Phone Number ID:');
    console.log('');
    console.log('1. 🌐 Go to WhatsApp Business Manager:');
    console.log('   https://business.facebook.com/wa/manage/phone-numbers/');
    console.log('');
    console.log('2. 📱 Select your phone number');
    console.log('');
    console.log('3. 🔍 Look for "Phone Number ID" in the settings');
    console.log('   OR check the URL - it contains the Phone Number ID');
    console.log('   Example URL: https://business.facebook.com/.../12345678901234567/');
    console.log('   Phone Number ID would be: 12345678901234567');
    console.log('');
    console.log('4. 📝 Add to your .env.local file:');
    console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here');
    console.log('');
    console.log('5. 🔧 Alternative: Facebook Developer Console');
    console.log('   https://developers.facebook.com/apps/');
    console.log('   • Select your app');
    console.log('   • Go to WhatsApp > API Setup');
    console.log('   • Find "Phone Number ID" field');
    console.log('');
    console.log('6. 🧪 Test the configuration:');
    console.log('   node scripts/test-whatsapp-phone-id.js');
  }

  // Test a specific phone number ID
  async testPhoneNumberId(phoneNumberId) {
    console.log(`🧪 Testing Phone Number ID: ${phoneNumberId}\n`);
    
    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}?access_token=${this.accessToken}&fields=display_phone_number,verified_name,quality_rating,status`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.log('❌ Phone Number ID test failed:', result.error.message);
        return false;
      }
      
      console.log('✅ Phone Number ID is valid!');
      console.log(`   📞 Number: ${result.display_phone_number || 'N/A'}`);
      console.log(`   ✅ Name: ${result.verified_name || 'N/A'}`);
      console.log(`   📊 Status: ${result.status || 'N/A'}`);
      console.log(`   ⭐ Quality: ${result.quality_rating || 'N/A'}`);
      
      // Test template access
      console.log('\n🔍 Testing template access...');
      const templatesUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/message_templates?access_token=${this.accessToken}&limit=5`;
      const templateResult = await this.makeRequest(templatesUrl);
      
      if (templateResult.error) {
        console.log('❌ Template access failed:', templateResult.error.message);
      } else {
        console.log(`✅ Template access OK! Found ${templateResult.data?.length || 0} templates`);
      }
      
      return true;
      
    } catch (error) {
      console.log('❌ Test failed:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const helper = new WhatsAppPhoneHelper();
  
  const command = process.argv[2];
  const phoneNumberId = process.argv[3];
  
  if (command === 'test' && phoneNumberId) {
    await helper.testPhoneNumberId(phoneNumberId);
  } else if (command === 'manual') {
    helper.showManualSteps();
  } else {
    const foundId = await helper.findPhoneNumberId();
    
    if (foundId) {
      console.log('\n🎉 Success! Add this to your .env.local:');
      console.log(`WHATSAPP_PHONE_NUMBER_ID=${foundId}`);
    } else {
      console.log('\n⚠️  Could not automatically find Phone Number ID');
      console.log('Please follow the manual steps above');
    }
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}); 