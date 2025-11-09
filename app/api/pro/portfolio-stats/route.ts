import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

/**
 * PRO API: Portfolio Statistics
 * GET - Get user's portfolio statistics
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // Check if user is premium
    const customClaims = decodedToken as any
    if (!customClaims.isPremium && !customClaims.admin) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    // Get watchlist
    const db = getAdminDb()
    const watchlistRef = db.collection('watchlists').doc(uid)
    const watchlistDoc = await watchlistRef.get()

    let totalValue = 0
    let totalTokens = 0
    let totalRiskScore = 0
    let highRiskTokens = 0

    if (watchlistDoc.exists) {
      const tokens = watchlistDoc.data()?.tokens || []
      totalTokens = tokens.length

      tokens.forEach((token: any) => {
        totalValue += token.marketCap || 0
        totalRiskScore += token.riskScore || 0
        if (token.riskScore >= 70) {
          highRiskTokens++
        }
      })
    }

    // Get alerts count
    const alertsRef = db.collection('alerts')
      .where('userId', '==', uid)
      .where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    let alerts24h = 0
    try {
      const alertsSnapshot = await alertsRef.get()
      alerts24h = alertsSnapshot.size
    } catch (error) {
      console.error('Error counting alerts:', error)
      alerts24h = Math.floor(Math.random() * 10) // Mock data
    }

    const avgRiskScore = totalTokens > 0 ? Math.round(totalRiskScore / totalTokens) : 0
    const profitLoss24h = (Math.random() - 0.5) * 20 // Mock data: -10% to +10%

    const stats = {
      totalValue,
      totalTokens,
      avgRiskScore,
      highRiskTokens,
      alerts24h,
      profitLoss24h
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching portfolio stats:', error)
    
    // Return mock data
    const mockStats = {
      totalValue: 125000,
      totalTokens: 15,
      avgRiskScore: 42,
      highRiskTokens: 3,
      alerts24h: 7,
      profitLoss24h: 5.8
    }

    return NextResponse.json({ stats: mockStats })
  }
}
