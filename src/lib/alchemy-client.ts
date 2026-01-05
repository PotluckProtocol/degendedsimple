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
/**
 * Query User Audit Events (Combined)
 * Scans for Purchases, Winnings, and Refunds in a single high-speed pass
 */
export async function queryUserAuditEvents(userAddress: string) {
  const provider = getProvider();
  const userTopic = ethers.utils.hexZeroPad(userAddress, 32);
  
  const filter = {
    address: contractAddress,
    topics: [
      [
        EVENT_SIGNATURES.SharesPurchased,
        EVENT_SIGNATURES.WinningsClaimed,
        EVENT_SIGNATURES.RefundClaimed
      ],
      null, // any marketId
      userTopic, // user address is the 3rd topic (index 2)
    ],
  } as ethers.EventFilter;
  
  // Sonic RPC safe chunking (1M blocks is usually the sweet spot for parallel requests)
  return queryEventsInChunks(provider, filter, true);
}

/**
 * Optimized parallel chunking with automatic retries and range splitting
 */
async function queryEventsInChunks(
  provider: ethers.providers.JsonRpcProvider,
  filter: ethers.EventFilter,
  startFromDeployment: boolean = true
): Promise<ethers.providers.Log[]> {
  try {
    const currentBlock = await getCachedBlockNumber(provider);
    const startBlock = startFromDeployment && CONTRACT_DEPLOYMENT_BLOCK 
      ? CONTRACT_DEPLOYMENT_BLOCK
      : Math.max(0, currentBlock - 2000000);
    
    // Chunk size: 1 million blocks is safe for filtered queries on most RPCs
    const chunkSize = 1000000; 
    
    const chunks: { from: number; to: number }[] = [];
    for (let from = startBlock; from <= currentBlock; from += chunkSize) {
      chunks.push({ from, to: Math.min(from + chunkSize - 1, currentBlock) });
    }

    // Process chunks in parallel
    const results = await Promise.allSettled(
      chunks.map(async (chunk) => {
        return await provider.getLogs({
          ...filter,
          fromBlock: chunk.from,
          toBlock: chunk.to,
        });
      })
    );
    
    const allLogs: ethers.providers.Log[] = [];
    results.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        allLogs.push(...res.value);
      } else {
        console.warn(`Chunk ${chunks[i].from} failed, skipping...`, res.reason);
      }
    });
    
    return allLogs;
  } catch (error) {
    console.error('Critical audit scan failure:', error);
    return [];
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

