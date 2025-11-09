import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

export async function GET(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()

    // Verify admin access
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token && !isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isDev && token) {
      const decodedToken = await adminAuth.verifyIdToken(token)
      const customClaims = decodedToken as any
      
      if (!customClaims.admin && customClaims.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    // Get analytics data from Firestore
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)

    // Query rate limits for last 24h activity
    const rateLimitsSnapshot = await adminDb
      .collection('rateLimits')
      .where('lastRequest', '>', new Date(last24h))
      .get()

    const queriesLast24h = rateLimitsSnapshot.docs.reduce((sum: number, doc: any) => {
      const data = doc.data()
      return sum + (data.requestCount || 0)
    }, 0)

    const activeUsers24h = rateLimitsSnapshot.size

    return NextResponse.json({
      success: true,
      queriesLast24h,
      activeUsers24h,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 })
  }
}
