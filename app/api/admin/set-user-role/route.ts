/**
 * User Roles Management API
 * 
 * POST /api/admin/set-user-role
 * Set user tier (FREE, PREMIUM, ADMIN) and custom claims
 * 
 * Only admins can use this endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { isDevMode } from '@/lib/dev-mode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetUid, role, email } = body

    // Validate input
    if (!targetUid) {
      return NextResponse.json(
        { error: 'targetUid is required' },
        { status: 400 }
      )
    }

    if (!role || !['FREE', 'PREMIUM', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be FREE, PREMIUM, or ADMIN' },
        { status: 400 }
      )
    }

    // In dev mode, allow without authentication
    if (!isDevMode()) {
      const authHeader = request.headers.get('authorization') || ''
      const idToken = authHeader.replace('Bearer ', '')

      if (!idToken) {
        return NextResponse.json(
          { error: 'Missing authorization token' },
          { status: 401 }
        )
      }

      // Verify caller is admin
      try {
        const adminAuth = getAdminAuth()
        const caller = await adminAuth.verifyIdToken(idToken)
        const callerRecord = await adminAuth.getUser(caller.uid)
        
        if (!callerRecord.customClaims?.admin && callerRecord.customClaims?.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Forbidden: Only admins can set user roles' },
            { status: 403 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid authorization token' },
          { status: 401 }
        )
      }
    }

    // Set custom claims
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()

    const customClaims: Record<string, unknown> = { role }
    if (role === 'ADMIN') {
      customClaims.admin = true
    }

    // Set custom claims (affects token)
    await adminAuth.setCustomUserClaims(targetUid, customClaims)

    // Update Firestore user document
    const userDoc = {
      role,
      tier: role === 'PREMIUM' ? 'pro' : 'free',
      admin: role === 'ADMIN',
      updatedAt: new Date().toISOString(),
      ...(email && { email }),
    }

    await adminDb.collection('users').doc(targetUid).set(userDoc, { merge: true })

    console.log(`✅ User ${targetUid} role set to ${role}`)

    return NextResponse.json({
      success: true,
      uid: targetUid,
      role,
      message: `User role updated to ${role}. User must refresh their token to see changes.`
    })

  } catch (error) {
    console.error('Set user role error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - List all users with their roles
 */
export async function GET(request: NextRequest) {
  try {
    // In dev mode, allow without authentication
    if (!isDevMode()) {
      const authHeader = request.headers.get('authorization') || ''
      const idToken = authHeader.replace('Bearer ', '')

      if (!idToken) {
        return NextResponse.json(
          { error: 'Missing authorization token' },
          { status: 401 }
        )
      }

      // Verify caller is admin
      try {
        const adminAuth = getAdminAuth()
        const caller = await adminAuth.verifyIdToken(idToken)
        const callerRecord = await adminAuth.getUser(caller.uid)
        
        if (!callerRecord.customClaims?.admin && callerRecord.customClaims?.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Forbidden: Only admins can list users' },
            { status: 403 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid authorization token' },
          { status: 401 }
        )
      }
    }

    // Get all users from Firestore
    const adminDb = getAdminDb()
    const usersSnapshot = await adminDb.collection('users').get()
    
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    })

  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
