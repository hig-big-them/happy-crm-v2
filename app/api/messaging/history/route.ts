/**
 * 📊 Message History API
 * 
 * Tüm kanallardan mesaj geçmişini getir ve filtrele
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  // Query parameters
  const leadId = searchParams.get('leadId');
  const search = searchParams.get('search');
  const channel = searchParams.get('channel');
  const status = searchParams.get('status');
  const direction = searchParams.get('direction');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const isExport = searchParams.get('export') === 'true';

  try {
    // Build unified message query - only select basic existing columns
    let query = supabase
      .from('messages')
      .select(`
        id,
        lead_id,
        channel,
        direction,
        content,
        status,
        metadata,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (leadId) query = query.eq('lead_id', leadId);
    if (channel && channel !== 'all') query = query.eq('channel', channel);
    if (status && status !== 'all') query = query.eq('status', status);
    if (direction && direction !== 'all') query = query.eq('direction', direction);
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: messages, error } = await query;

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages', details: error },
        { status: 500 }
      );
    }

    // Apply search filter if provided
    let filteredMessages = messages || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMessages = filteredMessages.filter(message => 
        message.content?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate statistics
    const stats = {
      total: filteredMessages.length,
      byChannel: {
        whatsapp: filteredMessages.filter(m => m.channel === 'whatsapp').length,
        sms: filteredMessages.filter(m => m.channel === 'sms').length,
        email: filteredMessages.filter(m => m.channel === 'email').length,
        note: filteredMessages.filter(m => m.channel === 'note').length
      },
      byStatus: {
        sent: filteredMessages.filter(m => m.status === 'sent').length,
        delivered: filteredMessages.filter(m => m.status === 'delivered').length,
        read: filteredMessages.filter(m => m.status === 'read').length,
        failed: filteredMessages.filter(m => m.status === 'failed').length,
        pending: filteredMessages.filter(m => m.status === 'pending').length
      },
      byDirection: {
        incoming: filteredMessages.filter(m => m.direction === 'incoming').length,
        outgoing: filteredMessages.filter(m => m.direction === 'outgoing').length
      },
      unread: filteredMessages.filter(m => m.metadata?.is_read === false && m.direction === 'incoming').length,
      starred: filteredMessages.filter(m => m.metadata?.is_starred === true).length
    };

    // Normalize messages for frontend
    const normalizedMessages = filteredMessages.map(message => ({
      id: message.id,
      channel: message.channel,
      direction: message.direction,
      content: {
        text: message.content,
        subject: message.metadata?.subject,
        template: message.metadata?.template_name,
        media_type: message.metadata?.media_type,
        media_url: message.metadata?.media_url
      },
      status: message.status,
      sent_at: message.metadata?.sent_at || message.created_at,
      delivered_at: message.metadata?.delivered_at,
      read_at: message.metadata?.read_at,
      failed_at: message.metadata?.failed_at,
      from_number: message.metadata?.from_number,
      to_number: message.metadata?.to_number,
      from_email: message.metadata?.from_email,
      to_email: message.metadata?.to_email,
      created_by: message.metadata?.sender ? {
        display_name: message.metadata.sender.full_name || message.metadata.sender.email,
        email: message.metadata.sender.email
      } : null,
      lead: {
        id: message.lead_id,
        lead_name: message.metadata?.lead_name,
        company: message.metadata?.company
      },
      pricing_info: message.metadata?.pricing_info,
      is_read: message.metadata?.is_read || false,
      is_starred: message.metadata?.is_starred || false
    }));

    return NextResponse.json({
      success: true,
      messages: normalizedMessages,
      stats,
      pagination: {
        offset,
        limit,
        hasMore: filteredMessages.length === limit
      }
    });

  } catch (error) {
    console.error('Failed to fetch message history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { leadId, phoneNumber, channel, direction, content, mediaUrl, mediaType, metadata } = body;

    // Validation - leadId veya phoneNumber olmalı
    if ((!leadId && !phoneNumber) || !channel || !direction || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (leadId or phoneNumber required)' },
        { status: 400 }
      );
    }

    // Get current user - mock auth için bypass
    const { data: { user } } = await supabase.auth.getUser();
    const mockUser = user || { id: 'mock-user-id' }; // Mock user for development
    
    if (!mockUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let actualLeadId = leadId;
    
    // Eğer leadId yoksa ama phoneNumber varsa, lead'i bul veya oluştur
    if (!leadId && phoneNumber) {
      // Önce mevcut lead'i ara
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('contact_phone', phoneNumber)
        .maybeSingle();
      
      if (existingLead) {
        actualLeadId = existingLead.id;
      } else {
        // Lead yoksa, geçici bir lead oluştur
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            lead_name: phoneNumber, // Geçici olarak numara kullan
            contact_phone: phoneNumber,
            source: 'whatsapp',
            status: 'new',
            created_by: mockUser.id,
            metadata: {
              auto_created: true,
              created_from: 'messaging'
            }
          })
          .select()
          .single();
        
        if (leadError) {
          console.error('Failed to create lead:', leadError);
          // Lead oluşturulamazsa bile mesajı kaydet (lead_id null olarak)
        } else {
          actualLeadId = newLead.id;
        }
      }
    }

    // Prepare metadata with media info
    const messageMetadata = {
      ...metadata,
      phone_number: phoneNumber,
      media_url: mediaUrl,
      media_type: mediaType,
      is_read: false,
      is_starred: false,
      sent_at: new Date().toISOString()
    };

    // Insert message - direction'ı düzelt
    const correctedDirection = direction === 'outgoing' ? 'outbound' : direction === 'incoming' ? 'inbound' : direction;
    
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        lead_id: actualLeadId,
        channel,
        direction: correctedDirection,
        content,
        sender_id: mockUser.id,
        metadata: messageMetadata,
        status: 'sent'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      leadId: actualLeadId
    });

  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}