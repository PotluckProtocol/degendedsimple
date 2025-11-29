#!/bin/bash
# Final Railway Setup - Run AFTER: railway service (and selecting your service)

set -e

echo "🚂 Railway Final Setup"
echo "======================"
echo ""

# Check if service is linked
if ! railway status | grep -q "Service:"; then
    echo "❌ No service linked. Please run: railway service"
    echo "   Then select your telegram bot service"
    exit 1
fi

SERVICE=$(railway status | grep "Service:" | awk '{print $2}')
echo "✅ Service linked: $SERVICE"
echo ""

echo "📝 Setting environment variables..."
railway variables --set "TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs" \
  --set "TELEGRAM_CHAT_ID=372188992" \
  --set "NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81" \
  --set "NEXT_PUBLIC_SITE_URL=https://degended.bet" \
  --set "ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv" \
  --set "NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba"

echo ""
echo "✅ Environment variables set!"
echo ""

echo "🚀 Deploying..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Useful commands:"
echo "   railway logs      - View logs"
echo "   railway status    - Check status"
