# 🚀 Setting Up thirdweb Hosted Engine (Production)

For production deployment, you need a **hosted Engine instance** from thirdweb. Based on the [thirdweb Account Abstraction documentation](https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started), here's what you need:

## 🔗 Understanding Engine vs Account Abstraction

- **Account Abstraction**: Handled by your React app (already configured via `ThirdwebProvider`)
- **Engine**: Needed for backend operations like token minting via API routes
- **Secret Key**: Required for both Engine API calls AND account abstraction features (bundler/paymaster)

## ⚡ Quick Setup (5 minutes)

### Step 1: Create API Key / Secret Key

According to the [thirdweb docs](https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started), to use bundler and paymaster (account abstraction features), you must create an API key:

1. Go to: **https://thirdweb.com/dashboard**
2. Navigate to: **Settings** → **API Keys** tab
3. Click **"Create API Key"**
4. Follow the steps to create your API key
5. **Copy the Secret Key** - This is your `THIRDWEB_SECRET_KEY`

> **Note**: You already have a Secret Key configured. Verify it matches what's in the dashboard.

### Step 2: Set Up Billing Account (For Mainnet)

If deploying on mainnet (Sonic Mainnet), you'll need:
- Create a billing account
- Add a payment method
- This enables account abstraction infrastructure on mainnet

### Step 3: Go to Engine Dashboard

Visit: **https://portal.thirdweb.com/engine**

### Step 4: Create Engine Instance

1. Click the **"Create Engine"** button
2. Fill in:
   - **Name**: `degended-markets-production` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Plan**: Start with Free/Starter plan
3. Click **"Create Engine"**
4. Wait 2-3 minutes for deployment

### Step 5: Get Your Engine Credentials

Once deployed, you'll see your Engine instance. Get these values:

#### A. Engine URL
- In the **Overview** tab
- Format: `https://your-engine-name.thirdweb.com`
- Copy this → This is your `ENGINE_URL`

#### B. Secret Key (if different from API key)
- Go to: **Settings** → **Secret Key**
- Click **"Reveal"** and copy
- ⚠️ **Keep this secret!** → This might be the same as your API key Secret Key

> **Important**: According to the [thirdweb documentation](https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started), the `THIRDWEB_SECRET_KEY` is used for both:
> - Backend operations (Engine API calls)
> - Account abstraction features (bundler and paymaster)

### Step 6: Configure Backend Wallet

1. In Engine Dashboard → **Settings** → **Backend Wallets**
2. Click **"Add Backend Wallet"**
3. Choose one option:

   **Option A: Add Wallet by Address**
   - Enter: `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3`
   - Save

   **Option B: Import Wallet**
   - Import using private key: `0x6fce8563d2f1a23960cfd7fee4da21b9065bc41b0a92735ce38212d5fe531377`
   - Save

### Step 7: Update Production Environment Variables

Add these to your hosting platform (Vercel/Netlify):

```env
# Client ID (for frontend - already have)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=f6847852033592db7f414e9b8eb170ba

# Secret Key (for backend operations and account abstraction)
THIRDWEB_SECRET_KEY=your_secret_key_here

# Engine Configuration
ENGINE_URL=https://your-engine-name.thirdweb.com
BACKEND_WALLET_ADDRESS=0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B
NEXT_PUBLIC_TOKEN_ADDRESS=0x29219dd400f2Bf60E5a23d13Be72B486D4038894
```

## 📝 Account Abstraction Configuration

According to the [thirdweb Account Abstraction guide](https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started):

- Your frontend already uses `ThirdwebProvider` which handles smart accounts
- The `THIRDWEB_SECRET_KEY` enables backend features (bundler, paymaster)
- Smart wallets are automatically created for users when they connect

### For Backend/API Routes

If you need to use smart accounts in backend code (like your `claimToken` API route), you would:

```typescript
import { createThirdwebClient } from "thirdweb";
import { privateKeyAccount } from "thirdweb/wallets";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY as string,
});

const personalAccount = privateKeyAccount({
  client,
  privateKey: process.env.PRIVATE_KEY as string,
});
```

However, your current setup uses Engine API calls directly, which is simpler.

## ✅ Verification Checklist

- [ ] API Key/Secret Key created in dashboard
- [ ] Billing account set up (for mainnet)
- [ ] Engine instance created and deployed
- [ ] Engine URL copied
- [ ] Secret Key copied (saved securely)
- [ ] Backend wallet configured in Engine
- [ ] Environment variables ready for production

## 📋 What You'll Need

| What | Where to Get It | Your Value |
|------|-----------------|------------|
| **Client ID** | Dashboard → Settings → API Keys | `f6847852033592db7f414e9b8eb170ba` ✅ |
| **Secret Key** | Dashboard → Settings → API Keys | (copy from dashboard) |
| **Engine URL** | Engine Dashboard → Overview | `https://xxx.thirdweb.com` |
| **Backend Wallet** | Your wallet | `0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3` ✅ |
| **Contract Address** | Your deployed contract | `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` ✅ |
| **Token Address** | USDC on Sonic | `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` ✅ |

## 🎯 Next Steps

Once Engine is set up:
1. ✅ You have your Engine URL and Secret Key
2. ✅ Backend wallet is configured
3. ✅ Account abstraction features enabled via Secret Key
4. → Proceed with deployment: [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)

## 🔗 Links

- **Engine Dashboard**: https://portal.thirdweb.com/engine
- **Account Abstraction Guide**: https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started
- **Engine Documentation**: https://portal.thirdweb.com/engine/v2
- **Dashboard Settings**: https://thirdweb.com/dashboard/settings/api-keys

## 💡 Key Insights from Documentation

Based on the [thirdweb Account Abstraction documentation](https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started):

1. **Secret Key is Required**: Both Engine and account abstraction features need `THIRDWEB_SECRET_KEY`
2. **Billing for Mainnet**: Account abstraction on mainnet requires a billing account
3. **Smart Wallets**: Your app already uses smart wallets via `ThirdwebProvider` in React
4. **Backend Operations**: Use Engine API for backend operations (like your token minting)

## 💡 Tips

- Start with the **Free tier** to test
- You can upgrade later as your app grows
- Monitor usage in the Engine dashboard
- Keep your Secret Key secure (use a password manager)
- Verify your Secret Key works for both Engine and account abstraction

---

**Ready?** Go to https://portal.thirdweb.com/engine and create your Engine instance now!
