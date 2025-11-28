# 🚀 Deployment Guide - Follow These Steps

## Current Status

✅ Contract compiled successfully
✅ Deployment CLI is running
⏳ Waiting for your selection

---

## Steps to Complete Deployment

### Step 1: Select Contract (CURRENT STEP)

In your terminal, you'll see:
```
? Choose which contract(s) to deploy …  Use <space> to select, <return> to submit
⬡ PredictToken
⬡ PredictionMarket
```

**Action:**
1. Press **SPACE** to select `PredictionMarket` (you'll see a checkmark)
2. Press **ENTER** to confirm

---

### Step 2: Select Network

You'll be prompted to choose a network.

**Action:**
- Select: **Sonic** or **Sonic Mainnet**
- Chain ID should be: **146**

---

### Step 3: Enter Constructor Parameter

You'll be asked for the constructor parameter.

**Action:**
- Enter: `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
- This is the USDC token address on Sonic

---

### Step 4: Connect Wallet

A browser window will open for wallet connection.

**Action:**
1. Connect your wallet (make sure you're on Sonic network)
2. Confirm the connection

---

### Step 5: Confirm Deployment

You'll see the deployment transaction.

**Action:**
1. Review the deployment details
2. Confirm the transaction in your wallet
3. Wait for confirmation (~30 seconds)

---

### Step 6: Copy Contract Address

After deployment, you'll see:

```
✅ Contract deployed!
📍 Address: 0x...
```

**Action:**
- Copy the contract address
- Share it with me to update the environment

---

## Troubleshooting

**Problem**: Can't find Sonic network
- **Solution**: Make sure your wallet has Sonic Mainnet added
- RPC: https://rpc.soniclabs.com
- Chain ID: 146
- Currency: S

**Problem**: Insufficient funds
- **Solution**: Make sure you have enough Sonic (S) tokens for gas

**Problem**: Deployment fails
- **Solution**: Check that you're connected to Sonic Mainnet in your wallet

---

## After Deployment

Once you have the contract address, tell me and I'll:
1. ✅ Update `.env.local`
2. ✅ Verify the contract has refund feature
3. ✅ Restart dev server
4. ✅ Test refund functionality

---

**Status**: Waiting for contract selection... 👆


