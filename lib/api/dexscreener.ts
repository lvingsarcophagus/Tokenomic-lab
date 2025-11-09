/**
 * DexScreener API Integration
 * Real-time DEX data aggregator - FREE, no API key required!
 * Rate limit: 300 requests/minute
 * Coverage: 50+ DEXes across multiple chains
 */

const DEXSCREENER_API_BASE = 'https://api.dexscreener.com/latest'

export interface DexPair {
  chainId: string
  dexId: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  liquidity: {
    usd: number
    base: number
    quote: number
  }
  volume: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  fdv?: number
  marketCap?: number
  pairCreatedAt?: number
  info?: {
    imageUrl?: string
    websites?: { label: string; url: string }[]
    socials?: { type: string; url: string }[]
  }
}

export interface TokenPairsResponse {
  schemaVersion: string
  pairs: DexPair[] | null
}

export interface AggregatedDexData {
  totalLiquidity: number
  totalVolume24h: number
  avgPrice: number
  priceChange24h: number
  bestDex: string
  topPairs: DexPair[]
}

/**
 * Get all DEX pairs for a token address
 * Works across all supported chains automatically
 */
export async function getDexScreenerTokenData(
  tokenAddress: string
): Promise<DexPair[] | null> {
  try {
    const url = `${DEXSCREENER_API_BASE}/dex/tokens/${tokenAddress}`
    
    console.log(`[DexScreener] Fetching pairs for ${tokenAddress}`)
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`[DexScreener] HTTP ${response.status}`)
      return null
    }

    const data: TokenPairsResponse = await response.json()
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log(`[DexScreener] No pairs found for ${tokenAddress}`)
      return null
    }

    console.log(`[DexScreener] Found ${data.pairs.length} pairs for ${tokenAddress}`)
    return data.pairs
  } catch (error) {
    console.error('[DexScreener] Error fetching token data:', error)
    return null
  }
}

/**
 * Get specific pair data by pair address
 */
export async function getDexScreenerPairData(
  pairAddress: string
): Promise<DexPair | null> {
  try {
    const url = `${DEXSCREENER_API_BASE}/dex/pairs/${pairAddress}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data: { pairs: DexPair[] } = await response.json()
    return data.pairs?.[0] || null
  } catch (error) {
    console.error('[DexScreener] Error fetching pair data:', error)
    return null
  }
}

/**
 * Aggregate data from multiple DEX pairs
 * Returns combined liquidity, volume, and weighted average price
 */
export function aggregateDexData(pairs: DexPair[]): AggregatedDexData {
  if (!pairs || pairs.length === 0) {
    return {
      totalLiquidity: 0,
      totalVolume24h: 0,
      avgPrice: 0,
      priceChange24h: 0,
      bestDex: 'Unknown',
      topPairs: [],
    }
  }

  // Sort by liquidity (highest first)
  const sortedPairs = [...pairs].sort((a, b) => b.liquidity.usd - a.liquidity.usd)

  // Calculate totals
  const totalLiquidity = sortedPairs.reduce((sum, pair) => sum + pair.liquidity.usd, 0)
  const totalVolume24h = sortedPairs.reduce((sum, pair) => sum + pair.volume.h24, 0)

  // Calculate weighted average price (by liquidity)
  const avgPrice = sortedPairs.reduce((sum, pair) => {
    const weight = pair.liquidity.usd / totalLiquidity
    return sum + parseFloat(pair.priceUsd || '0') * weight
  }, 0)

  // Calculate weighted average price change
  const priceChange24h = sortedPairs.reduce((sum, pair) => {
    const weight = pair.liquidity.usd / totalLiquidity
    return sum + pair.priceChange.h24 * weight
  }, 0)

  // Best DEX = highest liquidity
  const bestDex = sortedPairs[0]?.dexId || 'Unknown'

  // Top 5 pairs by liquidity
  const topPairs = sortedPairs.slice(0, 5)

  return {
    totalLiquidity,
    totalVolume24h,
    avgPrice,
    priceChange24h,
    bestDex,
    topPairs,
  }
}

/**
 * Get real-time liquidity for a token
 * Returns aggregated liquidity across all DEXes
 */
export async function getRealTimeLiquidity(
  tokenAddress: string
): Promise<number> {
  try {
    const pairs = await getDexScreenerTokenData(tokenAddress)
    if (!pairs) return 0

    const aggregated = aggregateDexData(pairs)
    return aggregated.totalLiquidity
  } catch (error) {
    console.error('[DexScreener] Error getting liquidity:', error)
    return 0
  }
}

/**
 * Get real-time volume for a token
 * Returns aggregated 24h volume across all DEXes
 */
export async function getRealTimeVolume(
  tokenAddress: string
): Promise<number> {
  try {
    const pairs = await getDexScreenerTokenData(tokenAddress)
    if (!pairs) return 0

    const aggregated = aggregateDexData(pairs)
    return aggregated.totalVolume24h
  } catch (error) {
    console.error('[DexScreener] Error getting volume:', error)
    return 0
  }
}

/**
 * Get multi-timeframe price changes
 * Returns 5m, 1h, 6h, 24h price changes
 */
export async function getMultiTimeframePriceChanges(
  tokenAddress: string
): Promise<{
  m5: number
  h1: number
  h6: number
  h24: number
} | null> {
  try {
    const pairs = await getDexScreenerTokenData(tokenAddress)
    if (!pairs || pairs.length === 0) return null

    // Use highest liquidity pair for price changes
    const mainPair = pairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd)[0]
    
    return {
      m5: mainPair.priceChange.m5,
      h1: mainPair.priceChange.h1,
      h6: mainPair.priceChange.h6,
      h24: mainPair.priceChange.h24,
    }
  } catch (error) {
    console.error('[DexScreener] Error getting price changes:', error)
    return null
  }
}

/**
 * Get transaction counts across all pairs
 * Returns buy/sell transaction counts for multiple timeframes
 */
export async function getTransactionCounts(
  tokenAddress: string
): Promise<{
  m5: { buys: number; sells: number }
  h1: { buys: number; sells: number }
  h6: { buys: number; sells: number }
  h24: { buys: number; sells: number }
} | null> {
  try {
    const pairs = await getDexScreenerTokenData(tokenAddress)
    if (!pairs || pairs.length === 0) return null

    // Aggregate transaction counts across all pairs
    const totals = pairs.reduce(
      (acc, pair) => ({
        m5: {
          buys: acc.m5.buys + pair.txns.m5.buys,
          sells: acc.m5.sells + pair.txns.m5.sells,
        },
        h1: {
          buys: acc.h1.buys + pair.txns.h1.buys,
          sells: acc.h1.sells + pair.txns.h1.sells,
        },
        h6: {
          buys: acc.h6.buys + pair.txns.h6.buys,
          sells: acc.h6.sells + pair.txns.h6.sells,
        },
        h24: {
          buys: acc.h24.buys + pair.txns.h24.buys,
          sells: acc.h24.sells + pair.txns.h24.sells,
        },
      }),
      {
        m5: { buys: 0, sells: 0 },
        h1: { buys: 0, sells: 0 },
        h6: { buys: 0, sells: 0 },
        h24: { buys: 0, sells: 0 },
      }
    )

    return totals
  } catch (error) {
    console.error('[DexScreener] Error getting transaction counts:', error)
    return null
  }
}

/**
 * Check if token has enough liquidity (rug pull detection)
 * Returns true if liquidity is concerning
 */
export async function checkLowLiquidity(
  tokenAddress: string,
  marketCap: number
): Promise<{
  isLowLiquidity: boolean
  liquidityRatio: number
  liquidityUsd: number
}> {
  try {
    const liquidity = await getRealTimeLiquidity(tokenAddress)
    const liquidityRatio = marketCap > 0 ? liquidity / marketCap : 0

    // Flag if liquidity is <1% of market cap
    const isLowLiquidity = liquidityRatio < 0.01

    return {
      isLowLiquidity,
      liquidityRatio,
      liquidityUsd: liquidity,
    }
  } catch (error) {
    console.error('[DexScreener] Error checking liquidity:', error)
    return {
      isLowLiquidity: false,
      liquidityRatio: 0,
      liquidityUsd: 0,
    }
  }
}
