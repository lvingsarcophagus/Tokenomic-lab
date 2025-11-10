/**
 * Test Mobula and CoinMarketCap APIs
 * Check which tokens are available on each platform
 */

require('dotenv').config({ path: '.env.local' })

const tokens = [
  {
    name: 'MAGA',
    address: '0x576e2BeD8F7b46D34016198911Cdc7b562352b01',
    symbol: 'MAGA',
    chain: 'BSC'
  },
  {
    name: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    chain: 'BSC'
  },
  {
    name: 'USDT (BSC)',
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    chain: 'BSC'
  },
  {
    name: 'SafeMoon',
    address: '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3',
    symbol: 'SFM',
    chain: 'BSC'
  }
]

async function testMobula(token) {
  try {
    const apiKey = process.env.MOBULA_API_KEY || ''
    const url = `https://api.mobula.io/api/1/market/data?asset=${encodeURIComponent(token.address)}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return { success: false, status: response.status, error: `HTTP ${response.status}` }
    }

    const json = await response.json()
    const data = json.data

    if (!data) {
      return { success: false, error: 'No data in response' }
    }

    return {
      success: true,
      marketCap: data.market_cap || 0,
      liquidity: data.liquidity || 0,
      volume: data.volume || 0,
      price: data.price || 0
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testCoinMarketCap(token) {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY
    
    if (!apiKey) {
      return { success: false, error: 'No COINMARKETCAP_API_KEY configured' }
    }

    // Try by symbol (CMC works better with symbols)
    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${token.symbol}`
    
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      return { success: false, status: response.status, error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    const symbolData = data.data?.[token.symbol]
    
    if (!symbolData || symbolData.length === 0) {
      return { success: false, error: `Symbol ${token.symbol} not found` }
    }

    const tokenData = symbolData[0]
    const quote = tokenData.quote?.USD || {}

    return {
      success: true,
      marketCap: quote.market_cap || 0,
      liquidity: 0, // CMC doesn't provide liquidity
      volume: quote.volume_24h || 0,
      price: quote.price || 0,
      name: tokenData.name
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

function formatNumber(num) {
  if (num === 0) return '$0'
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

async function runTests() {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 TESTING MOBULA vs COINMARKETCAP APIs`)
  console.log(`${'='.repeat(80)}\n`)

  for (const token of tokens) {
    console.log(`\n🪙 ${token.name} (${token.symbol})`)
    console.log(`─`.repeat(60))
    console.log(`📍 Address: ${token.address}`)
    console.log(`⛓️  Chain: ${token.chain}`)

    // Test Mobula
    console.log(`\n📊 MOBULA API:`)
    const mobulaResult = await testMobula(token)
    
    if (mobulaResult.success) {
      console.log(`   ✅ SUCCESS`)
      console.log(`   💰 Market Cap: ${formatNumber(mobulaResult.marketCap)}`)
      console.log(`   💧 Liquidity: ${formatNumber(mobulaResult.liquidity)}`)
      console.log(`   📈 Volume 24h: ${formatNumber(mobulaResult.volume)}`)
      console.log(`   💵 Price: $${mobulaResult.price.toFixed(8)}`)
    } else {
      console.log(`   ❌ FAILED: ${mobulaResult.error}`)
      if (mobulaResult.status) {
        console.log(`   📡 HTTP Status: ${mobulaResult.status}`)
      }
    }

    // Test CoinMarketCap
    console.log(`\n🪙 COINMARKETCAP API:`)
    const cmcResult = await testCoinMarketCap(token)
    
    if (cmcResult.success) {
      console.log(`   ✅ SUCCESS`)
      console.log(`   📝 Name: ${cmcResult.name}`)
      console.log(`   💰 Market Cap: ${formatNumber(cmcResult.marketCap)}`)
      console.log(`   📈 Volume 24h: ${formatNumber(cmcResult.volume)}`)
      console.log(`   💵 Price: $${cmcResult.price.toFixed(8)}`)
      console.log(`   ⚠️  Note: CMC doesn't provide liquidity data`)
    } else {
      console.log(`   ❌ FAILED: ${cmcResult.error}`)
      if (cmcResult.status) {
        console.log(`   📡 HTTP Status: ${cmcResult.status}`)
      }
    }

    // Recommendation
    console.log(`\n💡 RECOMMENDATION:`)
    if (mobulaResult.success && cmcResult.success) {
      console.log(`   ✅ Use Mobula (has liquidity data)`)
    } else if (mobulaResult.success) {
      console.log(`   ✅ Use Mobula`)
    } else if (cmcResult.success) {
      console.log(`   ✅ Use CoinMarketCap as fallback`)
    } else {
      console.log(`   ❌ Both APIs failed - token may not be listed`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 SUMMARY`)
  console.log(`${'='.repeat(80)}`)
  
  console.log(`\n✅ API Configuration:`)
  console.log(`   Mobula API Key: ${process.env.MOBULA_API_KEY ? '✅ Configured' : '❌ Missing'}`)
  console.log(`   CMC API Key: ${process.env.COINMARKETCAP_API_KEY ? '✅ Configured' : '❌ Missing'}`)
  
  console.log(`\n💡 Recommendations:`)
  console.log(`   1. Use Mobula as primary (has liquidity data)`)
  console.log(`   2. Use CoinMarketCap as fallback for popular tokens`)
  console.log(`   3. Some small tokens may not be on either platform`)
  console.log(`   4. CMC free tier: 333 calls/day, 10,000 calls/month`)
  console.log(`   5. Mobula: Check your plan limits\n`)
}

runTests().catch(console.error)
