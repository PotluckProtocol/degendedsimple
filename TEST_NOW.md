# 🧪 Test Now - Quick Guide

## Option 1: Test with NEW Contract (After Deployment)

Once you have the new contract address:

```bash
# Update env and verify
./scripts/setup-and-test.sh 0xYOUR_NEW_CONTRACT_ADDRESS

# Start dev server
npm run dev
```

Then test in browser at http://localhost:3000

---

## Option 2: Test with CURRENT Contract (No Refund Feature)

To test the UI changes (refund button won't work, but UI is ready):

```bash
npm run dev
```

**Note**: The current contract doesn't have refund functionality, so:
- ✅ You'll see the refund button
- ❌ Refund won't work (contract doesn't have the function)
- ✅ Normal resolution still works

---

## What to Test

1. **Create Market**: Admin tab → Create Market
2. **Buy Shares**: Active markets → Buy shares
3. **Resolve Options**:
   - Normal: Option A or Option B
   - **NEW**: Refund button (only works on new contract)
4. **Claim**:
   - Normal winnings (10% fee)
   - **NEW**: Refund (full amount, no fee - new contract only)

---

## Quick Test Checklist

- [ ] Dev server running
- [ ] Can connect wallet
- [ ] Can create market
- [ ] Can buy shares
- [ ] See refund button in admin panel
- [ ] Test normal resolution
- [ ] Test refund (if new contract deployed)

---

**Ready to test?** Run `npm run dev` and open http://localhost:3000

