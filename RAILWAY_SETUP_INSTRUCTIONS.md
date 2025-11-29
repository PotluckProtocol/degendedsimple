# Railway Setup Instructions

## Quick Setup (2 Steps)

### Step 1: Authenticate
```bash
railway login
```
This will open your browser to authenticate.

### Step 2: Run Automated Script
```bash
./railway-deploy-auto.sh
```

This script will:
- ✅ Link to your Railway project (74204bee-cba6-4efd-9f08-4542fecfcfb9)
- ✅ Set all 6 environment variables
- ✅ Deploy the Telegram bot

---

## Manual Setup (Alternative)

If you prefer to run commands manually:

```bash
# 1. Link to project
railway link -p 74204bee-cba6-4efd-9f08-4542fecfcfb9

# 2. Set environment variables
railway variables set TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
railway variables set TELEGRAM_CHAT_ID=372188992
railway variables set NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
railway variables set NEXT_PUBLIC_SITE_URL=https://degended.bet
railway variables set ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv
railway variables set NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

# 3. Deploy
railway up
```

---

## Environment Variables Set

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | `8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs` |
| `TELEGRAM_CHAT_ID` | `372188992` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xC04c1DE26F5b01151eC72183b5615635E609cC81` |
| `NEXT_PUBLIC_SITE_URL` | `https://degended.bet` |
| `ALCHEMY_RPC_URL` | `https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv` |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | `f6847852033592db7f414e9b8eb170ba` |

---

## Verification

After deployment, check logs:
```bash
railway logs
```

You should see:
- ✅ Telegram bot initialized with command support
- ✅ Bot commands registered with Telegram
- 📡 Listening to contract: 0xC04c1DE26F5b01151eC72183b5615635E609cC81

---

## Troubleshooting

- **"Unauthorized"**: Run `railway login` first
- **"Project not found"**: Verify project ID is correct
- **Bot not responding**: Check logs with `railway logs`
- **Missing env vars**: Run the setup script again or check in Railway dashboard
