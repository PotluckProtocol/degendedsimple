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

/**
 * Query events with optimized chunking strategy
 * Verified: 1,000 block chunks work reliably with upgraded Alchemy plan
 * Queries in 1,000 block chunks to cover substantial history efficiently
 */
async function queryEventsInChunks(
  provider: ethers.providers.JsonRpcProvider,
  filter: ethers.EventFilter,
  startFromDeployment: boolean = true // Query from contract deployment block
): Promise<ethers.providers.Log[]> {
  try {
    const currentBlock = await provider.getBlockNumber();
    const chunkSize = 1000; // 1,000 blocks per chunk (verified to work)
    
    // Start from contract deployment block (most efficient - captures ALL history)
    // Or from a fixed range if deployment block not available
    const startBlock = startFromDeployment && CONTRACT_DEPLOYMENT_BLOCK 
      ? CONTRACT_DEPLOYMENT_BLOCK
      : Math.max(0, currentBlock - 100000); // Fallback: last 100k blocks
    
    const allLogs: ethers.providers.Log[] = [];
    
    // Calculate number of chunks needed
    const totalChunks = Math.ceil((currentBlock - startBlock) / chunkSize);
    
    // Query range calculated from deployment block for optimal coverage
    
    // Query in 1,000 block chunks
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
        // Continue on errors - might be empty range or other non-critical issue
        // Only log if it's not a block range error (those are expected for some chunks)
        const isBlockRangeError = chunkError.message?.includes('block range') ||
                                  chunkError.body?.includes('block range');
        if (!isBlockRangeError) {
          // Log non-block-range errors for debugging
          console.warn(`⚠️  Error querying blocks ${from}-${to}:`, chunkError.message?.substring(0, 100));
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
 */
export async function queryMarketResolvedEvents(marketId?: number) {
  const provider = getProvider();
  
  const marketIdTopic: string | null = marketId !== undefined 
    ? ethers.utils.hexZeroPad(ethers.BigNumber.from(marketId).toHexString(), 32)
    : null;
  
  // Use type assertion to allow null/undefined in topics (ethers.js accepts this at runtime)
  const filter = {
    address: contractAddress,
    topics: [
      EVENT_SIGNATURES.MarketResolved,
      marketIdTopic, // specific marketId or null for all
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

