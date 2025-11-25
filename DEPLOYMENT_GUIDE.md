# Production Deployment Guide

This guide will help you deploy your prediction market dApp to a production website.

## 📋 Pre-Deployment Checklist

- [x] App working locally
- [ ] Production-ready smart contracts deployed
- [ ] thirdweb Engine instance (hosted) configured
- [ ] Environment variables prepared
- [ ] Domain name ready (optional)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Best for:** Next.js apps, fast deployment, automatic SSL, global CDN

**Pros:**
- One-click deployment from GitHub
- Automatic SSL certificates
- Global CDN for fast loading
- Free tier available
- Built-in environment variable management
- Preview deployments for branches

### Option 2: Netlify

**Best for:** Static sites, JAMstack apps

**Pros:**
- Easy deployment
- Free tier
- Good for static exports

### Option 3: Self-Hosted (VPS/Server)

**Best for:** Full control, custom requirements

**Pros:**
- Complete control
- Can host Engine on same server
- Custom configurations

## 📝 Step-by-Step Deployment (Vercel)

### Step 1: Set Up thirdweb Hosted Engine

Since local Engine is only for development, you need a production Engine instance:

1. **Go to thirdweb Engine Dashboard**
   - Visit: https://portal.thirdweb.com/engine
   - Sign in with your thirdweb account

2. **Create a New Engine Instance**
   - Click "Create Engine"
   - Choose a name (e.g., "degended-markets-production")
   - Select a region (closest to your users)
   - Wait for deployment (usually 2-5 minutes)

3. **Get Your Engine Credentials**
   - **Engine URL**: Found in Overview (e.g., `https://your-engine.thirdweb.com`)
   - **Secret Key**: Settings → Secret Key (copy this)
   - **Backend Wallet**: Settings → Backend Wallet (use the same one: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`)
     - You may need to add this wallet in Engine settings

4. **Configure Backend Wallet in Engine**
   - In Engine Settings → Backend Wallets
   - Add your wallet: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`
   - Or import using the private key you have

### Step 2: Prepare Your Code

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Verify Build Works Locally**
   ```bash
   npm run build
   ```
   - If successful, you're ready to deploy!
   - Fix any build errors before proceeding

### Step 3: Deploy to Vercel

1. **Create Vercel Account**
   - Go to: https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Your Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   Add these in Vercel's environment variables section:

   ```env
   # Required
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
   
   # Contract Addresses
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
   NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
   
   # Engine Credentials (from Step 1)
   ENGINE_URL=https://your-engine.thirdweb.com
   THIRDWEB_SECRET_KEY=your_production_secret_key
   BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
   ```

   **Important:** 
   - `ENGINE_URL` should be your **hosted Engine URL** (not localhost)
   - Get `THIRDWEB_SECRET_KEY` from Engine dashboard
   - Do NOT commit these to GitHub (use Vercel's environment variables)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build and deployment
   - Your app will be live at `https://your-project.vercel.app`

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain name
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, usually < 1 minute)

## 🔒 Environment Variables Reference

### Required for Production

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | thirdweb Client ID | thirdweb Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Prediction Market contract | Your deployed contract |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | USDC token address | Sonic Mainnet USDC: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` |
| `ENGINE_URL` | thirdweb Engine URL | Engine Dashboard → Overview |
| `THIRDWEB_SECRET_KEY` | Engine Secret Key | Engine Dashboard → Settings |
| `BACKEND_WALLET_ADDRESS` | Backend wallet address | Your wallet: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3` |

## 🔧 Alternative: Netlify Deployment

### Steps for Netlify

1. **Go to Netlify**: https://netlify.com
2. **Connect GitHub repository**
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Add environment variables** (same as Vercel above)
5. **Deploy**

## 🌐 Self-Hosting Alternative

If you prefer to self-host:

### Using a VPS (Ubuntu/Debian)

1. **Set up server** with Node.js 18+
2. **Clone repository**
3. **Install dependencies**: `npm install`
4. **Build**: `npm run build`
5. **Run with PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "degended-markets" -- start
   pm2 save
   pm2 startup
   ```
6. **Set up Nginx** as reverse proxy
7. **Configure SSL** with Let's Encrypt

### Run Engine on Same Server

You can also self-host Engine using Docker (similar to local setup):
- Use the same `docker-compose.engine.yml`
- Point `ENGINE_URL` to your server's IP/domain
- Configure firewall rules appropriately

## ✅ Post-Deployment Checklist

- [ ] Test wallet connection on production URL
- [ ] Verify contract interactions work
- [ ] Test token minting feature
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Monitor error logs (Vercel/Netlify dashboard)
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure analytics (optional: Google Analytics, Plausible)

## 🔍 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)

### Environment Variables Not Working
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)
- Verify `NEXT_PUBLIC_` prefix for client-side variables

### Engine Connection Issues
- Verify `ENGINE_URL` is correct (no trailing slash)
- Check Engine instance is running (Engine dashboard)
- Verify `THIRDWEB_SECRET_KEY` matches Engine dashboard
- Ensure backend wallet is configured in Engine

### Contract Not Found
- Verify contract address is correct
- Ensure contract is deployed on Sonic Mainnet
- Check network configuration in code matches production

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Enable in Vercel dashboard for usage stats

### Error Monitoring
- Consider adding Sentry for error tracking
- Monitor Vercel function logs

### Performance
- Use Vercel's built-in analytics
- Monitor API route performance
- Check Engine API latency

## 🔄 Continuous Deployment

Vercel/Netlify automatically deploy on:
- Push to `main` branch → Production
- Push to other branches → Preview deployments

## 📝 Production vs Development

| Component | Development | Production |
|-----------|-------------|------------|
| Engine URL | `http://localhost:3005` | `https://your-engine.thirdweb.com` |
| Environment | `.env.local` | Vercel/Netlify env vars |
| Backend Wallet | Same address | Same address |
| Contracts | Same addresses | Same addresses |

## 🎯 Next Steps After Deployment

1. Share your production URL
2. Test all features thoroughly
3. Monitor user activity
4. Set up backups (if using database)
5. Consider adding:
   - Analytics
   - Error tracking
   - User feedback system
   - Rate limiting (if needed)

## 💡 Tips

- **Start with Vercel** - easiest for Next.js apps
- **Use thirdweb's hosted Engine** - simpler than self-hosting
- **Test on staging** - create a preview deployment first
- **Monitor costs** - Engine has usage-based pricing
- **Backup secrets** - store credentials securely (password manager)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [thirdweb Engine Docs](https://portal.thirdweb.com/engine)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

Ready to deploy? Follow Step 1 first (set up hosted Engine), then proceed with Vercel deployment!

