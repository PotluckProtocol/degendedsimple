# 🚀 Quick Deploy Guide

## Step 1: Deploy Contract

### Option A: Using thirdweb Dashboard (Easiest!)

1. **Go to**: https://thirdweb.com/dashboard
2. **Click**: "Deploy Contract" → "From Source"
3. **Upload**: `contracts/PredictionMarket.sol`
4. **Select Network**: Sonic Mainnet (Chain ID: 146)
5. **Constructor Parameter**: 
   ```
   0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   ```
6. **Deploy** and **copy the contract address** 📋

### Option B: Using CLI (Interactive)

```bash
# Get your secret key
SECRET_KEY=$(grep THIRDWEB_SECRET_KEY .env.local | cut -d '=' -f2)

# Deploy
npx thirdweb deploy -k "$SECRET_KEY"
```

When prompted:
- Select: **PredictionMarket**
- Network: **Sonic Mainnet**
- Constructor: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`

---

## Step 2: Update Environment

Once you have the contract address, run:

```bash
./scripts/deploy-and-test.sh 0xYOUR_NEW_CONTRACT_ADDRESS
```

Or manually update `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
```

---

## Step 3: Test Locally

```bash
npm run dev
```

Then test:
1. ✅ Create a market
2. ✅ Buy shares
3. ✅ Resolve as refund (new "💰 Refund" button)
4. ✅ Claim refund (should get full amount, no fee)

---

## Step 4: Deploy to Production

1. Update Vercel environment variables with new contract address
2. Redeploy

---

**Need help?** The deployment script will guide you! 🎯

