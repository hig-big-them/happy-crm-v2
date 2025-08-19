import { NextResponse } from 'next/server';

export async function GET() {
  // Check if webhook has been verified before
  // In production, you would store this in database
  const isVerified = process.env.WHATSAPP_WEBHOOK_VERIFIED === 'true';
  
  return NextResponse.json({
    verified: isVerified,
    timestamp: new Date().toISOString()
  });
}