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
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  marketCount,
  highlightMarketId
}: {
  marketCount: bigint;
  highlightMarketId?: number;
}) {
  const [marketEndTimes, setMarketEndTimes] = useState<Map<number, bigint>>(new Map());
  const [checkedMarkets, setCheckedMarkets] = useState<Set<number>>(new Set());
  const [displayedCount, setDisplayedCount] = useState(MARKETS_PER_PAGE);
  const [checkedRange, setCheckedRange] = useState(INITIAL_BATCH_SIZE);
  const highlightRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

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
  // If highlightMarketId is specified, show ONLY that market (isolated view)
  const displayedMarketIds = useMemo(() => {
    if (highlightMarketId !== undefined) {
      // If we're highlighting a specific market, show ONLY that market
      const hasHighlightMarket = sortedMarketIds.includes(highlightMarketId);
      
      if (hasHighlightMarket) {
        // Return only the highlighted market
        return [highlightMarketId];
      } else {
        // Market not found yet, return empty array (will show loading)
        return [];
      }
    }
    // Normal pagination when no specific market is highlighted
    return sortedMarketIds.slice(0, displayedCount);
  }, [sortedMarketIds, displayedCount, highlightMarketId]);

  // Check if we need to load more
  const hasMoreMarkets = displayedMarketIds.length < sortedMarketIds.length;
  const hasMoreToCheck = checkedRange < totalMarkets;
  const needsMoreData = displayedMarketIds.length < MARKETS_PER_PAGE && hasMoreToCheck;

  // Expand search range if we don't have enough markets yet
  // Start from highest IDs and work backwards (newest first)
  // Also expand if we need to find the highlighted market
  useEffect(() => {
    const needsHighlightMarket = highlightMarketId !== undefined && 
      !sortedMarketIds.includes(highlightMarketId) && 
      checkedRange < totalMarkets;
    
    if ((needsMoreData || needsHighlightMarket) && checkedRange < totalMarkets) {
      // Expand by another batch
      setCheckedRange(prev => Math.min(prev + INITIAL_BATCH_SIZE, totalMarkets));
    }
  }, [needsMoreData, checkedRange, totalMarkets, displayedMarketIds.length, highlightMarketId, sortedMarketIds]);

  // Scroll to highlighted market when it becomes available
  useEffect(() => {
    if (highlightMarketId !== undefined && 
        displayedMarketIds.includes(highlightMarketId) && 
        highlightRef.current && 
        !hasScrolled.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        hasScrolled.current = true;
      }, 500); // Small delay to ensure DOM is ready
    }
  }, [highlightMarketId, displayedMarketIds]);

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
  // If highlightMarketId is specified, ensure we check that market too
  const marketsToCheck = useMemo(() => {
    if (totalMarkets === 0) return [];
    const start = Math.max(0, totalMarkets - checkedRange);
    const end = totalMarkets;
    const rangeMarkets = Array.from({ length: end - start }, (_, i) => end - 1 - i);
    
    // If we need to highlight a specific market, ensure it's in the check list
    if (highlightMarketId !== undefined && highlightMarketId >= 0 && highlightMarketId < totalMarkets) {
      if (!rangeMarkets.includes(highlightMarketId)) {
        return [...rangeMarkets, highlightMarketId];
      }
    }
    
    return rangeMarkets;
  }, [totalMarkets, checkedRange, highlightMarketId]);

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
        highlightMarketId !== undefined ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              Loading market #{highlightMarketId}...
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <MarketCardSkeleton />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No resolved markets found.
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedMarketIds.map((marketId) => (
              <div
                key={marketId}
                ref={highlightMarketId === marketId ? highlightRef : null}
                className={highlightMarketId === marketId ? 'ring-4 ring-primary ring-offset-2 rounded-lg transition-all' : ''}
              >
                <MarketCard
                  index={marketId}
                  filter="resolved"
                />
              </div>
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
