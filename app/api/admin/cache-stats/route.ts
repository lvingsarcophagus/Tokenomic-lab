/**
 * Cache Stats API
 * Get statistics about cached tokenomics data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { isDevMode } from '@/lib/dev-mode'

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!isDevMode()) {
      const authHeader = request.headers.get('authorization') || ''
      const idToken = authHeader.replace('Bearer ', '')

      if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const adminAuth = getAdminAuth()
      const caller = await adminAuth.verifyIdToken(idToken)
      const callerRecord = await adminAuth.getUser(caller.uid)
      
      if (!callerRecord.customClaims?.admin && callerRecord.customClaims?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const adminDb = getAdminDb()
    
    // Get all cached tokens
    const cacheSnapshot = await adminDb.collection('tokenCache').get()
    
    const tokens = cacheSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        address: doc.id,
        name: data.name || 'Unknown',
        symbol: data.symbol || 'N/A',
        queryCount: data.queryCount || 0,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || data.lastUpdated || new Date().toISOString(),
      }
    })

    // Calculate total queries
    const totalQueries = tokens.reduce((sum, token) => sum + (token.queryCount || 0), 0)

    return NextResponse.json({
      success: true,
      tokens,
      totalQueries,
      count: tokens.length,
    })

  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
