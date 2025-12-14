#!/usr/bin/env node

/**
 * Real Risk Algorithm Test Script
 * 
 * This script tests the actual Tokenomics Lab risk calculation algorithm
 * using the TokenSimulator to generate test cases.
 */

const { TokenSimulator } = require('./test-risk-algorithm-simulation');

// Import the real risk calculator
// Note: This requires the script to be run from the project root
let calculateRisk;
try {
  // Try to import the TypeScript module (requires ts-node or compiled JS)
  calculateRisk = require('../lib/risk-calculator').calculateRisk;
} catch (error) {
  console.error('❌ Could not import risk calculator. Make sure to run from project root.');
  console.error('   Try: npm install -g ts-node && ts-node scripts/test-real-risk-algorithm.js');
  process.exit(1);
}

class RealAlgorithmTester extends TokenSimulator {
  /**
   * Test against the real risk calculation algorithm
   */
  async testRealAlgorithm(tokenData) {
    try {
      // Convert our test token format to the expected TokenData interface
      const formattedTokenData = {
        // Market data
        marketCap: tokenData.marketCap,
        fdv: tokenData.fdv,
        liquidityUSD: tokenData.liquidityUSD,
        totalSupply: tokenData.totalSupply,
        circulatingSupply: tokenData.circulatingSupply,
        maxSupply: tokenData.maxSupply,
        
        // Holder data
        holderCount: tokenData.holderCount,
        top10HoldersPct: tokenData.top10HoldersPct,
        top50HoldersPct: tokenData.top50HoldersPct,
        top100HoldersPct: tokenData.top100HoldersPct,
        
        // Activity data
        volume24h: tokenData.volume24h,
        ageDays: tokenData.ageDays,
        burnedSupply: tokenData.burnedSupply,
        txCount24h: tokenData.txCount24h,
        uniqueBuyers24h: tokenData.uniqueBuyers24h,
        
        // Security data (GoPlus format)
        is_honeypot: tokenData.is_honeypot,
        is_mintable: tokenData.is_mintable,
        owner_renounced: tokenData.owner_renounced,
        buy_tax: tokenData.buy_tax,
        sell_tax: tokenData.sell_tax,
        tax_modifiable: tokenData.tax_modifiable,
        is_open_source: tokenData.is_open_source,
        lp_locked: tokenData.lp_locked,
        lp_in_owner_wallet: tokenData.lp_in_owner_wallet,
        creator_balance: tokenData.creator_balance,
        
        // Solana specific
        freeze_authority_exists: tokenData.freeze_authority_exists,
        mint_authority_exists: tokenData.mint_authority_exists,
        
        // Chain
        chain: tokenData.chain,
        
        // Liquidity tracking
        liquidity1hAgo: tokenData.liquidity1hAgo,
        liquidity24hAgo: tokenData.liquidity24hAgo,
        
        // Vesting
        nextUnlock30dPct: tokenData.nextUnlock30dPct,
        teamVestingMonths: tokenData.teamVestingMonths,
        teamAllocationPct: tokenData.teamAllocationPct
      };

      // Prepare metadata
      const metadata = {
        tokenSymbol: tokenData.symbol,
        tokenName: tokenData.name,
        chain: tokenData.chain,
        manualClassification: tokenData._isMeme ? 'MEME_TOKEN' : null
      };

      // Call the real risk calculator
      const result = await calculateRisk(formattedTokenData, 'PREMIUM', metadata);
      
      return result;
    } catch (error) {
      console.error(`Error calculating risk for ${tokenData.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Run tests against the real algorithm
   */
  async runRealTests() {
    console.log('🧪 Testing REAL Risk Algorithm\n');
    console.log('=' .repeat(60));

    const testTokens = this.generateTestSuite();
    const results = {
      total: testTokens.length,
      passed: 0,
      failed: 0,
      errors: 0,
      accuracy: 0,
      details: []
    };

    for (const token of testTokens) {
      console.log(`\n🔍 Testing: ${token.name} (${token.symbol}) - ${token._testCategory}`);
      
      try {
        const riskResult = await this.testRealAlgorithm(token);
        const expectedRisk = token._expectedRisk;
        const actualRisk = riskResult.risk_level;
        const expectedScore = token._expectedScore;
        const actualScore = riskResult.overall_risk_score;
        
        // Check if the result matches expectations
        const riskMatch = actualRisk === expectedRisk;
        const scoreInRange = Math.abs(actualScore - expectedScore) <= 20; // Allow 20 point variance for real algorithm
        const testPassed = riskMatch || scoreInRange; // Pass if either risk level or score is close

        if (testPassed) {
          results.passed++;
          console.log(`   ✅ PASS - Risk: ${actualRisk} (expected: ${expectedRisk}), Score: ${actualScore} (expected: ~${expectedScore})`);
        } else {
          results.failed++;
          console.log(`   ❌ FAIL - Risk: ${actualRisk} (expected: ${expectedRisk}), Score: ${actualScore} (expected: ~${expectedScore})`);
        }

        // Log AI insights if available
        if (riskResult.ai_insights) {
          console.log(`   🤖 AI Classification: ${riskResult.ai_insights.classification} (${riskResult.ai_insights.confidence}% confidence)`);
        }

        // Log critical flags if any
        if (riskResult.critical_flags && riskResult.critical_flags.length > 0) {
          console.log(`   🚩 Critical Flags: ${riskResult.critical_flags.join(', ')}`);
        }

        // Log positive signals if any
        if (riskResult.positive_signals && riskResult.positive_signals.length > 0) {
          console.log(`   ✅ Positive Signals: ${riskResult.positive_signals.join(', ')}`);
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
          criticalFlags: riskResult.critical_flags || [],
          positiveSignals: riskResult.positive_signals || [],
          aiInsights: riskResult.ai_insights,
          confidenceScore: riskResult.confidence_score,
          dataSources: riskResult.data_sources
        });

      } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);
        results.errors++;
        results.details.push({
          token: `${token.name} (${token.symbol})`,
          category: token._testCategory,
          error: error.message,
          passed: false
        });
      }
    }

    results.accuracy = (results.passed / (results.total - results.errors) * 100).toFixed(1);

    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 REAL ALGORITHM TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Errors: ${results.errors} 💥`);
    console.log(`Accuracy: ${results.accuracy}% (excluding errors)`);

    // Print detailed breakdown by category
    const categories = {};
    results.details.filter(r => !r.error).forEach(result => {
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

    // Analyze AI classification accuracy
    const aiResults = results.details.filter(r => r.aiInsights && !r.error);
    if (aiResults.length > 0) {
      console.log('\n🤖 AI CLASSIFICATION ANALYSIS:');
      const memeTokens = aiResults.filter(r => r.token.includes('DOGC') || r.token.includes('SHIB2') || r.riskType === 'MEME_RISKY');
      const utilityTokens = aiResults.filter(r => !memeTokens.includes(r));
      
      console.log(`  Meme Token Detection: ${memeTokens.filter(r => r.aiInsights.classification === 'MEME_TOKEN').length}/${memeTokens.length}`);
      console.log(`  Utility Token Detection: ${utilityTokens.filter(r => r.aiInsights.classification === 'UTILITY_TOKEN').length}/${utilityTokens.length}`);
    }

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `real-algorithm-test-results-${timestamp}.json`;
    
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        errors: results.errors,
        accuracy: results.accuracy
      },
      categoryBreakdown: categories,
      detailedResults: results.details
    }, null, 2));

    console.log(`\n💾 Detailed results saved to: ${filename}`);

    return results;
  }
}

// Run the real algorithm test if this script is executed directly
if (require.main === module) {
  const tester = new RealAlgorithmTester();
  tester.runRealTests().then(results => {
    console.log('\n🎯 FINAL ASSESSMENT:');
    if (results.accuracy >= 85) {
      console.log('  🎉 Excellent! Algorithm is performing very well.');
    } else if (results.accuracy >= 70) {
      console.log('  👍 Good performance, minor improvements possible.');
    } else if (results.accuracy >= 50) {
      console.log('  ⚠️  Moderate performance, consider algorithm adjustments.');
    } else {
      console.log('  🚨 Poor performance, algorithm needs significant improvements.');
    }
    
    process.exit(results.accuracy >= 70 ? 0 : 1);
  }).catch(error => {
    console.error('❌ Real algorithm test failed:', error);
    process.exit(1);
  });
}

module.exports = { RealAlgorithmTester };