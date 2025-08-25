/**
 * 🚀 Meta WhatsApp Business Management API - Template Service
 * 
 * Tam Meta API compliance için özel service
 * Referans: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/
 */

export interface MetaTemplateRequest {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: MetaTemplateComponent[];
  parameter_format?: 'POSITIONAL' | 'NAMED';
}

export interface MetaTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: MetaTemplateButton[];
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
}

export interface MetaTemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface MetaTemplateResponse {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
  category: string;
}

export interface MetaTemplateListResponse {
  data: {
    id: string;
    name: string;
    status: string;
    category: string;
    language: string;
    components: MetaTemplateComponent[];
    parameter_format: string;
  }[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export class MetaWhatsAppTemplateService {
  private readonly baseUrl = 'https://graph.facebook.com/v23.0';
  private readonly businessAccountId: string;
  private readonly accessToken: string;

  constructor() {
    // Hardcoded values from existing working configuration
    this.businessAccountId = '640124182025093';
    this.accessToken = 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6';
  }

  /**
   * 📋 Template oluştur - Meta API'ye tam uyumlu
   * POST /{WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates
   */
  async createTemplate(templateData: MetaTemplateRequest): Promise<{ success: boolean; data?: MetaTemplateResponse; error?: string }> {
    try {
      console.log('🚀 Creating template with Meta API:', templateData.name);
      console.log('📋 Template data:', JSON.stringify(templateData, null, 2));

      // Rate limiting kontrolü (100/hour limit)
      await this.checkRateLimit();

      // Template name validation (512 char limit)
      if (templateData.name.length > 512) {
        throw new Error('Template name cannot exceed 512 characters');
      }

      // Component validation
      const validation = this.validateTemplateComponents(templateData.components);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // API endpoint
      const url = `${this.baseUrl}/${this.businessAccountId}/message_templates`;
      
      const requestBody = {
        name: templateData.name,
        category: templateData.category,
        language: templateData.language,
        components: templateData.components,
        parameter_format: templateData.parameter_format || 'POSITIONAL'
      };

      console.log('🌐 API Request URL:', url);
      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        console.error('❌ Meta API Error:', result);
        const errorMessage = result.error?.message || result.error?.error_user_msg || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('✅ Template created successfully:', result);

      return {
        success: true,
        data: {
          id: result.id,
          status: result.status,
          category: result.category
        }
      };

    } catch (error) {
      console.error('❌ Template creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 📋 Template'leri listele - Meta API'den direkt
   * GET /{WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates
   */
  async getTemplates(fields: string[] = ['name', 'status', 'category', 'language', 'components'], limit: number = 50): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('📋 Fetching templates from Meta API...');

      const url = `${this.baseUrl}/${this.businessAccountId}/message_templates`;
      const params = new URLSearchParams({
        access_token: this.accessToken,
        fields: fields.join(','),
        limit: limit.toString()
      });

      const response = await fetch(`${url}?${params}`);
      const result: MetaTemplateListResponse = await response.json();

      if (!response.ok) {
        console.error('❌ Meta API Error:', result);
        // Template listesi için özel hata mesajı
        if (result.error?.code === 200) {
          console.warn('⚠️ Template listesi için App ID gerekli olabilir');
        }
        throw new Error(result.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Templates fetched:', result.data?.length || 0, 'templates');

      return {
        success: true,
        data: result.data || []
      };

    } catch (error) {
      console.error('❌ Template fetch failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 🗑️ Template sil - Meta API
   * DELETE /{WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates
   */
  async deleteTemplate(templateName: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting template:', templateName);

      const url = `${this.baseUrl}/${this.businessAccountId}/message_templates`;
      const params = new URLSearchParams({
        access_token: this.accessToken,
        name: templateName
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Meta API Error:', result);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Template deleted successfully');

      return { success: true };

    } catch (error) {
      console.error('❌ Template deletion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * ⏱️ Rate limiting kontrolü (100 template/hour limit)
   */
  private async checkRateLimit(): Promise<void> {
    // Rate limiting implementation buraya eklenecek
    // Şimdilik basit delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 🔍 API bağlantısını test et
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testing Meta API connection...');
      
      const url = `${this.baseUrl}/${this.businessAccountId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ API connection test failed:', result);
        return {
          success: false,
          error: result.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ API connection test successful:', result);
      return { success: true };

    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 🔍 Template component validator
   */
  validateTemplateComponents(components: MetaTemplateComponent[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // BODY component zorunlu
    const hasBody = components.some(c => c.type === 'BODY');
    if (!hasBody) {
      errors.push('BODY component is required');
    }

    // Component type validation
    for (const component of components) {
      if (!['HEADER', 'BODY', 'FOOTER', 'BUTTONS'].includes(component.type)) {
        errors.push(`Invalid component type: ${component.type}`);
      }

      // Test sonuçlarına göre: HEADER component'ler reddediliyor
      if (component.type === 'HEADER') {
        errors.push('Header components are not supported by Meta API (will be integrated into body)');
      }

      // Text validation
      if (component.text) {
        if (component.type === 'HEADER' && component.text.length > 60) {
          errors.push('Header text cannot exceed 60 characters');
        }
        if (component.type === 'BODY' && component.text.length > 1024) {
          errors.push('Body text cannot exceed 1024 characters');
        }
        if (component.type === 'FOOTER' && component.text.length > 60) {
          errors.push('Footer text cannot exceed 60 characters');
        }
      }

      // Button validation
      if (component.type === 'BUTTONS' && component.buttons) {
        if (component.buttons.length > 3) {
          errors.push('Maximum 3 buttons allowed');
        }
        
        for (const button of component.buttons) {
          if (!['QUICK_REPLY', 'URL', 'PHONE_NUMBER'].includes(button.type)) {
            errors.push(`Invalid button type: ${button.type}`);
          }
          if (!button.text || button.text.trim().length === 0) {
            errors.push('Button text is required');
          }
          if (button.text && button.text.length > 25) {
            errors.push('Button text cannot exceed 25 characters');
          }
          if (button.type === 'URL' && (!button.url || button.url.trim().length === 0)) {
            errors.push('URL button requires a valid URL');
          }
          if (button.type === 'PHONE_NUMBER' && (!button.phone_number || button.phone_number.trim().length === 0)) {
            errors.push('Phone button requires a valid phone number');
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 🔍 Template debug helper
   */
  debugTemplate(templateData: MetaTemplateRequest): void {
    console.log('🔍 Template Debug Info:');
    console.log('Name:', templateData.name);
    console.log('Category:', templateData.category);
    console.log('Language:', templateData.language);
    console.log('Parameter Format:', templateData.parameter_format);
    console.log('Components:', templateData.components.length);
    
    templateData.components.forEach((component, index) => {
      console.log(`Component ${index + 1}:`, {
        type: component.type,
        text: component.text?.substring(0, 50) + (component.text?.length > 50 ? '...' : ''),
        format: component.format,
        buttons: component.buttons?.length || 0
      });
    });
  }

  /**
   * 🧪 Test template oluştur
   */
  createTestTemplate(): MetaTemplateRequest {
    return {
      name: `test_template_${Date.now()}`,
      category: 'UTILITY',
      language: 'tr',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Test Template'
        },
        {
          type: 'BODY',
          text: 'Bu bir test template\'idir. {{1}} parametresi ile test ediliyor.'
        },
        {
          type: 'FOOTER',
          text: 'Test footer'
        }
      ],
      parameter_format: 'POSITIONAL'
    };
  }

  /**
   * 🔧 Template builder helper - UI'dan gelen veriyi Meta formatına çevir
   */
  buildTemplateFromUI(uiData: {
    name: string;
    category: string;
    language: string;
    headerText?: string;
    bodyText: string;
    footerText?: string;
    buttons?: { type: string; text: string; url?: string; phone?: string }[];
  }): MetaTemplateRequest {
    const components: MetaTemplateComponent[] = [];

    // Test sonuçlarına göre: Header template'ler reddediliyor
    // Bu yüzden header'ı body'ye entegre ediyoruz
    let bodyText = uiData.bodyText.trim();
    
    if (uiData.headerText && uiData.headerText.trim()) {
      // Header'ı body'nin başına ekle
      bodyText = `${uiData.headerText.trim()}\n\n${bodyText}`;
      console.log('⚠️ Header component body\'ye entegre edildi (Meta API kısıtlaması)');
    }

    // Body component (zorunlu)
    const bodyComponent: MetaTemplateComponent = {
      type: 'BODY',
      text: bodyText
    };

    // Body'de parametre varsa example ekle
    const parameterCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;
    if (parameterCount > 0) {
      bodyComponent.example = {
        body_text: [Array(parameterCount).fill('example')]
      };
    }

    components.push(bodyComponent);

    // Footer component (test sonuçlarına göre güvenli)
    if (uiData.footerText && uiData.footerText.trim()) {
      components.push({
        type: 'FOOTER',
        text: uiData.footerText.trim()
      });
    }

    // Buttons component (test sonuçlarına göre güvenli)
    if (uiData.buttons && uiData.buttons.length > 0) {
      const validButtons = uiData.buttons
        .filter(btn => btn.text && btn.text.trim())
        .map(btn => {
          // UI button type'ını Meta API type'ına çevir
          let metaButtonType: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
          switch (btn.type) {
            case 'quick_reply':
              metaButtonType = 'QUICK_REPLY';
              break;
            case 'url':
              metaButtonType = 'URL';
              break;
            case 'phone':
              metaButtonType = 'PHONE_NUMBER';
              break;
            default:
              metaButtonType = 'QUICK_REPLY';
          }

          return {
            type: metaButtonType,
            text: btn.text.trim(),
            url: btn.url?.trim(),
            phone_number: btn.phone?.trim()
          };
        });

      if (validButtons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons: validButtons
        });
      }
    }

    // Test sonuçlarına göre: Category otomatik olarak MARKETING'e çevriliyor
    // Bu yüzden UTILITY kullanmaya devam ediyoruz
    return {
      name: uiData.name.trim(),
      category: uiData.category.toUpperCase() as 'MARKETING' | 'UTILITY' | 'AUTHENTICATION',
      language: uiData.language.toLowerCase(),
      components,
      parameter_format: 'POSITIONAL'
    };
  }
}

// 🏭 Factory function
export function createMetaTemplateService(): MetaWhatsAppTemplateService {
  return new MetaWhatsAppTemplateService();
}
