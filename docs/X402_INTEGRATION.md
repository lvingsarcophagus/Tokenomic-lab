# x402 Payment Protocol Integration

## Overview

x402 is a blockchain-agnostic HTTP payment protocol that enables micro-payments for API endpoints. When a request requires payment, the server returns HTTP 402 with payment details, the client pays via wallet, then retries with proof of payment.

## Architecture

```
Client Request → API Route
                    ↓
              No Payment?
                    ↓
         Return 402 + Payment Info
                    ↓
         Client Pays via Wallet
                    ↓
         Retry with TX Hash
                    ↓
         Verify Payment On-Chain
                    ↓
         Return Protected Content
```

## Implementation

### 1. Backend Middleware

Located in `lib/middleware/x402.ts`:

- `withX402Payment()` - Wraps API routes with payment protection
- `verifyPayment()` - Verifies transactions on-chain
- `createPaymentRequiredResponse()` - Returns 402 with payment details

### 2. Client Hook

Located in `hooks/use-x402-payment.ts`:

- `useX402Payment()` - React hook for payment handling
- `fetchWithPayment()` - Fetch wrapper with automatic payment flow
- Supports Phantom (Solana) and MetaMask (EVM)

### 3. Payment Verification

**Solana (via Helius):**
- Fetches transaction details from Helius API
- Verifies recipient address and amount
- Supports native SOL and SPL tokens (USDC)

**EVM (via Moralis):**
- Fetches transaction from Moralis API
- Verifies recipient and value
- Supports ETH, BNB, MATIC, etc.

## Usage

### Protect an API Route

```typescript
// app/api/premium/my-endpoint/route.ts
import { withX402Payment } from '@/lib/middleware/x402';

const X402_CONFIG = {
  endpoint: '/api/premium/my-endpoint',
  price: '0.01',
  asset: 'USDC',
  chain: 'solana',
  recipientAddress: process.env.X402_RECIPIENT_ADDRESS!,
};

async function handler(request: NextRequest) {
  // Your protected logic here
  return NextResponse.json({ data: 'premium content' });
}

export const POST = withX402Payment(X402_CONFIG, handler);
```

### Client-Side Usage

```typescript
'use client';

import { useX402Payment } from '@/hooks/use-x402-payment';

export function MyComponent() {
  const { fetchWithPayment, isPaying } = useX402Payment();

  const handleRequest = async () => {
    const data = await fetchWithPayment('/api/premium/my-endpoint', {
      method: 'POST',
      body: JSON.stringify({ param: 'value' }),
    });
    console.log(data);
  };

  return (
    <button onClick={handleRequest} disabled={isPaying}>
      {isPaying ? 'Processing Payment...' : 'Get Premium Data'}
    </button>
  );
}
```

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
X402_RECIPIENT_ADDRESS=your_wallet_address_here
```

This is where payments will be sent. Use:
- Solana wallet address for Solana payments
- EVM address (0x...) for Ethereum/BSC/Polygon payments

### Supported Chains

- **Solana** - Native SOL or SPL tokens (USDC)
- **Ethereum** - ETH or ERC-20 tokens
- **BSC** - BNB or BEP-20 tokens
- **Polygon** - MATIC or ERC-20 tokens

### Payment Assets

Common options:
- Native tokens: SOL, ETH, BNB, MATIC
- Stablecoins: USDC, USDT, DAI
- Custom tokens (requires token address)

## Payment Flow

1. **Initial Request**: Client makes API request without payment
2. **402 Response**: Server returns payment requirements
3. **User Prompt**: Client shows payment confirmation dialog
4. **Wallet Transaction**: User approves payment via Phantom/MetaMask
5. **Retry Request**: Client retries with transaction hash in headers
6. **Verification**: Server verifies payment on-chain
7. **Success**: Server returns protected content

## Security Considerations

### Server-Side

- Always verify payments on-chain (never trust client claims)
- Use nonces to prevent replay attacks
- Set minimum confirmations for high-value endpoints
- Rate limit to prevent spam
- Log all payment attempts for auditing

### Client-Side

- Always use HTTPS
- Validate payment amounts before signing
- Show clear payment confirmations to users
- Handle wallet connection errors gracefully
- Never expose private keys

## Testing

### Test Endpoint

Use the demo component:

```typescript
import { X402Demo } from '@/components/x402-demo';

// In your page
<X402Demo />
```

### Manual Testing

1. Set `X402_RECIPIENT_ADDRESS` in `.env.local`
2. Start dev server: `pnpm dev`
3. Navigate to page with x402-protected endpoint
4. Connect wallet (Phantom or MetaMask)
5. Trigger payment flow
6. Verify transaction on blockchain explorer

### Test Networks

For development, use testnets:
- Solana: Devnet (get free SOL from faucet)
- Ethereum: Sepolia (get free ETH from faucet)
- BSC: Testnet (get free BNB from faucet)

## Use Cases for Tokenomics Lab

### Micro-Payments for Premium Features

1. **Advanced AI Analysis** - $0.01 per deep analysis
2. **Real-Time Alerts** - $0.05 per month per token
3. **Historical Data Export** - $0.10 per export
4. **Whale Tracking** - $0.02 per whale report
5. **Smart Money Flow** - $0.03 per flow analysis

### Benefits vs Traditional Subscriptions

- No monthly commitment required
- Pay only for what you use
- Lower barrier to entry
- Instant access (no signup required)
- Blockchain-native payment rails
- Global accessibility

### Hybrid Model

Combine x402 with existing tiers:

- **FREE**: 20 scans/day (no payment)
- **PAY-PER-USE**: Unlimited scans at $0.01 each (x402)
- **PREMIUM**: Unlimited scans + advanced features ($9.99/month)

## Troubleshooting

### Payment Not Verified

- Check transaction hash is correct
- Ensure sufficient confirmations
- Verify recipient address matches
- Check amount is exact or greater

### Wallet Connection Issues

- Ensure wallet extension is installed
- Check network matches (mainnet vs testnet)
- Verify wallet has sufficient balance
- Try refreshing page and reconnecting

### API Errors

- Check API keys (Helius, Moralis) are valid
- Verify chain configuration is correct
- Check rate limits on verification APIs
- Review server logs for details

## Future Enhancements

- Support for Lightning Network (Bitcoin)
- Subscription-style recurring payments
- Payment channels for frequent users
- Multi-asset payment options
- Automatic refunds for failed requests
- Payment analytics dashboard

## Resources

- x402 Protocol: https://www.x402.org
- Helius API: https://docs.helius.dev
- Moralis API: https://docs.moralis.io
- Phantom Wallet: https://phantom.app/developers
- MetaMask Docs: https://docs.metamask.io

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review server logs for payment verification errors
3. Test on testnet first before mainnet
4. Verify wallet has sufficient balance + gas fees
