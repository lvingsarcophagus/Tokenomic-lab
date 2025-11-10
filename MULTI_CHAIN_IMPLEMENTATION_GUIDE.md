# Multi-Chain Security System - Implementation Guide

## 📋 Overview

This document explains how to use the new multi-chain security system in Token Guard Pro.

---

## 🔧 Setup Requirements

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Gemini AI (Optional - for AI explanations)
GEMINI_API_KEY=your_gemini_api_key_here

# Helius API (Optional - for Solana analysis)
HELIUS_API_KEY=your_helius_api_key_here

# Blockfrost API (Optional - for Cardano analysis)
BLOCKFROST_API_KEY=your_blockfrost_api_key_here

# GoPlus API (Required - for EVM chains)
# No API key needed - public API
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

The `@google/generative-ai` package is now installed automatically.

---

## 🎨 Using the Chain Selector

### Import the Component

```typescript
import ChainSelector, { Chain, SUPPORTED_CHAINS } from '@/components/chain-selector';
```

### Add to Your Page

```tsx
const [selectedChain, setSelectedChain] = useState<Chain | null>(SUPPORTED_CHAINS[0]);

<ChainSelector 
  selectedChain={selectedChain}
  onChainSelect={(chain) => setSelectedChain(chain)}
/>
```

### Available Chains

```typescript
const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', type: 'EVM', icon: '⚡', color: 'bg-blue-500' },
  { id: 56, name: 'BNB Chain', type: 'EVM', icon: '🟡', color: 'bg-yellow-500' },
  { id: 137, name: 'Polygon', type: 'EVM', icon: '🟣', color: 'bg-purple-500' },
  { id: 43114, name: 'Avalanche', type: 'EVM', icon: '🔺', color: 'bg-red-500' },
  { id: 250, name: 'Fantom', type: 'EVM', icon: '👻', color: 'bg-blue-400' },
  { id: 42161, name: 'Arbitrum', type: 'EVM', icon: '🔵', color: 'bg-blue-600' },
  { id: 10, name: 'Optimism', type: 'EVM', icon: '🔴', color: 'bg-red-600' },
  { id: 8453, name: 'Base', type: 'EVM', icon: '🔷', color: 'bg-blue-700' },
  { id: 501, name: 'Solana', type: 'SOLANA', icon: '☀️', color: 'bg-purple-600' },
  { id: 1815, name: 'Cardano', type: 'CARDANO', icon: '🔷', color: 'bg-blue-800' },
];
```

---

## 🔍 Running Security Checks

### For EVM Chains

```typescript
import { checkEVMSecurity, ChainType } from '@/lib/security/chain-adapters';

const securityChecks = await checkEVMSecurity(
  '0x...tokenAddress',
  1 // chainId (1 = Ethereum)
);

// Returns array of SecurityCheck objects
console.log(securityChecks);
// [
//   {
//     name: 'Honeypot Detected',
//     severity: 'CRITICAL',
//     message: '🚨 HONEYPOT - You cannot sell this token',
//     score: 95
//   },
//   ...
// ]
```

### For Solana

```typescript
import { checkSolanaSecurity } from '@/lib/security/chain-adapters';

const securityChecks = await checkSolanaSecurity('TokenMintAddress...');
```

### For Cardano

```typescript
import { checkCardanoSecurity } from '@/lib/security/chain-adapters';

const securityChecks = await checkCardanoSecurity('policyId.assetName');
```

---

## ⚖️ Smart Risk Weighting

### Get Chain-Specific Weights

```typescript
import { getChainWeights, ChainType } from '@/lib/security/smart-weighting';

const weights = getChainWeights(ChainType.SOLANA);
console.log(weights);
// {
//   contract_security: 0.35,  // Highest on Solana
//   supply_risk: 0.15,
//   concentration_risk: 0.12,
//   liquidity_risk: 0.18,
//   market_activity: 0.10,
//   deflation_mechanics: 0.05,
//   token_age: 0.05
// }
```

### Calculate Weighted Score

```typescript
import { calculateWeightedRiskScore } from '@/lib/security/smart-weighting';

const factorScores = {
  contract_security: 85,
  supply_risk: 40,
  concentration_risk: 30,
  liquidity_risk: 25,
  market_activity: 20,
  deflation_mechanics: 10,
  token_age: 15
};

const finalScore = calculateWeightedRiskScore(factorScores, ChainType.SOLANA);
console.log(finalScore); // e.g., 52
```

---

## 🤖 Gemini AI Explanations

### Generate AI Explanation

```typescript
import { generateAIExplanation } from '@/lib/security/gemini-explainer';
import { ChainType } from '@/lib/security/chain-adapters';

const explanation = await generateAIExplanation(
  'TRUMP', // tokenName
  'Ethereum', // chainName
  ChainType.EVM,
  65, // riskScore
  'HIGH', // riskLevel
  securityChecks // array of SecurityCheck objects
);

console.log(explanation);
// "This Ethereum token has 15% sell tax which will reduce..."
```

### Fallback Mode

If Gemini API key is not set, the system automatically uses a fallback explanation generator.

---

## 🚩 Flag Override Logic

### Apply Smart Override

```typescript
import { applySmartFlagOverride } from '@/lib/security/flag-override';

const result = applySmartFlagOverride(
  45, // calculatedScore
  securityChecks // array of SecurityCheck objects
);

console.log(result);
// {
//   finalScore: 60,
//   overrideReason: '1 critical flag detected - added 15 point penalty',
//   overrideApplied: true
// }
```

### Override Rules

| Critical Flags | Action | Example |
|----------------|--------|---------|
| 0 | Use calculated score | 45 → 45 |
| 1 | Add +15 penalty | 45 → 60 |
| 2 | Minimum score 65 | 45 → 65 |
| 3+ | Minimum score 75 | 45 → 75 |

---

## 🔄 Complete Analysis Example

### Full Implementation

```typescript
import { 
  checkEVMSecurity, 
  detectChainType,
  type SecurityCheck 
} from '@/lib/security/chain-adapters';
import { calculateWeightedRiskScore, getChainWeights } from '@/lib/security/smart-weighting';
import { applySmartFlagOverride } from '@/lib/security/flag-override';
import { generateAIExplanation } from '@/lib/security/gemini-explainer';

async function analyzeToken(tokenAddress: string, chainId: number) {
  // 1. Detect chain type
  const chainConfig = detectChainType(chainId);
  console.log(`Analyzing on ${chainConfig.name} (${chainConfig.type})`);
  
  // 2. Run chain-specific security checks
  let securityChecks: SecurityCheck[] = [];
  
  if (chainConfig.type === 'EVM') {
    securityChecks = await checkEVMSecurity(tokenAddress, chainId);
  } else if (chainConfig.type === 'SOLANA') {
    securityChecks = await checkSolanaSecurity(tokenAddress);
  } else if (chainConfig.type === 'CARDANO') {
    securityChecks = await checkCardanoSecurity(tokenAddress);
  }
  
  console.log(`Found ${securityChecks.length} security issues`);
  
  // 3. Calculate security score from checks
  const securityScore = securityChecks.reduce((sum, check) => sum + check.score, 0);
  
  // 4. Calculate other factor scores (your existing functions)
  const factorScores = {
    contract_security: Math.min(securityScore, 100),
    supply_risk: 40, // from your existing calculations
    concentration_risk: 30,
    liquidity_risk: 25,
    market_activity: 20,
    deflation_mechanics: 10,
    token_age: 15
  };
  
  // 5. Calculate weighted score using chain-specific weights
  const calculatedScore = calculateWeightedRiskScore(factorScores, chainConfig.type);
  console.log(`Calculated score: ${calculatedScore}`);
  
  // 6. Apply smart flag override
  const { finalScore, overrideReason, overrideApplied } = applySmartFlagOverride(
    calculatedScore,
    securityChecks
  );
  
  if (overrideApplied) {
    console.log(`Override applied: ${overrideReason}`);
  }
  
  // 7. Determine risk level
  const riskLevel = 
    finalScore >= 75 ? 'CRITICAL' :
    finalScore >= 50 ? 'HIGH' :
    finalScore >= 30 ? 'MEDIUM' : 'LOW';
  
  // 8. Generate AI explanation
  const aiExplanation = await generateAIExplanation(
    'TOKEN_NAME',
    chainConfig.name,
    chainConfig.type,
    finalScore,
    riskLevel,
    securityChecks
  );
  
  // 9. Return complete analysis
  return {
    overall_risk_score: finalScore,
    risk_level: riskLevel,
    chain_type: chainConfig.type,
    chain_name: chainConfig.name,
    calculated_score: calculatedScore,
    override_applied: overrideApplied,
    override_reason: overrideReason,
    factor_scores: factorScores,
    weights_used: getChainWeights(chainConfig.type),
    security_checks: securityChecks,
    ai_explanation: aiExplanation,
    analyzed_at: new Date().toISOString()
  };
}

// Usage
const analysis = await analyzeToken('0x...', 1);
console.log(JSON.stringify(analysis, null, 2));
```

---

## 📊 Response Format

### Complete Analysis Object

```typescript
{
  "overall_risk_score": 60,
  "risk_level": "HIGH",
  "chain_type": "EVM",
  "chain_name": "Ethereum",
  "calculated_score": 45,
  "override_applied": true,
  "override_reason": "1 critical flag detected - added 15 point penalty",
  "factor_scores": {
    "contract_security": 85,
    "supply_risk": 40,
    "concentration_risk": 30,
    "liquidity_risk": 25,
    "market_activity": 20,
    "deflation_mechanics": 10,
    "token_age": 15
  },
  "weights_used": {
    "contract_security": 0.25,
    "supply_risk": 0.20,
    "concentration_risk": 0.10,
    "liquidity_risk": 0.18,
    "market_activity": 0.12,
    "deflation_mechanics": 0.08,
    "token_age": 0.07
  },
  "security_checks": [
    {
      "name": "High Sell Tax",
      "severity": "WARNING",
      "message": "⚠️ 15% sell tax",
      "score": 40
    }
  ],
  "ai_explanation": "This Ethereum token has a 15% sell tax...",
  "analyzed_at": "2025-11-10T19:30:00.000Z"
}
```

---

## 🧪 Testing

### Test Chain Detection

```typescript
import { detectChainType, ChainType } from '@/lib/security/chain-adapters';

console.log(detectChainType(1));    // { type: 'EVM', name: 'Ethereum' }
console.log(detectChainType(501));  // { type: 'SOLANA', name: 'Solana' }
console.log(detectChainType(1815)); // { type: 'CARDANO', name: 'Cardano' }
```

### Test Weight Differences

```typescript
import { getChainWeights, ChainType } from '@/lib/security/smart-weighting';

const evmWeights = getChainWeights(ChainType.EVM);
const solanaWeights = getChainWeights(ChainType.SOLANA);
const cardanoWeights = getChainWeights(ChainType.CARDANO);

console.log('EVM security weight:', evmWeights.contract_security);      // 0.25
console.log('Solana security weight:', solanaWeights.contract_security); // 0.35
console.log('Cardano security weight:', cardanoWeights.contract_security); // 0.20
```

### Test Flag Override

```typescript
import { applySmartFlagOverride } from '@/lib/security/flag-override';

const checks = [
  { name: 'Test', severity: 'CRITICAL', message: 'Test', score: 50 }
];

// 1 critical flag
const result1 = applySmartFlagOverride(40, checks);
console.log(result1.finalScore); // 55 (40 + 15)

// 2 critical flags
const result2 = applySmartFlagOverride(40, [...checks, ...checks]);
console.log(result2.finalScore); // 65 (minimum for 2 flags)

// 3 critical flags
const result3 = applySmartFlagOverride(40, [...checks, ...checks, ...checks]);
console.log(result3.finalScore); // 75 (minimum for 3+ flags)
```

---

## 🎯 Best Practices

### 1. Always Detect Chain Type First

```typescript
const chainConfig = detectChainType(chainId);
// Now you know if it's EVM, Solana, or Cardano
```

### 2. Handle Missing API Keys Gracefully

```typescript
try {
  const checks = await checkSolanaSecurity(address);
} catch (error) {
  console.log('Solana checks unavailable - no Helius API key');
  // Fall back to basic analysis
}
```

### 3. Cache Results When Possible

```typescript
// Security checks can be expensive
const cacheKey = `security:${chainId}:${tokenAddress}`;
const cached = await getCached(cacheKey);
if (cached) return cached;

const checks = await checkEVMSecurity(tokenAddress, chainId);
await setCached(cacheKey, checks, 600); // 10 minute cache
```

### 4. Show Chain Context to Users

```typescript
<div className="chain-badge">
  <span>{selectedChain.icon}</span>
  <span>{selectedChain.name}</span>
  <span className="text-xs">({selectedChain.type})</span>
</div>
```

### 5. Explain Why Scores Differ By Chain

```typescript
import { getWeightingRationale } from '@/lib/security/smart-weighting';

const rationale = getWeightingRationale(chainConfig.type);
// "Solana prioritizes contract security (35%) due to unique risks..."
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@google/generative-ai'"
**Solution**: Run `pnpm install` or `npm install`

### Issue: "Gemini AI error"
**Solution**: Check your `GEMINI_API_KEY` in `.env.local`. System will use fallback explanations if key is missing.

### Issue: "No holder data from GoPlus"
**Solution**: GoPlus may not have data for very new tokens. This is expected behavior.

### Issue: "Solana checks return empty array"
**Solution**: Ensure `HELIUS_API_KEY` is set in `.env.local`. Get a free key at helius.dev

### Issue: "Different risk scores on same token"
**Solution**: This is expected! Different chains use different weights. A token might be 40/100 on Ethereum but 55/100 on Solana due to Solana's higher security weighting.

---

## 📚 Additional Resources

- [GoPlus API Docs](https://docs.gopluslabs.io/)
- [Helius API Docs](https://docs.helius.dev/)
- [Blockfrost API Docs](https://docs.blockfrost.io/)
- [Gemini AI Docs](https://ai.google.dev/docs)

---

## 🎉 Summary

You now have a complete multi-chain security system that:

✅ Supports 10 different blockchains  
✅ Runs chain-specific security checks  
✅ Uses intelligent risk weighting  
✅ Generates AI-powered explanations  
✅ Has fixed flag override logic  

Happy building! 🚀
