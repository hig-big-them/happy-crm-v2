import { NextResponse } from 'next/server';

/**
 * WhatsApp Embedded Signup Onboarding API
 * 
 * Bu endpoint, Facebook'tan gelen authorization code'unu 
 * uzun ömürlü access token ile değiştirip gerekli kurulum 
 * adımlarını tamamlar.
 */

/**
 * GET endpoint for OAuth redirect (Meta sometimes uses GET)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (code) {
    console.log('📋 OAuth redirect received via GET:', { code: code.substring(0, 10) + '...', state });
    
    // Redirect to frontend with code
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://happysmileclinic.com'}/?code=${code}&state=${state || ''}`);
  }
  
  return NextResponse.json({ message: 'WhatsApp OAuth endpoint' });
}

export async function POST(request: Request) {
  try {
    const { code, phone_number_id, waba_id } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is missing' }, 
        { status: 400 }
      );
    }

    // Environment variables kontrolü
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!facebookAppId) {
      console.error('❌ Missing NEXT_PUBLIC_FACEBOOK_APP_ID');
      return NextResponse.json(
        { 
          error: 'Facebook App ID not configured', 
          details: 'NEXT_PUBLIC_FACEBOOK_APP_ID environment variable is missing'
        }, 
        { status: 500 }
      );
    }

    if (!facebookAppSecret) {
      console.error('❌ Missing FACEBOOK_APP_SECRET');
      return NextResponse.json(
        { 
          error: 'Facebook App Secret not configured', 
          details: 'FACEBOOK_APP_SECRET environment variable is missing'
        }, 
        { status: 500 }
      );
    }

    console.log('📱 WhatsApp onboarding started:', { 
      code: code.substring(0, 10) + '...', 
      phone_number_id, 
      waba_id,
      api_version: process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION
    });

    // 1. Kodu uzun ömürlü bir access token ile değiştirin
    console.log('🔄 Exchanging code for access token...');
    
    const apiVersion = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v23.0';
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;
    const tokenParams = new URLSearchParams({
      client_id: facebookAppId,
      client_secret: facebookAppSecret,
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

    // 2. Eğer WABA ID veya Phone Number ID yoksa, bunları access token ile çek
    let finalWabaId = waba_id;
    let finalPhoneNumberId = phone_number_id;
    
    if (!finalWabaId || !finalPhoneNumberId) {
      console.log('🔍 WABA ID or Phone Number ID missing, fetching from Graph API...');
      
      try {
        // Kullanıcının sahip olduğu WABA'ları listele
        const wabaListResponse = await fetch(
          `https://graph.facebook.com/${apiVersion}/me/businesses?fields=owned_whatsapp_business_accounts{id,name,phone_numbers{id,verified_name,display_phone_number}}&access_token=${accessToken}`
        );
        
        if (wabaListResponse.ok) {
          const businessData = await wabaListResponse.json();
          console.log('📊 Business data from Graph API:', businessData);
          
          // İlk WABA'yı ve phone number'ını al
          if (businessData.data && businessData.data.length > 0) {
            const business = businessData.data[0];
            if (business.owned_whatsapp_business_accounts && business.owned_whatsapp_business_accounts.data.length > 0) {
              const waba = business.owned_whatsapp_business_accounts.data[0];
              finalWabaId = waba.id;
              
              if (waba.phone_numbers && waba.phone_numbers.data.length > 0) {
                finalPhoneNumberId = waba.phone_numbers.data[0].id;
              }
              
              console.log('✅ Found WABA and Phone Number:', { 
                waba_id: finalWabaId, 
                phone_number_id: finalPhoneNumberId 
              });
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch WABA list from Graph API:', error);
      }
    }

    // 3. WABA (WhatsApp Business Account) bilgilerini al
    console.log('📋 Fetching WABA information...');
    
    let wabaData = null;
    if (finalWabaId) {
      const wabaResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${finalWabaId}?fields=id,name,status,currency,timezone_offset_minutes,business_verification_status&access_token=${accessToken}`
      );

      if (wabaResponse.ok) {
        wabaData = await wabaResponse.json();
        console.log('📊 WABA Info:', wabaData);
      } else {
        console.warn('⚠️ Could not fetch WABA info:', await wabaResponse.text());
      }
    } else {
      console.warn('⚠️ No WABA ID available to fetch info');
    }

    // 4. Telefon numarası bilgilerini al
    console.log('📞 Fetching phone number information...');
    
    let phoneData = null;
    if (finalPhoneNumberId) {
      const phoneResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${finalPhoneNumberId}?fields=id,verified_name,display_phone_number,quality_rating,status&access_token=${accessToken}`
      );

      if (phoneResponse.ok) {
        phoneData = await phoneResponse.json();
        console.log('📱 Phone Info:', phoneData);
      } else {
        console.warn('⚠️ Could not fetch phone info:', await phoneResponse.text());
      }
    } else {
      console.warn('⚠️ No Phone Number ID available to fetch info');
    }

    // 5. (İsteğe bağlı) Telefon numarasını kaydet
    if (finalPhoneNumberId) {
      try {
        console.log('📝 Registering phone number...');
        const registerResponse = await fetch(
          `https://graph.facebook.com/${apiVersion}/${finalPhoneNumberId}/register`,
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

    // 6. (İsteğe bağlı) Webhook'lara abone ol
    if (finalWabaId) {
      try {
        console.log('🔗 Subscribing to webhooks...');
        const subscribeResponse = await fetch(
          `https://graph.facebook.com/${apiVersion}/${finalWabaId}/subscribed_apps`,
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

    // 7. Database'e kaydet (TODO: Implement database storage)
    console.log('💾 Saving to database...');
    
    // TODO: Burada access token, WABA ID, phone number ID'yi database'e kaydedin
    // Örnek database structure:
    const onboardingData = {
      waba_id: finalWabaId,
      phone_number_id: finalPhoneNumberId,
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
        waba_id: finalWabaId,
        phone_number_id: finalPhoneNumberId,
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