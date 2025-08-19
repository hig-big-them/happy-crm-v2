import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0';
const PHONE_NUMBER_ID = '660093600519552';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // Access token kontrolü
    if (!ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'WhatsApp access token is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, message, type = 'text', template } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    let payload: any = {
      messaging_product: 'whatsapp',
      to: to.startsWith('+') ? to.substring(1) : to,
    };

    if (type === 'template' && template) {
      payload.type = 'template';
      payload.template = template;
    } else {
      payload.type = 'text';
      payload.text = {
        body: message || 'Test message from Happy CRM'
      };
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to send message',
          details: data.error 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}