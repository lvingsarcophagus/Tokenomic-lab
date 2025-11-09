/**
 * TEST SCRIPT: Validate Fixed Critical Flag Override Logic
 * 
 * Tests the new graduated penalty system that prevents false positives
 * while still catching genuine scam tokens.
 */

// Import the fixed flag validation functions
const {
  validateHolderCountFlag,
  validateLiquidityFlag,
  validateSecurityFlag,
  validateLiquidityRatioFlag,
  applyFlagBasedOverride,
  FlagSeverity
} = require('./lib/risk-algorithms/flag-validation.ts');

console.log('🧪 Testing Fixed Critical Flag Override Logic\n');
console.log('='.repeat(80));

// ============================================================================
// TEST 1: Uniswap (UNI) - Should NOT be marked as CRITICAL
// ============================================================================

console.log('\n📊 TEST 1: Uniswap (UNI) Token');
console.log('-'.repeat(80));

const uniData = {
  holderCount: 384188,
  marketCap: 3_700_000_000,  // $3.7B
  liquidityUSD: 5_700_000,   // $5.7M
  ageDays: 800,
  sellTax: 0,
  buyTax: 0
};

console.log('Token Data:');
console.log(`  Holders: ${uniData.holderCount.toLocaleString()}`);
console.log(`  Market Cap: $${(uniData.marketCap / 1_000_000).toFixed(1)}M`);
console.log(`  Liquidity: $${(uniData.liquidityUSD / 1_000_000).toFixed(1)}M`);
console.log(`  Age: ${uniData.ageDays} days`);
console.log(`  Ratio: ${(uniData.marketCap / uniData.liquidityUSD).toFixed(0)}x`);

const uniFlags = [];

// Check holder count
const holderFlag = validateHolderCountFlag(uniData.holderCount, uniData.ageDays, uniData.marketCap);
if (holderFlag) uniFlags.push(holderFlag);

// Check liquidity
const liqFlag = validateLiquidityFlag(uniData.liquidityUSD, uniData.marketCap);
if (liqFlag) uniFlags.push(liqFlag);

// Check liquidity ratio
const ratioFlag = validateLiquidityRatioFlag(uniData.liquidityUSD, uniData.marketCap, uniData.ageDays);
if (ratioFlag) uniFlags.push(ratioFlag);

console.log('\nFlags Detected:');
if (uniFlags.length === 0) {
  console.log('  ✅ No flags - clean token');
} else {
  uniFlags.forEach(flag => {
    console.log(`  ${flag.emoji} [${flag.severity.toUpperCase()}] ${flag.message}`);
  });
}

// Apply graduated penalty
const uniBaseScore = 29; // Calculated from 7 factors
const uniResult = applyFlagBasedOverride(uniBaseScore, uniFlags);

console.log('\nScore Calculation:');
console.log(`  Base Score: ${uniBaseScore}`);
console.log(`  Critical Flags: ${uniFlags.filter(f => f.severity === FlagSeverity.CRITICAL).length}`);
console.log(`  Final Score: ${uniResult.finalScore}`);
console.log(`  Risk Level: ${uniResult.riskLevel}`);
if (uniResult.overrideReason) {
  console.log(`  Override: ${uniResult.overrideReason}`);
}

console.log('\n✅ EXPECTED: Score ~29-44 (LOW/MEDIUM), not forced to 75');
console.log(`✅ ACTUAL: Score ${uniResult.finalScore} (${uniResult.riskLevel})`);
console.log(uniResult.finalScore < 65 ? '✅ PASS' : '❌ FAIL');

// ============================================================================
// TEST 2: New Token - Should get WARNING, not CRITICAL
// ============================================================================

console.log('\n\n📊 TEST 2: New Token with Few Holders');
console.log('-'.repeat(80));

const newTokenData = {
  holderCount: 40,
  marketCap: 50_000,
  liquidityUSD: 5_000,
  ageDays: 3,
  sellTax: 0.05,
  buyTax: 0.05
};

console.log('Token Data:');
console.log(`  Holders: ${newTokenData.holderCount}`);
console.log(`  Market Cap: $${newTokenData.marketCap.toLocaleString()}`);
console.log(`  Liquidity: $${newTokenData.liquidityUSD.toLocaleString()}`);
console.log(`  Age: ${newTokenData.ageDays} days`);

const newFlags = [];

const newHolderFlag = validateHolderCountFlag(newTokenData.holderCount, newTokenData.ageDays, newTokenData.marketCap);
if (newHolderFlag) newFlags.push(newHolderFlag);

const newLiqFlag = validateLiquidityFlag(newTokenData.liquidityUSD, newTokenData.marketCap);
if (newLiqFlag) newFlags.push(newLiqFlag);

console.log('\nFlags Detected:');
newFlags.forEach(flag => {
  console.log(`  ${flag.emoji} [${flag.severity.toUpperCase()}] ${flag.message}`);
});

const newBaseScore = 45;
const newResult = applyFlagBasedOverride(newBaseScore, newFlags);

console.log('\nScore Calculation:');
console.log(`  Base Score: ${newBaseScore}`);
console.log(`  Critical Flags: ${newFlags.filter(f => f.severity === FlagSeverity.CRITICAL).length}`);
console.log(`  Final Score: ${newResult.finalScore}`);
console.log(`  Risk Level: ${newResult.riskLevel}`);

console.log('\n✅ EXPECTED: Score ~45-50 (MEDIUM/HIGH), not 75');
console.log(`✅ ACTUAL: Score ${newResult.finalScore} (${newResult.riskLevel})`);
console.log(newResult.finalScore < 70 ? '✅ PASS' : '❌ FAIL');

// ============================================================================
// TEST 3: Obvious Scam - Should be marked CRITICAL
// ============================================================================

console.log('\n\n📊 TEST 3: Obvious Scam Token');
console.log('-'.repeat(80));

const scamData = {
  holderCount: 15,
  marketCap: 2_000_000,
  liquidityUSD: 2_000,
  ageDays: 5,
  sellTax: 0.99,
  isHoneypot: true
};

console.log('Token Data:');
console.log(`  Holders: ${scamData.holderCount}`);
console.log(`  Market Cap: $${scamData.marketCap.toLocaleString()}`);
console.log(`  Liquidity: $${scamData.liquidityUSD.toLocaleString()}`);
console.log(`  Age: ${scamData.ageDays} days`);
console.log(`  Sell Tax: ${(scamData.sellTax * 100).toFixed(0)}%`);

const scamFlags = [];

const scamHolderFlag = validateHolderCountFlag(scamData.holderCount, scamData.ageDays, scamData.marketCap);
if (scamHolderFlag) scamFlags.push(scamHolderFlag);

const scamLiqFlag = validateLiquidityFlag(scamData.liquidityUSD, scamData.marketCap);
if (scamLiqFlag) scamFlags.push(scamLiqFlag);

const scamTaxFlag = validateSecurityFlag('tax', { sellTax: scamData.sellTax });
if (scamTaxFlag) scamFlags.push(scamTaxFlag);

const scamHoneypotFlag = validateSecurityFlag('honeypot', { isHoneypot: scamData.isHoneypot });
if (scamHoneypotFlag) scamFlags.push(scamHoneypotFlag);

console.log('\nFlags Detected:');
scamFlags.forEach(flag => {
  console.log(`  ${flag.emoji} [${flag.severity.toUpperCase()}] ${flag.message}`);
});

const scamBaseScore = 60;
const scamResult = applyFlagBasedOverride(scamBaseScore, scamFlags);

console.log('\nScore Calculation:');
console.log(`  Base Score: ${scamBaseScore}`);
console.log(`  Critical Flags: ${scamFlags.filter(f => f.severity === FlagSeverity.CRITICAL).length}`);
console.log(`  Final Score: ${scamResult.finalScore}`);
console.log(`  Risk Level: ${scamResult.riskLevel}`);
if (scamResult.overrideReason) {
  console.log(`  Override: ${scamResult.overrideReason}`);
}

console.log('\n✅ EXPECTED: Score 75+ (CRITICAL)');
console.log(`✅ ACTUAL: Score ${scamResult.finalScore} (${scamResult.riskLevel})`);
console.log(scamResult.finalScore >= 75 ? '✅ PASS' : '❌ FAIL');

// ============================================================================
// TEST 4: 1 Critical Flag - Should add penalty, not force to 75
// ============================================================================

console.log('\n\n📊 TEST 4: Token with 1 Critical Flag');
console.log('-'.repeat(80));

const oneFlag = [{
  message: 'Honeypot detected',
  severity: FlagSeverity.CRITICAL,
  factor: 'CONTRACT_SECURITY',
  emoji: '🚨'
}];

const oneFlagResult = applyFlagBasedOverride(35, oneFlag);

console.log('Base Score: 35');
console.log('Critical Flags: 1');
console.log(`Final Score: ${oneFlagResult.finalScore}`);
console.log(`Risk Level: ${oneFlagResult.riskLevel}`);
console.log(`Override: ${oneFlagResult.overrideReason}`);

console.log('\n✅ EXPECTED: Score 50 (35 + 15 penalty), MEDIUM/HIGH');
console.log(`✅ ACTUAL: Score ${oneFlagResult.finalScore} (${oneFlagResult.riskLevel})`);
console.log(oneFlagResult.finalScore === 50 ? '✅ PASS' : '❌ FAIL');

// ============================================================================
// TEST 5: 2 Critical Flags - Should force to 65 minimum
// ============================================================================

console.log('\n\n📊 TEST 5: Token with 2 Critical Flags');
console.log('-'.repeat(80));

const twoFlags = [
  {
    message: 'Honeypot detected',
    severity: FlagSeverity.CRITICAL,
    factor: 'CONTRACT_SECURITY',
    emoji: '🚨'
  },
  {
    message: '<10 holders',
    severity: FlagSeverity.CRITICAL,
    factor: 'CONCENTRATION_RISK',
    emoji: '🚨'
  }
];

const twoFlagsResult = applyFlagBasedOverride(40, twoFlags);

console.log('Base Score: 40');
console.log('Critical Flags: 2');
console.log(`Final Score: ${twoFlagsResult.finalScore}`);
console.log(`Risk Level: ${twoFlagsResult.riskLevel}`);
console.log(`Override: ${twoFlagsResult.overrideReason}`);

console.log('\n✅ EXPECTED: Score 65+ (HIGH)');
console.log(`✅ ACTUAL: Score ${twoFlagsResult.finalScore} (${twoFlagsResult.riskLevel})`);
console.log(twoFlagsResult.finalScore >= 65 ? '✅ PASS' : '❌ FAIL');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(80));

console.log('\n✅ Fixed Issues:');
console.log('  1. UNI no longer forced to 75 (false positive eliminated)');
console.log('  2. New tokens with few holders get WARNING, not CRITICAL');
console.log('  3. Obvious scams still caught with 3+ critical flags');
console.log('  4. Graduated penalties prevent single flag from ruining score');
console.log('  5. Context-aware validation (token age, market cap, ratios)');

console.log('\n📋 Graduated Penalty System:');
console.log('  0 flags: Use calculated score');
console.log('  1 flag: +15 point penalty');
console.log('  2 flags: +25 penalty or 65 minimum (HIGH)');
console.log('  3+ flags: Force to 75 minimum (CRITICAL)');

console.log('\n✅ All tests completed!\n');
