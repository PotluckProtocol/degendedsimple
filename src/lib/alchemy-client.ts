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
    let chunkSize = 10000; // Try 10k blocks first (10x larger chunks = 10x fewer calls)
    
    // Start from contract deployment block (most efficient - captures ALL history)
    // Or from a fixed range if deployment block not available
    const startBlock = startFromDeployment && CONTRACT_DEPLOYMENT_BLOCK 
      ? CONTRACT_DEPLOYMENT_BLOCK
      : Math.max(0, currentBlock - 100000); // Fallback: last 100k blocks
    
    const allLogs: ethers.providers.Log[] = [];
    
    // Calculate number of chunks needed
    let totalChunks = Math.ceil((currentBlock - startBlock) / chunkSize);
    
    // Try with larger chunks first
    let lastError: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt === 1) {
        // Fallback to smaller chunks if large chunks fail
        chunkSize = 1000;
        totalChunks = Math.ceil((currentBlock - startBlock) / chunkSize);
      }
      
      allLogs.length = 0; // Reset logs
      let hasError = false;
      
      // Query in chunks
      for (let i = 0; i < totalChunks; i++) {
        const from = startBlock + (i * chunkSize);
        const to = Math.min(from + chunkSize - 1, currentBlock);
        
        try {
          const chunkLogs = await provider.getLogs({
            ...filter,
            fromBlock: from,
            toBlock: to,
          });
          
          allLogs.push(...chunkLogs);
          
          // Small delay to avoid rate limiting (only between chunks)
          if (i < totalChunks - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (chunkError: any) {
          // Check if it's a block range error (chunk too large)
          const isBlockRangeError = chunkError.message?.includes('block range') ||
                                    chunkError.body?.includes('block range') ||
                                    chunkError.message?.includes('query returned more than');
          
          if (isBlockRangeError && attempt === 0) {
            // Large chunk failed, break and retry with smaller chunks
            hasError = true;
            lastError = chunkError;
            break;
          } else if (!isBlockRangeError) {
            // Non-block-range error - log but continue
            console.warn(`⚠️  Error querying blocks ${from}-${to}:`, chunkError.message?.substring(0, 100));
          }
        }
      }
      
      // If no errors or we're on the fallback attempt, return results
      if (!hasError || attempt === 1) {
        return allLogs;
      }
    }
    
    // If we get here, both attempts had issues
    if (lastError) {
      throw lastError;
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
 * Query MarketResolved events for specific market IDs (much more efficient than querying all)
 * If marketIds is provided, only queries those specific markets
 * If marketIds is empty/undefined, queries all resolved markets (less efficient)
 */
export async function queryMarketResolvedEvents(marketIds?: number[]) {
  const provider = getProvider();
  
  // If specific market IDs provided, query only those (much more efficient)
  if (marketIds && marketIds.length > 0) {
    // Query each market ID separately but batch them
    const allLogs: ethers.providers.Log[] = [];
    
    // Batch queries: query multiple market IDs in parallel
    const queries = marketIds.map(async (marketId) => {
      const marketIdTopic = ethers.utils.hexZeroPad(ethers.BigNumber.from(marketId).toHexString(), 32);
      const filter = {
        address: contractAddress,
        topics: [
          EVENT_SIGNATURES.MarketResolved,
          marketIdTopic, // specific marketId
        ],
      } as ethers.EventFilter;
      
      try {
        // For specific market IDs, we can query from deployment block in one go
        // since there should be at most one resolved event per market
        const currentBlock = await provider.getBlockNumber();
        const startBlock = CONTRACT_DEPLOYMENT_BLOCK || Math.max(0, currentBlock - 100000);
        
        const logs = await provider.getLogs({
          ...filter,
          fromBlock: startBlock,
          toBlock: currentBlock,
        });
        
        return logs;
      } catch (error) {
        console.warn(`Error querying MarketResolved for market ${marketId}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(queries);
    results.forEach(logs => allLogs.push(...logs));
    
    return allLogs;
  }
  
  // Fallback: query all resolved markets (less efficient, but needed if no marketIds provided)
  const filter = {
    address: contractAddress,
    topics: [
      EVENT_SIGNATURES.MarketResolved,
      null, // any marketId
    ],
  } as ethers.EventFilter;
  
  try {
    const logs = await queryEventsInChunks(provider, filter);
    return logs;
  } catch (error) {
    console.error('Error querying MarketResolved events:', error);
    throw error;
  }
}

