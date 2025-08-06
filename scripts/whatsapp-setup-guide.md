# WhatsApp Cloud API Test Kurulum Rehberi

## 1. Meta for Developers Hesabı Oluşturma

1. https://developers.facebook.com adresine gidin
2. Facebook hesabınızla giriş yapın
3. "Create App" butonuna tıklayın
4. "Business" seçeneğini seçin
5. App adı verin (örn: "My WhatsApp Business")

## 2. WhatsApp Business API Kurulumu

1. App dashboard'da "WhatsApp" ürünü ekleyin
2. "WhatsApp Business API" seçeneğini seçin
3. Kurulum tamamlandıktan sonra aşağıdaki bilgileri alın:

### Gerekli Bilgiler:

```javascript
// Bu bilgileri Meta App Dashboard'dan alın:
const WHATSAPP_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
const WHATSAPP_PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID_HERE'; 
const WHATSAPP_BUSINESS_ACCOUNT_ID = 'YOUR_BUSINESS_ACCOUNT_ID_HERE';
```

### Bilgileri Nerede Bulabilirsiniz:

1. **Access Token**: 
   - App Dashboard > WhatsApp > API Setup
   - "Temporary access token" kısmından kopyalayın

2. **Phone Number ID**:
   - App Dashboard > WhatsApp > API Setup
   - "Phone number ID" kısmından kopyalayın

3. **Business Account ID**:
   - App Dashboard > WhatsApp > API Setup
   - "WhatsApp Business Account ID" kısmından kopyalayın

## 3. Template Oluşturma

1. WhatsApp Manager'a gidin: https://business.facebook.com/wa/manage/
2. "Message templates" sekmesine gidin
3. "Create template" butonuna tıklayın
4. Template bilgilerini doldurun:
   - Name: `happy_news` (küçük harf, alt çizgi)
   - Category: `MARKETING` veya `UTILITY`
   - Language: `Turkish`
   - Body: `Merhaba {{1}}! Yeni bir güncelleme var.`

## 4. Test Script Güncelleme

Test scriptini (`test-whatsapp-cloud.js`) güncelleyin:

```javascript
// WhatsApp Cloud API credentials - bunları kendi değerlerinizle değiştirin
const WHATSAPP_ACCESS_TOKEN = 'EAAJ...'; // Meta'dan alınan token
const WHATSAPP_PHONE_NUMBER_ID = '1234567890'; // Phone Number ID
const WHATSAPP_BUSINESS_ACCOUNT_ID = '1234567890'; // Business Account ID

// Test parametreleri
const testNumber = '905327994223'; // Ülke kodu olmadan
const templateName = 'happy_news'; // Template adı
```

## 5. Test Çalıştırma

```bash
# Test mesajı gönder
node scripts/test-whatsapp-cloud.js

# Template listesi görüntüle
node scripts/test-whatsapp-cloud.js --list-templates
```

## 6. Webhook Kurulumu (İsteğe Bağlı)

Mesaj durumlarını takip etmek için webhook kurun:

1. Meta App Dashboard > WhatsApp > Configuration
2. Webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
3. Verify Token: Güvenlik için rastgele bir string
4. Subscribe to: `messages`, `message_status`

## 7. Yaygın Hatalar ve Çözümleri

### Hata: Template not found (131026)
- Template adının tamamen doğru olduğundan emin olun
- Template'in onaylandığından emin olun
- Business Account ID'nin doğru olduğundan emin olun

### Hata: Invalid access token (190)
- Access token'ın doğru olduğundan emin olun
- Token'ın süresi dolmamış olduğundan emin olun
- Token'ın yeterli izinlere sahip olduğundan emin olun

### Hata: Invalid parameter (100)
- Template parametrelerinin doğru olduğundan emin olun
- Language code'un doğru olduğundan emin olun (tr, en, vs.)

## 8. Production Kullanımı

- Temporary access token yerine permanent token kullanın
- Rate limiting uygulayın
- Error handling ve retry mekanizması ekleyin
- Webhook güvenliği için signature validation yapın
- Message logging ve monitoring ekleyin

## 9. Faydalı Linkler

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [WhatsApp Business Manager](https://business.facebook.com/wa/manage/)
- [Meta for Developers](https://developers.facebook.com/)