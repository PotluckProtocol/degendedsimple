/**
 * useUserStats Hook
 * Fetches and calculates user statistics from on-chain events
 */

import { useState, useEffect, useCallback } from 'react';
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

export function useUserStats(userAddress: string | undefined) {
  const [stats, setStats] = useState<UserStats>({
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
  });

  const fetchStats = useCallback(async () => {
    if (!userAddress) {
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStats((prev) => ({ ...prev, isLoading: true, error: null }));

      // Create contract interface for decoding events
      const iface = new ethers.utils.Interface(CONTRACT_ABI);

      // Query all events
      const [purchaseLogs, winningsLogs, refundLogs, resolvedLogs] = await Promise.all([
        querySharesPurchasedEvents(userAddress),
        queryWinningsClaimedEvents(userAddress),
        queryRefundClaimedEvents(userAddress),
        queryMarketResolvedEvents(),
      ]);

      // Decode events - convert BigNumber to BigInt
      const purchases = purchaseLogs.map((log) => {
        const decoded = iface.decodeEventLog('SharesPurchased', log.data, log.topics);
        return {
          marketId: decoded.marketId.toNumber(),
          amount: BigInt(decoded.amount.toString()), // Convert BigNumber to BigInt
          isOptionA: decoded.isOptionA,
        };
      });

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

      setStats({
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
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      }));
    }
  }, [userAddress]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refetch: fetchStats };
}

