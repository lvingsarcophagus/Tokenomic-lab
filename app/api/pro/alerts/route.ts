import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

/**
 * PRO API: Alerts System
 * GET - Get user's alerts
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

    // Get alerts from Firestore
    const db = getAdminDb()
    const alertsRef = db.collection('alerts').where('userId', '==', uid).orderBy('timestamp', 'desc').limit(50)
    const alertsSnapshot = await alertsRef.get()

    const alerts = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    
    // Return mock data if Firestore query fails (for demo purposes)
    const mockAlerts = [
      {
        id: '1',
        type: 'whale',
        token: 'PEPE',
        message: 'Large wallet moved 5B tokens (2.5% of supply)',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'high'
      },
      {
        id: '2',
        type: 'rugpull',
        token: 'SCAM',
        message: 'Liquidity decreased by 80% in last hour',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        severity: 'critical'
      },
      {
        id: '3',
        type: 'price',
        token: 'DOGE',
        message: 'Price increased by 25% in 1 hour',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        severity: 'medium'
      },
      {
        id: '4',
        type: 'risk',
        token: 'SHIB',
        message: 'Risk score increased from 35 to 62',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        severity: 'medium'
      },
      {
        id: '5',
        type: 'whale',
        token: 'FLOKI',
        message: 'Top 10 holders now control 85% of supply',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        severity: 'high'
      }
    ]

    return NextResponse.json({ alerts: mockAlerts })
  }
}
