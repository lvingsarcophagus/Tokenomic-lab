/**
 * Delete User API
 * Delete a user account (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { isDevMode } from '@/lib/dev-mode'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid } = body

    if (!uid) {
      return NextResponse.json(
        { error: 'uid is required' },
        { status: 400 }
      )
    }

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

      // Prevent self-deletion
      if (caller.uid === uid) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        )
      }
    }

    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()

    // Delete from Authentication
    await adminAuth.deleteUser(uid)

    // Delete from Firestore
    await adminDb.collection('users').doc(uid).delete()
    
    // Delete rate limit data
    const rateLimitsSnapshot = await adminDb.collection('rateLimits')
      .where('userId', '==', uid)
      .get()
    
    const batch = adminDb.batch()
    rateLimitsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    console.log(`✅ User ${uid} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      uid,
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
