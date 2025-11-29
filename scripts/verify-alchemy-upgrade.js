/**
 * Verify Alchemy Plan Upgrade Status
 * Tests different block ranges to determine current plan limits
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

async function testBlockRange(provider, fromBlock, toBlock, description) {
  try {
    const EVENT_SIG = ethers.utils.id('MarketCreated(uint256,string,string,string,uint256)');
    const logs = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [EVENT_SIG],
      fromBlock,
      toBlock,
    });
    const blockRange = typeof toBlock === 'number' ? toBlock - fromBlock : 'latest';
    console.log(`  ✅ ${description}: ${blockRange} blocks - SUCCESS`);
    return true;
  } catch (error) {
    const blockRange = typeof toBlock === 'number' ? toBlock - fromBlock : 'latest';
    const errorMsg = error.body || error.message || 'Unknown error';
    if (errorMsg.includes('block range')) {
      console.log(`  ❌ ${description}: ${blockRange} blocks - BLOCK RANGE LIMIT`);
    } else {
      console.log(`  ⚠️  ${description}: ${blockRange} blocks - ERROR: ${errorMsg.substring(0, 100)}`);
    }
    return false;
  }
}

async function verifyUpgrade() {
  console.log('🔍 Verifying Alchemy Plan Upgrade Status');
  console.log('─'.repeat(60));
  
  const provider = new ethers.providers.JsonRpcProvider(getRpcUrl());
  const currentBlock = await provider.getBlockNumber();
  
  console.log(`📡 Current block: ${currentBlock.toLocaleString()}`);
  console.log(`🔗 RPC URL: ${getRpcUrl().replace(/\/v2\/[^\/]+/, '/v2/...')}`);
  console.log('');
  
  console.log('📊 Testing Block Range Limits:');
  console.log('');
  
  // Test different ranges
  const tests = [
    { from: currentBlock - 10, to: currentBlock, desc: '10 blocks' },
    { from: currentBlock - 100, to: currentBlock, desc: '100 blocks' },
    { from: currentBlock - 1000, to: currentBlock, desc: '1,000 blocks' },
    { from: currentBlock - 10000, to: currentBlock, desc: '10,000 blocks' },
    { from: Math.max(0, currentBlock - 50000), to: currentBlock, desc: '50,000 blocks' },
    { from: 0, to: 'latest', desc: 'Full history (0 to latest)' },
  ];
  
  let maxWorkingRange = 0;
  
  for (const test of tests) {
    const success = await testBlockRange(provider, test.from, test.to, test.desc);
    if (success && typeof test.to === 'number') {
      maxWorkingRange = Math.max(maxWorkingRange, test.to - test.from);
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
  }
  
  console.log('');
  console.log('─'.repeat(60));
  console.log('📋 Summary:');
  
  if (maxWorkingRange >= 10000) {
    console.log('✅ Upgraded plan detected! Large block ranges work.');
    console.log(`   Max tested range: ${maxWorkingRange.toLocaleString()} blocks`);
  } else if (maxWorkingRange >= 100) {
    console.log('⚠️  Partial upgrade - some limits removed but not full access');
    console.log(`   Max tested range: ${maxWorkingRange.toLocaleString()} blocks`);
  } else {
    console.log('❌ Still on free tier - 10 block limit');
    console.log('   💡 Check:');
    console.log('      1. Upgrade completed in Alchemy dashboard?');
    console.log('      2. API key matches upgraded account?');
    console.log('      3. Changes propagated (may take a few minutes)?');
  }
}

verifyUpgrade();

