'use client'
import { useState } from "react";
import { useActiveAccount, useReadContract, useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constants/contract";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

interface MarketResolveAdminProps {
    marketId: number;
    optionA: string;
    optionB: string;
    isExpired: boolean;
}

export function MarketResolveAdmin({ 
    marketId, 
    optionA, 
    optionB,
    isExpired 
}: MarketResolveAdminProps) {
    const account = useActiveAccount();
    const { mutateAsync: sendTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast();
    const [isResolving, setIsResolving] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<1 | 2 | null>(null);

    // Check if current user is the contract owner
    const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
        contract,
        method: "function owner() view returns (address)",
        params: []
    });

    // Don't render until we know if user is owner
    if (isLoadingOwner || !account) {
        return null;
    }

    const isOwner = account.address?.toLowerCase() === ownerAddress?.toLowerCase();

    const handleResolve = async (outcome: 1 | 2) => {
        if (!isOwner) {
            toast({
                title: "Unauthorized",
                description: "Only the contract owner can resolve markets.",
                variant: "destructive"
            });
            return;
        }

        setIsResolving(true);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function resolveMarket(uint256 _marketId, uint8 _outcome)",
                params: [BigInt(marketId), outcome]
            });
            await sendTransaction(tx);
            toast({
                title: "Market Resolved!",
                description: `Market resolved: ${outcome === 1 ? optionA : optionB} won.`,
            });
            setSelectedOutcome(null);
        } catch (error: any) {
            console.error("Error resolving market:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to resolve market",
                variant: "destructive"
            });
        } finally {
            setIsResolving(false);
        }
    };

    // Only show for contract owner
    if (!isOwner) {
        return null;
    }

    return (
        <Card className="mt-4 border-2 border-orange-200">
            <CardHeader>
                <CardTitle className="text-sm">Admin: Resolve Market</CardTitle>
                <CardDescription className="text-xs">
                    {isExpired 
                        ? "Market has expired. Select the winning outcome."
                        : "Resolve this market early before expiration."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex gap-2">
                    <Button
                        variant={selectedOutcome === 1 ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedOutcome(1)}
                        disabled={isResolving}
                    >
                        {optionA}
                    </Button>
                    <Button
                        variant={selectedOutcome === 2 ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedOutcome(2)}
                        disabled={isResolving}
                    >
                        {optionB}
                    </Button>
                </div>
                {selectedOutcome && (
                    <Button
                        className="w-full"
                        onClick={() => handleResolve(selectedOutcome)}
                        disabled={isResolving}
                    >
                        {isResolving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resolving...
                            </>
                        ) : (
                            `Resolve: ${selectedOutcome === 1 ? optionA : optionB}`
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

