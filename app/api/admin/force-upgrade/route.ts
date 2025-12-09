import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

/**
 * Force Upgrade User API
 * Emergency endpoint to directly upgrade a user to PREMIUM
 * 
 * Usage: POST /api/admin/force-upgrade
 * Body: { email: "user@example.com", tier: "PREMIUM" }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()
    const decodedToken = await adminAuth.verifyIdToken(token)

    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, tier } = body

    if (!email || !tier) {
      return NextResponse.json({ error: 'Email and tier required' }, { status: 400 })
    }

    console.log(`[Force Upgrade] Looking for user: ${email}`)

    // Find user by email
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const targetUserDoc = usersSnapshot.docs[0]
    const userId = targetUserDoc.id
    const currentData = targetUserDoc.data()

    console.log(`[Force Upgrade] Found user: ${userId}`)
    console.log(`[Force Upgrade] Current data:`, {
      tier: currentData.tier,
      plan: currentData.plan,
      role: currentData.role
    })

    // Force update
    const updates = {
      tier: tier,
      plan: tier,
      updatedAt: new Date().toISOString()
    }

    console.log(`[Force Upgrade] Applying updates:`, updates)

    await adminDb.collection('users').doc(userId).update(updates)

    // Verify update
    const verifyDoc = await adminDb.collection('users').doc(userId).get()
    const verifiedData = verifyDoc.data()

    console.log(`[Force Upgrade] Verified data:`, {
      tier: verifiedData?.tier,
      plan: verifiedData?.plan
    })

    return NextResponse.json({
      success: true,
      message: 'User upgraded successfully',
      userId,
      email,
      before: {
        tier: currentData.tier,
        plan: currentData.plan
      },
      after: {
        tier: verifiedData?.tier,
        plan: verifiedData?.plan
      }
    })

  } catch (error) {
    console.error('[Force Upgrade] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
