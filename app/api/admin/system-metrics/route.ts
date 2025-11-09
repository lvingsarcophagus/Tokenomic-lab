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

    // Simulate system metrics (in production, you'd get these from actual monitoring)
    const metrics = {
      cpuUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
      memoryUsage: Math.floor(Math.random() * 50) + 30, // 30-80%
      activeConnections: Math.floor(Math.random() * 100) + 50,
      requestsPerMinute: Math.floor(Math.random() * 500) + 200,
      errorRate: Math.random() * 2, // 0-2%
    }

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Error fetching system metrics:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch system metrics',
      details: error.message 
    }, { status: 500 })
  }
}
