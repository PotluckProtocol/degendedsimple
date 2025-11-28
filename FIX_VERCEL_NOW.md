# 🚨 FIX: Invalid Outcome Error on Vercel

## Problem

Refund feature works locally but fails on Vercel with "invalid outcome" error.

**Root Cause**: Vercel environment variable `NEXT_PUBLIC_CONTRACT_ADDRESS` is pointing to the **old contract** that doesn't support refunds.

---

## The Fix (5 Minutes)

### Step 1: Open Vercel Dashboard

Go to: **https://vercel.com/dashboard**

### Step 2: Navigate to Environment Variables

1. Click your project
2. Go to **Settings** tab
3. Click **Environment Variables** in sidebar

### Step 3: Update Contract Address

Find this variable:
```
NEXT_PUBLIC_CONTRACT_ADDRESS
```

**Change from:**
```
0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
```

**Change to:**
```
0xC04c1DE26F5b01151eC72183b5615635E609cC81
```

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Confirm redeploy

### Step 5: Wait & Test

- Wait 2-3 minutes for redeploy
- Test refund feature on Vercel
- Should work! ✅

---

## Why This Happens

| Environment | Contract Address | Supports Outcome 3? |
|------------|------------------|---------------------|
| **Local** | `0xC04c1DE26F5b01151eC72183b5615635E609cC81` ✅ | Yes |
| **Vercel** | `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` ❌ | No |

When you try to resolve with outcome 3 (refund) on Vercel, the old contract rejects it because it only accepts 1 or 2.

---

## Verification

After updating, you can verify:

1. Check the contract address in browser console on Vercel
2. Should see: `0xC04c1DE26F5b01151eC72183b5615635E609cC81`
3. Try refund resolution - should work!

---

**That's it! Update the env var and redeploy.** 🚀


