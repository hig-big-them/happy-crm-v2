import { NextResponse } from 'next/server';

/**
 * WhatsApp Embedded Signup Onboarding API
 * 
 * Bu endpoint, Facebook'tan gelen authorization code'unu 
 * uzun ömürlü access token ile değiştirip gerekli kurulum 
 * adımlarını tamamlar.
 */

export async function POST(request: Request) {
  try {
    const { code, phone_number_id, waba_id } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is missing' }, 
        { status: 400 }
      );
    }

    console.log('📱 WhatsApp onboarding started:', { 
      code: code.substring(0, 10) + '...', 
      phone_number_id, 
      waba_id 
    });

    // 1. Kodu uzun ömürlü bir access token ile değiştirin
    console.log('🔄 Exchanging code for access token...');
    
    const tokenUrl = `https://graph.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION}/oauth/access_token`;
    const tokenParams = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      code: code
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('❌ No access token in response:', tokenData);
      throw new Error('Failed to exchange code for access token');
    }

    console.log('✅ Access token obtained successfully');

    // 2. WABA (WhatsApp Business Account) bilgilerini al
    console.log('📋 Fetching WABA information...');
    
    const wabaResponse = await fetch(
      `https://graph.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION}/${waba_id}?fields=id,name,status,currency,timezone_offset_minutes,business_verification_status&access_token=${accessToken}`
    );

    let wabaData = null;
    if (wabaResponse.ok) {
      wabaData = await wabaResponse.json();
      console.log('📊 WABA Info:', wabaData);
    } else {
      console.warn('⚠️ Could not fetch WABA info:', await wabaResponse.text());
    }

    // 3. Telefon numarası bilgilerini al
    console.log('📞 Fetching phone number information...');
    
    const phoneResponse = await fetch(
      `https://graph.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION}/${phone_number_id}?fields=id,verified_name,display_phone_number,quality_rating,status&access_token=${accessToken}`
    );

    let phoneData = null;
    if (phoneResponse.ok) {
      phoneData = await phoneResponse.json();
      console.log('📱 Phone Info:', phoneData);
    } else {
      console.warn('⚠️ Could not fetch phone info:', await phoneResponse.text());
    }

    // 4. (İsteğe bağlı) Telefon numarasını kaydet
    if (phone_number_id) {
      try {
        console.log('📝 Registering phone number...');
        const registerResponse = await fetch(
          `https://graph.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION}/${phone_number_id}/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              access_token: accessToken
            })
          }
        );

        if (registerResponse.ok) {
          const registerData = await registerResponse.json();
          console.log('✅ Phone number registered:', registerData);
        } else {
          const errorText = await registerResponse.text();
          console.warn('⚠️ Phone registration failed (might already be registered):', errorText);
        }
      } catch (error) {
        console.warn('⚠️ Phone registration error (continuing anyway):', error);
      }
    }

    // 5. (İsteğe bağlı) Webhook'lara abone ol
    if (waba_id) {
      try {
        console.log('🔗 Subscribing to webhooks...');
        const subscribeResponse = await fetch(
          `https://graph.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION}/${waba_id}/subscribed_apps`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken
            })
          }
        );

        if (subscribeResponse.ok) {
          const subscribeData = await subscribeResponse.json();
          console.log('✅ Webhook subscription successful:', subscribeData);
        } else {
          const errorText = await subscribeResponse.text();
          console.warn('⚠️ Webhook subscription failed:', errorText);
        }
      } catch (error) {
        console.warn('⚠️ Webhook subscription error (continuing anyway):', error);
      }
    }

    // 6. Database'e kaydet (TODO: Implement database storage)
    console.log('💾 Saving to database...');
    
    // TODO: Burada access token, WABA ID, phone number ID'yi database'e kaydedin
    // Örnek database structure:
    const onboardingData = {
      waba_id,
      phone_number_id,
      access_token: accessToken, // Bu token'ı güvenli şekilde encrypt edin!
      waba_info: wabaData,
      phone_info: phoneData,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📊 Onboarding data prepared:', {
      ...onboardingData,
      access_token: accessToken.substring(0, 10) + '...' // Log'da token'ı kısa göster
    });

    // TODO: Database insertion
    // Example:
    // await supabase.from('whatsapp_accounts').insert(onboardingData);

    console.log('🎉 WhatsApp onboarding completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp onboarding completed successfully.',
      data: {
        waba_id,
        phone_number_id,
        verified_name: phoneData?.verified_name,
        display_phone_number: phoneData?.display_phone_number,
        status: phoneData?.status,
        quality_rating: phoneData?.quality_rating
      }
    });

  } catch (error) {
    console.error('💥 WhatsApp Onboarding Error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to complete WhatsApp onboarding process',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}