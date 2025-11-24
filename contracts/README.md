# Smart Contracts

This directory contains the Solidity smart contracts for the Prediction Market dApp.

## Contracts

### 1. PredictToken.sol (Optional)
- **Purpose**: ERC20 token used for purchasing shares in prediction markets
- **Features**:
  - Standard ERC20 implementation using OpenZeppelin
  - Owner can mint tokens for distribution
  - Initial supply: 1,000,000 PREDICT tokens
- **Note**: Not needed if using an existing token like USDC on Sonic mainnet

### 2. PredictionMarket.sol
- **Purpose**: Main contract managing prediction markets
- **Features**:
  - Create markets with questions and two options
  - Buy shares for either option using any ERC20 token
  - Resolve markets (owner only)
  - Claim winnings proportional to shares held
- **Current Configuration**: Uses USDC on Sonic Mainnet
  - USDC Address: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`

## Dependencies

These contracts use OpenZeppelin contracts:
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/token/ERC20/ERC20.sol`
- `@openzeppelin/contracts/access/Ownable.sol`

## Deployment

### Prerequisites
1. Node.js and npm installed
2. A wallet with testnet tokens (for gas fees)
3. thirdweb CLI installed (comes with `npx`)

### Steps

1. **Install dependencies** (if using npm):
   ```bash
   npm install @openzeppelin/contracts
   ```

2. **Deploy using thirdweb**:
   ```bash
   npx thirdweb deploy
   ```
   
   This will:
   - Compile your contracts
   - Open a browser interface
   - Let you deploy to any chain
   - No credentials needed - uses your connected wallet

3. **Deployment Order**:
   - **For Sonic Mainnet with USDC**: 
     - Only deploy `PredictionMarket.sol`
     - Constructor parameter: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` (USDC address)
     - See [SONIC_DEPLOYMENT.md](./SONIC_DEPLOYMENT.md) for details
   - **For custom token**:
     - **First**: Deploy `PredictToken.sol` (you'll need the token address for the market contract)
     - **Second**: Deploy `PredictionMarket.sol` (pass the token address as constructor parameter)

4. **After Deployment**:
   - Copy the deployed contract addresses
   - Update your `.env.local` file with the addresses (see main README)
   - Or update `src/constants/contract.ts` directly

## Contract Functions

### PredictToken
- `mint(address to, uint256 amount)` - Owner can mint tokens

### PredictionMarket
- `createMarket(string question, string optionA, string optionB, uint256 endTime)` - Owner creates a market
- `getMarketInfo(uint256 marketId)` - Get market details
- `buyShares(uint256 marketId, bool isOptionA, uint256 amount)` - Buy shares
- `resolveMarket(uint256 marketId, uint8 outcome)` - Owner resolves market (1 = optionA, 2 = optionB)
- `claimWinnings(uint256 marketId)` - Claim rewards from resolved market
- `getSharesBalance(uint256 marketId, address user)` - Get user's shares
- `marketCount()` - Get total number of markets

## Testing

After deployment, you can:
1. **For custom token**: Mint tokens to test wallets using `mint()`
2. **For USDC**: Users need to acquire USDC on Sonic mainnet
3. Create test markets using `createMarket()`
4. Test buying shares and claiming winnings

## Sonic Mainnet

This project is configured for **Sonic Mainnet**:
- **Chain ID**: 146
- **RPC**: https://rpc.soniclabs.com
- **Currency**: USDC (0x29219dd400f2Bf60E5a23d13Be72B486D4038894)

See [SONIC_DEPLOYMENT.md](./SONIC_DEPLOYMENT.md) for Sonic-specific deployment instructions.

## Security Notes

- Markets can only be resolved by the contract owner
- Users must approve token spending before buying shares
- Winnings are calculated proportionally based on shares held
- Once claimed, shares are reset to prevent double claiming

