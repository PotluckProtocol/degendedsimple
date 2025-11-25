# Local thirdweb Engine Setup

This guide will help you run a local thirdweb Engine instance for testing the token minting feature.

## Prerequisites

1. **Docker & Docker Compose**
   - Install Docker Desktop: https://www.docker.com/products/docker-desktop/
   - Verify installation: `docker --version` and `docker compose version`

2. **Your Credentials** (already in `.env.local`)
   - `THIRDWEB_SECRET_KEY`: Already configured ✅
   - `BACKEND_WALLET_ADDRESS`: Already configured ✅

## Quick Start

### Step 1: Install Docker (if not already installed)

**macOS:**
```bash
# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop/
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Step 2: Add Encryption Password to .env.local

Add an encryption password for Engine:

```bash
echo "" >> .env.local
echo "# Engine Encryption Password" >> .env.local
echo "ENGINE_ENCRYPTION_PASSWORD=$(openssl rand -base64 32)" >> .env.local
```

Or manually add:
```env
ENGINE_ENCRYPTION_PASSWORD=your-secure-random-password-here
```

### Step 3: Start the Engine Services

```bash
# Start PostgreSQL, Redis, and Engine
docker compose -f docker-compose.engine.yml up -d

# Check if services are running
docker compose -f docker-compose.engine.yml ps

# View logs
docker compose -f docker-compose.engine.yml logs -f engine
```

### Step 4: Update .env.local with Local Engine URL

Add the local Engine URL:

```env
ENGINE_URL=http://localhost:3005
```

**Full .env.local should now include:**
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
ENGINE_URL=http://localhost:3005
ENGINE_ENCRYPTION_PASSWORD=your-encryption-password
```

### Step 5: Verify Engine is Running

Check the Engine health endpoint:

```bash
curl http://localhost:3005/health
```

Or visit in browser: http://localhost:3005/json

### Step 6: Restart Your Next.js Dev Server

```bash
# Stop the current server (Ctrl+C) and restart
npm run dev
```

## Management Commands

### Start Engine
```bash
docker compose -f docker-compose.engine.yml up -d
```

### Stop Engine
```bash
docker compose -f docker-compose.engine.yml down
```

### View Logs
```bash
# All services
docker compose -f docker-compose.engine.yml logs -f

# Just Engine
docker compose -f docker-compose.engine.yml logs -f engine
```

### Restart Engine
```bash
docker compose -f docker-compose.engine.yml restart engine
```

### Clean Up (removes all data)
```bash
docker compose -f docker-compose.engine.yml down -v
```

## Troubleshooting

### Engine won't start
- Check logs: `docker compose -f docker-compose.engine.yml logs engine`
- Verify credentials in `.env.local` are correct
- Ensure ports 3005, 5432, and 6379 are not in use

### Connection refused
- Wait a few seconds for services to fully start
- Check health: `docker compose -f docker-compose.engine.yml ps`
- Verify Engine URL is `http://localhost:3005` (not https for local)

### Database connection errors
- Ensure PostgreSQL is healthy: `docker compose -f docker-compose.engine.yml ps postgres`
- Check connection string matches docker-compose config

## Testing Token Minting

Once Engine is running:

1. Open http://localhost:3000
2. Connect your wallet
3. Click "Claim Tokens" (if available in UI)
4. Tokens should be minted via your local Engine instance

## Notes

- **Local Engine URL**: `http://localhost:3005` (HTTP, not HTTPS)
- **Data Persistence**: Database data is stored in Docker volume `postgres_data`
- **Security**: This is for local testing only. Do not use in production without proper security setup.

## Alternative: Use thirdweb Hosted Engine

If you prefer not to run locally, you can use thirdweb's hosted Engine:
1. Go to https://portal.thirdweb.com/engine
2. Create an Engine instance
3. Copy the Engine URL
4. Add `ENGINE_URL=https://your-engine.thirdweb.com` to `.env.local`

