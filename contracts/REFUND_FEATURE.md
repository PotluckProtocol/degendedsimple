# Refund Feature Documentation

## Overview

Added refund functionality to the PredictionMarket contract, allowing admins to refund users' deposits when a market cannot be resolved with a clear winner.

## Changes Made

### 1. Contract Updates (`PredictionMarket.sol`)

#### New Functionality
- **Outcome 3 = Refund**: Markets can now be resolved with outcome 3, which triggers refund mode
- **`claimRefund()` function**: New function for users to claim their refunds
  - Returns full deposit amount (no protocol fee)
  - Users claim refunds for both Option A and Option B shares in one transaction
  - Prevents double claiming with share reset

#### Security Improvements
- **ReentrancyGuard**: Added OpenZeppelin's ReentrancyGuard for protection against reentrancy attacks
- **Division by Zero Protection**: Added explicit check for `totalShares > 0` in `claimWinnings()`
- **Better Validation**: Improved input validation and error messages

### 2. Contract Changes

```solidity
// Outcome values:
// 0 = unresolved
// 1 = Option A wins
// 2 = Option B wins
// 3 = Refund (NEW)

// New function:
function claimRefund(uint256 _marketId) public nonReentrant
```

## How Refunds Work

1. **Admin resolves market with outcome 3**:
   ```solidity
   resolveMarket(marketId, 3)  // 3 = refund
   ```

2. **Users claim their refunds**:
   ```solidity
   claimRefund(marketId)  // Returns full deposit, no fee
   ```

3. **What happens**:
   - User receives 100% of their deposit back
   - No protocol fee is charged (unlike normal resolution)
   - Both Option A and Option B shares are refunded in one call
   - Shares are reset to prevent double claiming

## Example Scenario

**Market**: "Will Bitcoin hit $100k by Dec 31?"
- User buys 5 USDC of Option A (Yes)
- User buys 3 USDC of Option B (No)
- **Total deposited**: 8 USDC

**If resolved as refund (outcome 3)**:
- User calls `claimRefund(marketId)`
- User receives: 8 USDC (full amount, no fee)

**If resolved normally (outcome 1 or 2)**:
- Winners split the pool (minus 10% protocol fee)
- Refund function cannot be used

## Security Features

### Reentrancy Protection
All state-changing functions now use `nonReentrant` modifier:
- `buyShares()` - Prevents reentrancy during token transfers
- `claimWinnings()` - Prevents reentrancy during payout
- `claimRefund()` - Prevents reentrancy during refund

### Division by Zero Protection
```solidity
require(totalShares > 0, "No shares for winning option");
```

### Double Claiming Prevention
Shares are reset to 0 after claiming, preventing multiple claims:
```solidity
shares[_marketId][msg.sender][0] = 0;
shares[_marketId][msg.sender][1] = 0;
```

## Breaking Changes

⚠️ **This is a NEW contract version** - the existing deployed contract does not have refund functionality.

### Migration Path

1. **Deploy new contract** with refund functionality
2. **Update frontend** to support refund resolution and claims
3. **Update environment variables** with new contract address
4. **Test thoroughly** before migrating users

### Backward Compatibility

The new contract is **backward compatible** for existing functionality:
- All existing functions work the same way
- Outcome 1 and 2 resolution unchanged
- Claim winnings works identically
- Only adds new refund functionality

## Frontend Updates Needed

To fully support refunds, update these components:

1. **Market Resolution Component** (`market-resolve-admin.tsx`):
   - Add "Refund" button/option when resolving
   - Pass outcome = 3 for refunds

2. **Market Resolved Component** (`market-resolved.tsx`):
   - Check if outcome === 3
   - Show refund UI instead of winnings UI
   - Call `claimRefund()` instead of `claimWinnings()`

3. **Contract Method Signatures**:
   ```typescript
   // New method
   "function claimRefund(uint256 _marketId) public"
   ```

## Testing Checklist

- [ ] Deploy new contract
- [ ] Create test market
- [ ] Users buy shares
- [ ] Admin resolves with outcome 3
- [ ] Users claim refunds successfully
- [ ] Verify no protocol fee charged
- [ ] Verify double claiming prevented
- [ ] Test with users who have both Option A and B shares
- [ ] Test edge cases (empty markets, etc.)

## Event Emissions

New event added:
```solidity
event RefundClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
```

## Security Audit

See `contracts/SECURITY_AUDIT.md` for complete security analysis.

**Key Security Rating**: 8.5/10 (improved from 7.5/10)

Improvements:
- ✅ ReentrancyGuard added
- ✅ Division by zero protection
- ✅ Refund functionality added
- ✅ Better validation

## Deployment

This contract must be **redeployed** - it is not an upgrade to the existing contract.

**Note**: The existing contract at `0x39b4bD619ba158b4Cfe61a6FADD900fAb22E930B` does NOT have refund functionality. Users with funds in the old contract will need to use that contract to claim winnings.

