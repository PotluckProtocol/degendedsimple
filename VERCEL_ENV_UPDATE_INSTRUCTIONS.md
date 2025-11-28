# 🚀 Deploy to Vercel - Final Steps

## Current Status

✅ **Code is ready** - All refund feature code is in place
✅ **Contract deployed** - New contract with refunds: `0xC04c1DE26F5b01151eC72183b5615635E609cC81`
✅ **Local tested** - Refund feature works locally

## What You Need to Do

### Step 1: Update Vercel Environment Variable

**This is REQUIRED** - Vercel needs to know about the new contract address.

1. Go to: **https://vercel.com/dashboard**
2. Click your project
3. **Settings** → **Environment Variables**
4. Find: `NEXT_PUBLIC_CONTRACT_ADDRESS`
5. **Edit** and change to:
   ```
   0xC04c1DE26F5b01151eC72183b5615635E609cC81
   ```
6. Make sure it's set for **Production**, **Preview**, and **Development**
7. **Save**

### Step 2: Push to GitHub

After updating the env var, push the code:

```bash
git add .
git commit -m "Add refund feature and update contract"
git push origin main
```

Vercel will automatically redeploy when you push.

### Step 3: Verify Deployment

1. Wait 2-3 minutes for Vercel to build
2. Check your Vercel URL
3. Test refund feature - should work! ✅

---

## Why This is Needed

Vercel environment variables are **NOT stored in GitHub** for security reasons. They must be set in the Vercel dashboard.

The code is ready - it just needs the correct contract address in Vercel's environment variables.

---

## Quick Reference

**Old Contract** (no refunds):
```
0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
```

**New Contract** (with refunds):
```
0xC04c1DE26F5b01151eC72183b5615635E609cC81
```

**Update Vercel to use the NEW address!**


