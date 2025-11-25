# Production Environment Variables Template

Copy these to your hosting platform's environment variables (Vercel, Netlify, etc.)

## 🔑 Required Variables

```env
# thirdweb Client ID (same for dev and prod)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

# Contract Addresses (Sonic Mainnet)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894

# Engine Credentials (PRODUCTION - replace with your hosted Engine)
ENGINE_URL=https://your-engine-name.thirdweb.com
THIRDWEB_SECRET_KEY=your_production_secret_key_from_engine_dashboard
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3
```

## 📝 How to Fill These In

### 1. NEXT_PUBLIC_THIRDWEB_CLIENT_ID
✅ Already have: `f6847852033592db7f414e9b8eb170ba`
- Same for dev and production

### 2. Contract Addresses
✅ Already configured:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed market contract
- `NEXT_PUBLIC_TOKEN_ADDRESS`: USDC on Sonic

### 3. ENGINE_URL
❌ Need to get from thirdweb Engine:
- Go to: https://portal.thirdweb.com/engine
- Create Engine instance (if not done)
- Copy the URL from Overview page
- Format: `https://your-engine-name.thirdweb.com`

### 4. THIRDWEB_SECRET_KEY
❌ Need to get from Engine Dashboard:
- Go to your Engine instance → Settings
- Copy the Secret Key
- ⚠️ Keep this secret! Never commit to GitHub

### 5. BACKEND_WALLET_ADDRESS
✅ Already have: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`
- Make sure this wallet is configured in Engine Settings → Backend Wallets

## 🔒 Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose (they're public)
- ⚠️ `THIRDWEB_SECRET_KEY` is sensitive - never commit to git
- ⚠️ `BACKEND_WALLET_ADDRESS` - public, but ensure wallet is secure
- ⚠️ `ENGINE_URL` - public, but protects with secret key

## ✅ After Adding to Hosting Platform

1. Restart/redeploy your application
2. Verify variables are set correctly
3. Test the token minting feature
4. Check that contracts are accessible

