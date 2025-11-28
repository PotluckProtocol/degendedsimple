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
    const percentageA = totalShares > 0 
        ? (sharesA / totalShares) * 100 
        : 50;
    const percentageB = totalShares > 0 
        ? (sharesB / totalShares) * 100 
        : 50;

    // Format percentage with one decimal
    const formatPercentage = (pct: number) => {
        return totalShares > 0 ? pct.toFixed(1) : "50.0";
    };

    return (
        <div className="mb-4 space-y-3">
            {/* Odds Display */}
            <div className="relative p-4 bg-gradient-to-br from-muted/60 to-muted/40 rounded-xl border border-primary/10 shadow-sm">
                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center flex-1">
                        <div className={`text-3xl font-bold mb-1 ${
                            percentageA > percentageB ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                            {formatPercentage(percentageA)}%
                        </div>
                        <div className="text-xs text-center text-muted-foreground leading-tight px-2">
                            {optionA}
                        </div>
                        {totalShares > 0 && (
                            <div className="text-[10px] text-muted-foreground mt-1">
                                ${formatUSDC(totalOptionAShares, 0)}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-shrink-0">
                        <div className="w-px h-12 bg-border" />
                    </div>
                    
                    <div className="flex flex-col items-center flex-1">
                        <div className={`text-3xl font-bold mb-1 ${
                            percentageB > percentageA ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                            {formatPercentage(percentageB)}%
                        </div>
                        <div className="text-xs text-center text-muted-foreground leading-tight px-2">
                            {optionB}
                        </div>
                        {totalShares > 0 && (
                            <div className="text-[10px] text-muted-foreground mt-1">
                                ${formatUSDC(totalOptionBShares, 0)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {totalShares > 0 && (
                <div>
                    <Progress value={percentageA} className="h-2.5" />
                </div>
            )}
        </div>
    );
}