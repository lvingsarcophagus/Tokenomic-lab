import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, isAdminConfigured, getAdminDb } from '@/lib/firebase-admin'
import { setUserAsPremium } from '@/lib/admin-setup'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import { isDevMode } from '@/lib/dev-mode'
import { sendTierUpgradeEmail } from '@/lib/email-notifications'

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
        
        // Create notification in dev mode
        const notificationRef = adminDb.collection('notifications').doc()
        await notificationRef.set({
          userId,
          type: 'tier_upgrade',
          title: '🎉 PREMIUM UPGRADE!',
          message: 'Congratulations! Your account has been upgraded to PREMIUM. Enjoy unlimited scans, advanced analytics, and priority support!',
          read: false,
          createdAt: new Date().toISOString(),
        })
        
        // Send email notification (optional in dev mode)
        await sendTierUpgradeEmail(email, name)
        
        return NextResponse.json({ success: true, userId, mode: 'dev-fallback', notificationSent: true, emailSent: true })
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

    // Create notification in Firestore
    const adminDb = getAdminDb()
    const notificationRef = adminDb.collection('notifications').doc()
    await notificationRef.set({
      userId,
      type: 'tier_upgrade',
      title: '🎉 PREMIUM UPGRADE!',
      message: 'Congratulations! Your account has been upgraded to PREMIUM. Enjoy unlimited scans, advanced analytics, and priority support!',
      read: false,
      createdAt: new Date().toISOString(),
    })

    // Send email notification
    const emailSent = await sendTierUpgradeEmail(email, name)

    console.log(`✅ User ${userId} upgraded to premium. Notification sent. Email sent: ${emailSent}`)

    return NextResponse.json({ success: true, userId, notificationSent: true, emailSent })
  } catch (error) {
    console.error('Upgrade to premium error:', error)
    return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 })
  }
}

export async function GET() {
  const envPresent = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' && process.env.FIREBASE_SERVICE_ACCOUNT.length > 0
  return NextResponse.json({ configured: adminReady, envPresent })
}


