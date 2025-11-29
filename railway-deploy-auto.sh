#!/bin/bash
# Automated Railway Deployment Script
# Run this AFTER: railway login

set -e

PROJECT_ID="74204bee-cba6-4efd-9f08-4542fecfcfb9"

echo "🚂 Railway Automated Deployment"
echo "================================"
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check authentication
if ! railway whoami &> /dev/null; then
    echo "❌ Not authenticated with Railway"
    echo ""
    echo "Please run this command first (opens browser):"
    echo "   railway login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Authenticated with Railway"
echo ""

# Link to project
echo "🔗 Linking to project: $PROJECT_ID"
railway link -p $PROJECT_ID
echo ""

# Set environment variables
echo "📝 Setting environment variables..."
echo ""

railway variables --set "TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs" --set "TELEGRAM_CHAT_ID=372188992" --set "NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81" --set "NEXT_PUBLIC_SITE_URL=https://degended.bet" --set "ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv" --set "NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba"
echo "  ✅ All environment variables set"

echo ""
echo "✅ All environment variables set!"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
echo ""
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Useful commands:"
echo "   railway logs      - View logs"
echo "   railway status    - Check status"
echo "   railway open      - Open in browser"
