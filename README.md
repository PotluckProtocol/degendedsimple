# DEGENDED MARKETS

A decentralized prediction market application on Sonic Mainnet. Bet on future outcomes with blockchain transparency.

## Features

- **Market Creation**: Contract owner can create new prediction markets
- **Share Trading**: Buy shares in market outcomes using USDC
- **Early Resolution**: Admin can resolve markets before expiration
- **Reward Claims**: Claim winnings from resolved markets (10% protocol fee)
- **Dark Mode UI**: Modern, pixelated design with dark theme

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Blockchain**: thirdweb SDK v5
- **Network**: Sonic Mainnet (Chain ID 146)
- **Currency**: USDC (6 decimals)

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create `.env.local`:
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
```

3. **Run dev server:**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Contract Details

- **Prediction Market Contract**: `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B`
- **USDC Token**: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
- **Protocol Fee**: 10% (goes to admin wallet)
- **Admin Wallet**: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`

## Contract Deployment

To deploy new contracts, see:
- `contracts/README.md` - Contract documentation
- `contracts/SONIC_DEPLOYMENT.md` - Sonic-specific deployment guide

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── constants/        # Contract addresses & chain config
├── lib/             # Utilities (USDC helpers, etc.)
└── types/           # TypeScript types
```

## License

MIT
