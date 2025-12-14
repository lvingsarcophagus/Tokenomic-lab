#!/usr/bin/env node

/**
 * Test the optimized risk algorithm against the simulation test cases
 * This script tests the REAL risk calculator with the optimized settings
 */

const { calculateRisk } = require('../lib/risk-calculator');
const { TokenSimulator } = require('./test-risk-algorithm-simulation');

class OptimizedRiskTester extends TokenSimulator {
  constructor() {
    super();
  }

  /**
   * Test the real risk calculator with optimized settings
   */
  async testRealRiskCalculator() {
    console.log('🧪 Testing REAL Risk Calculator with Optimized Settings\n');
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
        // Convert simulation token to TokenData format
        const tokenData = this.convertToTokenData(token);
        
        // Call the REAL risk calculator
        const riskResult = await calculateRisk(tokenData, 'PREMIUM', {
          tokenSymbol: token.symbol,
          tokenName: token.name,
          chain: token.chain === 'SOLANA' ? 'SOLANA' : 'EVM'
        });
        
        const expectedRisk = token._expectedRisk;
        const actualRisk = riskResult.risk_level;
        const expectedScore = token._expectedScore;
        const actualScore = riskResult.overall_risk_score;
        
        // Check if the result matches expectations
        const riskMatch = actualRisk === expectedRisk;
        const scoreInRange = Math.abs(actualScore - expectedScore) <= 20; // Allow 20 point variance
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

    // Identify improvements
    console.log('\n🎯 IMPROVEMENTS:');
    if (results.accuracy >= 80) {
      console.log('  ✅ Algorithm performance is excellent (≥80% accuracy)');
    } else if (results.accuracy >= 70) {
      console.log('  ⚠️  Algorithm performance is good but could be improved (70-79% accuracy)');
    } else {
      console.log('  🚨 Algorithm still needs improvement (<70% accuracy)');
    }

    // Save results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `optimized-risk-test-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        accuracy: results.accuracy
      },
      categoryBreakdown: categories,
      detailedResults: results.details,
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
      }
    }, null, 2));

    console.log(`\n💾 Results saved to: ${filename}`);

    return results;
  }

  /**
   * Convert simulation token to TokenData format for real calculator
   */
  convertToTokenData(token) {
    return {
      // Basic market data
      marketCap: token.marketCap,
      fdv: token.fdv,
      liquidityUSD: token.liquidityUSD,
      totalSupply: token.totalSupply,
      circulatingSupply: token.circulatingSupply,
      maxSupply: token.maxSupply,
      
      // Holder data
      holderCount: token.holderCount,
      top10HoldersPct: token.top10HoldersPct,
      top50HoldersPct: token.top50HoldersPct,
      top100HoldersPct: token.top100HoldersPct,
      
      // Activity data
      volume24h: token.volume24h,
      ageDays: token.ageDays,
      burnedSupply: token.burnedSupply,
      txCount24h: token.txCount24h,
      uniqueBuyers24h: token.uniqueBuyers24h,
      
      // Contract security (GoPlus data)
      is_honeypot: token.is_honeypot,
      is_mintable: token.is_mintable,
      owner_renounced: token.owner_renounced,
      buy_tax: token.buy_tax,
      sell_tax: token.sell_tax,
      tax_modifiable: token.tax_modifiable,
      is_open_source: token.is_open_source,
      lp_locked: token.lp_locked,
      lp_in_owner_wallet: token.lp_in_owner_wallet,
      creator_balance: token.creator_balance,
      
      // Solana specific
      freeze_authority_exists: token.freeze_authority_exists,
      mint_authority_exists: token.mint_authority_exists,
      
      // Liquidity tracking
      liquidity1hAgo: token.liquidity1hAgo,
      liquidity24hAgo: token.liquidity24hAgo,
      
      // Vesting
      nextUnlock30dPct: token.nextUnlock30dPct,
      teamVestingMonths: token.teamVestingMonths,
      teamAllocationPct: token.teamAllocationPct,
      
      // Chain
      chain: token.chain
    };
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new OptimizedRiskTester();
  tester.testRealRiskCalculator().then(results => {
    console.log('\n🎉 Optimized algorithm testing complete!');
    process.exit(results.accuracy >= 75 ? 0 : 1); // Exit with error if accuracy < 75%
  }).catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = { OptimizedRiskTester };