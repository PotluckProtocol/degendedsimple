/**
 * useUserStats Hook
 * Fetches and calculates user statistics from on-chain events
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import {
  querySharesPurchasedEvents,
  queryWinningsClaimedEvents,
  queryRefundClaimedEvents,
} from '@/lib/alchemy-client';
import { contract } from '@/constants/contract';
import { readContract } from 'thirdweb';

export interface UserStats {
  totalInvested: bigint;
  totalEarned: bigint;
  totalRefunded: bigint;
  pnl: bigint;
  wins: number;
  losses: number;
  winRatio: number;
  totalMarkets: number;
  activeMarkets: number;
  markets: MarketParticipation[];
  isLoading: boolean;
  error: string | null;
  refetch?: () => void;
}

export interface MarketParticipation {
  marketId: number;
  invested: bigint;
  earned: bigint | null; // null if not yet claimed/resolved
  refunded: bigint | null;
  outcome: 'win' | 'loss' | 'refund' | 'pending';
  isResolved: boolean;
}

// Contract ABI for decoding events
const CONTRACT_ABI = [
  'event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isOptionA, uint256 amount)',
  'event WinningsClaimed(uint256 indexed marketId, address indexed winner, uint256 amount)',
  'event RefundClaimed(uint256 indexed marketId, address indexed user, uint256 amount)',
  'event MarketResolved(uint256 indexed marketId, uint8 outcome)',
];

// Cache for user stats to prevent redundant API calls
const statsCache = new Map<string, { stats: UserStats; timestamp: number }>();
const CACHE_TTL = 60000; // Cache for 60 seconds

// Local storage key prefix
const STORAGE_KEY_PREFIX = 'user_stats_';

export function useUserStats(userAddress: string | undefined) {
  const [stats, setStats] = useState<UserStats>(() => {
    // Try to load from local storage initially for instant display
    if (typeof window !== 'undefined' && userAddress) {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userAddress.toLowerCase()}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            totalInvested: BigInt(parsed.totalInvested),
            totalEarned: BigInt(parsed.totalEarned),
            totalRefunded: BigInt(parsed.totalRefunded),
            pnl: BigInt(parsed.pnl),
            markets: parsed.markets.map((m: any) => ({
              ...m,
              invested: BigInt(m.invested),
              earned: m.earned !== null ? BigInt(m.earned) : null,
              refunded: m.refunded !== null ? BigInt(m.refunded) : null,
            })),
            isLoading: true,
          };
        }
      } catch (e) {
        console.warn('Failed to parse cached stats', e);
      }
    }
    
    return {
      totalInvested: BigInt(0),
      totalEarned: BigInt(0),
      totalRefunded: BigInt(0),
      pnl: BigInt(0),
      wins: 0,
      losses: 0,
      winRatio: 0,
      totalMarkets: 0,
      activeMarkets: 0,
      markets: [],
      isLoading: true,
      error: null,
    };
  });

  const fetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (forceRefresh: boolean = false) => {
    if (!userAddress) {
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (fetchingRef.current) return;

    if (!forceRefresh) {
      const cached = statsCache.get(userAddress);
      const now = Date.now();
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        setStats(cached.stats);
        return;
      }
    } else {
      statsCache.delete(userAddress);
    }

    try {
      fetchingRef.current = true;
      setStats((prev) => ({ ...prev, isLoading: true, error: null }));

      const iface = new ethers.utils.Interface(CONTRACT_ABI);
      const purchaseLogs = await querySharesPurchasedEvents(userAddress);
      
      const purchases = purchaseLogs.map((log) => {
        const decoded = iface.decodeEventLog('SharesPurchased', log.data, log.topics);
        return {
          marketId: decoded.marketId.toNumber(),
          amount: BigInt(decoded.amount.toString()),
          isOptionA: decoded.isOptionA,
        };
      });

      const userMarketIds = Array.from(new Set(purchases.map(p => p.marketId)));

      // OPTIMIZATION: Instead of scanning the whole chain for MarketResolved events,
      // we just read the market info directly for the specific IDs the user is in.
      const [winningsLogs, refundLogs, marketStates] = await Promise.all([
        queryWinningsClaimedEvents(userAddress),
        queryRefundClaimedEvents(userAddress),
        userMarketIds.length > 0 
          ? Promise.all(userMarketIds.map(async (id) => {
              try {
                const data = await readContract({
                  contract,
                  method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
                  params: [BigInt(id)]
                });
                return { marketId: id, outcome: data[4], resolved: data[7] };
              } catch (e) {
                return { marketId: id, outcome: 0, resolved: false };
              }
            }))
          : Promise.resolve([]),
      ]);

      const marketMap = new Map<number, MarketParticipation>();

      purchases.forEach((p) => {
        const existing = marketMap.get(p.marketId) || {
          marketId: p.marketId,
          invested: BigInt(0),
          earned: null,
          refunded: null,
          outcome: 'pending' as const,
          isResolved: false,
        };
        existing.invested += p.amount;
        marketMap.set(p.marketId, existing);
      });

      winningsLogs.forEach((log) => {
        const decoded = iface.decodeEventLog('WinningsClaimed', log.data, log.topics);
        const mId = decoded.marketId.toNumber();
        const existing = marketMap.get(mId);
        if (existing) {
          existing.earned = BigInt(decoded.amount.toString());
          existing.outcome = 'win';
        }
      });

      refundLogs.forEach((log) => {
        const decoded = iface.decodeEventLog('RefundClaimed', log.data, log.topics);
        const mId = decoded.marketId.toNumber();
        const existing = marketMap.get(mId);
        if (existing) {
          existing.refunded = BigInt(decoded.amount.toString());
          existing.outcome = 'refund';
        }
      });

      marketStates.forEach((state) => {
        const existing = marketMap.get(state.marketId);
        if (existing) {
          existing.isResolved = state.resolved;
          if (existing.isResolved && existing.outcome === 'pending') {
            if (existing.earned === null && existing.refunded === null) {
              existing.outcome = 'loss';
            }
          }
        }
      });

      const markets = Array.from(marketMap.values());
      const totalInvested = markets.reduce((sum, m) => sum + m.invested, BigInt(0));
      const totalEarned = markets.reduce((sum, m) => sum + (m.earned || BigInt(0)), BigInt(0));
      const totalRefunded = markets.reduce((sum, m) => sum + (m.refunded || BigInt(0)), BigInt(0));
      const pnl = totalEarned + totalRefunded - totalInvested;

      const resolvedList = markets.filter(m => m.isResolved);
      const wins = resolvedList.filter(m => m.outcome === 'win').length;
      const losses = resolvedList.filter(m => m.outcome === 'loss').length;
      const winRatio = resolvedList.length > 0 ? wins / resolvedList.length : 0;
      const activeMarkets = markets.filter(m => !m.isResolved && m.invested > BigInt(0)).length;

      const finalStats: UserStats = {
        totalInvested, totalEarned, totalRefunded, pnl, wins, losses, winRatio,
        totalMarkets: markets.length, activeMarkets, markets, isLoading: false, error: null,
      };

      statsCache.set(userAddress, { stats: finalStats, timestamp: Date.now() });
      if (typeof window !== 'undefined') {
        const serializable = {
          ...finalStats,
          totalInvested: totalInvested.toString(),
          totalEarned: totalEarned.toString(),
          totalRefunded: totalRefunded.toString(),
          pnl: pnl.toString(),
          markets: markets.map(m => ({
            ...m,
            invested: m.invested.toString(),
            earned: m.earned?.toString() || null,
            refunded: m.refunded?.toString() || null,
          }))
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userAddress.toLowerCase()}`, JSON.stringify(serializable));
      }

      setStats(finalStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats((prev) => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' }));
    } finally {
      fetchingRef.current = false;
    }
  }, [userAddress]);

  useEffect(() => {
    // Debounce rapid re-fetches (e.g., when address changes quickly)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchStats();
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchStats]);

  // Refetch function that forces a refresh (clears cache)
  const refetch = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  return { ...stats, refetch };
}

