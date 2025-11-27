# ✅ Testing Checklist

## Contract Deployment ✅

- [ ] Contract deployed on Sonic Mainnet
- [ ] Contract address copied
- [ ] Contract verified on explorer

## Environment Setup

- [ ] `.env.local` updated with new contract address
- [ ] Dev server restarted

## Refund Feature Testing

### Basic Functionality

- [ ] Create a new market
- [ ] Buy shares (Option A)
- [ ] Buy shares (Option B)
- [ ] Resolve market as refund (outcome 3)
- [ ] Claim refund - receive full deposit back
- [ ] Verify no protocol fee charged

### Normal Resolution (Control Test)

- [ ] Create another market
- [ ] Buy shares
- [ ] Resolve normally (outcome 1 or 2)
- [ ] Claim winnings
- [ ] Verify 10% protocol fee deducted

### Edge Cases

- [ ] Test refund on market with no shares
- [ ] Test refund on market with only Option A shares
- [ ] Test refund on market with only Option B shares
- [ ] Test claiming refund twice (should fail)
- [ ] Test resolving already resolved market (should fail)

## UI Testing

- [ ] Refund button appears in admin resolve panel
- [ ] Refund button has distinct styling (orange)
- [ ] Refund status shows correctly in resolved markets
- [ ] Claim refund button shows correct amount
- [ ] Toast notifications work for refund claims

## Security Testing

- [ ] Non-owner cannot resolve markets
- [ ] Non-owner cannot resolve as refund
- [ ] Users can only claim their own refunds
- [ ] Double claiming prevented

## Documentation

- [ ] Update contract address in README
- [ ] Update deployment docs
- [ ] Document refund feature for users

---

**Status**: Ready for testing! 🚀
