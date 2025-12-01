# 🔧 Fix Vercel "Invalid Outcome" Error

## Problem

The refund feature works locally but fails on Vercel with "invalid outcome" error.

**Root Cause**: Vercel is using the **old contract address** which doesn't support outcome 3 (refund).

## Solution

Update the `NEXT_PUBLIC_CONTRACT_ADDRESS` environment variable on Vercel to the new contract.

---

## Quick Fix Steps

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Update Contract Address

Find the variable: `NEXT_PUBLIC_CONTRACT_ADDRESS`

**Current (OLD - no refunds):**
```
0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
```

**Update to (NEW - with refunds):**
```
0xC04c1DE26F5b01151eC72183b5615635E609cC81
```

### Step 3: Redeploy

After updating the environment variable:

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger redeploy

---

## Alternative: Via Vercel CLI

```bash
# Update environment variable
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production

# When prompted, enter:
# 0xC04c1DE26F5b01151eC72183b5615635E609cC81

# Redeploy
vercel --prod
```

---

## Verify Fix

After redeploying, test:
1. Go to your Vercel URL
2. Create a test market
3. Try resolving as refund
4. Should work without "invalid outcome" error

---

## Contract Addresses Reference

| Environment | Address | Has Refunds? |
|------------|---------|--------------|
| **Local** (updated) | `0xC04c1DE26F5b01151eC72183b5615635E609cC81` | ✅ Yes |
| **Vercel** (needs update) | `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` | ❌ No |
| **New** (with refunds) | `0xC04c1DE26F5b01151eC72183b5615635E609cC81` | ✅ Yes |

---

**After updating, the refund feature will work on Vercel!** 🎉



