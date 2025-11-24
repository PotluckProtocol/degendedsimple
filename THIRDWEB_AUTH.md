# thirdweb Authentication for Deployment

The `npx thirdweb deploy` command requires authentication. Here are your options:

## Option 1: Use Secret Key (If you have one)

If you have a thirdweb secret key from your dashboard:

```bash
npx thirdweb deploy -k YOUR_SECRET_KEY
```

## Option 2: Browser Authentication

1. Run the command (it will open a browser):
   ```bash
   npx thirdweb deploy
   ```

2. In the browser:
   - Sign in to your thirdweb account
   - Authorize the CLI
   - Return to the terminal

## Option 3: Use thirdweb Dashboard (Alternative)

Instead of CLI, you can deploy directly from the dashboard:

1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Click "Deploy Contract"
3. Upload `contracts/PredictionMarket.sol`
4. Select Sonic Mainnet
5. Enter constructor: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
6. Connect your wallet and deploy

## Getting Your Secret Key

If you need a secret key:
1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Settings → API Keys
3. Copy your Secret Key


