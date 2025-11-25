# Testing Checklist

## ✅ Setup Complete!

Your local development environment is fully configured and running:

### Running Services
- ✅ **Next.js App**: http://localhost:3000
- ✅ **Local Engine**: http://localhost:3005
- ✅ **PostgreSQL**: Running (database for Engine)
- ✅ **Redis**: Running (caching for Engine)

### Features Ready to Test

#### 1. Wallet Connection
- Connect wallet using thirdweb's ConnectButton
- Supports email, social login, or traditional wallets
- Smart wallet creation (no gas fees for users)

#### 2. Token Minting (Claim Tokens)
- Click "Claim Tokens" button (if available in UI)
- Mints 100 tokens via local Engine instance
- Backend wallet: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`

#### 3. Market Interactions
- View active, pending, and resolved markets
- Buy shares in prediction markets
- Claim rewards from resolved markets

### Quick Commands

```bash
# Check Engine status
npm run engine:status

# View Engine logs
npm run engine:logs

# Stop Engine (when done testing)
npm run engine:stop

# Start Engine again
npm run engine:start
```

### Troubleshooting

**If Engine stops:**
```bash
npm run engine:start
```

**If you need to restart everything:**
```bash
npm run engine:stop
npm run engine:start
npm run dev  # in another terminal
```

### Next Steps

1. Test wallet connection
2. Test token minting feature
3. Create a test market (if admin)
4. Buy shares and test market interactions
5. Test reward claiming

### Notes

- All transactions use Sonic Mainnet (Chain ID: 146)
- USDC token: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
- Market contract: `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B`
- Local Engine is for development only (not for production)

Happy testing! 🚀

