#!/bin/bash

# Fully Automated Deployment Script
# Updates Vercel env vars and triggers deployment

set -e  # Exit on error

NEW_CONTRACT="0xC04c1DE26F5b01151eC72183b5615635E609cC81"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 AUTOMATED VERCEL DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Ensure Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Step 2: Login check
echo "🔐 Checking authentication..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Need to login. Opening browser..."
    vercel login
fi

# Step 3: Update env vars
echo ""
echo "📝 Updating contract address on Vercel..."
echo "   New: $NEW_CONTRACT"
echo ""

# Update for all environments
echo "$NEW_CONTRACT" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production --force 2>&1 | grep -v "already exists" || true
echo "$NEW_CONTRACT" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS preview --force 2>&1 | grep -v "already exists" || true
echo "$NEW_CONTRACT" | vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS development --force 2>&1 | grep -v "already exists" || true

echo "✅ Environment variables updated"
echo ""

# Step 4: Commit and push
echo "📤 Preparing to trigger redeploy..."
git add -A
git commit -m "Update to new contract with refund feature" || echo "No changes to commit"
git push origin main

echo ""
echo "✅ Code pushed - Vercel will auto-redeploy!"
echo ""
echo "⏳ Deployment in progress..."
echo "   Check: https://vercel.com/dashboard"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

