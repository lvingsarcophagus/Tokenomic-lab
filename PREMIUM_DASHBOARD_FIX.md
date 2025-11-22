# Premium Dashboard Fix Guide

## Issues Identified

### 1. **Charts Not Working**
- **Problem**: Historical charts (Price, Holders, Volume, Transactions, Whales) show "No data available"
- **Root Cause**: `/api/token/history` endpoint was missing
- **Status**: ✅ FIXED - Created `app/api/token/history/route.ts`

### 2. **Security Metrics Showing "UNKNOWN"**
- **Problem**: Security metrics grid shows UNKNOWN/N/A for all values
- **Root Cause**: `selectedToken.securityData` is not properly mapped from scan results
- **Fix Needed**: Map data from `selectedToken.rawData.securityData` or `selectedToken.enhancedData`

### 3. **Insights Not Loading**
- **Problem**: Market Sentiment, Security Metrics, Holder Analysis sections empty
- **Root Cause**: `/api/token/insights` endpoint was missing
- **Status**: ✅ FIXED - Created `app/api/token/insights/route.ts`

### 4. **Recent Activity Feed Not Working**
- **Problem**: No recent activity/transactions displayed
- **Root Cause**: Need to fetch transaction data from Moralis/Helius
- **Fix Needed**: Add transaction fetching logic

## Solutions Implemented

### ✅ Created Missing API Endpoints

#### 1. `/api/token/history/route.ts`
Returns historical data for all chart types:
- `price` - Price history over time
- `holders` - Holder count trend
- `volume` - Trading volume history
- `transactions` - Transaction count over time
- `whales` - Whale activity index
- `risk` - Risk score changes

**Parameters**:
- `address` - Token contract address
- `type` - Data type (price/holders/volume/transactions/whales/risk)
- `timeframe` - Time period (7D/30D/90D/1Y)

#### 2. `/api/token/insights/route.ts`
Returns advanced insights:
- `sentiment` - Market sentiment analysis
- `security` - Security metrics and audit status
- `holders` - Holder distribution analysis

**Parameters**:
- `address` - Token contract address
- `type` - Insight type (sentiment/security/holders)

## Fixes Still Needed

### 1. Fix Security Data Mapping

In `app/premium/dashboard/page.tsx`, around line 500-600 where `selectedToken` is set, add proper data mapping:

```typescript
// Current (broken):
setSelectedToken({
  // ... other fields
  securityData: data.securityData // This might be undefined
})

// Fixed:
setSelectedToken({
  // ... other fields
  securityData: {
    is_honeypot: result.critical_flags?.some(f => f.includes('HONEYPOT')) || false,
    is_mintable: result.critical_flags?.some(f => f.includes('mint')) || false,
    contract_verified: result.positive_signals?.some(s => s.includes('verified')) || false,
    ownershipRenounced: result.positive_signals?.some(s => s.includes('Renounced')) || false,
    lp_locked_percent: data.securityData?.lp_locked_percent || 0,
    lp_total_supply: data.priceData?.liquidityUSD || 0,
    holder_count: data.priceData?.holderCount || 0,
    isVerified: result.positive_signals?.some(s => s.includes('verified')) || false,
    isProxy: result.critical_flags?.some(f => f.includes('Proxy')) || false
  }
})
```

### 2. Add Recent Activity Feed

Create `/api/token/activity/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  // Fetch recent transactions from Moralis or Helius
  // Return formatted activity feed
  
  return NextResponse.json({
    success: true,
    activities: [
      {
        type: 'BUY',
        amount: '1000 TOKENS',
        value: '$50',
        from: '0x123...456',
        timestamp: Date.now()
      }
      // ... more activities
    ]
  })
}
```

### 3. Improve Layout

The current layout issues:
- Security metrics cards are too small
- Charts are cramped in 3x2 grid
- Need better spacing and hierarchy

**Recommended Layout**:
```
1. Token Header (Name, Price, Risk Score) - Full Width
2. Quick Actions (Watchlist, Refresh, Close) - Full Width
3. AI Summary - Full Width
4. Security Metrics Grid - 4 columns
5. Historical Charts - 2x3 grid (larger)
6. Advanced Insights - 3 columns
7. Recent Activity Feed - Full Width
```

## Testing Checklist

After applying fixes:

- [ ] Scan a token (e.g., BONK on Solana)
- [ ] Verify all 6 charts load with data
- [ ] Check security metrics show real values (not UNKNOWN)
- [ ] Confirm insights panels populate
- [ ] Test timeframe selector (7D, 30D, 90D, 1Y)
- [ ] Verify watchlist add/remove works
- [ ] Check responsive layout on mobile

## Quick Fix Commands

```bash
# 1. API endpoints already created ✅
# app/api/token/history/route.ts
# app/api/token/insights/route.ts

# 2. Test the endpoints
curl "http://localhost:3000/api/token/history?address=0x123&type=price&timeframe=30D"
curl "http://localhost:3000/api/token/insights?address=0x123&type=sentiment"

# 3. Restart dev server
pnpm dev
```

## Notes

- The historical data is currently mock data for demonstration
- In production, replace with real API calls to:
  - Mobula for price history
  - Moralis for holder/transaction history
  - Custom calculation for whale activity
  - Firestore for risk score history
- Consider caching historical data to reduce API calls
- Add loading skeletons for better UX

## Priority Order

1. **HIGH**: Fix security data mapping (user sees UNKNOWN everywhere)
2. **HIGH**: Verify charts load (main premium feature)
3. **MEDIUM**: Add recent activity feed
4. **MEDIUM**: Improve layout spacing
5. **LOW**: Add real-time data updates
6. **LOW**: Add export/share functionality
