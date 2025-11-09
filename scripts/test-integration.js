/**
 * Quick Test - Enhanced Algorithm Integration
 */

console.log('\n🚀 Testing Enhanced Risk Calculator Integration\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Simulate API call to test endpoint
const testTokenScan = async () => {
  const API_URL = 'http://localhost:3000/api/analyze-token'
  
  // Test 1: WETH (should use fallback)
  console.log('📊 Test 1: Scanning WETH (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)\n')
  
  const testPayload = {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chainId: '1',
    userId: 'test-user',
    plan: 'FREE'
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    })
    
    const result = await response.json()
    
    console.log('✅ API Response Received\n')
    console.log(`Risk Score: ${result.overall_risk_score}/100`)
    console.log(`Risk Level: ${result.risk_level}`)
    console.log(`Confidence: ${result.confidence_score}%`)
    console.log(`Data Tier: ${result.data_tier || 'N/A'}`)
    console.log(`Data Freshness: ${result.data_freshness ? Math.round(result.data_freshness * 100) + '%' : 'N/A'}`)
    
    console.log('\n📋 Factor Breakdown:')
    if (result.breakdown) {
      Object.entries(result.breakdown).forEach(([factor, score]) => {
        console.log(`  ${factor}: ${score}`)
      })
    }
    
    console.log('\n🚨 Critical Flags:', result.critical_flags?.length || 0)
    if (result.critical_flags?.length > 0) {
      result.critical_flags.forEach(flag => console.log(`  ${flag}`))
    }
    
    console.log('\n⚠️  Warning Flags:', result.warning_flags?.length || 0)
    if (result.warning_flags?.length > 0 && result.warning_flags.length <= 5) {
      result.warning_flags.forEach(flag => console.log(`  ${flag}`))
    }
    
    console.log('\n✅ Positive Signals:', result.positive_signals?.length || 0)
    if (result.positive_signals?.length > 0) {
      result.positive_signals.forEach(signal => console.log(`  ${signal}`))
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Integration Test Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n⚠️  Make sure the dev server is running:')
    console.log('   npm run dev\n')
  }
}

// Run test if server is available
console.log('ℹ️  This test requires the Next.js dev server to be running.\n')
console.log('   Start server: npm run dev')
console.log('   Then run: node scripts/test-integration.js\n')

// Uncomment to run automatically:
// testTokenScan()

module.exports = { testTokenScan }
