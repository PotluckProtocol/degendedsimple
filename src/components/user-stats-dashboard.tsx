/**
 * User Statistics Dashboard
 * Displays user's trading statistics and PNL
 */

'use client';

import { useActiveAccount } from 'thirdweb/react';
import { useUserStats } from '@/hooks/use-user-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, RefreshCw } from 'lucide-react';
import { formatUSDC } from '@/lib/usdc-utils';

export function UserStatsDashboard() {
  const account = useActiveAccount();
  const { 
    totalInvested, 
    totalEarned, 
    totalRefunded, 
    pnl, 
    wins, 
    losses, 
    winRatio, 
    totalMarkets, 
    activeMarkets,
    isLoading,
    error,
    refetch
  } = useUserStats(account?.address);

  // Auto-retry once if there's an error and we haven't retried yet
  useEffect(() => {
    if (error && refetch) {
      const timer = setTimeout(() => refetch(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, refetch]);

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
          <CardDescription>Connect your wallet to view your trading statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Statistics</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const pnlFormatted = formatUSDC(pnl);
  const isProfit = pnl >= BigInt(0);
  
  // Calculate percentage: convert to Number first to avoid BigInt/Number mixing
  const pnlNumber = Number(pnl);
  const totalInvestedNumber = Number(totalInvested);
  const pnlPercent = totalInvestedNumber > 0 
    ? (pnlNumber / totalInvestedNumber) * 100
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Your Statistics</CardTitle>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </CardHeader>
        <CardDescription className="px-6">
          Track your performance across all prediction markets
        </CardDescription>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-4">
              <div className="h-20 bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PNL Overview */}
              <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-gradient-to-r from-background to-muted/20">
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className={`text-3xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                      {isProfit ? '+' : ''}{pnlFormatted}
                    </p>
                    {totalInvestedNumber > 0 && (
                      <p className={`text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        ({pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                </div>
                {isProfit ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Invested */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Invested</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{formatUSDC(totalInvested)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Earned */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Earned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <p className="text-2xl font-bold text-green-500">{formatUSDC(totalEarned)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Refunded */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Refunded</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{formatUSDC(totalRefunded)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Win Ratio */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Win Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{(winRatio * 100).toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {wins}W / {losses}L
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Counts */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{totalMarkets}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active Markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <p className="text-2xl font-bold text-blue-500">{activeMarkets}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

