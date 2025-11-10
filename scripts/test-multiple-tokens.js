/**
 * Test Multiple Tokens Across Different Chains
 * Tests various token types: meme, utility, established
 */

require('dotenv').config({ path: '.env.local' })

const tokens = [
  {
    name: 'MAGA (BSC)',
    address: '0x576e2BeD8F7b46D34016198911Cdc7b562352b01',
    chainId: 56,
    plan: 'PREMIUM',
    metadata: {
      tokenSymbol: 'MAGA',
      tokenName: 'MAGA',
      twitterHandle: '@MAGACoinBSC',
      chain: 'BSC'
    },
    expectedType: 'MEME',
    expectedRiskRange: [50, 70]
  },
  {
    name: 'WBNB (BSC)',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    chainId: 56,
    plan: 'PREMIUM',
    metadata: {
      tokenSymbol: 'WBNB',
      tokenName: 'Wrapped BNB',
      twitterHandle: '@BNBCHAIN',
      chain: 'BSC'
    },
    expectedType: 'UTILITY',
    expectedRiskRange: [0, 30]
  },
  {
    name: 'USDT (BSC)',
    address: '0x55d398326f99059fF775485246999027B3197955',
    chainId: 56,
    plan: 'PREMIUM',
    metadata: {
      tokenSymbol: 'USDT',
      tokenName: 'Tether USD',
      twitterHandle: '@Tether_to',
      chain: 'BSC'
    },
    expectedType: 'UTILITY',
    expectedRiskRange: [0, 40]
  },
  {
    name: 'SafeMoon (BSC)',
    address: '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3',
    chainId: 56,
    plan: 'PREMIUM',
    metadata: {
      tokenSymbol: 'SFM',
      tokenName: 'SafeMoon',
      twitterHandle: '@safemoon',
      chain: 'BSC'
    },
    expectedType: 'MEME',
    expectedRiskRange: [40, 80]
  }
]

async function testToken(token) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🧪 TESTING: ${token.name}`)
  console.log(`${'='.repeat(80)}`)
  console.log(`📍 Address: ${token.address}`)
  console.log(`⛓️  Chain: ${token.metadata.chain} (${token.chainId})`)
  console.log(`📊 Expected Type: ${token.expectedType}`)
  console.log(`🎯 Expected Risk Range: ${token.expectedRiskRange[0]}-${token.expectedRiskRange[1]}`)
  console.log()

  try {
    const response = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress: token.address,
        chainId: token.chainId,
        userId: 'test-user',
        plan: token.plan,
        metadata: token.metadata
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(`❌ API ERROR: ${response.status}`)
      console.error(error)
      return {
        token: token.name,
        success: false,
        error: error.error || 'Unknown error'
      }
    }

    const result = await response.json()

    console.log(`📊 RESULTS:`)
    console.log(`───────────────────────────────────────────────`)
    console.log(`🎯 Risk Score: ${result.overall_risk_score}/100`)
    console.log(`🚨 Risk Level: ${result.risk_level}`)
    console.log(`📈 Confidence: ${result.confidence_score}%`)
    
    if (result.detailed_insights && result.detailed_insights.length > 0) {
      console.log(`\n💡 AI Insights:`)
      result.detailed_insights.forEach(insight => {
        console.log(`   ${insight}`)
      })
    }

    console.log(`\n📐 Factor Breakdown:`)
    const factors = [
      { name: 'Supply Dilution', key: 'supplyDilution' },
      { name: 'Holder Concentration', key: 'holderConcentration' },
      { name: 'Liquidity Depth', key: 'liquidityDepth' },
      { name: 'Contract Control', key: 'contractControl' },
      { name: 'Tax/Fee', key: 'taxFee' },
      { name: 'Distribution', key: 'distribution' },
      { name: 'Burn/Deflation', key: 'burnDeflation' },
      { name: 'Adoption', key: 'adoption' },
      { name: 'Audit/Transparency', key: 'auditTransparency' }
    ]

    factors.forEach(factor => {
      const score = result.breakdown[factor.key] || 0
      const bars = Math.floor(score / 5)
      const barDisplay = '█'.repeat(bars) + '░'.repeat(20 - bars)
      console.log(`   ${factor.name.padEnd(20)} ${barDisplay} ${score}`)
    })

    if (result.critical_flags && result.critical_flags.length > 0) {
      console.log(`\n⚠️  Critical Flags:`)
      result.critical_flags.forEach(flag => {
        console.log(`   ${flag}`)
      })
    }

    console.log(`\n📡 Data Sources:`)
    result.data_sources?.forEach(source => {
      console.log(`   ✓ ${source}`)
    })

    // Validation
    console.log(`\n✅ VALIDATION:`)
    const validations = []

    // Check risk score range
    const [minRisk, maxRisk] = token.expectedRiskRange
    const riskInRange = result.overall_risk_score >= minRisk && result.overall_risk_score <= maxRisk
    validations.push({
      check: `Risk score in expected range (${minRisk}-${maxRisk})`,
      passed: riskInRange,
      actual: result.overall_risk_score
    })

    // Check confidence
    const highConfidence = result.confidence_score >= 70
    validations.push({
      check: 'High confidence score (≥70%)',
      passed: highConfidence,
      actual: result.confidence_score
    })

    // Check data sources
    const hasMultipleSources = result.data_sources && result.data_sources.length >= 2
    validations.push({
      check: 'Multiple data sources used',
      passed: hasMultipleSources,
      actual: result.data_sources?.length || 0
    })

    validations.forEach(v => {
      const status = v.passed ? '✅' : '❌'
      console.log(`   ${status} ${v.check}: ${v.actual}`)
    })

    const allPassed = validations.every(v => v.passed)
    
    if (allPassed) {
      console.log(`\n🎉 ${token.name} TEST PASSED!`)
    } else {
      console.log(`\n⚠️  ${token.name} TEST: Some validations failed`)
    }

    return {
      token: token.name,
      success: true,
      riskScore: result.overall_risk_score,
      riskLevel: result.risk_level,
      confidence: result.confidence_score,
      allValidationsPassed: allPassed,
      validations
    }

  } catch (error) {
    console.error(`❌ FETCH ERROR:`, error.message)
    return {
      token: token.name,
      success: false,
      error: error.message
    }
  }
}

async function runTests() {
  console.log(`\n🧪 MULTI-TOKEN TEST SUITE`)
  console.log(`${'='.repeat(80)}`)
  console.log(`Testing ${tokens.length} tokens across different types`)
  console.log(`Testing chain-adaptive risk scoring and API routing`)
  console.log()

  const results = []

  for (const token of tokens) {
    const result = await testToken(token)
    results.push(result)
    
    // Wait 2 seconds between tests to avoid rate limits
    if (tokens.indexOf(token) < tokens.length - 1) {
      console.log(`\n⏳ Waiting 2 seconds before next test...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Final Summary
  console.log(`\n\n${'='.repeat(80)}`)
  console.log(`📊 FINAL SUMMARY`)
  console.log(`${'='.repeat(80)}`)
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const passed = results.filter(r => r.success && r.allValidationsPassed)

  console.log(`\n✅ Successful API calls: ${successful.length}/${tokens.length}`)
  console.log(`✅ Tests passed: ${passed.length}/${tokens.length}`)
  console.log(`❌ Tests failed: ${failed.length}/${tokens.length}`)

  if (successful.length > 0) {
    console.log(`\n📊 Risk Score Comparison:`)
    successful.forEach(r => {
      if (r.riskScore !== undefined) {
        const riskBar = '█'.repeat(Math.floor(r.riskScore / 5))
        console.log(`   ${r.token.padEnd(20)} ${riskBar} ${r.riskScore}/100 (${r.riskLevel})`)
      }
    })
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed Tests:`)
    failed.forEach(r => {
      console.log(`   ${r.token}: ${r.error}`)
    })
  }

  console.log(`\n${'='.repeat(80)}`)
  
  if (passed.length === tokens.length) {
    console.log(`🎉 ALL TESTS PASSED! System working correctly.`)
  } else {
    console.log(`⚠️  Some tests failed. Review results above.`)
  }
  
  console.log(`${'='.repeat(80)}\n`)
}

// Run tests
runTests().catch(console.error)
