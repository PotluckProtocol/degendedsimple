import { Progress } from "@/components/ui/progress";
import { fromUSDC, formatUSDC } from "@/lib/usdc-utils";

interface MarketProgressProps {
    optionA: string;
    optionB: string;
    totalOptionAShares: bigint;
    totalOptionBShares: bigint;
}

export function MarketProgress({ 
    optionA, 
    optionB, 
    totalOptionAShares, 
    totalOptionBShares 
}: MarketProgressProps) {
    const sharesA = fromUSDC(totalOptionAShares);
    const sharesB = fromUSDC(totalOptionBShares);
    const totalShares = sharesA + sharesB;
    const yesPercentage = totalShares > 0 
        ? (sharesA / totalShares) * 100 
        : 50;

    return (
        <div className="mb-4">
            <div className="flex justify-between mb-2">
                <span>
                    <span className="font-bold text-sm">
                        {optionA}: {formatUSDC(totalOptionAShares, 0)}
                    </span>
                    {totalShares > 0 && (
                        <span className="text-xs text-muted-foreground"> {Math.floor(yesPercentage)}%</span>
                    )}
                </span>
                <span>
                    <span className="font-bold text-sm">
                        {optionB}: {formatUSDC(totalOptionBShares, 0)}
                    </span>
                    {totalShares > 0 && (
                        <span className="text-xs text-muted-foreground"> {Math.floor(100 - yesPercentage)}%</span>
                    )}
                </span>
            </div>
            <Progress value={yesPercentage} className="h-2" />
        </div>
    );
}