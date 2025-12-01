'use client'

/**
 * Enhanced Prediction Market Dashboard
 * 
 * Main dashboard component that displays prediction markets in three categories:
 * - Active: Markets still accepting bets (not expired)
 * - Pending Resolution: Markets that have expired but not yet resolved
 * - Resolved: Markets that have been resolved and allow reward claims
 * 
 * Uses thirdweb's useReadContract hook to fetch the total market count from the smart contract.
 */

import { useReadContract, useActiveAccount } from 'thirdweb/react'
import { contract } from '@/constants/contract'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from './marketCard'
import { Navbar } from './navbar'
import { MarketCardSkeleton } from './market-card-skeleton'
import { Footer } from "./footer"
import { CreateMarketForm } from './create-market-form'
import { ContractAddressDisplay } from './contract-address-display'
import { ActiveMarketsList } from './active-markets-list'
import { ResolvedMarketsList } from './resolved-markets-list'
import { UserStatsDashboard } from './user-stats-dashboard'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, Suspense } from 'react'

function NavbarWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-between items-center mb-6"><div>DEGENDED MARKETS</div></div>}>
            <Navbar />
        </Suspense>
    );
}

export function EnhancedPredictionMarketDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const account = useActiveAccount();
    const [defaultTab, setDefaultTab] = useState<string>('active');
    
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });
    
    // Get market ID from URL parameter
    const marketIdParam = useMemo(() => {
        const market = searchParams.get('market');
        const tab = searchParams.get('tab');
        if (market) {
            const id = parseInt(market, 10);
            if (!isNaN(id) && id >= 0) {
                // If tab is explicitly set, use it; otherwise we'll detect it
                if (tab && ['active', 'pending', 'resolved'].includes(tab)) {
                    return { id, tab };
                }
                return { id, tab: null };
            }
        }
        return null;
    }, [searchParams]);
    
    // Check market status to determine which tab to show
    const { data: marketData } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: marketIdParam?.id !== undefined ? [BigInt(marketIdParam.id)] : [BigInt(0)],
        queryOptions: {
            enabled: marketIdParam?.id !== undefined && marketIdParam.tab === null
        }
    });
    
    // Determine tab based on market status
    useEffect(() => {
        if (marketIdParam?.tab) {
            // Tab explicitly set in URL
            setDefaultTab(marketIdParam.tab);
        } else if (marketIdParam?.id !== undefined && marketData) {
            // Auto-detect tab based on market status
            const isResolved = marketData[7] as boolean;
            const endTime = marketData[3] as bigint;
            const isExpired = new Date(Number(endTime) * 1000) < new Date();
            
            if (isResolved) {
                setDefaultTab('resolved');
            } else if (isExpired) {
                setDefaultTab('pending');
            } else {
                setDefaultTab('active');
            }
        } else {
            // Default to active tab if no market ID
            setDefaultTab('active');
        }
    }, [marketIdParam, marketData]);
    
    // Check if current user is the contract owner (admin)
    const { data: ownerAddress } = useReadContract({
        contract,
        method: "function owner() view returns (address)",
        params: []
    });
    
    const isAdmin = account?.address?.toLowerCase() === ownerAddress?.toLowerCase(); 

    // Show 6 skeleton cards while loading
    const skeletonCards = Array.from({ length: 6 }, (_, i) => (
        <MarketCardSkeleton key={`skeleton-${i}`} />
    ));

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto p-4">
                <NavbarWrapper />
                <ContractAddressDisplay />
                <div className="mb-4">
                    <img 
                        src="/banner.png" 
                        alt="DEGENDED MARKETS Banner" 
                        className={`w-full h-auto rounded-xl border-2 border-primary/30 shadow-2xl shadow-primary/20 ${marketIdParam ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                        }}
                        onClick={() => {
                            if (marketIdParam) {
                                router.push('/');
                            }
                        }}
                        onError={(e) => {
                            // Fallback to placeholder if image not found
                            e.currentTarget.src = "https://placehold.co/800x300/1e3a8a/60a5fa?text=DEGENDED+MARKETS";
                        }}
                        title={marketIdParam ? 'Click to return to home' : ''}
                    />
                </div>
                <Tabs defaultValue={defaultTab} value={defaultTab} onValueChange={setDefaultTab} className="w-full">
                    <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
                        {isAdmin && <TabsTrigger value="create">Create Market</TabsTrigger>}
                        <TabsTrigger value="stats">My Stats</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending Resolution</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stats" className="mt-6">
                        <UserStatsDashboard />
                    </TabsContent>
                    
                    {isAdmin && (
                        <TabsContent value="create" className="mt-6">
                            <CreateMarketForm />
                        </TabsContent>
                    )}
                    
                    {isLoadingMarketCount ? (
                        <TabsContent value="active" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {skeletonCards}
                            </div>
                        </TabsContent>
                    ) : (
                        <>
                            <TabsContent value="active">
                                {marketCount !== undefined ? (
                                    <ActiveMarketsList marketCount={marketCount} />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {skeletonCards}
                                    </div>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="pending">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index}
                                            filter="pending"
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="resolved">
                                {marketCount !== undefined ? (
                                    <ResolvedMarketsList 
                                        marketCount={marketCount} 
                                        highlightMarketId={defaultTab === 'resolved' && marketIdParam?.id !== undefined ? marketIdParam.id : undefined}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {skeletonCards}
                                    </div>
                                )}
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
            <Footer />
        </div>
    );
}
