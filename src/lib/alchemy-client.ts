/**
 * Event Query Utilities
 * Query contract events using Alchemy RPC (via ethers)
 * Sonic network is not directly supported by Alchemy SDK, so we use ethers directly
 */

import { ethers } from 'ethers';
import { contractAddress } from '@/constants/contract';
import { CONTRACT_DEPLOYMENT_BLOCK } from '@/constants/contract-deployment';

// Get RPC URL - prefer Alchemy, fallback to default Sonic RPC
export function getRpcUrl(): string {
  const rpcUrl = 
    process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 
    process.env.ALCHEMY_RPC_URL ||
    'https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv';
  
  return rpcUrl || 'https://rpc.soniclabs.com';
}

// Create ethers provider with Alchemy RPC
export function getProvider(): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(getRpcUrl());
}

// Event signatures (keccak256 hash of event signature)
const EVENT_SIGNATURES = {
  SharesPurchased: '0x' + ethers.utils.id('SharesPurchased(uint256,address,bool,uint256)').slice(2, 66),
  WinningsClaimed: '0x' + ethers.utils.id('WinningsClaimed(uint256,address,uint256)').slice(2, 66),
  RefundClaimed: '0x' + ethers.utils.id('RefundClaimed(uint256,address,uint256)').slice(2, 66),
  MarketResolved: '0x' + ethers.utils.id('MarketResolved(uint256,uint8)').slice(2, 66),
} as const;

// Cache for current block number to avoid repeated calls
let cachedBlockNumber: { block: number; timestamp: number } | null = null;
const BLOCK_CACHE_TTL = 5000; // Cache block number for 5 seconds

async function getCachedBlockNumber(provider: ethers.providers.JsonRpcProvider): Promise<number> {
  const now = Date.now();
  if (cachedBlockNumber && (now - cachedBlockNumber.timestamp) < BLOCK_CACHE_TTL) {
    return cachedBlockNumber.block;
  }
  
  const block = await provider.getBlockNumber();
  cachedBlockNumber = { block, timestamp: now };
  return block;
}

/**
 * Query events with optimized chunking strategy
 * Verified: 1,000 block chunks work reliably with upgraded Alchemy plan
 * Queries in 1,000 block chunks to cover substantial history efficiently
 * 
 * OPTIMIZATION: Try larger chunks first, fallback to smaller if needed
 */
async function queryEventsInChunks(
  provider: ethers.providers.JsonRpcProvider,
  filter: ethers.EventFilter,
  startFromDeployment: boolean = true // Query from contract deployment block
): Promise<ethers.providers.Log[]> {
  try {
    const currentBlock = await getCachedBlockNumber(provider);
    
    // Start from contract deployment block
    const startBlock = startFromDeployment && CONTRACT_DEPLOYMENT_BLOCK 
      ? CONTRACT_DEPLOYMENT_BLOCK
      : Math.max(0, currentBlock - 200000); // Fallback: last 200k blocks
    
    // OPTIMIZATION: For specific filters (like user address in topics), 
    // we can use much larger chunks. Most providers allow 100k+ block ranges 
    // for specific filters.
    const isSpecificFilter = filter.topics && filter.topics.length > 1 && filter.topics[1] !== null;
    let chunkSize = isSpecificFilter ? 500000 : 50000; 
    
    const allLogs: ethers.providers.Log[] = [];
    let from = startBlock;
    
    while (from <= currentBlock) {
      const to = Math.min(from + chunkSize - 1, currentBlock);
      
      try {
        const chunkLogs = await provider.getLogs({
          ...filter,
          fromBlock: from,
          toBlock: to,
        });
        
        allLogs.push(...chunkLogs);
        from = to + 1;
        
        // Small delay to avoid rate limiting
        if (from <= currentBlock) {
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      } catch (chunkError: any) {
        // If block range is too large or too many results, decrease chunk size and retry
        const isRangeError = chunkError.message?.toLowerCase().includes('block range') ||
                             chunkError.message?.toLowerCase().includes('too many results') ||
                             chunkError.body?.toLowerCase().includes('block range');
        
        if (isRangeError && chunkSize > 1000) {
          chunkSize = Math.floor(chunkSize / 2);
          // Don't increment 'from', just retry with smaller chunk
          continue;
        } else {
          // Non-range error, log and skip this chunk to avoid infinite loop
          console.warn(`⚠️ Error querying blocks ${from}-${to}:`, chunkError.message?.substring(0, 100));
          from = to + 1;
        }
      }
    }
    
    return allLogs;
  } catch (error) {
    console.error('Error querying events:', error);
    throw error;
  }
}

/**
 * Query SharesPurchased events for a specific user
 */
export async function querySharesPurchasedEvents(userAddress: string) {
  const provider = getProvider();
  
  const buyerTopic = ethers.utils.hexZeroPad(userAddress, 32);
  
  // Use type assertion to allow null/undefined in topics (ethers.js accepts this at runtime)
  const filter = {
    address: contractAddress,
    topics: [
      EVENT_SIGNATURES.SharesPurchased,
      null, // any marketId
      buyerTopic, // specific buyer
    ],
  } as ethers.EventFilter;
  
  try {
    const logs = await queryEventsInChunks(provider, filter);
    return logs;
  } catch (error) {
    console.error('Error querying SharesPurchased events:', error);
    throw error;
  }
}

/**
 * Query WinningsClaimed events for a specific user
 */
export async function queryWinningsClaimedEvents(userAddress: string) {
  const provider = getProvider();
  
  const winnerTopic = ethers.utils.hexZeroPad(userAddress, 32);
  
  // Use type assertion to allow null/undefined in topics (ethers.js accepts this at runtime)
  const filter = {
    address: contractAddress,
    topics: [
      EVENT_SIGNATURES.WinningsClaimed,
      null, // any marketId
      winnerTopic, // specific winner
    ],
  } as ethers.EventFilter;
  
  try {
    const logs = await queryEventsInChunks(provider, filter);
    return logs;
  } catch (error) {
    console.error('Error querying WinningsClaimed events:', error);
    throw error;
  }
}

/**
 * Query RefundClaimed events for a specific user
 */
export async function queryRefundClaimedEvents(userAddress: string) {
  const provider = getProvider();
  
  const userTopic = ethers.utils.hexZeroPad(userAddress, 32);
  
  // Use type assertion to allow null/undefined in topics (ethers.js accepts this at runtime)
  const filter = {
    address: contractAddress,
    topics: [
      EVENT_SIGNATURES.RefundClaimed,
      null, // any marketId
      userTopic, // specific user
    ],
  } as ethers.EventFilter;
  
  try {
    const logs = await queryEventsInChunks(provider, filter);
    return logs;
  } catch (error) {
    console.error('Error querying RefundClaimed events:', error);
    throw error;
  }
}

/**
 * Query MarketResolved events
 * Optimized to query all resolved events in one go with chunking
 */
export async function queryMarketResolvedEvents(marketIds?: number[]) {
  const provider = getProvider();
  
  const filter = {
    address: contractAddress,
    topics: [
      EVENT_SIGNATURES.MarketResolved,
    ],
  } as ethers.EventFilter;
  
  try {
    // Query all resolved events using our optimized chunking
    const logs = await queryEventsInChunks(provider, filter);
    
    // If specific market IDs provided, filter locally
    if (marketIds && marketIds.length > 0) {
      const iface = new ethers.utils.Interface([
        'event MarketResolved(uint256 indexed marketId, uint8 outcome)'
      ]);
      
      return logs.filter(log => {
        try {
          const decoded = iface.decodeEventLog('MarketResolved', log.data, log.topics);
          return marketIds.includes(decoded.marketId.toNumber());
        } catch (e) {
          return false;
        }
      });
    }
    
    return logs;
  } catch (error) {
    console.error('Error querying MarketResolved events:', error);
    throw error;
  }
}

