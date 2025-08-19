/**
 * API Route: WhatsApp Cloud API Webhook
 * 
 * WhatsApp Business API webhook events için endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import crypto from 'crypto';
import { getDeduplicationService } from '@/lib/services/redis-dedup-service';

// Webhook doğrulama jetonu ve app secret
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "HAPPY_CRM_WEBHOOK_VERIFY_TOKEN_2025";
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

// Get deduplication service instance
const dedupService = getDeduplicationService();

// WhatsApp webhook event türleri
interface WhatsAppWebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          image?: { id: string; mime_type: string; sha256: string };
          document?: { id: string; filename: string; mime_type: string };
          audio?: { id: string; mime_type: string; voice: boolean };
          video?: { id: string; mime_type: string; sha256: string };
          location?: { latitude: number; longitude: number; name?: string };
          context?: { from: string; id: string };
        }>;
        statuses?: Array<{
          id: string;
          recipient_id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          conversation?: {
            id: string;
            origin: { type: string };
          };
          pricing?: {
            billable: boolean;
            pricing_model: string;
            category: string;
          };
          errors?: Array<{
            code: number;
            title: string;
            message: string;
            error_data: {
              details: string;
            };
          }>;
        }>;
        errors?: Array<{
          code: number;
          title: string;
          message: string;
          error_data: {
            details: string;
          };
        }>;
      };
      field: string;
    }>;
  }>;
}

// GET endpoint - webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hubMode = searchParams.get('hub.mode');
  const hubChallenge = searchParams.get('hub.challenge');
  const hubVerifyToken = searchParams.get('hub.verify_token');

  console.log('📋 WhatsApp webhook verification request:', {
    hubMode,
    hubChallenge,
    hubVerifyToken,
    expectedToken: WEBHOOK_VERIFY_TOKEN
  });

  // WhatsApp webhook verification
  if (hubMode === 'subscribe' && hubVerifyToken === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verification successful');
    return new NextResponse(hubChallenge, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else {
    console.log('❌ WhatsApp webhook verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}

// Signature validation function
function verifySignature(payload: string, signature: string): boolean {
  // SECURITY: Make secret required in production
  if (!WHATSAPP_APP_SECRET) {
    const error = 'CRITICAL: WhatsApp App Secret not configured';
    console.error(`❌ ${error}`);
    
    // In production, always fail if secret is missing
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error);
    }
    
    // Only allow bypass in development with clear warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ DEVELOPMENT MODE: Bypassing signature verification - DO NOT USE IN PRODUCTION');
      return true;
    }
    
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', WHATSAPP_APP_SECRET)
      .update(payload)
      .digest('hex');
    
    const actualSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(actualSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

// POST endpoint - webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    console.log('📥 WhatsApp webhook event received');
    // SECURITY: Don't log headers in production (may contain sensitive data)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📋 Headers:', Object.fromEntries(request.headers.entries()));
    }

    // Signature verification
    if (signature && !verifySignature(body, signature)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let webhookData: WhatsAppWebhookEvent;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('❌ Invalid JSON payload');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // SECURITY: Don't log full payload in production (contains PII)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📦 Webhook data:', JSON.stringify(webhookData, null, 2));
    } else {
      // Production: Log only non-PII metadata
      console.log('📦 Webhook received:', {
        object: webhookData.object,
        entries: webhookData.entry?.length || 0,
        timestamp: new Date().toISOString()
      });
    }

    // WhatsApp object kontrolü
    if (webhookData.object !== 'whatsapp_business_account') {
      console.log('⚠️ Unknown object type:', webhookData.object);
      return NextResponse.json({ success: true, message: 'Ignored unknown object type' });
    }

    const supabase = createClient();

    // Her entry için event'leri işle
    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        try {
          // Event deduplication with persistent storage
          const eventId = `${entry.id}_${change.field}_${entry.time || Date.now()}`;
          
          // Skip deduplication for now to fix Meta webhook subscription
          // TODO: Re-enable after webhook_dedup table is created in Supabase
          /*
          // Check for duplicate using deduplication service
          const isDuplicate = await dedupService.isDuplicate(eventId);
          if (isDuplicate) {
            console.log('⚠️ Duplicate event detected, skipping:', eventId);
            continue;
          }
          
          // Mark as processed
          await dedupService.markProcessed(eventId);
          */

          // Process different webhook fields
          switch (change.field) {
            case 'messages':
              await processMessageEvent(supabase, change.value);
              break;
            case 'message_echoes':
              await processMessageEchoes(supabase, change.value);
              break;
          // ⚠️ DEVRE DIŞI BIRAKILDI - Template yönetimi CRM'e taşındı
          // case 'message_template_status_update':
          //   await processTemplateStatusUpdate(supabase, change.value);
          //   break;
          case 'account_alerts':
            await processAccountAlerts(supabase, change.value);
            break;
          case 'account_review_update':
            await processAccountReviewUpdate(supabase, change.value);
            break;
          case 'account_update':
            await processAccountUpdate(supabase, change.value);
            break;
          case 'business_capability_update':
            await processBusinessCapabilityUpdate(supabase, change.value);
            break;
          case 'phone_number_quality_update':
            await processPhoneNumberQualityUpdate(supabase, change.value);
            break;
          case 'phone_number_name_update':
            await processPhoneNumberNameUpdate(supabase, change.value);
            break;
          case 'message_template_status_update':
            // ⚠️ DEVRE DIŞI BIRAKILDI - Template yönetimi CRM'e taşındı
            console.log('⚠️ Template status update webhook alındı ama işlenmedi - CRM template yönetimi kullanılıyor');
            console.log('📋 Template status data:', JSON.stringify(change.value, null, 2));
            break;
          default:
            console.log('⚠️ Unknown webhook field:', change.field);
            await logUnknownEvent(supabase, change);
          }
        } catch (fieldError) {
          // Log error but don't fail the webhook
          console.error(`❌ Error processing ${change.field}:`, fieldError);
        }
      }
    }

    // Webhook event'ini logla (try-catch ile sarmalayarak hata durumunda webhook'u etkilemesin)
    try {
      await logWebhookEvent(supabase, webhookData);
    } catch (logError) {
      console.error('❌ Failed to log webhook event:', logError);
    }

    // Facebook requires 200 OK response
    return new NextResponse('OK', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error: any) {
    console.error('❌ WhatsApp webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Mesaj event'lerini işle
async function processMessageEvent(supabase: any, value: any) {
  try {
    console.log('📨 Processing message event:', JSON.stringify(value, null, 2));

    // Gelen mesajları işle
    if (value.messages) {
      for (const message of value.messages) {
        await handleIncomingMessage(supabase, message, value.metadata);
      }
    }

    // Mesaj durum güncellemelerini işle
    if (value.statuses) {
      for (const status of value.statuses) {
        await handleMessageStatus(supabase, status);
      }
    }

    // Hataları işle
    if (value.errors) {
      for (const error of value.errors) {
        await handleWebhookError(supabase, error);
      }
    }

  } catch (error) {
    console.error('❌ Message event processing error:', error);
  }
}

// Message echoes - gönderilen mesajların kopyaları
async function processMessageEchoes(supabase: any, value: any) {
  try {
    console.log('📤 Processing message echoes:', JSON.stringify(value, null, 2));

    // Process message echoes (messages sent by your business)
    if (value.message_echoes) {
      for (const echo of value.message_echoes) {
        await handleMessageEcho(supabase, echo, value.metadata);
      }
    }

    // Handle errors if any
    if (value.errors) {
      for (const error of value.errors) {
        await handleWebhookError(supabase, error);
      }
    }

  } catch (error) {
    console.error('❌ Message echo processing error:', error);
  }
}

// Gelen mesajı işle
async function handleIncomingMessage(supabase: any, message: any, metadata: any) {
  try {
    console.log(`📩 Incoming message from ${message.from}: ${message.text?.body || message.type}`);

    // Mesajı veritabanına kaydet
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: message.id,
        from_number: message.from,
        to_number: metadata.phone_number_id,
        message_type: message.type,
        content: {
          text: message.text?.body,
          media: message.image || message.video || message.document || message.audio,
          location: message.location,
          context: message.context
        },
        status: 'received',
        received_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        is_incoming: true,
        platform: 'whatsapp_cloud'
      });

    if (error) {
      console.error('❌ Message save error:', error);
    } else {
      console.log('✅ Message saved to database');
    }

    // Real-time notification gönder
    await notifyIncomingMessage(supabase, message);

  } catch (error) {
    console.error('❌ Incoming message handling error:', error);
  }
}

// Message echo handler - gönderilen mesajların kopyaları
async function handleMessageEcho(supabase: any, echo: any, metadata: any) {
  try {
    console.log(`📤 Message echo to ${echo.to}: ${echo.text?.body || echo.type}`);

    // Save sent message echo to database
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: echo.id,
        from_number: metadata.phone_number_id,
        to_number: echo.to,
        message_type: echo.type,
        message_creation_type: echo.message_creation_type || 'user_initiated',
        content: {
          text: echo.text?.body,
          media: echo.image || echo.video || echo.document || echo.audio,
          location: echo.location,
          template: echo.template
        },
        status: 'sent',
        sent_at: new Date(parseInt(echo.timestamp) * 1000).toISOString(),
        is_incoming: false,
        platform: 'whatsapp_cloud'
      });

    if (error) {
      console.error('❌ Message echo save error:', error);
    } else {
      console.log('✅ Message echo saved to database');
    }

  } catch (error) {
    console.error('❌ Message echo handling error:', error);
  }
}

// Mesaj durumu güncelle
async function handleMessageStatus(supabase: any, status: any) {
  try {
    console.log(`📊 Message status update: ${status.id} -> ${status.status}`);

    // Mesaj durumunu güncelle
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({
        status: status.status,
        delivered_at: status.status === 'delivered' ? new Date(parseInt(status.timestamp) * 1000).toISOString() : null,
        read_at: status.status === 'read' ? new Date(parseInt(status.timestamp) * 1000).toISOString() : null,
        failed_at: status.status === 'failed' ? new Date(parseInt(status.timestamp) * 1000).toISOString() : null,
        error_details: status.errors?.[0] || null,
        conversation_id: status.conversation?.id,
        pricing_info: status.pricing
      })
      .eq('message_id', status.id);

    if (error) {
      console.error('❌ Status update error:', error);
    } else {
      console.log('✅ Message status updated');
    }

  } catch (error) {
    console.error('❌ Message status handling error:', error);
  }
}

// Webhook hatasını işle
async function handleWebhookError(supabase: any, error: any) {
  try {
    console.error('🚨 WhatsApp webhook error:', error);

    // Hata kaydını veritabanına kaydet
    await supabase
      .from('webhook_errors')
      .insert({
        platform: 'whatsapp_cloud',
        error_code: error.code,
        error_title: error.title,
        error_message: error.message,
        error_details: error.error_data,
        occurred_at: new Date().toISOString()
      });

  } catch (dbError) {
    console.error('❌ Error logging failed:', dbError);
  }
}

// Gelen mesaj bildirimi
async function notifyIncomingMessage(supabase: any, message: any) {
  try {
    // Telefon numarasından kullanıcı bul
    const { data: lead } = await supabase
      .from('leads')
      .select('id, name, assigned_user_id')
      .eq('phone', message.from.replace(/^\+/, ''))
      .single();

    if (lead && lead.assigned_user_id) {
      // Atanmış kullanıcıya bildirim gönder
      await supabase
        .from('notifications')
        .insert({
          user_id: lead.assigned_user_id,
          type: 'new_whatsapp_message',
          title: `Yeni WhatsApp Mesajı: ${lead.name}`,
          message: message.text?.body || `${message.type} mesajı aldınız`,
          data: {
            lead_id: lead.id,
            message_id: message.id,
            message_type: message.type,
            phone_number: message.from
          },
          created_at: new Date().toISOString()
        });

      console.log(`📢 Notification sent to user ${lead.assigned_user_id}`);
    }

  } catch (error) {
    console.error('❌ Notification error:', error);
  }
}

// Template status update handler - DEVRE DIŞI BIRAKILDI
/*
async function processTemplateStatusUpdate(supabase: any, value: any) {
  try {
    console.log('📋 Template status update:', JSON.stringify(value, null, 2));

    // Template status güncelleme verilerini parse et
    const { message_template_id, message_template_name, message_template_language, event } = value;
    
    await supabase
      .from('whatsapp_templates')
      .upsert({
        template_id: message_template_id,
        name: message_template_name,
        language: message_template_language,
        status: event, // approved, rejected, paused, etc.
        updated_at: new Date().toISOString()
      });

    // Admin bildirim gönder
    await notifyAdmins(supabase, {
      type: 'template_status_update',
      title: `Template Status: ${message_template_name}`,
      message: `Template "${message_template_name}" durumu "${event}" olarak güncellendi.`,
      data: value
    });

    console.log('✅ Template status processed');
  } catch (error) {
    console.error('❌ Template status processing error:', error);
  }
}
*/

// Account alerts handler
async function processAccountAlerts(supabase: any, value: any) {
  try {
    console.log('🚨 Account alert:', JSON.stringify(value, null, 2));

    await notifyAdmins(supabase, {
      type: 'account_alert',
      title: 'WhatsApp Account Alert',
      message: `Account alert: ${JSON.stringify(value)}`,
      data: value
    });

    console.log('✅ Account alert processed');
  } catch (error) {
    console.error('❌ Account alert processing error:', error);
  }
}

// Account review update handler
async function processAccountReviewUpdate(supabase: any, value: any) {
  try {
    console.log('🔍 Account review update:', JSON.stringify(value, null, 2));

    await notifyAdmins(supabase, {
      type: 'account_review_update',
      title: 'WhatsApp Account Review Update',
      message: `Account review güncellendi: ${value.decision || 'Unknown'}`,
      data: value
    });

    console.log('✅ Account review update processed');
  } catch (error) {
    console.error('❌ Account review update processing error:', error);
  }
}

// Account update handler
async function processAccountUpdate(supabase: any, value: any) {
  try {
    console.log('📊 Account update:', JSON.stringify(value, null, 2));

    await notifyAdmins(supabase, {
      type: 'account_update',
      title: 'WhatsApp Account Update',
      message: `Account bilgileri güncellendi`,
      data: value
    });

    console.log('✅ Account update processed');
  } catch (error) {
    console.error('❌ Account update processing error:', error);
  }
}

// Business capability update handler
async function processBusinessCapabilityUpdate(supabase: any, value: any) {
  try {
    console.log('🏢 Business capability update:', JSON.stringify(value, null, 2));

    await notifyAdmins(supabase, {
      type: 'business_capability_update',
      title: 'WhatsApp Business Capability Update',
      message: `Business capabilities güncellendi`,
      data: value
    });

    console.log('✅ Business capability update processed');
  } catch (error) {
    console.error('❌ Business capability update processing error:', error);
  }
}

// Phone number quality update handler
async function processPhoneNumberQualityUpdate(supabase: any, value: any) {
  try {
    console.log('📞 Phone number quality update:', JSON.stringify(value, null, 2));

    await notifyAdmins(supabase, {
      type: 'phone_number_quality_update',
      title: 'WhatsApp Phone Number Quality Update',
      message: `Phone number quality güncellendi: ${value.current_limit || 'Unknown'}`,
      data: value
    });

    console.log('✅ Phone number quality update processed');
  } catch (error) {
    console.error('❌ Phone number quality update processing error:', error);
  }
}

// Phone number name update handler
async function processPhoneNumberNameUpdate(supabase: any, value: any) {
  try {
    console.log('📱 Phone number name update:', JSON.stringify(value, null, 2));

    await notifyAdmins(supabase, {
      type: 'phone_number_name_update',
      title: 'WhatsApp Phone Number Name Update',
      message: `Phone number name güncellendi: ${value.decision || 'Unknown'}`,
      data: value
    });

    console.log('✅ Phone number name update processed');
  } catch (error) {
    console.error('❌ Phone number name update processing error:', error);
  }
}

// Unknown event logger
async function logUnknownEvent(supabase: any, change: any) {
  try {
    console.log('❓ Unknown webhook event:', JSON.stringify(change, null, 2));

    await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: 'whatsapp_cloud',
        event_type: 'unknown_event',
        data: change,
        processed_at: new Date().toISOString(),
        status: 'unknown'
      });

    console.log('📝 Unknown event logged');
  } catch (error) {
    console.error('❌ Unknown event logging error:', error);
  }
}

// Admin notification helper
async function notifyAdmins(supabase: any, notification: any) {
  try {
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .in('role', ['admin', 'super_admin']);

    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            created_at: new Date().toISOString()
          });
      }

      console.log(`📢 ${adminUsers.length} admin kullanıcısı bildirildi`);
    }
  } catch (error) {
    console.error('❌ Admin notification error:', error);
  }
}

// Webhook event'ini logla
async function logWebhookEvent(supabase: any, webhookData: WhatsAppWebhookEvent) {
  try {
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: 'whatsapp_cloud',
        event_type: 'webhook_event',
        data: webhookData,
        processed_at: new Date().toISOString(),
        status: 'success'
      });

    console.log('📝 Webhook event logged');

  } catch (error) {
    console.error('❌ Webhook logging error:', error);
  }
}