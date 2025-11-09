import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

interface APIStatusCheck {
  name: string
  endpoint: string
  testPayload?: any
}

const API_CHECKS: APIStatusCheck[] = [
  { name: 'Mobula API', endpoint: 'https://api.mobula.io/api/1/metadata', testPayload: { asset: 'Bitcoin' } },
  { name: 'CoinGecko', endpoint: 'https://api.coingecko.com/api/v3/ping' },
  { name: 'GoPlus Security', endpoint: 'https://api.gopluslabs.io/api/v1/supported_chains' },
]

async function checkAPI(api: APIStatusCheck) {
  const startTime = Date.now()
  
  try {
    const response = await fetch(api.endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10s timeout
    })
    
    const responseTime = Date.now() - startTime
    const isSuccess = response.ok
    
    return {
      name: api.name,
      status: isSuccess ? 'operational' : 'degraded',
      responseTime,
      lastChecked: new Date().toISOString(),
      successRate: isSuccess ? 100 : 0,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      name: api.name,
      status: 'down',
      responseTime,
      lastChecked: new Date().toISOString(),
      successRate: 0,
    }
  }
}

export async function GET(request: NextRequest) {
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

    // Check all APIs
    const apiStatuses = await Promise.all(API_CHECKS.map(checkAPI))

    return NextResponse.json({
      success: true,
      apis: apiStatuses,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Error checking API statuses:', error)
    return NextResponse.json({ 
      error: 'Failed to check API statuses',
      details: error.message 
    }, { status: 500 })
  }
}
