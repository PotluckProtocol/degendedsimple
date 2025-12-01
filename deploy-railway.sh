#!/bin/bash
# Railway Deployment Script for Telegram Bot

echo "🚂 Deploying Telegram Bot to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Set environment variables for Railway
echo "📝 Setting up environment variables..."

# Note: You'll need to login first with: railway login
# Then link your project or create a new one

echo "🔐 Please login to Railway first:"
echo "   Run: railway login"
echo ""
echo "Then create a new service or link to existing project:"
echo "   Run: railway init"
echo ""
echo "Then set environment variables:"
echo "   railway variables set TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs"
echo "   railway variables set TELEGRAM_CHAT_ID=372188992"
echo "   railway variables set NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81"
echo "   railway variables set NEXT_PUBLIC_SITE_URL=https://degended.bet"
echo "   railway variables set ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv"
echo "   railway variables set NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba"
echo ""
echo "Finally, deploy:"
echo "   railway up"
echo ""
echo "Or deploy via Railway Dashboard - see RAILWAY_DEPLOY.md for instructions"

