/**
 * Resolved Markets List Component
 * 
 * Fetches all resolved markets and displays them sorted by end time (newest first)
 */

'use client'
import { useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { MarketCard } from './marketCard';
import { MarketCardSkeleton } from './market-card-skeleton';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { readContract } from 'thirdweb';

interface MarketData {
  marketId: number;
  endTime: bigint;
}

// Component to fetch end time for a single resolved market
function ResolvedMarketFetcher({
  marketId,
  onMarketFetched,
  onMarketChecked
}: {
  marketId: number;
  onMarketFetched: (marketId: number, endTime: bigint) => void;
  onMarketChecked: (marketId: number) => void;
}) {
  const { data: marketData, isLoading, error } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
    params: [BigInt(marketId)]
  });

  useEffect(() => {
    if (!isLoading) {
      onMarketChecked(marketId); // Always notify that we've checked this market

      if (marketData && !error) {
        try {
          const resolved = marketData[7] as boolean;
          const endTime = marketData[3] as bigint;

          // Only process resolved markets
          if (resolved) {
            onMarketFetched(marketId, endTime);
          }
        } catch (e) {
          console.error(`Error processing market data for marketId ${marketId}:`, e);
        }
      } else if (error) {
        console.error(`Error fetching market data for marketId ${marketId}:`, error);
      }
    }
  }, [marketData, isLoading, error, marketId, onMarketFetched, onMarketChecked]);

  return null; // This component doesn't render anything
}

export function ResolvedMarketsList({
  marketCount
}: {
  marketCount: bigint
}) {
  const [marketEndTimes, setMarketEndTimes] = useState<Map<number, bigint>>(new Map());
  const [checkedMarkets, setCheckedMarkets] = useState<Set<number>>(new Set());

  // Handle end time updates (only for resolved markets)
  const handleMarketFetched = useCallback((marketId: number, endTime: bigint) => {
    setMarketEndTimes(prev => {
      const updated = new Map(prev);
      updated.set(marketId, endTime);
      return updated;
    });
  }, []);

  // Track which markets have been checked
  const handleMarketChecked = useCallback((marketId: number) => {
    setCheckedMarkets(prev => {
      const updated = new Set(prev);
      updated.add(marketId);
      return updated;
    });
  }, []);

  // Sort markets by end time (newest first - descending order)
  const sortedMarketIds = useMemo(() => {
    const marketsArray = Array.from(marketEndTimes.entries())
      .sort(([_, endTimeA], [__, endTimeB]) => {
        // Sort by endTime descending (newest first)
        if (endTimeA > endTimeB) return -1;
        if (endTimeA < endTimeB) return 1;
        return 0;
      });

    return marketsArray.map(([marketId]) => marketId);
  }, [marketEndTimes]);

  // Consider loaded when we've checked all markets
  const allMarketsLoaded = checkedMarkets.size >= Number(marketCount) && Number(marketCount) > 0;

  return (
    <>
      {/* Fetch end times for all markets */}
      {Array.from({ length: Number(marketCount) }, (_, index) => (
        <ResolvedMarketFetcher
          key={`resolved-${index}`}
          marketId={index}
          onMarketFetched={handleMarketFetched}
          onMarketChecked={handleMarketChecked}
        />
      ))}

      {/* Render sorted markets */}
      {!allMarketsLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(6, Number(marketCount)) }, (_, i) => (
            <MarketCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : sortedMarketIds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No resolved markets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedMarketIds.map((marketId) => (
            <MarketCard
              key={marketId}
              index={marketId}
              filter="resolved"
            />
          ))}
        </div>
      )}
    </>
  );
}

