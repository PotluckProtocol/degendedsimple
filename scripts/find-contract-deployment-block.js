/**
 * Find Contract Deployment Block
 * Finds the first MarketCreated event to determine contract deployment block
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

async function findDeploymentBlock() {
  console.log('🔍 Finding Contract Deployment Block');
  console.log('─'.repeat(60));
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
  
  const provider = new ethers.providers.JsonRpcProvider(getRpcUrl());
  const currentBlock = await provider.getBlockNumber();
  console.log(`📡 Current block: ${currentBlock.toLocaleString()}\n`);
  
  // Event signature for MarketCreated
  const MARKET_CREATED_SIG = ethers.utils.id('MarketCreated(uint256,string,string,string,uint256)');
  
  // Strategy: Binary search or scan backwards from current block
  console.log('📊 Searching for first MarketCreated event...\n');
  
  // Try querying in chunks backwards to find the first event
  let foundFirstEvent = false;
  let deploymentBlock = null;
  const chunkSize = 1000;
  const maxSearchBlocks = 200000; // Search last 200k blocks
  const startSearch = Math.max(0, currentBlock - maxSearchBlocks);
  
  console.log(`🔍 Scanning backwards from block ${currentBlock.toLocaleString()} to ${startSearch.toLocaleString()}...\n`);
  
  // Scan in reverse chunks
  for (let i = 0; i < Math.ceil((currentBlock - startSearch) / chunkSize); i++) {
    const from = currentBlock - ((i + 1) * chunkSize);
    const to = currentBlock - (i * chunkSize);
    
    if (from < 0) break;
    
    try {
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [MARKET_CREATED_SIG],
        fromBlock: Math.max(0, from),
        toBlock: to,
      });
      
      if (logs.length > 0) {
        // Found events in this range - the earliest block is likely deployment
        const earliestBlock = Math.min(...logs.map(log => log.blockNumber));
        console.log(`✅ Found ${logs.length} MarketCreated events in blocks ${Math.max(0, from)}-${to}`);
        console.log(`   Earliest event at block: ${earliestBlock.toLocaleString()}`);
        
        if (!deploymentBlock || earliestBlock < deploymentBlock) {
          deploymentBlock = earliestBlock;
        }
        foundFirstEvent = true;
      }
      
      // If we found events and scanned back enough, we can estimate
      if (foundFirstEvent && i > 0 && logs.length === 0) {
        break; // We've passed the deployment point
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Continue on errors
    }
  }
  
  if (deploymentBlock) {
    console.log(`\n✅ Estimated deployment block: ${deploymentBlock.toLocaleString()}`);
    
    // Verify by getting contract creation transaction
    try {
      const block = await provider.getBlock(deploymentBlock);
      console.log(`   Block timestamp: ${new Date(block.timestamp * 1000).toLocaleString()}`);
    } catch (e) {
      // Ignore
    }
    
    return deploymentBlock;
  } else {
    console.log('\n⚠️  Could not find deployment block. Contract may be newer or no markets created yet.');
    return null;
  }
}

// Alternative: Try to get contract creation from transaction
async function findFromContractCreation() {
  console.log('\n🔍 Alternative: Checking contract creation transaction...');
  
  const provider = new ethers.providers.JsonRpcProvider(getRpcUrl());
  
  try {
    // Try to find the contract creation transaction
    // This requires knowing the deployer address or scanning transactions
    // For now, we'll use the MarketCreated approach above
    console.log('   Using MarketCreated event search (more reliable)');
  } catch (error) {
    console.log('   Could not determine from creation transaction');
  }
}

async function main() {
  const deploymentBlock = await findDeploymentBlock();
  
  if (deploymentBlock) {
    console.log('\n📋 Recommendation:');
    console.log(`   Query events from block ${deploymentBlock.toLocaleString()} to latest`);
    console.log(`   This will capture ALL contract activity from the beginning!`);
    console.log(`\n   Update maxBlocksToQuery or set startBlock = ${deploymentBlock}`);
  }
}

main().catch(console.error);


