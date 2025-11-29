/**
 * Telegram Event Listener (Enhanced with Alchemy)
 * Uses Alchemy API + direct contract reads for reliable event tracking
 * Also supports /markets command to list open markets
 */

require('dotenv').config({ path: '.env.local' });
const { createThirdwebClient, getContract, readContract } = require('thirdweb');
const { defineChain } = require('thirdweb/chains');
const { 
  sendTelegramMessage, 
  formatMarketCreatedMessage, 
  formatMarketResolvedMessage,
  initTelegramBot,
  formatOpenMarketsMessage,
  formatLatestResolvedMessage 
} = require('../lib/telegram-bot');

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xC04c1DE26F5b01151eC72183b5615635E609cC81';
const POLL_INTERVAL = 60000; // Poll every 60 seconds
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://degended.bet';
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;

// Define Sonic chain with Alchemy RPC
const sonic = defineChain({
  id: 146,
  name: 'Sonic',
  rpc: ALCHEMY_RPC_URL || 'https://rpc.soniclabs.com',
});

// Track processed markets
const processedMarkets = new Map(); // marketId -> { created: bool, resolved: bool }

async function main() {
  console.log('🤖 Starting Telegram Event Listener (Enhanced)...');
  console.log('🔧 Using Alchemy RPC for better performance\n');
  
  // Initialize Telegram bot
  if (!process.env.TELEGRAM_CHAT_ID) {
    console.error('❌ TELEGRAM_CHAT_ID not set in .env.local');
    process.exit(1);
  }

  const bot = initTelegramBot(process.env.TELEGRAM_CHAT_ID, true); // Enable polling for commands
  console.log('✅ Telegram bot initialized with command support');

  // Initialize thirdweb client with Alchemy RPC
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  });

  const contract = getContract({
    client,
    chain: sonic,
    address: CONTRACT_ADDRESS,
  });

  // Set up command handlers
  bot.onText(/\/markets|\/open|\/active/i, async (msg) => {
    try {
      const chatId = msg.chat.id.toString();
      
      // Send "fetching" message
      await bot.sendMessage(chatId, '🔍 Fetching open markets...', { parse_mode: 'HTML' });
      
      // Fetch and send open markets
      const openMarkets = await getOpenMarkets(contract);
      const message = formatOpenMarketsMessage(openMarkets, SITE_URL);
      
      // Split message if too long (Telegram has 4096 char limit)
      if (message.length > 4000) {
        const parts = message.split('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        let currentMessage = parts[0] + '\n';
        
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          if (part) {
            if ((currentMessage + part).length > 4000) {
              await bot.sendMessage(chatId, currentMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
              currentMessage = part + '\n';
            } else {
              currentMessage += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' + part + '\n';
            }
          }
        }
        if (currentMessage.trim()) {
          await bot.sendMessage(chatId, currentMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
      } else {
        await bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
      }
    } catch (error) {
      console.error('Error handling /markets command:', error);
      try {
        await bot.sendMessage(msg.chat.id, '❌ Error fetching markets. Please try again later.');
      } catch (e) {
        // Ignore
      }
    }
  });

  bot.onText(/\/resolved/i, async (msg) => {
    try {
      const chatId = msg.chat.id.toString();
      
      // Send "fetching" message
      await bot.sendMessage(chatId, '🔍 Fetching latest resolved market...', { parse_mode: 'HTML' });
      
      // Fetch latest resolved market
      const latestResolved = await getLatestResolvedMarket(contract);
      const message = formatLatestResolvedMessage(latestResolved, latestResolved ? `${SITE_URL}/?market=${latestResolved.marketId}` : undefined);
      
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: false });
    } catch (error) {
      console.error('Error handling /resolved command:', error);
      try {
        await bot.sendMessage(msg.chat.id, '❌ Error fetching resolved market. Please try again later.');
      } catch (e) {
        // Ignore
      }
    }
  });

  bot.onText(/\/start|\/help/i, async (msg) => {
    const helpMessage = `🤖 <b>DEGENDED MARKETS Bot</b>\n\n` +
      `📋 <b>Available Commands:</b>\n\n` +
      `/<b>markets</b> - List all currently open markets\n` +
      `/<b>resolved</b> - Show the latest resolved market\n` +
      `/<b>help</b> - Show this help message\n\n` +
      `📢 The bot will automatically notify you when:\n` +
      `  • New markets are created\n` +
      `  • Markets are resolved (with betting totals)\n\n` +
      `🔗 Visit: ${SITE_URL}`;
    
    await bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
  });

  // Set bot commands for Telegram's command menu (when user types /)
  try {
    await bot.setMyCommands([
      { command: 'markets', description: 'List all currently open markets' },
      { command: 'resolved', description: 'Show the latest resolved market' },
      { command: 'help', description: 'Show available commands' },
    ]);
    console.log('✅ Bot commands registered with Telegram');
  } catch (error) {
    console.warn('⚠️ Could not set bot commands (this is optional):', error.message);
  }

  console.log(`📡 Listening to contract: ${CONTRACT_ADDRESS}`);
  console.log(`🔄 Polling interval: ${POLL_INTERVAL / 1000} seconds`);
  console.log(`🌐 RPC: ${ALCHEMY_RPC_URL ? 'Alchemy' : 'Default'}\n`);

  // Get initial market count
  try {
    const initialCount = await readContract({
      contract,
      method: 'function marketCount() view returns (uint256)',
      params: [],
    });
    console.log(`📊 Current market count: ${initialCount}`);
    
    // Mark existing markets as already processed
    for (let i = 0; i < Number(initialCount); i++) {
      processedMarkets.set(i, { created: true, resolved: false });
    }
  } catch (error) {
    console.warn('Could not fetch initial market count:', error.message);
  }

  // Start polling
  setInterval(async () => {
    try {
      await checkForNewMarkets(contract);
    } catch (error) {
      console.error('Error checking markets:', error);
    }
  }, POLL_INTERVAL);

  // Check immediately
  await checkForNewMarkets(contract);
}

async function getOpenMarkets(contract) {
  try {
    // Get market count
    const marketCount = await readContract({
      contract,
      method: 'function marketCount() view returns (uint256)',
      params: [],
    });

    const count = Number(marketCount);
    const openMarkets = [];

    // Check each market
    for (let i = 0; i < count; i++) {
      try {
        const marketData = await readContract({
          contract,
          method: 'function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)',
          params: [BigInt(i)],
        });

        const resolved = marketData[7];
        const endTime = marketData[3];
        const isExpired = new Date(Number(endTime) * 1000) < new Date();

        // Include if not resolved and not expired
        if (!resolved && !isExpired) {
          openMarkets.push({
            marketId: i,
            question: marketData[0],
            optionA: marketData[1],
            optionB: marketData[2],
            endTime: new Date(Number(endTime) * 1000),
            totalOptionAShares: marketData[5],
            totalOptionBShares: marketData[6],
          });
        }
      } catch (error) {
        console.error(`Error fetching market ${i}:`, error.message);
      }
    }

    return openMarkets;
  } catch (error) {
    console.error('Error getting open markets:', error);
    return [];
  }
}

async function getLatestResolvedMarket(contract) {
  try {
    // Get market count
    const marketCount = await readContract({
      contract,
      method: 'function marketCount() view returns (uint256)',
      params: [],
    });

    const count = Number(marketCount);
    let latestResolved = null;
    let latestMarketId = -1;

    // Check each market from newest to oldest
    for (let i = count - 1; i >= 0; i--) {
      try {
        const marketData = await readContract({
          contract,
          method: 'function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)',
          params: [BigInt(i)],
        });

        const resolved = marketData[7];
        const outcome = Number(marketData[4]);

        // Include if resolved (outcome 1, 2, or 3)
        if (resolved && (outcome === 1 || outcome === 2 || outcome === 3)) {
          latestResolved = {
            marketId: i,
            question: marketData[0],
            optionA: marketData[1],
            optionB: marketData[2],
            outcome: outcome,
            totalOptionAShares: marketData[5],
            totalOptionBShares: marketData[6],
          };
          latestMarketId = i;
          break; // Found the latest resolved market
        }
      } catch (error) {
        console.error(`Error fetching market ${i}:`, error.message);
      }
    }

    return latestResolved;
  } catch (error) {
    console.error('Error getting latest resolved market:', error);
    return null;
  }
}

async function checkForNewMarkets(contract) {
  try {
    // Get current market count
    const marketCount = await readContract({
      contract,
      method: 'function marketCount() view returns (uint256)',
      params: [],
    });

    const count = Number(marketCount);

    // Check each market
    for (let i = 0; i < count; i++) {
      const marketInfo = processedMarkets.get(i) || { created: false, resolved: false };

      try {
        // Get market data
        const marketData = await readContract({
          contract,
          method: 'function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)',
          params: [BigInt(i)],
        });

        const question = marketData[0];
        const optionA = marketData[1];
        const optionB = marketData[2];
        const endTime = marketData[3];
        const outcome = Number(marketData[4]);
        const totalOptionAShares = marketData[5];
        const totalOptionBShares = marketData[6];
        const resolved = marketData[7];

        // Check if new market (not processed yet)
        if (!marketInfo.created) {
          const message = formatMarketCreatedMessage(
            i,
            question,
            optionA,
            optionB,
            new Date(Number(endTime) * 1000),
            `${SITE_URL}/?market=${i}`
          );

          await sendTelegramMessage(message);
          console.log(`✅ Sent notification for new market #${i}`);
          
          processedMarkets.set(i, { created: true, resolved });
        }

        // Check if market was just resolved
        if (resolved && !marketInfo.resolved && (outcome === 1 || outcome === 2 || outcome === 3)) {
          const message = formatMarketResolvedMessage(
            i,
            question,
            outcome,
            optionA,
            optionB,
            totalOptionAShares,
            totalOptionBShares,
            `${SITE_URL}/?market=${i}`
          );

          await sendTelegramMessage(message);
          console.log(`✅ Sent notification for resolved market #${i} (outcome: ${outcome})`);
          
          processedMarkets.set(i, { created: true, resolved: true });
        } else if (resolved) {
          // Update resolved status even if we already notified
          processedMarkets.set(i, { created: marketInfo.created, resolved: true });
        }

      } catch (error) {
        console.error(`Error checking market ${i}:`, error.message);
      }
    }

    console.log(`⏰ Checked ${count} markets at ${new Date().toLocaleTimeString()}`);

  } catch (error) {
    console.error('Error in checkForNewMarkets:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Telegram Event Listener...');
  process.exit(0);
});

main().catch(console.error);

