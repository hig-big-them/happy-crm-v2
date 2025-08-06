#!/bin/bash

# Vercel Environment Variables Setup Script
# Bu script Vercel CLI kullanarak environment variable'ları otomatik ekler

echo "🚀 Vercel Environment Variables Setup"
echo "====================================="

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI bulunamadı!"
    echo "Yüklemek için: npm i -g vercel"
    exit 1
fi

# .env.local dosyasını kontrol et
if [ ! -f .env.local ]; then
    echo "❌ .env.local dosyası bulunamadı!"
    exit 1
fi

echo "📋 Environment variable'ları Vercel'e ekleniyor..."

# .env.local'den variable'ları oku ve Vercel'e ekle
while IFS='=' read -r key value; do
    # Yorum satırlarını ve boş satırları atla
    if [[ ! "$key" =~ ^#.*$ ]] && [[ ! -z "$key" ]]; then
        # Value'dan quote'ları temizle
        value="${value%\"}"
        value="${value#\"}"
        
        echo "Adding: $key"
        
        # Production environment'a ekle
        echo "$value" | vercel env add "$key" production --force 2>/dev/null
        
        # Preview environment'a ekle
        echo "$value" | vercel env add "$key" preview --force 2>/dev/null
    fi
done < .env.local

echo ""
echo "✅ Environment variable'lar eklendi!"
echo ""
echo "📝 Kontrol etmek için:"
echo "   vercel env ls"
echo ""
echo "🚀 Deploy etmek için:"
echo "   vercel --prod"