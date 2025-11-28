# Alchemy Integration Guide

## What Alchemy Provides

### 1. **Enhanced RPC Endpoint**
- More reliable than public RPC
- Better rate limits
- Faster response times
- Better event query support

### 2. **Enhanced APIs** (Future Use)
- `getAssetTransfers` - Track all token transfers
- `getLogs` - Enhanced event log queries
- `getTokenMetadata` - Token information
- Better filtering and indexing

## How It Helps Your Project

### ✅ **Telegram Bot**
- **Current Issue**: `getContractEvents` returns 0 events (RPC limitation)
- **Solution**: Use Alchemy RPC for better event support
- **Alternative**: Direct contract reads (no events needed)
- **Result**: Reliable market tracking and notifications

### ✅ **Statistics/Leaderboard** (Future)
- Can query events reliably for historical data
- Track all user purchases and claims
- Calculate accurate PNL from event history
- Much faster than on-chain reads

### ✅ **General Performance**
- Faster contract reads
- Better reliability
- Higher rate limits
- Production-ready infrastructure

## Current Implementation

### Enhanced Telegram Bot
Use the enhanced listener which:
- Uses Alchemy RPC for better performance
- Falls back to direct contract reads (more reliable)
- Tracks market state by polling contract data
- Doesn't rely on events (which may not work)

**Run the enhanced version:**
```bash
npm run telegram:listen:enhanced
```

This approach:
- ✅ More reliable (doesn't depend on events)
- ✅ Works immediately
- ✅ Tracks all markets accurately
- ✅ Sends notifications for new markets and resolutions

## Environment Variables

Already added to `.env.local`:
```env
ALCHEMY_API_KEY=4l0fKzPwYbzWSqdDmxuSv
ALCHEMY_RPC_URL=https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv
```

## Using Alchemy RPC in Code

The enhanced listener automatically uses Alchemy RPC if configured:
```javascript
const sonic = defineChain({
  id: 146,
  rpc: process.env.ALCHEMY_RPC_URL || 'https://rpc.soniclabs.com',
});
```

## Future Enhancements

### Event-Based Tracking (Better Performance)
Once Alchemy's event APIs are fully compatible:
```javascript
// Query events directly via Alchemy
const logs = await alchemy.core.getLogs({
  address: CONTRACT_ADDRESS,
  fromBlock: 'earliest',
  topics: [eventSignature],
});
```

### Statistics Dashboard
- Use Alchemy to fetch all historical events
- Build user stats from event data
- Calculate PNL accurately
- Much faster than current approach

## Recommended Usage

**For Telegram Bot**: Use `telegram:listen:enhanced`
- More reliable
- Works with current setup
- No events needed

**For Future Stats**: Use Alchemy event queries
- Historical data
- Faster queries
- Better accuracy

