# Engine API Configuration

Based on the [thirdweb Engine API Reference](https://engine.thirdweb.com/reference), here's how to configure your Engine API setup.

## Your Engine Credentials

- **Project ID**: `prj_cmidix3kq09qs8r0kskg6tmvq`
- **Secret Key**: `D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw`

## Finding Your Engine URL

Your Engine URL is typically:
- `https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com`
- Or check your Engine dashboard for the exact URL

## API Setup Steps

### 1. Update Environment Variables

Update your `.env.local` (for local) and production environment variables:

```env
# Engine Configuration
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3

# Client ID (already configured)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba
```

### 2. API Authentication

According to the [Engine API Reference](https://engine.thirdweb.com/reference), all requests need:

```typescript
headers: {
  "Authorization": `Bearer ${THIRDWEB_SECRET_KEY}`,
  "Content-Type": "application/json"
}
```

### 3. ERC20 Mint Endpoint

Your current API route uses the correct endpoint format:

```
POST /contract/{chainId}/{contractAddress}/erc20/mint-to
```

For Sonic (Chain ID: 146) and your USDC token:
```
POST /contract/146/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/erc20/mint-to
```

### 4. Request Format

```json
{
  "toAddress": "0x...",
  "amount": "100"
}
```

### 5. Response Format

```json
{
  "result": {
    "queueId": "...",
    "status": "queued"
  }
}
```

## Current API Route Configuration

Your `src/app/api/claimToken/route.ts` is already correctly configured according to the Engine API reference:

✅ **Correct Authentication**: Uses `Bearer ${THIRDWEB_SECRET_KEY}`
✅ **Correct Endpoint**: `/contract/{chainId}/{contractAddress}/erc20/mint-to`
✅ **Correct Headers**: Includes `x-backend-wallet-address`
✅ **Transaction Polling**: Checks status via `/transaction/status/{queueId}`

## Verification Steps

1. **Verify Engine URL**:
   - Go to: https://portal.thirdweb.com/engine
   - Find your Engine instance
   - Copy the exact URL from Overview

2. **Test API Connection**:
   ```bash
   curl -H "Authorization: Bearer D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw" \
        https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com/health
   ```

3. **Check Backend Wallet**:
   - Ensure `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3` is configured in Engine Settings
   - Wallet should have sufficient funds for gas

## Common Issues

### 401 Unauthorized
- Check Secret Key is correct
- Verify Authorization header format: `Bearer {secret_key}`

### 400 Bad Request
- Verify chain ID (146 for Sonic)
- Check contract address is correct
- Ensure backend wallet is configured

### Transaction Fails
- Check backend wallet has gas tokens
- Verify contract allows minting
- Check amount format (string, not number)

## API Reference Links

- [Engine API Reference](https://engine.thirdweb.com/reference)
- [ERC20 Mint Endpoint](https://engine.thirdweb.com/reference/erc20/mint-to)
- [Transaction Status](https://engine.thirdweb.com/reference/transaction/status)

## Next Steps

1. Update `.env.local` with correct `ENGINE_URL`
2. Verify Engine URL in dashboard
3. Test the API route locally
4. Deploy to production with same credentials

