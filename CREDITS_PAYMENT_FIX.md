# Credits Payment System Fix

## Problem
When users clicked "ADD FUNDS" in the credits manager, they were redirected to the pay-per-scan page, but clicking the payment button didn't trigger the x402 payment modal. The payment flow wasn't working.

## Root Cause
The `/api/credits/add` route was NOT using the x402 payment middleware (`withX402Payment`). It was expecting payment to already be completed, but there was no mechanism to actually collect payment from the user.

## Solution

### 1. Integrated x402 Middleware
Updated `/app/api/credits/add/route.ts` to:
- Use `withX402Payment` middleware wrapper
- Dynamically fetch payment settings from Firestore admin settings
- Support both SOL and USDC payments based on `X-Payment-Asset` header
- Return 402 Payment Required response when no payment proof is provided
- Verify payment before adding credits

### 2. Fixed Asset Display
Updated `/app/pay-per-scan/page.tsx` to:
- Show correct asset (SOL or USDC) in payment button text
- Display correct blockchain network (Base for USDC, Solana for SOL)
- Remove hardcoded "USDC" references
- Remove dollar sign from amount display in summary (shows "10 USDC" not "$10 USDC")

### 3. Payment Flow
Now when user clicks "ADD FUNDS":
1. User selects amount and asset (SOL or USDC)
2. User clicks "PAY X.XX [ASSET]" button
3. Frontend calls `/api/credits/add` with amount and selected asset
4. Backend returns 402 Payment Required with payment details
5. x402 hook shows payment confirmation modal
6. User confirms and signs transaction in Phantom wallet
7. Transaction loading modal shows progress
8. Frontend retries API call with transaction hash
9. Backend verifies payment on-chain
10. Credits are added to user account
11. Page refreshes to show updated balance

## Files Modified
- `app/api/credits/add/route.ts` - Added x402 middleware integration
- `app/pay-per-scan/page.tsx` - Fixed asset display and payment flow
- `hooks/use-x402-payment.tsx` - Already had correct implementation

## Additional Fixes

### 3. Credit Enforcement
Added credit checks before allowing token scans:
- PAY_PER_USE users need at least 0.5 credits to scan
- Shows error message if insufficient credits
- Automatically scrolls to credits manager to add funds
- Deducts 0.5 credits after successful scan
- Refreshes page to show updated balance

### 4. Missing Import Fix
Added missing `Zap` icon import in admin dashboard

## Testing
To test:
1. Sign up as PAY_PER_USE user
2. Go to dashboard and click "ADD FUNDS"
3. Select amount and asset (USDC recommended)
4. Click payment button
5. Confirm in payment modal
6. Sign transaction in Phantom
7. Verify credits are added after confirmation
8. Try to scan a token with 0 credits - should show error
9. Add credits and scan again - should deduct 0.5 credits
