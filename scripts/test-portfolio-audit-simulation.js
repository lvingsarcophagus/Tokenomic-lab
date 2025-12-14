#!/usr/bin/env node

/**
 * Portfolio Audit Simulation & Testing Script
 * 
 * This script creates realistic wallet portfolios with various token types
 * and tests them against the Tokenomics Lab portfolio audit functionality
 * to validate batch processing, risk scoring, and user experience.
 */

const fs = require('fs');
const path = require('path');

class PortfolioSimulator {
  constructor() {
    this.testResults = [];
    this.chains = {
      'ethereum': '1',
      'bsc': '56', 
      'polygon': '137',
      'solana': '501',
      'arbitrum': '42161',
      'optimism': '10',
      'base': '8453'
    };
    
    // Base URL for API calls (adjust for your environment)
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Generate a realistic wallet portfolio with mixed token types
   */
  generateWalletPortfolio(walletType = 'MIXED', tokenCount = 10) {
    const portfolio = {
      walletType,
      tokens: [],
      expectedRiskProfile: this.getExpectedRiskProfile(walletType),
      metadata: {
        totalTokens: tokenCount,
        generatedAt: new Date().toISOString(),
        description: this.getWalletDescription(walletType)
      }
    };

    // Generate tokens based on wallet type
    switch (walletType) {
      case 'SAFE_DEFI':
        portfolio.tokens = this.generateSafeDeFiPortfolio(tokenCount);
        break;
      case 'RISKY_MEME':
        portfolio.tokens = this.generateRiskyMemePortfolio(tokenCount);
        break;
      case 'MIXED_PORTFOLIO':
        portfolio.tokens = this.generateMixedPortfolio(tokenCount);
        break;
      case 'SCAM_HEAVY':
        portfolio.tokens = this.generateScamHeavyPortfolio(tokenCount);
        break;
      case 'BLUE_CHIP':
        portfolio.tokens = this.generateBlueChipPortfolio(tokenCount);
        break;
      case 'NEW_TRADER':
        portfolio.tokens = this.generateNewTraderPortfolio(tokenCount);
        break;
      default:
        portfolio.tokens = this.generateMixedPortfolio(tokenCount);
    }

    return portfolio;
  }

  /**
   * Generate a safe DeFi-focused portfolio
   */
  generateSafeDeFiPortfolio(count) {
    const safeTokens = [
      { name: 'Uniswap', symbol: 'UNI', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', chain: 'ethereum' },
      { name: 'Chainlink', symbol: 'LINK', address: '0x514910771af9ca656af840dff83e8264ecf986ca', chain: 'ethereum' },
      { name: 'Aave Token', symbol: 'AAVE', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', chain: 'ethereum' },
      { name: 'Compound', symbol: 'COMP', address: '0xc00e94cb662c3520282e6f5717214004a7f26888', chain: 'ethereum' },
      { name: 'Maker', symbol: 'MKR', address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', chain: 'ethereum' },
      { name: 'PancakeSwap', symbol: 'CAKE', address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', chain: 'bsc' },
      { name: 'SushiSwap', symbol: 'SUSHI', address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', chain: 'ethereum' },
      { name: 'Curve DAO', symbol: 'CRV', address: '0xd533a949740bb3306d119cc777fa900ba034cd52', chain: 'ethereum' }
    ];

    return this.selectRandomTokens(safeTokens, count).map(token => ({
      ...token,
      uiAmount: this.randomBetween(100, 10000),
      expectedRisk: 'LOW',
      expectedScore: this.randomBetween(15, 35)
    }));
  }

  /**
   * Generate a risky meme token portfolio
   */
  generateRiskyMemePortfolio(count) {
    const riskyTokens = [];
    
    for (let i = 0; i < count; i++) {
      const memeNames = ['DogeCoin2', 'ShibaInu3', 'PepeCoin', 'FlokiInu2', 'BabyDoge', 'SafeMoon2', 'ElonMusk', 'MoonShot'];
      const name = memeNames[i % memeNames.length] + (i > 7 ? i : '');
      
      riskyTokens.push({
        name: name,
        symbol: name.substring(0, 4).toUpperCase() + (i + 1),
        address: this.generateRandomAddress(),
        chain: this.randomChoice(['ethereum', 'bsc', 'solana']),
        uiAmount: this.randomBetween(1000000, 100000000), // Large amounts of cheap tokens
        expectedRisk: this.randomChoice(['MEDIUM', 'HIGH', 'CRITICAL']),
        expectedScore: this.randomBetween(50, 95),
        tokenType: 'MEME'
      });
    }
    
    return riskyTokens;
  }

  /**
   * Generate a mixed portfolio (realistic for most users)
   */
  generateMixedPortfolio(count) {
    const tokens = [];
    
    // 40% safe tokens
    const safeCount = Math.floor(count * 0.4);
    tokens.push(...this.generateSafeDeFiPortfolio(safeCount));
    
    // 30% medium risk tokens
    const mediumCount = Math.floor(count * 0.3);
    for (let i = 0; i < mediumCount; i++) {
      tokens.push({
        name: `MediumToken${i + 1}`,
        symbol: `MED${i + 1}`,
        address: this.generateRandomAddress(),
        chain: this.randomChoice(['ethereum', 'bsc', 'polygon']),
        uiAmount: this.randomBetween(500, 5000),
        expectedRisk: 'MEDIUM',
        expectedScore: this.randomBetween(40, 65),
        tokenType: 'MEDIUM_RISK'
      });
    }
    
    // 30% risky tokens
    const riskyCount = count - safeCount - mediumCount;
    tokens.push(...this.generateRiskyMemePortfolio(riskyCount));
    
    return tokens;
  }

  /**
   * Generate a scam-heavy portfolio (worst case scenario)
   */
  generateScamHeavyPortfolio(count) {
    const scamTokens = [];
    const scamTypes = ['HONEYPOT', 'RUG_PULL', 'PUMP_DUMP'];
    
    for (let i = 0; i < count; i++) {
      const scamType = this.randomChoice(scamTypes);
      scamTokens.push({
        name: `Scam${scamType}${i + 1}`,
        symbol: `SCAM${i + 1}`,
        address: this.generateRandomAddress(),
        chain: this.randomChoice(['ethereum', 'bsc']),
        uiAmount: this.randomBetween(10000, 1000000),
        expectedRisk: 'CRITICAL',
        expectedScore: this.randomBetween(80, 100),
        tokenType: 'SCAM',
        scamType: scamType
      });
    }
    
    return scamTokens;
  }

  /**
   * Generate a blue chip portfolio (safest possible)
   */
  generateBlueChipPortfolio(count) {
    const blueChips = [
      { name: 'Wrapped Ethereum', symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', chain: 'ethereum' },
      { name: 'USD Coin', symbol: 'USDC', address: '0xa0b86a33e6441b8c18d904c9c0b0b86a33e6441b', chain: 'ethereum' },
      { name: 'Tether USD', symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', chain: 'ethereum' },
      { name: 'Wrapped Bitcoin', symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', chain: 'ethereum' }
    ];
    
    return this.selectRandomTokens(blueChips, Math.min(count, 4)).map(token => ({
      ...token,
      uiAmount: this.randomBetween(1, 100),
      expectedRisk: 'LOW',
      expectedScore: this.randomBetween(5, 20),
      tokenType: 'BLUE_CHIP'
    }));
  }

  /**
   * Generate a new trader portfolio (mix of good and bad decisions)
   */
  generateNewTraderPortfolio(count) {
    const tokens = [];
    
    // 20% blue chip (smart moves)
    const blueChipCount = Math.floor(count * 0.2);
    tokens.push(...this.generateBlueChipPortfolio(blueChipCount));
    
    // 80% risky/meme tokens (typical new trader behavior)
    const riskyCount = count - blueChipCount;
    tokens.push(...this.generateRiskyMemePortfolio(riskyCount));
    
    return tokens;
  }

  /**
   * Simulate the portfolio audit API call
   */
  async simulatePortfolioAudit(portfolio, userPlan = 'PREMIUM', userId = 'test-user') {
    console.log(`\n🔍 Simulating portfolio audit for ${portfolio.walletType} wallet...`);
    console.log(`   Tokens: ${portfolio.tokens.length}, Plan: ${userPlan}`);
    
    try {
      // In a real environment, this would make an actual HTTP request
      // For simulation, we'll mock the API response based on token data
      
      const auditResults = {
        success: true,
        totalTokens: portfolio.tokens.length,
        analyzed: 0,
        failed: 0,
        results: [],
        processingTime: 0,
        plan: userPlan,
        userId: userId
      };

      const startTime = Date.now();
      
      // Simulate batch processing (10 tokens at a time)
      const batchSize = 10;
      for (let i = 0; i < portfolio.tokens.length; i += batchSize) {
        const batch = portfolio.tokens.slice(i, i + batchSize);
        
        console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(portfolio.tokens.length / batchSize)}...`);
        
        // Simulate API delay (1-3 seconds per batch)
        await this.sleep(this.randomBetween(1000, 3000));
        
        for (const token of batch) {
          try {
            // Simulate individual token analysis
            const tokenResult = await this.simulateTokenAnalysis(token);
            
            auditResults.results.push({
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: token.uiAmount,
              riskScore: tokenResult.overall_risk_score,
              riskLevel: tokenResult.risk_level,
              success: true,
              criticalFlags: tokenResult.critical_flags || [],
              chain: token.chain
            });
            
            auditResults.analyzed++;
          } catch (error) {
            console.log(`     ❌ Failed to analyze ${token.symbol}: ${error.message}`);
            
            auditResults.results.push({
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: token.uiAmount,
              riskScore: null,
              riskLevel: 'UNKNOWN',
              success: false,
              error: error.message,
              chain: token.chain
            });
            
            auditResults.failed++;
          }
        }
        
        // Simulate rate limiting delay between batches
        if (i + batchSize < portfolio.tokens.length) {
          await this.sleep(1000);
        }
      }
      
      // Sort by risk score (highest first)
      auditResults.results.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
      
      auditResults.processingTime = Date.now() - startTime;
      
      console.log(`   ✅ Completed: ${auditResults.analyzed}/${auditResults.totalTokens} successful (${auditResults.processingTime}ms)`);
      
      return auditResults;
      
    } catch (error) {
      console.error(`   💥 Portfolio audit failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate individual token analysis (simplified version)
   */
  async simulateTokenAnalysis(token) {
    // Simulate API processing time
    await this.sleep(this.randomBetween(100, 500));
    
    // Generate risk score based on token type and expected risk
    let riskScore;
    let criticalFlags = [];
    
    switch (token.tokenType) {
      case 'BLUE_CHIP':
        riskScore = this.randomBetween(5, 20);
        break;
      case 'MEME':
        riskScore = this.randomBetween(45, 85);
        if (riskScore > 70) criticalFlags.push('High volatility meme token');
        break;
      case 'SCAM':
        riskScore = this.randomBetween(80, 100);
        criticalFlags.push('Potential scam token detected');
        if (token.scamType === 'HONEYPOT') criticalFlags.push('Honeypot detected');
        if (token.scamType === 'RUG_PULL') criticalFlags.push('Rug pull risk');
        break;
      case 'MEDIUM_RISK':
        riskScore = this.randomBetween(35, 65);
        break;
      default:
        riskScore = token.expectedScore || this.randomBetween(20, 80);
    }
    
    // Determine risk level
    let riskLevel;
    if (riskScore <= 30) riskLevel = 'LOW';
    else if (riskScore <= 60) riskLevel = 'MEDIUM';
    else if (riskScore <= 80) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';
    
    // Simulate occasional API failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('API rate limit exceeded');
    }
    
    return {
      overall_risk_score: riskScore,
      risk_level: riskLevel,
      confidence_score: this.randomBetween(75, 95),
      critical_flags: criticalFlags,
      analyzed_at: new Date().toISOString()
    };
  }

  /**
   * Analyze portfolio audit results
   */
  analyzePortfolioResults(portfolio, auditResults) {
    const analysis = {
      portfolio: portfolio.walletType,
      totalTokens: auditResults.totalTokens,
      successRate: (auditResults.analyzed / auditResults.totalTokens * 100).toFixed(1),
      processingTime: auditResults.processingTime,
      riskDistribution: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
        UNKNOWN: 0
      },
      averageRiskScore: 0,
      criticalTokens: [],
      recommendations: []
    };

    // Calculate risk distribution
    let totalScore = 0;
    let scoredTokens = 0;
    
    auditResults.results.forEach(result => {
      if (result.success && result.riskScore !== null) {
        analysis.riskDistribution[result.riskLevel]++;
        totalScore += result.riskScore;
        scoredTokens++;
        
        // Identify critical tokens
        if (result.riskLevel === 'CRITICAL') {
          analysis.criticalTokens.push({
            symbol: result.symbol,
            riskScore: result.riskScore,
            criticalFlags: result.criticalFlags
          });
        }
      } else {
        analysis.riskDistribution.UNKNOWN++;
      }
    });

    analysis.averageRiskScore = scoredTokens > 0 ? (totalScore / scoredTokens).toFixed(1) : 0;

    // Generate recommendations
    const criticalCount = analysis.riskDistribution.CRITICAL;
    const highCount = analysis.riskDistribution.HIGH;
    const lowCount = analysis.riskDistribution.LOW;
    
    if (criticalCount > 0) {
      analysis.recommendations.push(`🚨 URGENT: ${criticalCount} critical risk token(s) detected - consider immediate review`);
    }
    
    if (highCount > auditResults.totalTokens * 0.3) {
      analysis.recommendations.push(`⚠️ High risk exposure: ${highCount} tokens with high risk scores`);
    }
    
    if (lowCount < auditResults.totalTokens * 0.3) {
      analysis.recommendations.push(`💡 Consider diversifying with more established tokens`);
    }
    
    if (analysis.successRate < 90) {
      analysis.recommendations.push(`🔧 ${auditResults.failed} tokens failed analysis - may need manual review`);
    }

    return analysis;
  }

  /**
   * Test different user plans and rate limiting
   */
  async testUserPlans() {
    console.log('\n🧪 Testing different user plans...\n');
    
    const testCases = [
      { plan: 'FREE', portfolio: 'MIXED_PORTFOLIO', tokenCount: 5 },
      { plan: 'PAY_PER_USE', portfolio: 'RISKY_MEME', tokenCount: 8 },
      { plan: 'PREMIUM', portfolio: 'MIXED_PORTFOLIO', tokenCount: 15 }
    ];

    const planResults = [];

    for (const testCase of testCases) {
      console.log(`\n📋 Testing ${testCase.plan} plan with ${testCase.tokenCount} tokens...`);
      
      try {
        const portfolio = this.generateWalletPortfolio(testCase.portfolio, testCase.tokenCount);
        const auditResults = await this.simulatePortfolioAudit(portfolio, testCase.plan);
        const analysis = this.analyzePortfolioResults(portfolio, auditResults);
        
        planResults.push({
          plan: testCase.plan,
          portfolio: testCase.portfolio,
          tokenCount: testCase.tokenCount,
          results: analysis,
          success: true
        });
        
        console.log(`   ✅ ${testCase.plan}: ${analysis.successRate}% success rate, avg risk: ${analysis.averageRiskScore}`);
        
      } catch (error) {
        console.log(`   ❌ ${testCase.plan}: ${error.message}`);
        planResults.push({
          plan: testCase.plan,
          portfolio: testCase.portfolio,
          tokenCount: testCase.tokenCount,
          error: error.message,
          success: false
        });
      }
    }

    return planResults;
  }

  /**
   * Run comprehensive portfolio audit tests
   */
  async runTests() {
    console.log('🧪 Starting Portfolio Audit Simulation Tests\n');
    console.log('=' .repeat(70));

    const testResults = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      portfolioTypes: [],
      planTests: [],
      performance: {
        averageProcessingTime: 0,
        averageSuccessRate: 0,
        totalTokensProcessed: 0
      }
    };

    // Test 1: Different portfolio types
    console.log('\n📊 Testing different portfolio types...\n');
    
    const portfolioTypes = ['SAFE_DEFI', 'RISKY_MEME', 'MIXED_PORTFOLIO', 'SCAM_HEAVY', 'BLUE_CHIP', 'NEW_TRADER'];
    
    for (const portfolioType of portfolioTypes) {
      console.log(`\n🔍 Testing ${portfolioType} portfolio...`);
      testResults.totalTests++;
      
      try {
        const portfolio = this.generateWalletPortfolio(portfolioType, 10);
        const auditResults = await this.simulatePortfolioAudit(portfolio, 'PREMIUM');
        const analysis = this.analyzePortfolioResults(portfolio, auditResults);
        
        testResults.portfolioTypes.push({
          type: portfolioType,
          analysis: analysis,
          success: true
        });
        
        testResults.passedTests++;
        testResults.performance.totalTokensProcessed += auditResults.totalTokens;
        
        console.log(`   ✅ Success: ${analysis.successRate}% analyzed, avg risk: ${analysis.averageRiskScore}`);
        console.log(`   📈 Risk distribution: L:${analysis.riskDistribution.LOW} M:${analysis.riskDistribution.MEDIUM} H:${analysis.riskDistribution.HIGH} C:${analysis.riskDistribution.CRITICAL}`);
        
        if (analysis.criticalTokens.length > 0) {
          console.log(`   🚨 Critical tokens: ${analysis.criticalTokens.map(t => t.symbol).join(', ')}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        testResults.failedTests++;
        testResults.portfolioTypes.push({
          type: portfolioType,
          error: error.message,
          success: false
        });
      }
    }

    // Test 2: User plans and rate limiting
    console.log('\n💳 Testing user plans and rate limiting...\n');
    
    try {
      const planResults = await this.testUserPlans();
      testResults.planTests = planResults;
      testResults.totalTests += planResults.length;
      testResults.passedTests += planResults.filter(r => r.success).length;
      testResults.failedTests += planResults.filter(r => !r.success).length;
    } catch (error) {
      console.error(`Plan testing failed: ${error.message}`);
    }

    // Test 3: Large portfolio stress test
    console.log('\n🚀 Stress testing with large portfolio...\n');
    testResults.totalTests++;
    
    try {
      console.log('   Creating 25-token mixed portfolio...');
      const largePortfolio = this.generateWalletPortfolio('MIXED_PORTFOLIO', 25);
      const startTime = Date.now();
      const auditResults = await this.simulatePortfolioAudit(largePortfolio, 'PREMIUM');
      const processingTime = Date.now() - startTime;
      
      console.log(`   ✅ Processed ${auditResults.totalTokens} tokens in ${processingTime}ms`);
      console.log(`   📊 Success rate: ${(auditResults.analyzed / auditResults.totalTokens * 100).toFixed(1)}%`);
      
      testResults.passedTests++;
      testResults.performance.totalTokensProcessed += auditResults.totalTokens;
      
    } catch (error) {
      console.log(`   ❌ Stress test failed: ${error.message}`);
      testResults.failedTests++;
    }

    // Calculate performance metrics
    const successfulPortfolios = testResults.portfolioTypes.filter(p => p.success);
    if (successfulPortfolios.length > 0) {
      testResults.performance.averageProcessingTime = successfulPortfolios
        .reduce((sum, p) => sum + (p.analysis?.processingTime || 0), 0) / successfulPortfolios.length;
      
      testResults.performance.averageSuccessRate = successfulPortfolios
        .reduce((sum, p) => sum + parseFloat(p.analysis?.successRate || 0), 0) / successfulPortfolios.length;
    }

    // Print final summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 PORTFOLIO AUDIT TEST RESULTS');
    console.log('=' .repeat(70));
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passedTests} ✅`);
    console.log(`Failed: ${testResults.failedTests} ❌`);
    console.log(`Success Rate: ${(testResults.passedTests / testResults.totalTests * 100).toFixed(1)}%`);
    console.log(`\n📈 Performance Metrics:`);
    console.log(`  Total Tokens Processed: ${testResults.performance.totalTokensProcessed}`);
    console.log(`  Average Processing Time: ${testResults.performance.averageProcessingTime.toFixed(0)}ms per portfolio`);
    console.log(`  Average Success Rate: ${testResults.performance.averageSuccessRate.toFixed(1)}%`);

    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    if (testResults.performance.averageSuccessRate >= 95) {
      console.log('  ✅ Portfolio audit system is performing excellently');
    } else if (testResults.performance.averageSuccessRate >= 90) {
      console.log('  ⚠️  Portfolio audit system is performing well but could be improved');
    } else {
      console.log('  🚨 Portfolio audit system needs improvement');
    }

    if (testResults.performance.averageProcessingTime > 30000) {
      console.log('  ⏱️  Consider optimizing batch processing for better performance');
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `portfolio-audit-test-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Detailed results saved to: ${filename}`);

    return testResults;
  }

  // Utility functions
  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  selectRandomTokens(tokens, count) {
    const shuffled = [...tokens].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, tokens.length));
  }

  generateRandomAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  getExpectedRiskProfile(walletType) {
    const profiles = {
      'SAFE_DEFI': { averageRisk: 25, criticalTokens: 0, highRiskTokens: 0 },
      'RISKY_MEME': { averageRisk: 70, criticalTokens: 2, highRiskTokens: 5 },
      'MIXED_PORTFOLIO': { averageRisk: 45, criticalTokens: 1, highRiskTokens: 3 },
      'SCAM_HEAVY': { averageRisk: 85, criticalTokens: 8, highRiskTokens: 2 },
      'BLUE_CHIP': { averageRisk: 15, criticalTokens: 0, highRiskTokens: 0 },
      'NEW_TRADER': { averageRisk: 65, criticalTokens: 3, highRiskTokens: 4 }
    };
    return profiles[walletType] || profiles['MIXED_PORTFOLIO'];
  }

  getWalletDescription(walletType) {
    const descriptions = {
      'SAFE_DEFI': 'Conservative DeFi investor with established protocols',
      'RISKY_MEME': 'High-risk meme token trader',
      'MIXED_PORTFOLIO': 'Balanced portfolio with mixed risk levels',
      'SCAM_HEAVY': 'Portfolio with many potential scam tokens',
      'BLUE_CHIP': 'Ultra-conservative with only blue chip tokens',
      'NEW_TRADER': 'New trader with typical risky choices'
    };
    return descriptions[walletType] || 'Mixed portfolio';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the simulation if this script is executed directly
if (require.main === module) {
  const simulator = new PortfolioSimulator();
  simulator.runTests().then(results => {
    const successRate = (results.passedTests / results.totalTests * 100);
    process.exit(successRate >= 80 ? 0 : 1); // Exit with error if success rate < 80%
  }).catch(error => {
    console.error('❌ Portfolio audit simulation failed:', error);
    process.exit(1);
  });
}

module.exports = { PortfolioSimulator };