#!/usr/bin/env node

/**
 * WhatsApp Access Verification
 * 
 * Verifies WhatsApp Business Account ID and Access Token
 * Helps debug permission issues
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');

class WhatsAppVerifier {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    
    if (!this.accessToken) {
      console.error('❌ WHATSAPP_ACCESS_TOKEN missing');
      process.exit(1);
    }
    
    console.log(`✅ Access Token: ${this.accessToken.substring(0, 20)}...`);
    console.log(`✅ Business Account ID: ${this.businessAccountId || 'Not provided'}`);
    console.log(`✅ App ID: ${this.appId || 'Not provided'}`);
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

  // Test access token
  async testAccessToken() {
    console.log('\n🔍 Testing Access Token...');
    
    try {
      const url = `https://graph.facebook.com/v17.0/me?access_token=${this.accessToken}`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.error('❌ Access Token Error:', result.error.message);
        return false;
      }
      
      console.log('✅ Access Token is valid');
      console.log(`   App ID: ${result.id}`);
      console.log(`   App Name: ${result.name || 'N/A'}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Access Token Test Failed:', error.message);
      return false;
    }
  }

  // Get WhatsApp Business Accounts
  async getBusinessAccounts() {
    console.log('\n🔍 Getting WhatsApp Business Accounts...');
    
    if (!this.appId) {
      console.log('⚠️  App ID not provided, trying with token only');
      
      // Try direct business account access
      if (this.businessAccountId) {
        return await this.testBusinessAccount(this.businessAccountId);
      }
      
      console.log('❌ Cannot get business accounts without App ID or Business Account ID');
      return false;
    }
    
    try {
      const url = `https://graph.facebook.com/v17.0/${this.appId}/whatsapp_business_accounts?access_token=${this.accessToken}`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.error('❌ Business Accounts Error:', result.error.message);
        return false;
      }
      
      if (!result.data || result.data.length === 0) {
        console.log('❌ No WhatsApp Business Accounts found');
        return false;
      }
      
      console.log(`✅ Found ${result.data.length} WhatsApp Business Account(s):`);
      
      result.data.forEach((account, index) => {
        console.log(`   ${index + 1}. ID: ${account.id}`);
        console.log(`      Name: ${account.name || 'N/A'}`);
        console.log(`      Status: ${account.account_review_status || 'N/A'}`);
      });
      
      // Test the configured one if provided
      if (this.businessAccountId) {
        const configuredAccount = result.data.find(acc => acc.id === this.businessAccountId);
        if (configuredAccount) {
          console.log(`\n✅ Configured Business Account ID ${this.businessAccountId} is valid`);
          return await this.testBusinessAccount(this.businessAccountId);
        } else {
          console.log(`\n❌ Configured Business Account ID ${this.businessAccountId} not found in your accounts`);
          return false;
        }
      }
      
      // Test the first one
      return await this.testBusinessAccount(result.data[0].id);
      
    } catch (error) {
      console.error('❌ Business Accounts Test Failed:', error.message);
      return false;
    }
  }

  // Test specific business account
  async testBusinessAccount(businessAccountId) {
    console.log(`\n🔍 Testing Business Account: ${businessAccountId}`);
    
    try {
      // First, try to get basic account info
      const accountUrl = `https://graph.facebook.com/v17.0/${businessAccountId}?access_token=${this.accessToken}`;
      const accountResult = await this.makeRequest(accountUrl);
      
      if (accountResult.error) {
        console.error('❌ Business Account Error:', accountResult.error.message);
        return false;
      }
      
      console.log('✅ Business Account Access OK');
      console.log(`   Account ID: ${accountResult.id}`);
      console.log(`   Name: ${accountResult.name || 'N/A'}`);
      
      // Now try to access message templates
      await this.testTemplateAccess(businessAccountId);
      
      return true;
      
    } catch (error) {
      console.error('❌ Business Account Test Failed:', error.message);
      return false;
    }
  }

  // Test template access
  async testTemplateAccess(businessAccountId) {
    console.log(`\n🔍 Testing Template Access...`);
    
    try {
      const templateUrl = `https://graph.facebook.com/v17.0/${businessAccountId}/message_templates?access_token=${this.accessToken}&limit=5`;
      const templateResult = await this.makeRequest(templateUrl);
      
      if (templateResult.error) {
        console.error('❌ Template Access Error:', templateResult.error.message);
        console.log('\n💡 Possible solutions:');
        console.log('   1. Access token needs "whatsapp_business_management" permission');
        console.log('   2. Business account may not be approved for templates');
        console.log('   3. Try generating a new access token');
        return false;
      }
      
      console.log('✅ Template Access OK');
      
      if (templateResult.data && templateResult.data.length > 0) {
        console.log(`   Found ${templateResult.data.length} templates:`);
        
        templateResult.data.forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name} (${template.status})`);
        });
      } else {
        console.log('   No templates found (this is normal if you haven\'t created any)');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Template Access Test Failed:', error.message);
      return false;
    }
  }

  // Get token info
  async getTokenInfo() {
    console.log('\n🔍 Getting Token Information...');
    
    try {
      const url = `https://graph.facebook.com/v17.0/debug_token?input_token=${this.accessToken}&access_token=${this.accessToken}`;
      const result = await this.makeRequest(url);
      
      if (result.error) {
        console.error('❌ Token Info Error:', result.error.message);
        return false;
      }
      
      const tokenData = result.data;
      
      console.log('✅ Token Information:');
      console.log(`   Valid: ${tokenData.is_valid}`);
      console.log(`   App ID: ${tokenData.app_id}`);
      console.log(`   Expires: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : 'Never'}`);
      console.log(`   Scopes: ${tokenData.scopes ? tokenData.scopes.join(', ') : 'N/A'}`);
      
      // Check for required scopes
      const requiredScopes = ['whatsapp_business_management', 'whatsapp_business_messaging'];
      const hasRequiredScopes = requiredScopes.some(scope => 
        tokenData.scopes && tokenData.scopes.includes(scope)
      );
      
      if (!hasRequiredScopes) {
        console.log('\n⚠️  Token may be missing required WhatsApp permissions');
        console.log('   Required: whatsapp_business_management or whatsapp_business_messaging');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Token Info Test Failed:', error.message);
      return false;
    }
  }

  // Run all verifications
  async verify() {
    console.log('🚀 WhatsApp Access Verification\n');
    
    const tests = [
      () => this.testAccessToken(),
      () => this.getTokenInfo(),
      () => this.getBusinessAccounts()
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      const result = await test();
      if (!result) {
        allPassed = false;
      }
      console.log(''); // Add spacing
    }
    
    if (allPassed) {
      console.log('🎉 All verifications passed! Your WhatsApp setup is ready.');
    } else {
      console.log('❌ Some verifications failed. Check the errors above.');
      console.log('\n💡 Next steps:');
      console.log('   1. Generate new access token with proper permissions');
      console.log('   2. Verify Business Account ID');
      console.log('   3. Check WhatsApp Business account approval status');
    }
  }
}

// Run verification
const verifier = new WhatsAppVerifier();
verifier.verify().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}); 