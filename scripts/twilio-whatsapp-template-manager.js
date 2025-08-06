#!/usr/bin/env node

/**
 * Twilio WhatsApp Template Manager
 * 
 * Manages WhatsApp templates through Twilio CLI and API
 * Uses your existing Twilio WhatsApp Phone Number
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

class TwilioWhatsAppTemplateManager {
  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Your WhatsApp setup from Twilio
    this.whatsappPhoneNumber = '+447460644222';
    this.whatsappPhoneNumberSid = 'PNa8598490afa6bd4c5b89597af0d5859a';
    this.messagingServiceSid = 'MGf88f205d1093eae73c8a43a3263e1be9';
    
    this.validateCredentials();
  }

  validateCredentials() {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      console.error('❌ TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required');
      process.exit(1);
    }
    
    console.log('✅ Twilio credentials loaded');
    console.log(`📞 WhatsApp Number: ${this.whatsappPhoneNumber}`);
    console.log(`🆔 Phone Number SID: ${this.whatsappPhoneNumberSid}`);
    console.log(`📱 Messaging Service: ${this.messagingServiceSid}`);
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
      throw error;
    }
  }

  // List all Content API templates
  async listContentTemplates() {
    console.log('📋 Listing Twilio Content API Templates...\n');
    
    try {
      const result = this.runTwilioCommand('api:content:v1:contents:list');
      
      if (!result || result.trim() === '') {
        console.log('📝 No Content API templates found yet');
        return;
      }
      
      console.log('✅ Content API Templates:');
      console.log(result);
      
    } catch (error) {
      console.error('❌ Failed to list content templates:', error.message);
    }
  }

  // Create a simple WhatsApp template in Content API
  async createContentTemplate(name, bodyText) {
    console.log(`📝 Creating Content Template: ${name}\n`);
    
    try {
      // Create JSON for template
      const templateData = {
        friendly_name: name,
        language: 'tr',
        types: {
          'twilio/text': {
            body: bodyText
          }
        }
      };
      
      // Use curl since Twilio CLI content creation is complex
      const command = `curl -X POST "https://content.twilio.com/v1/Content" ` +
        `-u "${this.twilioAccountSid}:${this.twilioAuthToken}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${JSON.stringify(templateData)}'`;
      
      console.log('📤 Creating template with curl...');
      const result = execSync(command, { encoding: 'utf-8' });
      
      console.log('✅ Template creation result:');
      console.log(result);
      
    } catch (error) {
      console.error('❌ Failed to create template:', error.message);
    }
  }

  // Send a test WhatsApp message using messaging service
  async sendTestMessage(to, body) {
    console.log(`📱 Sending test WhatsApp message to ${to}\n`);
    
    try {
      const command = `api:messages:create ` +
        `--messaging-service-sid ${this.messagingServiceSid} ` +
        `--to "whatsapp:${to}" ` +
        `--body "${body}"`;
      
      const result = this.runTwilioCommand(command);
      
      console.log('✅ Message sent successfully:');
      console.log(result);
      
    } catch (error) {
      console.error('❌ Failed to send message:', error.message);
    }
  }

  // Check messaging service configuration
  async checkConfiguration() {
    console.log('🔍 Checking WhatsApp Configuration...\n');
    
    try {
      // Check messaging service
      console.log('📱 Messaging Service Details:');
      const serviceResult = this.runTwilioCommand(
        `api:messaging:v1:services:fetch --sid ${this.messagingServiceSid}`
      );
      console.log(serviceResult);
      console.log('');
      
      // Check phone number
      console.log('📞 Phone Number Details:');
      const phoneResult = this.runTwilioCommand(
        `api:messaging:v1:services:phone-numbers:list --service-sid ${this.messagingServiceSid}`
      );
      console.log(phoneResult);
      console.log('');
      
      // List content templates
      await this.listContentTemplates();
      
    } catch (error) {
      console.error('❌ Configuration check failed:', error.message);
    }
  }

  // Main menu
  async showMenu() {
    console.log('🚀 Twilio WhatsApp Template Manager\n');
    console.log('Available commands:');
    console.log('  check     - Check current configuration');
    console.log('  list      - List Content API templates');
    console.log('  create    - Create new template');
    console.log('  test      - Send test message');
    console.log('');
    
    const command = process.argv[2];
    
    switch (command) {
      case 'check':
        await this.checkConfiguration();
        break;
        
      case 'list':
        await this.listContentTemplates();
        break;
        
      case 'create':
        const name = process.argv[3];
        const body = process.argv[4];
        if (!name || !body) {
          console.log('Usage: create <name> <body>');
          console.log('Example: create "welcome" "Hello {{1}}, welcome to Happy CRM!"');
          return;
        }
        await this.createContentTemplate(name, body);
        break;
        
      case 'test':
        const to = process.argv[3];
        const message = process.argv[4];
        if (!to || !message) {
          console.log('Usage: test <phone_number> <message>');
          console.log('Example: test "+905551234567" "Test message"');
          return;
        }
        await this.sendTestMessage(to, message);
        break;
        
      default:
        await this.checkConfiguration();
        break;
    }
  }
}

// Run the manager
const manager = new TwilioWhatsAppTemplateManager();
manager.showMenu().catch(error => {
  console.error('❌ Manager failed:', error.message);
  process.exit(1);
}); 