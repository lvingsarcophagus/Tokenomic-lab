/**
 * Test script to verify the enhanced risk algorithm is working
 * Run with: node scripts/test-risk-algorithm.js
 */

// Sample token data for testing different scenarios
const testTokens = [
  {
    name: "High Risk Token",
    data: {
      contractAddress: "0x1234567890123456789012345678901234567890",
      holderAnalysis: {
        top10HolderPercent: 85, // Very concentrated
        holderCount: 50 // Few holders
      },
      liquidityPools: [
        { liquidity: 10000 } // Low liquidity
      ],
      priceData: {
        marketCap: 50000, // Small cap
        volume24h: 1000, // Low volume
        priceChange24h: -50 // Big drop
      },
      contractInfo: {
        isOpenSource: false,
        isProxy: true,
        canMint: true,
        hasPausable: true
      },
      securityData: {
        is_honeypot: true,
        honeypot_result: { honeypot_reason: "Cannot sell" }
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days old
    }
  },
  {
    name: "Medium Risk Token",
    data: {
      contractAddress: "0x2345678901234567890123456789012345678901",
      holderAnalysis: {
        top10HolderPercent: 45, // Moderate concentration
        holderCount: 1000
      },
      liquidityPools: [
        { liquidity: 500000 }
      ],
      priceData: {
        marketCap: 5000000,
        volume24h: 100000,
        priceChange24h: 5
      },
      contractInfo: {
        isOpenSource: true,
        isProxy: false,
        canMint: false
      },
      securityData: {},
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days old
    }
  },
  {
    name: "Low Risk Token (Large Cap)",
    data: {
      contractAddress: "0x3456789012345678901234567890123456789012",
      holderAnalysis: {
        top10HolderPercent: 25, // Well distributed
        holderCount: 100000
      },
      liquidityPools: [
        { liquidity: 50000000 }
      ],
      priceData: {
        marketCap: 60000000000, // >$50B - should get massive discount
        volume24h: 1000000000,
        priceChange24h: 2
      },
      contractInfo: {
        isOpenSource: true,
        isProxy: false,
        canMint: false
      },
      securityData: {},
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year old
    }
  }
];

// Import the enhanced calculator
async function testAlgorithm() {
  try {
    console.log('🧪 Testing Enhanced Risk Algorithm\n');
    console.log('=' .repeat(60));

    // Dynamic import since we're using ES modules
    const { calculateTokenRisk } = await import('../lib/risk-algorithms/enhanced-risk-calculator.ts');

    for (const testToken of testTokens) {
      console.log(`\n📊 Testing: ${testToken.name}`);
      console.log('-'.repeat(60));

      try {
        const result = await calculateTokenRisk(testToken.data);

        console.log(`\n✅ RESULTS:`);
        console.log(`   Overall Risk Score: ${result.overall_risk_score}`);
        console.log(`   Confidence Score: ${result.confidence_score}%`);
        console.log(`   Data Tier: ${result.data_tier}`);
        console.log(`   Data Freshness: ${(result.data_freshness * 100).toFixed(0)}%`);
        
        console.log(`\n   Risk Breakdown:`);
        console.log(`   - Contract Security: ${result.breakdown.contractControl}/15`);
        console.log(`   - Supply Risk: ${result.breakdown.supplyDilution}/15`);
        console.log(`   - Concentration: ${result.breakdown.holderConcentration}/15`);
        console.log(`   - Liquidity: ${result.breakdown.liquidityDepth}/15`);
        console.log(`   - Market Activity: ${result.breakdown.adoption}/15`);
        console.log(`   - Burn Mechanics: ${result.breakdown.burnDeflation}/15`);
        console.log(`   - Token Age: ${result.breakdown.auditTransparency}/15`);

        if (result.warning_flags?.length > 0) {
          console.log(`\n   ⚠️  Warning Flags: ${result.warning_flags.join(', ')}`);
        }
        if (result.critical_flags?.length > 0) {
          console.log(`   🚨 Critical Flags: ${result.critical_flags.join(', ')}`);
        }
        if (result.positive_signals?.length > 0) {
          console.log(`   ✨ Positive Signals: ${result.positive_signals.join(', ')}`);
        }

      } catch (error) {
        console.error(`❌ Error calculating risk:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Algorithm test complete!\n');

  } catch (error) {
    console.error('❌ Failed to import algorithm:', error);
    console.error('\nMake sure you have ts-node installed:');
    console.error('npm install -D ts-node tsx');
  }
}

testAlgorithm();
