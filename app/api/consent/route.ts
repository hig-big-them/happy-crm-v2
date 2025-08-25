import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customer_id, 
      consents,
      ip_address,
      user_agent 
    } = body;

    if (!customer_id || !consents) {
      return NextResponse.json(
        { error: 'customer_id and consents are required' },
        { status: 400 }
      );
    }

    const results = [];

    // Process each consent type
    for (const [consent_type, status] of Object.entries(consents)) {
      const consent_text = getConsentText(consent_type as string);
      
      const { data, error } = await supabase.rpc('record_consent', {
        p_customer_id: customer_id,
        p_consent_type: consent_type,
        p_status: status,
        p_consent_text: consent_text,
        p_ip_address: ip_address || request.headers.get('x-forwarded-for'),
        p_user_agent: user_agent || request.headers.get('user-agent')
      });

      if (error) {
        console.error(`Error recording consent for ${consent_type}:`, error);
        results.push({ type: consent_type, success: false, error: error.message });
      } else {
        results.push({ type: consent_type, success: true, id: data });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Consents recorded successfully'
    });

  } catch (error) {
    console.error('Consent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');

    if (!customer_id) {
      return NextResponse.json(
        { error: 'customer_id is required' },
        { status: 400 }
      );
    }

    // Get all consents for the customer
    const { data: consents, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch consents' },
        { status: 500 }
      );
    }

    // Transform to a more usable format
    const consentMap: Record<string, any> = {};
    consents?.forEach(consent => {
      consentMap[consent.consent_type] = {
        status: consent.status,
        opted_in_at: consent.opted_in_at,
        opted_out_at: consent.opted_out_at,
        consent_text: consent.consent_text,
        updated_at: consent.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      consents: consentMap,
      raw_consents: consents
    });

  } catch (error) {
    console.error('Consent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check if customer has valid consent for WhatsApp messaging
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const body = await request.json();
    const { customer_id, consent_type = 'whatsapp_transactional' } = body;

    if (!customer_id) {
      return NextResponse.json(
        { error: 'customer_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('check_whatsapp_consent', {
      p_customer_id: customer_id,
      p_consent_type: consent_type
    });

    if (error) {
      console.error('Error checking consent:', error);
      return NextResponse.json(
        { error: 'Failed to check consent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      has_consent: data,
      consent_type
    });

  } catch (error) {
    console.error('Consent check API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function getConsentText(consent_type: string): string {
  const consentTexts: Record<string, string> = {
    whatsapp_transactional: 
      "Sipariş onayı, kargo takibi, randevu hatırlatması gibi hizmetlerimizle ilgili önemli güncellemeleri WhatsApp üzerinden almayı kabul ediyorum.",
    whatsapp_marketing: 
      "Kampanyalar, indirimler, yeni ürün/hizmetler ve özel teklifler hakkında WhatsApp üzerinden bilgilendirme almayı kabul ediyorum.",
    email_marketing: 
      "E-posta yoluyla pazarlama ve promosyon mesajları almayı kabul ediyorum.",
    sms_marketing: 
      "SMS yoluyla pazarlama ve promosyon mesajları almayı kabul ediyorum."
  };

  return consentTexts[consent_type] || `${consent_type} için iletişim iznini kabul ediyorum.`;
}