#!/bin/bash

# WhatsApp API Quick Test Script
# Bu script Access Token'ınızı .env'den alır ve test mesajı gönderir

echo "🚀 WhatsApp Cloud API Quick Test"
echo "================================="

# .env dosyasından token'ı oku
if [ -f .env ]; then
    export $(cat .env | grep WHATSAPP_ACCESS_TOKEN | xargs)
fi

# Token kontrolü
if [ -z "$WHATSAPP_ACCESS_TOKEN" ] || [ "$WHATSAPP_ACCESS_TOKEN" = "YOUR_ACCESS_TOKEN_HERE" ]; then
    echo "❌ HATA: Access Token bulunamadı!"
    echo "Lütfen .env dosyanıza WHATSAPP_ACCESS_TOKEN ekleyin"
    exit 1
fi

# Test değerleri
PHONE_NUMBER_ID="660093600519552"
RECIPIENT="905327994223"
API_VERSION="v18.0"

echo "📱 Test numarası: +$RECIPIENT"
echo "📞 Phone Number ID: $PHONE_NUMBER_ID"
echo ""

# Test mesajı gönder
echo "📨 Test mesajı gönderiliyor..."

RESPONSE=$(curl -s -X POST \
  "https://graph.facebook.com/$API_VERSION/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"recipient_type\": \"individual\",
    \"to\": \"$RECIPIENT\",
    \"type\": \"text\",
    \"text\": {
      \"preview_url\": false,
      \"body\": \"🚀 Happy CRM WhatsApp Test\\n\\nTarih: $(date '+%Y-%m-%d %H:%M:%S')\\n\\nBu bir test mesajıdır.\"
    }
  }")

# Sonucu kontrol et
if echo "$RESPONSE" | grep -q "messages"; then
    echo "✅ Mesaj başarıyla gönderildi!"
    echo "$RESPONSE" | jq .
else
    echo "❌ Hata oluştu:"
    echo "$RESPONSE" | jq .
fi