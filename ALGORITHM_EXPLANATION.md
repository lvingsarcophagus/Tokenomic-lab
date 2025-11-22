# Risk Algorithm Explanation - How It Works

## 🎯 Overview

The Tokenomics Lab risk algorithm is a **10-factor scoring system** that analyzes cryptocurrency tokens across multiple dimensions to produce a **0-100 risk score**. Lower scores = safer tokens, higher scores = riskier tokens.

## 📊 The 10 Risk Factors

### 1. **Supply Dilution** (0-100)
**What it measures**: How much the token supply can increase

**Calculation**:
```typescript
FDV (Fully Diluted Valuation) / Market Cap = Dilution Ratio

If ratio > 5x: Score = 100 (CRITICAL)
If ratio > 3x: Score = 75 (HIGH)
If ratio > 2x: Score = 50 (MEDIUM)
If ratio < 2x: Score = 25 (LOW)
```

**Why it matters**: High dilution means more tokens will enter circulation, potentially crashing the price.

**Example**: 
- Market Cap: $100M
- FDV: $500M
- Ratio: 5x → Score: 100 (CRITICAL)

---

### 2. **Holder Concentration** (0-100)
**What it measures**: How much of the supply is held by top wallets

**Calculation**:
```typescript
Top 10 holders own X% of supply

If X > 80%: Score = 100 (CRITICAL - whale control)
If X > 60%: Score = 75 (HIGH)
If X > 40%: Score = 50 (MEDIUM)
If X < 20%: Score = 10 (LOW - decentralized)
```

**Why it matters**: High concentration = whales can dump and crash price.

**Example**:
- Top 10 holders: 85% of supply
- Score: 100 (CRITICAL)

---

### 3. **Liquidity Depth** (0-100)
**What it measures**: How easy it is to buy/sell without affecting price

**Calculation**:
```typescript
Market Cap / Liquidity = MC/Liq Ratio

If ratio > 1000x: Score = 100 (CRITICAL - can't sell)
If ratio > 500x: Score = 75 (HIGH)
If ratio > 100x: Score = 50 (MEDIUM)
If ratio < 50x: Score = 20 (LOW - good liquidity)
```

**Why it matters**: Low liquidity = you can't sell without crashing the price.

**Example**:
- Market Cap: $10M
- Liquidity: $10K
- Ratio: 1000x → Score: 100 (CRITICAL)

---

### 4. **Vesting Unlock** (0-100)
**What it measures**: Upcoming token unlocks from team/investors

**Calculation**:
```typescript
If large unlock in next 30 days: Score = 80
If large unlock in next 90 days: Score = 50
If no unlocks: Score = 0
```

**Why it matters**: Token unlocks = selling pressure = price drop.

---

### 5. **Contract Control** (0-100) / **Program Control** (Solana)
**What it measures**: Who controls the smart contract

**Calculation (EVM)**:
```typescript
If ownership NOT renounced: Score = 80 (owner can rug)
If proxy contract: Score = 60 (can be upgraded)
If ownership renounced: Score = 0 (safe)
```

**Calculation (Solana)**:
```typescript
If mint authority active: Score = 80 (can mint more)
If freeze authority active: Score = 60 (can freeze)
If both revoked: Score = 0 (safe)
```

**Why it matters**: Active control = owner can rug pull or manipulate.

---

### 6. **Tax/Fee** (0-100) - **EVM Only**
**What it measures**: Buy/sell taxes and honeypot detection

**Calculation**:
```typescript
If buy tax > 10% OR sell tax > 10%: Score = 100 (honeypot)
If buy tax > 5%: Score = 60
If sell tax > 5%: Score = 60
If no tax: Score = 0
```

**Why it matters**: High taxes = you lose money on every trade. Honeypots = you can't sell at all.

**Note**: Hidden for Solana (fixed ~0.000005 SOL fee)

---

### 7. **Distribution** (0-100)
**What it measures**: How evenly tokens are distributed

**Calculation**:
```typescript
Gini coefficient of holder distribution

If Gini > 0.9: Score = 100 (extremely concentrated)
If Gini > 0.7: Score = 60
If Gini < 0.5: Score = 20 (well distributed)
```

**Why it matters**: Poor distribution = few people control everything.

---

### 8. **Burn/Deflation** (0-100)
**What it measures**: Token burn mechanisms

**Calculation**:
```typescript
Burned % of total supply

If burned > 50%: Score = 10 (deflationary)
If burned > 20%: Score = 30
If burned < 5%: Score = 60
If no burns: Score = 80
```

**Why it matters**: Burns reduce supply = potentially bullish. But fake burns exist.

---

### 9. **Adoption** (0-100)
**What it measures**: Real-world usage and activity

**Calculation**:
```typescript
Score based on:
- Transaction count (24h)
- Unique traders
- Social media presence
- Exchange listings

High activity: Score = 20
Medium activity: Score = 50
Low activity: Score = 80 (ghost token)
```

**Why it matters**: No adoption = no real value = likely to fail.

---

### 10. **Audit/Transparency** (0-100)
**What it measures**: Security audits and code verification

**Calculation**:
```typescript
If audited by top firm: Score = 10
If contract verified: Score = 30
If no audit + unverified: Score = 80
```

**Why it matters**: Audits catch bugs and scams before they happen.

---

## 🧮 Final Score Calculation

### Step 1: Calculate Individual Scores
Each of the 10 factors gets a score from 0-100.

### Step 2: Apply Weights
Different factors have different importance:

```typescript
WEIGHTS = {
  supplyDilution: 0.12,      // 12%
  holderConcentration: 0.15, // 15% (most important)
  liquidityDepth: 0.13,      // 13%
  vestingUnlock: 0.08,       // 8%
  contractControl: 0.12,     // 12%
  taxFee: 0.10,              // 10%
  distribution: 0.10,        // 10%
  burnDeflation: 0.05,       // 5%
  adoption: 0.10,            // 10%
  auditTransparency: 0.05    // 5%
}
```

### Step 3: Calculate Weighted Average
```typescript
finalScore = (factor1 * weight1) + (factor2 * weight2) + ... + (factor10 * weight10)
```

### Step 4: Apply Modifiers

#### AI Classification Modifier
```typescript
if (AI detects MEME_TOKEN) {
  finalScore += 15 // Meme tokens are inherently riskier
}
```

#### Official Token Override
```typescript
if (token is on CoinGecko with >$50M market cap) {
  finalScore = Math.max(0, finalScore - 45) // Reduce risk significantly
}
```

#### Dead Token Override
```typescript
if (liquidity < $500 OR volume24h < $100 OR txCount24h === 0) {
  finalScore = 90 // Force CRITICAL risk
}
```

#### Critical Flags Penalty
```typescript
if (criticalFlags >= 3) {
  finalScore = Math.max(finalScore, 75) // Minimum HIGH risk
} else if (criticalFlags >= 1) {
  finalScore += 15 // Add penalty
}
```

### Step 5: Classify Risk Level
```typescript
if (finalScore < 30) return 'LOW'       // Green
if (finalScore < 60) return 'MEDIUM'    // Yellow
if (finalScore < 80) return 'HIGH'      // Orange
return 'CRITICAL'                       // Red
```

---

## 🔄 Chain-Adaptive Weights

The algorithm adjusts weights based on blockchain:

### Ethereum/EVM Chains
```typescript
WEIGHTS = {
  holderConcentration: 0.15, // Most important
  liquidityDepth: 0.13,
  supplyDilution: 0.12,
  contractControl: 0.12,
  taxFee: 0.10,              // Important for EVM
  distribution: 0.10,
  adoption: 0.10,
  vestingUnlock: 0.08,
  auditTransparency: 0.05,
  burnDeflation: 0.05
}
```

### Solana
```typescript
WEIGHTS = {
  holderConcentration: 0.18, // More important (no tax to check)
  liquidityDepth: 0.15,
  supplyDilution: 0.13,
  contractControl: 0.13,     // Program authority
  distribution: 0.12,
  adoption: 0.12,
  vestingUnlock: 0.08,
  auditTransparency: 0.05,
  burnDeflation: 0.04,
  taxFee: 0.00               // Not applicable (fixed fees)
}
```

---

## 📈 Real Example: Jupiter (JUP)

### Input Data
```
Market Cap: $812M
Liquidity: $817K
Holders: 248
Top 10%: 35%
Transactions 24h: 95
Age: 180 days
Chain: Solana
Official Token: Yes (CoinGecko rank #115)
```

### Factor Scores
```
1. Supply Dilution: 50 (FDV 2.18x MC)
2. Holder Concentration: 35 (35% in top 10)
3. Liquidity Depth: 43 (MC/Liq = 992x)
4. Vesting Unlock: 0 (no unlocks)
5. Program Control: 0 (authorities revoked)
6. Tax/Fee: N/A (Solana)
7. Distribution: 0 (well distributed)
8. Burn/Deflation: 10 (some burns)
9. Adoption: 20 (high activity)
10. Audit/Transparency: 30 (verified)
```

### Calculation
```
Raw Score = (50*0.13) + (35*0.18) + (43*0.15) + ... = 32.14

Modifiers:
- AI Classification: UTILITY (no penalty)
- Official Token: -45 points → 0 (can't go negative)
- Dead Token: Skip (official token)
- Critical Flags: 0

Final Score: 0 → LOW RISK ✓
```

---

## 🎨 UI Display Logic

### Risk Factors Shown
```typescript
// Universal (always shown)
- Supply Dilution
- Holder Concentration
- Liquidity Depth
- Distribution
- Burn/Deflation
- Adoption

// Chain-specific
EVM: Contract Control, Tax/Fee, Vesting, Audit
Solana: Program Control, Vesting, Audit (no Tax/Fee)
```

### Why Only 2 Factors Showed (Bug)
**Problem**: Filter logic was too restrictive
```typescript
// OLD (WRONG)
if (isEVM) {
  return ['contractControl', 'taxFee', ...].includes(key)
}
// This returned false for universal factors!
```

**Fixed**:
```typescript
// NEW (CORRECT)
// Always show universal factors
if (universalFactors.includes(key)) return true

// Always show these for all chains
if (['vestingUnlock', 'auditTransparency', 'contractControl'].includes(key)) return true

// Only hide taxFee for Solana
if (isSolana && key === 'taxFee') return false

return true // Show everything else
```

---

## 🔍 Data Sources

### Market Data
- **Mobula API**: Price, market cap, liquidity, volume
- **CoinGecko**: Fallback for price history
- **CoinMarketCap**: Token search and verification

### Blockchain Data
- **EVM**: GoPlus (security), Moralis (transactions)
- **Solana**: Helius (holders, transactions, authorities)
- **Cardano**: Blockfrost (metadata)

### AI Analysis
- **Groq (Llama 3.3 70B)**: Primary AI for classification
- **Google Gemini**: Fallback AI

---

## 🎯 Key Takeaways

1. **10 factors** analyzed, each scored 0-100
2. **Weighted average** produces final score
3. **Chain-adaptive** - different weights per blockchain
4. **AI-enhanced** - meme token detection
5. **Override system** - official tokens, dead tokens
6. **Critical flags** - additional penalties for severe issues
7. **0-30 = LOW**, 31-60 = MEDIUM, 61-80 = HIGH, 81-100 = CRITICAL

The algorithm is designed to be **transparent**, **comprehensive**, and **adaptive** to different blockchain ecosystems! 🚀
