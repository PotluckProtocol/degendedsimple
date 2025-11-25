# 🚀 Vercel Deployment Checklist

Everything you need to deploy your app to Vercel!

## ✅ Pre-Deployment Checklist

### 1. Code is Ready
- [x] Code is working locally
- [x] Build completes successfully
- [x] All dependencies installed

### 2. Environment Variables Ready

You need to add these to Vercel's environment variables:

#### Required Environment Variables:

```env
# Client Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894

# Engine Configuration (Production)
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

> ⚠️ **Important**: Verify `ENGINE_URL` from your Engine dashboard first!

## 📋 Deployment Steps

### Step 1: Push Code to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Create Vercel Account

1. Go to: **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub

### Step 3: Import Project to Vercel

1. In Vercel dashboard, click **"Add New Project"**
2. Select your GitHub repository
3. Vercel will auto-detect Next.js
4. Click **"Import"**

### Step 4: Configure Project Settings

1. **Project Name**: Keep default or change
2. **Framework Preset**: Should be "Next.js" (auto-detected)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)

### Step 5: Add Environment Variables

**⚠️ CRITICAL STEP**: Add all environment variables before deploying!

1. In project setup, scroll to **"Environment Variables"**
2. Add each variable one by one:

   **Click "Add Another" for each:**

   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID = f6847852033592db7f414e9b8eb170ba
   NEXT_PUBLIC_CONTRACT_ADDRESS = 0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
   NEXT_PUBLIC_TOKEN_ADDRESS = 0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   ENGINE_URL = https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
   THIRDWEB_SECRET_KEY = D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
   BACKEND_WALLET_ADDRESS = 0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
   ```

   > **Important**: 
   - Set all variables for **Production**, **Preview**, and **Development** environments
   - Copy values EXACTLY (no extra spaces)

### Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

### Step 7: Verify Deployment

1. ✅ Visit your deployed URL
2. ✅ Test wallet connection
3. ✅ Test token minting feature
4. ✅ Check console for errors

## 🔍 Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Wallet connection works
- [ ] Contract interactions work
- [ ] Token minting feature works
- [ ] No errors in browser console
- [ ] Check Vercel logs for any issues

## 🔧 Troubleshooting

### Build Fails

**Check Vercel Build Logs:**
1. Go to your project in Vercel
2. Click on the failed deployment
3. Check build logs for errors
4. Common issues:
   - Missing environment variables
   - TypeScript errors (we saw some lint warnings - these shouldn't block deployment)
   - Missing dependencies

### Environment Variables Not Working

1. **Restart deployment** after adding variables
2. **Check variable names** - must match exactly (case-sensitive)
3. **Verify values** - no extra spaces or quotes
4. **Set for all environments** (Production, Preview, Development)

### Engine Connection Issues

1. **Verify ENGINE_URL** is correct:
   - Check Engine dashboard: https://portal.thirdweb.com/engine
   - Copy exact URL
   - Update in Vercel environment variables

2. **Check Secret Key** is correct:
   - Verify in Engine dashboard → Settings
   - Ensure no extra spaces when copying

3. **Verify backend wallet**:
   - Check wallet is configured in Engine Settings
   - Ensure wallet has gas tokens

## 📝 Quick Reference

### Your Production Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | `f6847852033592db7f414e9b8eb170ba` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` |
| `ENGINE_URL` | `https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com` ⚠️ Verify |
| `THIRDWEB_SECRET_KEY` | `D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw` |
| `BACKEND_WALLET_ADDRESS` | `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3` |

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Go to Vercel → Settings → Domains
   - Add your custom domain
   - Configure DNS records

2. **Monitor**:
   - Check Vercel analytics
   - Monitor error logs
   - Watch Engine usage

3. **Optimize**:
   - Enable Vercel Analytics
   - Set up error tracking (optional)
   - Configure caching if needed

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Engine Dashboard**: https://portal.thirdweb.com/engine
- **Deployment Guide**: See [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)

---

**Ready to deploy?** Follow the steps above! 🚀

