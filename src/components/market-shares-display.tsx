import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { formatUSDC } from "@/lib/usdc-utils";

interface MarketSharesDisplayProps {
    market: {
        optionA: string;
        optionB: string;
        totalOptionAShares: bigint;
        totalOptionBShares: bigint;
    };
    sharesBalance: {
        optionAShares: bigint;
        optionBShares: bigint;
    };
}

export function MarketSharesDisplay({
    market,
    sharesBalance,
}: MarketSharesDisplayProps) {
    const [winnings, setWinnings] = useState<{ A: bigint; B: bigint }>({ 
        A: BigInt(0), 
        B: BigInt(0) 
    });

    const calculateWinnings = (option: 'A' | 'B') => {
        if (!sharesBalance || !market) return BigInt(0);

        const userShares = option === 'A' ? sharesBalance.optionAShares : sharesBalance.optionBShares;
        const totalSharesForOption = option === 'A' ? market.totalOptionAShares : market.totalOptionBShares;
        const totalLosingShares = option === 'A' ? market.totalOptionBShares : market.totalOptionAShares;

        if (totalSharesForOption === BigInt(0)) return BigInt(0);

        // Calculate user's proportion of the winning side
        const userProportion = (userShares * BigInt(1000000)) / totalSharesForOption; // Multiply by 1M for precision
        
        // Calculate their share of the losing side's shares
        const winningsFromLosingShares = (totalLosingShares * userProportion) / BigInt(1000000);
        
        // Gross winnings: original shares plus their proportion of losing shares
        const grossWinnings = userShares + winningsFromLosingShares;
        
        // Apply 10% protocol fee (1000 basis points = 10%)
        const PROTOCOL_FEE_BPS = BigInt(1000); // 10%
        const protocolFee = (grossWinnings * PROTOCOL_FEE_BPS) / BigInt(10000);
        const netWinnings = grossWinnings - protocolFee;
        
        return netWinnings;
    };

    useEffect(() => {
        if (!sharesBalance || !market) return;

        const newWinnings = {
            A: calculateWinnings('A'),
            B: calculateWinnings('B')
        };

        // Only update if values actually changed
        if (newWinnings.A !== winnings.A || newWinnings.B !== winnings.B) {
            setWinnings(newWinnings);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharesBalance, market.totalOptionAShares, market.totalOptionBShares]);

    const displayWinningsA = formatUSDC(winnings.A, 2);
    const displayWinningsB = formatUSDC(winnings.B, 2);
    const userSharesA = formatUSDC(sharesBalance?.optionAShares || BigInt(0), 0);
    const userSharesB = formatUSDC(sharesBalance?.optionBShares || BigInt(0), 0);

    return (
        <div className="flex flex-col gap-2">
            <div className="w-full text-sm text-muted-foreground">
                Your shares: {market.optionA} - {userSharesA}, {market.optionB} - {userSharesB}
            </div>
            {(winnings.A > 0 || winnings.B > 0) && (
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Winnings:</div>
                    <div className="flex gap-2">
                        <Badge variant="secondary">{market.optionA}: {displayWinningsA} shares</Badge>
                        <Badge variant="secondary">{market.optionB}: {displayWinningsB} shares</Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
