# Understanding thirdweb Credentials

## What Each Credential Is Used For

### 1. `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` ⚠️ **REQUIRED**

**Used for:**
- Wallet connection (ConnectButton component)
- In-app wallet authentication (email, social login)
- Account abstraction (smart wallets)
- Gas sponsorship setup
- Reading from smart contracts

**Where it's used:**
- `src/app/client.ts` - Creates the thirdweb client
- `src/components/navbar.tsx` - ConnectButton component

**Can you skip it?** ❌ **NO** - The app won't work without this. It's essential for wallet connection.

---

### 2. Engine Credentials (OPTIONAL - Only for "Claim Tokens" feature)

These three credentials are **ONLY** needed if you want the "Claim Tokens" button to work:

#### `ENGINE_URL`
- Used for: Calling thirdweb Engine API to mint tokens
- Location: `src/app/api/claimToken/route.ts`

#### `THIRDWEB_SECRET_KEY`
- Used for: Authenticating with thirdweb Engine API
- Location: `src/app/api/claimToken/route.ts`

#### `BACKEND_WALLET_ADDRESS`
- Used for: Wallet that signs the token minting transaction
- Location: `src/app/api/claimToken/route.ts`

**Can you skip them?** ✅ **YES** - If you don't need the token minting feature, you can:
- Remove or hide the "Claim Tokens" button
- Users can still interact with markets if they already have tokens
- Or manually send tokens to test wallets

---

## Minimum Setup (Without Token Minting)

If you want to test the app without setting up Engine:

1. **Only set:**
   ```env
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
   ```

2. **Comment out or remove the "Claim Tokens" button** in `src/components/navbar.tsx` (lines 48-63)

3. **Get test tokens another way:**
   - Use a faucet to get tokens
   - Manually send tokens to test wallets
   - Or set up Engine later

---

## Deploying Contracts with `npx thirdweb deploy`

### Can we find contracts here?

❌ **No contract files in this repo** - This is frontend-only code.

The contracts are already deployed at:
- Prediction Market: `0x124D803F8BC43cE1081110a08ADd1cABc5c83a3f`
- ERC20 Token: `0x4D9604603527322F44c318FB984ED9b5A9Ce9f71`

### To deploy your own contracts:

1. **Create contract files** (`.sol` files) in a `contracts/` directory
2. **Run:**
   ```bash
   npx thirdweb deploy
   ```
3. **This will:**
   - Compile your contracts
   - Open a browser interface
   - Let you deploy to any chain
   - **No credentials needed** - uses your connected wallet

### What contracts do you need?

Based on the code, you need:

1. **Prediction Market Contract** with functions:
   - `marketCount() returns (uint256)`
   - `getMarketInfo(uint256) returns (string, string, string, uint256, uint8, uint256, uint256, bool)`
   - `buyShares(uint256, bool, uint256)`
   - `claimWinnings(uint256)`
   - `getSharesBalance(uint256, address) returns (uint256, uint256)`

2. **ERC20 Token Contract** for payments

### Getting Contract Source Code

You have a few options:

1. **Use thirdweb's contract templates:**
   ```bash
   npx thirdweb create --contract
   ```
   - Choose "ERC20" for the token
   - You'll need to write the prediction market contract yourself

2. **Find the original contract** from the tutorial:
   - Check the [tutorial blog post](https://blog.thirdweb.com/guides/building-a-simple-prediction-market-dapp-with-thirdweb/)
   - Look for contract source code in their GitHub repo

3. **Write your own** based on the function signatures in the code

---

## Summary

| Credential | Required? | Used For |
|------------|-----------|----------|
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | ✅ **YES** | Wallet connection, app functionality |
| `ENGINE_URL` | ⚠️ Optional | Token minting feature only |
| `THIRDWEB_SECRET_KEY` | ⚠️ Optional | Token minting feature only |
| `BACKEND_WALLET_ADDRESS` | ⚠️ Optional | Token minting feature only |

**For contract deployment:**
- Use `npx thirdweb deploy` (no credentials needed)
- Need contract source code (`.sol` files)
- Contracts not included in this repo

