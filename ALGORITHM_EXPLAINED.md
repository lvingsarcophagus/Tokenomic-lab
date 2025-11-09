# 🧮 Token Risk Algorithm - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [How the Algorithm Works](#how-the-algorithm-works)
3. [The 10 Risk Factors](#the-10-risk-factors)
4. [Missing Data Handling](#missing-data-handling)
5. [Real Examples](#real-examples)
6. [API Integration](#api-integration)

---

## Overview

The Token Risk Algorithm calculates a **risk score from 0-100** (higher = riskier) by analyzing **10 different risk factors**, each weighted based on importance.

### Risk Classification

```
Score 0-29:   🟢 LOW RISK
Score 30-49:  🟡 MEDIUM RISK
Score 50-74:  🟠 HIGH RISK
Score 75-100: 🔴 CRITICAL RISK
```

### Confidence Scoring

```
GoPlus Available:
  - PREMIUM: 96% confidence
  - FREE: 85% confidence

GoPlus Unavailable (Fallback):
  - PREMIUM: 78% confidence
  - FREE: 70% confidence
```

---

## How the Algorithm Works

### Step 1: Data Collection

**Primary Data Sources:**
1. **Mobula API** (Required)
   - Market cap, FDV, liquidity
   - Supply data, holders
   - Volume, transactions

2. **GoPlus Security API** (Optional)
   - Contract security flags
   - Ownership status
   - Tax/fee information

### Step 2: Calculate Individual Factors

Each of the 10 factors is scored from 0-100:

```typescript
const scores = {
  supplyDilution: 22,
  holderConcentration: 60,
  liquidityDepth: 33,
  vestingUnlock: 0,
  contractControl: 0,
  taxFee: 0,
  distribution: 0,
  burnDeflation: 80,
  adoption: 67,
  auditTransparency: 0
}
```

### Step 3: Apply Weights

```typescript
const WEIGHTS = {
  supplyDilution: 0.18,        // 18%
  holderConcentration: 0.16,   // 16%
  liquidityDepth: 0.14,        // 14%
  vestingUnlock: 0.13,         // 13%
  contractControl: 0.12,       // 12%
  taxFee: 0.10,                // 10%
  distribution: 0.09,          // 9%
  burnDeflation: 0.08,         // 8%
  adoption: 0.07,              // 7%
  auditTransparency: 0.03      // 3%
}
```

### Step 4: Calculate Final Score

```javascript
overallScore = 
  (22 × 0.18) +  // Supply Dilution
  (60 × 0.16) +  // Holder Concentration  
  (33 × 0.14) +  // Liquidity Depth
  (0  × 0.13) +  // Vesting Unlock
  (0  × 0.12) +  // Contract Control
  (0  × 0.10) +  // Tax & Fee
  (0  × 0.09) +  // Distribution
  (80 × 0.08) +  // Burn & Deflation
  (67 × 0.07) +  // Adoption
  (0  × 0.03)    // Audit

= 3.96 + 9.6 + 4.62 + 0 + 0 + 0 + 0 + 6.4 + 4.69 + 0
= 29.27 → Rounds to 29 (LOW RISK 🟢)
```

---

## The 10 Risk Factors

### 1. Supply Dilution (18% weight) 🔴 HIGHEST PRIORITY

**What it checks:** How many tokens are locked and could flood the market?

**Data Required:**
- Market Cap
- Fully Diluted Valuation (FDV)
- Circulating Supply
- Total Supply
- Max Supply (optional)

**Scoring Logic:**

```typescript
// FDV vs Market Cap ratio
marketCap / FDV < 2%  → +38 points (extreme dilution)
marketCap / FDV < 5%  → +32 points
marketCap / FDV < 10% → +27 points
marketCap / FDV < 15% → +22 points
marketCap / FDV < 25% → +17 points
marketCap / FDV < 35% → +12 points
marketCap / FDV < 50% → +7 points

// Circulating supply ratio
circ / total < 5%  → +32 points
circ / total < 10% → +26 points
circ / total < 20% → +21 points
circ / total < 30% → +16 points
circ / total < 40% → +11 points
circ / total < 50% → +6 points

// Unlimited supply
no max supply + no burns → +22 points
no max supply + some burns → +10 points
```

**Examples:**
- ✅ **Bitcoin**: 99% circulating → Score: ~5
- ❌ **New ICO**: 2% circulating, 98% locked → Score: ~70

---

### 2. Holder Concentration (16% weight)

**What it checks:** Are a few whales holding all the tokens?

**Data Required:**
- Total holder count
- Top 10 holders percentage

**Scoring Logic:**

```typescript
// Top 10 holders percentage
top10 > 80% → +50 points (extreme whale control)
top10 > 70% → +40 points
top10 > 60% → +35 points
top10 > 50% → +28 points
top10 > 40% → +20 points
top10 > 30% → +12 points
top10 > 20% → +5 points

// Total holder count
holders < 50    → +35 points (very centralized)
holders < 100   → +30 points
holders < 200   → +25 points
holders < 500   → +18 points
holders < 1,000 → +10 points
holders < 5,000 → +5 points
```

**Examples:**
- ✅ **SHIB**: 492k holders, top10 = 12% → Score: ~15
- ❌ **Scam token**: 20 holders, top10 = 95% → Score: ~95

**Missing Data Fallback:**
```typescript
if (!holderCount && !top10HoldersPct) {
  return 50  // Unknown = MODERATE risk
}
```

---

### 3. Liquidity Depth (14% weight)

**What it checks:** Is there enough liquidity to sell without crashing the price?

**Data Required:**
- Liquidity USD
- Market Cap
- LP locked status (GoPlus)

**Scoring Logic:**

```typescript
// Absolute liquidity
liquidity < $1,000   → +50 points
liquidity < $5,000   → +42 points
liquidity < $10,000  → +36 points
liquidity < $25,000  → +28 points
liquidity < $50,000  → +22 points
liquidity < $100,000 → +15 points
liquidity < $250,000 → +8 points
liquidity < $500,000 → +3 points

// Market Cap / Liquidity ratio
ratio > 500x → +38 points (tiny pool, price crash risk)
ratio > 300x → +32 points
ratio > 200x → +28 points
ratio > 100x → +22 points
ratio > 50x  → +15 points
ratio > 20x  → +8 points

// GoPlus data
LP not locked → +20 points (rug pull risk)
LP locked → -5 points (bonus)
```

**Examples:**
- ✅ **USDT**: $175M liquidity → Score: ~33
- ❌ **Scam**: $1k liquidity, $1M mcap → Score: ~58

**Missing Data Fallback:**
```typescript
if (!liquidityUSD || liquidityUSD === 0) {
  return 85  // No liquidity = HIGH RISK
}
```

---

### 4. Vesting Unlock (13% weight)

**What it checks:** Are team/investor tokens about to unlock and dump?

**Data Required:**
- Next 30-day unlock percentage (optional)
- Team vesting months (optional)
- Team allocation percentage (optional)

**Scoring Logic:**

```typescript
// Upcoming unlocks
unlock > 25% → +30 points (massive sell pressure)
unlock > 15% → +20 points
unlock > 10% → +15 points
unlock > 5%  → +10 points

// Team vesting period
0 months (all unlocked) + team > 10% → +40 points
< 12 months → +25 points
< 24 months → +15 points
> 24 months → Low risk
```

**Examples:**
- ✅ **Established token**: No upcoming unlocks → Score: 0
- ❌ **Fresh ICO**: 30% unlocking next week → Score: ~30

**Missing Data Fallback:**
```typescript
// Vesting data rarely available
if (!nextUnlock30dPct) {
  score += 0  // Don't penalize
}
```

---

### 5. Contract Control (12% weight) ⚡ MOST COMPLEX

**What it checks:** Can the owner steal your money or manipulate the token?

**Data Required (GoPlus):**
- `is_honeypot`
- `is_mintable`
- `owner_renounced` / `owner_address`
- Market Cap (for override)

**Scoring Logic:**

```typescript
// CRITICAL: Honeypot detection
if (is_honeypot) return 100  // You can buy but NOT SELL!

// SAFE: Large cap override (battle-tested)
if (marketCap > $50 billion) return 0
// Examples: USDT, USDC, ETH - upgradeable but trusted

// SAFE: Renounced ownership + non-mintable
if (owner_renounced && !is_mintable) return 0
// Examples: PEPE, SHIB - community owned

// RISKY: Can mint tokens with active owner
if (is_mintable && !owner_renounced) score += 60

// MODERATE: Active owner but can't mint
if (!owner_renounced && !is_mintable) score += 30
```

**Examples:**
- ✅ **USDT** ($183B): Upgradeable but trusted → 0
- ✅ **PEPE**: Owner renounced, can't mint → 0
- ⚠️ **New token**: Active owner, mintable → 60
- ❌ **Honeypot**: Can't sell → 100

**Missing Data Fallback (No GoPlus):**
```typescript
// Estimate from Mobula data
let score = 20  // Base uncertainty

if (top10HoldersPct > 0.8) score += 35  // Whale likely = owner
if (holderCount < 100) score += 25      // Centralized
if (ageDays < 7) score += 20            // New = risky

return Math.min(score, 100)
```

---

### 6. Tax & Fee (10% weight)

**What it checks:** Are there hidden sell taxes that trap you?

**Data Required (GoPlus):**
- `sell_tax`
- `buy_tax`
- `tax_modifiable`

**Scoring Logic:**

```typescript
// Sell tax (most important)
sell_tax > 30% → +60 points (lose 30%+ when selling!)
sell_tax > 20% → +40 points
sell_tax > 10% → +20 points

// Buy tax
buy_tax > 15% → +20 points

// Modifiable tax
tax_modifiable → +30 points (owner can change anytime)
```

**Examples:**
- ✅ **USDT/PEPE**: 0% tax → Score: 0
- ❌ **Honeypot clone**: 99% sell tax → Score: 90

**Missing Data Fallback (No GoPlus):**
```typescript
return 50  // NEUTRAL - literally impossible to know
```

---

### 7. Distribution (9% weight)

**What it checks:** How fairly are tokens distributed?

**Data Required:**
- Team allocation percentage (optional)
- Top 10 holders percentage

**Scoring Logic:**

```typescript
// Team allocation
team > 40% → +35 points (insiders hold too much)
team > 30% → +25 points
team > 20% → +15 points

// Top 10 holders (whale concentration)
top10 > 60% → +30 points
top10 > 50% → +20 points
```

**Examples:**
- ✅ **Community token**: 10% team, 90% public → Score: ~10
- ❌ **VC token**: 60% team/VCs → Score: ~60

---

### 8. Burn & Deflation (8% weight)

**What it checks:** Is the supply shrinking (deflationary) or growing?

**Data Required:**
- Total Supply
- Max Supply (optional)
- Burned Supply

**Scoring Logic:**

```typescript
// No supply data
if (!totalSupply) return 50

// No max supply + no burns
if (!maxSupply && !burnedSupply) return 80  // Unlimited inflation

// Burn percentage
burned > 50% → 10  (highly deflationary ✅)
burned > 20% → 30
burned > 5%  → 50
burned = 0%  → 60-80

// Capped supply with low burns
capped + burned < 5% → 40
capped + no burns → 60
```

**Examples:**
- ✅ **SHIB**: 41% burned → Score: 30
- ❌ **Inflationary**: No burns, unlimited → Score: 80

---

### 9. Adoption (7% weight)

**What it checks:** Is anyone actually using this token?

**Data Required:**
- 24h transaction count
- 24h volume
- Market Cap

**Scoring Logic:**

```typescript
// Transaction count
txCount = 0   → +45 points (dead token)
txCount < 5   → +38 points
txCount < 10  → +32 points
txCount < 25  → +26 points
txCount < 50  → +20 points
txCount < 100 → +14 points
txCount < 250 → +8 points
txCount < 500 → +3 points

// Volume / Market Cap ratio
volume/mcap > 50%  → Very active ✅
volume/mcap < 0.01% → Dead token ❌
```

**Examples:**
- ✅ **PEPE**: $1.7M volume, 492k holders → Score: 93
- ❌ **Dead token**: $100 volume → Score: 5

---

### 10. Audit & Transparency (3% weight) ⚠️ LOWEST PRIORITY

**What it checks:** Is the contract verified and audited?

**Data Required (GoPlus):**
- `is_open_source`
- Audit status (future integration)

**Scoring Logic:**

```typescript
let score = 20  // Base

if (is_open_source) score -= 10  // Good!

// Future: CertiK/Hacken audit integration
if (audited_by_certik) score -= 20
```

**Examples:**
- ✅ **Open source**: Score: 10
- ❌ **Closed source**: Score: 20

**Missing Data Fallback (No GoPlus):**
```typescript
return 50  // Unknown = neutral
```

---

## Missing Data Handling

### 3-Tier Fallback Strategy

The algorithm is designed to **ALWAYS work** even with incomplete data.

### Data Source Detection

```typescript
// Check if GoPlus loaded successfully
const hasGoPlus = data.is_honeypot !== undefined

if (hasGoPlus) {
  // Use actual security data
  confidence_score = 96% (PREMIUM) or 85% (FREE)
  data_sources = ['Mobula', 'GoPlus Security']
} else {
  // Use fallback estimations
  confidence_score = 78% (PREMIUM) or 70% (FREE)
  data_sources = ['Mobula (GoPlus fallback active)']
}
```

### Per-Factor Fallback Summary

| Factor | Primary Source | Missing Data Strategy | Fallback Score |
|--------|---------------|----------------------|----------------|
| Supply Dilution | Mobula | Use defaults, add 15pt penalty | 15 |
| Holder Concentration | Mobula | Return neutral | **50** |
| Liquidity Depth | Mobula | High risk warning | **85** |
| Vesting Unlock | Mobula | Assume safe (no unlocks) | **0** |
| Contract Control | GoPlus | Use holder/age heuristics | **20-100** |
| Tax & Fee | GoPlus | Neutral (unknown) | **50** |
| Distribution | Mobula | Skip team check, use top10 | Variable |
| Burn & Deflation | Mobula | Return neutral | **50** |
| Adoption | Mobula | Penalize inactivity | **45-65** |
| Audit | GoPlus | Neutral (unverified) | **50** |

### Fallback Philosophy

**DEFENSIVE** - Assume risky when critical data unknown:
```typescript
liquidityUSD missing → 85 (can't sell = dangerous!)
txCount24h = 0 → 45 (dead token!)
```

**PERMISSIVE** - Don't penalize rare fields:
```typescript
vestingSchedule missing → 0 (most tokens don't have vesting)
teamAllocation missing → 0 (data often unavailable)
```

**NEUTRAL** - Can't estimate without data:
```typescript
taxes without GoPlus → 50 (literally impossible to know)
audit without integration → 50 (unverified)
```

### Real Example: GoPlus Failure

**Token: WETH**

With GoPlus (Score: 22):
```json
{
  "contractControl": 0,
  "taxFee": 0,
  "auditTransparency": 0,
  "overall_risk_score": 22,
  "confidence_score": 96
}
```

Without GoPlus (Score: 42):
```json
{
  "contractControl": 55,
  "taxFee": 50,
  "auditTransparency": 50,
  "overall_risk_score": 42,
  "confidence_score": 78,
  "goplus_status": "fallback"
}
```

---

## Real Examples

### Example 1: USDT (Stablecoin)

**Input Data:**
```json
{
  "marketCap": 183000000000,
  "fdv": 183400000000,
  "liquidityUSD": 175000000,
  "holderCount": 0,
  "top10HoldersPct": 0.5,
  "is_mintable": true,
  "owner_renounced": false
}
```

**Factor Breakdown:**
```
Supply Dilution: 22      (99% circulating)
Holder Concentration: 60 (no holder data)
Liquidity Depth: 33      (good liquidity but high ratio)
Vesting Unlock: 0        (no data)
Contract Control: 0      (💡 $183B override!)
Tax Fee: 0               (0% tax)
Distribution: 0          (no team allocation data)
Burn Deflation: 80       (stablecoins don't burn)
Adoption: 67             (high volume)
Audit Transparency: 0    (open source)
```

**Weighted Calculation:**
```
(22×0.18) + (60×0.16) + (33×0.14) + (0×0.13) + (0×0.12) + 
(0×0.10) + (0×0.09) + (80×0.08) + (67×0.07) + (0×0.03)
= 3.96 + 9.6 + 4.62 + 0 + 0 + 0 + 0 + 6.4 + 4.69 + 0
= 29.27 → 29
```

**Result:**
```json
{
  "overall_risk_score": 29,
  "risk_level": "LOW",
  "confidence_score": 96
}
```

**Why LOW despite is_mintable=true?**
- Market cap > $50B triggers safety override
- Battle-tested for years
- Widely trusted stablecoin

---

### Example 2: PEPE (Meme Coin)

**Input Data:**
```json
{
  "marketCap": 2340000000,
  "fdv": 2340000000,
  "liquidityUSD": 18900000,
  "holderCount": 492693,
  "top10HoldersPct": 0.12,
  "is_mintable": false,
  "owner_renounced": true
}
```

**Factor Breakdown:**
```
Supply Dilution: 22      (100% circulating)
Holder Concentration: 0  (492k holders, low whale %)
Liquidity Depth: 17      (good liquidity)
Vesting Unlock: 0        (no vesting)
Contract Control: 0      (💡 Renounced + non-mintable!)
Tax Fee: 0               (0% tax)
Distribution: 0          (low top10)
Burn Deflation: 80       (no burns)
Adoption: 93             (very popular!)
Audit Transparency: 0    (open source)
```

**Weighted Calculation:**
```
= 29.18 → 29
```

**Result:**
```json
{
  "overall_risk_score": 29,
  "risk_level": "LOW",
  "confidence_score": 96
}
```

**Why LOW for a meme coin?**
- Owner renounced (can't rug pull)
- Not mintable (can't inflate supply)
- 492k holders (decentralized)
- No taxes, open source
- Established token (not new scam)

---

### Example 3: Scam Token (Hypothetical)

**Input Data:**
```json
{
  "marketCap": 1000000,
  "fdv": 50000000,
  "liquidityUSD": 5000,
  "holderCount": 25,
  "top10HoldersPct": 0.95,
  "is_honeypot": true,
  "is_mintable": true,
  "owner_renounced": false,
  "sell_tax": 0.99
}
```

**Factor Breakdown:**
```
Supply Dilution: 70      (2% circulating, 98% locked!)
Holder Concentration: 95 (25 holders, 95% owned by top10)
Liquidity Depth: 58      ($5k liquidity, 200x ratio)
Vesting Unlock: 0        
Contract Control: 100    (💀 HONEYPOT!)
Tax Fee: 90              (99% sell tax!)
Distribution: 65         (95% concentrated)
Burn Deflation: 80       (no burns)
Adoption: 45             (dead/low activity)
Audit Transparency: 50   (not verified)
```

**Weighted Calculation:**
```
= 78.9 → 79
```

**Result:**
```json
{
  "overall_risk_score": 79,
  "risk_level": "CRITICAL",
  "confidence_score": 96,
  "critical_flags": [
    "🚨 HONEYPOT DETECTED",
    "⚠️ 99% sell tax",
    "⚠️ Only 2% tokens circulating",
    "⚠️ 95% held by 10 wallets"
  ]
}
```

---

## API Integration

### GoPlus API Retry Logic

```typescript
export async function tryGoPlusWithFallback(
  tokenAddress: string,
  chainId: string,
  maxRetries: number = 2
): Promise<Partial<TokenData> | null> {
  
  // 1. Check cache (5 min TTL)
  const cached = GOPLUS_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data
  }
  
  // 2. Retry with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 3 second timeout
      const response = await fetch(goplusUrl, { 
        signal: AbortSignal.timeout(3000) 
      })
      
      // Handle rate limiting
      if (response.status === 429) {
        await sleep(1000 * Math.pow(2, attempt))
        continue
      }
      
      // Parse and cache
      const parsed = parseGoPlusData(json)
      GOPLUS_CACHE.set(cacheKey, { data: parsed, timestamp: Date.now() })
      return parsed
      
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await sleep(500 * Math.pow(2, attempt))
      }
    }
  }
  
  // 3. All attempts failed - return null (triggers fallback)
  console.warn('[GoPlus] All attempts failed - using fallback scoring')
  return null
}
```

### Owner Renounced Detection

```typescript
const isOwnerRenounced = 
  data.owner_address === '0x0000000000000000000000000000000000000000' || 
  data.owner_address === '' || 
  !data.owner_address
```

---

## Summary

### Algorithm Strengths

✅ **Multi-dimensional**: Analyzes 10 different risk vectors  
✅ **Weighted**: Most important factors have highest impact  
✅ **Data-driven**: Uses real on-chain + API data  
✅ **Context-aware**: Large caps get special treatment  
✅ **Resilient**: Works even with 50% missing data  
✅ **Transparent**: Shows breakdown of each factor  

### Current Limitations

⚠️ **No historical analysis**: Doesn't look at price history  
⚠️ **No social signals**: Doesn't check Twitter/Discord sentiment  
⚠️ **Audit data missing**: Would need CertiK/Hacken integration  
⚠️ **Age not a primary factor**: New vs old tokens weighted similarly  

### Future Enhancements

1. **Token Category Detection**: Auto-detect stablecoins, meme coins, blue chips
2. **Historical Data**: Factor in token age and price stability over time
3. **Audit Integration**: Pull from CertiK, Hacken APIs for verified audits
4. **Machine Learning**: Train model on known rug pulls vs legitimate projects
5. **Social Sentiment**: Factor in Twitter/Discord activity, developer commits

---

**Last Updated**: November 7, 2025  
**Algorithm Version**: 1.1  
**Confidence Range**: 70-96% (based on data availability)
