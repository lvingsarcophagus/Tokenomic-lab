/**
 * CoinMarketCap API Integration
 * Fallback for when Mobula API fails
 */

interface CMCTokenData {
  marketCap: number
  fdv: number
  liquidityUSD: number
  volume24h: number
  price: number
  totalSupply: number
  circulatingSupply: number
  maxSupply: number | null
}

/**
 * Fetch token data from CoinMarketCap
 * Supports both contract address lookup and symbol search
 */
export async function fetchCoinMarketCapData(
  addressOrSymbol: string,
  chainId?: number
): Promise<CMCTokenData | null> {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY
    if (!apiKey) {
      console.log(`⚠️ [CoinMarketCap] No API key configured`)
      return null
    }

    console.log(`🪙 [CoinMarketCap] Fetching data for ${addressOrSymbol}...`)

    // Try by contract address first (if looks like address)
    if (addressOrSymbol.startsWith('0x') || addressOrSymbol.length > 10) {
      const byAddress = await fetchByAddress(addressOrSymbol, apiKey)
      if (byAddress) return byAddress
    }

    // Fallback to symbol search
    const bySymbol = await fetchBySymbol(addressOrSymbol, apiKey)
    return bySymbol

  } catch (error) {
    console.error(`❌ [CoinMarketCap] Fetch failed:`, error)
    return null
  }
}

/**
 * Fetch by contract address
 */
async function fetchByAddress(address: string, apiKey: string): Promise<CMCTokenData | null> {
  try {
    // CMC endpoint for contract address lookup
    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?address=${address}`
    
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`⚠️ [CoinMarketCap] Address lookup failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    // Get the first token ID from response
    const tokenIds = Object.keys(data.data || {})
    if (tokenIds.length === 0) {
      console.log(`⚠️ [CoinMarketCap] No token found for address`)
      return null
    }

    const tokenId = tokenIds[0]
    const tokenInfo = data.data[tokenId]

    // Now fetch quotes with the token ID
    return await fetchQuotes(tokenId, apiKey)

  } catch (error) {
    console.error(`❌ [CoinMarketCap] Address fetch failed:`, error)
    return null
  }
}

/**
 * Fetch by symbol
 */
async function fetchBySymbol(symbol: string, apiKey: string): Promise<CMCTokenData | null> {
  try {
    // CMC endpoint for symbol lookup
    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`
    
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`⚠️ [CoinMarketCap] Symbol lookup failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    // Get the first match
    const symbolData = data.data?.[symbol]
    if (!symbolData || symbolData.length === 0) {
      console.log(`⚠️ [CoinMarketCap] No token found for symbol ${symbol}`)
      return null
    }

    const token = symbolData[0] // First match
    return parseTokenData(token)

  } catch (error) {
    console.error(`❌ [CoinMarketCap] Symbol fetch failed:`, error)
    return null
  }
}

/**
 * Fetch detailed quotes by token ID
 */
async function fetchQuotes(tokenId: string, apiKey: string): Promise<CMCTokenData | null> {
  try {
    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${tokenId}`
    
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`⚠️ [CoinMarketCap] Quotes fetch failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    const token = data.data?.[tokenId]
    
    if (!token) {
      console.log(`⚠️ [CoinMarketCap] No data for token ID ${tokenId}`)
      return null
    }

    return parseTokenData(token)

  } catch (error) {
    console.error(`❌ [CoinMarketCap] Quotes fetch failed:`, error)
    return null
  }
}

/**
 * Parse CMC token data into our format
 */
function parseTokenData(token: any): CMCTokenData {
  const quote = token.quote?.USD || {}
  
  return {
    marketCap: quote.market_cap || 0,
    fdv: quote.fully_diluted_market_cap || quote.market_cap || 0,
    liquidityUSD: 0, // CMC doesn't provide liquidity data
    volume24h: quote.volume_24h || 0,
    price: quote.price || 0,
    totalSupply: token.total_supply || 0,
    circulatingSupply: token.circulating_supply || token.total_supply || 0,
    maxSupply: token.max_supply || null
  }
}

/**
 * Quick test to check if CMC API key is working
 */
export async function testCoinMarketCapAPI(): Promise<boolean> {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY
    if (!apiKey) return false

    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1',
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      }
    )

    return response.ok
  } catch {
    return false
  }
}
