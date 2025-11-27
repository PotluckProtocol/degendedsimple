/**
 * Active Markets List - Fetches all active markets, sorts by volume
 * Shows King of the Hill on the top market
 */

'use client'
import { useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { MarketCard } from './marketCard';
import { MarketCardSkeleton } from './market-card-skeleton';
import { useState, useCallback, useMemo, useEffect } from 'react';

interface MarketVolumeData {
  marketId: number;
  volume: bigint;
}

// Component to fetch volume for a single market
function MarketVolumeFetcher({ 
  marketId, 
  onVolumeFetched 
}: { 
  marketId: number; 
  onVolumeFetched: (marketId: number, volume: bigint) => void;
}) {
  const { data: marketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
    params: [BigInt(marketId)]
  });

  // Calculate volume and notify parent
  useEffect(() => {
    if (marketData) {
      const totalOptionAShares = marketData[5] as bigint;
      const totalOptionBShares = marketData[6] as bigint;
      const volume = totalOptionAShares + totalOptionBShares;
      const endTime = marketData[3] as bigint;
      const resolved = marketData[7] as boolean;
      const now = BigInt(Math.floor(Date.now() / 1000));
      
      // Only count active markets (not expired, not resolved)
      if (endTime > now && !resolved) {
        onVolumeFetched(marketId, volume);
      } else {
        onVolumeFetched(marketId, BigInt(0)); // Inactive market
      }
    }
  }, [marketData, marketId, onVolumeFetched]);

  return null; // This component doesn't render anything
}

export function ActiveMarketsList({ 
  marketCount 
}: { 
  marketCount: bigint 
}) {
  const [marketVolumes, setMarketVolumes] = useState<Map<number, bigint>>(new Map());

  // Handle volume updates
  const handleVolumeFetched = useCallback((marketId: number, volume: bigint) => {
    setMarketVolumes(prev => {
      const updated = new Map(prev);
      updated.set(marketId, volume);
      return updated;
    });
  }, []);

  // Sort markets by volume
  const sortedMarketIds = useMemo(() => {
    const volumesArray = Array.from(marketVolumes.entries())
      .filter(([_, volume]) => volume > BigInt(0)) // Only active markets with volume
      .sort(([_, volA], [__, volB]) => {
        if (volA > volB) return -1;
        if (volA < volB) return 1;
        return 0;
      });
    
    return volumesArray.map(([marketId]) => marketId);
  }, [marketVolumes]);

  const allMarketsLoaded = marketVolumes.size === Number(marketCount);

  return (
    <>
      {/* Fetch volumes for all markets */}
      {Array.from({ length: Number(marketCount) }, (_, index) => (
        <MarketVolumeFetcher
          key={`volume-${index}`}
          marketId={index}
          onVolumeFetched={handleVolumeFetched}
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
          No active markets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedMarketIds.map((marketId, index) => (
            <MarketCard
              key={marketId}
              index={marketId}
              filter="active"
              isKingOfTheHill={index === 0} // First one (highest volume) is King of the Hill
            />
          ))}
        </div>
      )}
    </>
  );
}

