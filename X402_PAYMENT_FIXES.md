# x402 Payment System Fixes

## Issues Fixed

### 1. ✅ Null PublicKey Error
**Problem:** `can't access property "toBuffer", owner is null`

**Root Cause:** Attempting to check wallet balances before Phantom wallet was connected.

**Solution:**
- Added wallet connection check before accessing `solana.publicKey`
- Attempt to connect wallet if not already connected
- Handle user rejection gracefully
- Return zero balances if connection fails

```typescript
// Check if wallet is connected
if (!solana.publicKey) {
  await solana.connect({ onlyIfTrusted: false });
}

// Verify publicKey exists
if (!solana.publicKey) {
  return { solBalance: 0, usdcBalance: 0 };
}
```

### 2. ✅ Payment Verification Logging
**Problem:** Empty error object `{}` when payment verification fails.

**Solution:**
- Enhanced error logging with full details:
  - HTTP status code
  - Status text
  - Error response body
  - Transaction hash
  - Payment nonce
- Parse error text even if JSON parsing fails
- Show user-friendly toast notifications

```typescript
console.error('[x402] Payment verification failed:', {
  status: retryResponse.status,
  statusText: retryResponse.statusText,
  errorData,
  errorText,
  txHash,
  nonce: data.payment.nonce
});
```

### 3. ✅ Better Request Logging
**Problem:** Hard to debug payment flow issues.

**Solution:**
- Log retry request details before sending
- Log response status after receiving
- Track transaction hash and nonce throughout flow

## Common Issues & Solutions

### Issue: "Phantom wallet is blocking"

**Possible Causes:**
1. User rejected the connection request
2. Wallet is locked
3. Network mismatch (testnet vs mainnet)
4. Insufficient balance

**Solutions:**
1. **Check Wallet Connection:**
   - Ensure Phantom is unlocked
   - Click "Connect" when prompted
   - Grant permission to the site

2. **Verify Network:**
   - For testnet: Switch Phantom to Devnet
   - For mainnet: Switch Phantom to Mainnet
   - Settings > Developer Settings > Change Network

3. **Check Balance:**
   - For SOL: Ensure you have enough SOL + gas fees
   - For USDC: Ensure you have USDC tokens
   - Testnet: Get free SOL from https://faucet.solana.com

### Issue: "Payment verification failed"

**Possible Causes:**
1. Transaction not confirmed yet
2. Wrong network (testnet vs mainnet mismatch)
3. Invalid recipient address
4. Backend verification timeout

**Solutions:**
1. **Wait for Confirmation:**
   - Testnet: 5 retry attempts with 3-second delays (15 seconds total)
   - Mainnet: 2-second delay before verification
   - Check transaction on Solscan

2. **Verify Settings:**
   - Check admin x402 settings in Firebase
   - Ensure `useTestnet` matches your environment
   - Verify recipient addresses are correct

3. **Check Transaction:**
   - Testnet: https://explorer.solana.com/?cluster=devnet
   - Mainnet: https://explorer.solana.com/
   - Search for your transaction hash

### Issue: "Insufficient USDC balance"

**Solutions:**
1. **Get USDC:**
   - Mainnet: Buy from exchange (Coinbase, Binance)
   - Transfer to your Phantom wallet
   - Ensure it's on Solana network (not Ethereum)

2. **Use SOL Instead:**
   - Select SOL as payment asset
   - Easier for testing on devnet
   - Get free devnet SOL from faucet

## Testing Checklist

### Before Testing
- [ ] Phantom wallet installed and unlocked
- [ ] Correct network selected (devnet/mainnet)
- [ ] Sufficient balance (SOL or USDC)
- [ ] Admin x402 settings configured
- [ ] Recipient addresses set

### During Testing
- [ ] Wallet connection prompt appears
- [ ] Balance check shows correct amounts
- [ ] Payment confirmation modal displays
- [ ] Transaction signing prompt appears
- [ ] Loading modal shows progress
- [ ] Transaction confirms on blockchain
- [ ] Backend verifies payment
- [ ] Credits/subscription activated

### After Testing
- [ ] Check browser console for errors
- [ ] Verify transaction on Solscan
- [ ] Confirm credits/subscription in database
- [ ] Test with both SOL and USDC
- [ ] Test rejection flow (cancel payment)

## Debugging Tips

### 1. Check Browser Console
Look for these log messages:
```
[Balance Check] Wallet not connected, attempting to connect...
[Balance Check] Wallet connected: {...}
[x402] Using MAINNET/DEVNET for payment
[x402] Payment asset: SOL/USDC
[x402] Retrying request with payment proof: {...}
[x402] Retry response status: 200
```

### 2. Check Network Tab
- Look for 402 response (payment required)
- Check retry request has payment headers
- Verify response status and body

### 3. Check Phantom Wallet
- Open Phantom extension
- Check transaction history
- Verify network setting
- Check balance

### 4. Check Backend Logs
Server-side logs show:
```
[x402] Using endpoint: DEVNET/MAINNET
[x402] Verifying transaction: <hash>
[x402] Attempt 1/5 - waiting 3 seconds...
[x402] TESTNET transaction confirmed - accepting payment
```

## Environment Variables

Ensure these are set in `.env.local`:

```bash
# x402 Payment Protocol
X402_RECIPIENT_ADDRESS=<your-solana-address>
X402_USE_TESTNET=true  # or false for mainnet

# Helius API (for mainnet verification)
HELIUS_API_KEY=<your-helius-key>
```

## Admin Settings

Configure in Firebase Console > Firestore > `admin_settings/x402`:

```json
{
  "useTestnet": true,
  "solRecipientAddress": "<devnet-address>",
  "usdcRecipientAddress": "<mainnet-address>",
  "price": "29.00"
}
```

## Troubleshooting Commands

### Check Transaction Status
```bash
# Devnet
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransaction",
  "params": ["<tx-hash>", {"encoding": "json"}]
}
'

# Mainnet
curl https://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransaction",
  "params": ["<tx-hash>", {"encoding": "json"}]
}
'
```

### Test Payment Endpoint
```bash
# Trigger 402 response
curl http://localhost:3000/api/credits/add \
  -X POST \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "credits": 100}'
```

## Support

If issues persist:
1. Check all environment variables are set
2. Verify Firestore rules allow access
3. Ensure Phantom wallet is up to date
4. Try clearing browser cache
5. Test with a different wallet address
6. Check Firebase Console for errors
