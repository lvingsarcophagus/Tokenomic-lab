import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

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

    // Check API keys status (checking if env vars are set)
    const keys: Record<string, { status: string, lastUsed: string }> = {
      'MOBULA_API_KEY': {
        status: process.env.MOBULA_API_KEY ? 'active' : 'missing',
        lastUsed: 'Recently'
      },
      'COINMARKETCAP_API_KEY': {
        status: process.env.COINMARKETCAP_API_KEY ? 'active' : 'missing',
        lastUsed: 'Recently'
      },
      'COINGECKO_API_KEY': {
        status: process.env.COINGECKO_API_KEY ? 'active' : 'missing',
        lastUsed: 'Recently'
      },
      'GOPLUS_API_KEY': {
        status: process.env.GOPLUS_API_KEY ? 'active' : 'missing',
        lastUsed: 'Recently'
      },
    }

    return NextResponse.json({
      success: true,
      keys,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Error fetching API keys status:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch API keys status',
      details: error.message 
    }, { status: 500 })
  }
}
