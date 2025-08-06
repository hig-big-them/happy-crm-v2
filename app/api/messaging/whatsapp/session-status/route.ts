/**
 * API Route: Get WhatsApp Session Status
 * 
 * Returns the current session status for a lead's phone number
 */

import { NextRequest, NextResponse } from 'next/server';
// Note: WhatsApp session manager will be implemented server-side
// import { whatsappSessionManager } from '@/lib/services/whatsapp-session-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!leadId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters: leadId, phoneNumber' },
        { status: 400 }
      );
    }

    // TODO: Implement proper session status checking
    // For now, return mock status allowing free-form messaging
    const sessionStatus = {
      canSendFreeForm: true,
      sessionActive: true,
      timeRemaining: 1440, // 24 hours in minutes
      requiresTemplate: false
    };

    return NextResponse.json({
      success: true,
      sessionStatus
    });

  } catch (error: any) {
    console.error('Error getting WhatsApp session status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}