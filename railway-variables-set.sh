#!/bin/bash
# Set Railway Environment Variables
# Run this AFTER creating a service via Railway dashboard

echo "📝 Setting Railway Environment Variables..."
echo ""

railway variables --set "TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN:-YOUR_TELEGRAM_BOT_TOKEN_HERE}" \
  --set "TELEGRAM_CHAT_ID=372188992" \
  --set "NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81" \
  --set "NEXT_PUBLIC_SITE_URL=https://degended.bet" \
  --set "ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv" \
  --set "NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "🚀 Deploy with: railway up"
echo "📊 View logs with: railway logs"

