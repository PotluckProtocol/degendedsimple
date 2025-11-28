# Telegram Bot Setup Guide

## Quick Start

1. **Set up environment variables** in `.env.local`:
```env
TELEGRAM_BOT_TOKEN=8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs
TELEGRAM_CHAT_ID=your_chat_id_here
NEXT_PUBLIC_SITE_URL=https://degended.bet
```

2. **Get your Telegram Chat ID**:
   - Start a conversation with your bot on Telegram
   - Send any message to the bot
   - Visit: `https://api.telegram.org/bot8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs/getUpdates`
   - Look for `"chat":{"id":123456789}` - that's your chat ID
   - Add it to `.env.local` as `TELEGRAM_CHAT_ID`

3. **Start the event listener**:
```bash
npm run telegram:listen
```

## What It Does

The bot will automatically send notifications when:

1. **New Market Created**:
   - Market ID
   - Question
   - Options (Yes/No)
   - End date/time
   - Link to view market

2. **Market Resolved**:
   - Market ID
   - Question
   - Winning outcome
   - Total bets for Yes
   - Total bets for No
   - Total pool size
   - Link to view market

## Running as Background Service

### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
pm2 start scripts/telegram-event-listener.js --name telegram-bot
pm2 save
pm2 startup  # Follow instructions to auto-start on boot
```

### Option 2: Docker
```bash
docker run -d \
  --name telegram-bot \
  --env-file .env.local \
  -v $(pwd):/app \
  node:18 node /app/scripts/telegram-event-listener.js
```

### Option 3: Systemd Service (Linux)
Create `/etc/systemd/system/telegram-bot.service`:
```ini
[Unit]
Description=Telegram Bot Event Listener
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/degendedsimple
Environment=NODE_ENV=production
ExecStart=/usr/bin/node scripts/telegram-event-listener.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
```

## Testing

Send a test message:
```bash
node -e "
const { sendTelegramMessage, initTelegramBot } = require('./src/lib/telegram-bot');
initTelegramBot(process.env.TELEGRAM_CHAT_ID);
sendTelegramMessage('🧪 Test message from bot!');
"
```

## Monitoring

Check logs:
```bash
# If using PM2
pm2 logs telegram-bot

# If running directly
# Logs will appear in console
```

## Troubleshooting

### Bot not receiving messages?
- Verify `TELEGRAM_CHAT_ID` is correct
- Make sure you've sent a message to the bot first
- Check bot token is valid

### Events not being detected?
- Verify contract address is correct
- Check RPC connection (might need better RPC endpoint)
- Events may not be supported by current RPC (use indexing service)

### Need multiple chat IDs?
Modify the script to support multiple chat IDs or create a Telegram channel and add the bot as admin.

