# Testing User Statistics in UI

## ✅ Server Status

**Dev Server**: Running at http://localhost:3000

## 🧪 Testing Steps

### 1. Open the Application
- Navigate to: http://localhost:3000
- Wait for the page to load

### 2. Connect Your Wallet
- Click "Connect Wallet" button
- Select your wallet provider
- Approve connection
- Make sure you're on Sonic Mainnet

### 3. Navigate to My Stats
- Look for tabs at the top: "Active", "Resolved", "My Stats"
- Click on **"My Stats"** tab

### 4. Verify Statistics Display

You should see:
- **Loading state** (~3-5 seconds on first load)
- Then statistics cards appear

### 5. Check Expected Data

**For test wallet** (`0xeA869669210a69B035b382E0F2A498B87dc6a45C`):

**Total P&L Card:**
- Amount: **-0.60 USDC** (red, negative)
- Percentage: **-10.00%**
- Trend icon: Down (red)

**Stats Grid:**

1. **Total Invested**: **6.00 USDC**
   - Sum of all share purchases

2. **Total Earned**: **5.40 USDC** (green)
   - Winnings from Market #10

3. **Total Refunded**: **0.00 USDC**
   - No refunds claimed

4. **Win Rate**: **100.0%**
   - Shows: 1W / 0L
   - (1 win, 0 losses)

**Market Counts:**

1. **Total Markets**: **3**
   - Markets you've participated in

2. **Active Markets**: **2**
   - Unresolved markets with your investments

## ✅ What to Verify

### Query Performance
- [ ] Initial load takes ~3-5 seconds
- [ ] Shows loading skeleton/placeholder
- [ ] Data appears smoothly

### Data Accuracy
- [ ] Total Invested: 6.00 USDC
- [ ] Total Earned: 5.40 USDC
- [ ] PNL: -0.60 USDC (-10.00%)
- [ ] Win Rate: 100.0% (1W / 0L)
- [ ] Total Markets: 3
- [ ] Active Markets: 2

### UI Elements
- [ ] Refresh button works (spinning icon)
- [ ] Cards display correctly
- [ ] Color coding (green for profit, red for loss)
- [ ] Icons display properly

### Error Handling
- [ ] If wallet not connected, shows message
- [ ] If error occurs, shows error message + retry button

## 🔄 Test Refresh

1. Click the refresh icon (top right)
2. Should show loading spinner
3. Data should reload (~3-5 seconds)
4. Statistics should update

## 📊 Test with Different Wallet

1. Disconnect current wallet
2. Connect a different wallet
3. Navigate to "My Stats"
4. Should show different statistics (or empty if no activity)

## 🐛 Troubleshooting

### If statistics don't load:
1. Check browser console for errors
2. Verify wallet is connected
3. Verify you're on Sonic Mainnet
4. Check network tab for failed requests

### If data is incorrect:
1. Check that deployment block is correct (56,668,150)
2. Verify Alchemy RPC is working
3. Check console for query errors

### If loading takes too long:
1. Normal: 3-5 seconds for initial load
2. If > 10 seconds, check network connection
3. Verify Alchemy API is responding

## ✅ Success Criteria

Everything works correctly if:
- ✅ Statistics load within 5 seconds
- ✅ Data matches expected values
- ✅ UI displays properly
- ✅ Refresh button works
- ✅ Error states handled gracefully

## 📝 Notes

- **Initial Load**: First query may take longer as it queries from deployment block
- **Subsequent Loads**: Faster if cached, but still queries fresh data
- **Network**: Requires Alchemy RPC connection
- **Block Coverage**: Queries from block 56,668,150 to latest (~39k blocks)

---

**Ready to test! Open http://localhost:3000 and check the "My Stats" tab** 🚀


