#!/bin/bash
# Railway Setup Script - Sets all environment variables and links project

PROJECT_ID="74204bee-cba6-4efd-9f08-4542fecfcfb9"

echo "🚂 Railway Setup Script"
echo "========================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "⚠️  Not logged in to Railway"
    echo "Please run: railway login"
    echo "This will open your browser for authentication"
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Link to project
echo "🔗 Linking to project: $PROJECT_ID"
railway link -p $PROJECT_ID

echo ""
echo "📝 Setting environment variables..."
echo ""

# Set all environment variables
railway variables set TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
railway variables set TELEGRAM_CHAT_ID=372188992
railway variables set NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
railway variables set NEXT_PUBLIC_SITE_URL=https://degended.bet
railway variables set ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv
railway variables set NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

echo ""
echo "✅ Environment variables set!"
echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Setup complete!"
echo ""
echo "To view logs: railway logs"
echo "To check status: railway status"
