# Simple Prediction Market dApp

A decentralized prediction market application built with Next.js and thirdweb, allowing users to bet on future outcomes with blockchain transparency and immutability.

## What Are Prediction Markets?

Prediction markets are platforms where users can purchase shares in the potential outcomes of future events. Each prediction market includes:

- **Expiration date**: When the market closes and no more shares can be purchased
- **Question**: The event being predicted (e.g., "Will Bitcoin hit $100k by tomorrow?")
- **Choices**: The possible outcomes users can bet on (e.g., "Yes" or "No")

This project follows a **fixed model**, where:
- Each share costs exactly 1 token
- Buyers of the winning outcome split the shares from the losing side

For example, if users buy 12 shares of Option A and 6 shares of Option B, and Option A is correct, each share of Option A receives 0.5 additional shares from Option B's pool.

## Features

### User Authentication
- Web2-style login with smart wallets (email, passkeys, or social accounts)
- No gas fees for users (sponsored transactions via account abstraction)
- Automatic smart wallet creation

### Market Dashboard
- **Active Markets**: Markets that are still accepting bets
- **Pending Markets**: Markets that have expired and are awaiting resolution
- **Resolved Markets**: Markets where users can claim their rewards

### Market Interaction
- View market questions, options, and current share distribution
- Purchase shares of outcomes with real-time progress visualization
- View your current shares and potential winnings
- Claim rewards from winning bets on resolved markets

### Token Management
- Mint demo tokens via thirdweb Engine
- Automatic token approval flow for purchases
- Display token balance in wallet

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Blockchain**: thirdweb SDK v5
- **Network**: Sonic Mainnet (Chain ID 146)
- **Currency**: USDC (0x29219dd400f2Bf60E5a23d13Be72B486D4038894)
- **Wallet**: In-app wallet with account abstraction

## Smart Contracts

This project uses **your own smart contracts** deployed on any EVM-compatible chain. The contract source code is included in the `contracts/` directory.

### Contract Files

- **`contracts/PredictionMarket.sol`** - Main prediction market contract
- **`contracts/PredictToken.sol`** - Optional ERC20 token (not needed if using USDC)

**Note**: This project is configured to use **USDC on Sonic Mainnet** (`0x29219dd400f2Bf60E5a23d13Be72B486D4038894`). The PredictToken contract is only needed if you want to create a custom token.

### Deploying Your Contracts

> 📝 **New to deploying?** See the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for step-by-step instructions.

**Quick Deploy (Sonic Mainnet with USDC):**
1. Install dependencies: `npm install @openzeppelin/contracts`
2. Deploy market: `npx thirdweb deploy` → Select `PredictionMarket.sol`
3. Constructor parameter: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` (USDC address)
4. Update `.env.local` with your contract address

> 📖 See [SONIC_DEPLOYMENT.md](./contracts/SONIC_DEPLOYMENT.md) for detailed Sonic deployment instructions.

The app will automatically use your deployed contracts via environment variables.

### Key Contract Functions

- `marketCount()` - Get total number of markets
- `getMarketInfo(uint256 _marketId)` - Get market details (question, options, endTime, outcome, shares, resolved status)
- `buyShares(uint256 _marketId, bool _isOptionA, uint256 _amount)` - Purchase shares for a market
- `claimWinnings(uint256 _marketId)` - Claim rewards from a resolved market
- `getSharesBalance(uint256 _marketId, address _user)` - Get user's share balance for a market

## Getting Started

> 📖 **New to this project?** Check out the detailed [Getting Started Guide](./GETTING_STARTED.md) for step-by-step instructions.

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up thirdweb credentials:**
   - Create a [thirdweb account](https://thirdweb.com) (free)
   - Get your Client ID from the [dashboard](https://thirdweb.com/dashboard)
   - Set up [thirdweb Engine](https://portal.thirdweb.com/engine) for token minting

3. **Create `.env.local` file:**
```env
# Required
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id

# Your deployed contract addresses (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourPredictionMarketAddress
# USDC on Sonic (default, can be overridden)
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894

# Optional: For token minting feature
BACKEND_WALLET_ADDRESS=your_backend_wallet
ENGINE_URL=https://your-engine.thirdweb.com
THIRDWEB_SECRET_KEY=your_secret_key
```

> 💡 **Note:** If you haven't deployed contracts yet, the app will use default testnet addresses. See [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy your own.

4. **Run the dev server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **thirdweb Account** - [Sign up free](https://thirdweb.com)
  - Client ID (for wallet connection)
  - Engine setup (for token minting feature)

## Environment Variables

Create a `.env.local` file with the following variables:

### Required
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Your thirdweb client ID (get from [thirdweb dashboard](https://thirdweb.com/dashboard))
  - **Required for:** Wallet connection, app functionality
  - **Get it:** Dashboard → Settings → API Keys → Client ID

### Contract Addresses (After Deployment)
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed PredictionMarket contract address
- `NEXT_PUBLIC_TOKEN_ADDRESS`: Your deployed PredictToken contract address
  - **Note:** If not set, defaults to testnet addresses will be used

### Optional (Only for "Claim Tokens" feature)
- `BACKEND_WALLET_ADDRESS`: Your backend wallet address for token minting
- `ENGINE_URL`: Your thirdweb Engine URL (e.g., `https://your-engine.thirdweb.com`)
- `THIRDWEB_SECRET_KEY`: Your thirdweb secret key for Engine API calls

> 💡 **Note:** You can run the app with just the Client ID! The Engine credentials are only needed if you want the "Claim Tokens" button to work. See [THIRDWEB_CREDENTIALS.md](./THIRDWEB_CREDENTIALS.md) for details.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── claimToken/      # API route for minting demo tokens
│   ├── client.ts            # thirdweb client configuration
│   ├── layout.tsx           # Root layout with ThirdwebProvider
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── enhanced-prediction-market-dashboard.tsx  # Main dashboard component
│   ├── marketCard.tsx       # Individual market card
│   ├── market-buy-interface.tsx  # Share purchase interface
│   ├── market-progress.tsx  # Progress bar showing share distribution
│   ├── market-resolved.tsx  # Resolved market UI with claim button
│   ├── market-pending.tsx   # Pending resolution UI
│   ├── market-shares-display.tsx  # User shares and winnings display
│   ├── market-time.tsx      # Market expiration time display
│   ├── navbar.tsx           # Navigation with wallet connection
│   └── ui/                  # Reusable UI components (shadcn/ui)
├── constants/
│   └── contract.ts          # Contract addresses and configuration
└── types/
    └── types.ts             # TypeScript type definitions
```

## How It Works

1. **Connect Wallet**: Users sign in with email/passkey/social account (no traditional wallet needed)
2. **Claim Tokens**: Get demo tokens to participate in markets
3. **Browse Markets**: View active, pending, and resolved markets
4. **Buy Shares**: Select an option, enter amount, approve tokens, and purchase shares
5. **View Progress**: See real-time share distribution and your holdings
6. **Claim Rewards**: After market resolution, claim your winnings if you bet correctly

## Account Abstraction & Gas Sponsorship

This app uses thirdweb's account abstraction features to provide a seamless user experience:

- **Smart Wallets**: Automatically created for users
- **Gas Sponsorship**: All transactions are sponsored, so users don't need ETH
- **Web2 Login**: Familiar sign-in methods (email, Google, etc.)

## Building for Production

```bash
npm run build
npm start
```

## Learn More

- [thirdweb Documentation](https://portal.thirdweb.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Building a Simple Prediction Market Tutorial](https://blog.thirdweb.com/guides/building-a-simple-prediction-market-dapp-with-thirdweb/)

## License

This project is open source and available under the MIT License.
