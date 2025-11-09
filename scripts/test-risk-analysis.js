/**
 * Multi-Token Risk Analysis Test
 * Run with: node scripts/test-risk-analysis.js
 */

const TEST_TOKENS = [
  {
    name: 'Uniswap (UNI)',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    chainId: 1,
    expectedRisk: 'LOW',
    description: 'Major DEX token'
  },
  {
    name: 'Chainlink (LINK)',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    chainId: 1,
    expectedRisk: 'LOW',
    description: 'Oracle network'
  },
  {
    name: 'Shiba Inu (SHIB)',
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    chainId: 1,
    expectedRisk: 'MEDIUM',
    description: 'Meme coin'
  },
  {
    name: 'Tether USD (USDT)',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    chainId: 1,
    expectedRisk: 'LOW',
    description: 'Stablecoin'
  }
]

async function testToken(token) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Testing: ${token.name}`)
  console.log(`Address: ${token.address}`)
  console.log(`Expected: ${token.expectedRisk}`)
  console.log('='.repeat(80))

  const startTime = Date.now()

  try {
    console.log('\n📡 Calling /api/analyze-token...')
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
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    const data = await response.json()
    const duration = Date.now() - startTime

    console.log(`\n✅ Complete in ${duration}ms`)
    console.log('\n📊 RESULTS:')
    console.log('─'.repeat(80))

    console.log(`🎯 Risk Score: ${data.overall_risk_score}/100`)
    console.log(`📈 Risk Level: ${data.risk_level}`)
    console.log(`🎖️  Confidence: ${data.confidence_score}%`)
    console.log(`📡 Data Tier: ${data.data_tier}`)

    if (data.breakdown) {
      console.log('\n📋 Risk Breakdown:')
      for (const [factor, score] of Object.entries(data.breakdown)) {
        const emoji = score < 30 ? '🟢' : score < 60 ? '🟡' : '🔴'
        console.log(`  ${emoji} ${factor}: ${score}/100`)
      }
    }

    if (data.critical_flags?.length > 0) {
      console.log('\n🚨 Critical Flags:')
      data.critical_flags.forEach(flag => console.log(`  • ${flag}`))
    }

    if (data.positive_signals?.length > 0) {
      console.log('\n✅ Positive Signals:')
      data.positive_signals.forEach(signal => console.log(`  • ${signal}`))
    }

    if (data.behavioral_analysis) {
      console.log('\n🧠 Behavioral Analysis:')
      const b = data.behavioral_analysis
      if (b.holder_velocity !== undefined) {
        console.log(`  📈 Holder Velocity: ${b.holder_velocity > 0 ? '+' : ''}${b.holder_velocity}%`)
      }
      if (b.wash_trading !== undefined) {
        console.log(`  🔄 Wash Trading: ${b.wash_trading ? '⚠️  DETECTED' : '✅ None'}`)
      }
      if (b.smart_money !== undefined) {
        console.log(`  🎓 Smart Money: ${b.smart_money ? '✅ Active' : '❌ None'}`)
      }
    }

    if (data.token_info) {
      console.log('\n📄 Token Info:')
      console.log(`  Name: ${data.token_info.name || 'N/A'}`)
      console.log(`  Symbol: ${data.token_info.symbol || 'N/A'}`)
      if (data.token_info.price) {
        console.log(`  Price: $${data.token_info.price.toFixed(6)}`)
      }
      if (data.token_info.holder_count) {
        console.log(`  Holders: ${data.token_info.holder_count.toLocaleString()}`)
      }
    }

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

  } catch (error) {
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
  console.log(`Testing ${TEST_TOKENS.length} tokens`)
  console.log(`Start: ${new Date().toLocaleString()}`)

  const results = []

  for (let i = 0; i < TEST_TOKENS.length; i++) {
    const result = await testToken(TEST_TOKENS[i])
    results.push(result)
    
    if (i < TEST_TOKENS.length - 1) {
      console.log('\n⏳ Waiting 2 seconds...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('📊 SUMMARY')
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
      .reduce((sum, r) => sum + r.duration, 0) / successful
    console.log(`⚡ Avg Duration: ${avgDuration.toFixed(0)}ms`)

    const avgConfidence = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.confidence, 0) / successful
    console.log(`🎖️  Avg Confidence: ${avgConfidence.toFixed(1)}%`)
  }

  console.log('\n📋 Results:')
  results.forEach(result => {
    if (result.success) {
      const icon = result.match ? '✅' : '⚠️'
      console.log(`  ${icon} ${result.token}: ${result.riskLevel} (${result.riskScore}/100) - ${result.duration}ms`)
    } else {
      console.log(`  ❌ ${result.token}: ${result.error}`)
    }
  })

  console.log('\n' + '='.repeat(80))
}

runTests().catch(console.error)
