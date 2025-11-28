/**
 * User Statistics Component
 * 
 * Displays user's prediction market statistics by analyzing on-chain events:
 * - Total markets participated in
 * - Wins vs Losses
 * - Total PNL (Profit and Loss)
 * - Win rate percentage
 */

'use client'
import { useActiveAccount } from 'thirdweb/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trophy, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatUSDC } from '@/lib/usdc-utils';
import { useUserStatistics } from '@/hooks/use-user-statistics';

export function UserStatistics() {
  const account = useActiveAccount();
  const { stats, isLoading } = useUserStatistics();

  if (!account) {
    return null; // Don't show stats if not connected
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading statistics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const pnlFormatted = formatUSDC(stats.pnl, 2);
  const isPositivePNL = stats.pnl >= BigInt(0);

  return (
    <Card className="mb-6 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Your Statistics
        </CardTitle>
        <CardDescription>
          Track your performance across all prediction markets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Markets */}
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <Activity className="h-6 w-6 mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.totalMarkets}</div>
            <div className="text-xs text-muted-foreground text-center">Total Markets</div>
          </div>

          {/* Wins */}
          <div className="flex flex-col items-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Trophy className="h-6 w-6 mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
            <div className="text-xs text-muted-foreground text-center">Wins</div>
          </div>

          {/* Losses */}
          <div className="flex flex-col items-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <TrendingDown className="h-6 w-6 mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
            <div className="text-xs text-muted-foreground text-center">Losses</div>
          </div>

          {/* PNL */}
          <div className={`flex flex-col items-center p-4 rounded-lg border ${
            isPositivePNL 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <TrendingUp className={`h-6 w-6 mb-2 ${isPositivePNL ? 'text-green-500' : 'text-red-500'}`} />
            <div className={`text-2xl font-bold ${isPositivePNL ? 'text-green-500' : 'text-red-500'}`}>
              {isPositivePNL ? '+' : ''}{pnlFormatted}
            </div>
            <div className="text-xs text-muted-foreground text-center">Total PNL</div>
          </div>
        </div>

        {/* Win Rate */}
        {stats.totalMarkets > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="text-lg font-semibold">{stats.winRate.toFixed(1)}%</span>
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

