# Getting Started Guide

This guide will walk you through setting up the Simple Prediction Market dApp step by step.

## Quick Checklist

- [ ] Install Node.js 18+ and npm/yarn/pnpm
- [ ] Create a thirdweb account
- [ ] Get your thirdweb Client ID
- [ ] Set up thirdweb Engine (for token minting)
- [ ] Install project dependencies
- [ ] Configure environment variables
- [ ] Run the development server

## Step-by-Step Setup

### 1. Prerequisites

Make sure you have Node.js 18 or higher installed:
```bash
node --version  # Should be 18.x or higher
npm --version    # Should be 8.x or higher
```

If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies

Navigate to the project directory and install dependencies:

```bash
npm install
```

This will install all required packages including Next.js, React, thirdweb SDK, and UI components.

### 3. Set Up thirdweb Account

You'll need a thirdweb account to get your Client ID and set up Engine for token minting.

#### 3a. Create Account & Get Client ID

1. Go to [thirdweb.com](https://thirdweb.com) and sign up/login
2. Navigate to the [Dashboard](https://thirdweb.com/dashboard)
3. Create a new project or select an existing one
4. Go to **Settings** → **API Keys**
5. Copy your **Client ID** (starts with something like `abc123...`)

#### 3b. Set Up thirdweb Engine (for Token Minting)

To enable the "Claim Tokens" feature, you need thirdweb Engine:

1. In your thirdweb dashboard, go to **Engine**
2. Create a new Engine instance (or use existing)
3. Note your **Engine URL** (e.g., `https://your-engine.thirdweb.com`)
4. Get your **Secret Key** from Engine settings
5. Set up a **Backend Wallet**:
   - In Engine settings, create or import a wallet
   - This wallet will be used to mint tokens
   - Copy the wallet address

**Note**: For development/testing, you can use thirdweb's hosted Engine. For production, you may want to self-host.

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory of the project:

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Mac/Linux
touch .env.local
```

Add the following variables to `.env.local`:

```env
# Required: Get from thirdweb Dashboard → Settings → API Keys
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Required: Backend wallet address from thirdweb Engine
BACKEND_WALLET_ADDRESS=0xYourBackendWalletAddress

# Required: Your thirdweb Engine URL
ENGINE_URL=https://your-engine.thirdweb.com

# Required: Secret key from thirdweb Engine settings
THIRDWEB_SECRET_KEY=your_secret_key_here
```

**Where to find each value:**

| Variable | Where to Find It |
|----------|------------------|
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | thirdweb Dashboard → Settings → API Keys → Client ID |
| `BACKEND_WALLET_ADDRESS` | thirdweb Engine → Settings → Backend Wallet Address |
| `ENGINE_URL` | thirdweb Engine → Overview → Engine URL |
| `THIRDWEB_SECRET_KEY` | thirdweb Engine → Settings → Secret Key |

### 5. Run the Development Server

Start the development server:

```bash
npm run dev
```

You should see output like:
```
  ▲ Next.js 15.0.1
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 6. Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the prediction market dashboard!

## Testing the Application

### First Time Setup

1. **Connect Wallet**: Click "Sign In" in the top right
   - You can sign in with email, Google, or other social accounts
   - No traditional wallet needed (uses smart wallets)

2. **Claim Tokens**: Click "Claim Tokens" button
   - This mints 100 demo tokens to your wallet
   - You'll need these tokens to buy shares in markets

3. **Browse Markets**: 
   - View active markets (still accepting bets)
   - Check pending markets (awaiting resolution)
   - See resolved markets (can claim rewards)

4. **Buy Shares**:
   - Click on an active market
   - Select Option A or Option B
   - Enter the number of shares to buy
   - Approve tokens (first time only)
   - Confirm the purchase

## Troubleshooting

### "Client ID is required" Error

- Make sure `.env.local` exists in the root directory
- Verify `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` is set correctly
- Restart the dev server after adding environment variables

### Token Claiming Fails

- Verify all Engine-related environment variables are set:
  - `BACKEND_WALLET_ADDRESS`
  - `ENGINE_URL`
  - `THIRDWEB_SECRET_KEY`
- Check that your Engine instance is running
- Ensure the backend wallet has sufficient funds (if required)

### "Cannot connect to contract" Error

- The contracts are deployed on Base Sepolia testnet
- Make sure you're connected to the correct network
- The contract addresses are hardcoded in `src/constants/contract.ts`

### Port 3000 Already in Use

If port 3000 is taken, Next.js will automatically use the next available port (3001, 3002, etc.). Check the terminal output for the actual URL.

## Next Steps

- **Customize the UI**: Edit components in `src/components/`
- **Add Markets**: Markets are created via the smart contract (requires contract owner access)
- **Deploy**: See the README for production deployment instructions

## Need Help?

- Check the [thirdweb Documentation](https://portal.thirdweb.com/)
- Review the [tutorial blog post](https://blog.thirdweb.com/guides/building-a-simple-prediction-market-dapp-with-thirdweb/)
- Open an issue on GitHub

## What's Already Set Up?

✅ Smart contracts deployed on Base Sepolia  
✅ Frontend UI components  
✅ Wallet connection with account abstraction  
✅ Token approval flow  
✅ Market display and filtering  
✅ Share purchase interface  
✅ Reward claiming functionality  

You just need to configure your thirdweb credentials and you're ready to go!

