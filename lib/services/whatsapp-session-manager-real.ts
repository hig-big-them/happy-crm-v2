/**
 * WhatsApp Business API 24-Hour Session Window Manager
 * 
 * Implements the actual WhatsApp Business API session window rules:
 * - Customer-initiated: 24-hour window for free-form messages
 * - Business-initiated: Template messages only after 24 hours
 * - Proper pricing category tracking
 */

import { createServiceClient } from '@/lib/supabase/service-real';

export interface SessionStatus {
  canSendFreeForm: boolean;
  requiresTemplate: boolean;
  sessionExpiresAt: Date | null;
  lastCustomerMessageAt: Date | null;
  lastBusinessMessageAt: Date | null;
  conversationCategory: 'business_initiated' | 'customer_initiated' | 'none';
  isWithin24Hours: boolean;
}

export class WhatsAppSessionManager {
  private readonly SESSION_WINDOW_HOURS = 24;
  private readonly SESSION_WINDOW_MS = this.SESSION_WINDOW_HOURS * 60 * 60 * 1000;

  /**
   * Get current session status for a phone number
   */
  async getSessionStatus(phoneNumber: string): Promise<SessionStatus> {
    try {
      const supabase = createServiceClient();
      
      // Get the latest conversation data
      const { data: conversation, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Error fetching conversation:', error);
      }

      if (!conversation) {
        // No conversation history - requires template
        return {
          canSendFreeForm: false,
          requiresTemplate: true,
          sessionExpiresAt: null,
          lastCustomerMessageAt: null,
          lastBusinessMessageAt: null,
          conversationCategory: 'none',
          isWithin24Hours: false
        };
      }

      const now = new Date();
      const lastCustomerMessage = conversation.last_customer_message_at 
        ? new Date(conversation.last_customer_message_at)
        : null;
      const lastBusinessMessage = conversation.last_business_message_at
        ? new Date(conversation.last_business_message_at)
        : null;

      // Calculate if we're within 24-hour window
      const isWithin24Hours = lastCustomerMessage 
        ? (now.getTime() - lastCustomerMessage.getTime()) < this.SESSION_WINDOW_MS
        : false;

      // Determine conversation category
      let conversationCategory: SessionStatus['conversationCategory'] = 'none';
      if (isWithin24Hours) {
        conversationCategory = 'customer_initiated';
      } else if (lastBusinessMessage && (!lastCustomerMessage || lastBusinessMessage > lastCustomerMessage)) {
        conversationCategory = 'business_initiated';
      }

      // Calculate session expiry
      const sessionExpiresAt = lastCustomerMessage && isWithin24Hours
        ? new Date(lastCustomerMessage.getTime() + this.SESSION_WINDOW_MS)
        : null;

      return {
        canSendFreeForm: isWithin24Hours,
        requiresTemplate: !isWithin24Hours,
        sessionExpiresAt,
        lastCustomerMessageAt: lastCustomerMessage,
        lastBusinessMessageAt: lastBusinessMessage,
        conversationCategory,
        isWithin24Hours
      };
    } catch (error) {
      console.error('Error getting session status:', error);
      
      // On error, default to requiring template (safe mode)
      return {
        canSendFreeForm: false,
        requiresTemplate: true,
        sessionExpiresAt: null,
        lastCustomerMessageAt: null,
        lastBusinessMessageAt: null,
        conversationCategory: 'none',
        isWithin24Hours: false
      };
    }
  }

  /**
   * Update session when customer sends a message
   */
  async handleCustomerMessage(
    phoneNumber: string,
    messageId: string,
    timestamp?: Date
  ): Promise<void> {
    try {
      const supabase = createServiceClient();
      const messageTime = timestamp || new Date();

      // Upsert conversation record
      const { error } = await supabase
        .from('whatsapp_conversations')
        .upsert({
          phone_number: phoneNumber,
          last_customer_message_at: messageTime.toISOString(),
          last_customer_message_id: messageId,
          conversation_category: 'customer_initiated',
          session_expires_at: new Date(messageTime.getTime() + this.SESSION_WINDOW_MS).toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'phone_number'
        });

      if (error) {
        console.error('Error updating customer message session:', error);
      } else {
        console.log(`✅ Session updated for customer message from ${phoneNumber}`);
      }

      // Also log in session history
      await this.logSessionEvent(phoneNumber, 'customer_message', {
        message_id: messageId,
        timestamp: messageTime.toISOString()
      });
    } catch (error) {
      console.error('Error handling customer message:', error);
    }
  }

  /**
   * Update session when business sends a message
   */
  async handleBusinessMessage(
    phoneNumber: string,
    messageId: string,
    isTemplate: boolean,
    timestamp?: Date
  ): Promise<void> {
    try {
      const supabase = createServiceClient();
      const messageTime = timestamp || new Date();

      // Get current session status
      const status = await this.getSessionStatus(phoneNumber);

      // Determine conversation category
      const category = status.isWithin24Hours 
        ? 'customer_initiated'
        : 'business_initiated';

      // Update conversation record
      const { error } = await supabase
        .from('whatsapp_conversations')
        .upsert({
          phone_number: phoneNumber,
          last_business_message_at: messageTime.toISOString(),
          last_business_message_id: messageId,
          last_template_sent: isTemplate ? messageTime.toISOString() : undefined,
          conversation_category: category,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'phone_number'
        });

      if (error) {
        console.error('Error updating business message session:', error);
      } else {
        console.log(`✅ Session updated for business message to ${phoneNumber}`);
      }

      // Log session event
      await this.logSessionEvent(phoneNumber, 'business_message', {
        message_id: messageId,
        is_template: isTemplate,
        category,
        timestamp: messageTime.toISOString()
      });
    } catch (error) {
      console.error('Error handling business message:', error);
    }
  }

  /**
   * Check if a template is required for sending a message
   */
  async requiresTemplate(phoneNumber: string): Promise<boolean> {
    const status = await this.getSessionStatus(phoneNumber);
    return status.requiresTemplate;
  }

  /**
   * Get remaining time in session window
   */
  async getSessionRemainingTime(phoneNumber: string): Promise<number | null> {
    const status = await this.getSessionStatus(phoneNumber);
    
    if (!status.sessionExpiresAt) {
      return null;
    }

    const remaining = status.sessionExpiresAt.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Log session events for audit trail
   */
  private async logSessionEvent(
    phoneNumber: string,
    eventType: string,
    metadata: any
  ): Promise<void> {
    try {
      const supabase = createServiceClient();
      
      const { error } = await supabase
        .from('whatsapp_session_events')
        .insert({
          phone_number: phoneNumber,
          event_type: eventType,
          metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging session event:', error);
      }
    } catch (error) {
      console.error('Error in logSessionEvent:', error);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const supabase = createServiceClient();
      const cutoffTime = new Date(Date.now() - this.SESSION_WINDOW_MS * 2); // Keep 48 hours of history

      const { error, count } = await supabase
        .from('whatsapp_conversations')
        .delete()
        .lt('updated_at', cutoffTime.toISOString())
        .is('session_expires_at', null);

      if (error) {
        console.error('Error cleaning up sessions:', error);
      } else if (count && count > 0) {
        console.log(`🧹 Cleaned up ${count} expired sessions`);
      }
    } catch (error) {
      console.error('Error in cleanupExpiredSessions:', error);
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const supabase = createServiceClient();
      
      let query = supabase
        .from('whatsapp_session_events')
        .select('event_type, created_at, metadata');

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching analytics:', error);
        return null;
      }

      // Process analytics
      const analytics = {
        total_sessions: 0,
        customer_initiated: 0,
        business_initiated: 0,
        template_messages: 0,
        free_form_messages: 0
      };

      data?.forEach(event => {
        if (event.event_type === 'customer_message') {
          analytics.customer_initiated++;
        } else if (event.event_type === 'business_message') {
          analytics.business_initiated++;
          if (event.metadata?.is_template) {
            analytics.template_messages++;
          } else {
            analytics.free_form_messages++;
          }
        }
      });

      analytics.total_sessions = analytics.customer_initiated + analytics.business_initiated;

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }
}

// Singleton instance
let sessionManager: WhatsAppSessionManager | null = null;

export function getSessionManager(): WhatsAppSessionManager {
  if (!sessionManager) {
    sessionManager = new WhatsAppSessionManager();
  }
  return sessionManager;
}