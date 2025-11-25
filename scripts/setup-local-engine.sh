#!/bin/bash

# Setup script for local thirdweb Engine instance

set -e

echo "🚀 Setting up local thirdweb Engine..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    echo "❌ Docker Compose is not available!"
    echo "Please install Docker Compose or use Docker Desktop which includes it."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create it with your credentials first."
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Load environment variables
set -a
source .env.local
set +a

# Check required variables
if [ -z "$THIRDWEB_SECRET_KEY" ]; then
    echo "❌ THIRDWEB_SECRET_KEY not found in .env.local"
    exit 1
fi

if [ -z "$BACKEND_WALLET_ADDRESS" ]; then
    echo "❌ BACKEND_WALLET_ADDRESS not found in .env.local"
    exit 1
fi

echo "✅ Required credentials found"
echo ""

# Add encryption password if not set
if [ -z "$ENGINE_ENCRYPTION_PASSWORD" ]; then
    echo "🔐 Generating encryption password..."
    ENCRYPTION_PASSWORD=$(openssl rand -base64 32)
    echo "" >> .env.local
    echo "# Engine Encryption Password" >> .env.local
    echo "ENGINE_ENCRYPTION_PASSWORD=$ENCRYPTION_PASSWORD" >> .env.local
    echo "✅ Added ENGINE_ENCRYPTION_PASSWORD to .env.local"
fi

# Add ENGINE_URL if not set
if ! grep -q "ENGINE_URL" .env.local; then
    echo "" >> .env.local
    echo "# Local Engine URL" >> .env.local
    echo "ENGINE_URL=http://localhost:3005" >> .env.local
    echo "✅ Added ENGINE_URL to .env.local"
fi

echo ""
echo "📦 Starting Docker containers..."
echo ""

# Start services
docker compose -f docker-compose.engine.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service status..."
docker compose -f docker-compose.engine.yml ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Wait a few more seconds for Engine to fully initialize"
echo "2. Check Engine health: curl http://localhost:3005/health"
echo "3. Restart your Next.js dev server: npm run dev"
echo ""
echo "📚 Management commands:"
echo "  View logs: docker compose -f docker-compose.engine.yml logs -f engine"
echo "  Stop: docker compose -f docker-compose.engine.yml down"
echo "  Start: docker compose -f docker-compose.engine.yml up -d"

