#!/bin/bash

# Deployment and Testing Script
# This script helps deploy the contract and test it

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Prediction Market Contract Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if contract address is provided
if [ -z "$1" ]; then
    echo "📋 Deployment Steps:"
    echo ""
    echo "1️⃣  Deploy Contract:"
    echo "   npx thirdweb deploy -k \$(grep THIRDWEB_SECRET_KEY .env.local | cut -d '=' -f2)"
    echo ""
    echo "   OR use thirdweb dashboard:"
    echo "   https://thirdweb.com/dashboard"
    echo ""
    echo "2️⃣  Once deployed, run this script with the contract address:"
    echo "   ./scripts/deploy-and-test.sh 0xYOUR_CONTRACT_ADDRESS"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
fi

CONTRACT_ADDRESS=$1

echo "📍 New Contract Address: $CONTRACT_ADDRESS"
echo ""

# Update .env.local
echo "📝 Updating .env.local..."
if [ -f .env.local ]; then
    # Backup original
    cp .env.local .env.local.backup
    echo "   ✅ Created backup: .env.local.backup"
    
    # Update contract address
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env.local; then
        sed -i.bak "s|NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" .env.local
        echo "   ✅ Updated NEXT_PUBLIC_CONTRACT_ADDRESS"
    else
        echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local
        echo "   ✅ Added NEXT_PUBLIC_CONTRACT_ADDRESS"
    fi
else
    echo "   ⚠️  .env.local not found, creating it..."
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env.local
fi

echo ""
echo "✅ Environment updated!"
echo ""
echo "🧪 Next: Test the deployment"
echo "   1. npm run dev"
echo "   2. Create a test market"
echo "   3. Test refund functionality"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

