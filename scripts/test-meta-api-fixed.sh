#!/bin/bash

# 🚀 Meta WhatsApp API Test Script - Fixed Version
# Curl test sonuçlarına göre güncellenmiş

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
BASE_URL="https://graph.facebook.com/v23.0"
BUSINESS_ACCOUNT_ID="640124182025093"
ACCESS_TOKEN="EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6"

echo -e "${BLUE}🚀 Meta WhatsApp API Test Script - Fixed Version${NC}"
echo "================================================"

# Test 1: API Connection
echo -e "\n${YELLOW}1. API Bağlantı Testi${NC}"
echo "------------------------"
response=$(curl -s -X GET "$BASE_URL/$BUSINESS_ACCOUNT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ API bağlantısı başarılı${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ API bağlantısı başarısız${NC}"
    echo "Response: $response"
    exit 1
fi

# Test 2: Basit Template (Sadece Body) - En güvenli
echo -e "\n${YELLOW}2. Basit Template (Sadece Body)${NC}"
echo "-----------------------------------"
timestamp=$(date +%s)
template_name="test_simple_body_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"UTILITY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"BODY\",
        \"text\": \"Bu basit bir test mesajıdır.\"
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ Basit template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Basit template oluşturulamadı${NC}"
    echo "Response: $response"
fi

# Test 3: Body + Footer Template
echo -e "\n${YELLOW}3. Body + Footer Template${NC}"
echo "---------------------------"
timestamp=$(date +%s)
template_name="test_body_footer_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"UTILITY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"BODY\",
        \"text\": \"Bu bir test mesajıdır.\"
      },
      {
        \"type\": \"FOOTER\",
        \"text\": \"Test footer\"
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ Body + Footer template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Body + Footer template oluşturulamadı${NC}"
    echo "Response: $response"
fi

# Test 4: Body + Buttons Template
echo -e "\n${YELLOW}4. Body + Buttons Template${NC}"
echo "----------------------------"
timestamp=$(date +%s)
template_name="test_body_buttons_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"UTILITY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"BODY\",
        \"text\": \"Hangi seçeneği tercih edersiniz?\"
      },
      {
        \"type\": \"BUTTONS\",
        \"buttons\": [
          {
            \"type\": \"QUICK_REPLY\",
            \"text\": \"Seçenek 1\"
          },
          {
            \"type\": \"QUICK_REPLY\",
            \"text\": \"Seçenek 2\"
          }
        ]
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ Body + Buttons template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Body + Buttons template oluşturulamadı${NC}"
    echo "Response: $response"
fi

# Test 5: Parametreli Template
echo -e "\n${YELLOW}5. Parametreli Template${NC}"
echo "------------------------"
timestamp=$(date +%s)
template_name="test_parameterized_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"UTILITY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"BODY\",
        \"text\": \"Merhaba {{1}}, hoş geldiniz! Bugün {{2}} tarihinde {{3}} saatinde randevunuz var.\"
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ Parametreli template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Parametreli template oluşturulamadı${NC}"
    echo "Response: $response"
fi

# Test 6: Header'ı Body'ye entegre eden template
echo -e "\n${YELLOW}6. Header + Body Entegre Template${NC}"
echo "-----------------------------------"
timestamp=$(date +%s)
template_name="test_header_integrated_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"UTILITY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"BODY\",
        \"text\": \"HOŞ GELDİNİZ\\n\\nMerhaba {{1}}, sistemimize hoş geldiniz! Nasılsınız?\"
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ Header entegre template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Header entegre template oluşturulamadı${NC}"
    echo "Response: $response"
fi

echo -e "\n${BLUE}🎉 Güncellenmiş test tamamlandı!${NC}"
echo "====================================="
echo -e "${YELLOW}📝 Notlar:${NC}"
echo "- Header component'ler body'ye entegre edildi"
echo "- Sadece Body, Footer ve Buttons component'leri destekleniyor"
echo "- Category otomatik olarak MARKETING'e çevriliyor"
echo "- Template listesi için App ID gerekebilir"
