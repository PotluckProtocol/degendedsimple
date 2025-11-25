# 🚀 Quick Deployment Guide

Follow these steps to deploy your app to production in ~10 minutes!

## Step 1: Set Up thirdweb Hosted Engine (5 min)

1. Go to: **https://portal.thirdweb.com/engine**
2. Click **"Create Engine"** 
3. Name it (e.g., "degended-markets-prod")
4. Wait 2-3 minutes for deployment
5. Copy these values:
   - **Engine URL**: Found in Overview (e.g., `https://xxx.thirdweb.com`)
   - **Secret Key**: Settings → Secret Key → Copy

## Step 2: Configure Engine Backend Wallet

1. In Engine Dashboard → Settings → **Backend Wallets**
2. Add wallet: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`
   - Or import using your private key

## Step 3: Deploy to Vercel (3 min)

### Option A: GitHub + Vercel (Recommended)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Go to Vercel**: https://vercel.com
   - Sign up/login with GitHub

3. **Import Project**:
   - Click "Add New Project"
   - Select your repository
   - Click "Import"

4. **Add Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add these one by one:

   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID = f6847852033592db7f414e9b8eb170ba
   NEXT_PUBLIC_CONTRACT_ADDRESS = 0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
   NEXT_PUBLIC_TOKEN_ADDRESS = 0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   ENGINE_URL = https://your-engine.thirdweb.com (from Step 1)
   THIRDWEB_SECRET_KEY = your_secret_key (from Step 1)
   BACKEND_WALLET_ADDRESS = 0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables (when prompted or via dashboard)
vercel env add NEXT_PUBLIC_THIRDWEB_CLIENT_ID
vercel env add ENGINE_URL
# ... add all variables

# Deploy to production
vercel --prod
```

## Step 4: Test Your Live Site

1. Open your Vercel URL: `https://your-project.vercel.app`
2. Test wallet connection
3. Test token minting
4. Test market interactions

## ✅ Done!

Your app is now live on the internet! 

### Next Steps (Optional):
- [ ] Add custom domain in Vercel settings
- [ ] Set up monitoring/analytics
- [ ] Test on mobile devices
- [ ] Share your URL!

---

**Need help?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

