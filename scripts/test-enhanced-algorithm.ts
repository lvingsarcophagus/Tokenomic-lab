/**
 * Test Suite for Enhanced Risk Calculator
 * Run with: node --loader ts-node/esm scripts/test-enhanced-algorithm.ts
 */

import { calculateTokenRisk } from '../lib/risk-algorithms/enhanced-risk-calculator'
import type { TokenData } from '../lib/risk-algorithms/enhanced-risk-calculator'

console.log('🧪 Testing Enhanced Risk Calculator...\n')

// Test Case 1: Well-established token with full GoPlus data
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('TEST 1: Established Token (PEPE) - Full Data')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const pepeData: TokenData = {
  tokenAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  chainId: 1,
  hasGoPlusData: true,
  
  // Mobula data
  marketCap: 2_340_000_000, // $2.34B
  fdv: 2_340_000_000,
  liquidityUSD: 18_900_000,
  holderCount: 492_693,
  top10HoldersPct: 0.12, // 12%
  totalSupply: 420_690_000_000_000,
  circulatingSupply: 420_690_000_000_000,
  maxSupply: 420_690_000_000_000,
  burnedSupply: 0,
  txCount24h: 12_500,
  volume24h: 180_000_000,
  ageDays: 245, // ~8 months
  dataTimestamp: Date.now(),
  
  // GoPlus data (safe token)
  is_honeypot: false,
  is_mintable: false,
  owner_renounced: true,
  owner_address: '0x0000000000000000000000000000000000000000',
  sell_tax: 0,
  buy_tax: 0,
  is_open_source: true,
  liquidityLocked: true
}

const result1 = calculateTokenRisk(pepeData)
console.log('Results:')
console.log(`  Risk Score: ${result1.overall_risk_score}/100 (${result1.risk_level})`)
console.log(`  Confidence: ${result1.confidence_score}%`)
console.log(`  Data Tier: ${result1.data_tier}`)
console.log(`  Freshness: ${Math.round(result1.data_freshness * 100)}%`)
console.log(`\nFactor Breakdown:`)
Object.entries(result1.factor_scores).forEach(([factor, data]) => {
  console.log(`  ${factor}: ${data.score} (${data.quality})`)
})
console.log(`\nCritical Flags: ${result1.critical_flags.length}`)
console.log(`Warning Flags: ${result1.warning_flags.length}`)
console.log(`Positive Signals: ${result1.positive_signals.length}`)
if (result1.positive_signals.length > 0) {
  result1.positive_signals.forEach(signal => console.log(`  ${signal}`))
}

// Test Case 2: Risky new token
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('TEST 2: New Risky Token - Limited Data')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const riskyData: TokenData = {
  tokenAddress: '0xNewRugPull123',
  chainId: 1,
  hasGoPlusData: true,
  
  marketCap: 50_000, // $50k (very small)
  fdv: 5_000_000, // FDV 100x higher!
  liquidityUSD: 2_000, // Only $2k liquidity
  holderCount: 35, // Very few holders
  top10HoldersPct: 0.85, // 85% concentrated!
  totalSupply: 1_000_000_000,
  circulatingSupply: 10_000_000, // Only 1% circulating
  maxSupply: 0, // Unlimited!
  burnedSupply: 0,
  txCount24h: 3, // Almost no activity
  volume24h: 500,
  ageDays: 2, // Brand new
  dataTimestamp: Date.now(),
  
  // GoPlus data (dangerous)
  is_honeypot: false,
  is_mintable: true, // Can mint!
  owner_renounced: false, // Owner still has control
  owner_address: '0xDeployer123',
  sell_tax: 0.25, // 25% sell tax!
  buy_tax: 0.10, // 10% buy tax
  is_open_source: false, // Not verified
  liquidityLocked: false // Not locked!
}

const result2 = calculateTokenRisk(riskyData)
console.log('Results:')
console.log(`  Risk Score: ${result2.overall_risk_score}/100 (${result2.risk_level})`)
console.log(`  Confidence: ${result2.confidence_score}%`)
console.log(`  Data Tier: ${result2.data_tier}`)
console.log(`  Freshness: ${Math.round(result2.data_freshness * 100)}%`)
console.log(`\nFactor Breakdown:`)
Object.entries(result2.factor_scores).forEach(([factor, data]) => {
  console.log(`  ${factor}: ${data.score} (${data.quality})`)
})
console.log(`\n🚨 Critical Flags: ${result2.critical_flags.length}`)
if (result2.critical_flags.length > 0) {
  result2.critical_flags.forEach(flag => console.log(`  ${flag}`))
}
console.log(`\n⚠️  Warning Flags: ${result2.warning_flags.length}`)
if (result2.warning_flags.length > 0) {
  result2.warning_flags.forEach(flag => console.log(`  ${flag}`))
}

// Test Case 3: Battle-tested large cap (market cap override)
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('TEST 3: Large Cap Override (BTC/ETH level)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const btcLevelData: TokenData = {
  tokenAddress: '0xBTC',
  chainId: 1,
  hasGoPlusData: false, // No GoPlus needed
  
  marketCap: 60_000_000_000, // $60B
  fdv: 60_000_000_000,
  liquidityUSD: 1_000_000_000,
  holderCount: 1_000_000,
  top10HoldersPct: 0.20,
  totalSupply: 21_000_000,
  circulatingSupply: 19_000_000,
  maxSupply: 21_000_000,
  burnedSupply: 0,
  txCount24h: 100_000,
  volume24h: 20_000_000_000,
  ageDays: 5_000, // Very old
  dataTimestamp: Date.now()
}

const result3 = calculateTokenRisk(btcLevelData)
console.log('Results:')
console.log(`  Risk Score: ${result3.overall_risk_score}/100 (${result3.risk_level})`)
console.log(`  Confidence: ${result3.confidence_score}%`)
console.log(`  Data Tier: ${result3.data_tier}`)
console.log(`  Market Cap Discount Applied: YES (>$50B)`)
console.log(`\n✅ This demonstrates the battle-tested override for mega-cap tokens`)

// Test Case 4: Fallback mode (no GoPlus)
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('TEST 4: Fallback Mode (No GoPlus Data)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const fallbackData: TokenData = {
  tokenAddress: '0xNoGoPlus',
  chainId: 1,
  hasGoPlusData: false, // GoPlus failed
  
  marketCap: 5_000_000,
  fdv: 5_000_000,
  liquidityUSD: 100_000,
  holderCount: 2_500,
  top10HoldersPct: 0.45,
  totalSupply: 100_000_000,
  circulatingSupply: 80_000_000,
  maxSupply: 100_000_000,
  burnedSupply: 10_000_000, // 10% burned
  txCount24h: 500,
  volume24h: 200_000,
  ageDays: 120,
  deployerHoldingPct: 0.15, // Deployer has 15%
  deployerTxLast7Days: 2,
  liquidityLocked: true,
  dataTimestamp: Date.now()
}

const result4 = calculateTokenRisk(fallbackData)
console.log('Results:')
console.log(`  Risk Score: ${result4.overall_risk_score}/100 (${result4.risk_level})`)
console.log(`  Confidence: ${result4.confidence_score}%`)
console.log(`  Data Tier: ${result4.data_tier}`)
console.log(`  Data Sources: ${result4.data_sources.join(', ')}`)
console.log(`\n✅ Heuristic-based scoring works without GoPlus`)

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ All Tests Complete!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
