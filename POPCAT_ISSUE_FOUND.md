# POPCAT Issue - Root Cause Found

## The Problem

**Risk Score**: 82 (should be ~37)
**Logo**: Not loading (Mobula not returning logo field)

---

## Root Cause: Transaction Count Bug

### What's Happening

```
📊 Calculated Risk] Raw score before baseline: 22.43
✓ Meme Baseline Applied: 22.43 + 15 = 37.43
[Dead Token Detector] 🚨 DEAD TOKEN DETECTED: Zero transactions in 24h
🚨 [2025 Pump.fun Rug] +70 penalty
[Official Token Override] Score adjusted: 107.43 → 82.43
```

### The Bug

**Data Fetching**:
- Mobula returns: `txCount24h: 0` (DEFAULT - no data)
- Helius returns: `tx24h: 77` (actual data)
- Risk calculator receives: `txCount24h: 0` ❌

**Result**: Dead token detector triggers incorrectly!

### Why It Happens

In `lib/data/chain-adaptive-fetcher.ts`:
```typescript
// Mobula data
txCount24h: 0  // DEFAULT when Mobula doesn't have this data

// Helius data (fetched later)
tx24h: 77  // Correct value

// But risk calculator uses Mobula's value!
```

---

## The Fix Needed

### 1. Use Helius Transaction Count for Solana

**Location**: `lib/data/chain-adaptive-fetcher.ts`

**Change**:
```typescript
// Before
txCount24h: mobileData.transactions_24h || 0

// After (for Solana)
txCount24h: heliusData?.tx24h || mobileData.transactions_24h || 0
```

### 2. Disable Dead Token Check for Official Tokens

**Location**: `lib/risk-calculator.ts`

**Change**:
```typescript
// Before
if (txCount24h === 0) {
  applyDeadTokenPenalty()
}

// After
if (txCount24h === 0 && !isOfficialToken) {
  applyDeadTokenPenalty()
}
```

### 3. Add Logo to Mobula Response

**Location**: `lib/api/mobula.ts`

**Change**:
```typescript
return {
  name: data.name,
  symbol: data.symbol,
  price: data.price,
  marketCap: data.market_cap,
  logo: data.logo || data.image || null,  // Add this
  // ...
}
```

---

## Expected Result After Fix

### POPCAT Risk Score
```
Base Score: 22.43
+ Meme Baseline: +15
= 37.43

Official Token Bonus: -25
= 12.43

Final: ~12-15 (LOW RISK) ✅
```

### Why This Makes Sense
- ✅ Official token ($88M market cap, rank #458)
- ✅ Good liquidity ($3M)
- ✅ No dangerous authorities
- ✅ Active trading (77 tx/24h)
- ⚠️ Meme token (inherent volatility)

---

## Logo Issue

### Problem
```
[DEBUG] Available fields in Mobula response: []
```

Mobula API is not returning the logo field for POPCAT.

### Solutions

1. **Use CoinMarketCap logo** (fallback)
2. **Use CoinGecko logo** (fallback)
3. **Cache logos** from first successful fetch
4. **Manual logo mapping** for popular tokens

---

## Immediate Workaround

### For Users
The individual risk factors are correct - trust those instead of the overall score:
- Supply Dilution: 30 ✅
- Holder Concentration: 30 ✅
- Liquidity: 8 ✅
- Program Security: All ✅
- Tax/Fee: 0% ✅

### For Developers
Add this check before dead token detection:
```typescript
const isOfficialToken = /* check official token resolver */
const hasRecentActivity = heliusData?.tx24h > 0

if (!isOfficialToken && txCount24h === 0 && !hasRecentActivity) {
  // Apply dead token penalty
}
```

---

## Files to Fix

1. `lib/data/chain-adaptive-fetcher.ts` - Use Helius tx count
2. `lib/risk-calculator.ts` - Skip dead token check for official tokens
3. `lib/api/mobula.ts` - Add logo field
4. `lib/services/official-token-resolver.ts` - Pass official status to calculator

---

**Priority**: Critical
**Impact**: Affects all Solana tokens with low Mobula tx data
**Estimated Fix Time**: 15 minutes
**Date**: 2025-11-22
