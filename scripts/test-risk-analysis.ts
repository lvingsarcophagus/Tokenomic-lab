/**
 * Multi-Token Risk Analysis Test
 * Tests the complete risk analysis system with various tokens
 */

const TEST_TOKENS = [
  {
    name: 'Uniswap (UNI)',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    chain: 'ethereum',
    chainId: 1,
    expectedRisk: 'LOW',
    description: 'Major DEX token, should have low risk'
  },
  {
    name: 'Chainlink (LINK)',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    chain: 'ethereum',
    chainId: 1,
    expectedRisk: 'LOW',
    description: 'Oracle network token, established project'
  },
  {
    name: 'Shiba Inu (SHIB)',
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    chain: 'ethereum',
    chainId: 1,
    expectedRisk: 'MEDIUM',
    description: 'Meme coin with high volatility'
  },
  {
    name: 'Wrapped SOL (Wormhole)',
    address: '0xd31a59c85ae9d8edefec411d448f90841571b89c',
    chain: 'ethereum',
    chainId: 1,
    expectedRisk: 'LOW-MEDIUM',
    description: 'Wrapped Solana token'
  },
  {
    name: 'Tether USD (USDT)',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    chain: 'ethereum',
    chainId: 1,
    expectedRisk: 'LOW',
    description: 'Stablecoin, should be very low risk'
  }
]

async function testToken(token: typeof TEST_TOKENS[0]) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Testing: ${token.name}`)
  console.log(`Address: ${token.address}`)
  console.log(`Chain: ${token.chain} (${token.chainId})`)
  console.log(`Expected: ${token.expectedRisk}`)
  console.log(`Description: ${token.description}`)
  console.log('='.repeat(80))

  const startTime = Date.now()

  try {
    // Test the full analyze-token API (5-API orchestration)
    console.log('\n📡 Calling /api/analyze-token (Full 5-API Analysis)...')
    const response = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: token.address,
        chainId: token.chainId
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const duration = Date.now() - startTime

    console.log(`\n✅ Analysis Complete in ${duration}ms`)
    console.log('\n📊 RESULTS:')
    console.log('─'.repeat(80))

    // Overall Results
    console.log(`\n🎯 Overall Risk Score: ${data.overall_risk_score}/100`)
    console.log(`📈 Risk Level: ${data.risk_level}`)
    console.log(`🎖️  Confidence: ${data.confidence_score}%`)
    console.log(`📡 Data Tier: ${data.data_tier}`)

    // Risk Breakdown
    if (data.breakdown) {
      console.log('\n📋 Risk Breakdown:')
      Object.entries(data.breakdown).forEach(([factor, score]: [string, any]) => {
        const emoji = score < 30 ? '🟢' : score < 60 ? '🟡' : '🔴'
        console.log(`  ${emoji} ${factor}: ${score}/100`)
      })
    }

    // Security Flags
    if (data.critical_flags && data.critical_flags.length > 0) {
      console.log('\n🚨 Critical Flags:')
      data.critical_flags.forEach((flag: string) => console.log(`  • ${flag}`))
    }

    if (data.red_flags && data.red_flags.length > 0) {
      console.log('\n⚠️  Red Flags:')
      data.red_flags.forEach((flag: string) => console.log(`  • ${flag}`))
    }

    if (data.positive_signals && data.positive_signals.length > 0) {
      console.log('\n✅ Positive Signals:')
      data.positive_signals.forEach((signal: string) => console.log(`  • ${signal}`))
    }

    // Behavioral Analysis
    if (data.behavioral_analysis) {
      console.log('\n🧠 Behavioral Analysis:')
      const behavioral = data.behavioral_analysis
      if (behavioral.holder_velocity !== undefined) {
        console.log(`  📈 Holder Velocity: ${behavioral.holder_velocity > 0 ? '+' : ''}${behavioral.holder_velocity}%`)
      }
      if (behavioral.wash_trading !== undefined) {
        console.log(`  🔄 Wash Trading: ${behavioral.wash_trading ? '⚠️  DETECTED' : '✅ None'}`)
      }
      if (behavioral.smart_money !== undefined) {
        console.log(`  🎓 Smart Money: ${behavioral.smart_money ? '✅ Active' : '❌ None'}`)
      }
      if (behavioral.liquidity_stability !== undefined) {
        console.log(`  💧 Liquidity Stability: ${behavioral.liquidity_stability}%`)
      }
    }

    // Token Info
    if (data.token_info) {
      console.log('\n📄 Token Information:')
      console.log(`  Name: ${data.token_info.name || 'N/A'}`)
      console.log(`  Symbol: ${data.token_info.symbol || 'N/A'}`)
      console.log(`  Chain: ${data.token_info.chain || 'N/A'}`)
      if (data.token_info.price) {
        console.log(`  Price: $${data.token_info.price.toFixed(6)}`)
      }
      if (data.token_info.market_cap) {
        console.log(`  Market Cap: $${(data.token_info.market_cap / 1e6).toFixed(2)}M`)
      }
      if (data.token_info.holder_count) {
        console.log(`  Holders: ${data.token_info.holder_count.toLocaleString()}`)
      }
    }

    // Upcoming Risks
    if (data.upcoming_risks) {
      console.log('\n🔮 Upcoming Risks (Next 30 Days):')
      console.log(`  Score: ${data.upcoming_risks.next_30_days}/100`)
      console.log(`  Forecast: ${data.upcoming_risks.forecast}`)
    }

    // Data Sources
    if (data.data_sources) {
      console.log('\n📡 Data Sources Used:')
      data.data_sources.forEach((source: string) => console.log(`  • ${source}`))
    }

    // Verdict
    console.log('\n' + '─'.repeat(80))
    const riskMatch = data.risk_level === token.expectedRisk || 
                      token.expectedRisk.includes(data.risk_level)
    console.log(`\n${riskMatch ? '✅' : '⚠️'} Expected: ${token.expectedRisk}, Got: ${data.risk_level}`)
    
    return {
      success: true,
      token: token.name,
      riskScore: data.overall_risk_score,
      riskLevel: data.risk_level,
      confidence: data.confidence_score,
      duration,
      match: riskMatch
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`\n❌ Error: ${error.message}`)
    
    return {
      success: false,
      token: token.name,
      error: error.message,
      duration
    }
  }
}

async function runTests() {
  console.log('🚀 TOKEN GUARD - MULTI-TOKEN RISK ANALYSIS TEST')
  console.log('='.repeat(80))
  console.log(`Testing ${TEST_TOKENS.length} tokens across different risk profiles`)
  console.log(`Start Time: ${new Date().toLocaleString()}`)

  const results = []

  for (const token of TEST_TOKENS) {
    const result = await testToken(token)
    results.push(result)
    
    // Wait 2 seconds between requests to avoid rate limits
    if (TEST_TOKENS.indexOf(token) < TEST_TOKENS.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(80))

  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const matched = results.filter(r => r.success && r.match).length

  console.log(`\n✅ Successful: ${successful}/${TEST_TOKENS.length}`)
  console.log(`❌ Failed: ${failed}/${TEST_TOKENS.length}`)
  console.log(`🎯 Risk Match: ${matched}/${successful}`)

  if (successful > 0) {
    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.duration || 0), 0) / successful
    console.log(`⚡ Avg Duration: ${avgDuration.toFixed(0)}ms`)

    const avgConfidence = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.confidence || 0), 0) / successful
    console.log(`🎖️  Avg Confidence: ${avgConfidence.toFixed(1)}%`)
  }

  console.log('\n📋 Individual Results:')
  results.forEach((result, index) => {
    if (result.success) {
      const matchIcon = result.match ? '✅' : '⚠️'
      console.log(`  ${matchIcon} ${result.token}: ${result.riskLevel} (${result.riskScore}/100) - ${result.confidence}% conf - ${result.duration}ms`)
    } else {
      console.log(`  ❌ ${result.token}: ${result.error}`)
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log(`End Time: ${new Date().toLocaleString()}`)
  console.log('='.repeat(80))
}

// Run tests
runTests().catch(console.error)
