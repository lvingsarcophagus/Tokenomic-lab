/**
 * Clear Cache API
 * Clear tokenomics cache data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { isDevMode } from '@/lib/dev-mode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

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

    if (address) {
      // Clear specific token cache
      await adminDb.collection('tokenCache').doc(address).delete()
      console.log(`✅ Cleared cache for ${address}`)
      
      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${address}`,
      })
    } else {
      // Clear all cache
      const snapshot = await adminDb.collection('tokenCache').get()
      const batch = adminDb.batch()
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      console.log(`✅ Cleared all cache (${snapshot.size} entries)`)
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${snapshot.size} cache entries`,
      })
    }

  } catch (error) {
    console.error('Clear cache error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
