# Quick Start: Local Engine Setup

## 🚀 Fastest Way to Get Started

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script (handles everything automatically)
npm run engine:setup
```

This will:
- ✅ Check Docker installation
- ✅ Verify your credentials
- ✅ Generate encryption password
- ✅ Add ENGINE_URL to .env.local
- ✅ Start all services (PostgreSQL, Redis, Engine)

### Option 2: Manual Setup

1. **Install Docker Desktop** (if not installed)
   - macOS: https://www.docker.com/products/docker-desktop/
   - Linux: Follow Docker installation for your distro

2. **Start Engine Services**
   ```bash
   npm run engine:start
   ```

3. **Verify it's running**
   ```bash
   npm run engine:status
   curl http://localhost:3005/health
   ```

4. **Restart your Next.js server**
   ```bash
   npm run dev
   ```

## 📋 Available Commands

```bash
# Setup Engine (first time)
npm run engine:setup

# Start Engine services
npm run engine:start

# Stop Engine services
npm run engine:stop

# View Engine logs
npm run engine:logs

# Check Engine status
npm run engine:status
```

## ✅ What You Need

Your `.env.local` should now have:
- ✅ `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- ✅ `THIRDWEB_SECRET_KEY`
- ✅ `BACKEND_WALLET_ADDRESS`
- ✅ `ENGINE_URL=http://localhost:3005`
- ✅ `ENGINE_ENCRYPTION_PASSWORD` (auto-generated)

## 🧪 Testing

1. Make sure Engine is running: `npm run engine:status`
2. Start your app: `npm run dev`
3. Open http://localhost:3000
4. Test the token minting feature

## 🐛 Troubleshooting

**Docker not found?**
- Install Docker Desktop first
- Make sure Docker is running before starting Engine

**Ports already in use?**
- Check if ports 3005, 5432, 6379 are available
- Stop conflicting services

**Engine won't start?**
- Check logs: `npm run engine:logs`
- Verify credentials in `.env.local`

## 📚 More Details

See [LOCAL_ENGINE_SETUP.md](./LOCAL_ENGINE_SETUP.md) for detailed documentation.

