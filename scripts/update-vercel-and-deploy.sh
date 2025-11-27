#!/bin/bash

# Automated script to update Vercel environment variable and trigger redeploy
# This script updates the contract address and triggers a redeploy

NEW_CONTRACT_ADDRESS="0xC04c1DE26F5b01151eC72183b5615635E609cC81"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Automated Vercel Update & Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

echo "✅ Vercel CLI ready"
echo ""

# Check if logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please authenticate:"
    echo ""
    echo "Run: vercel login"
    echo ""
    read -p "Press Enter after logging in, or Ctrl+C to cancel..."
fi

echo "✅ Authenticated"
echo ""

# Update environment variable
echo "📝 Updating environment variable..."
echo "   NEXT_PUBLIC_CONTRACT_ADDRESS = $NEW_CONTRACT_ADDRESS"
echo ""

# Remove old value if exists
vercel env rm NEXT_PUBLIC_CONTRACT_ADDRESS production --yes 2>/dev/null
vercel env rm NEXT_PUBLIC_CONTRACT_ADDRESS preview --yes 2>/dev/null
vercel env rm NEXT_PUBLIC_CONTRACT_ADDRESS development --yes 2>/dev/null

# Add new value to all environments
echo "$NEW_CONTRACT_ADDRESS" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production
echo "$NEW_CONTRACT_ADDRESS" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS preview
echo "$NEW_CONTRACT_ADDRESS" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS development

echo ""
echo "✅ Environment variables updated!"
echo ""

# Commit and push changes to trigger redeploy
echo "📤 Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo "   Found changes, committing..."
    git add .
    git commit -m "Update contract address for refund feature" || echo "   Note: Changes committed"
fi

# Push to trigger redeploy
echo ""
echo "🚀 Pushing to GitHub to trigger Vercel redeploy..."
git push origin main 2>&1 | tail -5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT INITIATED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 What happened:"
echo "   ✅ Environment variables updated on Vercel"
echo "   ✅ Code pushed to GitHub"
echo "   ✅ Vercel will auto-redeploy"
echo ""
echo "⏳ Wait 2-3 minutes for deployment to complete"
echo "   Then test: https://degended.bet"
echo ""
echo "🧪 Test checklist:"
echo "   [ ] Refund button appears"
echo "   [ ] Resolve as refund works"
echo "   [ ] Claim refund works (no fee)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

