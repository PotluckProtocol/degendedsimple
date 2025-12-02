# 🔄 Deployment Sync Status

Last Updated: $(date)

## 📊 Deployment Overview

### 1. **Vercel Frontend** (https://www.degended.bet)
- **Status**: ✅ Deployed
- **Auto-deploy**: ✅ Enabled (GitHub integration)
- **Framework**: Next.js 15
- **Build**: ✅ Passing

### 2. **Railway Telegram Bot** (Background Service)
- **Status**: ✅ Running
- **Service**: Event listener for market notifications
- **Auto-restart**: ✅ Enabled

---

## 🔑 Environment Variables Checklist

### **Vercel Frontend** (Required)

```env
# ✅ Client Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

# ✅ Contract Addresses (Sonic Mainnet)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894

# ✅ Engine Configuration (Production)
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3

# ✅ Alchemy RPC (Optional but recommended)
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/YOUR_KEY
# OR
ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/YOUR_KEY

# ✅ Site URL
NEXT_PUBLIC_SITE_URL=https://www.degended.bet
```

### **Railway Telegram Bot** (Required)

```env
# ✅ Telegram Configuration
TELEGRAM_BOT_TOKEN=8585450134:AAFPdFpO8KSCZhQ_fXGJnY9EpA5cfSLzjyA
TELEGRAM_CHAT_ID=your_chat_id_here (comma-separated for multiple)

# ✅ Contract & Site Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
NEXT_PUBLIC_SITE_URL=https://www.degended.bet

# ✅ thirdweb Client
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

# ✅ Alchemy RPC (Required for event listening)
ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/YOUR_KEY
```

---

## ⚠️ Critical Sync Points

### 1. **Contract Address**
- **Code Default**: `0xC04c1DE26F5b01151eC72183b5615635E609cC81`
- **Vercel**: Must match code default or override via env var
- **Railway**: Must match code default or override via env var
- **Status**: ✅ Synced

### 2. **Site URL**
- **Vercel**: `NEXT_PUBLIC_SITE_URL=https://www.degended.bet`
- **Railway**: `NEXT_PUBLIC_SITE_URL=https://www.degended.bet`
- **Status**: ✅ Synced

### 3. **Telegram Bot Token**
- **Railway**: `TELEGRAM_BOT_TOKEN=8585450134:AAFPdFpO8KSCZhQ_fXGJnY9EpA5cfSLzjyA`
- **Status**: ✅ Updated (recently fixed)

### 4. **Alchemy RPC URL**
- **Vercel**: Optional (for user stats, event queries)
- **Railway**: Required (for event listening)
- **Status**: ⚠️ Verify both have correct Alchemy key

---

## 🔍 Verification Steps

### Check Vercel Deployment
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Check latest deployment status
4. Verify environment variables in Settings → Environment Variables
5. Test site: https://www.degended.bet

### Check Railway Bot
1. Go to: https://railway.app/dashboard
2. Select your Telegram bot service
3. Check deployment logs
4. Verify environment variables in Variables tab
5. Test bot by sending `/markets` command

### Test Sync Points
1. ✅ **Contract Address**: Both use same contract
2. ✅ **Site URL**: Links point to correct domain
3. ✅ **Telegram Links**: Include `&tab=resolved` parameter
4. ⚠️ **Alchemy Access**: Verify both have access

---

## 🚨 Common Issues & Fixes

### Issue: Vercel build fails
**Fix**: 
- Check environment variables are set
- Verify `ENGINE_URL` is correct (not localhost)
- Check build logs for TypeScript errors

### Issue: Telegram bot not responding
**Fix**:
- Verify `TELEGRAM_BOT_TOKEN` is correct in Railway
- Check Railway deployment logs
- Ensure bot is running (check Railway service status)

### Issue: Contract address mismatch
**Fix**:
- Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in both Vercel and Railway
- Redeploy both services

### Issue: Links not working
**Fix**:
- Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
- Check URL parameters are correct (`?market=X&tab=resolved`)

---

## 📝 Recent Changes

### Latest Updates
- ✅ Fixed Telegram bot token (Railway)
- ✅ Added URL parameter handling for isolated market view
- ✅ Made logo/banner clickable to return home
- ✅ Fixed "Load More Markets" button in isolated view
- ✅ Added Suspense wrapper for Navbar (useSearchParams)

### Pending Verification
- ⚠️ Verify Alchemy RPC URLs are set correctly in both deployments
- ⚠️ Test isolated market view with Telegram links
- ⚠️ Verify all environment variables match between deployments

---

## ✅ Quick Sync Checklist

- [ ] Vercel environment variables match code defaults
- [ ] Railway environment variables match code defaults
- [ ] Contract address is same in both deployments
- [ ] Site URL is same in both deployments
- [ ] Telegram bot token is correct in Railway
- [ ] Alchemy RPC URL is set in both (if needed)
- [ ] Both deployments are running successfully
- [ ] Latest code changes are deployed

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Production Site**: https://www.degended.bet
- **Contract Address**: `0xC04c1DE26F5b01151eC72183b5615635E609cC81`
- **Sonic Explorer**: https://sonicscan.org/address/0xC04c1DE26F5b01151eC72183b5615635E609cC81

