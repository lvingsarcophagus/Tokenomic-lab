/**
 * Token Insights API
 * GET /api/token/insights?address={address}&type={type}
 * 
 * Provides advanced insights:
 * - sentiment: Market sentiment analysis
 * - security: Security evolution metrics
 * - holders: Top holder distribution analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

const db = getAdminDb()

interface SentimentData {
  bullish: number
  neutral: number
  bearish: number
  overall: 'BULLISH' | 'NEUTRAL' | 'BEARISH'
  confidence: number
  sources: string[]
}

interface SecurityMetrics {
  contractSecurity: {
    score: number
    grade: string
  }
  liquidityLock: {
    locked: boolean
    percentage: number
  }
  auditStatus: {
    audited: boolean
    score: number
  }
  ownership: {
    status: 'RENOUNCED' | 'CENTRALIZED' | 'DECENTRALIZED'
    score: number
  }
}

interface HolderDistribution {
  top10: number
  top50: number
  top100: number
  decentralization: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  concentration: number
  topHolders?: Array<{
    address: string
    balance: number
    percentage: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const type = searchParams.get('type') || 'sentiment' // sentiment, security, holders
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      )
    }

    let data: any = null

    switch (type) {
      case 'sentiment':
        data = await getSentimentAnalysis(address)
        break
      
      case 'security':
        data = await getSecurityMetrics(address)
        break
      
      case 'holders':
        data = await getHolderDistribution(address)
        break
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown insight type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      type,
      tokenAddress: address
    })

  } catch (error: any) {
    console.error('❌ Token insights API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch insights',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Analyze market sentiment from on-chain metrics and historical data
 */
async function getSentimentAnalysis(address: string): Promise<SentimentData> {
  try {
    // Get recent scans to analyze sentiment trends
    const historyRef = db.collectionGroup('scans')
    const recentScans = await historyRef
      .where('tokenAddress', '==', address.toLowerCase())
      .orderBy('analyzedAt', 'desc')
      .limit(10)
      .get()

    if (recentScans.empty) {
      // Return neutral sentiment if no data
      return {
        bullish: 33,
        neutral: 34,
        bearish: 33,
        overall: 'NEUTRAL',
        confidence: 0,
        sources: ['No historical data']
      }
    }

    let bullishScore = 0
    let bearishScore = 0
    let neutralScore = 0

    // Analyze each scan
    recentScans.docs.forEach(doc => {
      const data = doc.data()
      const riskScore = data.results?.overall_risk_score || 50
      const marketData = data.marketSnapshot
      
      // Risk score sentiment
      if (riskScore < 30) {
        bullishScore += 3 // Low risk = bullish
      } else if (riskScore < 60) {
        neutralScore += 2
      } else {
        bearishScore += 3 // High risk = bearish
      }
      
      // Price change sentiment
      if (marketData?.priceChange24h) {
        if (marketData.priceChange24h > 5) {
          bullishScore += 2
        } else if (marketData.priceChange24h < -5) {
          bearishScore += 2
        } else {
          neutralScore += 1
        }
      }
      
      // Volume sentiment
      if (marketData?.volume24h) {
        if (marketData.volume24h > 1000000) {
          bullishScore += 1 // High volume = interest
        }
      }
      
      // Holder growth sentiment
      if (data.behavioralData?.holderVelocity) {
        if (data.behavioralData.holderVelocity > 5) {
          bullishScore += 2 // Growing holders = bullish
        } else if (data.behavioralData.holderVelocity < -5) {
          bearishScore += 2 // Losing holders = bearish
        }
      }
    })

    // Calculate percentages
    const total = bullishScore + neutralScore + bearishScore
    const bullishPercent = Math.round((bullishScore / total) * 100)
    const neutralPercent = Math.round((neutralScore / total) * 100)
    const bearishPercent = 100 - bullishPercent - neutralPercent // Ensure total is 100%

    // Determine overall sentiment
    let overall: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'NEUTRAL'
    if (bullishPercent > 50) overall = 'BULLISH'
    else if (bearishPercent > 50) overall = 'BEARISH'

    // Confidence based on data points
    const confidence = Math.min((recentScans.docs.length / 10) * 100, 100)

    return {
      bullish: bullishPercent,
      neutral: neutralPercent,
      bearish: bearishPercent,
      overall,
      confidence: Math.round(confidence),
      sources: ['On-chain metrics', 'Risk analysis', 'Holder velocity', 'Price trends']
    }

  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    // Return neutral on error
    return {
      bullish: 33,
      neutral: 34,
      bearish: 33,
      overall: 'NEUTRAL',
      confidence: 0,
      sources: ['Error fetching data']
    }
  }
}

/**
 * Get security metrics from latest analysis
 */
async function getSecurityMetrics(address: string): Promise<SecurityMetrics> {
  try {
    // Get most recent scan
    const historyRef = db.collectionGroup('scans')
    const recentScan = await historyRef
      .where('tokenAddress', '==', address.toLowerCase())
      .orderBy('analyzedAt', 'desc')
      .limit(1)
      .get()

    if (recentScan.empty) {
      // Return default values if no data
      return {
        contractSecurity: { score: 0, grade: 'UNKNOWN' },
        liquidityLock: { locked: false, percentage: 0 },
        auditStatus: { audited: false, score: 0 },
        ownership: { status: 'CENTRALIZED', score: 0 }
      }
    }

    const data = recentScan.docs[0].data()
    const securityData = data.securityData || {}
    const riskBreakdown = data.results?.breakdown || {}
    
    // Calculate contract security score (inverse of contractControl risk)
    const contractControlRisk = riskBreakdown.contractControl || 50
    const contractSecurityScore = Math.max(0, 100 - contractControlRisk)
    
    let contractGrade = 'F'
    if (contractSecurityScore >= 90) contractGrade = 'A+'
    else if (contractSecurityScore >= 80) contractGrade = 'A'
    else if (contractSecurityScore >= 70) contractGrade = 'B'
    else if (contractSecurityScore >= 60) contractGrade = 'C'
    else if (contractSecurityScore >= 50) contractGrade = 'D'

    // Liquidity lock analysis
    const liquidityDepthRisk = riskBreakdown.liquidityDepth || 50
    const liquidityLocked = securityData.is_liquidity_locked === true || liquidityDepthRisk < 30
    const liquidityPercentage = liquidityLocked ? Math.max(0, 100 - liquidityDepthRisk) : 0

    // Audit status (check if contract is verified/audited)
    const isAudited = securityData.is_open_source === '1' || securityData.is_verified === true
    const auditScore = isAudited ? 85 : 0

    // Ownership status
    let ownershipStatus: 'RENOUNCED' | 'CENTRALIZED' | 'DECENTRALIZED' = 'CENTRALIZED'
    let ownershipScore = 50

    if (securityData.owner_address === '0x0000000000000000000000000000000000000000') {
      ownershipStatus = 'RENOUNCED'
      ownershipScore = 100
    } else if (securityData.owner_percent) {
      const ownerPercent = parseFloat(securityData.owner_percent) * 100
      if (ownerPercent < 5) {
        ownershipStatus = 'DECENTRALIZED'
        ownershipScore = 90
      } else if (ownerPercent < 20) {
        ownershipStatus = 'DECENTRALIZED'
        ownershipScore = 70
      } else {
        ownershipScore = Math.max(0, 100 - ownerPercent)
      }
    }

    return {
      contractSecurity: {
        score: Math.round(contractSecurityScore),
        grade: contractGrade
      },
      liquidityLock: {
        locked: liquidityLocked,
        percentage: Math.round(liquidityPercentage)
      },
      auditStatus: {
        audited: isAudited,
        score: auditScore
      },
      ownership: {
        status: ownershipStatus,
        score: Math.round(ownershipScore)
      }
    }

  } catch (error) {
    console.error('Error fetching security metrics:', error)
    return {
      contractSecurity: { score: 0, grade: 'ERROR' },
      liquidityLock: { locked: false, percentage: 0 },
      auditStatus: { audited: false, score: 0 },
      ownership: { status: 'CENTRALIZED', score: 0 }
    }
  }
}

/**
 * Analyze top holder distribution - Fetch fresh data from GoPlus API
 */
async function getHolderDistribution(address: string): Promise<HolderDistribution> {
  try {
    console.log(`[Holder Distribution] Fetching fresh data for ${address}`)
    
    // Fetch fresh data directly from GoPlus API
    const goplusUrl = `https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${address}`
    const response = await fetch(goplusUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`[Holder Distribution] GoPlus API error: ${response.status}`)
      throw new Error('GoPlus API request failed')
    }

    const data = await response.json()
    
    // Extract token data (GoPlus returns data nested under token address)
    const tokenData = data.result?.[address.toLowerCase()]
    
    if (!tokenData || !Array.isArray(tokenData.holders) || tokenData.holders.length === 0) {
      console.log('[Holder Distribution] No holder data available from GoPlus')
      return {
        top10: 0,
        top50: 0,
        top100: 0,
        decentralization: 'POOR',
        concentration: 0
      }
    }

    const holders = tokenData.holders
    console.log(`[Holder Distribution] Found ${holders.length} holders in GoPlus data`)
    
    // Calculate actual TOP 10 percentage from GoPlus data
    let top10Percent = 0
    if (holders.length >= 10) {
      top10Percent = holders.slice(0, 10).reduce((sum: number, h: any) => {
        // GoPlus returns percent as decimal string (e.g., "0.208243" = 20.8243%)
        const pct = parseFloat(h.percent || '0')
        return sum + (pct * 100)
      }, 0)
    }
    
    // Calculate actual TOP 50 percentage
    let top50Percent = 0
    if (holders.length >= 50) {
      top50Percent = holders.slice(0, 50).reduce((sum: number, h: any) => {
        const pct = parseFloat(h.percent || '0')
        return sum + (pct * 100)
      }, 0)
    } else if (holders.length > 10) {
      // Use all available holders if less than 50
      top50Percent = holders.reduce((sum: number, h: any) => {
        const pct = parseFloat(h.percent || '0')
        return sum + (pct * 100)
      }, 0)
    }
    
    // Calculate actual TOP 100 percentage
    let top100Percent = 0
    if (holders.length >= 100) {
      top100Percent = holders.slice(0, 100).reduce((sum: number, h: any) => {
        const pct = parseFloat(h.percent || '0')
        return sum + (pct * 100)
      }, 0)
    } else if (holders.length > 50) {
      // Use all available holders if less than 100
      top100Percent = holders.reduce((sum: number, h: any) => {
        const pct = parseFloat(h.percent || '0')
        return sum + (pct * 100)
      }, 0)
    } else {
      // Estimate if we have less than 50 holders
      top100Percent = top50Percent * 1.2 // Rough estimate
    }
    
    // Round to 1 decimal place for display
    top10Percent = Math.round(top10Percent * 10) / 10
    top50Percent = Math.round(top50Percent * 10) / 10
    top100Percent = Math.round(top100Percent * 10) / 10

    console.log(`[Holder Distribution] ✅ Calculated: TOP10=${top10Percent}%, TOP50=${top50Percent}%, TOP100=${top100Percent}%`)

    // Determine decentralization rating based on TOP 10 holders
    let decentralization: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' = 'FAIR'
    
    if (top10Percent < 10) decentralization = 'EXCELLENT'
    else if (top10Percent < 20) decentralization = 'GOOD'
    else if (top10Percent < 35) decentralization = 'FAIR'
    else if (top10Percent < 50) decentralization = 'POOR'
    else decentralization = 'CRITICAL'

    return {
      top10: top10Percent,
      top50: top50Percent,
      top100: top100Percent,
      decentralization,
      concentration: Math.round(top10Percent)
    }

  } catch (error) {
    console.error('❌ Error fetching holder distribution:', error)
    return {
      top10: 0,
      top50: 0,
      top100: 0,
      decentralization: 'POOR',
      concentration: 0
    }
  }
}
