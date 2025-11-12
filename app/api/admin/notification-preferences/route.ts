/**
 * Admin Notification Preferences API
 * GET - Fetch admin notification preferences
 * PUT - Update admin notification preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { isDevMode } from '@/lib/dev-mode'
import { DEFAULT_PREFERENCES } from '@/lib/admin-notification-preferences'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const idToken = authHeader.replace('Bearer ', '')

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    // Verify caller is admin
    const adminAuth = getAdminAuth()
    const caller = await adminAuth.verifyIdToken(idToken)
    const callerRecord = await adminAuth.getUser(caller.uid)

    if (!callerRecord.customClaims?.admin && callerRecord.customClaims?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can access notification preferences' },
        { status: 403 }
      )
    }

    // Get preferences from Firestore
    const adminDb = getAdminDb()
    const preferencesDoc = await adminDb.collection('admin_notification_preferences').doc(caller.uid).get()

    if (!preferencesDoc.data()) {
      // Return defaults if not found
      return NextResponse.json({
        success: true,
        preferences: {
          userId: caller.uid,
          ...DEFAULT_PREFERENCES,
          updatedAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      preferences: {
        id: preferencesDoc.id,
        ...preferencesDoc.data(),
      },
    })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const idToken = authHeader.replace('Bearer ', '')

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    // Verify caller is admin
    const adminAuth = getAdminAuth()
    const caller = await adminAuth.verifyIdToken(idToken)
    const callerRecord = await adminAuth.getUser(caller.uid)

    if (!callerRecord.customClaims?.admin && callerRecord.customClaims?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can update notification preferences' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { emailNotifications, inAppNotifications, notificationTypes, emailFrequency } = body

    // Validate input
    if (typeof emailNotifications !== 'boolean' || typeof inAppNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid notification settings' },
        { status: 400 }
      )
    }

    if (!['immediate', 'daily', 'weekly', 'never'].includes(emailFrequency)) {
      return NextResponse.json(
        { error: 'Invalid email frequency' },
        { status: 400 }
      )
    }

    // Update preferences in Firestore
    const adminDb = getAdminDb()
    const preferences = {
      userId: caller.uid,
      emailNotifications,
      inAppNotifications,
      notificationTypes: {
        tierChanges: notificationTypes?.tierChanges ?? true,
        userActivity: notificationTypes?.userActivity ?? true,
        systemAlerts: notificationTypes?.systemAlerts ?? true,
        securityEvents: notificationTypes?.securityEvents ?? true,
      },
      emailFrequency,
      updatedAt: new Date().toISOString(),
    }

    await adminDb.collection('admin_notification_preferences').doc(caller.uid).set(preferences, { merge: true })

    console.log(`✅ Admin ${caller.uid} updated notification preferences`)

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Notification preferences updated successfully',
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
