# Multi-Chain Enhanced Risk Algorithm - Implementation Guide

## 🎯 Overview

This document explains the **Multi-Chain Enhanced Risk Algorithm** - an advanced token risk scoring system that extends the base 7-factor algorithm with:

- **Multi-chain security analysis** (EVM/Solana/Cardano)
- **Behavioral tokenomics** (holder velocity, liquidity stability, wash trading detection)
- **Smart money tracking** (VC wallets, wallet age analysis)
- **Context-aware scoring** (dynamic thresholds based on token age, market cap, chain type)

## 📁 File Structure

```
lib/risk-algorithms/
├── enhanced-risk-calculator.ts         # Base 7-factor algorithm
└── multi-chain-enhanced-calculator.ts  # Extended multi-chain version
```

## 🔧 API Keys Required

Add these to your `.env.local`:

```bash
# Core APIs (already in use)
MOBULA_API_KEY=4de7b44b-ea3c-4357-930f-dc78b054ae0b
GOPLUS_API_KEY=7B8WUm1VeeeD4F8g67CH

# New APIs for enhanced features
MORALIS_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImVjNGNlOTJhLTU1MDAtNDIxMy1hNzdmLWJlZTExN2JkYjlkMSIsIm9yZ0lkIjoiNDgwMjU0IiwidXNlcklkIjoiNDk0MDc3IiwidHlwZUlkIjoiN2U4NGNlODYtZGY2My00NmZiLWFmZmMtMjc0OTg3NTgyMzcxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjI2MzI3NzEsImV4cCI6NDkxODM5Mjc3MX0.bB42XjZ9c9_DutyOQHK5L04IKkFflkZV0OaMtvDsEz8
HELIUS_API_KEY=33b8214f-6f46-4927-bd29-e54801f23c20
BLOCKFROST_PROJECT_ID=mainnetP1Z9MusaDSQDwWQgNMAgiT9COe2mrY0n

# Optional (for additional data)
COINMARKETCAP_API_KEY=eab5df04ea5d4179a092d72d1634b52d
COINGECKO_API_KEY=CG-bni69NAc1Ykpye5mqA9qd7JM
```

## 🚀 Features

### 1. Multi-Chain Security Analysis

#### **EVM Chains** (Ethereum, BSC, Polygon, etc.)
- Uses **GoPlus API** for security checks
- Detects: Honeypots, mint functions, ownership, taxes
- Supports: Chain IDs 1, 56, 137, 43114, 250, 42161, 10, 8453

#### **Solana** (Chain ID 501)
- Uses **Helius API** for authority checks
- Detects:
  - **Freeze Authority** (can lock wallets) - **CRITICAL**
  - **Mint Authority** (can create unlimited supply)
  - **Program Authority** (contract upgradeable)
- Score adjustments based on token age

#### **Cardano** (Chain ID 1815)
- Uses **Blockfrost API** for policy analysis
- Checks:
  - **Policy Time-Lock** (minting expiry date)
  - **Policy Status** (expired = permanent supply cap)
  - **Script Complexity** (multi-sig, conditional logic)

### 2. Behavioral Tokenomics Analysis

#### **Holder Velocity** 📊
Tracks holder count changes over time to detect:
- **Panic selling** (30%+ holders exit in 7 days)
- **Gradual decline** (negative growth over 30 days)
- **Bot farming** (100%+ growth in 7 days with <1000 holders)

```typescript
holderHistory: {
  current: 5000,
  day7Ago: 4500,   // 11% growth in 7 days ✅
  day30Ago: 3000   // 67% growth in 30 days ✅
}
```

#### **Liquidity Stability** 💧
Monitors liquidity changes to detect rug pulls:
- **Major removal** (>30% drop in 7 days) - **RUG WARNING**
- **Moderate removal** (15-30% drop)
- **Pump setup** (>200% spike on tokens <30 days old)
- **Stable liquidity** (±10% = positive signal)

```typescript
liquidityHistory: {
  current: 150000,
  day7Ago: 140000   // 7% increase ✅
}
```

#### **Wash Trading Detection** 🔄
Analyzes transaction patterns to find manipulation:
- **Circular trading** (50+ txs but <20 unique wallets)
- **Extreme imbalance** (buyer/seller ratio >5 or <0.2)
- **Volume mismatch** (volume too high for participant count)

```typescript
uniqueBuyers24h: 120,
uniqueSellers24h: 80,    // Balanced ratio ✅
buyTransactions24h: 230,
sellTransactions24h: 150
```

#### **Smart Money Detection** 💎
Tracks wallet quality and institutional backing:
- **VC holders** (known venture capital wallets)
- **Wallet age** (average holder wallet age)
- **Deployer age** (wallet age before token launch)

```typescript
knownVCHolders: ['0x123...', '0x456...'],  // 2 VCs ✅
averageHolderWalletAge: 450,  // Established wallets ✅
deployerWalletAge: 730        // Deployer = 2 years old ✅
```

### 3. Context-Aware Threshold Adjustments

#### **Token Age Context**
- **<7 days old**: Reduce concentration/activity penalties by 30-40%
- **>365 days old**: Increase inactivity penalties by 30%

#### **Market Cap Context**
- **<$1M**: Don't penalize <500 holders (normal for small cap)
- **$1M-$10M**: Expect 500-5,000 holders
- **>$10M**: Heavily penalize <1,000 holders (suspicious)

#### **Liquidity-MarketCap Relationship**
- **Small caps**: 3-10% liquidity ratio is acceptable
- **Large caps**: Require 2%+ liquidity ratio

## 📊 Usage Example

### Basic Usage (EVM Chain)

```typescript
import { calculateMultiChainTokenRisk, MultiChainTokenData } from '@/lib/risk-algorithms/multi-chain-enhanced-calculator';

const tokenData: MultiChainTokenData = {
  // Base data
  tokenAddress: '0x1f9840...',
  chainId: 1, // Ethereum
  marketCap: 5000000,
  liquidityUSD: 500000,
  holderCount: 384188,
  ageDays: 1200,
  
  // GoPlus security data
  hasGoPlusData: true,
  is_honeypot: false,
  is_mintable: false,
  owner_renounced: true,
  buy_tax: 0,
  sell_tax: 0,
  
  // ... other Mobula data
};

const result = calculateMultiChainTokenRisk(tokenData);

console.log(result.overall_risk_score);  // 35
console.log(result.risk_level);          // "MEDIUM"
console.log(result.critical_flags);      // []
console.log(result.positive_signals);    // ["✅ Ownership renounced", ...]
```

### Advanced Usage (Solana with Behavioral Data)

```typescript
const solanaTokenData: MultiChainTokenData = {
  tokenAddress: 'So11111...',
  chainId: 501, // Solana
  marketCap: 2000000,
  liquidityUSD: 200000,
  holderCount: 5000,
  ageDays: 45,
  
  // Solana-specific security
  solanaData: {
    freezeAuthority: null,     // ✅ Revoked
    mintAuthority: null,       // ✅ Revoked
    programAuthority: null     // ✅ Not upgradeable
  },
  
  // Behavioral metrics from Moralis
  holderHistory: {
    current: 5000,
    day7Ago: 4500,
    day30Ago: 3000
  },
  
  liquidityHistory: {
    current: 200000,
    day7Ago: 195000
  },
  
  // Transaction patterns
  uniqueBuyers24h: 120,
  uniqueSellers24h: 80,
  buyTransactions24h: 230,
  sellTransactions24h: 150,
  
  // Smart money indicators
  knownVCHolders: ['wallet1...', 'wallet2...'],
  averageHolderWalletAge: 450,
  deployerWalletAge: 90,
  
  hasGoPlusData: false
};

const result = calculateMultiChainTokenRisk(solanaTokenData);

// Result includes:
// - Chain-specific security analysis (Solana authorities)
// - Holder velocity signals (67% growth over 30 days)
// - Liquidity stability (2.5% increase in 7 days)
// - No wash trading detected
// - VC backing detected (risk reduction)
```

## 🔌 API Integration Guide

### 1. Moralis API (Behavioral Data)

**Endpoint**: `https://deep-index.moralis.io/api/v2.2/{address}/stats`

```typescript
const headers = {
  'X-API-Key': process.env.MORALIS_API_KEY
};

const response = await fetch(
  `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/stats?chain=eth`,
  { headers }
);

const data = await response.json();

// Extract holder history
holderHistory: {
  current: data.holders_count,
  day7Ago: data.holders_count_7d,
  day30Ago: data.holders_count_30d
}
```

### 2. Helius API (Solana Security)

**Endpoint**: `https://api.helius.xyz/v0/token-metadata`

```typescript
const response = await fetch(
  `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mintAccounts: [tokenAddress] })
  }
);

const [tokenMeta] = await response.json();

solanaData: {
  freezeAuthority: tokenMeta.freezeAuthority,
  mintAuthority: tokenMeta.mintAuthority,
  programAuthority: tokenMeta.updateAuthority
}
```

### 3. Blockfrost API (Cardano Policy)

**Endpoint**: `https://cardano-mainnet.blockfrost.io/api/v0/assets/{asset}`

```typescript
const headers = {
  'project_id': process.env.BLOCKFROST_PROJECT_ID
};

const response = await fetch(
  `https://cardano-mainnet.blockfrost.io/api/v0/assets/${assetId}`,
  { headers }
);

const data = await response.json();

cardanoData: {
  policyLocked: data.mint_or_burn_count === 1,
  policyExpired: data.mint_or_burn_count === 0,
  policyScript: data.policy_id
}
```

## 🎨 Risk Score Interpretation

| Score | Level | Description | Typical Flags |
|-------|-------|-------------|---------------|
| **0-30** | LOW | Safe investment | ✅ Ownership renounced<br>✅ No mint function<br>✅ Stable liquidity |
| **30-50** | MEDIUM | Moderate risk | ⚠️ Some centralization<br>⚠️ Moderate taxes |
| **50-75** | HIGH | Significant risk | ⚠️ High concentration<br>⚠️ Liquidity concerns |
| **75-100** | CRITICAL | Extreme risk | 🚨 Honeypot<br>🚨 <50 holders<br>🚨 30%+ holders exited |

## 🔄 Migration from Base Algorithm

### Option 1: Replace Entirely

```typescript
// Before
import { calculateTokenRisk } from '@/lib/risk-algorithms/enhanced-risk-calculator';

// After
import { calculateMultiChainTokenRisk } from '@/lib/risk-algorithms/multi-chain-enhanced-calculator';

const result = calculateMultiChainTokenRisk(tokenData);
```

### Option 2: Conditional Usage (Premium Feature)

```typescript
import { calculateTokenRisk } from '@/lib/risk-algorithms/enhanced-risk-calculator';
import { calculateMultiChainTokenRisk } from '@/lib/risk-algorithms/multi-chain-enhanced-calculator';

const USE_MULTICHAIN = plan === 'PREMIUM' && (solanaData || cardanoData || behavioralData);

const result = USE_MULTICHAIN 
  ? calculateMultiChainTokenRisk(tokenData)
  : calculateTokenRisk(tokenData);
```

## 📈 Performance Considerations

### API Call Limits

| Service | Rate Limit | Cost |
|---------|-----------|------|
| Mobula | 500/min | Free tier |
| GoPlus | 100/min | Free tier |
| Moralis | 40/sec | Free: 40 req/sec |
| Helius | 10/sec | Free: 10 req/sec |
| Blockfrost | 10/sec | Free: 50,000/day |

### Caching Strategy

```typescript
// Cache behavioral data for 5 minutes
const BEHAVIORAL_CACHE_TTL = 5 * 60 * 1000;

// Cache security data for 30 minutes
const SECURITY_CACHE_TTL = 30 * 60 * 1000;

// Refresh holder history daily
const HOLDER_HISTORY_TTL = 24 * 60 * 60 * 1000;
```

## 🐛 Troubleshooting

### Issue: "Solana data unavailable"
- **Cause**: Helius API key not configured or token not found
- **Solution**: Verify `HELIUS_API_KEY` in `.env.local` and check token address format

### Issue: "Holder history undefined"
- **Cause**: Moralis API not returning historical data
- **Solution**: Ensure token is indexed by Moralis (may take 24h for new tokens)

### Issue: "Context adjustments too aggressive"
- **Cause**: Token age or market cap thresholds don't match your use case
- **Solution**: Modify thresholds in `applyContextualAdjustments()` function

## 📝 Next Steps

1. **Test Current Fix**: Run token scan to verify holder_count is now extracted correctly
2. **Add Moralis Integration**: Implement holder history and liquidity history fetching
3. **Enable Multi-Chain**: Add Solana/Cardano token support
4. **Premium Feature**: Gate advanced analysis behind PREMIUM plan

## 🎯 Test Token Addresses

Use these to test different chain types:

```typescript
// EVM (Ethereum)
const UNI = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';

// Solana
const SOL_WRAPPED = 'So11111111111111111111111111111111111111112';

// Cardano
const ADA_ASSET = 'lovelace'; // Native token
```

---

**Last Updated**: November 8, 2025  
**Status**: ✅ Code complete, ready for integration testing
