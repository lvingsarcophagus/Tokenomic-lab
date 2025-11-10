/**
 * Token Historical Data API
 * GET /api/token/history?address={address}&type={type}&timeframe={timeframe}
 * 
 * Aggregates historical data from multiple sources:
 * - Firestore analysis history (risk scores)
 * - Mobula API (price, volume, liquidity)
 * - Moralis API (holders, transactions)
 * - Cached behavioral data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

const db = getAdminDb()

interface HistoricalDataPoint {
  timestamp: number
  date: string
  value: number
  label?: string
}

interface HistoryResponse {
  success: boolean
  data: HistoricalDataPoint[]
  type: string
  timeframe: string
  tokenAddress: string
  metadata?: {
    startDate: string
    endDate: string
    dataPoints: number
    source: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const type = searchParams.get('type') || 'price' // risk, price, holders, volume, transactions, whales
    const timeframe = searchParams.get('timeframe') || '30D' // 7D, 30D, 90D, 1Y
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      )
    }

    // Calculate date range based on timeframe
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '7D':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30D':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90D':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    let data: HistoricalDataPoint[] = []
    let source = 'unknown'

    // Route to appropriate data source based on type
    switch (type) {
      case 'risk':
        data = await getRiskHistory(address, startDate, endDate)
        source = 'Firestore analysis history'
        break
      
      case 'price':
        data = await getPriceHistory(address, startDate, endDate)
        source = 'Mobula API'
        break
      
      case 'holders':
        data = await getHolderHistory(address, startDate, endDate)
        source = 'Moralis API + Firestore cache'
        break
      
      case 'volume':
        data = await getVolumeHistory(address, startDate, endDate)
        source = 'Mobula API'
        break
      
      case 'transactions':
        data = await getTransactionHistory(address, startDate, endDate)
        source = 'Firestore analysis history'
        break
      
      case 'whales':
        data = await getWhaleActivityHistory(address, startDate, endDate)
        source = 'Moralis API + analysis'
        break
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown history type: ${type}` },
          { status: 400 }
        )
    }

    const response: HistoryResponse = {
      success: true,
      data,
      type,
      timeframe,
      tokenAddress: address,
      metadata: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataPoints: data.length,
        source
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('❌ Token history API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch historical data',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Get risk score history from Firestore analysis_history
 */
async function getRiskHistory(
  address: string, 
  startDate: Date, 
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    // Query all users' analysis history for this token
    const historyRef = db.collectionGroup('scans')
    const snapshot = await historyRef
      .where('tokenAddress', '==', address.toLowerCase())
      .where('analyzedAt', '>=', startDate)
      .where('analyzedAt', '<=', endDate)
      .orderBy('analyzedAt', 'asc')
      .get()

    if (snapshot.empty) {
      // Return empty data - frontend will show "No historical data available"
      return []
    }

    const data: HistoricalDataPoint[] = snapshot.docs.map(doc => {
      const docData = doc.data()
      const analyzedAt = docData.analyzedAt?.toDate() || new Date()
      
      return {
        timestamp: analyzedAt.getTime(),
        date: analyzedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: docData.results?.overall_risk_score || 0,
        label: docData.results?.risk_level
      }
    })

    return data

  } catch (error) {
    console.error('Error fetching risk history:', error)
    return []
  }
}

/**
 * Get price history with fallback chain: CoinGecko → Mobula → DexScreener
 */
async function getPriceHistory(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    // Try CoinMarketCap first (most reliable and has historical data)
    const cmcData = await getPriceHistoryFromCoinMarketCap(address, startDate, endDate)
    if (cmcData && cmcData.length > 0) {
      console.log(`[Price History] Using CoinMarketCap data (${cmcData.length} points)`)
      return cmcData
    }

    // Fallback to CoinGecko
    console.log('[Price History] CoinMarketCap unavailable, trying CoinGecko...')
    const coinGeckoData = await getPriceHistoryFromCoinGecko(address, startDate, endDate)
    if (coinGeckoData && coinGeckoData.length > 0) {
      console.log(`[Price History] Using CoinGecko data (${coinGeckoData.length} points)`)
      return coinGeckoData
    }

    // Fallback to Mobula
    console.log('[Price History] CoinGecko unavailable, trying Mobula...')
    const mobulaData = await getPriceHistoryFromMobula(address, startDate, endDate)
    if (mobulaData && mobulaData.length > 0) {
      console.log(`[Price History] Using Mobula data (${mobulaData.length} points)`)
      return mobulaData
    }

    // Final fallback: DexScreener (current price only, no history)
    console.log('[Price History] Mobula unavailable, using DexScreener for current price...')
    const dexData = await getCurrentPriceFromDexScreener(address)
    return dexData ? [dexData] : []

  } catch (error) {
    console.error('Error fetching price history:', error)
    return []
  }
}

/**
 * Get price history from CoinMarketCap API (primary source)
 */
async function getPriceHistoryFromCoinMarketCap(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY
    if (!apiKey) {
      console.log('[CoinMarketCap] No API key configured')
      return []
    }

    // First, get the CMC ID for this token
    const infoUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?address=${address}`
    const infoResponse = await fetch(infoUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!infoResponse.ok) {
      console.log(`[CoinMarketCap] Info lookup failed: ${infoResponse.status}`)
      return []
    }

    const infoData = await infoResponse.json()
    const tokenIds = Object.keys(infoData.data || {})
    
    if (tokenIds.length === 0) {
      console.log('[CoinMarketCap] No token found for address')
      return []
    }

    const cmcId = tokenIds[0]
    
    // Calculate time range
    const timeStart = Math.floor(startDate.getTime() / 1000)
    const timeEnd = Math.floor(endDate.getTime() / 1000)
    
    // Get historical quotes (OHLCV data)
    const quotesUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical?id=${cmcId}&time_start=${timeStart}&time_end=${timeEnd}&interval=daily`
    
    const quotesResponse = await fetch(quotesUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!quotesResponse.ok) {
      console.log(`[CoinMarketCap] Historical quotes failed: ${quotesResponse.status}`)
      return []
    }

    const quotesData = await quotesResponse.json()
    const quotes = quotesData.data?.quotes || []

    if (quotes.length === 0) {
      console.log('[CoinMarketCap] No historical data available')
      return []
    }

    // Convert to HistoricalDataPoint format
    return quotes.map((quote: any) => ({
      timestamp: new Date(quote.time_close).getTime(),
      date: new Date(quote.time_close).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: quote.quote?.USD?.close || 0
    }))

  } catch (error) {
    console.error('[CoinMarketCap] Error:', error)
    return []
  }
}

/**
 * Get price history from CoinGecko API (fallback source)
 */
async function getPriceHistoryFromCoinGecko(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    const { getPriceHistoryByAddress, timeframeToDays } = await import('@/lib/api/coingecko')
    
    // Calculate days between dates
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Assume chain 1 (Ethereum) - could be enhanced to detect chain
    const prices = await getPriceHistoryByAddress(address, '1', daysDiff)
    
    if (!prices || prices.length === 0) {
      return []
    }

    return prices.map(point => ({
      timestamp: point.timestamp,
      date: point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: point.price
    }))

  } catch (error) {
    console.error('[CoinGecko] Error:', error)
    return []
  }
}

/**
 * Get price history from Mobula API (fallback)
 */
async function getPriceHistoryFromMobula(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    const MOBULA_API_KEY = process.env.MOBULA_API_KEY
    
    if (!MOBULA_API_KEY) {
      return []
    }

    const response = await fetch(
      `https://api.mobula.io/api/1/market/history?asset=${address}`,
      {
        headers: {
          'Authorization': MOBULA_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      return []
    }

    const result = await response.json()
    
    if (!result.data?.price_history) {
      return []
    }

    return result.data.price_history
      .filter((point: any) => {
        const pointDate = new Date(point.timestamp * 1000)
        return pointDate >= startDate && pointDate <= endDate
      })
      .map((point: any) => ({
        timestamp: point.timestamp * 1000,
        date: new Date(point.timestamp * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: parseFloat(point.price) || 0
      }))

  } catch (error) {
    console.error('[Mobula] Error:', error)
    return []
  }
}

/**
 * Get current price from DexScreener (final fallback)
 */
async function getCurrentPriceFromDexScreener(
  address: string
): Promise<HistoricalDataPoint | null> {
  try {
    const { getDexScreenerTokenData, aggregateDexData } = await import('@/lib/api/dexscreener')
    
    const pairs = await getDexScreenerTokenData(address)
    if (!pairs || pairs.length === 0) {
      return null
    }

    const aggregated = aggregateDexData(pairs)
    
    return {
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: aggregated.avgPrice
    }

  } catch (error) {
    console.error('[DexScreener] Error:', error)
    return null
  }
}

/**
 * Get holder count history from Moralis + Firestore cache
 */
async function getHolderHistory(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    // First check Firestore for cached holder history
    const historyRef = db.collectionGroup('scans')
    const snapshot = await historyRef
      .where('tokenAddress', '==', address.toLowerCase())
      .where('analyzedAt', '>=', startDate)
      .where('analyzedAt', '<=', endDate)
      .orderBy('analyzedAt', 'asc')
      .get()

    if (!snapshot.empty) {
      const data: HistoricalDataPoint[] = snapshot.docs
        .map(doc => {
          const docData = doc.data()
          const analyzedAt = docData.analyzedAt?.toDate() || new Date()
          const holderCount = docData.marketSnapshot?.holderCount || 0
          
          if (holderCount > 0) {
            return {
              timestamp: analyzedAt.getTime(),
              date: analyzedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: holderCount
            }
          }
          return null
        })
        .filter((point): point is HistoricalDataPoint => point !== null)

      if (data.length > 0) {
        return data
      }
    }

    // If no cached data, return empty (could fetch from Moralis here in future)
    return []

  } catch (error) {
    console.error('Error fetching holder history:', error)
    return []
  }
}

/**
 * Get volume history with fallback chain: CoinGecko → Mobula → DexScreener
 */
async function getVolumeHistory(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    // Try CoinGecko first
    const coinGeckoData = await getVolumeHistoryFromCoinGecko(address, startDate, endDate)
    if (coinGeckoData && coinGeckoData.length > 0) {
      console.log(`[Volume History] Using CoinGecko data (${coinGeckoData.length} points)`)
      return coinGeckoData
    }

    // Fallback to Mobula
    console.log('[Volume History] CoinGecko unavailable, trying Mobula...')
    const mobulaData = await getVolumeHistoryFromMobula(address, startDate, endDate)
    if (mobulaData && mobulaData.length > 0) {
      console.log(`[Volume History] Using Mobula data (${mobulaData.length} points)`)
      return mobulaData
    }

    // Final fallback: DexScreener (current volume only)
    console.log('[Volume History] Mobula unavailable, using DexScreener for current volume...')
    const dexData = await getCurrentVolumeFromDexScreener(address)
    return dexData ? [dexData] : []

  } catch (error) {
    console.error('Error fetching volume history:', error)
    return []
  }
}

/**
 * Get volume history from CoinGecko API (primary source)
 */
async function getVolumeHistoryFromCoinGecko(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    const { getVolumeHistoryByAddress } = await import('@/lib/api/coingecko')
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const volumes = await getVolumeHistoryByAddress(address, '1', daysDiff)
    
    if (!volumes || volumes.length === 0) {
      return []
    }

    return volumes.map(point => ({
      timestamp: point.timestamp,
      date: point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: point.volume
    }))

  } catch (error) {
    console.error('[CoinGecko] Error:', error)
    return []
  }
}

/**
 * Get volume history from Mobula API (fallback)
 */
async function getVolumeHistoryFromMobula(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    const MOBULA_API_KEY = process.env.MOBULA_API_KEY
    
    if (!MOBULA_API_KEY) {
      return []
    }

    const response = await fetch(
      `https://api.mobula.io/api/1/market/history?asset=${address}`,
      {
        headers: {
          'Authorization': MOBULA_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      return []
    }

    const result = await response.json()
    
    if (!result.data?.volume_history) {
      return []
    }

    const data: HistoricalDataPoint[] = result.data.volume_history
      .filter((point: any) => {
        const pointDate = new Date(point.timestamp * 1000)
        return pointDate >= startDate && pointDate <= endDate
      })
      .map((point: any) => ({
        timestamp: point.timestamp * 1000,
        date: new Date(point.timestamp * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: parseFloat(point.volume) || 0
      }))

    return data

  } catch (error) {
    console.error('[Mobula] Error fetching volume history:', error)
    return []
  }
}

/**
 * Get current volume from DexScreener (final fallback)
 */
async function getCurrentVolumeFromDexScreener(
  address: string
): Promise<HistoricalDataPoint | null> {
  try {
    const { getDexScreenerTokenData, aggregateDexData } = await import('@/lib/api/dexscreener')
    
    const pairs = await getDexScreenerTokenData(address)
    if (!pairs || pairs.length === 0) {
      return null
    }

    const aggregated = aggregateDexData(pairs)
    
    return {
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: aggregated.totalVolume24h
    }

  } catch (error) {
    console.error('[DexScreener] Error:', error)
    return null
  }
}

/**
 * Get transaction history from Firestore
 */
async function getTransactionHistory(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    // Get transaction counts from analysis history
    const historyRef = db.collectionGroup('scans')
    const snapshot = await historyRef
      .where('tokenAddress', '==', address.toLowerCase())
      .where('analyzedAt', '>=', startDate)
      .where('analyzedAt', '<=', endDate)
      .orderBy('analyzedAt', 'asc')
      .get()

    if (snapshot.empty) {
      return []
    }

    const data: HistoricalDataPoint[] = snapshot.docs
      .map(doc => {
        const docData = doc.data()
        const analyzedAt = docData.analyzedAt?.toDate() || new Date()
        const txCount = docData.marketSnapshot?.transactions24h || 0
        
        if (txCount > 0) {
          return {
            timestamp: analyzedAt.getTime(),
            date: analyzedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: txCount
          }
        }
        return null
      })
      .filter((point): point is HistoricalDataPoint => point !== null)

    return data

  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}

/**
 * Get whale activity index from Moralis data
 */
async function getWhaleActivityHistory(
  address: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  try {
    // Calculate whale activity from behavioral data in Firestore
    const historyRef = db.collectionGroup('scans')
    const snapshot = await historyRef
      .where('tokenAddress', '==', address.toLowerCase())
      .where('analyzedAt', '>=', startDate)
      .where('analyzedAt', '<=', endDate)
      .orderBy('analyzedAt', 'asc')
      .get()

    if (snapshot.empty) {
      return []
    }

    const data: HistoricalDataPoint[] = snapshot.docs
      .map(doc => {
        const docData = doc.data()
        const analyzedAt = docData.analyzedAt?.toDate() || new Date()
        const behavioralData = docData.behavioralData
        
        // Calculate whale activity index (0-100)
        let whaleIndex = 50 // Base neutral
        
        if (behavioralData) {
          // Increase index based on concentration
          const concentration = behavioralData.holderConcentration || 0
          whaleIndex += concentration * 0.3
          
          // Adjust for smart money signals
          if (behavioralData.smartMoney) {
            whaleIndex += 15
          }
          
          // Adjust for holder velocity (rapid changes suggest whale activity)
          const velocity = Math.abs(behavioralData.holderVelocity || 0)
          whaleIndex += Math.min(velocity * 2, 20)
        }
        
        whaleIndex = Math.min(Math.max(whaleIndex, 0), 100)
        
        return {
          timestamp: analyzedAt.getTime(),
          date: analyzedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.round(whaleIndex)
        }
      })

    return data

  } catch (error) {
    console.error('Error fetching whale activity history:', error)
    return []
  }
}
