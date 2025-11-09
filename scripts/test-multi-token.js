/**
 * Multi-Token Risk Analysis Test
 * Tests various tokens across different chains and risk levels
 */

const testTokens = [
  // Ethereum - Popular tokens
  {
    name: 'Uniswap (UNI)',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chain: 'ethereum',
    expectedRisk: 'LOW'
  },
  {
    name: 'Chainlink (LINK)',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    chain: 'ethereum',
    expectedRisk: 'LOW'
  },
  {
    name: 'Wrapped ETH (WETH)',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 'ethereum',
    expectedRisk: 'LOW'
  },
  
  // Ethereum - Stablecoins
  {
    name: 'USD Coin (USDC)',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 'ethereum',
    expectedRisk: 'LOW'
  },
  {
    name: 'Tether (USDT)',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chain: 'ethereum',
    expectedRisk: 'LOW'
  },
  
  // Ethereum - DeFi
  {
    name: 'Aave (AAVE)',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    chain: 'ethereum',
    expectedRisk: 'LOW-MEDIUM'
  },
  {
    name: 'Curve DAO (CRV)',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    chain: 'ethereum',
    expectedRisk: 'LOW-MEDIUM'
  },
  
  // BNB Chain tokens
  {
    name: 'PancakeSwap (CAKE)',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    chain: 'bsc',
    expectedRisk: 'MEDIUM'
  },
  
  // Known risky patterns (if you want to test)
  // Note: Be careful with these addresses as they may be actual scams
  {
    name: 'Test Low Cap Token',
    address: '0x0000000000000000000000000000000000000000', // Replace with actual test address
    chain: 'ethereum',
    expectedRisk: 'HIGH',
    skip: true // Skip by default
  }
]

async function analyzeToken(token) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🔍 ANALYZING: ${token.name}`)
  console.log(`📍 Address: ${token.address}`)
  console.log(`⛓️  Chain: ${token.chain}`)
  console.log(`📊 Expected Risk: ${token.expectedRisk}`)
  console.log('='.repeat(80))
  
  try {
    const startTime = Date.now()
    
    // Map chain names to chainIds
    const chainIdMap = {
      'ethereum': '1',
      'bsc': '56',
      'polygon': '137',
      'solana': '501',
      'cardano': '1815'
    }
    
    const chainId = chainIdMap[token.chain] || '1'
    
    // Call the analyze-token API with correct parameters
    const response = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress: token.address,
        chainId: chainId,
        plan: 'PREMIUM' // Use PREMIUM plan for full behavioral data
      })
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`Error details: ${errorText}`)
      return {
        success: false,
        token: token.name,
        error: `HTTP ${response.status}`
      }
    }
    
    const data = await response.json()
    
    console.log(`\n⏱️  Response Time: ${duration}ms`)
    
    // Check if we have valid data (the API returns result directly, no success field)
    if (data && (data.overall_risk_score !== undefined || data.error)) {
      if (data.error) {
        console.error(`❌ Analysis failed: ${data.error}`)
        return {
          success: false,
          token: token.name,
          error: data.error
        }
      }
      
      // The API returns the result directly
      const result = data
      
      console.log(`✅ Analysis Complete!`)
      console.log(`\n📈 RISK ANALYSIS RESULTS:`)
      console.log(`   Overall Risk Score: ${result.overall_risk_score}/100`)
      console.log(`   Risk Level: ${result.risk_level}`)
      console.log(`   Confidence: ${result.confidence_score}%`)
      console.log(`   Data Tier: ${result.data_tier || 'BASIC'}`)
      console.log(`   Data Freshness: ${result.data_freshness || 'N/A'}`)
      
      if (result.breakdown) {
        console.log(`\n📊 RISK BREAKDOWN:`)
        Object.entries(result.breakdown).forEach(([factor, score]) => {
          const bar = '█'.repeat(Math.floor(score / 5))
          console.log(`   ${factor.padEnd(25)} ${String(score).padStart(3)}/100 ${bar}`)
        })
      }
      
      if (result.critical_flags && result.critical_flags.length > 0) {
        console.log(`\n🚨 CRITICAL FLAGS:`)
        result.critical_flags.forEach(flag => console.log(`   - ${flag}`))
      }
      
      if (result.warning_flags && result.warning_flags.length > 0) {
        console.log(`\n⚠️  WARNING FLAGS:`)
        result.warning_flags.forEach(flag => console.log(`   - ${flag}`))
      }
      
      if (result.positive_signals && result.positive_signals.length > 0) {
        console.log(`\n✅ POSITIVE SIGNALS:`)
        result.positive_signals.forEach(signal => console.log(`   - ${signal}`))
      }
      
      // Check for behavioral data in response
      if (data.behavioralData || result.holderVelocity !== undefined) {
        const behavioral = data.behavioralData || result
        console.log(`\n🧠 BEHAVIORAL DATA:`)
        console.log(`   Holder Velocity: ${behavioral.holderVelocity || 'N/A'}`)
        console.log(`   Holder Change (7d): ${behavioral.holderChange7d || 'N/A'}`)
        console.log(`   Holder Change (30d): ${behavioral.holderChange30d || 'N/A'}`)
        console.log(`   Wash Trading: ${behavioral.washTradingScore > 0 ? `Detected (${behavioral.washTradingScore}/100) ⚠️` : 'Not detected ✓'}`)
        console.log(`   Smart Money: ${behavioral.smartMoneyPresence ? 'Present ✓' : 'Not detected'}`)
        console.log(`   Liquidity Stability: ${behavioral.liquidityStability || 'N/A'}`)
        console.log(`   Avg Holder Age: ${behavioral.averageHolderWalletAge || 'N/A'} days`)
      }
      
      // Check for market data
      if (result.price || result.market_cap || result.volume_24h) {
        console.log(`\n💰 MARKET DATA:`)
        console.log(`   Price: $${result.price || 'N/A'}`)
        console.log(`   Market Cap: $${result.market_cap?.toLocaleString() || 'N/A'}`)
        console.log(`   24h Volume: $${result.volume_24h?.toLocaleString() || 'N/A'}`)
        console.log(`   Liquidity: $${result.liquidity?.toLocaleString() || 'N/A'}`)
        console.log(`   Holders: ${result.holder_count?.toLocaleString() || 'N/A'}`)
      }
      
      // Compare with expected risk
      const expectedRisk = token.expectedRisk.split('-')[0] // Take first part if range
      const actualRisk = result.risk_level
      const riskMatch = actualRisk === expectedRisk || token.expectedRisk.includes(actualRisk)
      
      console.log(`\n🎯 EXPECTED vs ACTUAL:`)
      console.log(`   Expected: ${token.expectedRisk}`)
      console.log(`   Actual: ${actualRisk}`)
      console.log(`   Match: ${riskMatch ? '✓ YES' : '✗ NO (may need adjustment)'}`)
      
      return {
        success: true,
        token: token.name,
        address: token.address,
        riskScore: result.overall_risk_score,
        riskLevel: result.risk_level,
        expectedRisk: token.expectedRisk,
        matched: riskMatch,
        duration,
        confidence: result.confidence_score,
        dataTier: result.data_tier
      }
      
    } else {
      console.error(`❌ Unexpected response format`)
      console.log('Response:', JSON.stringify(data, null, 2))
      return {
        success: false,
        token: token.name,
        error: 'Unexpected response format'
      }
    }
    
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`)
    return {
      success: false,
      token: token.name,
      error: error.message
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Multi-Token Risk Analysis Test')
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log(`🔢 Total Tokens: ${testTokens.filter(t => !t.skip).length}`)
  console.log('\n')
  
  const results = []
  
  for (const token of testTokens) {
    if (token.skip) {
      console.log(`⏭️  Skipping: ${token.name}`)
      continue
    }
    
    const result = await analyzeToken(token)
    results.push(result)
    
    // Wait 2 seconds between requests to avoid rate limiting
    if (testTokens.indexOf(token) < testTokens.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Summary
  console.log('\n\n')
  console.log('='.repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(80))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const matched = results.filter(r => r.success && r.matched)
  
  console.log(`\n✅ Successful Analyses: ${successful.length}/${results.length}`)
  console.log(`❌ Failed Analyses: ${failed.length}/${results.length}`)
  console.log(`🎯 Risk Level Matches: ${matched.length}/${successful.length}`)
  
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length
    const avgConfidence = successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length
    
    console.log(`\n⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`)
    console.log(`📊 Average Confidence: ${avgConfidence.toFixed(1)}%`)
  }
  
  console.log(`\n📋 RESULTS TABLE:`)
  console.log('─'.repeat(80))
  console.log('Token'.padEnd(25) + 'Risk'.padEnd(15) + 'Expected'.padEnd(15) + 'Match'.padEnd(10) + 'Time')
  console.log('─'.repeat(80))
  
  results.forEach(r => {
    if (r.success) {
      const name = r.token.substring(0, 24).padEnd(25)
      const risk = r.riskLevel.padEnd(15)
      const expected = r.expectedRisk.padEnd(15)
      const match = (r.matched ? '✓' : '✗').padEnd(10)
      const time = `${r.duration}ms`
      console.log(name + risk + expected + match + time)
    } else {
      const name = r.token.substring(0, 24).padEnd(25)
      console.log(name + 'FAILED'.padEnd(15) + r.error)
    }
  })
  
  console.log('─'.repeat(80))
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED ANALYSES:`)
    failed.forEach(r => {
      console.log(`   - ${r.token}: ${r.error}`)
    })
  }
  
  console.log(`\n✨ Test completed!`)
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
