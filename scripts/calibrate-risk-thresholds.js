#!/usr/bin/env node

/**
 * Risk Algorithm Calibration Script
 * 
 * This script helps calibrate the risk thresholds and weights
 * based on the simulation results to improve accuracy.
 */

const { TokenSimulator } = require('./test-risk-algorithm-simulation');

class RiskCalibrator extends TokenSimulator {
  constructor() {
    super();
    this.calibrationResults = [];
  }

  /**
   * Test different threshold configurations
   */
  async testThresholdConfiguration(config) {
    const {
      lowThreshold = 30,
      mediumThreshold = 60,
      highThreshold = 80,
      criticalPenalties = {
        honeypot: 25,
        extremeTax: 20,
        rugPull: 15,
        freezeAuthority: 10,
        mintAuthority: 10
      },
      memePenalty = 15
    } = config;

    console.log(`\n🔧 Testing configuration:`, {
      thresholds: `LOW≤${lowThreshold}, MEDIUM≤${mediumThreshold}, HIGH≤${highThreshold}, CRITICAL>${highThreshold}`,
      criticalPenalties,
      memePenalty
    });

    const testTokens = this.generateTestSuite();
    let correct = 0;
    let total = 0;

    for (const token of testTokens) {
      const result = await this.simulateWithConfig(token, config);
      const expected = token._expectedRisk;
      const actual = result.risk_level;
      
      if (actual === expected) correct++;
      total++;
    }

    const accuracy = (correct / total * 100).toFixed(1);
    console.log(`   📊 Accuracy: ${accuracy}% (${correct}/${total})`);

    return {
      config,
      accuracy: parseFloat(accuracy),
      correct,
      total
    };
  }

  /**
   * Simulate risk calculation with custom configuration
   */
  async simulateWithConfig(tokenData, config) {
    const {
      lowThreshold = 30,
      mediumThreshold = 60,
      highThreshold = 80,
      criticalPenalties = {},
      memePenalty = 15
    } = config;

    let riskScore = 0;
    const breakdown = {};
    const criticalFlags = [];

    // Calculate base risk factors (same as original)
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

    // Apply critical penalties with custom values
    if (tokenData.is_honeypot) {
      criticalFlags.push('Honeypot detected');
      riskScore += criticalPenalties.honeypot || 25;
    }
    if (tokenData.sell_tax > 0.90) {
      criticalFlags.push('Extreme sell tax (>90%)');
      riskScore += criticalPenalties.extremeTax || 20;
    }
    if (tokenData.lp_in_owner_wallet) {
      criticalFlags.push('LP tokens in owner wallet');
      riskScore += criticalPenalties.rugPull || 15;
    }
    if (tokenData.freeze_authority_exists) {
      criticalFlags.push('Freeze authority exists');
      riskScore += criticalPenalties.freezeAuthority || 10;
    }
    if (tokenData.mint_authority_exists) {
      criticalFlags.push('Mint authority exists');
      riskScore += criticalPenalties.mintAuthority || 10;
    }

    // Meme penalty
    if (tokenData._isMeme) {
      riskScore += memePenalty;
    }

    // Cap score
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Apply custom thresholds
    let riskLevel;
    if (riskScore <= lowThreshold) riskLevel = 'LOW';
    else if (riskScore <= mediumThreshold) riskLevel = 'MEDIUM';
    else if (riskScore <= highThreshold) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    return {
      overall_risk_score: Math.round(riskScore),
      risk_level: riskLevel,
      critical_flags: criticalFlags,
      breakdown
    };
  }

  /**
   * Run comprehensive calibration tests
   */
  async runCalibration() {
    console.log('🎯 Starting Risk Algorithm Calibration\n');
    console.log('=' .repeat(60));

    const configurations = [
      // Current configuration (baseline)
      {
        name: 'Current (Baseline)',
        lowThreshold: 30,
        mediumThreshold: 60,
        highThreshold: 80,
        criticalPenalties: { honeypot: 25, extremeTax: 20, rugPull: 15, freezeAuthority: 10, mintAuthority: 10 },
        memePenalty: 15
      },
      
      // More aggressive thresholds
      {
        name: 'Aggressive Thresholds',
        lowThreshold: 25,
        mediumThreshold: 50,
        highThreshold: 75,
        criticalPenalties: { honeypot: 30, extremeTax: 25, rugPull: 20, freezeAuthority: 15, mintAuthority: 15 },
        memePenalty: 20
      },
      
      // Conservative thresholds (match observed behavior)
      {
        name: 'Conservative (Observed)',
        lowThreshold: 30,
        mediumThreshold: 60,
        highThreshold: 85, // Raised to match observed behavior
        criticalPenalties: { honeypot: 20, extremeTax: 15, rugPull: 12, freezeAuthority: 8, mintAuthority: 8 },
        memePenalty: 15
      },
      
      // High penalty for critical flags
      {
        name: 'High Critical Penalties',
        lowThreshold: 30,
        mediumThreshold: 60,
        highThreshold: 80,
        criticalPenalties: { honeypot: 40, extremeTax: 35, rugPull: 25, freezeAuthority: 20, mintAuthority: 20 },
        memePenalty: 15
      },
      
      // Optimized based on failure patterns
      {
        name: 'Optimized',
        lowThreshold: 30,
        mediumThreshold: 55,
        highThreshold: 78,
        criticalPenalties: { honeypot: 35, extremeTax: 30, rugPull: 20, freezeAuthority: 12, mintAuthority: 12 },
        memePenalty: 18
      }
    ];

    const results = [];

    for (const config of configurations) {
      console.log(`\n🧪 Testing: ${config.name}`);
      const result = await this.testThresholdConfiguration(config);
      results.push(result);
    }

    // Find best configuration
    const bestConfig = results.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );

    console.log('\n' + '=' .repeat(60));
    console.log('🏆 CALIBRATION RESULTS');
    console.log('=' .repeat(60));

    results.forEach((result, index) => {
      const isBest = result === bestConfig;
      const marker = isBest ? '🥇' : '  ';
      console.log(`${marker} ${configurations[index].name}: ${result.accuracy}% accuracy`);
    });

    console.log(`\n🎯 RECOMMENDED CONFIGURATION:`);
    console.log(`   Name: ${configurations[results.indexOf(bestConfig)].name}`);
    console.log(`   Accuracy: ${bestConfig.accuracy}%`);
    console.log(`   Thresholds: LOW≤${bestConfig.config.lowThreshold}, MEDIUM≤${bestConfig.config.mediumThreshold}, HIGH≤${bestConfig.config.highThreshold}`);
    console.log(`   Critical Penalties:`, bestConfig.config.criticalPenalties);
    console.log(`   Meme Penalty: ${bestConfig.config.memePenalty}`);

    // Generate code snippet for implementation
    console.log(`\n💻 IMPLEMENTATION CODE:`);
    console.log(`
// Updated risk level thresholds
if (riskScore <= ${bestConfig.config.lowThreshold}) riskLevel = 'LOW';
else if (riskScore <= ${bestConfig.config.mediumThreshold}) riskLevel = 'MEDIUM';
else if (riskScore <= ${bestConfig.config.highThreshold}) riskLevel = 'HIGH';
else riskLevel = 'CRITICAL';

// Updated critical penalties
if (tokenData.is_honeypot) riskScore += ${bestConfig.config.criticalPenalties.honeypot};
if (tokenData.sell_tax > 0.90) riskScore += ${bestConfig.config.criticalPenalties.extremeTax};
if (tokenData.lp_in_owner_wallet) riskScore += ${bestConfig.config.criticalPenalties.rugPull};
if (tokenData.freeze_authority_exists) riskScore += ${bestConfig.config.criticalPenalties.freezeAuthority};
if (tokenData.mint_authority_exists) riskScore += ${bestConfig.config.criticalPenalties.mintAuthority};

// Updated meme penalty
if (isMemeToken) riskScore += ${bestConfig.config.memePenalty};
    `);

    // Save calibration results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `risk-calibration-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      bestConfiguration: bestConfig,
      allResults: results.map((r, i) => ({
        name: configurations[i].name,
        ...r
      })),
      recommendations: {
        thresholds: {
          low: bestConfig.config.lowThreshold,
          medium: bestConfig.config.mediumThreshold,
          high: bestConfig.config.highThreshold
        },
        penalties: bestConfig.config.criticalPenalties,
        memePenalty: bestConfig.config.memePenalty
      }
    }, null, 2));

    console.log(`\n💾 Calibration results saved to: ${filename}`);

    return bestConfig;
  }

  /**
   * Test specific problematic cases
   */
  async testProblematicCases() {
    console.log('\n🔍 TESTING PROBLEMATIC CASES');
    console.log('=' .repeat(40));

    // Create extreme test cases that should definitely be CRITICAL
    const extremeCases = [
      {
        name: 'Perfect Honeypot',
        ...this.generateRiskyToken('PerfectTrap', 'TRAP', 'ethereum', 'HONEYPOT'),
        sell_tax: 0.99, // 99% sell tax
        buy_tax: 0,
        is_honeypot: true,
        lp_in_owner_wallet: true,
        freeze_authority_exists: true,
        mint_authority_exists: true,
        owner_renounced: false,
        _expectedRisk: 'CRITICAL'
      },
      
      {
        name: 'Obvious Rug Pull',
        ...this.generateRiskyToken('ObviousRug', 'RUG', 'ethereum', 'RUG_PULL'),
        lp_in_owner_wallet: true,
        creator_balance: 0.95, // 95% owned by creator
        top10HoldersPct: 0.98, // 98% concentration
        liquidity1hAgo: 10000000,
        liquidityUSD: 100000, // Liquidity dropped 99%
        _expectedRisk: 'CRITICAL'
      }
    ];

    for (const testCase of extremeCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      const result = await this.simulateRiskCalculation(testCase);
      
      const success = result.risk_level === testCase._expectedRisk;
      const marker = success ? '✅' : '❌';
      
      console.log(`   ${marker} Expected: ${testCase._expectedRisk}, Got: ${result.risk_level} (Score: ${result.overall_risk_score})`);
      console.log(`   🚩 Critical Flags: ${result.critical_flags.join(', ')}`);
      
      if (!success) {
        console.log(`   💡 Suggestion: Increase penalties for detected flags`);
      }
    }
  }
}

// Run calibration if this script is executed directly
if (require.main === module) {
  const calibrator = new RiskCalibrator();
  
  calibrator.runCalibration()
    .then(() => calibrator.testProblematicCases())
    .then(() => {
      console.log('\n🎉 Calibration complete! Use the recommended configuration to improve accuracy.');
    })
    .catch(error => {
      console.error('❌ Calibration failed:', error);
      process.exit(1);
    });
}

module.exports = { RiskCalibrator };