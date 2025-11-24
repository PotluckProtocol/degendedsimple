# Sonic Mainnet Deployment Guide

This guide is specifically for deploying the Prediction Market contract on **Sonic Mainnet**.

## Network Information

- **Chain Name**: Sonic
- **Chain ID**: 146
- **RPC URL**: https://rpc.soniclabs.com
- **Currency**: USDC (0x29219dd400f2Bf60E5a23d13Be72B486D4038894)

## Prerequisites

1. **Wallet with Sonic tokens** for gas fees
2. **USDC on Sonic** - Users will need USDC to participate in markets
3. **thirdweb account** (free) - [Sign up here](https://thirdweb.com)

## Deployment Steps

### Step 1: Install Dependencies

```bash
npm install @openzeppelin/contracts
```

### Step 2: Deploy PredictionMarket Contract

Since we're using USDC (already deployed), you only need to deploy the PredictionMarket contract:

```bash
npx thirdweb deploy
```

1. Select `contracts/PredictionMarket.sol`
2. Connect your wallet
3. **Add Sonic Mainnet to your wallet** if not already added:
   - Network Name: Sonic
   - RPC URL: https://rpc.soniclabs.com
   - Chain ID: 146
   - Currency Symbol: S
4. Select **Sonic Mainnet** (Chain ID 146)
5. Enter constructor parameter: **`0x29219dd400f2Bf60E5a23d13Be72B486D4038894`** (USDC address)
6. Deploy and **copy the contract address** 📋

### Step 3: Update Environment Variables

Add to your `.env.local`:

```env
# Required
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id

# Your deployed PredictionMarket contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourPredictionMarketAddress

# USDC address on Sonic (already set as default)
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

## Important Notes

### USDC Token

- **Contract Address**: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
- **Decimals**: 6 (standard USDC)
- Users need to have USDC in their wallet to participate
- Users must approve the PredictionMarket contract to spend their USDC

### Gas Fees

- Gas is paid in Sonic's native token (S)
- Make sure you have enough S tokens in your wallet for deployment
- Users will need S tokens for gas (unless using account abstraction with gas sponsorship)

### Account Abstraction

The app is configured to use thirdweb's account abstraction with gas sponsorship. This means:
- Users can interact without holding native tokens
- Gas fees can be sponsored (if configured in thirdweb dashboard)
- Users only need USDC to participate

## Testing After Deployment

1. **Verify contract deployment** on Sonic explorer
2. **Create a test market** using `createMarket()` function
3. **Get test USDC** (if available on Sonic) or use real USDC
4. **Test buying shares** with USDC
5. **Test resolving and claiming** winnings

## Contract Functions

### For Market Creation (Owner Only)

```solidity
createMarket(
    string memory _question,    // e.g., "Will Bitcoin hit $100k?"
    string memory _optionA,      // e.g., "Yes"
    string memory _optionB,      // e.g., "No"
    uint256 _endTime            // Unix timestamp
)
```

### For Users

- `buyShares(uint256 _marketId, bool _isOptionA, uint256 _amount)` - Buy shares with USDC
- `claimWinnings(uint256 _marketId)` - Claim rewards after market resolution
- `getSharesBalance(uint256 _marketId, address _user)` - Check your shares

## Troubleshooting

### "Token transfer failed"
- User needs to approve USDC spending first
- Check user has enough USDC balance
- Verify USDC contract address is correct

### "Insufficient funds for gas"
- User needs Sonic native tokens (S) for gas
- Or enable gas sponsorship in thirdweb dashboard

### Contract not found
- Verify contract address in `.env.local`
- Make sure you're connected to Sonic mainnet
- Check contract was deployed successfully

## Next Steps

After deployment:
1. ✅ Create your first market
2. ✅ Test the full flow (buy → resolve → claim)
3. ✅ Set up gas sponsorship (optional)
4. ✅ Launch to users!


