#!/bin/bash

echo "🚀 Setting Up thirdweb Hosted Engine"
echo ""
echo "For production, you need a hosted Engine instance from thirdweb."
echo ""
echo "📋 Quick Steps:"
echo "1. Go to: https://portal.thirdweb.com/engine"
echo "2. Click 'Create Engine'"
echo "3. Wait for deployment (2-3 min)"
echo "4. Copy Engine URL and Secret Key"
echo "5. Configure backend wallet"
echo ""
echo "📚 See SETUP_HOSTED_ENGINE.md for detailed instructions"
echo ""
echo "Would you like to open the Engine dashboard now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://portal.thirdweb.com/engine"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://portal.thirdweb.com/engine"
    else
        echo "Please visit: https://portal.thirdweb.com/engine"
    fi
fi
