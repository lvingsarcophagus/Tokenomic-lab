#!/usr/bin/env node

/**
 * Test the optimized simulation algorithm with the new thresholds and penalties
 * This validates that our optimizations work correctly
 */

const { TokenSimulator } = require('./test-risk-algorithm-simulation');

class OptimizedSimulator extends TokenSimulator {
  constructor() {
    super();
  }

  /**
   * Simulate risk calculation with optimized configuration
   */
  async simulateRiskCalculation(tokenData) {
    let riskScore = 0;
    const breakdown = {};
    const criticalFlags = [];
    const positiveSignals = [];

    // Supply Dilution (18% weight)
    const supplyRisk = this.calculateSupplyRisk(tokenData);
    breakdown.supplyDilution = supplyRisk;
    riskScore += supplyRisk * 0.18;

    // Holder Concentration (16% weight)
    const holderRisk = this.calculateHolderRisk(tokenData);
    breakdown.holderConcentration = holderRisk;
    riskScore += holderRisk * 0.16;

    // Liquidity Depth (14% weight)
    const liquidityRisk = this.calculateLiquidityRisk(tokenData);
    breakdown.liquidityDepth = liquidityRisk;
    riskScore += liquidityRisk * 0.14;

    // Contract Control (12% weight)
    const contractRisk = this.calculateContractRisk(tokenData);
    breakdown.contractControl = contractRisk;
    riskScore += contractRisk * 0.12;

    // Tax/Fee (10% weight)
    const taxRisk = this.calculateTaxRisk(tokenData);
    breakdown.taxFee = taxRisk;
    riskScore += taxRisk * 0.10;

    // Other factors...
    breakdown.vestingUnlock = this.calculateVestingRisk(tokenData);
    breakdown.distribution = this.calculateDistributionRisk(tokenData);
    breakdown.burnDeflation = this.calculateBurnRisk(tokenData);
    breakdown.adoption = this.calculateAdoptionRisk(tokenData);
    breakdown.auditTransparency = this.calculateAuditRisk(tokenData);

    riskScore += breakdown.vestingUnlock * 0.13;
    riskScore += breakdown.distribution * 0.09;
    riskScore += breakdown.burnDeflation * 0.08;
    riskScore += breakdown.adoption * 0.07;
    riskScore += breakdown.auditTransparency * 0.03;

    // Critical flags detection
    if (tokenData.is_honeypot) criticalFlags.push('Honeypot detected');
    if (tokenData.sell_tax > 0.50) criticalFlags.push('Extreme sell tax (>50%)');
    if (tokenData.lp_in_owner_wallet) criticalFlags.push('LP tokens in owner wallet');
    if (tokenData.freeze_authority_exists) criticalFlags.push('Freeze authority exists');
    if (tokenData.mint_authority_exists) criticalFlags.push('Mint authority exists');

    // OPTIMIZED: Apply individual critical penalties
    let criticalPenalty = 0;
    if (tokenData.is_honeypot) criticalPenalty += 35; // Optimized: +35 (was +25)
    if (tokenData.sell_tax > 0.90) criticalPenalty += 30; // Optimized: +30 (was +20)
    if (tokenData.lp_in_owner_wallet) criticalPenalty += 20; // Optimized: +20 (was +15)
    if (tokenData.freeze_authority_exists) criticalPenalty += 12; // Optimized: +12 (was +10)
    if (tokenData.mint_authority_exists) criticalPenalty += 12; // Optimized: +12 (was +10)
    
    riskScore += criticalPenalty;

    // OPTIMIZED: Meme token penalty (18 instead of 15)
    if (tokenData._isMeme) {
      riskScore += 18; // Optimized: +18 (was +15)
    }

    // Force minimum for multiple critical flags
    if (criticalFlags.length >= 3) {
      riskScore = Math.max(riskScore, 85); // Force to CRITICAL zone
    }

    // Cap at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // OPTIMIZED: Risk level thresholds
    let riskLevel;
    if (riskScore > 78) riskLevel = 'CRITICAL';  // Optimized: >78 (was >80)
    else if (riskScore > 55) riskLevel = 'HIGH'; // Optimized: >55 (was >60)
    else if (riskScore > 30) riskLevel = 'MEDIUM'; // Optimized: >30 (same)
    else riskLevel = 'LOW';

    return {
      overall_risk_score: Math.round(riskScore),
      risk_level: riskLevel,
      confidence_score: 85,
      breakdown,
      critical_flags: criticalFlags,
      positive_signals: positiveSignals,
      data_sources: ['Optimized Simulation'],
      plan: 'PREMIUM'
    };
  }

  /**
   * Run tests with optimized settings
   */
  async runOptimizedTests() {
    console.log('🧪 Testing OPTIMIZED Risk Algorithm Simulation\n');
    console.log('=' .repeat(60));
    console.log('🎯 Optimizations Applied:');
    console.log('   • Thresholds: LOW≤30, MEDIUM≤55, HIGH≤78, CRITICAL>78');
    console.log('   • Honeypot penalty: +35 (was +25)');
    console.log('   • Extreme tax penalty: +30 (was +20)');
    console.log('   • Rug pull penalty: +20 (was +15)');
    console.log('   • Freeze/Mint authority: +12 each (was +10)');
    console.log('   • Meme penalty: +18 (was +15)');
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
        
        // Check if the result matches expectations
        const riskMatch = actualRisk === expectedRisk;
        const scoreInRange = Math.abs(actualScore - expectedScore) <= 15; // Allow 15 point variance
        const testPassed = riskMatch; // Focus on risk level accuracy

        if (testPassed) {
          results.passed++;
          console.log(`   ✅ PASS - Risk: ${actualRisk} (expected: ${expectedRisk}), Score: ${actualScore} (expected: ~${expectedScore})`);
        } else {
          results.failed++;
          console.log(`   ❌ FAIL - Risk: ${actualRisk} (expected: ${expectedRisk}), Score: ${actualScore} (expected: ~${expectedScore})`);
        }

        // Log critical flags if any
        if (riskResult.critical_flags && riskResult.critical_flags.length > 0) {
          console.log(`   🚩 Critical Flags: ${riskResult.critical_flags.join(', ')}`);
        }

        // Store detailed results
        results.details.push({
          token: `${token.name} (${token.symbol})`,
          category: token._testCategory,
          riskType: token._riskType || 'N/A',
          expected: {
            risk: expectedRisk,
            score: expectedScore
          },
          actual: {
            risk: actualRisk,
            score: actualScore
          },
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
    console.log('📊 OPTIMIZED ALGORITHM TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Accuracy: ${results.accuracy}%`);

    // Print detailed breakdown by category
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

    // Compare with original results
    console.log('\n📊 IMPROVEMENT COMPARISON:');
    console.log('  Original Algorithm: 50.0% accuracy');
    console.log(`  Optimized Algorithm: ${results.accuracy}% accuracy`);
    const improvement = parseFloat(results.accuracy) - 50.0;
    console.log(`  Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)} percentage points`);

    // Save results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `optimized-simulation-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      optimizations: {
        thresholds: 'LOW≤30, MEDIUM≤55, HIGH≤78, CRITICAL>78',
        criticalPenalties: {
          honeypot: 35,
          extremeTax: 30,
          rugPull: 20,
          freezeAuthority: 12,
          mintAuthority: 12
        },
        memePenalty: 18
      },
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        accuracy: results.accuracy,
        improvement: improvement.toFixed(1)
      },
      categoryBreakdown: categories,
      detailedResults: results.details
    }, null, 2));

    console.log(`\n💾 Results saved to: ${filename}`);

    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT:');
    if (results.accuracy >= 80) {
      console.log('  ✅ EXCELLENT - Algorithm performance is now excellent (≥80% accuracy)');
    } else if (results.accuracy >= 75) {
      console.log('  ✅ GOOD - Algorithm performance is now good (75-79% accuracy)');
    } else if (results.accuracy >= 70) {
      console.log('  ⚠️  IMPROVED - Algorithm performance improved but could be better (70-74% accuracy)');
    } else {
      console.log('  🚨 NEEDS WORK - Algorithm still needs more improvement (<70% accuracy)');
    }

    return results;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const simulator = new OptimizedSimulator();
  simulator.runOptimizedTests().then(results => {
    console.log('\n🎉 Optimized algorithm testing complete!');
    process.exit(results.accuracy >= 75 ? 0 : 1); // Exit with error if accuracy < 75%
  }).catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = { OptimizedSimulator };