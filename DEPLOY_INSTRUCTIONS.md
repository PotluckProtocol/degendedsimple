# 🚀 Deployment Instructions

Your private key is configured in `.env.deploy`. Here are your deployment options:

## Option 1: Using thirdweb Deploy (Easiest) ⭐

This is the simplest method and doesn't require Hardhat setup:

```bash
npx thirdweb deploy
```

**In the browser interface:**
1. Select `contracts/PredictionMarket.sol`
2. Connect your wallet (or it will use your private key if configured)
3. Select **Sonic Mainnet** (Chain ID 146)
4. Enter constructor parameter: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
5. Deploy and copy the contract address

## Option 2: Using Hardhat (If you want to automate)

The Hardhat setup has some compatibility issues with Node.js 23. You can:

1. **Use Node.js 18 or 20** (recommended for Hardhat)
2. Or use thirdweb deploy (Option 1) which works with any Node version

## After Deployment

1. **Copy the deployed contract address**

2. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
   NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

## Your Private Key

✅ Your private key is stored in `.env.deploy` (this file is in `.gitignore`)

⚠️ **Security**: Never commit or share your private key!

## Requirements

- Make sure the wallet has Sonic tokens (S) for gas fees
- The wallet address from your private key should have enough balance

## Quick Deploy Command

```bash
npx thirdweb deploy
```

Then follow the prompts in the browser interface!


