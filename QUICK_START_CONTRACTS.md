# Quick Start: Deploy Your Contracts on Sonic Mainnet

This is a quick reference guide for Sonic Mainnet with USDC. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md) or [SONIC_DEPLOYMENT.md](./contracts/SONIC_DEPLOYMENT.md).

## 🚀 5-Minute Deployment (Sonic Mainnet)

### Step 1: Install Dependencies
```bash
npm install @openzeppelin/contracts
```

### Step 2: Deploy Market Contract
```bash
npx thirdweb deploy
```
- Select `contracts/PredictionMarket.sol`
- Connect wallet
- **Add Sonic Mainnet** to wallet if needed:
  - Chain ID: 146
  - RPC: https://rpc.soniclabs.com
  - Currency: S
- Choose **Sonic Mainnet** (Chain ID 146)
- Enter constructor: **`0x29219dd400f2Bf60E5a23d13Be72B486D4038894`** (USDC address)
- **Copy the deployed address** 📋

### Step 3: Update Environment
Add to your `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourMarketAddress
# USDC is already configured as default
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

## ✅ You're Done!

Your app now uses your own contracts on Sonic Mainnet. Next steps:
- Users need USDC on Sonic to participate
- Create markets: Use `createMarket()` in PredictionMarket contract
- Start trading!

## 🆘 Need Help?

- Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Contract details: [contracts/README.md](./contracts/README.md)

