# Complete Railway Setup - Final Steps

## ✅ Already Done
- Railway CLI installed
- Authenticated with Railway
- Project linked: helpful-balance

## 🔧 Final Steps (Interactive Required)

Since Railway CLI needs interactive selection, please run these commands in your terminal:

### Step 1: Link to Your Service
```bash
railway service
```
- This will show you a list of services
- Select the telegram bot service you created in the dashboard
- Press Enter

### Step 2: Run Automated Setup
```bash
./railway-final-setup.sh
```

This script will:
- ✅ Verify service is linked
- ✅ Set all 6 environment variables
- ✅ Deploy the bot

---

## Alternative: Manual Steps

If you prefer to do it manually:

### After linking service (`railway service`):

```bash
# Set environment variables
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

## Verify Deployment

After deployment, check logs:
```bash
railway logs
```

You should see:
- ✅ Telegram bot initialized with command support
- ✅ Bot commands registered with Telegram
- 📡 Listening to contract: 0xC04c1DE26F5b01151eC72183b5615635E609cC81

Test in Telegram:
- `/help` - Show commands
- `/markets` - List open markets
- `/resolved` - Latest resolved market

