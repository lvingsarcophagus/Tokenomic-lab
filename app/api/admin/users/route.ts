/**
 * Enhanced Admin User Management API
 * Supports: list, ban, unban, delete, update_plan, make_admin, revoke_admin, create
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()

    // Get auth token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token && !isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin in production
    if (!isDev && token) {
      const decodedToken = await adminAuth.verifyIdToken(token)
      const customClaims = decodedToken as any
      
      if (!customClaims.admin && customClaims.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    // Get all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(1000)
    
    // Get additional user data from Firestore
    const usersSnapshot = await adminDb.collection('users').get()
    const userDocs = new Map()
    usersSnapshot.forEach((doc: any) => {
      userDocs.set(doc.id, doc.data())
    })

    const users = listUsersResult.users.map((user: any) => {
      const firestoreData = userDocs.get(user.uid) || {}
      const customClaims = user.customClaims || {}
      
      return {
        uid: user.uid,
        email: user.email || 'No email',
        role: customClaims.role || firestoreData.role || 'FREE',
        tier: firestoreData.tier || 'free',
        admin: customClaims.admin || false,
        createdAt: user.metadata.creationTime,
        lastLogin: user.metadata.lastSignInTime,
        premiumSince: firestoreData.premiumSince || null,
      }
    })

    return NextResponse.json({ 
      success: true,
      users,
      count: users.length
    })

  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error.message 
    }, { status: 500 })
  }
}

// POST: User management actions (ban, unban, delete, update_plan, etc.)
export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()

    // Get auth token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token && !isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let adminUser: any
    // Verify admin in production
    if (!isDev && token) {
      const decodedToken = await adminAuth.verifyIdToken(token)
      const customClaims = decodedToken as any
      
      if (!customClaims.admin && customClaims.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      adminUser = await adminAuth.getUser(decodedToken.uid)
    }

    const body = await request.json()
    const { action, userId, email, plan, reason, displayName } = body

    // BAN USER
    if (action === 'ban') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      
      await adminDb.collection('users').doc(userId).update({
        banned: true,
        banReason: reason || 'No reason provided',
        bannedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        bannedBy: adminUser?.uid || 'admin'
      })
      
      await adminAuth.updateUser(userId, { disabled: true })
      
      return NextResponse.json({ success: true, message: `User ${userId} banned` })
    }

    // UNBAN USER
    if (action === 'unban') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      
      await adminDb.collection('users').doc(userId).update({
        banned: false,
        banReason: require('firebase-admin').firestore.FieldValue.delete(),
        bannedAt: require('firebase-admin').firestore.FieldValue.delete(),
        unbannedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        unbannedBy: adminUser?.uid || 'admin'
      })
      
      await adminAuth.updateUser(userId, { disabled: false })
      
      return NextResponse.json({ success: true, message: `User ${userId} unbanned` })
    }

    // DELETE USER
    if (action === 'delete') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      
      // Delete Firestore data
      await adminDb.collection('users').doc(userId).delete()
      
      // Delete Firebase Auth
      await adminAuth.deleteUser(userId)
      
      // Delete subcollections
      const batch = adminDb.batch()
      const watchlist = await adminDb.collection('watchlist').doc(userId).collection('tokens').get()
      watchlist.docs.forEach(doc => batch.delete(doc.ref))
      
      const alerts = await adminDb.collection('alerts').doc(userId).collection('notifications').get()
      alerts.docs.forEach(doc => batch.delete(doc.ref))
      
      const history = await adminDb.collection('analysis_history').doc(userId).collection('scans').get()
      history.docs.forEach(doc => batch.delete(doc.ref))
      
      await batch.commit()
      
      return NextResponse.json({ success: true, message: `User ${userId} deleted permanently` })
    }

    // UPDATE PLAN
    if (action === 'update_plan') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      if (!plan || !['FREE', 'PREMIUM'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
      
      await adminDb.collection('users').doc(userId).update({
        plan,
        role: plan,
        planUpdatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        planUpdatedBy: adminUser?.uid || 'admin'
      })
      
      // Update custom claims
      await adminAuth.setCustomUserClaims(userId, { role: plan })
      
      return NextResponse.json({ success: true, message: `User ${userId} updated to ${plan}` })
    }

    // MAKE ADMIN
    if (action === 'make_admin') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      
      await adminAuth.setCustomUserClaims(userId, { admin: true })
      await adminDb.collection('users').doc(userId).update({
        isAdmin: true,
        adminGrantedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        adminGrantedBy: adminUser?.uid || 'admin'
      })
      
      return NextResponse.json({ success: true, message: `User ${userId} is now admin` })
    }

    // REVOKE ADMIN
    if (action === 'revoke_admin') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      
      await adminAuth.setCustomUserClaims(userId, { admin: false })
      await adminDb.collection('users').doc(userId).update({
        isAdmin: false,
        adminRevokedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        adminRevokedBy: adminUser?.uid || 'admin'
      })
      
      return NextResponse.json({ success: true, message: `Admin revoked for ${userId}` })
    }

    // CREATE USER
    if (action === 'create') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      
      const newUser = await adminAuth.createUser({
        email,
        emailVerified: false,
        password: Math.random().toString(36).slice(-12) + 'A1!',
        displayName: displayName || email.split('@')[0]
      })
      
      await adminDb.collection('users').doc(newUser.uid).set({
        email,
        displayName: displayName || email.split('@')[0],
        plan: plan || 'FREE',
        role: plan || 'FREE',
        createdAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        createdBy: adminUser?.uid || 'admin',
        usage: {
          tokensAnalyzed: 0,
          apiCalls: 0,
          lastReset: require('firebase-admin').firestore.FieldValue.serverTimestamp()
        }
      })
      
      return NextResponse.json({ success: true, message: 'User created', userId: newUser.uid })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('[Admin Users] Error:', error)
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error.message 
    }, { status: 500 })
  }
}
