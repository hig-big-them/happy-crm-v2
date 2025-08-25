#!/bin/bash

# 🚀 Meta WhatsApp API Test Script
# Bu script Meta WhatsApp Business API'sini test eder

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

echo -e "${BLUE}🚀 Meta WhatsApp API Test Script${NC}"
echo "=================================="

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

# Test 2: Template Listesi
echo -e "\n${YELLOW}2. Template Listesi${NC}"
echo "-------------------"
response=$(curl -s -X GET "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -d "access_token=$ACCESS_TOKEN" \
  -d "fields=name,status,category,language" \
  -d "limit=5")

if [[ $response == *"data"* ]]; then
    echo -e "${GREEN}✅ Template listesi alındı${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Template listesi alınamadı${NC}"
    echo "Response: $response"
fi

# Test 3: Basit Template Oluşturma
echo -e "\n${YELLOW}3. Basit Template Oluşturma${NC}"
echo "----------------------------"
timestamp=$(date +%s)
template_name="test_simple_$timestamp"

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
        \"text\": \"Bu basit bir test template'idir.\"
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

# Test 4: Header + Body Template
echo -e "\n${YELLOW}4. Header + Body Template${NC}"
echo "---------------------------"
timestamp=$(date +%s)
template_name="test_header_body_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"UTILITY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"HEADER\",
        \"format\": \"TEXT\",
        \"text\": \"Test Başlık\"
      },
      {
        \"type\": \"BODY\",
        \"text\": \"Bu bir test mesajıdır. {{1}} parametresi ile test ediliyor.\"
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"id"* ]]; then
    echo -e "${GREEN}✅ Header + Body template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Header + Body template oluşturulamadı${NC}"
    echo "Response: $response"
fi

# Test 5: Buttons Template
echo -e "\n${YELLOW}5. Buttons Template${NC}"
echo "---------------------"
timestamp=$(date +%s)
template_name="test_buttons_$timestamp"

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
    echo -e "${GREEN}✅ Buttons template oluşturuldu${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Buttons template oluşturulamadı${NC}"
    echo "Response: $response"
fi

# Test 6: Hatalı Template (Test amaçlı)
echo -e "\n${YELLOW}6. Hatalı Template Testi${NC}"
echo "---------------------------"
timestamp=$(date +%s)
template_name="test_error_$timestamp"

response=$(curl -s -X POST "$BASE_URL/$BUSINESS_ACCOUNT_ID/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$template_name\",
    \"category\": \"INVALID_CATEGORY\",
    \"language\": \"tr\",
    \"components\": [
      {
        \"type\": \"BODY\",
        \"text\": \"Test\"
      }
    ],
    \"parameter_format\": \"POSITIONAL\"
  }")

if [[ $response == *"error"* ]]; then
    echo -e "${YELLOW}✅ Beklenen hata alındı${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Hata bekleniyordu ama alınmadı${NC}"
    echo "Response: $response"
fi

echo -e "\n${BLUE}🎉 Test tamamlandı!${NC}"
echo "=========================="
