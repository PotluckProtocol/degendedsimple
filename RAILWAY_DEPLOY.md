# Railway Deployment Guide for Telegram Bot

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. Railway CLI installed: `npm install -g @railway/cli`

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo" (if your repo is on GitHub)
   - OR select "Empty Project" and deploy manually

2. **If deploying manually:**
   - Click "New" → "GitHub Repo" or "Empty Project"
   - If Empty Project: Click "New" → "Blank Service"
   - Connect your repository or upload the project

3. **Configure the Service**
   - Set the **Start Command** to: `npm run telegram:listen:enhanced`
   - Railway will auto-detect Node.js and install dependencies

4. **Set Environment Variables**
   Add these in Railway's Environment Variables section:
   ```
   TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
   TELEGRAM_CHAT_ID=372188992
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
   NEXT_PUBLIC_SITE_URL=https://degended.bet
   ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv...
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - Check the logs to ensure the bot starts correctly

### Option 2: Deploy via Railway CLI

1. **Login to Railway**
   ```bash
   railway login
   ```
   This will open your browser for authentication.

2. **Initialize Project**
   ```bash
   railway init
   ```
   This will create a new Railway project or link to an existing one.

3. **Set Environment Variables**
   ```bash
   railway variables set TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
   railway variables set TELEGRAM_CHAT_ID=372188992
   railway variables set NEXT_PUBLIC_CONTRACT_ADDRESS=0xC04c1DE26F5b01151eC72183b5615635E609cC81
   railway variables set NEXT_PUBLIC_SITE_URL=https://degended.bet
   railway variables set ALCHEMY_RPC_URL=your_alchemy_rpc_url
   railway variables set NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Verification

1. Check Railway logs:
   ```bash
   railway logs
   ```
   Or view in the Railway dashboard

2. Look for these messages in the logs:
   - ✅ Telegram bot initialized with command support
   - ✅ Bot commands registered with Telegram
   - 📡 Listening to contract: [address]
   - ⏰ Checked X markets at [time]

3. Test the bot in Telegram:
   - Send `/help` to your bot
   - Try `/markets` to list open markets
   - Try `/resolved` to see the latest resolved market

## Monitoring

- Railway automatically restarts the service if it crashes
- Check logs regularly via Railway dashboard or CLI
- The bot polls every 60 seconds for new markets/resolutions

## Troubleshooting

- **Bot not responding**: Check Railway logs for errors
- **Missing environment variables**: Verify all env vars are set in Railway
- **Contract connection issues**: Ensure ALCHEMY_RPC_URL is correct
- **Telegram errors**: Verify TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are correct

## Cost

- Railway free tier: $5 credit/month (usually enough for a simple bot)
- Usage-based pricing after free tier
- The bot uses minimal resources (just polling every 60 seconds)
