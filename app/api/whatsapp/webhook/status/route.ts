import { NextResponse } from 'next/server';

export async function GET() {
  // In production, you would check if webhook is properly configured
  // For now, we'll return a status based on environment variables
  
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  
  return NextResponse.json({
    configured: !!(webhookUrl && verifyToken),
    webhookUrl: webhookUrl || 'Not configured',
    hasVerifyToken: !!verifyToken
  });
}