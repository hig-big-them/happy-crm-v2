/**
 * CRM Twilio Notification Service
 * 
 * Bu servis Twilio Push Notification hatalarını önler
 * ve sadece SMS/Email/Voice kullanır
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('⚠️ Twilio credentials eksik. Notification servisi devre dışı.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface NotificationResult {
  success: boolean;
  sid?: string;
  error?: string;
  channel: 'sms' | 'voice' | 'email';
}

/**
 * CRM SMS bildirimi gönder
 * Push notification yerine güvenli SMS kullanır
 */
export async function sendCRMSMSNotification(
  to: string,
  message: string,
  customFromNumber?: string
): Promise<NotificationResult> {
  if (!client) {
    return {
      success: false,
      error: 'Twilio client yapılandırılmamış',
      channel: 'sms'
    };
  }

  try {
    const smsMessage = await client.messages.create({
      body: message,
      from: customFromNumber || twilioPhoneNumber,
      to: to
    });

    console.log(`✅ CRM SMS gönderildi: ${smsMessage.sid}`);
    
    return {
      success: true,
      sid: smsMessage.sid,
      channel: 'sms'
    };
  } catch (error: any) {
    console.error('❌ CRM SMS hatası:', error);
    return {
      success: false,
      error: error.message,
      channel: 'sms'
    };
  }
}

/**
 * CRM sesli bildirim gönder
 * Studio Flow kullanmadan direkt arama
 */
export async function sendCRMVoiceNotification(
  to: string,
  message: string,
  voiceUrl?: string
): Promise<NotificationResult> {
  if (!client) {
    return {
      success: false,
      error: 'Twilio client yapılandırılmamış',
      channel: 'voice'
    };
  }

  try {
    // TwiML oluştur
    const twimlUrl = voiceUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice-message`;
    
    const call = await client.calls.create({
      url: twimlUrl,
      to: to,
      from: twilioPhoneNumber!,
      method: 'POST'
    });

    console.log(`✅ CRM sesli arama başlatıldı: ${call.sid}`);
    
    return {
      success: true,
      sid: call.sid,
      channel: 'voice'
    };
  } catch (error: any) {
    console.error('❌ CRM sesli arama hatası:', error);
    return {
      success: false,
      error: error.message,
      channel: 'voice'
    };
  }
}

/**
 * Çoklu kanal notification (SMS + Email fallback)
 * Push notification problemini tamamen bypass eder
 */
export async function sendMultiChannelNotification(
  recipient: {
    phone?: string;
    email?: string;
    name?: string;
  },
  notification: {
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  }
): Promise<{
  sms?: NotificationResult;
  voice?: NotificationResult;
  email?: NotificationResult;
  overallSuccess: boolean;
}> {
  const results: any = {};
  let hasSuccess = false;

  // 1. Önce SMS dene (hızlı ve güvenilir)
  if (recipient.phone) {
    console.log('📱 SMS bildirimi gönderiliyor...');
    results.sms = await sendCRMSMSNotification(
      recipient.phone,
      `${notification.title}\n\n${notification.message}`
    );
    
    if (results.sms.success) {
      hasSuccess = true;
    }
  }

  // 2. Urgent ise sesli arama da yap
  if (notification.priority === 'urgent' && recipient.phone) {
    console.log('📞 Acil durum - sesli arama yapılıyor...');
    results.voice = await sendCRMVoiceNotification(
      recipient.phone,
      notification.message
    );
    
    if (results.voice.success) {
      hasSuccess = true;
    }
  }

  // 3. SMS başarısızsa email'e fallback
  if (!results.sms?.success && recipient.email) {
    console.log('📧 SMS başarısız - email fallback...');
    // Email servisini çağır (ayrı bir serviste implementet)
    try {
      const { sendEmailNotification } = await import('./email-service');
      results.email = await sendEmailNotification(
        recipient.email,
        notification.title,
        notification.message
      );
      
      if (results.email?.success) {
        hasSuccess = true;
      }
    } catch (error) {
      console.error('📧 Email fallback hatası:', error);
      results.email = {
        success: false,
        error: 'Email servis hatası',
        channel: 'email' as const
      };
    }
  }

  return {
    ...results,
    overallSuccess: hasSuccess
  };
}

/**
 * CRM Lead bildirimi
 * Transfer notification'ının CRM versiyonu
 */
export async function sendLeadNotification(
  leadId: string,
  leadName: string,
  companyName: string,
  recipientPhone: string,
  recipientEmail?: string,
  notificationType: 'new_lead' | 'status_change' | 'follow_up_reminder' | 'deal_won' | 'deal_lost' = 'new_lead'
): Promise<NotificationResult[]> {
  const notifications: NotificationResult[] = [];
  
  const messageMap = {
    new_lead: `🎯 Yeni Lead: ${leadName} (${companyName}) CRM'e eklendi. Hemen takip edin!`,
    status_change: `📈 Lead Güncelleme: ${leadName} (${companyName}) durumu değişti.`,
    follow_up_reminder: `⏰ Takip Hatırlatması: ${leadName} (${companyName}) için aksiyona geçin!`,
    deal_won: `🎉 Deal Kazanıldı: ${leadName} (${companyName}) - Tebrikler!`,
    deal_lost: `😔 Deal Kaybedildi: ${leadName} (${companyName}) - Analiz edin.`
  };
  
  const message = messageMap[notificationType];
  
  // Çoklu kanal gönder
  const result = await sendMultiChannelNotification(
    {
      phone: recipientPhone,
      email: recipientEmail,
      name: leadName
    },
    {
      title: 'CRM Bildirimi',
      message: message,
      priority: notificationType === 'follow_up_reminder' ? 'urgent' : 'normal'
    }
  );
  
  // Sonuçları array formatında döndür
  if (result.sms) notifications.push(result.sms);
  if (result.voice) notifications.push(result.voice);
  if (result.email) notifications.push(result.email);
  
  return notifications;
}

/**
 * Twilio Notify Service'lerini listele ve temizle
 * Push notification problemlerini önler
 */
export async function cleanupTwilioNotifyServices(): Promise<{
  success: boolean;
  removedServices: number;
  errors: string[];
}> {
  if (!client) {
    return {
      success: false,
      removedServices: 0,
      errors: ['Twilio client yapılandırılmamış']
    };
  }

  const errors: string[] = [];
  let removedServices = 0;

  try {
    // Notify service'leri listele
    const services = await client.notify.v1.services.list();
    
    console.log(`🔍 ${services.length} Notify Service bulundu`);
    
    for (const service of services) {
      try {
        // Service'in credential'larını ve binding'lerini temizle
        const credentials = await client.notify.v1
          .services(service.sid)
          .credentials.list();
          
        const bindings = await client.notify.v1
          .services(service.sid)
          .bindings.list();
        
        // Credential'ları temizle
        for (const credential of credentials) {
          await client.notify.v1
            .services(service.sid)
            .credentials(credential.sid)
            .remove();
        }
        
        // Binding'leri temizle
        for (const binding of bindings) {
          await client.notify.v1
            .services(service.sid)
            .bindings(binding.sid)
            .remove();
        }
        
        // Service'i sil
        await client.notify.v1.services(service.sid).remove();
        removedServices++;
        
        console.log(`🗑️ Notify Service silindi: ${service.sid}`);
        
      } catch (error: any) {
        const errorMsg = `Service ${service.sid} silinirken hata: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }
    }
    
    return {
      success: errors.length === 0,
      removedServices,
      errors
    };
    
  } catch (error: any) {
    return {
      success: false,
      removedServices,
      errors: [`Cleanup hatası: ${error.message}`]
    };
  }
}

export default {
  sendCRMSMSNotification,
  sendCRMVoiceNotification,
  sendMultiChannelNotification,
  sendLeadNotification,
  cleanupTwilioNotifyServices
};