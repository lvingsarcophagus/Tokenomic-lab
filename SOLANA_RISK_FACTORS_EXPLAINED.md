# Solana Risk Factors - Complete Explanation

## Why Solana Shows Different Factor Names

For Solana tokens, we use blockchain-specific terminology that accurately reflects how Solana programs work, rather than using EVM (Ethereum) contract terminology.

---

## 🔐 PROGRAM SECURITY (0-100, lower is better)

**What it measures**: Authority control and program mutability

### Solana-Specific Checks:
1. **Freeze Authority**
   - Can the program freeze individual token accounts?
   - If YES → Higher risk score
   - If NO (null) → Lower risk score

2. **Mint Authority**
   - Can new tokens be minted after deployment?
   - If YES → Higher risk score
   - If NO (null) → Lower risk score

3. **Update Authority**
   - Can the program code be upgraded?
   - If YES → Higher risk score
   - If NO (immutable) → Lower risk score

4. **Owner/Admin Control**
   - Who controls these authorities?
   - If centralized → Higher risk
   - If renounced/burned → Lower risk

### Score Interpretation:
- **0-20**: ✅ **Excellent** - No dangerous authorities, immutable program
- **21-40**: ⚠️ **Good** - Some authorities exist but limited/multisig
- **41-60**: ⚠️ **Moderate** - Multiple authorities active
- **61-80**: 🚨 **High Risk** - Significant control retained
- **81-100**: 🚨 **Critical** - Full control by single entity

### Example: Jupiter (JUP)
- Freeze Authority: None (null) ✅
- Mint Authority: None (null) ✅
- Update Authority: Governance multisig ⚠️
- **Expected Score**: 10-15 (Low Risk)

---

## 📅 TOKEN UNLOCK SCHEDULE

**What it measures**: Upcoming token releases from vesting

### Solana-Specific:
- Checks SPL token vesting accounts
- Analyzes unlock schedules
- Calculates dilution impact

**Lower score** = Less upcoming dilution
**Higher score** = Large unlocks coming soon

---

## 💧 DEX LIQUIDITY

**What it measures**: Available trading liquidity

### Solana DEXs Checked:
- Raydium
- Orca
- Jupiter aggregated liquidity
- Serum (if applicable)

**Lower score** = Deep liquidity, locked LP tokens
**Higher score** = Shallow liquidity, unlocked LP

---

## ✅ VERIFICATION STATUS

**What it measures**: Program transparency and verification

### Checks:
- Is program verified on Solana Explorer?
- Is metadata validated?
- Is source code available?

**Lower score** = Verified, transparent
**Higher score** = Unverified, opaque

---

## 👥 HOLDER CONCENTRATION

**What it measures**: Token distribution across wallets

### Solana-Specific Considerations:
- Excludes known program accounts
- Excludes DEX liquidity pools
- Focuses on actual holder wallets

**Lower score** = Well distributed
**Higher score** = Concentrated in few wallets

---

## 📊 SUPPLY DILUTION

**What it measures**: Circulating vs total supply ratio

### Formula:
```
Score = (1 - Circulating/Total) × 100
```

**Lower score** = Most tokens circulating
**Higher score** = Large locked supply

---

## 💸 TAX/FEE STRUCTURE

**What it measures**: Transfer fees and taxes

### Solana-Specific:
- Checks for transfer hooks (Token-2022)
- Analyzes fee structures
- Detects hidden taxes

**Lower score** = No fees
**Higher score** = High transfer fees

---

## 🎯 DISTRIBUTION

**What it measures**: Initial allocation fairness

### Checks:
- Was there a fair launch?
- How much went to team/insiders?
- Was there a public sale?

**Lower score** = Fair distribution
**Higher score** = Insider-heavy allocation

---

## 🔥 BURN/DEFLATION

**What it measures**: Token burn mechanisms

### Solana-Specific:
- Checks for burn instructions
- Analyzes deflationary mechanics
- Tracks burned supply

**Lower score** = Active burning
**Higher score** = No burn mechanism

---

## 📈 ADOPTION

**What it measures**: Real usage and activity

### Metrics:
- Daily active users
- Transaction volume
- Unique traders
- Social metrics

**Lower score** = High adoption
**Higher score** = Low/no usage

---

## Common Questions

### Q: Why is Program Security showing 0/100?
**A**: This is GOOD! A score of 0 means:
- No freeze authority ✅
- No mint authority ✅
- Immutable program ✅
- Fully decentralized ✅

### Q: Why does it say "PROGRAM" instead of "CONTRACT"?
**A**: Solana uses "programs" not "smart contracts". We use accurate terminology for each blockchain.

### Q: What's a good overall risk score for Solana tokens?
**A**: 
- **0-30**: Low risk (like Jupiter, Raydium)
- **31-60**: Medium risk (newer projects)
- **61-80**: High risk (be cautious)
- **81-100**: Critical risk (avoid)

### Q: How is this different from EVM chains?
**A**: 
- Solana has different authority models
- No proxy patterns like Ethereum
- Different liquidity mechanisms
- Token-2022 introduces new features

---

## Visual Guide

```
PROGRAM SECURITY: 0/100
█░░░░░░░░░░░░░░░░░░░░ (0% = Perfect!)

Meaning:
✅ No freeze authority
✅ No mint authority  
✅ Immutable program
✅ Decentralized control
```

```
PROGRAM SECURITY: 75/100
█████████████████░░░░ (75% = Risky!)

Meaning:
🚨 Freeze authority active
🚨 Mint authority active
🚨 Mutable program
🚨 Centralized control
```

---

**Last Updated**: 2025-11-22
**Applies To**: Solana tokens on Tokenomics Lab Premium Dashboard
