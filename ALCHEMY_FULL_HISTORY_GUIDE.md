# Full Block History Access - Alchemy Guide

## 🎯 Goal: Query ALL Contract Events from Beginning

## Option 1: Find Contract Deployment Block (Recommended)

**Benefits:**
- Query only from contract creation (most efficient)
- Captures ALL activity from day one
- No wasted queries on empty blocks

**How:**
1. Find first `MarketCreated` event (indicates contract deployment)
2. Query from that block to latest
3. Complete historical coverage

**Run this script:**
```bash
node scripts/find-contract-deployment-block.js
```

This will tell you the deployment block number.

## Option 2: Query from Block 0 (Full History)

**Current Limitation:**
- Alchemy still shows block range limits
- But we can query in chunks efficiently

**Strategy:**
- Query in 1,000-block chunks from block 0
- This covers 100% of history
- Takes longer but captures everything

## Option 3: Alchemy Dashboard Settings

### Check Your Alchemy Plan

1. **Go to Alchemy Dashboard**: https://dashboard.alchemy.com
2. **Check Your Plan**:
   - Free tier: 10 block range limit
   - PAYG (Pay-as-you-go): Expanded limits
   - Growth/Scale: Full access

3. **Verify Upgrade Status**:
   - Settings → Billing → Check current plan
   - Make sure upgrade is active
   - Check if payment method is added (required for PAYG)

### Alchemy Enhanced APIs (If Available)

Some Alchemy plans offer:
- **Enhanced getLogs**: Larger block ranges
- **Transfers API**: Alternative way to query transfers
- **Alchemy Notify**: Real-time event notifications

**Check in Dashboard:**
- APIs → Enhanced APIs
- See what's available for Sonic network

### Sonic Network Considerations

**Note**: Sonic is a newer network, so:
- Some Alchemy features may not be fully available
- Block range limits might be network-specific
- Enhanced APIs might have different limits

## Option 4: Optimize Query Strategy

### Smart Querying Approach

Instead of querying from block 0, use:

1. **Find deployment block** (most efficient)
2. **Query from deployment to latest**
3. **Cache results** for better performance

### Implementation

```typescript
// Query from contract deployment block
const DEPLOYMENT_BLOCK = await findDeploymentBlock(); // Run once, store result
const logs = await queryEvents({
  fromBlock: DEPLOYMENT_BLOCK,
  toBlock: 'latest'
});
```

## Recommended Solution

**Best Approach**: Find deployment block + query from there

**Steps:**
1. ✅ Run `scripts/find-contract-deployment-block.js`
2. ✅ Store deployment block number
3. ✅ Update query to start from deployment block
4. ✅ Query from deployment to latest (full coverage!)

This gives you:
- ✅ Complete history (from contract creation)
- ✅ Most efficient (no empty blocks)
- ✅ Works with current Alchemy limits

## Quick Fix: Update Query Range

If you want to query from block 0:

**Update in `src/lib/alchemy-client.ts`:**
```typescript
maxBlocksToQuery: number = currentBlock // Query ALL blocks from 0
```

But this will take longer. Better to find deployment block first!

Want me to implement the deployment block finding and update the queries?


