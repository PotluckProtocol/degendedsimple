# 🚨 Quick Fix: Invalid Outcome Error on Vercel

## The Problem

You're getting "invalid outcome" error on Vercel because it's using the **old contract** that doesn't support refunds (outcome 3).

## The Solution (3 Steps)

### Step 1: Update Environment Variable

Go to Vercel Dashboard:
1. **Visit**: https://vercel.com/dashboard
2. Click your project
3. **Settings** → **Environment Variables**
4. Find: `NEXT_PUBLIC_CONTRACT_ADDRESS`
5. **Edit** and change to:
   ```
   0xC04c1DE26F5b01151eC72183b5615635E609cC81
   ```
6. Save

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait ~2 minutes

### Step 3: Test

1. Open your Vercel URL
2. Try refund feature
3. Should work! ✅

---

## Why This Happened

- **Local**: Using new contract ✅ (supports outcome 3)
- **Vercel**: Using old contract ❌ (only supports outcome 1, 2)

The error message `"Invalid outcome: 1=OptionA, 2=OptionB, 3=Refund"` comes from the new contract, but if you're seeing just "invalid outcome", it's the old contract rejecting outcome 3.

---

## Contract Addresses

| Contract | Address | Refunds? |
|----------|---------|----------|
| **Old** | `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` | ❌ No |
| **New** | `0xC04c1DE26F5b01151eC72183b5615635E609cC81` | ✅ Yes |

**Update Vercel to use the NEW address!**


