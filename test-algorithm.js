/**
 * Quick Algorithm Test Script
 * Tests the enhanced risk calculator with UNI token
 */

const UNI_TOKEN = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const CHAIN_ID = '1'; // Ethereum

async function testAlgorithm() {
  console.log('🧪 Testing Enhanced Risk Algorithm');
  console.log('=' .repeat(60));
  console.log(`Token: ${UNI_TOKEN}`);
  console.log(`Chain: Ethereum (${CHAIN_ID})`);
  console.log('=' .repeat(60));
  console.log('');

  try {
    const response = await fetch(
      `http://localhost:3000/api/analyze-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenAddress: UNI_TOKEN,
          chainId: CHAIN_ID,
          plan: 'FREE',
          userId: 'test-user'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('📊 RISK ANALYSIS RESULTS:');
    console.log('─'.repeat(60));
    console.log(`Overall Risk Score: ${result.overall_risk_score}/100`);
    console.log(`Risk Level: ${result.risk_level}`);
    console.log(`Confidence: ${result.confidence_score}%`);
    console.log(`Data Tier: ${result.data_tier}`);
    console.log(`Data Freshness: ${(result.data_freshness * 100).toFixed(1)}%`);
    console.log('');

    console.log('🔍 FACTOR BREAKDOWN:');
    console.log('─'.repeat(60));
    Object.entries(result.breakdown || {}).forEach(([factor, score]) => {
      const bar = '█'.repeat(Math.round(score / 5));
      const spaces = ' '.repeat(20 - Math.round(score / 5));
      console.log(`${factor.padEnd(25)} ${score.toString().padStart(3)}/100 ${bar}${spaces}`);
    });
    console.log('');

    if (result.critical_flags && result.critical_flags.length > 0) {
      console.log('🚨 CRITICAL FLAGS:');
      console.log('─'.repeat(60));
      result.critical_flags.forEach(flag => console.log(`  ${flag}`));
      console.log('');
    }

    if (result.warning_flags && result.warning_flags.length > 0) {
      console.log('⚠️  WARNING FLAGS:');
      console.log('─'.repeat(60));
      result.warning_flags.forEach(flag => console.log(`  ${flag}`));
      console.log('');
    }

    if (result.positive_signals && result.positive_signals.length > 0) {
      console.log('✅ POSITIVE SIGNALS:');
      console.log('─'.repeat(60));
      result.positive_signals.forEach(flag => console.log(`  ${flag}`));
      console.log('');
    }

    console.log('📈 ASSESSMENT:');
    console.log('─'.repeat(60));
    if (result.overall_risk_score >= 75) {
      console.log('🔴 CRITICAL RISK - Avoid this token');
    } else if (result.overall_risk_score >= 50) {
      console.log('🟠 HIGH RISK - Exercise extreme caution');
    } else if (result.overall_risk_score >= 30) {
      console.log('🟡 MEDIUM RISK - Due diligence required');
    } else {
      console.log('🟢 LOW RISK - Relatively safe investment');
    }
    console.log('');

    console.log('✅ TEST COMPLETE');
    console.log('=' .repeat(60));

    // Verify the cache fix worked
    console.log('');
    console.log('🔧 CACHE FIX VERIFICATION:');
    console.log('─'.repeat(60));
    if (result.overall_risk_score < 75 && result.overall_risk_score > 30) {
      console.log('✅ Cache fix SUCCESS - Score is dynamic (not stuck at 75)');
    } else if (result.overall_risk_score === 75) {
      console.log('❌ Cache fix FAILED - Score still stuck at 75');
      console.log('   Check terminal logs for holder_count extraction');
    } else if (result.overall_risk_score < 30) {
      console.log('✅ Cache fix SUCCESS - Score is LOW (algorithm working)');
    } else {
      console.log('⚠️  Unexpected score - Review algorithm logic');
    }

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Is the dev server running? (pnpm dev)');
    console.error('2. Is it accessible at http://localhost:3000?');
    console.error('3. Check the server terminal for errors');
  }
}

// Run the test
testAlgorithm();
