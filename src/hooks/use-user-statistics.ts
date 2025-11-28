/**
 * Hook to fetch and calculate user statistics
 * 
 * Calculates statistics by reading contract data directly:
 * 1. Get market count
 * 2. For each market, check user's shares and market resolution
 * 3. Calculate wins/losses and PNL from that data
 */

import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { useState, useEffect } from 'react';
import { readContract } from 'thirdweb';

export interface UserStats {
  totalMarkets: number;
  wins: number;
  losses: number;
  totalInvested: bigint;
  totalEarned: bigint;
  pnl: bigint;
  winRate: number;
}

interface MarketParticipation {
  marketId: number;
  totalInvested: bigint;
  optionAShares: bigint;
  optionBShares: bigint;
  outcome: number;
  resolved: boolean;
  totalOptionAShares: bigint;
  totalOptionBShares: bigint;
}

export function useUserStatistics() {
  const account = useActiveAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get market count
  const { data: marketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: []
  });

  useEffect(() => {
    if (!account?.address || !marketCount || Number(marketCount) === 0) {
      setIsLoading(false);
      if (!account?.address) {
        setStats(null);
      } else {
        setStats({
          totalMarkets: 0,
          wins: 0,
          losses: 0,
          totalInvested: BigInt(0),
          totalEarned: BigInt(0),
          pnl: BigInt(0),
          winRate: 0,
        });
      }
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const userAddress = account.address;
        const participations: MarketParticipation[] = [];

        // Fetch data for all markets in parallel
        const marketPromises = Array.from({ length: Number(marketCount) }, async (_, index) => {
          try {
            const marketId = BigInt(index);
            // Get market info
            const marketData = await readContract({
              contract,
              method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
              params: [marketId]
            });

            // Get user's shares
            const sharesData = await readContract({
              contract,
              method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
              params: [marketId, userAddress as `0x${string}`]
            });

            const optionAShares = sharesData[0] as bigint;
            const optionBShares = sharesData[1] as bigint;
            const totalInvested = optionAShares + optionBShares;

            // Only include markets where user has invested
            if (totalInvested > BigInt(0)) {
              // outcome is uint8, so it's a number (0-255)
              const outcomeValue = marketData[4];
              const outcome = typeof outcomeValue === 'bigint' ? Number(outcomeValue) : (outcomeValue as number);
              
              participations.push({
                marketId: index,
                totalInvested,
                optionAShares,
                optionBShares,
                outcome,
                resolved: marketData[7] as boolean,
                totalOptionAShares: marketData[5] as bigint,
                totalOptionBShares: marketData[6] as bigint,
              });
            }
          } catch (error) {
            console.error(`Error fetching market ${index}:`, error);
            // Continue with other markets on error
          }
        });

        await Promise.all(marketPromises);

        // Calculate statistics (exclude refunded markets and unresolved markets from PNL)
        let totalInvested = BigInt(0);
        let wins = 0;
        let losses = 0;
        let totalEarned = BigInt(0);
        let resolvedInvested = BigInt(0); // Only count investments in resolved markets for PNL

        for (const participation of participations) {
          // Skip refunded markets (outcome === 3) - exclude from all stats
          if (participation.resolved && participation.outcome === 3) {
            continue;
          }

          // Count all non-refunded markets in total invested (for display)
          totalInvested += participation.totalInvested;

          // Only include resolved markets in PNL calculation
          if (participation.resolved) {
            // Only process non-refunded resolutions (outcome 1 or 2)
            if (participation.outcome === 1 || participation.outcome === 2) {
              // Count investment for resolved market in PNL calculation (only once)
              resolvedInvested += participation.totalInvested;

              // Normal resolution - calculate winnings
              const winningShares = participation.outcome === 1
                ? participation.optionAShares
                : participation.optionBShares;

              if (winningShares > BigInt(0)) {
                // User won - calculate their net winnings
                const totalShares = participation.outcome === 1
                  ? participation.totalOptionAShares
                  : participation.totalOptionBShares;
                const totalPool = participation.totalOptionAShares + participation.totalOptionBShares;

                if (totalShares > BigInt(0)) {
                  const grossWinnings = (totalPool * winningShares) / totalShares;
                  const PROTOCOL_FEE_BPS = BigInt(1000); // 10%
                  const protocolFee = (grossWinnings * PROTOCOL_FEE_BPS) / BigInt(10000);
                  const netWinnings = grossWinnings - protocolFee;
                  
                  // netWinnings includes original investment + profit
                  // PNL = netWinnings - investment = profit
                  totalEarned += netWinnings;
                  wins++;
                }
              } else {
                // User lost - they get nothing back (totalEarned stays 0)
                // Investment already counted in resolvedInvested above
                losses++;
              }
            }
          }
        }

        // PNL only includes resolved markets (excludes unresolved and refunded)
        const pnl = totalEarned - resolvedInvested;
        const resolvedMarkets = wins + losses;
        const winRate = resolvedMarkets > 0 ? (wins / resolvedMarkets) * 100 : 0;

        // Count only non-refunded markets
        const nonRefundedMarkets = participations.filter(
          (p) => !(p.resolved && p.outcome === 3)
        ).length;

        setStats({
          totalMarkets: nonRefundedMarkets,
          wins,
          losses,
          totalInvested,
          totalEarned,
          pnl,
          winRate,
        });
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        setStats({
          totalMarkets: 0,
          wins: 0,
          losses: 0,
          totalInvested: BigInt(0),
          totalEarned: BigInt(0),
          pnl: BigInt(0),
          winRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [account?.address, marketCount]);

  return { stats, isLoading };
}
