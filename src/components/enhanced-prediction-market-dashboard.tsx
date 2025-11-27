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

export function EnhancedPredictionMarketDashboard() {
    const account = useActiveAccount();
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });
    
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
                <Navbar />
                <ContractAddressDisplay />
                <div className="mb-4">
                    <img 
                        src="/banner.png" 
                        alt="DEGENDED MARKETS Banner" 
                        className="w-full h-auto rounded-xl border-2 border-primary/30 shadow-2xl shadow-primary/20" 
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                        }}
                        onError={(e) => {
                            // Fallback to placeholder if image not found
                            e.currentTarget.src = "https://placehold.co/800x300/1e3a8a/60a5fa?text=DEGENDED+MARKETS";
                        }}
                    />
                </div>
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        {isAdmin && <TabsTrigger value="create">Create Market</TabsTrigger>}
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending Resolution</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                    
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index} 
                                            filter="active"
                                        />
                                    ))}
                                </div>
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index}
                                            filter="resolved"
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
            <Footer />
        </div>
    );
}
