/**
 * Test User Stats for a specific wallet address
 * Queries events and calculates statistics
 */

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xC04c1DE26F5b01151eC72183b5615635E609cC81';
const TEST_WALLET = '0xeA869669210a69B035b382E0F2A498B87dc6a45C';

// Get RPC URL
function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 
         process.env.ALCHEMY_RPC_URL ||
         'https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv' ||
         'https://rpc.soniclabs.com';
}

// Contract ABI for decoding events
const CONTRACT_ABI = [
  'event MarketCreated(uint256 indexed marketId, string question, string optionA, string optionB, uint256 endTime)',
  'event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isOptionA, uint256 amount)',
  'event MarketResolved(uint256 indexed marketId, uint8 outcome)',
  'event WinningsClaimed(uint256 indexed marketId, address indexed winner, uint256 amount)',
  'event RefundClaimed(uint256 indexed marketId, address indexed user, uint256 amount)',
];

// Event signatures
const EVENT_SIGNATURES = {
  SharesPurchased: ethers.utils.id('SharesPurchased(uint256,address,bool,uint256)'),
  WinningsClaimed: ethers.utils.id('WinningsClaimed(uint256,address,uint256)'),
  RefundClaimed: ethers.utils.id('RefundClaimed(uint256,address,uint256)'),
  MarketResolved: ethers.utils.id('MarketResolved(uint256,uint8)'),
};

async function testUserStats() {
  console.log('🔍 Testing User Stats for:', TEST_WALLET);
  console.log('📡 Using RPC:', getRpcUrl().replace(/\/v2\/.*/, '/v2/...'));
  console.log('📝 Contract:', CONTRACT_ADDRESS);
  console.log('');

  const provider = new ethers.providers.JsonRpcProvider(getRpcUrl());
  const iface = new ethers.utils.Interface(CONTRACT_ABI);

  try {
    // Query SharesPurchased events
    console.log('📊 Querying SharesPurchased events...');
    const buyerTopic = ethers.utils.hexZeroPad(TEST_WALLET, 32);
    // Query in chunks to handle Alchemy free tier limit (10 blocks)
    const currentBlock = await provider.getBlockNumber();
    console.log(`📡 Current block: ${currentBlock}`);
    
    // Use 1,000 block chunks (verified to work with upgraded plan)
    const chunkSize = 1000;
    const maxBlocksToQuery = 50000; // Query last 50,000 blocks (should cover substantial history)
    const startBlock = Math.max(0, currentBlock - maxBlocksToQuery);
    console.log(`📊 Querying from block ${startBlock} to ${currentBlock} in ${chunkSize}-block chunks...`);
    
    const purchaseFilter = {
      address: CONTRACT_ADDRESS,
      topics: [
        EVENT_SIGNATURES.SharesPurchased,
        null,
        buyerTopic,
      ],
    };

    // Query in 1,000-block chunks
    const purchaseLogs = [];
    const totalChunks = Math.ceil((currentBlock - startBlock) / chunkSize);
    console.log(`   Querying ${totalChunks} chunks...`);
    
    for (let i = 0; i < totalChunks; i++) {
      const from = startBlock + (i * chunkSize);
      const to = Math.min(from + chunkSize - 1, currentBlock);
      
      try {
        const chunkLogs = await provider.getLogs({
          ...purchaseFilter,
          fromBlock: from,
          toBlock: to,
        });
        purchaseLogs.push(...chunkLogs);
        if (chunkLogs.length > 0) {
          console.log(`  ✓ Found ${chunkLogs.length} purchases in blocks ${from}-${to}`);
        }
        await new Promise(resolve => setTimeout(resolve, 50)); // Rate limit
      } catch (e) {
        // Skip errors
      }
    }
    console.log(`✅ Found ${purchaseLogs.length} purchase events`);

    // Query WinningsClaimed events
    console.log('📊 Querying WinningsClaimed events...');
    const winnerTopic = ethers.utils.hexZeroPad(TEST_WALLET, 32);
    const winningsFilter = {
      address: CONTRACT_ADDRESS,
      topics: [
        EVENT_SIGNATURES.WinningsClaimed,
        null,
        winnerTopic,
      ],
    };

    const winningsLogs = [];
    for (let i = 0; i < totalChunks; i++) {
      const from = startBlock + (i * chunkSize);
      const to = Math.min(from + chunkSize - 1, currentBlock);
      
      try {
        const chunkLogs = await provider.getLogs({
          ...winningsFilter,
          fromBlock: from,
          toBlock: to,
        });
        winningsLogs.push(...chunkLogs);
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        // Skip errors
      }
    }
    console.log(`✅ Found ${winningsLogs.length} winnings claimed events`);

    // Query RefundClaimed events
    console.log('📊 Querying RefundClaimed events...');
    const userTopic = ethers.utils.hexZeroPad(TEST_WALLET, 32);
    const refundFilter = {
      address: CONTRACT_ADDRESS,
      topics: [
        EVENT_SIGNATURES.RefundClaimed,
        null,
        userTopic,
      ],
    };

    const refundLogs = [];
    for (let i = 0; i < totalChunks; i++) {
      const from = startBlock + (i * chunkSize);
      const to = Math.min(from + chunkSize - 1, currentBlock);
      
      try {
        const chunkLogs = await provider.getLogs({
          ...refundFilter,
          fromBlock: from,
          toBlock: to,
        });
        refundLogs.push(...chunkLogs);
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        // Skip errors
      }
    }
    console.log(`✅ Found ${refundLogs.length} refund claimed events`);

    console.log('');
    console.log('📋 Event Details:');
    console.log('─'.repeat(60));

    // Decode and display purchases
    if (purchaseLogs.length > 0) {
      console.log('\n💰 Purchases:');
      let totalInvested = ethers.BigNumber.from(0);
      purchaseLogs.forEach((log, idx) => {
        try {
          const decoded = iface.decodeEventLog('SharesPurchased', log.data, log.topics);
          const amount = decoded.amount;
          totalInvested = totalInvested.add(amount);
          const amountFormatted = (Number(amount) / 1e6).toFixed(2);
          console.log(`  ${idx + 1}. Market #${decoded.marketId.toString()} - ${amountFormatted} USDC (Option ${decoded.isOptionA ? 'A' : 'B'})`);
        } catch (e) {
          console.log(`  Error decoding purchase ${idx + 1}:`, e.message);
        }
      });
      console.log(`  📊 Total Invested: ${(Number(totalInvested) / 1e6).toFixed(2)} USDC`);
    }

    // Decode and display winnings
    if (winningsLogs.length > 0) {
      console.log('\n🎉 Winnings:');
      let totalEarned = ethers.BigNumber.from(0);
      winningsLogs.forEach((log, idx) => {
        try {
          const decoded = iface.decodeEventLog('WinningsClaimed', log.data, log.topics);
          const amount = decoded.amount;
          totalEarned = totalEarned.add(amount);
          const amountFormatted = (Number(amount) / 1e6).toFixed(2);
          console.log(`  ${idx + 1}. Market #${decoded.marketId.toString()} - ${amountFormatted} USDC`);
        } catch (e) {
          console.log(`  Error decoding winnings ${idx + 1}:`, e.message);
        }
      });
      console.log(`  📊 Total Earned: ${(Number(totalEarned) / 1e6).toFixed(2)} USDC`);
    }

    // Decode and display refunds
    if (refundLogs.length > 0) {
      console.log('\n🔄 Refunds:');
      let totalRefunded = ethers.BigNumber.from(0);
      refundLogs.forEach((log, idx) => {
        try {
          const decoded = iface.decodeEventLog('RefundClaimed', log.data, log.topics);
          const amount = decoded.amount;
          totalRefunded = totalRefunded.add(amount);
          const amountFormatted = (Number(amount) / 1e6).toFixed(2);
          console.log(`  ${idx + 1}. Market #${decoded.marketId.toString()} - ${amountFormatted} USDC`);
        } catch (e) {
          console.log(`  Error decoding refund ${idx + 1}:`, e.message);
        }
      });
      console.log(`  📊 Total Refunded: ${(Number(totalRefunded) / 1e6).toFixed(2)} USDC`);
    }

    // Calculate PNL
    console.log('');
    console.log('─'.repeat(60));
    console.log('📊 Statistics Summary:');
    
    const totalInvested = purchaseLogs.reduce((sum, log) => {
      try {
        const decoded = iface.decodeEventLog('SharesPurchased', log.data, log.topics);
        return sum.add(decoded.amount);
      } catch (e) {
        return sum;
      }
    }, ethers.BigNumber.from(0));

    const totalEarned = winningsLogs.reduce((sum, log) => {
      try {
        const decoded = iface.decodeEventLog('WinningsClaimed', log.data, log.topics);
        return sum.add(decoded.amount);
      } catch (e) {
        return sum;
      }
    }, ethers.BigNumber.from(0));

    const totalRefunded = refundLogs.reduce((sum, log) => {
      try {
        const decoded = iface.decodeEventLog('RefundClaimed', log.data, log.topics);
        return sum.add(decoded.amount);
      } catch (e) {
        return sum;
      }
    }, ethers.BigNumber.from(0));

    const pnl = totalEarned.add(totalRefunded).sub(totalInvested);
    const pnlFormatted = (Number(pnl) / 1e6).toFixed(2);
    const pnlPercent = totalInvested.gt(0) 
      ? (Number(pnl.mul(10000).div(totalInvested)) / 100).toFixed(2)
      : '0.00';

    console.log(`  💰 Total Invested: ${(Number(totalInvested) / 1e6).toFixed(2)} USDC`);
    console.log(`  💵 Total Earned: ${(Number(totalEarned) / 1e6).toFixed(2)} USDC`);
    console.log(`  🔄 Total Refunded: ${(Number(totalRefunded) / 1e6).toFixed(2)} USDC`);
    console.log(`  📈 PNL: ${pnlFormatted} USDC (${pnlPercent}%)`);
    console.log(`  🎯 Wins: ${winningsLogs.length}`);
    console.log(`  📊 Total Markets: ${new Set([
      ...purchaseLogs.map(log => {
        try {
          return iface.decodeEventLog('SharesPurchased', log.data, log.topics).marketId.toString();
        } catch { return null; }
      })
    ].filter(Boolean)).size}`);

    console.log('');
    console.log('✅ Test complete!');

  } catch (error) {
    console.error('❌ Error testing user stats:', error);
    console.error('Stack:', error.stack);
  }
}

testUserStats();

