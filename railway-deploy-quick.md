# Quick Railway Deployment

Since Railway CLI requires browser authentication, here's the fastest way to deploy:

## Step 1: Go to Railway Dashboard
Visit https://railway.app and sign in

## Step 2: Create New Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"** (if your code is on GitHub)
  - OR select **"Empty Project"** and manually deploy

## Step 3: Connect Repository
- If using GitHub: Connect your repository
- Railway will auto-detect Node.js

## Step 4: Configure Service
In the service settings:
- **Start Command**: `npm run telegram:listen:enhanced`
- Railway will automatically install dependencies

## Step 5: Set Environment Variables
Go to **Variables** tab and add:

```
TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
TELEGRAM_CHAT_ID=372188992
NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
NEXT_PUBLIC_SITE_URL=https://degended.bet
ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
```

## Step 6: Deploy
- Railway will automatically deploy when you connect the repo
- OR click **"Deploy"** button

## Step 7: Verify
- Check the **Logs** tab - you should see:
  - ✅ Telegram bot initialized with command support
  - ✅ Bot commands registered with Telegram
  - 📡 Listening to contract...

## Done! 🎉
Your bot is now running 24/7 on Railway. Test it in Telegram with `/help`, `/markets`, or `/resolved`.

---
**Note**: The API key you provided (0776545a-0fa0-4000-b8fa-a25ac2e3b123) can be used in Railway's dashboard under Project Settings if you want to link via CLI later.
