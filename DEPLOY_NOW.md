# 🚀 Deploy Your Contract Now

Follow these steps to deploy your PredictionMarket contract on Sonic Mainnet.

## Step 1: Prepare Your Wallet

1. **Make sure your wallet has Sonic Mainnet added:**
   - Network Name: `Sonic`
   - RPC URL: `https://rpc.soniclabs.com`
   - Chain ID: `146`
   - Currency Symbol: `S`

2. **Ensure you have Sonic tokens (S) for gas fees**

## Step 2: Deploy the Contract

Run this command in your terminal:

```bash
npx thirdweb deploy
```

### What to do in the thirdweb interface:

1. **Select Contract**: Choose `contracts/PredictionMarket.sol`

2. **Connect Wallet**: Connect your wallet that has Sonic tokens

3. **Select Network**: 
   - If Sonic Mainnet isn't listed, you may need to add it manually
   - Look for "Sonic" or Chain ID 146
   - If not available, you can add custom network in the interface

4. **Constructor Parameters**:
   - Enter: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
   - This is the USDC address on Sonic Mainnet

5. **Deploy**: Click deploy and confirm the transaction in your wallet

6. **Copy the Contract Address**: After deployment, copy the deployed contract address 📋

## Step 3: Update Environment Variables

After deployment, you need to create/update your `.env.local` file:

1. Create a file named `.env.local` in the root directory (if it doesn't exist)

2. Add these lines (replace with your actual values):

```env
# Required: thirdweb Client ID
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Your deployed PredictionMarket contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# USDC on Sonic Mainnet (already configured)
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
```

**Important**: 
- Replace `your_client_id_here` with your actual thirdweb Client ID
- Replace `0xYourDeployedContractAddress` with the address you copied from Step 2

## Step 4: Restart Your Dev Server

After updating `.env.local`:

```bash
npm run dev
```

## ✅ You're Done!

Your app should now be connected to your deployed contract on Sonic Mainnet!

## Next Steps

1. **Create your first market**: Use the `createMarket()` function in your contract
2. **Test the flow**: Buy shares, resolve markets, claim winnings
3. **Get USDC**: Users will need USDC on Sonic to participate

## Troubleshooting

### "Network not found"
- Make sure Sonic Mainnet is added to your wallet
- Check that you're using the correct RPC: `https://rpc.soniclabs.com`

### "Insufficient funds"
- Make sure you have Sonic tokens (S) for gas fees

### Contract not working in app
- Verify the contract address in `.env.local` is correct
- Make sure you restarted the dev server after updating `.env.local`
- Check that you're connected to Sonic Mainnet in the app


