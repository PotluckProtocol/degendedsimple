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

import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constants/contract'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from './marketCard'
import { Navbar } from './navbar'
import { MarketCardSkeleton } from './market-card-skeleton'
import { Footer } from "./footer"
import { CreateMarketForm } from './create-market-form'

export function EnhancedPredictionMarketDashboard() {
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    }); 

    // Show 6 skeleton cards while loading
    const skeletonCards = Array.from({ length: 6 }, (_, i) => (
        <MarketCardSkeleton key={`skeleton-${i}`} />
    ));

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto p-4">
                <Navbar />
                <div className="mb-4">
                    <img 
                        src="https://placehold.co/800x300" 
                        alt="Placeholder Banner" 
                        className="w-full h-auto rounded-lg" 
                    />
                </div>
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="create">Create Market</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending Resolution</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="create" className="mt-6">
                        <CreateMarketForm />
                    </TabsContent>
                    
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
