# 🔐 Deploy with Private Key

⚠️ **SECURITY WARNING**: Your private key is sensitive! Never commit it to git or share it publicly.

## ✅ Setup Complete

Your private key is already configured in `.env.deploy` ✅

## Deploy - Choose Your Method

### Method 1: thirdweb Deploy (Recommended) ⭐

```bash
npx thirdweb deploy
```

**In the browser:**
1. Select `contracts/PredictionMarket.sol`
2. Select **Sonic Mainnet** (Chain ID 146)
3. Constructor: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
4. Deploy and copy address

### Method 2: Hardhat (If Node.js 18/20)

If you have Node.js 18 or 20:
```bash
npm run deploy:sonic
```

**Note**: Hardhat has compatibility issues with Node.js 23. Use Method 1 if you're on Node 23.

## After Deployment

1. **Copy the contract address** from the deployment output

2. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
   NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

## Requirements

- Make sure the wallet has Sonic tokens (S) for gas fees
- The wallet should have enough balance to cover deployment costs

## Troubleshooting

### "Insufficient funds"
- Make sure your wallet has Sonic tokens (S) for gas

### "Network not found"
- The script is configured for Sonic Mainnet automatically
- RPC: https://rpc.soniclabs.com
- Chain ID: 146
