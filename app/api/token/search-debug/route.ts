import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug Token Search API
 * GET /api/token/search-debug?query=UNI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    const debug: any = {
      query,
      steps: []
    }

    // Step 1: Test CoinGecko search
    debug.steps.push('Testing CoinGecko search API...')
    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query || 'UNI')}`
    const searchResponse = await fetch(searchUrl)
    debug.searchStatus = searchResponse.status
    debug.searchOk = searchResponse.ok
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      debug.coinsFound = searchData.coins?.length || 0
      debug.firstCoin = searchData.coins?.[0]
      
      // Step 2: Test detail API for first coin
      if (searchData.coins?.[0]) {
        const coinId = searchData.coins[0].id
        debug.steps.push(`Testing detail API for ${coinId}...`)
        const detailUrl = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
        const detailResponse = await fetch(detailUrl)
        debug.detailStatus = detailResponse.status
        debug.detailOk = detailResponse.ok
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json()
          debug.platforms = detailData.platforms || {}
          debug.platformCount = Object.keys(detailData.platforms || {}).length
          debug.symbol = detailData.symbol
          debug.name = detailData.name
        }
      }
    }

    return NextResponse.json(debug, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
