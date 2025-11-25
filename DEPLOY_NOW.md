# 🚀 Deploy to Vercel Now - Quick Guide

## ✅ You're Ready! Here's What to Do:

### Step 1: Push Code to GitHub (if not already)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Go to Vercel

1. Visit: **https://vercel.com**
2. Click **"Sign Up"** (or "Log In" if you have an account)
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize Vercel

### Step 3: Import Your Project

1. Click **"Add New Project"**
2. Select your GitHub repository
3. Vercel will auto-detect Next.js ✅
4. Click **"Import"**

### Step 4: Add Environment Variables ⚠️ IMPORTANT

**BEFORE clicking Deploy**, add these environment variables:

In the "Environment Variables" section, add these **6 variables**:

#### Copy & Paste These:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
```

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
```

```env
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
```

```env
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
```

```env
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
```

```env
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

**For each variable:**
1. Click **"Add Another"**
2. Paste the variable name (left side)
3. Paste the value (right side)
4. Select **All Environments** (Production, Preview, Development)

### Step 5: Deploy!

1. Scroll down and click **"Deploy"**
2. Wait 2-3 minutes
3. 🎉 Your app is live!

### Step 6: Verify

Your app will be at: `https://your-project-name.vercel.app`

Test:
- ✅ App loads
- ✅ Wallet connection works
- ✅ Token minting works

## 📋 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS`
- [ ] `NEXT_PUBLIC_TOKEN_ADDRESS`
- [ ] `ENGINE_URL`
- [ ] `THIRDWEB_SECRET_KEY`
- [ ] `BACKEND_WALLET_ADDRESS`

## ⚠️ Important Notes

1. **Verify ENGINE_URL**: Check your Engine dashboard to confirm the URL is correct
2. **No spaces**: When pasting values, make sure there are no extra spaces
3. **All environments**: Set variables for Production, Preview, AND Development
4. **Restart if needed**: If you add variables after deployment, restart the deployment

## 🔧 If Build Fails

1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing environment variables → Add them and redeploy
   - TypeScript errors → The lint warnings we saw won't block deployment

## 📚 Full Documentation

- **Detailed Guide**: See [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)
- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**That's it!** Deploy now and your app will be live in minutes! 🚀

