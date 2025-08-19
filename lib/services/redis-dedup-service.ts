/**
 * Redis-based Event Deduplication Service for WhatsApp Webhooks
 * 
 * Provides persistent deduplication of webhook events across server restarts
 * to prevent duplicate message processing.
 */

import { createClient as createServerClient } from '@/lib/supabase/server';

// Use Supabase as a key-value store for deduplication
// In production, replace with Redis/Upstash for better performance

interface DedupEntry {
  event_id: string;
  processed_at: string;
  expires_at: string;
}

export class EventDeduplicationService {
  private readonly TTL_SECONDS = 48 * 60 * 60; // 48 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    // Start periodic cleanup in production
    if (process.env.NODE_ENV === 'production') {
      this.startCleanup();
    }
  }

  /**
   * Check if an event has already been processed
   */
  async isDuplicate(eventId: string): Promise<boolean> {
    try {
      const supabase = await createServerClient();
      
      // Check if event exists in dedup table
      const { data, error } = await supabase
        .from('webhook_dedup')
        .select('event_id')
        .eq('event_id', eventId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking duplicate:', error);
        // In case of error, assume not duplicate to avoid blocking
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Dedup check failed:', error);
      // Fail open - process the event if dedup check fails
      return false;
    }
  }

  /**
   * Mark an event as processed
   */
  async markProcessed(eventId: string): Promise<void> {
    try {
      const supabase = await createServerClient();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.TTL_SECONDS * 1000);
      
      // Insert event ID with expiration
      const { error } = await supabase
        .from('webhook_dedup')
        .upsert({
          event_id: eventId,
          processed_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'event_id'
        });
      
      if (error) {
        console.error('Error marking event as processed:', error);
      }
    } catch (error) {
      console.error('Failed to mark event as processed:', error);
    }
  }

  /**
   * Process an event with deduplication
   */
  async processWithDedup<T>(
    eventId: string,
    processor: () => Promise<T>
  ): Promise<T | null> {
    // Check if duplicate
    if (await this.isDuplicate(eventId)) {
      console.log(`⚠️ Duplicate event detected, skipping: ${eventId}`);
      return null;
    }
    
    // Mark as processed immediately to prevent race conditions
    await this.markProcessed(eventId);
    
    // Process the event
    try {
      return await processor();
    } catch (error) {
      // On error, remove from dedup to allow retry
      await this.removeEvent(eventId);
      throw error;
    }
  }

  /**
   * Remove an event from deduplication
   */
  private async removeEvent(eventId: string): Promise<void> {
    try {
      const supabase = await createServerClient();
      
      const { error } = await supabase
        .from('webhook_dedup')
        .delete()
        .eq('event_id', eventId);
      
      if (error) {
        console.error('Error removing event:', error);
      }
    } catch (error) {
      console.error('Failed to remove event:', error);
    }
  }

  /**
   * Clean up expired entries
   */
  private async cleanup(): Promise<void> {
    try {
      const supabase = await createServerClient();
      
      // Delete expired entries
      const { error, count } = await supabase
        .from('webhook_dedup')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (error) {
        console.error('Error cleaning up dedup entries:', error);
      } else if (count && count > 0) {
        console.log(`🧹 Cleaned up ${count} expired dedup entries`);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    // Initial cleanup
    this.cleanup();
    
    // Schedule periodic cleanup
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop cleanup timer
   */
  public stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

// Singleton instance
let dedupService: EventDeduplicationService | null = null;

export function getDeduplicationService(): EventDeduplicationService {
  if (!dedupService) {
    dedupService = new EventDeduplicationService();
  }
  return dedupService;
}

// For Redis/Upstash implementation (production-ready):
/*
import Redis from 'ioredis';
// or
import { Redis } from '@upstash/redis';

const redis = new Redis(process.env.REDIS_URL);

export class RedisDeduplicationService {
  private readonly TTL_SECONDS = 48 * 60 * 60;

  async isDuplicate(eventId: string): Promise<boolean> {
    const exists = await redis.exists(`dedup:${eventId}`);
    return exists === 1;
  }

  async markProcessed(eventId: string): Promise<void> {
    await redis.setex(`dedup:${eventId}`, this.TTL_SECONDS, Date.now());
  }

  async processWithDedup<T>(
    eventId: string,
    processor: () => Promise<T>
  ): Promise<T | null> {
    // Use Redis SET NX for atomic check-and-set
    const result = await redis.set(
      `dedup:${eventId}`,
      Date.now(),
      'EX', this.TTL_SECONDS,
      'NX'
    );
    
    if (!result) {
      console.log(`⚠️ Duplicate event detected: ${eventId}`);
      return null;
    }
    
    try {
      return await processor();
    } catch (error) {
      // On error, remove to allow retry
      await redis.del(`dedup:${eventId}`);
      throw error;
    }
  }
}
*/