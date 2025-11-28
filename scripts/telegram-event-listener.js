/**
 * Telegram Event Listener
 * Polls contract events and sends Telegram notifications
 * Run this as a background service or cron job
 */

require('dotenv').config({ path: '.env.local' });
const { createThirdwebClient, getContract, getContractEvents } = require('thirdweb');
const { defineChain } = require('thirdweb/chains');
const { 
  sendTelegramMessage, 
  formatMarketCreatedMessage, 
  formatMarketResolvedMessage,
  initTelegramBot 
} = require('../lib/telegram-bot');

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xC04c1DE26F5b01151eC72183b5615635E609cC81';
const POLL_INTERVAL = 60000; // Poll every 60 seconds
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://degended.bet';

// Define Sonic chain (use Alchemy RPC if available for better performance)
const sonic = defineChain({
  id: 146,
  rpc: process.env.ALCHEMY_RPC_URL || 'https://rpc.soniclabs.com',
});

// Track processed events
const processedMarketCreated = new Set();
const processedMarketResolved = new Set();

async function main() {
  console.log('🤖 Starting Telegram Event Listener...');
  
  // Initialize Telegram bot
  if (!process.env.TELEGRAM_CHAT_ID) {
    console.error('❌ TELEGRAM_CHAT_ID not set in .env.local');
    console.log('💡 Send a message to your bot first, then get the chat ID from:');
    console.log('   https://api.telegram.org/bot8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs/getUpdates');
    process.exit(1);
  }

  initTelegramBot(process.env.TELEGRAM_CHAT_ID);
  console.log('✅ Telegram bot initialized');

  // Initialize thirdweb client
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  });

  const contract = getContract({
    client,
    chain: sonic,
    address: CONTRACT_ADDRESS,
  });

  console.log(`📡 Listening to contract: ${CONTRACT_ADDRESS}`);
  console.log(`🔄 Polling interval: ${POLL_INTERVAL / 1000} seconds\n`);

  // Start polling
  setInterval(async () => {
    try {
      await checkForNewEvents(contract);
    } catch (error) {
      console.error('Error checking events:', error);
    }
  }, POLL_INTERVAL);

  // Check immediately
  await checkForNewEvents(contract);
}

async function checkForNewEvents(contract) {
  try {
    // Check for new markets
    try {
      const marketCreatedEvents = await getContractEvents({
        contract,
        eventName: 'MarketCreated',
      });

      for (const event of marketCreatedEvents) {
        if (!event.args) continue;
        
        const marketId = Number(event.args.marketId);
        const eventKey = `${marketId}`;

        if (!processedMarketCreated.has(eventKey)) {
          processedMarketCreated.add(eventKey);
          
          const question = event.args.question;
          const optionA = event.args.optionA;
          const optionB = event.args.optionB;
          const endTime = new Date(Number(event.args.endTime) * 1000);

          const message = formatMarketCreatedMessage(
            marketId,
            question,
            optionA,
            optionB,
            endTime,
            `${SITE_URL}/?market=${marketId}`
          );

          await sendTelegramMessage(message);
          console.log(`✅ Sent notification for new market #${marketId}`);
        }
      }
    } catch (error) {
      console.warn('Could not fetch MarketCreated events:', error.message);
    }

    // Check for resolved markets
    try {
      const resolvedEvents = await getContractEvents({
        contract,
        eventName: 'MarketResolved',
      });

      for (const event of resolvedEvents) {
        if (!event.args) continue;
        
        const marketId = Number(event.args.marketId);
        const eventKey = `${marketId}-${event.args.outcome}`;

        if (!processedMarketResolved.has(eventKey)) {
          processedMarketResolved.add(eventKey);
          
          // Need to fetch market details
          const { readContract } = require('thirdweb');
          const marketData = await readContract({
            contract,
            method: 'function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)',
            params: [BigInt(marketId)],
          });
          
          const outcome = Number(event.args.outcome);
          const question = marketData[0];
          const optionA = marketData[1];
          const optionB = marketData[2];
          const totalOptionAShares = marketData[5];
          const totalOptionBShares = marketData[6];

          const message = formatMarketResolvedMessage(
            marketId,
            question,
            outcome,
            optionA,
            optionB,
            totalOptionAShares,
            totalOptionBShares,
            `${SITE_URL}/?market=${marketId}`
          );

          await sendTelegramMessage(message);
          console.log(`✅ Sent notification for resolved market #${marketId}`);
        }
      }
    } catch (error) {
      console.warn('Could not fetch MarketResolved events:', error.message);
    }

  } catch (error) {
    console.error('Error in checkForNewEvents:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Telegram Event Listener...');
  process.exit(0);
});

main().catch(console.error);

