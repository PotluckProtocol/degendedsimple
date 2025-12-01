# Railway Complete Setup Guide

## Current Status
✅ Railway CLI installed and authenticated
✅ Project linked: helpful-balance (74204bee-cba6-4efd-9f08-4542fecfcfb9)

## Next Steps

### Option 1: Via Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://railway.app/project/74204bee-cba6-4efd-9f08-4542fecfcfb9

2. **Create a Service**:
   - Click "New" → "GitHub Repo" (connect your repo)
   - OR Click "New" → "Empty Service"
   - Name it: `telegram-bot`

3. **Configure Service**:
   - **Start Command**: `npm run telegram:listen:enhanced`
   - Railway will auto-detect Node.js

4. **Set Environment Variables** (in the service's Variables tab):
   ```
   TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
   TELEGRAM_CHAT_ID=372188992
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
   NEXT_PUBLIC_SITE_URL=https://degended.bet
   ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
   ```

5. **Deploy**: Railway will auto-deploy, or click "Deploy"

---

### Option 2: Via CLI (After creating service in dashboard)

Once you've created the service via dashboard, run these commands:

```bash
# Link to the service (will prompt for selection)
railway service

# Set all environment variables
railway variables --set "TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs" \
  --set "TELEGRAM_CHAT_ID=372188992" \
  --set "NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81" \
  --set "NEXT_PUBLIC_SITE_URL=https://degended.bet" \
  --set "ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv" \
  --set "NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba"

# Deploy
railway up
```

---

## Verification

After deployment, check logs:
```bash
railway logs
```

Or view in dashboard: https://railway.app/project/74204bee-cba6-4efd-9f08-4542fecfcfb9

You should see:
- ✅ Telegram bot initialized with command support
- ✅ Bot commands registered with Telegram
- 📡 Listening to contract: 0xC04c1DE26F5b01151eC72183b5615635E609cC81

