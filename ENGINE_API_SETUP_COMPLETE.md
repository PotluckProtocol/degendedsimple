# ✅ Engine API Setup Complete

Based on the [Engine API Reference](https://engine.thirdweb.com/reference), your Engine API is now configured!

## Your Engine Credentials

- **Project ID**: `prj_cmidix3kq09qs8r0kskg6tmvq`
- **Secret Key**: `D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw`
- **Backend Wallet**: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`

## Engine URL Format

Your Engine URL should be one of these formats:

1. **Project ID format**: `https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com`
2. **Custom domain**: Check your Engine dashboard for the exact URL

## ✅ What's Configured

### Environment Variables (`.env.local`)

```env
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

### API Route Configuration

Your `src/app/api/claimToken/route.ts` is correctly configured according to the [Engine API Reference](https://engine.thirdweb.com/reference):

✅ **Endpoint**: `POST /contract/{chainId}/{contractAddress}/erc20/mint-to`
✅ **Authentication**: `Authorization: Bearer {secret_key}`
✅ **Headers**: Includes `x-backend-wallet-address`
✅ **Transaction Polling**: Uses `/transaction/status/{queueId}`

## 🔍 Verify Engine URL

1. **Check Engine Dashboard**:
   - Go to: https://portal.thirdweb.com/engine
   - Find your Engine instance
   - Copy the exact URL from Overview section

2. **Test Connection**:
   ```bash
   curl -H "Authorization: Bearer D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw" \
        https://your-engine-url.thirdweb.com/health
   ```

3. **Update if Needed**:
   - If the URL is different, update `.env.local`
   - Format: `ENGINE_URL=https://your-actual-engine-url.thirdweb.com`

## 📚 API Reference

According to the [Engine API Reference](https://engine.thirdweb.com/reference):

### ERC20 Mint Endpoint
- **Method**: `POST`
- **Path**: `/contract/{chainId}/{contractAddress}/erc20/mint-to`
- **Auth**: Bearer token with Secret Key
- **Headers**: 
  - `Authorization: Bearer {secret_key}`
  - `x-backend-wallet-address: {wallet_address}`
  - `Content-Type: application/json`

### Request Body
```json
{
  "toAddress": "0x...",
  "amount": "100"
}
```

### Response
```json
{
  "result": {
    "queueId": "...",
    "status": "queued"
  }
}
```

## 🧪 Testing

1. **Restart your dev server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test token minting**:
   - Open http://localhost:3000
   - Connect wallet
   - Use the "Claim Tokens" feature
   - Check if it works

## 🚀 Production Deployment

When deploying to production (Vercel/Netlify), add these environment variables:

```env
ENGINE_URL=https://prj_cmidix3kq09qs8r0kskg6tmvq.thirdweb.com
THIRDWEB_SECRET_KEY=D92BnAhNzykDbcIqzfPg1d_CgNM1qwpzjR2Ld27fageb8U5wGrCtRdleQ_fXmykMsaii_UQQeU3kO3uOGMY9Xw
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

> ⚠️ **Important**: Verify the exact Engine URL from your dashboard first!

## ✅ Checklist

- [x] Secret Key configured
- [x] Backend wallet address configured
- [x] API route code is correct (per Engine API Reference)
- [ ] Engine URL verified in dashboard
- [ ] Engine URL updated in `.env.local`
- [ ] Backend wallet configured in Engine Settings
- [ ] Backend wallet has gas tokens
- [ ] Test token minting locally

## 🔗 Reference Links

- [Engine API Reference](https://engine.thirdweb.com/reference)
- [Engine Dashboard](https://portal.thirdweb.com/engine)
- [Account Abstraction Guide](https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started)

---

**Next Step**: Verify the Engine URL from your dashboard and update if different!

