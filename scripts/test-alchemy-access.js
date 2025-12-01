/**
 * Test Alchemy Access with Upgraded Plan
 * Check what block ranges we can query now
 */

require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xC04c1DE26F5b01151eC72183b5615635E609cC81';

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 
         process.env.ALCHEMY_RPC_URL ||
         'https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv' ||
         'https://rpc.soniclabs.com';
}

async function testAlchemyAccess() {
  console.log('🔍 Testing Alchemy Access (Upgraded Plan)');
  console.log('─'.repeat(60));
  
  const provider = new ethers.providers.JsonRpcProvider(getRpcUrl());
  
  try {
    // Get current block
    const currentBlock = await provider.getBlockNumber();
    console.log(`✅ Current block: ${currentBlock.toLocaleString()}`);
    
    // Test 1: Query large block range (full history)
    console.log('\n📊 Test 1: Querying full history (from block 0)...');
    try {
      const EVENT_SIG = ethers.utils.id('MarketCreated(uint256,string,string,string,uint256)');
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [EVENT_SIG],
        fromBlock: 0,
        toBlock: 'latest',
      });
      console.log(`✅ Success! Found ${logs.length} MarketCreated events in full history`);
      console.log(`   Block range: 0 to ${currentBlock.toLocaleString()} (${currentBlock.toLocaleString()} blocks)`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    // Test 2: Query recent events
    console.log('\n📊 Test 2: Querying recent events (last 5000 blocks)...');
    try {
      const EVENT_SIG = ethers.utils.id('SharesPurchased(uint256,address,bool,uint256)');
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [EVENT_SIG],
        fromBlock: Math.max(0, currentBlock - 5000),
        toBlock: 'latest',
      });
      console.log(`✅ Success! Found ${logs.length} SharesPurchased events in last 5000 blocks`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    // Test 3: Query with specific address filter
    console.log('\n📊 Test 3: Querying with address filter...');
    const testAddress = '0xeA869669210a69B035b382E0F2A498B87dc6a45C';
    try {
      const EVENT_SIG = ethers.utils.id('SharesPurchased(uint256,address,bool,uint256)');
      const buyerTopic = ethers.utils.hexZeroPad(testAddress, 32);
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [
          EVENT_SIG,
          null,
          buyerTopic,
        ],
        fromBlock: 0,
        toBlock: 'latest',
      });
      console.log(`✅ Success! Found ${logs.length} events for address ${testAddress} in full history`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('\n─'.repeat(60));
    console.log('✅ Alchemy access test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAlchemyAccess();


