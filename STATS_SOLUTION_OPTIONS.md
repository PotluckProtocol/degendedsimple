# Statistics Tracking Solution Options

## Problem Summary
- Events aren't being fetched (`getContractEvents` returns 0)
- After claiming, shares reset to 0, losing historical data
- Need to track: purchases, claims, wins, losses over time

## Solution 1: Indexing Service (RECOMMENDED ⭐)

### What it does:
- Pre-indexes all blockchain events
- Provides fast queries via API
- Can filter by user, market, event type
- Aggregates data server-side

### Options:

#### **The Graph Protocol** (Decentralized)
- **Pros**: Decentralized, community-run, free subgraph queries
- **Cons**: Setup time, need to deploy subgraph
- **Best for**: Long-term, decentralized approach
- **Cost**: Free tier available, pay for hosting

#### **Alchemy Enhanced APIs** (Centralized but fast)
- **Pros**: 
  - `getAssetTransfers` API tracks all transfers
  - Fast, reliable, good docs
  - Works with existing RPC
- **Cons**: Centralized service
- **Best for**: Quick implementation
- **Cost**: Free tier: 300M compute units/month

#### **Moralis / QuickNode / Infura** (Full-featured)
- **Pros**: Pre-built APIs for events, NFTs, tokens
- **Cons**: Monthly fees, may be overkill
- **Best for**: If you need more than just events
- **Cost**: Various tiers

### Implementation Example (The Graph):
```typescript
// Subgraph would index:
// - All SharesPurchased events → user purchases by market
// - All WinningsClaimed events → user wins
// - All RefundClaimed events → refunds

// Query example:
const userStats = await graphClient.query(`
  {
    user(id: "${walletAddress}") {
      totalMarkets
      wins
      losses
      totalInvested
      totalEarned
      pnl
    }
  }
`);
```

---

## Solution 2: Better RPC Service

### What it does:
- Provides better event query support
- May have event filtering/indexing
- Still requires client-side filtering

### Options:

#### **Alchemy RPC** (Recommended)
- **Pros**: 
  - Enhanced `eth_getLogs` with filtering
  - Better rate limits
  - Can use with existing thirdweb setup
- **Cons**: Still need to query/filter events yourself
- **Cost**: Free tier available

#### **QuickNode**
- **Pros**: Fast, reliable, good for events
- **Cons**: Monthly fees
- **Cost**: $49+/month

#### **Infura**
- **Pros**: Reliable, good free tier
- **Cons**: Rate limits on free tier
- **Cost**: Free tier: 100k requests/day

### Implementation:
```typescript
// With better RPC, events might work:
const events = await getContractEvents({
  contract,
  eventName: "SharesPurchased",
  filters: {
    buyer: walletAddress // Filter by user
  }
});
```

---

## Solution 3: On-Chain Storage (Not Recommended)

### Store stats in contract:
- Add mappings to track user stats
- Update on each purchase/claim
- Gas costs increase
- Requires contract changes

**Verdict**: Not worth it for read-only stats

---

## Recommendation: **Indexing Service**

### Why:
1. **Fast queries** - No waiting for RPC calls
2. **Reliable** - Events are indexed, won't fail
3. **Efficient** - Only fetch what you need
4. **Scalable** - Works as you grow
5. **Historical data** - All past events available

### Quick Win: **Alchemy Enhanced APIs**

If you're using Alchemy RPC already, you can use their `getAssetTransfers` API:

```typescript
// Track all USDC transfers to/from contract
const transfers = await alchemy.core.getAssetTransfers({
  fromAddress: userAddress,
  toAddress: contractAddress,
  contractAddresses: [USDC_ADDRESS],
  category: ["erc20"],
  withMetadata: true
});

// Filter by contract interactions to track purchases/claims
```

### Best Long-term: **The Graph Subgraph**

Deploy a subgraph that indexes:
- `SharesPurchased` events → user purchases
- `WinningsClaimed` events → user wins
- `RefundClaimed` events → refunds
- Market resolutions

Then query with GraphQL:
```graphql
{
  user(id: "0x...") {
    purchases { marketId, amount, option }
    claims { marketId, amount }
    totalPnL
  }
}
```

---

## Implementation Priority

1. **Short-term** (1-2 hours):
   - Switch to Alchemy RPC
   - Try `getAssetTransfers` API
   - See if events work better

2. **Medium-term** (1 day):
   - Set up Alchemy Enhanced APIs
   - Use their event querying
   - Build stats from indexed events

3. **Long-term** (1-2 days):
   - Deploy The Graph subgraph
   - Fully indexed, fast queries
   - Best for production

---

## Cost Comparison

| Solution | Setup Time | Monthly Cost | Performance |
|----------|-----------|--------------|-------------|
| Better RPC | 30 min | $0-49 | ⭐⭐⭐ |
| Alchemy Enhanced | 2 hours | $0-99 | ⭐⭐⭐⭐ |
| The Graph | 1-2 days | $0-50 | ⭐⭐⭐⭐⭐ |

---

## My Recommendation

**Start with Alchemy Enhanced APIs** - fastest to implement and should solve your event fetching issues immediately.

Want me to help implement one of these?


