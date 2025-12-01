#!/bin/bash

# Script to update Vercel environment variable
# Requires Vercel CLI to be installed and authenticated

NEW_CONTRACT_ADDRESS="0xC04c1DE26F5b01151eC72183b5615635E609cC81"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Update Vercel Environment Variable"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "New Contract Address: $NEW_CONTRACT_ADDRESS"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with:"
    echo "   npm i -g vercel"
    echo ""
    echo "Or update manually in Vercel dashboard:"
    echo "   1. Go to: https://vercel.com/dashboard"
    echo "   2. Settings → Environment Variables"
    echo "   3. Update NEXT_PUBLIC_CONTRACT_ADDRESS to:"
    echo "      $NEW_CONTRACT_ADDRESS"
    exit 1
fi

echo "⚠️  This will update the production environment variable."
echo "Current value will be overwritten!"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📝 Updating Vercel environment variable..."

# Remove old value and add new one
vercel env rm NEXT_PUBLIC_CONTRACT_ADDRESS production --yes 2>/dev/null
echo "$NEW_CONTRACT_ADDRESS" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production

echo ""
echo "✅ Environment variable updated!"
echo ""
echo "🚀 Next: Redeploy your application:"
echo "   vercel --prod"
echo ""
echo "Or trigger redeploy from Vercel dashboard."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"



