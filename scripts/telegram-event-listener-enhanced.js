/**
 * Telegram Event Listener (Enhanced with Alchemy)
 * Uses Alchemy API + direct contract reads for reliable event tracking
 * Also supports /markets command to list open markets
 */

// Load environment variables - try .env.local first (local dev), then fall back to process.env (Railway/production)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // In production (Railway), environment variables are set directly
}
const { createThirdwebClient, getContract, readContract, prepareContractCall, sendTransaction } = require('thirdweb');
const { privateKeyToAccount } = require('thirdweb/wallets');
const https = require('https');
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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Track suggested resolutions to avoid spamming
const suggestedResolutions = new Set(); // Set of marketIds

async function queryGeminiResolution(question) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set, skipping AI resolution');
    return null;
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [{
        role: "user",
        parts: [{
          text: `You are a prediction market resolver. Based on real-world data, answer the following question with a clear YES or NO. Also provide a confidence score (0-100) and a brief reasoning.
          
          Question: ${question}`
        }]
      }],
      tools: [{ google_search: {} }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const result = response.candidates?.[0]?.content?.parts?.[0]?.text;
          const isYes = result?.toUpperCase().includes('YES');
          const isNo = result?.toUpperCase().includes('NO');
          
          resolve({
            suggestion: isYes ? 'YES' : (isNo ? 'NO' : 'INCONCLUSIVE'),
            outcome: isYes ? 1 : (isNo ? 2 : 0),
            reasoning: result,
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web?.uri) || []
          });
        } catch (e) {
          console.error('Gemini parse error:', e.message);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => { console.error('Gemini req error:', e); resolve(null); });
    req.write(payload);
    req.end();
  });
}

// Define Sonic chain with Alchemy RPC
const sonic = defineChain({
  id: 146,
  name: 'Sonic',
  rpc: ALCHEMY_RPC_URL || 'https://rpc.soniclabs.com',
});

// Track processed markets
const processedMarkets = new Map(); // marketId -> { created: bool, resolved: bool }

// Track subscribed chats (groups/channels that want notifications)
const subscribedChats = new Set(); // Set of chat IDs (strings)

async function main() {
  console.log('🤖 Starting Telegram Event Listener (Enhanced)...');
  console.log('🔧 Using Alchemy RPC for better performance\n');
  
  const bot = initTelegramBot(null, true); // Enable polling for commands (chatId not needed for polling)
  console.log('✅ Telegram bot initialized with command support');

  // Initialize subscribed chats from environment variable (can be comma-separated)
  if (process.env.TELEGRAM_CHAT_ID) {
    const chatIds = process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id);
    chatIds.forEach(chatId => subscribedChats.add(chatId));
    console.log(`📢 Loaded ${subscribedChats.size} subscribed chat(s) from environment`);
  }

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
      const message = formatLatestResolvedMessage(latestResolved, latestResolved ? `${SITE_URL}/?market=${latestResolved.marketId}&tab=resolved` : undefined);
      
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
    const chatId = msg.chat.id.toString();
    const isSubscribed = subscribedChats.has(chatId);
    
    const helpMessage = `🤖 <b>DEGENDED MARKETS Bot</b>\n\n` +
      `📋 <b>Available Commands:</b>\n\n` +
      `/<b>markets</b> - List all currently open markets\n` +
      `/<b>resolved</b> - Show the latest resolved market\n` +
      `/<b>subscribe</b> - Subscribe to market notifications\n` +
      `/<b>unsubscribe</b> - Unsubscribe from notifications\n` +
      `/<b>resolve [id] [outcome]</b> - Admin only: Resolve a market\n` +
      `/<b>help</b> - Show this help message\n\n` +
      `📢 ${isSubscribed ? '✅ <b>You are subscribed!</b> You will receive notifications when:\n' : 'Subscribe to receive notifications when:\n'}` +
      `  • New markets are created\n` +
      `  • Markets are resolved (with betting totals)\n` +
      `  • AI suggests resolutions for expired markets\n\n` +
      `🔗 Visit: ${SITE_URL}`;
    
    await bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
  });

  // Admin Resolve Command
  bot.onText(/\/resolve (\d+) (\d+)/i, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    
    // Authorization check
    if (!process.env.TELEGRAM_CHAT_ID || !process.env.TELEGRAM_CHAT_ID.includes(chatId)) {
        return bot.sendMessage(chatId, "🚫 Unauthorized. Only the admin can resolve markets.");
    }

    if (!PRIVATE_KEY) {
        return bot.sendMessage(chatId, "❌ Error: PRIVATE_KEY not set in bot environment.");
    }

    const marketId = parseInt(match[1]);
    const outcome = parseInt(match[2]);

    if (![1, 2, 3].includes(outcome)) {
        return bot.sendMessage(chatId, "❌ Invalid outcome. Use 1 (A), 2 (B), or 3 (Refund).");
    }

    try {
        await bot.sendMessage(chatId, `⚙️ Executing resolution for Market #${marketId} with outcome ${outcome}...`);
        
        const account = privateKeyToAccount({
            client,
            privateKey: PRIVATE_KEY,
        });

        const tx = prepareContractCall({
            contract,
            method: "function resolveMarket(uint256 _marketId, uint8 _outcome)",
            params: [BigInt(marketId), outcome],
        });

        const { transactionHash } = await sendTransaction({
            transaction: tx,
            account,
        });

        await bot.sendMessage(chatId, `✅ <b>Market #${marketId} Resolved!</b>\n\n🔗 <a href="https://sonicscan.org/tx/${transactionHash}">View Transaction</a>`, { parse_mode: 'HTML' });
    } catch (error) {
        console.error('Resolution error:', error);
        await bot.sendMessage(chatId, `❌ Error resolving market: ${error.message}`);
    }
  });

  // Subscribe command - adds the chat to notifications
  bot.onText(/\/subscribe/i, async (msg) => {
    try {
      const chatId = msg.chat.id.toString();
      const chatType = msg.chat.type; // 'group', 'supergroup', 'channel', 'private'
      
      subscribedChats.add(chatId);
      await bot.sendMessage(msg.chat.id, '✅ <b>Subscribed!</b> You will now receive notifications for new markets and resolutions.', { parse_mode: 'HTML' });
      console.log(`✅ Chat ${chatId} (${chatType}) subscribed to notifications`);
    } catch (error) {
      console.error('Error handling /subscribe:', error);
    }
  });

  // Unsubscribe command - removes the chat from notifications
  bot.onText(/\/unsubscribe/i, async (msg) => {
    try {
      const chatId = msg.chat.id.toString();
      
      subscribedChats.delete(chatId);
      await bot.sendMessage(msg.chat.id, '❌ <b>Unsubscribed.</b> You will no longer receive notifications.', { parse_mode: 'HTML' });
      console.log(`❌ Chat ${chatId} unsubscribed from notifications`);
    } catch (error) {
      console.error('Error handling /unsubscribe:', error);
    }
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

  // Get initial market count and mark resolved markets
  try {
    const initialCount = await readContract({
      contract,
      method: 'function marketCount() view returns (uint256)',
      params: [],
    });
    const count = Number(initialCount);
    console.log(`📊 Current market count: ${count}`);
    
    // Check each existing market to see if it's resolved
    // This prevents us from checking resolved markets in future polls
    let resolvedCount = 0;
    for (let i = 0; i < count; i++) {
      try {
        const marketData = await readContract({
          contract,
          method: 'function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)',
          params: [BigInt(i)],
        });
        const resolved = marketData[7];
        processedMarkets.set(i, { created: true, resolved });
        if (resolved) resolvedCount++;
      } catch (error) {
        // If we can't read a market, mark it as created but not resolved (will be skipped if it errors)
        processedMarkets.set(i, { created: true, resolved: false });
      }
    }
    console.log(`📊 Found ${resolvedCount} already resolved markets (will be skipped in future checks)`);
  } catch (error) {
    console.warn('Could not fetch initial market count:', error.message);
  }

  // Start polling
  setInterval(async () => {
    try {
      await checkForNewMarkets(contract, bot);
    } catch (error) {
      console.error('Error checking markets:', error);
    }
  }, POLL_INTERVAL);

  // Check immediately
  await checkForNewMarkets(contract, bot);
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

// Send message to all subscribed chats
async function sendToAllSubscribedChats(message, botInstance) {
  if (subscribedChats.size === 0) {
    console.warn('⚠️  No subscribed chats - message not sent');
    return;
  }

  if (!botInstance) {
    console.error('❌ Bot instance not provided');
    return;
  }

  const promises = Array.from(subscribedChats).map(async (chatId) => {
    try {
      await botInstance.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });
      return { success: true, chatId };
    } catch (error) {
      console.error(`❌ Error sending to chat ${chatId}:`, error.message);
      // If chat is not found or bot was removed, unsubscribe
      if (error.response && (error.response.statusCode === 403 || error.response.statusCode === 400)) {
        subscribedChats.delete(chatId);
        console.log(`🗑️  Removed chat ${chatId} from subscriptions (bot may have been removed)`);
      }
      return { success: false, chatId, error: error.message };
    }
  });

  await Promise.allSettled(promises);
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

async function checkForNewMarkets(contract, bot) {
  try {
    // Get current market count
    const marketCount = await readContract({
      contract,
      method: 'function marketCount() view returns (uint256)',
      params: [],
    });

    const count = Number(marketCount);
    let checkedCount = 0;
    let skippedCount = 0;

    // Check each market
    for (let i = 0; i < count; i++) {
      const marketInfo = processedMarkets.get(i) || { created: false, resolved: false };

      // Skip markets that are already resolved and we've notified about them
      // We only need to check unresolved markets or newly created markets
      if (marketInfo.resolved) {
        skippedCount++;
        continue; // Skip already resolved markets
      }

      try {
        // Get market data only for unresolved markets
        const marketData = await readContract({
          contract,
          method: 'function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)',
          params: [BigInt(i)],
        });

        checkedCount++;

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

          // Send to all subscribed chats
          await sendToAllSubscribedChats(message, bot);
          console.log(`✅ Sent notification for new market #${i} to ${subscribedChats.size} chat(s)`);
          
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
            `${SITE_URL}/?market=${i}&tab=resolved`
          );

          // Send to all subscribed chats
          await sendToAllSubscribedChats(message, bot);
          console.log(`✅ Sent notification for resolved market #${i} (outcome: ${outcome}) to ${subscribedChats.size} chat(s)`);
          
          // Mark as resolved - we won't check this market again in future polls
          processedMarkets.set(i, { created: true, resolved: true });
        } else if (resolved) {
          // Update resolved status even if we already notified (shouldn't happen now, but keep as safeguard)
          processedMarkets.set(i, { created: marketInfo.created, resolved: true });
        } else if (!resolved) {
          // AI RESOLUTION CHECK: Market is unresolved. Check if it's expired.
          const isExpired = new Date(Number(endTime) * 1000) < new Date();
          
          if (isExpired && !suggestedResolutions.has(i)) {
            console.log(`🤖 Market #${i} is expired and unresolved. Querying AI for suggestion...`);
            
            const aiResult = await queryGeminiResolution(question);
            
            if (aiResult) {
              const aiMessage = `🤖 <b>AI Resolution Suggestion</b>\n\n` +
                `📊 <b>Market #${i}</b>\n` +
                `❓ <b>Question:</b> ${question}\n\n` +
                `💡 <b>Suggested Outcome:</b> ${aiResult.suggestion}\n` +
                `📝 <b>Reasoning:</b> ${aiResult.reasoning.substring(0, 500)}${aiResult.reasoning.length > 500 ? '...' : ''}\n\n` +
                (aiResult.sources.length > 0 ? `🔗 <b>Sources:</b>\n${aiResult.sources.slice(0, 3).map(s => `• <a href="${s}">Link</a>`).join('\n')}\n\n` : '') +
                `✅ To resolve, type:\n<code>/resolve ${i} ${aiResult.outcome}</code>`;

              // Send only to the first subscribed chat (assumed to be the admin) or all subscribed
              await sendToAllSubscribedChats(aiMessage, bot);
              suggestedResolutions.add(i);
              console.log(`✅ Sent AI suggestion for market #${i}`);
            }
          }
        }

      } catch (error) {
        console.error(`Error checking market ${i}:`, error.message);
      }
    }

    console.log(`⏰ Checked ${checkedCount} unresolved markets (skipped ${skippedCount} resolved) at ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}`);

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

