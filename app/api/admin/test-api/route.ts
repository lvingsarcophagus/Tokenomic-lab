import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const API_ENDPOINTS: Record<string, string> = {
  'Mobula API': 'https://api.mobula.io/api/1/metadata?asset=Bitcoin',
  'CoinGecko': 'https://api.coingecko.com/api/v3/ping',
  'GoPlus Security': 'https://api.gopluslabs.io/api/v1/supported_chains',
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth()

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

    const { apiName } = await request.json()

    if (!apiName || !API_ENDPOINTS[apiName]) {
      return NextResponse.json({ error: 'Invalid API name' }, { status: 400 })
    }

    // Test the API
    const startTime = Date.now()
    
    try {
      const response = await fetch(API_ENDPOINTS[apiName], {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return NextResponse.json({
          success: true,
          status: 'operational',
          responseTime,
          timestamp: new Date().toISOString(),
        })
      } else {
        return NextResponse.json({
          success: false,
          status: 'degraded',
          responseTime,
          error: `HTTP ${response.status}`,
        }, { status: 200 })
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      
      return NextResponse.json({
        success: false,
        status: 'down',
        responseTime,
        error: error.message,
      }, { status: 200 })
    }

  } catch (error: any) {
    console.error('Error testing API:', error)
    return NextResponse.json({ 
      error: 'Failed to test API',
      details: error.message 
    }, { status: 500 })
  }
}
