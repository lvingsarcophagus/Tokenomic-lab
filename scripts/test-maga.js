/**
 * Test MAGA Token with Enhanced Risk Calculator
 * 
 * Expected Results:
 * - AI should detect as MEME token
 * - Risk score should be 50-60 (meme baseline applied)
 * - Twitter metrics should be fetched if available
 * - MEME_WEIGHTS profile should be used
 */

require('dotenv').config({ path: '.env.local' });

// Import the risk calculator (we'll use the API endpoint instead)
const MAGA_CONTRACT = '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7'; // MAGA token on Ethereum

async function testMAGA() {
  console.log('🧪 Testing MAGA Token with Enhanced Risk Calculator\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    // Call the analyze-token API
    const response = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokenAddress: MAGA_CONTRACT,
        chainId: '1', // Ethereum mainnet
        userId: 'test-user',
        plan: 'PREMIUM',
        metadata: {
          tokenSymbol: 'MAGA',
          tokenName: 'MAGA Token',
          tokenDescription: 'Make America Great Again token',
          twitterHandle: '@MAGACoinBSC',
          chain: 'EVM'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('📊 MAGA TOKEN ANALYSIS RESULTS\n');
    console.log('─────────────────────────────────────────────────\n');
    
    // Overall Score
    console.log(`🎯 Overall Risk Score: ${result.overall_risk_score}/100`);
    console.log(`🚨 Risk Level: ${result.risk_level}`);
    console.log(`📈 Confidence: ${result.confidence_score}%\n`);
    
    // Meme Detection
    if (result.detailed_insights) {
      const memeInsight = result.detailed_insights.find(i => i.includes('AI Classification'));
      if (memeInsight) {
        console.log(`🤖 ${memeInsight}\n`);
      }
    }
    
    // Factor Breakdown
    console.log('📐 Factor Breakdown:');
    if (result.breakdown) {
      Object.entries(result.breakdown).forEach(([factor, score]) => {
        const bars = '█'.repeat(Math.floor(score / 5));
        const spaces = '░'.repeat(20 - Math.floor(score / 5));
        console.log(`   ${factor.padEnd(25)} ${bars}${spaces} ${score}`);
      });
    }
    console.log('');
    
    // Critical Flags
    if (result.critical_flags && result.critical_flags.length > 0) {
      console.log('⚠️  Critical Flags:');
      result.critical_flags.forEach(flag => {
        console.log(`   ${flag}`);
      });
      console.log('');
    }
    
    // Detailed Insights
    if (result.detailed_insights && result.detailed_insights.length > 0) {
      console.log('💡 Detailed Insights:');
      result.detailed_insights.forEach(insight => {
        console.log(`   ${insight}`);
      });
      console.log('');
    }
    
    // Data Sources
    console.log('📡 Data Sources:');
    result.data_sources.forEach(source => {
      console.log(`   ✓ ${source}`);
    });
    console.log('');
    
    // Validation
    console.log('═══════════════════════════════════════════════════\n');
    console.log('✅ VALIDATION CHECKLIST:\n');
    
    const isMeme = result.detailed_insights?.some(i => 
      i.includes('MEME TOKEN') || i.includes('Meme Baseline')
    );
    console.log(`   ${isMeme ? '✅' : '❌'} AI detected as MEME token`);
    
    const hasBaseline = result.detailed_insights?.some(i => 
      i.includes('Meme Baseline Applied')
    );
    console.log(`   ${hasBaseline ? '✅' : '❌'} Meme baseline (55) applied`);
    
    const scoreInRange = result.overall_risk_score >= 50 && result.overall_risk_score <= 70;
    console.log(`   ${scoreInRange ? '✅' : '❌'} Risk score in expected range (50-70): ${result.overall_risk_score}`);
    
    const hasTwitter = result.detailed_insights?.some(i => 
      i.includes('Twitter Metrics')
    );
    console.log(`   ${hasTwitter ? '✅' : '⚠️ '} Twitter metrics ${hasTwitter ? 'included' : 'not available'}`);
    
    console.log('\n');
    
    // Success/Failure
    if (isMeme && hasBaseline && scoreInRange) {
      console.log('🎉 TEST PASSED: All validations successful!\n');
    } else {
      console.log('⚠️  TEST INCOMPLETE: Some validations failed\n');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. Dev server is running (pnpm dev)');
    console.error('2. API keys are configured in .env.local');
    console.error('3. MAGA token contract is correct\n');
  }
}

// Run the test
testMAGA();
