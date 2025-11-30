/**
 * Resolved Markets List Component
 * 
 * Fetches resolved markets with pagination, sorted by market ID (newest first)
 */

'use client'
import { useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { MarketCard } from './marketCard';
import { MarketCardSkeleton } from './market-card-skeleton';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from './ui/button';

interface MarketData {
  marketId: number;
  endTime: bigint;
}

// Markets to load per page
const MARKETS_PER_PAGE = 30;
// Initial batch size for first load (start from highest IDs, work backwards)
const INITIAL_BATCH_SIZE = 50;

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
  const [displayedCount, setDisplayedCount] = useState(MARKETS_PER_PAGE);
  const [checkedRange, setCheckedRange] = useState(INITIAL_BATCH_SIZE);

  const totalMarkets = Number(marketCount);

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

  // Sort markets by market ID descending (newest markets first)
  // Since newer markets (higher IDs) were created more recently,
  // they're likely to have been resolved more recently as well
  const sortedMarketIds = useMemo(() => {
    const marketIds = Array.from(marketEndTimes.keys())
      .sort((a, b) => {
        // Sort by market ID descending (newest first)
        // Higher market ID = created more recently = likely resolved more recently
        return b - a;
      });

    return marketIds;
  }, [marketEndTimes]);

  // Get markets to display (paginated)
  const displayedMarketIds = useMemo(() => {
    return sortedMarketIds.slice(0, displayedCount);
  }, [sortedMarketIds, displayedCount]);

  // Check if we need to load more
  const hasMoreMarkets = displayedMarketIds.length < sortedMarketIds.length;
  const hasMoreToCheck = checkedRange < totalMarkets;
  const needsMoreData = displayedMarketIds.length < MARKETS_PER_PAGE && hasMoreToCheck;

  // Expand search range if we don't have enough markets yet
  // Start from highest IDs and work backwards (newest first)
  useEffect(() => {
    if (needsMoreData && checkedRange < totalMarkets) {
      // Expand by another batch
      setCheckedRange(prev => Math.min(prev + INITIAL_BATCH_SIZE, totalMarkets));
    }
  }, [needsMoreData, checkedRange, totalMarkets, displayedMarketIds.length]);

  // Load more markets to display
  const handleLoadMore = useCallback(() => {
    setDisplayedCount(prev => prev + MARKETS_PER_PAGE);
    // Also expand search range if needed
    if (checkedRange < totalMarkets) {
      setCheckedRange(prev => Math.min(prev + INITIAL_BATCH_SIZE, totalMarkets));
    }
  }, [checkedRange, totalMarkets]);

  // Markets we're currently checking (from highest IDs downwards)
  // Start from newest markets first (better UX - shows recent resolved markets)
  const marketsToCheck = useMemo(() => {
    if (totalMarkets === 0) return [];
    const start = Math.max(0, totalMarkets - checkedRange);
    const end = totalMarkets;
    return Array.from({ length: end - start }, (_, i) => end - 1 - i);
  }, [totalMarkets, checkedRange]);

  return (
    <>
      {/* Fetch end times for markets in current range */}
      {marketsToCheck.map((index) => (
        <ResolvedMarketFetcher
          key={`resolved-${index}`}
          marketId={index}
          onMarketFetched={handleMarketFetched}
          onMarketChecked={handleMarketChecked}
        />
      ))}

      {/* Render sorted markets */}
      {displayedMarketIds.length === 0 && checkedMarkets.size < Math.min(INITIAL_BATCH_SIZE, totalMarkets) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(6, totalMarkets) }, (_, i) => (
            <MarketCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : displayedMarketIds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No resolved markets found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedMarketIds.map((marketId) => (
              <MarketCard
                key={marketId}
                index={marketId}
                filter="resolved"
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {(hasMoreMarkets || hasMoreToCheck) && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="min-w-[200px]"
              >
                {hasMoreMarkets 
                  ? `Load More Markets (${sortedMarketIds.length - displayedMarketIds.length} more)`
                  : hasMoreToCheck
                  ? `Search More Markets...`
                  : 'Load More'}
              </Button>
            </div>
          )}
          
          {displayedMarketIds.length > 0 && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              Showing {displayedMarketIds.length} of {sortedMarketIds.length} resolved markets
              {hasMoreToCheck && ` (searched ${checkedRange} of ${totalMarkets} total markets)`}
            </div>
          )}
        </>
      )}
    </>
  );
}
