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

      // 1. Get total market count
      const marketCountBigInt = await readContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
      });
      const count = Number(marketCountBigInt);

      // 2. Parallel Fast-Track: Check balances and Combined Audit Scan
      // We do the audit scan and balance checks in parallel for maximum speed
      const [balanceChecks, auditLogs] = await Promise.all([
        Promise.all(
          Array.from({ length: count }, (_, i) => 
            readContract({
              contract,
              method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
              params: [BigInt(i), userAddress]
            }).then(res => ({ marketId: i, sharesA: res[0], sharesB: res[1] }))
          )
        ),
        queryUserAuditEvents(userAddress)
      ]);

      const iface = new ethers.utils.Interface(CONTRACT_ABI);
      const userMarketIds = new Set<number>();
      
      // Sort the single audit log stream into its components
      const purchases: {marketId: number, amount: bigint}[] = [];
      const decodedWinnings: any[] = [];
      const decodedRefunds: any[] = [];

      const EVENT_SIGS = {
        PURCHASE: ethers.utils.id('SharesPurchased(uint256,address,bool,uint256)'),
        WINNINGS: ethers.utils.id('WinningsClaimed(uint256,address,uint256)'),
        REFUND: ethers.utils.id('RefundClaimed(uint256,address,uint256)'),
      };

      auditLogs.forEach(log => {
        const sig = log.topics[0];
        try {
          const logName = sig === EVENT_SIGS.PURCHASE ? 'SharesPurchased' : 
                          sig === EVENT_SIGS.WINNINGS ? 'WinningsClaimed' : 
                          sig === EVENT_SIGS.REFUND ? 'RefundClaimed' : null;
          
          if (!logName) return;

          const decoded = iface.decodeEventLog(logName, log.data, log.topics);
          const mId = decoded.marketId.toNumber();
          userMarketIds.add(mId);

          if (sig === EVENT_SIGS.PURCHASE) {
            purchases.push({ marketId: mId, amount: BigInt(decoded.amount.toString()) });
          } else if (sig === EVENT_SIGS.WINNINGS) {
            decodedWinnings.push(decoded);
          } else if (sig === EVENT_SIGS.REFUND) {
            decodedRefunds.push(decoded);
          }
        } catch (e) {
          console.warn('Failed to decode audit log', e);
        }
      });

      // Filter to only markets where user has active shares
      balanceChecks
        .filter(b => b.sharesA > BigInt(0) || b.sharesB > BigInt(0))
        .forEach(b => userMarketIds.add(b.marketId));

      const allUserMarketIds = Array.from(userMarketIds);

      // 3. Fetch state only for markets the user is actually in
      const marketStates = await Promise.all(
        allUserMarketIds.map(async (id) => {
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
        })
      );

      const marketMap = new Map<number, MarketParticipation>();

      // Initialize all user markets
      allUserMarketIds.forEach(id => {
        marketMap.set(id, {
          marketId: id,
          invested: BigInt(0),
          earned: null,
          refunded: null,
          outcome: 'pending',
          isResolved: false
        });
      });

      // Populate data
      purchases.forEach(p => {
        const entry = marketMap.get(p.marketId);
        if (entry) entry.invested += p.amount;
      });

      decodedWinnings.forEach(decoded => {
        const entry = marketMap.get(decoded.marketId.toNumber());
        if (entry) {
          entry.earned = BigInt(decoded.amount.toString());
          entry.outcome = 'win';
        }
      });

      decodedRefunds.forEach(decoded => {
        const entry = marketMap.get(decoded.marketId.toNumber());
        if (entry) {
          entry.refunded = BigInt(decoded.amount.toString());
          entry.outcome = 'refund';
        }
      });

      marketStates.forEach(state => {
        const entry = marketMap.get(state.marketId);
        if (entry) {
          entry.isResolved = state.resolved;
          if (entry.isResolved && entry.outcome === 'pending') {
            if (entry.earned === null && entry.refunded === null) entry.outcome = 'loss';
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

