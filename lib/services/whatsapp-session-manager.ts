/**
 * WhatsApp Session Manager
 * 
 * Manages 24-hour conversation windows for WhatsApp Business API
 */

import { createClient } from '@/lib/supabase/client';

export interface WhatsAppSession {
  id: string;
  lead_id: string;
  phone_number: string;
  session_start: string;
  session_end: string;
  is_active: boolean;
  last_inbound_message_at?: string;
  last_outbound_message_at?: string;
  template_initiated: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionStatus {
  canSendFreeForm: boolean;
  sessionActive: boolean;
  timeRemaining?: number; // minutes
  sessionStart?: string;
  sessionEnd?: string;
  requiresTemplate: boolean;
}

export class WhatsAppSessionManager {
  private supabase = createClient();
  
  /**
   * Check if free-form messaging is allowed for a lead
   */
  async getSessionStatus(leadId: string, phoneNumber: string): Promise<SessionStatus> {
    try {
      const { data: session, error } = await this.supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('lead_id', leadId)
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching WhatsApp session:', error);
        return {
          canSendFreeForm: false,
          sessionActive: false,
          requiresTemplate: true
        };
      }

      if (!session) {
        return {
          canSendFreeForm: false,
          sessionActive: false,
          requiresTemplate: true
        };
      }

      const now = new Date();
      const sessionEnd = new Date(session.session_end);
      const isActive = now < sessionEnd;
      const timeRemaining = isActive ? Math.floor((sessionEnd.getTime() - now.getTime()) / (1000 * 60)) : 0;

      if (!isActive) {
        // Mark session as inactive
        await this.supabase
          .from('whatsapp_sessions')
          .update({ is_active: false })
          .eq('id', session.id);
      }

      return {
        canSendFreeForm: isActive,
        sessionActive: isActive,
        timeRemaining: isActive ? timeRemaining : 0,
        sessionStart: session.session_start,
        sessionEnd: session.session_end,
        requiresTemplate: !isActive
      };
    } catch (error) {
      console.error('Error checking WhatsApp session status:', error);
      return {
        canSendFreeForm: false,
        sessionActive: false,
        requiresTemplate: true
      };
    }
  }

  /**
   * Create a new 24-hour session when inbound message is received
   */
  async createSession(leadId: string, phoneNumber: string, triggeredByTemplate = false): Promise<WhatsAppSession | null> {
    try {
      // First, deactivate any existing sessions
      await this.supabase
        .from('whatsapp_sessions')
        .update({ is_active: false })
        .eq('lead_id', leadId)
        .eq('phone_number', phoneNumber)
        .eq('is_active', true);

      const now = new Date();
      const sessionEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const { data: session, error } = await this.supabase
        .from('whatsapp_sessions')
        .insert({
          lead_id: leadId,
          phone_number: phoneNumber,
          session_start: now.toISOString(),
          session_end: sessionEnd.toISOString(),
          is_active: true,
          template_initiated: triggeredByTemplate,
          last_inbound_message_at: triggeredByTemplate ? null : now.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating WhatsApp session:', error);
        return null;
      }

      console.log(`[WhatsApp Session] New 24-hour session created for lead ${leadId}`);
      return session;
    } catch (error) {
      console.error('Error creating WhatsApp session:', error);
      return null;
    }
  }

  /**
   * Update session when messages are sent or received
   */
  async updateSessionActivity(leadId: string, phoneNumber: string, direction: 'inbound' | 'outbound'): Promise<void> {
    try {
      const updateField = direction === 'inbound' ? 'last_inbound_message_at' : 'last_outbound_message_at';
      
      await this.supabase
        .from('whatsapp_sessions')
        .update({
          [updateField]: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('lead_id', leadId)
        .eq('phone_number', phoneNumber)
        .eq('is_active', true);

      // If it's an inbound message and no active session exists, create one
      if (direction === 'inbound') {
        const sessionStatus = await this.getSessionStatus(leadId, phoneNumber);
        if (!sessionStatus.sessionActive) {
          await this.createSession(leadId, phoneNumber, false);
        }
      }
    } catch (error) {
      console.error('Error updating WhatsApp session activity:', error);
    }
  }

  /**
   * Get all active sessions for monitoring
   */
  async getActiveSessions(): Promise<WhatsAppSession[]> {
    try {
      const { data: sessions, error } = await this.supabase
        .from('whatsapp_sessions')
        .select(`
          *,
          lead:leads(lead_name, contact_phone)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active WhatsApp sessions:', error);
        return [];
      }

      return sessions || [];
    } catch (error) {
      console.error('Error fetching active WhatsApp sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions (run this periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data: expiredSessions, error } = await this.supabase
        .from('whatsapp_sessions')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('session_end', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('Error cleaning up expired WhatsApp sessions:', error);
        return 0;
      }

      const cleanedCount = expiredSessions?.length || 0;
      console.log(`[WhatsApp Session] Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired WhatsApp sessions:', error);
      return 0;
    }
  }

  /**
   * Format time remaining for display
   */
  formatTimeRemaining(minutes: number): string {
    if (minutes <= 0) return 'Süresi dolmuş';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}s ${remainingMinutes}dk kaldı`;
    } else {
      return `${remainingMinutes}dk kaldı`;
    }
  }

  /**
   * Check if a phone number needs opt-in (new contact)
   */
  async needsOptIn(phoneNumber: string): Promise<boolean> {
    try {
      const { data: sessions, error } = await this.supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('phone_number', phoneNumber)
        .limit(1);

      if (error) {
        console.error('Error checking opt-in status:', error);
        return true;
      }

      // If no previous sessions, needs opt-in via template
      return !sessions || sessions.length === 0;
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      return true;
    }
  }
}

// Singleton instance
export const whatsappSessionManager = new WhatsAppSessionManager();
export default whatsappSessionManager;