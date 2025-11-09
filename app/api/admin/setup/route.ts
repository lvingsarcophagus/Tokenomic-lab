import { NextRequest, NextResponse } from 'next/server'
import { setUserAsAdmin } from '@/lib/admin-setup'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      })
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
  }
}

/**
 * API Route to set up an admin account
 * Usage: POST /api/admin/setup
 * Body: { email: string, password?: string, name?: string }
 * 
 * Note: This requires Firebase Admin SDK to create users
 * For now, you can manually set a user's role to 'admin' in Firestore
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // If password is provided, create a new user
    let userId: string | null = null

    if (password) {
      try {
        const auth = getAuth()
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: name || 'Admin',
        })
        userId = userRecord.uid
      } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
          { error: 'Failed to create user. You may need to create the user in Firebase Auth first, then call this API.' },
          { status: 500 }
        )
      }
    }

    // If userId is not provided, try to find existing user by email
    if (!userId) {
      try {
        const auth = getAuth()
        const userRecord = await auth.getUserByEmail(email)
        userId = userRecord.uid
      } catch (error) {
        return NextResponse.json(
          { error: 'User not found. Please create the user in Firebase Auth first, or provide a password to create a new user.' },
          { status: 404 }
        )
      }
    }

    // Set up admin account
    await setUserAsAdmin(userId, email, name)

    return NextResponse.json({
      success: true,
      message: `Admin account set up successfully for ${email}`,
      userId,
    })
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to set up admin account' },
      { status: 500 }
    )
  }
}


