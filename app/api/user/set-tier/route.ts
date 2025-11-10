import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, getAdminAuth, isAdminConfigured } from '@/lib/firebase-admin'

// Firestore-only: set a user's tier by email
// POST /api/user/set-tier  { email: string, tier: 'free' | 'pro', name?: string }
export async function POST(request: NextRequest) {
  try {
    const { email, tier, name } = await request.json()
    if (!email || !tier || !['free', 'pro'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid payload. Require email and tier in {free|pro}.' }, { status: 400 })
    }

    if (!isAdminConfigured()) {
      return NextResponse.json({ error: 'Server not configured for privileged Firestore access.' }, { status: 500 })
    }

    const adminDb = getAdminDb()
    const adminAuth = getAdminAuth()

    // Try to find Auth user by email to get canonical uid
    let userId: string | null = null
    try {
      const userRecord = await adminAuth.getUserByEmail(email)
      userId = userRecord.uid
    } catch {
      userId = null
    }

    if (!userId) {
      // Fallback: look up Firestore by email
      const snap = await adminDb.collection('users').where('email', '==', email).limit(1).get()
      if (snap.empty) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      userId = snap.docs[0].id
    }

    // Update user tier and plan
    const updateData: any = {
      uid: userId,
      email,
      tier,
      plan: tier === 'pro' ? 'PREMIUM' : 'FREE', // Update plan field too
      updatedAt: new Date().toISOString(),
    }

    if (name) {
      updateData.name = name
    }

    // If upgrading to premium, add premium-specific fields
    if (tier === 'pro') {
      updateData.premiumSince = new Date().toISOString()
    }

    await adminDb.collection('users').doc(userId).set(updateData, { merge: true })

    // Create notification for the user
    const notificationRef = adminDb.collection('notifications').doc()
    await notificationRef.set({
      userId,
      type: tier === 'pro' ? 'tier_upgrade' : 'tier_downgrade',
      title: tier === 'pro' ? '🎉 PREMIUM UPGRADE!' : 'Account Updated',
      message: tier === 'pro' 
        ? 'Congratulations! Your account has been upgraded to PREMIUM. Enjoy unlimited scans, advanced analytics, and priority support!'
        : 'Your account tier has been updated by an administrator.',
      read: false,
      createdAt: new Date().toISOString(),
    })

    console.log(`✅ User ${email} upgraded to ${tier}. Notification sent.`)

    return NextResponse.json({ success: true, userId, tier, notificationSent: true })
  } catch (error) {
    console.error('set-tier error:', error)
    return NextResponse.json({ error: 'Failed to set tier' }, { status: 500 })
  }
}


