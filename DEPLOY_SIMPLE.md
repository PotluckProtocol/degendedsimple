# 🚀 Simple Deployment Guide

Since `npx thirdweb deploy` requires authentication, here are the easiest options:

## ✅ Recommended: Use thirdweb Dashboard

This is the simplest method - no CLI authentication needed!

1. **Go to**: [thirdweb Dashboard](https://thirdweb.com/dashboard)
   - Sign in or create a free account

2. **Click**: "Deploy Contract" or "Contracts" → "Deploy"

3. **Upload Contract**:
   - Click "Upload" or "Deploy New Contract"
   - Select `contracts/PredictionMarket.sol` from your project

4. **Configure Deployment**:
   - **Network**: Add Sonic Mainnet manually or select from list
     - Chain ID: 146
     - RPC: https://rpc.soniclabs.com
   - **Constructor Parameters**: 
     - Enter: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` (USDC address)

5. **Connect Wallet**:
   - Connect the wallet that has your private key
   - Make sure it has Sonic tokens (S) for gas

6. **Deploy**:
   - Review and confirm the deployment
   - Copy the deployed contract address

7. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
   ```

## Alternative: Get thirdweb Secret Key

If you prefer using CLI:

1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Settings → API Keys
3. Copy your Secret Key
4. Run:
   ```bash
   npx thirdweb deploy -k YOUR_SECRET_KEY
   ```

## Your Private Key

Your private key is in `.env.deploy` and will be used when you connect your wallet in the dashboard.

---

**Easiest path**: Use the thirdweb Dashboard (Option 1) - no CLI setup needed! 🎯


