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
  queryMarketResolvedEvents,
} from '@/lib/alchemy-client';

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
          // Convert stringified BigInts back to BigInt
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
            isLoading: true, // Still loading in background
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

  const fetchingRef = useRef(false); // Prevent concurrent fetches
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (forceRefresh: boolean = false) => {
    if (!userAddress) {
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = statsCache.get(userAddress);
      const now = Date.now();
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        setStats(cached.stats);
        return;
      }
    } else {
      // Clear cache on forced refresh
      statsCache.delete(userAddress);
    }

    try {
      fetchingRef.current = true;
      setStats((prev) => ({ ...prev, isLoading: true, error: null }));

      // Create contract interface for decoding events
      const iface = new ethers.utils.Interface(CONTRACT_ABI);

      // OPTIMIZATION: Query purchases first to get market IDs user participated in
      // Then only query resolved events for those specific markets (much more efficient)
      const purchaseLogs = await querySharesPurchasedEvents(userAddress);
      
      // Decode purchases to get market IDs
      const purchases = purchaseLogs.map((log) => {
        const decoded = iface.decodeEventLog('SharesPurchased', log.data, log.topics);
        return {
          marketId: decoded.marketId.toNumber(),
          amount: BigInt(decoded.amount.toString()),
          isOptionA: decoded.isOptionA,
        };
      });

      // Get unique market IDs user participated in
      const userMarketIds = Array.from(new Set(purchases.map(p => p.marketId)));

      // OPTIMIZATION: Only query resolved events for markets user participated in
      // This reduces from querying ALL markets to just the user's markets
      // Also query winnings and refunds in parallel
      const [winningsLogs, refundLogs, resolvedLogs] = await Promise.all([
        queryWinningsClaimedEvents(userAddress),
        queryRefundClaimedEvents(userAddress),
        userMarketIds.length > 0 
          ? queryMarketResolvedEvents(userMarketIds) // Only query user's markets
          : Promise.resolve([]), // No markets, no need to query
      ]);

      // Purchases already decoded above

      const winnings = winningsLogs.map((log) => {
        const decoded = iface.decodeEventLog('WinningsClaimed', log.data, log.topics);
        return {
          marketId: decoded.marketId.toNumber(),
          amount: BigInt(decoded.amount.toString()), // Convert BigNumber to BigInt
        };
      });

      const refunds = refundLogs.map((log) => {
        const decoded = iface.decodeEventLog('RefundClaimed', log.data, log.topics);
        return {
          marketId: decoded.marketId.toNumber(),
          amount: BigInt(decoded.amount.toString()), // Convert BigNumber to BigInt
        };
      });

      const resolvedMarkets = resolvedLogs.map((log) => {
        const decoded = iface.decodeEventLog('MarketResolved', log.data, log.topics);
        return {
          marketId: decoded.marketId.toNumber(),
          outcome: decoded.outcome,
        };
      });

      // Create a map of market participations
      const marketMap = new Map<number, MarketParticipation>();

      // Process purchases
      purchases.forEach((purchase) => {
        const existing = marketMap.get(purchase.marketId) || {
          marketId: purchase.marketId,
          invested: BigInt(0),
          earned: null,
          refunded: null,
          outcome: 'pending' as const,
          isResolved: false,
        };
        existing.invested += purchase.amount;
        marketMap.set(purchase.marketId, existing);
      });

      // Process winnings
      winnings.forEach((win) => {
        const existing = marketMap.get(win.marketId);
        if (existing) {
          existing.earned = win.amount;
          existing.outcome = 'win';
        }
      });

      // Process refunds
      refunds.forEach((refund) => {
        const existing = marketMap.get(refund.marketId);
        if (existing) {
          existing.refunded = refund.amount;
          existing.outcome = 'refund';
        }
      });

      // Mark resolved markets
      resolvedMarkets.forEach((resolved) => {
        const existing = marketMap.get(resolved.marketId);
        if (existing) {
          existing.isResolved = true;
          // If resolved but no winnings/refund, it's a loss
          // Check for null explicitly (BigInt(0) is truthy, so use !== null)
          if (existing.outcome === 'pending' && existing.earned === null && existing.refunded === null) {
            existing.outcome = 'loss';
          }
        }
      });

      const markets = Array.from(marketMap.values());

      // Calculate totals - ensure all values are BigInt
      const totalInvested = markets.reduce((sum, m) => sum + m.invested, BigInt(0));
      const totalEarned = markets.reduce(
        (sum, m) => sum + (m.earned !== null ? m.earned : BigInt(0)),
        BigInt(0)
      );
      const totalRefunded = markets.reduce(
        (sum, m) => sum + (m.refunded !== null ? m.refunded : BigInt(0)),
        BigInt(0)
      );
      const pnl = totalEarned + totalRefunded - totalInvested;

      // Calculate wins/losses (only for resolved markets)
      const resolvedMarketsList = markets.filter((m) => m.isResolved);
      const wins = resolvedMarketsList.filter((m) => m.outcome === 'win').length;
      const losses = resolvedMarketsList.filter((m) => m.outcome === 'loss').length;
      const winRatio = resolvedMarketsList.length > 0 ? wins / resolvedMarketsList.length : 0;

      // Active markets = unresolved markets with investments
      const activeMarkets = markets.filter(
        (m) => !m.isResolved && m.invested > BigInt(0)
      ).length;

      const finalStats: UserStats = {
        totalInvested,
        totalEarned,
        totalRefunded,
        pnl,
        wins,
        losses,
        winRatio,
        totalMarkets: markets.length,
        activeMarkets,
        markets,
        isLoading: false,
        error: null,
      };

      // Cache the results in memory
      statsCache.set(userAddress, { stats: finalStats, timestamp: Date.now() });
      
      // Cache the results in local storage for persistence (handle BigInt serialization)
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
      setStats((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      }));
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

