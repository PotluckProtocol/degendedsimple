# Wallet Connection Fix

## Changes Made

1. **Added External Wallet Support**:
   - MetaMask (primary option)
   - Coinbase Wallet
   - WalletConnect
   - In-app wallet (email/social login) - as fallback

2. **Removed Account Abstraction**:
   - Gas sponsorship might not be fully supported on Sonic mainnet
   - Users will need Sonic tokens (S) for gas fees

## How to Connect

### Option 1: MetaMask (Recommended)
1. Install MetaMask browser extension
2. Click "Sign In" button
3. Select "MetaMask" from the wallet options
4. Approve the connection

### Option 2: Other External Wallets
- Coinbase Wallet
- Any WalletConnect-compatible wallet

### Option 3: In-App Wallet (Email/Social)
- If email verification fails, try using an external wallet instead
- In-app wallets may have limited support on Sonic mainnet

## Troubleshooting

### "Failed to send verification code"
- **Solution**: Use MetaMask or another external wallet instead
- In-app wallet email verification may not work on Sonic mainnet

### No wallet options showing
- Make sure you have a wallet extension installed (MetaMask recommended)
- Refresh the page
- Check browser console for errors

### Can't connect MetaMask
- Make sure MetaMask is installed and unlocked
- Add Sonic Mainnet to MetaMask:
  - Network Name: Sonic
  - RPC URL: https://rpc.soniclabs.com
  - Chain ID: 146
  - Currency Symbol: S

## Next Steps

1. **Install MetaMask** (if you haven't): https://metamask.io
2. **Add Sonic Mainnet** to MetaMask
3. **Refresh the page** and try connecting again
4. **Use MetaMask** as your primary wallet option


