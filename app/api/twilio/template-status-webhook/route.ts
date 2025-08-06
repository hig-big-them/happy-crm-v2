/**
 * API Route: Twilio Template Status Webhook
 * 
 * ⚠️ DEVRE DIŞI BIRAKILDI - WhatsApp template süreçleri CRM'e taşındı
 * Template yönetimi artık direkt CRM üzerinden yapılıyor, Twilio webhook'larına gerek yok
 */

import { NextRequest, NextResponse } from 'next/server';

// ⚠️ Bu webhook artık kullanılmıyor - CRM template yönetimi kullanılıyor
export async function POST(request: NextRequest) {
  console.log('⚠️ Twilio Template Status Webhook çağrıldı ama devre dışı - CRM template yönetimi kullanılıyor');
  
  // Twilio'ya OK yanıtı veriyoruz ama işlem yapmıyoruz
  return NextResponse.json({ 
    success: true, 
    message: 'Webhook disabled - Using CRM template management',
    timestamp: new Date().toISOString()
  });
}

// GET endpoint - webhook bilgi için
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'DISABLED',
    message: 'Twilio Template Status Webhook has been disabled',
    reason: 'WhatsApp template management moved to CRM',
    alternative: 'Use CRM template management system',
    endpoint: '/api/twilio/template-status-webhook',
    timestamp: new Date().toISOString()
  });
}

/*
// ⚠️ ESKI KOD - DEVRE DIŞI BIRAKILDI
// WhatsApp template yönetimi artık CRM tarafında yapılıyor

import { createClient } from '@/lib/utils/supabase/server';

// Webhook doğrulama jetonu
const WEBHOOK_TOKEN = process.env.TWILIO_TEMPLATE_WEBHOOK_TOKEN || "$m}LzG+w'xGdh4t2=!Flv1|Kq7-A2";

// Template status değerleri
type TemplateStatus = 'pending' | 'approved' | 'rejected' | 'paused' | 'disabled';

interface TemplateStatusWebhook {
  MessageSid?: string;
  MessageStatus?: string;
  TemplateId?: string;
  TemplateName?: string;
  TemplateStatus?: TemplateStatus;
  TemplateLanguage?: string;
  TemplateCategory?: string;
  StatusReason?: string;
  StatusTimestamp?: string;
  AccountSid?: string;
  From?: string;
  To?: string;
  Body?: string;
  EventType?: string;
  WebhookType?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Webhook token doğrulama
    const authHeader = request.headers.get('authorization');
    const providedToken = authHeader?.replace('Bearer ', '');
    
    if (!providedToken || providedToken !== WEBHOOK_TOKEN) {
      console.log('❌ Webhook token doğrulama başarısız');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // İstek gövdesini al
    const body = await request.text();
    console.log('📥 Template Status Webhook alındı:', body);

    // URL encoded veriyi parse et
    const formData = new URLSearchParams(body);
    const webhookData: TemplateStatusWebhook = {};
    
    // Tüm parametreleri al
    for (const [key, value] of formData.entries()) {
      (webhookData as any)[key] = value;
    }

    console.log('🔍 Webhook Data:', JSON.stringify(webhookData, null, 2));

    const supabase = createClient();

    // Template status güncelleme
    if (webhookData.TemplateId && webhookData.TemplateStatus) {
      await handleTemplateStatusUpdate(supabase, webhookData);
    }

    // Mesaj durumu güncelleme
    if (webhookData.MessageSid && webhookData.MessageStatus) {
      await handleMessageStatusUpdate(supabase, webhookData);
    }

    // Webhook log kaydet
    await logWebhookEvent(supabase, webhookData);

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Template Status Webhook hatası:', error);
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

// Template durumu güncelle
async function handleTemplateStatusUpdate(supabase: any, webhookData: TemplateStatusWebhook) {
  try {
    const { TemplateId, TemplateName, TemplateStatus, TemplateLanguage, StatusReason } = webhookData;

    console.log(`📋 Template Status Update: ${TemplateName} (${TemplateId}) -> ${TemplateStatus}`);

    // Template durumunu güncelle
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .upsert({
        twilio_template_id: TemplateId,
        name: TemplateName,
        language: TemplateLanguage || 'tr',
        status: TemplateStatus,
        status_reason: StatusReason,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('❌ Template güncelleme hatası:', error);
    } else {
      console.log('✅ Template güncellendi:', data);
    }

    // Status değişikliğini bildir
    await notifyTemplateStatusChange(supabase, webhookData);

  } catch (error) {
    console.error('❌ Template status update hatası:', error);
  }
}

// Mesaj durumu güncelle
async function handleMessageStatusUpdate(supabase: any, webhookData: TemplateStatusWebhook) {
  try {
    const { MessageSid, MessageStatus, StatusReason } = webhookData;

    console.log(`📨 Message Status Update: ${MessageSid} -> ${MessageStatus}`);

    // Mesaj durumunu güncelle
    const { error } = await supabase
      .from('message_logs')
      .update({
        status: MessageStatus,
        status_reason: StatusReason,
        updated_at: new Date().toISOString()
      })
      .eq('message_sid', MessageSid);

    if (error) {
      console.error('❌ Mesaj güncelleme hatası:', error);
    } else {
      console.log('✅ Mesaj durumu güncellendi');
    }

  } catch (error) {
    console.error('❌ Message status update hatası:', error);
  }
}

// Template durum değişikliğini bildir
async function notifyTemplateStatusChange(supabase: any, webhookData: TemplateStatusWebhook) {
  try {
    const { TemplateName, TemplateStatus, StatusReason } = webhookData;

    // Admin kullanıcıları bildir
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .in('role', ['admin', 'super_admin']);

    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        // Notification kaydet
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.id,
            type: 'template_status_change',
            title: `WhatsApp Template Durumu: ${TemplateName}`,
            message: `Template "${TemplateName}" durumu "${TemplateStatus}" olarak güncellendi.${StatusReason ? ` Sebep: ${StatusReason}` : ''}`,
            data: {
              template_name: TemplateName,
              template_status: TemplateStatus,
              status_reason: StatusReason
            },
            created_at: new Date().toISOString()
          });
      }

      console.log(`📢 ${adminUsers.length} admin kullanıcısı bildirildi`);
    }

  } catch (error) {
    console.error('❌ Template bildirim hatası:', error);
  }
}

// Webhook olayını logla
async function logWebhookEvent(supabase: any, webhookData: TemplateStatusWebhook) {
  try {
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: 'twilio_template_status',
        event_type: webhookData.EventType || 'template_status_change',
        data: webhookData,
        processed_at: new Date().toISOString(),
        status: 'success'
      });

    console.log('📝 Webhook event logged');

  } catch (error) {
    console.error('❌ Webhook log hatası:', error);
  }
}

// GET endpoint - webhook test için
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Twilio Template Status Webhook endpoint',
    endpoint: '/api/twilio/template-status-webhook',
    methods: ['POST'],
    webhook_token_required: true,
    timestamp: new Date().toISOString()
  });
}
*/