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

    await adminDb.collection('users').doc(userId).set(
      {
        uid: userId,
        email,
        name: name ?? null,
        tier,
      },
      { merge: true }
    )

    return NextResponse.json({ success: true, userId, tier })
  } catch (error) {
    console.error('set-tier error:', error)
    return NextResponse.json({ error: 'Failed to set tier' }, { status: 500 })
  }
}


