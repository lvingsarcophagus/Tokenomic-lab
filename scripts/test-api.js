#!/usr/bin/env node

/**
 * Test script for Token Analysis API
 * 
 * Usage:
 *   node scripts/test-api.js FREE USDT
 *   node scripts/test-api.js PREMIUM 0xdac17f958d2ee523a2206206994597c13d831ec7
 */

const plan = process.argv[2] || 'PREMIUM'
const token = process.argv[3] || 'USDT'
const chainId = '1' // Ethereum

console.log(`\n🧪 Testing Token Analysis API`)
console.log(`Plan: ${plan}`)
console.log(`Token: ${token}`)
console.log(`Chain: ${chainId}\n`)

const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/analyze-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress: token,
        chainId: chainId,
        userId: 'dev-user',
        devPlan: plan
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ API Error:', data)
      process.exit(1)
    }

    console.log('✅ API Response:\n')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.dev_mode) {
      console.log('\n🔧 Developer Mode Active:')
      console.log(`  - Plan: ${data.dev_mode.plan}`)
      console.log(`  - Rate Limit Bypassed: ${data.dev_mode.bypassRateLimit}`)
    }

    if (data.plan === 'FREE') {
      console.log('\n📊 Free Plan Analysis:')
      console.log(`  - Risk Score: ${data.data.overall_risk_score}/100`)
      console.log(`  - Risk Level: ${data.data.risk_level}`)
    } else {
      console.log('\n💎 Premium Plan Analysis:')
      console.log(`  - Risk Score: ${data.data.overall_risk_score}/100`)
      console.log(`  - Risk Level: ${data.data.risk_level}`)
      console.log(`  - Confidence: ${data.data.confidence_score}%`)
      console.log(`  - Scam Probability: ${data.data.scam_probability}%`)
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message)
    console.error('\nMake sure:')
    console.error('  1. Dev server is running (npm run dev)')
    console.error('  2. NEXT_PUBLIC_DEV_MODE=true in .env.local')
    process.exit(1)
  }
}

testAPI()
