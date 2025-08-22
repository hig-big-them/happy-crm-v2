import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get('phone') || '+905327994223';
  
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '793146130539824';
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp access token not configured'
      }, { status: 500 });
    }

    console.log('📱 WhatsApp API\'den konuşma geçmişi çekiliyor...');
    console.log('📱 Phone Number ID:', phoneNumberId);
    console.log('📱 Target Phone:', phoneNumber);

    // WhatsApp Business API - Conversations endpoint
    const conversationsUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/conversations`;
    
    console.log('🔗 Conversations URL:', conversationsUrl);

    const conversationsResponse = await fetch(conversationsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const conversationsData = await conversationsResponse.json();
    
    console.log('📊 Conversations Response:', conversationsData);

    if (!conversationsResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch conversations from WhatsApp',
        details: conversationsData
      }, { status: conversationsResponse.status });
    }

    // Belirli bir telefon numarası için mesajları getir
    let messages = [];
    
    if (conversationsData.data) {
      for (const conversation of conversationsData.data) {
        // Her conversation için mesajları getir
        const messagesUrl = `https://graph.facebook.com/v18.0/${conversation.id}/messages`;
        
        console.log('📨 Fetching messages from conversation:', conversation.id);
        
        const messagesResponse = await fetch(messagesUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          
          // Telefon numarasına göre filtrele
          if (messagesData.data) {
            const filteredMessages = messagesData.data.filter((msg: any) => 
              msg.from === phoneNumber.replace('+', '') || 
              msg.from === phoneNumber ||
              msg.to === phoneNumber.replace('+', '') ||
              msg.to === phoneNumber
            );
            
            messages.push(...filteredMessages);
          }
        }
      }
    }

    // Alternatif: Direkt messages endpoint (eğer conversation ID biliyorsak)
    if (messages.length === 0) {
      console.log('🔄 Trying alternative messages endpoint...');
      
      // Genel mesajları getir
      const allMessagesUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      const allMessagesResponse = await fetch(allMessagesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (allMessagesResponse.ok) {
        const allMessagesData = await allMessagesResponse.json();
        console.log('📊 All Messages Response:', allMessagesData);
        
        if (allMessagesData.data) {
          // Telefon numarasına göre filtrele
          messages = allMessagesData.data.filter((msg: any) => 
            msg.from === phoneNumber.replace('+', '') || 
            msg.from === phoneNumber ||
            (msg.to && (msg.to === phoneNumber.replace('+', '') || msg.to === phoneNumber))
          );
        }
      } else {
        const errorData = await allMessagesResponse.json();
        console.log('❌ Messages API Error:', errorData);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        phone_number: phoneNumber,
        phone_number_id: phoneNumberId,
        messages: messages,
        total_messages: messages.length,
        conversations: conversationsData.data || []
      },
      raw_response: {
        conversations: conversationsData
      }
    });

  } catch (error) {
    console.error('WhatsApp conversations API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
