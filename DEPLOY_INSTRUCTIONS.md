# 🚀 Quick Deployment Instructions

## Method 1: Using thirdweb Dashboard (Easiest)

1. **Go to**: https://thirdweb.com/dashboard
2. **Connect your wallet**
3. **Click**: "Deploy Contract"
4. **Upload**: `contracts/PredictionMarket.sol`
5. **Select**: Sonic Mainnet
6. **Constructor Parameter**: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
7. **Deploy** and copy the contract address

## Method 2: Using thirdweb CLI with Secret Key

```bash
# First, get your secret key from thirdweb dashboard
# Then deploy:
npx thirdweb deploy -k YOUR_SECRET_KEY
```

## Method 3: Using Hardhat (If configured)

```bash
npm run deploy:sonic
```

---

## After Deployment

1. **Copy the contract address** from the deployment output
2. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_NEW_ADDRESS_HERE
   ```
3. **Restart dev server**: `npm run dev`
4. **Test the refund feature!**

---

## Quick Test Checklist

- [ ] Contract deployed
- [ ] Address updated in `.env.local`
- [ ] Dev server restarted
- [ ] Can create markets
- [ ] Can buy shares
- [ ] Can resolve as refund
- [ ] Can claim refund (full amount, no fee)


