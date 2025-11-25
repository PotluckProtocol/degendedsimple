# Setting Up thirdweb Hosted Engine

For production deployment, you need a **hosted Engine instance** (not local). Here's how to set it up:

## Method 1: Using thirdweb Dashboard (Recommended - 5 minutes)

### Step 1: Access Engine Dashboard

1. Go to: **https://portal.thirdweb.com/engine**
2. Sign in with your thirdweb account (same one you use for Client ID)

### Step 2: Create Engine Instance

1. Click **"Create Engine"** button
2. Fill in the details:
   - **Name**: `degended-markets-production` (or any name you prefer)
   - **Region**: Choose closest to your users (e.g., US East, EU West)
   - **Plan**: Start with Free/Starter plan
3. Click **"Create Engine"**
4. Wait 2-3 minutes for deployment

### Step 3: Get Engine Credentials

Once your Engine is deployed, you'll see:

1. **Engine URL** (in Overview):
   - Format: `https://your-engine-name.thirdweb.com`
   - Copy this URL - this is your `ENGINE_URL`

2. **Secret Key** (in Settings):
   - Go to: Settings → **Secret Key**
   - Click "Reveal" and copy
   - ⚠️ Keep this secret! This is your `THIRDWEB_SECRET_KEY`

### Step 4: Configure Backend Wallet

1. In Engine Dashboard → Settings → **Backend Wallets**
2. Click **"Add Backend Wallet"**
3. Choose one:
   - **Option A**: Add existing wallet address
     - Address: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`
   - **Option B**: Import wallet using private key
     - Use your private key: `0x6fce8563d2f1a23960cfd7fee4da21b9065bc41b0a92735ce38212d5fe531377`
4. Save the wallet

### Step 5: Update Environment Variables

Add these to your production environment (Vercel/Netlify):

```env
ENGINE_URL=https://your-engine-name.thirdweb.com
THIRDWEB_SECRET_KEY=your_secret_key_from_step_3
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

## Method 2: Using thirdweb CLI (Advanced)

If you prefer command line:

```bash
# Install thirdweb CLI globally
npm install -g thirdweb

# Login to thirdweb
thirdweb login

# Create Engine instance
thirdweb engine create

# Follow prompts:
# - Name: degended-markets-production
# - Region: (choose closest)
# - Plan: (choose plan)

# Get credentials
thirdweb engine list
thirdweb engine get-secret-key <engine-name>
```

## ✅ Verification

After setup, verify Engine is working:

```bash
# Test Engine health (requires auth)
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
  https://your-engine.thirdweb.com/health
```

## 📝 Quick Checklist

- [ ] Created Engine instance in dashboard
- [ ] Copied Engine URL
- [ ] Copied Secret Key
- [ ] Configured backend wallet
- [ ] Added credentials to production env vars
- [ ] Tested Engine connection

## 🔗 Useful Links

- **Engine Dashboard**: https://portal.thirdweb.com/engine
- **Engine Docs**: https://portal.thirdweb.com/engine/v2
- **Pricing**: Check dashboard for current pricing

## 💡 Tips

- **Free Tier**: Usually includes some free requests/month
- **Scaling**: You can upgrade plan as your app grows
- **Monitoring**: Check Engine dashboard for usage stats
- **Backup**: Save your Secret Key securely (password manager)

## 🚨 Important Notes

- ⚠️ **Never commit Secret Key to GitHub**
- ⚠️ **Keep backend wallet private key secure**
- ✅ **Use Engine URL in production** (not localhost)
- ✅ **Test thoroughly before going live**

---

Once Engine is set up, proceed with deployment using [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)

