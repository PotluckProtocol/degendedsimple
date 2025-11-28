# 🚨 Fix Vercel "Invalid Outcome" Error

## The Problem

You're getting an "invalid outcome" error on https://www.degended.bet/ because:

1. **Vercel is using the OLD contract** that doesn't support refunds (outcome 3)
2. The old contract only accepts outcomes 1 or 2
3. Your code is trying to resolve with outcome 3 (refund)

## The Solution

### Step 1: Check Which Contract is Active

I've added a debug component that will show on your site. It will display:
- ✅ Green = New contract (supports refunds)
- ❌ Red = Old contract (NO refunds)

Visit https://www.degended.bet/ and look for the blue box at the top showing the contract address.

### Step 2: Update Vercel Environment Variable

**This is REQUIRED:**

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **degendedsimple** (or whatever it's named)
3. Go to: **Settings** → **Environment Variables**
4. Find: `NEXT_PUBLIC_CONTRACT_ADDRESS`
5. **Edit** it and change to:
   ```
   0xC04c1DE26F5b01151eC72183b5615635E609cC81
   ```
6. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
7. Click **Save**

### Step 3: Redeploy

After updating the env var, you have two options:

**Option A: Automatic (Recommended)**
- Push the new code to GitHub:
  ```bash
  git push origin main
  ```
- Vercel will auto-redeploy

**Option B: Manual**
- Go to Vercel Dashboard → Your Project → **Deployments**
- Click the **3 dots** on the latest deployment
- Select **Redeploy**

### Step 4: Verify

1. Visit https://www.degended.bet/
2. Check the blue debug box at the top
3. It should show: **✅ New (with refunds)**
4. Try resolving a market with refund - should work! ✅

---

## Quick Reference

| Contract | Address | Supports Refunds? |
|----------|---------|-------------------|
| **OLD** | `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` | ❌ No |
| **NEW** | `0xC04c1DE26F5b01151eC72183b5615635E609cC81` | ✅ Yes |

**Update Vercel to use the NEW address!**

---

## Why This Happened

Even though the code defaults to the new contract, **Vercel environment variables override code defaults**. So if Vercel has the old address set, it will use that.

After updating the env var and redeploying, the refund feature will work! 🎉


