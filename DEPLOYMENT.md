# Contract Deployment Guide

This guide walks you through deploying your own smart contracts for the Prediction Market dApp.

> 🚀 **Deploying on Sonic Mainnet?** See [SONIC_DEPLOYMENT.md](./contracts/SONIC_DEPLOYMENT.md) for Sonic-specific instructions.

## Prerequisites

1. **Node.js 18+** installed
2. **A crypto wallet** (MetaMask, Coinbase Wallet, etc.) with testnet tokens for gas fees
3. **thirdweb account** (free) - [Sign up here](https://thirdweb.com)

## Step 1: Install Contract Dependencies

The contracts use OpenZeppelin's battle-tested contracts. Install them:

```bash
npm install @openzeppelin/contracts
```

## Step 2: Deploy Contracts

### Option A: Using thirdweb CLI (Recommended)

**Note**: If you're using an existing token (like USDC on Sonic), skip step 1 and use the existing token address.

1. **Deploy the Token Contract (Optional - Only if creating custom token)**:
   ```bash
   npx thirdweb deploy
   ```
   
   - Select `PredictToken.sol`
   - Connect your wallet
   - Choose your network
   - Enter the constructor parameter: your wallet address (for initial owner)
   - Deploy and **copy the contract address**

2. **Deploy the Prediction Market Contract**:
   ```bash
   npx thirdweb deploy
   ```
   
   - Select `PredictionMarket.sol`
   - Connect your wallet
   - Choose your network (e.g., Sonic mainnet - Chain ID 146)
   - Enter the constructor parameter: 
     - **Custom token**: The token contract address from step 1
     - **USDC on Sonic**: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
   - Deploy and **copy the contract address**

### Option B: Using Hardhat or Foundry

If you prefer using Hardhat or Foundry, you can set up a deployment script. However, thirdweb's CLI is the simplest option.

## Step 3: Update Your Environment Variables

After deployment, update your `.env.local` file:

```env
# Required: thirdweb Client ID
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id

# Your deployed contract addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourPredictionMarketAddress
NEXT_PUBLIC_TOKEN_ADDRESS=0xYourTokenAddress

# Optional: For token minting feature
BACKEND_WALLET_ADDRESS=your_backend_wallet
ENGINE_URL=https://your-engine.thirdweb.com
THIRDWEB_SECRET_KEY=your_secret_key
```

## Step 4: Verify Everything Works

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Test the connection**:
   - Connect your wallet
   - The app should now use your deployed contracts
   - Try minting some tokens (if you have the minting feature set up)

## Step 5: Create Your First Market

After deployment, you'll need to create markets. You can do this by:

1. **Using thirdweb's dashboard**: Connect to your contract and call `createMarket()`
2. **Writing a script**: Create a simple script to call the function
3. **Using a frontend admin panel**: Build a simple interface for market creation

### Example: Creating a Market via thirdweb Dashboard

1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Find your deployed `PredictionMarket` contract
3. Go to the "Explorer" tab
4. Call `createMarket()` with:
   - `_question`: "Will it rain tomorrow?"
   - `_optionA`: "Yes"
   - `_optionB`: "No"
   - `_endTime`: Unix timestamp (e.g., `Math.floor(Date.now() / 1000) + 86400` for 24 hours from now)

## Network Options

### Testnets (Recommended for Testing)
- **Base Sepolia** - Fast, cheap testnet
- **Sepolia** - Ethereum testnet
- **Mumbai** - Polygon testnet

### Mainnets (For Production)
- **Base** - Layer 2, low fees
- **Ethereum** - Most secure, higher fees
- **Polygon** - Low fees, good for production

## Troubleshooting

### Contract deployment fails
- Make sure you have enough testnet tokens for gas
- Check that your wallet is connected to the correct network
- Verify the constructor parameters are correct

### Frontend can't connect to contracts
- Verify the contract addresses in `.env.local` are correct
- Make sure you're on the same network as your contracts
- Check the browser console for errors

### "Token transfer failed" errors
- Users need to approve token spending before buying shares
- Make sure users have tokens (mint them using `mint()` function)
- Check token balance in the contract

## Next Steps

After deployment:
1. ✅ Mint tokens to test wallets
2. ✅ Create test markets
3. ✅ Test buying shares
4. ✅ Test resolving markets and claiming winnings
5. ✅ Deploy to mainnet when ready

## Security Reminders

- **Never commit** `.env.local` to version control
- **Test thoroughly** on testnets before mainnet deployment
- **Review contract code** before deploying (especially for production)
- **Keep your private keys secure** - never share them

## Need Help?

- Check the [contracts README](./contracts/README.md) for contract details
- Review [thirdweb documentation](https://portal.thirdweb.com/)
- Check the main [README.md](./README.md) for app setup

