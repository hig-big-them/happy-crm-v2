import { NextResponse } from 'next/server'
import { sendEmailTemplate } from '@/lib/services/email-service'

export async function GET() {
  try {
    // SMTP ayarlarını kontrol et
    const smtpConfig = {
      host: !!process.env.SMTP_HOST,
      port: !!process.env.SMTP_PORT,
      user: !!process.env.SMTP_USER,
      password: !!process.env.SMTP_PASSWORD,
      fromEmail: !!process.env.SMTP_FROM_EMAIL,
      fromName: !!process.env.SMTP_FROM_NAME
    }

    const allConfigured = Object.values(smtpConfig).every(Boolean)

    // Email servisinin çalışıp çalışmadığını test et
    let emailTestResult = null
    if (allConfigured) {
      try {
        // Test emaili gönder (gerçek göndermeden)
        const testEmail = await sendEmailTemplate(
          'test@example.com',
          'WELCOME_SIGNUP',
          { userEmail: 'test@example.com' }
        )
        
        emailTestResult = {
          success: testEmail.success,
          error: testEmail.error
        }
      } catch (error: any) {
        emailTestResult = {
          success: false,
          error: error.message
        }
      }
    }

    return NextResponse.json({
      success: true,
      smtp: {
        configured: allConfigured,
        config: smtpConfig
      },
      emailService: {
        available: allConfigured,
        testResult: emailTestResult
      },
      templates: [
        'WELCOME_SIGNUP',
        'STATUS_CHANGED', 
        'TRANSFER_ASSIGNED',
        'TRANSFER_DEADLINE'
      ]
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      },
      { status: 500 }
    )
  }
}
