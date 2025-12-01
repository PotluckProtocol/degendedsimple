# User Stats/Dashboard Feasibility Analysis

## ✅ What We Have

### 1. **Alchemy RPC** (Configured ✅)
- URL: `https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv`
- API Key: `4l0fKzPwYbzWSqdDmxuSv`
- Enhanced APIs available for event querying

### 2. **Contract Events** (Available ✅)
From `PredictionMarket.sol`:
- `SharesPurchased(marketId, buyer, isOptionA, amount)` - Track all purchases
- `WinningsClaimed(marketId, winner, amount)` - Track wins
- `RefundClaimed(marketId, user, amount)` - Track refunds
- `MarketResolved(marketId, outcome)` - Track resolutions
- `MarketCreated(marketId, question, optionA, optionB, endTime)` - Track creation

### 3. **Contract Address**
- Main contract: `0xC04c1DE26F5b01151eC72183b5615635E609cC81`
- USDC token: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`

## 🎯 What We Can Build

### Accurate User Statistics:
1. **Total Invested** - Sum of all `SharesPurchased` events for user
2. **Total Earned** - Sum of all `WinningsClaimed` events
3. **Total Refunded** - Sum of all `RefundClaimed` events
4. **Profit & Loss (PNL)** - `(Total Earned + Total Refunded) - Total Invested`
5. **Win/Loss Record** - Count resolved markets where user won vs lost
6. **Active Markets** - Markets with unclaimed shares
7. **Market History** - All markets user participated in

## 💡 Implementation Options

### Option 1: Alchemy Enhanced APIs (Recommended ⭐)

**Pros:**
- Already have Alchemy set up
- Fast queries via API
- Can query historical events
- No additional infrastructure needed

**Implementation:**
```typescript
// Use Alchemy SDK to query events
import { Alchemy, Network } from 'alchemy-sdk';

const config = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.SONIC_MAINNET, // Or custom network config
};

const alchemy = new Alchemy(config);

// Query SharesPurchased events for a user
const purchases = await alchemy.core.getLogs({
  address: CONTRACT_ADDRESS,
  topics: [
    // Event signature: SharesPurchased(uint256,address,bool,uint256)
    ethers.utils.id("SharesPurchased(uint256,address,bool,uint256)"),
    null, // marketId (any)
    ethers.utils.hexZeroPad(userAddress, 32), // buyer address
  ],
});

// Query WinningsClaimed events
const wins = await alchemy.core.getLogs({
  address: CONTRACT_ADDRESS,
  topics: [
    ethers.utils.id("WinningsClaimed(uint256,address,uint256)"),
    null,
    ethers.utils.hexZeroPad(userAddress, 32),
  ],
});

// Query RefundClaimed events
const refunds = await alchemy.core.getLogs({
  address: CONTRACT_ADDRESS,
  topics: [
    ethers.utils.id("RefundClaimed(uint256,address,uint256)"),
    null,
    ethers.utils.hexZeroPad(userAddress, 32),
  ],
});
```

**Estimated Time:** 2-4 hours
**Cost:** Free tier (300M compute units/month)

### Option 2: Direct Contract Event Queries via thirdweb

**Pros:**
- Already using thirdweb SDK
- No additional dependencies
- Works with existing setup

**Cons:**
- May have rate limits
- Slower than indexing service
- Need to handle pagination

**Implementation:**
```typescript
// Use thirdweb's getContractEvents
const events = await getContractEvents({
  contract,
  eventName: "SharesPurchased",
  filters: {
    buyer: userAddress
  }
});
```

**Estimated Time:** 3-5 hours
**Cost:** Free

### Option 3: The Graph Subgraph (Long-term)

**Pros:**
- Fully indexed, very fast
- GraphQL queries
- Best for production scale

**Cons:**
- Takes 1-2 days to set up
- Need to deploy subgraph
- Requires maintenance

**Estimated Time:** 1-2 days
**Cost:** Free tier available

## 🏗️ Recommended Approach

### Phase 1: Quick Win with Alchemy Enhanced APIs

1. **Install Alchemy SDK:**
   ```bash
   npm install alchemy-sdk
   ```

2. **Create Stats Hook:**
   - Query events via Alchemy
   - Calculate stats from events
   - Cache results for performance

3. **Build Dashboard Component:**
   - Display PNL, wins/losses
   - Show market history
   - Show active positions

### Phase 2: Optimize (If Needed)

- Add caching layer
- Use React Query for data fetching
- Consider The Graph for scale

## 📊 Data Accuracy

With event-based approach:
- ✅ **100% Accurate** - All data comes from on-chain events
- ✅ **Historical** - Can query all past events
- ✅ **Real-time** - Can fetch latest events
- ✅ **No double-counting** - Events are immutable
- ✅ **Refunds handled** - Separate event tracking

## 🎯 What Stats to Show

1. **Overview Card:**
   - Total PNL (with +/-, color coding)
   - Win/Loss ratio
   - Total markets participated

2. **Detailed Breakdown:**
   - Total invested
   - Total earned (winnings)
   - Total refunded
   - Active positions

3. **Market History:**
   - List of all markets
   - Investment amount
   - Outcome (won/lost/refunded/pending)
   - PNL per market

## 🚀 Next Steps

1. **Verify Alchemy SDK works with Sonic network**
2. **Test event queries** - Make sure we can fetch events
3. **Build stats calculation logic**
4. **Create dashboard component**
5. **Add caching/optimization**

## ⚠️ Potential Challenges

1. **Network Support** - Alchemy SDK may not have Sonic network pre-configured
   - **Solution:** Use custom network config

2. **Event Parsing** - Need to decode event logs correctly
   - **Solution:** Use ethers.js or Alchemy's built-in parsing

3. **Rate Limits** - Too many queries might hit limits
   - **Solution:** Cache results, batch queries

## ✅ Verdict

**YES, this is worth trying!**

**Reasons:**
- ✅ We have the infrastructure (Alchemy)
- ✅ Contract events are available
- ✅ Can build accurate stats from events
- ✅ No double-counting issues
- ✅ Historical data available

**Recommended:** Start with Option 1 (Alchemy Enhanced APIs)

Want me to implement it?

