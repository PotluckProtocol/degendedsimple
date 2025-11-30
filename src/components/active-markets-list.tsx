/**
 * Active Markets List - Fetches active markets with pagination
 * Shows King of the Hill on the top market
 */

'use client'
import { useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { MarketCard } from './marketCard';
import { MarketCardSkeleton } from './market-card-skeleton';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from './ui/button';

interface MarketVolumeData {
  marketId: number;
  volume: bigint;
}

// Markets to load per page
const MARKETS_PER_PAGE = 30;
// Initial batch size for first load
const INITIAL_BATCH_SIZE = 50;

// Component to fetch volume for a single market
function MarketVolumeFetcher({ 
  marketId, 
  onVolumeFetched,
  onMarketChecked
}: { 
  marketId: number; 
  onVolumeFetched: (marketId: number, volume: bigint) => void;
  onMarketChecked: (marketId: number) => void;
}) {
  const { data: marketData, isLoading, error } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
    params: [BigInt(marketId)]
  });

  // Calculate volume and notify parent
  useEffect(() => {
    // Mark as checked if we got an error (so we don't wait forever)
    if (error) {
      onMarketChecked(marketId);
      return;
    }

    if (!isLoading && marketData !== undefined) {
      // Always notify that we've checked this market (even if inactive)
      onMarketChecked(marketId);
      
      if (marketData) {
        try {
          const totalOptionAShares = marketData[5] as bigint;
          const totalOptionBShares = marketData[6] as bigint;
          const volume = totalOptionAShares + totalOptionBShares;
          const endTime = marketData[3] as bigint;
          const resolved = marketData[7] as boolean;
          const now = BigInt(Math.floor(Date.now() / 1000));
          
          // Only count active markets (not expired, not resolved)
          const isActive = endTime > now && !resolved;
          if (isActive) {
            onVolumeFetched(marketId, volume);
          }
        } catch (err) {
          console.error(`Error processing market ${marketId}:`, err);
        }
      }
    }
  }, [marketData, isLoading, error, marketId, onVolumeFetched, onMarketChecked]);

  return null; // This component doesn't render anything
}

export function ActiveMarketsList({ 
  marketCount 
}: { 
  marketCount: bigint | undefined
}) {
  const [marketVolumes, setMarketVolumes] = useState<Map<number, bigint>>(new Map());
  const [checkedMarkets, setCheckedMarkets] = useState<Set<number>>(new Set());
  const [displayedCount, setDisplayedCount] = useState(MARKETS_PER_PAGE);
  const [checkedRange, setCheckedRange] = useState(INITIAL_BATCH_SIZE);

  // Handle undefined or invalid marketCount
  if (!marketCount || marketCount === BigInt(0)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No markets found.
      </div>
    );
  }

  const totalMarkets = Number(marketCount);

  // Handle volume updates (only for active markets)
  const handleVolumeFetched = useCallback((marketId: number, volume: bigint) => {
    setMarketVolumes(prev => {
      const updated = new Map(prev);
      updated.set(marketId, volume);
      return updated;
    });
  }, []);

  // Track which markets have been checked (active or inactive)
  const handleMarketChecked = useCallback((marketId: number) => {
    setCheckedMarkets(prev => {
      const updated = new Set(prev);
      updated.add(marketId);
      return updated;
    });
  }, []);

  // Sort markets by volume (highest first)
  const sortedMarketIds = useMemo(() => {
    const volumesArray = Array.from(marketVolumes.entries())
      .sort(([_, volA], [__, volB]) => {
        if (volA > volB) return -1;
        if (volA < volB) return 1;
        return 0;
      });
    
    return volumesArray.map(([marketId]) => marketId);
  }, [marketVolumes]);

  // Get markets to display (paginated)
  const displayedMarketIds = useMemo(() => {
    return sortedMarketIds.slice(0, displayedCount);
  }, [sortedMarketIds, displayedCount]);

  // Check if we need to load more markets to find enough active ones
  const hasMoreMarkets = displayedMarketIds.length < sortedMarketIds.length;
  const hasMoreToCheck = checkedRange < totalMarkets;
  const needsMoreData = displayedMarketIds.length < MARKETS_PER_PAGE && hasMoreToCheck;

  // Expand search range if we don't have enough markets yet
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

  // Markets we're currently checking (paginated range)
  const marketsToCheck = Array.from({ length: Math.min(checkedRange, totalMarkets) }, (_, i) => i);

  return (
    <>
      {/* Fetch volumes for markets in current range */}
      {marketsToCheck.map((index) => (
        <MarketVolumeFetcher
          key={`volume-${index}`}
          marketId={index}
          onVolumeFetched={handleVolumeFetched}
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
          No active markets found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedMarketIds.map((marketId, index) => (
              <MarketCard
                key={marketId}
                index={marketId}
                filter="active"
                isKingOfTheHill={index === 0} // First one (highest volume) is King of the Hill
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
              Showing {displayedMarketIds.length} of {sortedMarketIds.length} active markets
              {hasMoreToCheck && ` (searching through ${checkedRange} of ${totalMarkets} total markets)`}
            </div>
          )}
        </>
      )}
    </>
  );
}
