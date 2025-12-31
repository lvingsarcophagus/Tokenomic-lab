/**
 * Simple test to verify cache functionality
 * Tests the analyze-token API and checks if data is cached
 */

const testTokenAnalysis = async () => {
  const testToken = {
    tokenAddress: "0x6982508145454ce325ddbe47a25d4ec3d2311933", // PEPE
    chainId: "1", // Ethereum
    plan: "FREE",
    metadata: {
      tokenName: "Pepe",
      tokenSymbol: "PEPE"
    }
  }

  console.log('🧪 Testing token analysis and caching...')
  console.log(`Token: ${testToken.metadata.tokenName} (${testToken.tokenAddress})`)
  
  try {
    // Test the analyze-token API
    const response = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testToken)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    console.log('✅ Analysis completed successfully')
    console.log(`Risk Score: ${result.overall_risk_score}`)
    console.log(`Risk Level: ${result.risk_level}`)
    console.log(`Confidence: ${result.confidence_score}%`)
    
    if (result.ai_summary) {
      console.log('✅ AI Summary generated')
    } else {
      console.log('❌ No AI Summary (expected for FREE plan)')
    }

    // Wait a moment for cache to be saved
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('\n🔍 Checking if data was cached...')
    
    // Test cache by making another request (should be faster)
    const startTime = Date.now()
    const cachedResponse = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testToken)
    })
    const endTime = Date.now()
    
    if (cachedResponse.ok) {
      const cachedResult = await cachedResponse.json()
      console.log(`✅ Second request completed in ${endTime - startTime}ms`)
      
      // Compare results to see if they're consistent
      if (cachedResult.overall_risk_score === result.overall_risk_score) {
        console.log('✅ Cache consistency verified')
      } else {
        console.log('⚠️ Cache inconsistency detected')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testTokenAnalysis()