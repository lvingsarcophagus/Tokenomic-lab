# POPCAT Risk Score & Logo Issues - Debug Guide

## Issues Identified

### 1. Risk Score: 82 (Seems High)

**Observed Factors**:
- Supply Dilution: 30/100 ✅ (Good)
- Holder Concentration: 30/100 ✅ (Good)
- DEX Liquidity: 8/100 ✅ (Excellent)
- Token Unlock: 0/100 ✅ (Perfect)
- Program Security: All ✅ (Perfect)
- Tax/Fee: 0% ✅ (Perfect)
- Distribution: 8/100 ✅ (Excellent)
- Burn/Deflation: 70/100 ⚠️ (Concerning)
- Adoption: 45/100 ⚠️ (Moderate)
- Verification: 80/100 ⚠️ (Needs improvement)

**Expected Risk Score**: ~25-35 (LOW RISK)
**Actual Risk Score**: 82 (HIGH RISK)

**Possible Causes**:

1. **Meme Token Baseline (+15)**
   - POPCAT is a meme token
   - Automatic +15 risk penalty applied
   - This is correct behavior

2. **Burn/Deflation Score (70)**
   - High score = No burn mechanism
   - Weighted at 8%
   - Contributes: 70 × 0.08 = 5.6 points

3. **Adoption Score (45)**
   - Moderate adoption
   - Weighted at 7%
   - Contributes: 45 × 0.07 = 3.15 points

4. **Verification Score (80)**
   - Not fully verified
   - Weighted at 3%
   - Contributes: 80 × 0.03 = 2.4 points

**Manual Calculation**:
```
Base Score = 
  (30 × 0.18) + // Supply Dilution
  (30 × 0.16) + // Holder Concentration
  (8 × 0.14) +  // Liquidity
  (0 × 0.13) +  // Vesting
  (0 × 0.12) +  // Contract Control
  (0 × 0.10) +  // Tax
  (8 × 0.09) +  // Distribution
  (70 × 0.08) + // Burn
  (45 × 0.07) + // Adoption
  (80 × 0.03)   // Audit

= 5.4 + 4.8 + 1.12 + 0 + 0 + 0 + 0.72 + 5.6 + 3.15 + 2.4
= 23.19

+ 15 (Meme Baseline)
= 38.19

Expected: ~38 (MEDIUM RISK)
Actual: 82 (HIGH RISK)
```

**Conclusion**: There's a bug in the risk calculation! The score should be ~38, not 82.

---

### 2. Logo Not Loading

**Issue**: Token logo not displaying

**Possible Causes**:

1. **Logo URL Missing**
   - `data.priceData?.logo` is undefined
   - API not returning logo URL

2. **CORS Issue**
   - Logo URL blocked by CORS policy
   - External image host blocking requests

3. **Invalid URL**
   - Logo URL is malformed
   - 404 error on image

4. **Mobula API Issue**
   - Mobula not returning logo for POPCAT
   - Need to check API response

**Debug Steps**:

1. Check console for logo URL:
```javascript
console.log('[Dashboard] Logo URL:', data.priceData?.logo)
```

2. Check if Mobula returns logo:
```bash
curl "https://api.mobula.io/api/1/market/data?asset=POPCAT"
```

3. Check browser network tab:
   - Look for image request
   - Check for CORS errors
   - Check for 404 errors

**Fallback Implemented**:
- If logo fails to load, show first letter of symbol
- Graceful degradation

---

## Fixes Applied

### 1. Enhanced Logo Handling

**Before**:
```typescript
{selectedToken.rawData?.priceData?.logo ? (
  <img src={logo} onError={() => hide()} />
) : (
  <span>{symbol[0]}</span>
)}
```

**After**:
```typescript
<div className="logo-container">
  {logo ? (
    <img 
      src={logo} 
      onError={(e) => {
        // Properly handle error
        e.currentTarget.style.display = 'none'
        const fallback = document.createElement('span')
        fallback.textContent = symbol[0]
        parent.appendChild(fallback)
      }}
    />
  ) : (
    <span>{symbol[0]}</span>
  )}
</div>
```

**Benefits**:
- Better error handling
- Proper fallback rendering
- No broken image icons

### 2. Debug Logging Added

```typescript
console.log('[Dashboard] Risk Analysis:', {
  symbol: data.priceData?.symbol,
  overallRisk: riskScore,
  breakdown,
  isMeme: result.is_meme_token,
  classification: result.ai_insights?.classification,
  logo: data.priceData?.logo
})
```

**What to Check**:
1. Is `overallRisk` correct?
2. Does `breakdown` match displayed values?
3. Is `isMeme` true for POPCAT?
4. Is `logo` URL present?

---

## Investigation Needed

### Risk Calculation Bug

**Location**: `lib/risk-calculator.ts` or `/api/analyze-token/route.ts`

**Suspected Issues**:

1. **Double Application of Meme Baseline**
   - Baseline applied twice
   - 15 + 15 = 30 extra points

2. **Incorrect Weight Calculation**
   - Weights not summing to 100%
   - Scores being multiplied incorrectly

3. **Critical Flag Override**
   - Some critical flag forcing score to 80+
   - Check for "dead token" or "honeypot" flags

4. **Official Token Bonus Not Applied**
   - POPCAT might be official token
   - -45 bonus not being applied

**Next Steps**:

1. Check API response:
```bash
curl -X POST http://localhost:3000/api/analyze-token \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress":"POPCAT_ADDRESS","chainId":"1399811149"}'
```

2. Check risk calculator logs:
```javascript
// In risk-calculator.ts
console.log('Risk Calculation:', {
  baseScore,
  memeBaseline,
  criticalFlags,
  finalScore
})
```

3. Verify breakdown values:
```javascript
// Check if breakdown matches displayed values
console.log('Breakdown:', breakdown)
```

---

## Temporary Workarounds

### For Users

1. **Logo Issue**:
   - First letter fallback works
   - Logo will show if URL is valid

2. **Risk Score Issue**:
   - Look at individual factors
   - Ignore overall score if suspicious
   - Trust the detailed breakdown

### For Developers

1. **Force Recalculation**:
```typescript
// Manually calculate from breakdown
const manualScore = Object.entries(breakdown)
  .reduce((sum, [key, value]) => sum + (value * weights[key]), 0)
```

2. **Override Display**:
```typescript
// Show calculated score instead of API score
const displayScore = calculateManualScore(breakdown)
```

---

## Testing Checklist

### Logo
- [ ] Check console for logo URL
- [ ] Verify Mobula API returns logo
- [ ] Test with different tokens
- [ ] Check CORS headers
- [ ] Verify fallback works

### Risk Score
- [ ] Check console for risk calculation
- [ ] Verify breakdown values
- [ ] Check for critical flags
- [ ] Verify meme token detection
- [ ] Test with other Solana tokens
- [ ] Compare with Jupiter (known good)

---

## Expected Behavior

### POPCAT (Correct)
```
Risk Score: 35-40 (MEDIUM RISK)
Reason: Meme token with good fundamentals
- Low holder concentration ✅
- Good liquidity ✅
- No dangerous authorities ✅
- No taxes ✅
- Meme baseline +15 ⚠️
- No burn mechanism ⚠️
```

### Logo
```
1. Try to load from Mobula API
2. If fails, show first letter
3. No broken image icons
4. Smooth fallback
```

---

**Status**: 🔍 Investigation in progress
**Priority**: High (affects user trust)
**Impact**: Risk scores may be incorrect for all tokens
**Date**: 2025-11-22
