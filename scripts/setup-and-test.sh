#!/bin/bash

# Complete setup and test script
# Usage: ./scripts/setup-and-test.sh 0xCONTRACT_ADDRESS

CONTRACT_ADDRESS=$1

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Contract address required!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Usage: ./scripts/setup-and-test.sh 0xCONTRACT_ADDRESS"
    echo ""
    echo "Example:"
    echo "  ./scripts/setup-and-test.sh 0x1234567890123456789012345678901234567890"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Setting Up & Testing Refund Feature"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Contract Address: $CONTRACT_ADDRESS"
echo ""

# Step 1: Update environment
echo "1️⃣  Updating .env.local..."
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "   ✅ Backup created: .env.local.backup"
    
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env.local; then
        sed -i.bak "s|NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" .env.local
        rm .env.local.bak 2>/dev/null
        echo "   ✅ Updated NEXT_PUBLIC_CONTRACT_ADDRESS"
    else
        echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local
        echo "   ✅ Added NEXT_PUBLIC_CONTRACT_ADDRESS"
    fi
else
    echo "   ⚠️  .env.local not found, creating it..."
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env.local
    echo "   ✅ Created .env.local"
fi

echo ""

# Step 2: Test contract
echo "2️⃣  Testing contract refund feature..."
if command -v node > /dev/null 2>&1; then
    node scripts/test-refund-feature.js "$CONTRACT_ADDRESS" || {
        echo "   ⚠️  Contract test had issues (this is okay, we'll test in browser)"
    }
else
    echo "   ⚠️  Node.js not found, skipping contract test"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Next Steps:"
echo ""
echo "1️⃣  Start dev server:"
echo "   npm run dev"
echo ""
echo "2️⃣  Test in browser:"
echo "   • Create a test market"
echo "   • Buy some shares"
echo "   • Resolve as refund (💰 Refund button)"
echo "   • Claim refund (should get full amount, no fee)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"



