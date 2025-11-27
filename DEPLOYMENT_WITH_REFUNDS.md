# 🚀 Deployment Guide: Contract with Refund Feature

## Overview

This guide will help you deploy the updated PredictionMarket contract with refund functionality and roll out the UI changes.

## Prerequisites

- ✅ Contract compiled successfully (`npm run compile`)
- ✅ Frontend components updated
- ✅ Wallet with Sonic (S) tokens for gas
- ✅ Admin wallet ready (for contract ownership)

## Step 1: Deploy the New Contract

### Option A: Using thirdweb CLI (Recommended)

```bash
npx thirdweb deploy
```

1. **Select Contract**: Choose `contracts/PredictionMarket.sol`
2. **Connect Wallet**: Connect your admin wallet
3. **Select Network**: Choose **Sonic Mainnet** (Chain ID: 146)
4. **Constructor Parameter**: Enter USDC address
   ```
   0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   ```
5. **Deploy**: Click deploy and wait for confirmation
6. **Copy Address**: 📋 Save the new contract address!

### Option B: Using Hardhat (Alternative)

```bash
npm run deploy:sonic
```

Make sure your `hardhat.config.js` has Sonic network configured and you have enough gas tokens.

## Step 2: Verify Deployment

1. **Check on Sonic Explorer**:
   - Visit: https://sonicscan.org (or your Sonic explorer)
   - Search for your contract address
   - Verify it's deployed on Sonic Mainnet

2. **Verify Contract Functions**:
   - Check `claimRefund()` function exists
   - Verify `resolveMarket()` accepts outcome 3

## Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# Existing variables (keep these)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894

# ⚠️ UPDATE THIS with your new contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS_HERE

# Engine (if using)
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

**Important**: The old contract address (`0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B`) will still work, but won't have refund functionality.

## Step 4: Test the Deployment

### Local Testing

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Test Refund Flow**:
   - Create a test market
   - Buy shares (Option A and/or B)
   - As admin, resolve with "Refund" option
   - Claim refund (should get full deposit back, no fee)

3. **Test Normal Resolution**:
   - Create another test market
   - Buy shares
   - Resolve with Option A or B
   - Claim winnings (should have 10% fee deducted)

### Checklist

- [ ] Contract deployed successfully
- [ ] Contract address updated in `.env.local`
- [ ] Dev server restarted
- [ ] Can create markets
- [ ] Can buy shares
- [ ] Can resolve as refund (outcome 3)
- [ ] Can claim refund (full amount, no fee)
- [ ] Can resolve normally (outcome 1 or 2)
- [ ] Can claim winnings (with 10% fee)

## Step 5: Production Deployment

### Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` with your new contract address
4. **Redeploy** the application

### Or via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production
# Enter: 0xYOUR_NEW_CONTRACT_ADDRESS_HERE
```

## Migration Notes

### Important Considerations

1. **Old Contract Still Active**:
   - The old contract at `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` still has funds
   - Users need to claim winnings from old markets before migrating
   - Old markets cannot be refunded (no refund feature)

2. **New Markets Only**:
   - Only markets created on the new contract can use refunds
   - Old markets will continue to use the old contract

3. **No Automatic Migration**:
   - Markets are not automatically migrated
   - Old markets stay on old contract
   - New markets use new contract

### Recommended Approach

1. **Wait for Old Markets to Settle**:
   - Let users claim winnings from resolved markets
   - Resolve any pending markets

2. **Create New Markets on New Contract**:
   - All new markets will have refund capability
   - Old markets remain accessible via old contract address

3. **Update Documentation**:
   - Notify users about new contract
   - Explain refund feature availability

## Rollback Plan

If issues occur:

1. **Revert Environment Variable**:
   - Change `NEXT_PUBLIC_CONTRACT_ADDRESS` back to old address
   - Redeploy

2. **Frontend Changes are Backward Compatible**:
   - UI will work with old contract
   - Refund button will just fail (old contract doesn't have it)
   - Normal resolution still works

## Support

If you encounter issues:

1. Check contract deployment on explorer
2. Verify environment variables
3. Check browser console for errors
4. Verify wallet is connected to Sonic Mainnet

## Next Steps After Deployment

1. ✅ Create first market on new contract
2. ✅ Test refund functionality thoroughly
3. ✅ Monitor for any issues
4. ✅ Update users about refund feature
5. ✅ Document refund process for admins

---

**Ready to deploy?** Follow the steps above and you'll have refund functionality live! 🚀

