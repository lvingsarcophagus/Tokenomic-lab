/**
 * CoinGecko API Integration
 * Primary source for historical price, volume, and market cap data
 * Free tier: 10-50 calls/minute
 */

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const API_KEY = process.env.COINGECKO_API_KEY || ''

// Map contract addresses to CoinGecko IDs
const ADDRESS_TO_ID: Record<string, string> = {
  // Ethereum
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'weth',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 'curve-dao-token',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin',
  
  // BSC
  '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': 'pancakeswap-token',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'wbnb',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'binance-usd',
}

interface PricePoint {
  timestamp: number
  date: Date
  price: number
}

interface VolumePoint {
  timestamp: number
  date: Date
  volume: number
}

interface MarketCapPoint {
  timestamp: number
  date: Date
  marketCap: number
}

interface CoinGeckoMarketChartResponse {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

interface OHLCPoint {
  timestamp: number
  date: Date
  open: number
  high: number
  low: number
  close: number
}

/**
 * Get CoinGecko ID from contract address
 */
export function getCoinGeckoId(address: string, chainId: string = '1'): string | null {
  const normalized = address.toLowerCase()
  return ADDRESS_TO_ID[normalized] || null
}

/**
 * Resolve contract address to CoinGecko ID using API
 */
export async function resolveContractToCoinGeckoId(
  address: string, 
  chainId: string
): Promise<string | null> {
  try {
    // Check local mapping first
    const localId = getCoinGeckoId(address, chainId)
    if (localId) return localId

    // Map chainId to CoinGecko platform
    const platformMap: Record<string, string> = {
      '1': 'ethereum',
      '56': 'binance-smart-chain',
      '137': 'polygon-pos',
      '43114': 'avalanche',
      '250': 'fantom',
      '42161': 'arbitrum-one',
      '10': 'optimistic-ethereum',
    }

    const platform = platformMap[chainId]
    if (!platform) return null

    // Query CoinGecko API
    const url = `${COINGECKO_API_BASE}/coins/${platform}/contract/${address}`
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY
    }

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      console.log(`[CoinGecko] Contract not found: ${address} on ${platform}`)
      return null
    }

    const data = await response.json()
    console.log(`[CoinGecko] Resolved ${address} to ${data.id}`)
    return data.id
  } catch (error) {
    console.error('[CoinGecko] Error resolving contract:', error)
    return null
  }
}

/**
 * Get historical price, volume, and market cap data
 * @param coinId - CoinGecko coin ID (e.g., 'uniswap', 'chainlink')
 * @param days - Number of days (1, 7, 14, 30, 90, 180, 365, 'max')
 */
export async function getCoinGeckoMarketChart(
  coinId: string,
  days: number | 'max' = 30
): Promise<{
  prices: PricePoint[]
  volumes: VolumePoint[]
  marketCaps: MarketCapPoint[]
} | null> {
  try {
    const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY
    }

    console.log(`[CoinGecko] Fetching market chart for ${coinId} (${days} days)`)
    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`[CoinGecko] HTTP ${response.status} for ${coinId}`)
      return null
    }

    const data: CoinGeckoMarketChartResponse = await response.json()

    const prices = data.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp),
      price,
    }))

    const volumes = data.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      date: new Date(timestamp),
      volume,
    }))

    const marketCaps = data.market_caps.map(([timestamp, marketCap]) => ({
      timestamp,
      date: new Date(timestamp),
      marketCap,
    }))

    console.log(`[CoinGecko] Retrieved ${prices.length} price points for ${coinId}`)
    return { prices, volumes, marketCaps }
  } catch (error) {
    console.error('[CoinGecko] Error fetching market chart:', error)
    return null
  }
}

/**
 * Get OHLC candlestick data for advanced charts
 * @param coinId - CoinGecko coin ID
 * @param days - Number of days (1, 7, 14, 30, 90, 180, 365)
 */
export async function getCoinGeckoOHLC(
  coinId: string,
  days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 30
): Promise<OHLCPoint[] | null> {
  try {
    const url = `${COINGECKO_API_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY
    }

    console.log(`[CoinGecko] Fetching OHLC for ${coinId} (${days} days)`)
    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`[CoinGecko] HTTP ${response.status} for OHLC ${coinId}`)
      return null
    }

    const data: [number, number, number, number, number][] = await response.json()

    const ohlc = data.map(([timestamp, open, high, low, close]) => ({
      timestamp,
      date: new Date(timestamp),
      open,
      high,
      low,
      close,
    }))

    console.log(`[CoinGecko] Retrieved ${ohlc.length} OHLC points for ${coinId}`)
    return ohlc
  } catch (error) {
    console.error('[CoinGecko] Error fetching OHLC:', error)
    return null
  }
}

/**
 * Get price history by contract address (convenience method)
 */
export async function getPriceHistoryByAddress(
  address: string,
  chainId: string,
  days: number | 'max' = 30
): Promise<PricePoint[] | null> {
  try {
    const coinId = await resolveContractToCoinGeckoId(address, chainId)
    if (!coinId) {
      console.log(`[CoinGecko] Could not resolve ${address} to CoinGecko ID`)
      return null
    }

    const data = await getCoinGeckoMarketChart(coinId, days)
    return data?.prices || null
  } catch (error) {
    console.error('[CoinGecko] Error in getPriceHistoryByAddress:', error)
    return null
  }
}

/**
 * Get volume history by contract address (convenience method)
 */
export async function getVolumeHistoryByAddress(
  address: string,
  chainId: string,
  days: number | 'max' = 30
): Promise<VolumePoint[] | null> {
  try {
    const coinId = await resolveContractToCoinGeckoId(address, chainId)
    if (!coinId) return null

    const data = await getCoinGeckoMarketChart(coinId, days)
    return data?.volumes || null
  } catch (error) {
    console.error('[CoinGecko] Error in getVolumeHistoryByAddress:', error)
    return null
  }
}

/**
 * Convert timeframe to days for CoinGecko API
 */
export function timeframeToDays(timeframe: string): number | 'max' {
  switch (timeframe) {
    case '7D': return 7
    case '30D': return 30
    case '90D': return 90
    case '1Y': return 365
    case 'MAX': return 'max'
    default: return 30
  }
}
