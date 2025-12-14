#!/usr/bin/env node

/**
 * Test the balanced risk algorithm with product-spec aligned thresholds
 */

const { TokenSimulator } = require('./test-risk-algorithm-simulation');

class BalancedSimulator extends TokenSimulator {
  constructor() {
    super();
  }

  /**
   * Simulate risk calculation with balanced configuration
   */
  async simulateRiskCalculation(tokenData) {
    let riskScore = 0;
    const breakdown = {};
    const criticalFlags = [];

    // Calculate all 10 factors (same as before)
    const supplyRisk = this.calculateSupplyRisk(tokenData);
    const holderRisk = this.calculateHolderRisk(tokenData);
    const liquidityRisk = this.calculateLiquidityRisk(tokenData);
    const contractRisk = this.calculateContractRisk(tokenData);
    const taxRisk = this.calculateTaxRisk(tokenData);
    const vestingRisk = this.calculateVestingRisk(tokenData);
    const distributionRisk = this.calculateDistributionRisk(tokenData);
    const burnRisk = this.calculateBurnRisk(tokenData);
    const adoptionRisk = this.calculateAdoptionRisk(tokenData);
    const auditRisk = this.calculateAuditRisk(tokenData);

    breakdown.supplyDilution = supplyRisk;
    breakdown.holderConcentration = holderRisk;
    breakdown.liquidityDepth = liquidityRisk;
    breakdown.contractControl = contractRisk;
    breakdown.taxFee = taxRisk;
    breakdown.vestingUnlock = vestingRisk;
    breakdown.distribution = distributionRisk;
    breakdown.burnDeflation = burnRisk;
    breakdown.adoption = adoptionRisk;
    breakdown.auditTransparency = auditRisk;

    // Apply weights
    riskScore += supplyRisk * 0.18;
    riskScore += holderRisk * 0.16;
    riskScore += liquidityRisk * 0.14;
    riskScore += contractRisk * 0.12;
    riskScore += taxRisk * 0.10;
    riskScore += vestingRisk * 0.13;
    riskScore += distributionRisk * 0.09;
    riskScore += burnRisk * 0.08;
    riskScore += adoptionRisk * 0.07;
    riskScore += auditRisk * 0.03;

    // Critical flags detection
    if (tokenData.is_honeypot) criticalFlags.push('Honeypot detected');
    if (tokenData.sell_tax > 0.50) criticalFlags.push('Extreme sell tax (>50%)');
    if (tokenData.lp_in_owner_wallet) criticalFlags.push('LP tokens in owner wallet');
    if (tokenData.freeze_authority_exists) criticalFlags.push('Freeze authority exists');
    if (tokenData.mint_authority_exists) criticalFlags.push('Mint authority exists');

    // BALANCED: Apply individual critical penalties
    let criticalPenalty = 0;
    if (tokenData.is_honeypot) criticalPenalty += 40; // Most critical
    if (tokenData.sell_tax > 0.90) criticalPenalty += 35; // Very critical
    if (tokenData.lp_in_owner_wallet) criticalPenalty += 25; // High critical
    if (tokenData.freeze_authority_exists) criticalPenalty += 8; // Moderate
    if (tokenData.mint_authority_exists) criticalPenalty += 8; // Moderate
    
    riskScore += criticalPenalty;

    // Meme token penalty (balanced)
    if (tokenData._isMeme) {
      riskScore += 15; // Balanced: +15
    }

    // Force minimum for multiple critical flags
    if (criticalFlags.length >= 3) {
      riskScore = Math.max(riskScore, 82); // Force to CRITICAL zone
    }

    // Cap at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // BALANCED: Risk level thresholds (matches product spec)
    let riskLevel;
    if (riskScore > 80) riskLevel = 'CRITICAL';  // 81-100: CRITICAL (red)
    else if (riskScore > 60) riskLevel = 'HIGH'; // 61-80: HIGH (orange)
    else if (riskScore > 30) riskLevel = 'MEDIUM'; // 31-60: MEDIUM (yellow)
    else riskLevel = 'LOW'; // 0-30: LOW (green)

    return {
      overall_risk_score: Math.round(riskScore),
      risk_level: riskLevel,
      confidence_score: 85,
      breakdown,
      critical_flags: criticalFlags,
      data_sources: ['Balanced Simulation'],
      plan: 'PREMIUM'
    };
  }

  /**
   * Run tests with balanced settings
   */
  async runBalancedTests() {
    console.log('🧪 Testing BALANCED Risk Algorithm (Product Spec Aligned)\n');
    console.log('=' .repeat(60));
    console.log('🎯 Balanced Configuration:');
    console.log('   • Thresholds: LOW≤30, MEDIUM≤60, HIGH≤80, CRITICAL>80 (matches product spec)');
    console.log('   • Honeypot penalty: +40 (most critical)');
    console.log('   • Extreme tax penalty: +35 (very critical)');
    console.log('   • Rug pull penalty: +25 (high critical)');
    console.log('   • Freeze/Mint authority: +8 each (moderate)');
    console.log('   • Meme penalty: +15 (balanced)');
    console.log('=' .repeat(60));

    const testTokens = this.generateTestSuite();
    const results = {
      total: testTokens.length,
      passed: 0,
      failed: 0,
      accuracy: 0,
      details: []
    };

    for (const token of testTokens) {
      console.log(`\n🔍 Testing: ${token.name} (${token.symbol}) - ${token._testCategory}`);
      
      try {
        const riskResult = await this.simulateRiskCalculation(token);
        const expectedRisk = token._expectedRisk;
        const actualRisk = riskResult.risk_level;
        const expectedScore = token._expectedScore;
        const actualScore = riskResult.overall_risk_score;
        
        const riskMatch = actualRisk === expectedRisk;
        const testPassed = riskMatch;

        if (testPassed) {
          results.passed++;
          console.log(`   ✅ PASS - Risk: ${actualRisk} (expected: ${expectedRisk}), Score: ${actualScore}`);
        } else {
          results.failed++;
          console.log(`   ❌ FAIL - Risk: ${actualRisk} (expected: ${expectedRisk}), Score: ${actualScore}`);
        }

        if (riskResult.critical_flags && riskResult.critical_flags.length > 0) {
          console.log(`   🚩 Critical Flags: ${riskResult.critical_flags.join(', ')}`);
        }

        results.details.push({
          token: `${token.name} (${token.symbol})`,
          category: token._testCategory,
          riskType: token._riskType || 'N/A',
          expected: { risk: expectedRisk, score: expectedScore },
          actual: { risk: actualRisk, score: actualScore },
          passed: testPassed,
          breakdown: riskResult.breakdown,
          criticalFlags: riskResult.critical_flags || []
        });

      } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);
        results.failed++;
      }
    }

    results.accuracy = (results.passed / results.total * 100).toFixed(1);

    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 BALANCED ALGORITHM TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Accuracy: ${results.accuracy}%`);

    // Category breakdown
    const categories = {};
    results.details.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = { total: 0, passed: 0 };
      }
      categories[result.category].total++;
      if (result.passed) categories[result.category].passed++;
    });

    console.log('\n📈 ACCURACY BY CATEGORY:');
    Object.entries(categories).forEach(([category, stats]) => {
      const accuracy = (stats.passed / stats.total * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${accuracy}%)`);
    });

    console.log('\n📊 PROGRESSION:');
    console.log('  Original Algorithm: 50.0% accuracy');
    console.log('  Optimized Algorithm: 61.1% accuracy');
    console.log(`  Balanced Algorithm: ${results.accuracy}% accuracy`);

    return results;
  }
}

// Run the test
if (require.main === module) {
  const simulator = new BalancedSimulator();
  simulator.runBalancedTests().then(results => {
    console.log('\n🎉 Balanced algorithm testing complete!');
    process.exit(results.accuracy >= 70 ? 0 : 1);
  }).catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = { BalancedSimulator };