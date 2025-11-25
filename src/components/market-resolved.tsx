'use client'
import { Button } from "./ui/button";
import { prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendAndConfirmTransaction, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { formatUSDC } from "@/lib/usdc-utils";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface MarketResolvedProps {
    marketId: number;
    outcome: number;
    optionA: string;
    optionB: string;
    totalOptionAShares: bigint;
    totalOptionBShares: bigint;
}

export function MarketResolved({ 
    marketId,
    outcome, 
    optionA, 
    optionB,
    totalOptionAShares,
    totalOptionBShares
}: MarketResolvedProps) {
    const account = useActiveAccount();
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast();
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimableAmount, setClaimableAmount] = useState<bigint>(BigInt(0));

    // Get user's shares for this market
    const { data: sharesBalanceData } = useReadContract({
        contract,
        method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
        params: [BigInt(marketId), account?.address as string]
    });

    // Calculate claimable winnings
    useEffect(() => {
        if (!sharesBalanceData || outcome === 0) {
            setClaimableAmount(BigInt(0));
            return;
        }

        const [optionAShares, optionBShares] = sharesBalanceData;
        const winningShares = outcome === 1 ? optionAShares : optionBShares;

        if (winningShares === BigInt(0)) {
            setClaimableAmount(BigInt(0));
            return;
        }

        // Calculate winnings: proportional share of total pool
        const totalShares = outcome === 1 ? totalOptionAShares : totalOptionBShares;
        const totalPool = totalOptionAShares + totalOptionBShares;

        if (totalShares === BigInt(0)) {
            setClaimableAmount(BigInt(0));
            return;
        }

        // Calculate gross winnings (before fee)
        const grossWinnings = (totalPool * winningShares) / totalShares;
        
        // Apply 10% protocol fee (1000 basis points = 10%)
        const PROTOCOL_FEE_BPS = BigInt(1000); // 10%
        const protocolFee = (grossWinnings * PROTOCOL_FEE_BPS) / BigInt(10000);
        const netWinnings = grossWinnings - protocolFee;
        
        setClaimableAmount(netWinnings);
    }, [sharesBalanceData, outcome, totalOptionAShares, totalOptionBShares]);

    const handleClaimRewards = async () => {
        if (claimableAmount === BigInt(0)) {
            toast({
                title: "No Winnings",
                description: "You don't have any winning shares to claim.",
                variant: "destructive"
            });
            return;
        }

        setIsClaiming(true);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)]
            });

            await mutateTransaction(tx);
            
            toast({
                title: "Winnings Claimed!",
                description: `Successfully claimed ${formatUSDC(claimableAmount, 2)} USDC.`,
            });
            
            // Reset claimable amount after successful claim
            setClaimableAmount(BigInt(0));
        } catch (error: unknown) {
            console.error("Error claiming winnings:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to claim winnings. Please try again.";
            toast({
                title: "Claim Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsClaiming(false);
        }
    };

    const hasWinnings = claimableAmount > BigInt(0);
    const displayAmount = formatUSDC(claimableAmount, 2);

    return (
        <div className="flex flex-col gap-2">
            <div className="mb-2 bg-green-500/20 border border-green-500/30 p-2 rounded-md text-center text-xs text-green-400">
                Resolved: {outcome === 1 ? optionA : optionB}
            </div>
            <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleClaimRewards}
                disabled={!hasWinnings || isClaiming}
            >
                {isClaiming ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                    </>
                ) : hasWinnings ? (
                    `Claim ${displayAmount} USDC`
                ) : (
                    "No Winnings to Claim"
                )}
            </Button>
        </div>
    );
}
