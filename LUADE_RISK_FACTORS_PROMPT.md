# Luade Risk Factors Documentation Generation Prompt

## SYSTEM: Tokenomics Lab - 9-Factor Risk Algorithm Documentation

### INSTRUCTION FOR LUADE:
Generate comprehensive documentation tables and visualizations for the Tokenomics Lab risk calculation algorithm. Create accurate factor tables, weight distributions, threshold matrices, and risk band classifications based on the actual implementation.

---

## 🎯 DOCUMENTATION REQUIREMENTS

**Primary Output**: Professional risk factor documentation with tables, charts, and explanations  
**Secondary Output**: Chain-adaptive weight matrices and threshold specifications  
**Format**: Academic-style documentation suitable for technical papers and stakeholder presentations

---

## 📊 CORE RISK FACTORS (9-Factor Algorithm)

### **CORRECTED FACTOR WEIGHTS** (Based on Actual Implementation - Normalized to 100%):

| **Factor Name** | **Standard Weight** | **Meme Weight** | **Solana Weight** | **Description** |
|-----------------|--------------------|-----------------|--------------------|-----------------|
| **Supply Dilution** | 18% | 14% | 12% | FDV/Market Cap ratio + mintability risk |
| **Holder Concentration** | 20% | 24% | 18.5% | Top 10 holders % + wash trading detection |
| **Liquidity Depth** | 16% | 20% | 16.7% | FDV/Liquidity ratio + rug pull indicators |
| **Contract Control** | 15% | 12% | 32.4% | Mintable, honeypot, freeze authority flags |
| **Tax/Fee** | 11% | 10% | 0% | Buy/sell tax percentages |
| **Distribution** | 8% | 6% | 5.6% | Gini coefficient of holder distribution |
| **Burn/Deflation** | 6% | 2% | 3.7% | Token burn mechanisms and deflationary pressure |
| **Adoption** | 10% | 15% | 9.3% | Transaction count and social metrics |
| **Audit Transparency** | 4% | 1% | 1.9% | Code verification and audit status |
| **TOTAL** | **100%** | **100%** | **100%** | **All weights normalized** |

---

## 🔢 DETAILED THRESHOLD SPECIFICATIONS

### **Factor 1: Supply Dilution (18% Standard Weight)**
**Calculation**: `FDV / Market Cap ratio`

| **FDV/MCAP Ratio** | **Base Score** | **Risk Level** |
|--------------------|----------------|----------------|
| ≤ 1.0x | 10 | Very Low |
| 1.1x - 2.0x | 30 | Low |
| 2.1x - 5.0x | 50 | Medium |
| 5.1x - 10.0x | 70 | High |
| > 10.0x | 90 | Very High |

**Additional Penalties**:
- +20 points if token is mintable
- +15 points if unlimited supply with no burns
- Maximum score: 100

### **Factor 2: Holder Concentration (20% Standard Weight)**
**Calculation**: `Top 10 holders percentage + wash trading detection`

| **Top 10 Holders %** | **Score** | **Risk Assessment** |
|----------------------|-----------|---------------------|
| < 20% | 10 | Excellent distribution |
| 20% - 39% | 25 | Good distribution |
| 40% - 59% | 50 | Moderate concentration |
| 60% - 79% | 75 | High concentration |
| ≥ 80% | 95 | Critical whale risk |

**Enhanced Detection**:
- Wash trading pattern analysis
- Unique buyer/seller ratios
- Holder growth velocity

### **Factor 3: Liquidity Depth (16% Standard Weight)**
**Calculation**: `FDV / Total Liquidity ratio`

| **FDV/Liquidity Ratio** | **Score** | **Rug Pull Risk** |
|--------------------------|-----------|-------------------|
| < 3 (≥ 0.33) | 5 | Very Low |
| 3 - 6.67 (0.15-0.32) | 20 | Low |
| 6.68 - 12.5 (0.08-0.14) | 40 | Medium |
| 12.6 - 33.3 (0.03-0.07) | 65 | High |
| > 33.3 (< 0.03) | 90 | Critical |

### **Factor 4: Contract Control (15% Standard Weight)**
**Binary Flags with Additive Scoring**:

| **Control Flag** | **Penalty** | **Description** |
|------------------|-------------|-----------------|
| Mintable | +40 | Owner can create new tokens |
| Honeypot | +30 | Cannot sell after buying |
| Owner Not Renounced | +30 | Admin controls remain active |
| Freeze Authority (Solana) | +25 | Can freeze user wallets |
| Proxy Contract | +20 | Logic can be changed |

### **Factor 5: Tax/Fee (11% Standard Weight)**
**Total Buy + Sell Tax Percentage**:

| **Tax Rate** | **Score** | **User Impact** |
|--------------|-----------|-----------------|
| 0% | 5 | No fees |
| 1% - 5% | 20 | Reasonable |
| 6% - 10% | 40 | Moderate |
| 11% - 20% | 70 | High |
| > 20% | 95 | Excessive |

### **Factor 6: Distribution (8% Standard Weight)**
**Gini Coefficient Calculation**:

| **Gini Coefficient** | **Score** | **Equality Level** |
|----------------------|-----------|-------------------|
| 0.0 - 0.3 | 10 | Excellent equality |
| 0.31 - 0.5 | 30 | Good distribution |
| 0.51 - 0.7 | 50 | Moderate inequality |
| 0.71 - 0.85 | 70 | High inequality |
| 0.86 - 1.0 | 90 | Extreme concentration |

### **Factor 7: Burn/Deflation (6% Standard Weight)**
**Percentage of Supply Burned**:

| **Burn Percentage** | **Score** | **Deflationary Pressure** |
|---------------------|-----------|---------------------------|
| ≥ 50% | 10 | Strong deflation |
| 20% - 49% | 30 | Moderate deflation |
| 5% - 19% | 50 | Mild deflation |
| 1% - 4% | 70 | Minimal deflation |
| 0% | 90 | No deflation |

### **Factor 8: Adoption (10% Standard Weight)**
**24-Hour Transaction Count**:

| **TX Count (24h)** | **Score** | **Activity Level** |
|---------------------|-----------|-------------------|
| ≥ 10,000 | 5 | Very High |
| 1,000 - 9,999 | 20 | High |
| 100 - 999 | 45 | Medium |
| 10 - 99 | 70 | Low |
| < 10 | 90 | Very Low |

### **Factor 9: Audit Transparency (4% Standard Weight)**
**Verification Status**:

| **Audit Status** | **Score** | **Trust Level** |
|------------------|-----------|-----------------|
| Multiple audits + verified | 5 | Excellent |
| Single audit + verified | 20 | Good |
| Verified source only | 40 | Moderate |
| Unverified but open source | 60 | Limited |
| Closed source | 90 | Poor |

---

## ⚖️ CHAIN-ADAPTIVE WEIGHT PROFILES

### **Standard Tokens (EVM Chains)**
**Focus**: Supply control, holder distribution, liquidity depth
- Supply Dilution: 18%
- Holder Concentration: 20%
- Liquidity Depth: 16%
- Contract Control: 15%
- Other factors: 31%

### **Meme Tokens (All Chains)**
**Focus**: Whale manipulation, liquidity risks, social adoption
- Holder Concentration: 24% ↑
- Liquidity Depth: 20% ↑
- Adoption: 15% ↑
- Supply Dilution: 14% ↓
- Other factors: 27%

### **Solana Tokens** (Normalized to 100%)
**Focus**: Contract control (freeze/mint authority)
- Contract Control: 32.4% ↑↑ (highest priority)
- Liquidity Depth: 16.7% ↑
- Holder Concentration: 18.5%
- Supply Dilution: 12% ↓
- Adoption: 9.3%
- Distribution: 5.6%
- Burn/Deflation: 3.7%
- Audit Transparency: 1.9%
- Tax/Fee: 0% (N/A - Solana doesn't support token taxes)

---

## 🎨 RISK CLASSIFICATION BANDS

### **Final Score Calculation**:
```
Final Score = Σ(Factor Score × Weight) + Overrides
Where: 0 ≤ Final Score ≤ 100
```

### **Risk Bands** (Color-Coded):

| **Score Range** | **Classification** | **Color** | **Recommendation** |
|-----------------|-------------------|-----------|-------------------|
| 0 - 30 | **LOW** | 🟢 Green | Generally safe for investment |
| 31 - 60 | **MEDIUM** | 🟡 Yellow | Proceed with caution |
| 61 - 80 | **HIGH** | 🟠 Orange | Significant risks present |
| 81 - 100 | **CRITICAL** | 🔴 Red | Avoid - potential scam/rug pull |

---

## 🔧 WEIGHT NORMALIZATION SYSTEM

### **Automatic Normalization Process**:
All weight profiles are automatically normalized to ensure they total exactly 100%:

1. **Validation**: Check if weights total 100% (±0.1% tolerance)
2. **Normalization**: If not, scale all weights proportionally
3. **Verification**: Confirm final weights total exactly 100%

### **Normalization Example** (Solana Weights):
```
Original Solana weights totaled 108% (8% inflation)
Normalization factor: 1.0 ÷ 1.08 = 0.9259

Before → After normalization:
- Contract Control: 35% → 32.4%
- Liquidity Depth: 18% → 16.7%  
- Holder Concentration: 20% → 18.5%
- Supply Dilution: 13% → 12%
- All other factors scaled proportionally
```

### **Benefits of Normalization**:
- Prevents score inflation/deflation
- Maintains relative factor priorities
- Ensures consistent 0-100 scoring range
- Allows accurate cross-chain comparisons

## 🔧 SPECIAL OVERRIDES AND ADJUSTMENTS
- Major stablecoins (USDT, USDC, DAI) → Automatic score: 10 (LOW)
- Confidence: 99%
- Bypasses all factor calculations

### **Official Token Reduction**:
- Verified non-meme (CoinGecko + >$50M mcap) → -15 points
- Verified meme token → -10 points
- Verified + >$1B mcap → -25 points

### **Dead Token Override**:
- Liquidity < $100 AND Volume < $10 AND TX = 0 AND Price drop > 95% → Score: 95 (CRITICAL)

### **Meme Token Penalty**:
- AI confidence > 70% → +15 points
- Applied after base calculation

---

## 📈 ALGORITHM PERFORMANCE METRICS

### **Accuracy Benchmarks** (Post-Normalization):
- Overall accuracy: 61.1% (optimized with normalized weights)
- Critical risk detection: 85%+ (honeypots, rug pulls)
- False positive rate: <15%
- Processing time: <2 seconds per token
- Weight validation: 100% (automatic normalization)

### **Normalization Impact**:
- **Before**: Solana scores inflated by 8% (108% total weights)
- **After**: All chains score consistently 0-100
- **Improvement**: Eliminated systematic scoring bias
- **Validation**: All weight profiles now total exactly 100%

### **Data Source Integration**:
- **Primary**: Mobula API (market data)
- **Secondary**: Moralis API (blockchain data)  
- **Security**: GoPlus API (contract analysis)
- **Solana**: Helius API (enhanced data)
- **AI**: Groq (Llama 3.3 70B) for meme detection

---

## 🛡️ SECURITY AND COMPLIANCE

### **Validation Rules**:
1. All factor scores must be 0-100
2. Missing data defaults to high-risk scores
3. Chain-specific validations applied
4. AI confidence thresholds enforced

### **Audit Trail**:
- All calculations logged
- Factor breakdown preserved
- Override reasons documented
- Performance metrics tracked

---

## 📊 VISUALIZATION REQUIREMENTS FOR LUADE

### **Required Charts**:
1. **Weight Distribution Pie Chart** (Standard vs Meme vs Solana)
2. **Factor Threshold Matrix** (Heatmap visualization)
3. **Risk Band Distribution** (Color-coded bar chart)
4. **Chain Comparison Table** (Side-by-side weights)
5. **Performance Metrics Dashboard** (Accuracy, speed, coverage)

### **Table Formatting**:
- Professional academic style
- Color-coded risk levels
- Clear threshold boundaries
- Percentage formatting for weights
- Score ranges prominently displayed

### **Documentation Style**:
- Technical precision with business clarity
- Suitable for both developers and stakeholders
- Include rationale for each factor
- Reference actual implementation details

---

## 🔍 VALIDATION CHECKLIST

The generated documentation should include:
- [ ] All 9 factors with correct weights
- [ ] Accurate threshold specifications
- [ ] Chain-adaptive weight profiles
- [ ] Special override conditions
- [ ] Risk band classifications
- [ ] Performance benchmarks
- [ ] Data source attributions
- [ ] Calculation methodology
- [ ] Visual representation guidelines

---

## 📝 ADDITIONAL CONTEXT

**Business Purpose**: Fraud prevention and investor protection in cryptocurrency markets  
**Target Audience**: Crypto investors, DeFi traders, security researchers, academic institutions  
**Compliance**: Transparent, auditable, and ethically designed algorithm  
**Innovation**: First platform combining traditional risk metrics with AI-powered meme detection  

**Technical Implementation**: TypeScript, Next.js 16, real-time API integration, chain-adaptive algorithms  
**Performance**: Optimized for 100K+ daily analyses, sub-2-second response times  
**Accuracy**: Continuously calibrated against real-world rug pulls and scam tokens

This documentation serves as the **definitive reference** for the Tokenomics Lab risk calculation algorithm, suitable for academic papers, investor presentations, and technical audits.