# Helius API Integration

## Overview

The Tokenomics Lab platform now leverages the **Helius API** (free tier) to provide comprehensive Solana blockchain data analysis. This integration enhances the premium dashboard with real-time Solana token insights.

## Features Implemented

### 1. Digital Asset Standard (DAS) API
- **Token Metadata**: Name, symbol, decimals, total supply
- **Off-chain Data**: Fetches metadata from Arweave and IPFS
- **Token Authorities**: Freeze, mint, and update authority status
- **Holder Distribution**: Top token holders and concentration analysis

### 2. Enhanced Transactions API
- **24-Hour Activity Metrics**: Transaction count, unique traders, volume
- **Human-Readable Transactions**: Decoded instruction data with context
- **Recent Activity Feed**: Last 10-20 transactions with timestamps and fees
- **Transaction History**: Full transaction log for analysis

### 3. Standard RPC Methods
- **Token Account Data**: Largest token holders via `getTokenLargestAccounts`
- **Account Information**: Balance and ownership data
- **Supply Information**: Current circulating supply and decimals

## Components

### SolanaHeliusPanel (`components/solana-helius-panel.tsx`)
A comprehensive React component that displays:
- Token metadata (name, symbol, decimals, supply)
- Authority status with security indicators
- Holder distribution with pie chart visualization
- 24-hour activity metrics
- Recent transaction feed
- Auto-refresh functionality

### API Endpoint (`app/api/solana/helius-data/route.ts`)
Server-side endpoint that:
- Validates Solana addresses
- Fetches comprehensive dashboard data
- Handles errors gracefully
- Returns structured JSON response

### Enhanced Helius Service (`lib/api/helius.ts`)
New functions added:
- `getHeliusTransactionHistory()` - Fetch detailed transaction history
- `getHeliusTokenPrice()` - Get price data for verified tokens
- `getHeliusDashboardData()` - Unified data fetcher for dashboard

## Usage

### In Premium Dashboard

The Helius panel automatically appears when:
1. User scans a Solana token
2. Token has a valid Solana address (32-44 characters)
3. User has PREMIUM tier access

```typescript
{selectedToken.chain && 
 selectedToken.chain.toLowerCase().includes('solana') && 
 selectedToken.address && 
 selectedToken.address.length >= 32 && (
  <SolanaHeliusPanel 
    tokenAddress={selectedToken.address}
    onDataLoaded={(data) => console.log('Helius data:', data)}
  />
)}
```

### API Call Example

```typescript
const response = await fetch(`/api/solana/helius-data?address=${tokenAddress}`)
const result = await response.json()

if (result.success) {
  const { metadata, authorities, holders, transactions, recentActivity } = result.data
  // Use the data...
}
```

## Data Structure

```typescript
{
  metadata: {
    name: string
    symbol: string
    decimals: number
    supply: number
  },
  authorities: {
    freezeAuthority: string | null  // null = revoked (good)
    mintAuthority: string | null    // null = revoked (good)
    updateAuthority: string | null  // null = revoked (good)
  },
  holders: {
    count: number
    topHolders: Array<{
      address: string
      balance: number
      percentage: number
    }>
  },
  transactions: {
    count24h: number
    volume24h: number
    uniqueTraders24h: number
  },
  recentActivity: Array<{
    signature: string
    timestamp: number
    type: string
    fee: number
  }>
}
```

## Security Indicators

### Authority Status
- **REVOKED** (Green) = Authority has been permanently removed (secure)
- **ACTIVE** (Yellow/Red) = Authority still exists (potential risk)

### Key Authorities
1. **Freeze Authority**: Can freeze token accounts (prevent transfers)
2. **Mint Authority**: Can create new tokens (dilute supply)
3. **Update Authority**: Can modify token metadata

## Free Tier Limits

Helius free tier provides:
- ✅ Full DAS API access
- ✅ Enhanced Transactions API
- ✅ Standard RPC methods
- ✅ Token price data (top 10k tokens by 24h volume)
- ✅ WebSocket endpoints (basic)
- ⚠️ Rate limits apply (check Helius documentation)

## Environment Setup

Required environment variable:
```bash
HELIUS_API_KEY=your_helius_api_key_here
```

Get your free API key at: https://helius.dev

## Future Enhancements

Potential additions:
- [ ] WebSocket integration for real-time updates
- [ ] Compressed NFT support
- [ ] Inscription and SPL-20 data
- [ ] Advanced filtering and search
- [ ] Historical price charts
- [ ] Whale movement alerts
- [ ] Token holder analytics over time

## Testing

Test with popular Solana tokens:
- **BONK**: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
- **WIF**: EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
- **POPCAT**: 7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr

## Support

For issues or questions:
- Check Helius documentation: https://docs.helius.dev
- Review API status: https://status.helius.dev
- Contact support if API key issues persist
