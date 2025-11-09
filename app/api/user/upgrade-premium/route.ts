import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, isAdminConfigured, getAdminDb } from '@/lib/firebase-admin'
import { setUserAsPremium } from '@/lib/admin-setup'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import { isDevMode } from '@/lib/dev-mode'

// Initialize Firebase Admin if not already initialized
const adminReady = isAdminConfigured()

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!adminReady) {
      if (isDevMode()) {
        const adminDb = getAdminDb()
        const snap = await adminDb.collection('users').where('email', '==', email).limit(1).get()
        if (snap.empty) {
          return NextResponse.json({ error: 'User not found in Firestore (dev mode)' }, { status: 404 })
        }
        const userDoc = snap.docs[0]
        const userId = userDoc.id
        await getAdminDb().collection('users').doc(userId).set({ tier: 'pro' }, { merge: true })
        return NextResponse.json({ success: true, userId, mode: 'dev-fallback' })
      }
      return NextResponse.json(
        { error: 'Server not configured: set FIREBASE_SERVICE_ACCOUNT in environment to enable email-based upgrades.' },
        { status: 500 }
      )
    }

    const auth = getAdminAuth()
    const userRecord = await auth.getUserByEmail(email)
    const userId = userRecord.uid

    await setUserAsPremium(userId, email, name)

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('Upgrade to premium error:', error)
    return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 })
  }
}

export async function GET() {
  const envPresent = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' && process.env.FIREBASE_SERVICE_ACCOUNT.length > 0
  return NextResponse.json({ configured: adminReady, envPresent })
}


