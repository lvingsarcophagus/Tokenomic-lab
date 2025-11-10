import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function DELETE(request: NextRequest) {
  try {
    const auth = getAdminAuth()
    const db = getAdminDb()
    
    // Verify user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid
    
    console.log('[GDPR Deletion] Starting account deletion for user:', userId)
    
    // 1. Delete Firestore data
    const batch = db.batch()
    
    // Delete main user document
    batch.delete(db.collection('users').doc(userId))
    
    // Delete analysis history subcollection
    const analysisHistorySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('analysisHistory')
      .get()
    
    analysisHistorySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Delete watchlist collection
    const watchlistSnapshot = await db
      .collection('watchlist')
      .doc(userId)
      .collection('tokens')
      .get()
    
    watchlistSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Delete watchlist parent document
    batch.delete(db.collection('watchlist').doc(userId))
    
    // Delete alerts collection
    const alertsSnapshot = await db
      .collection('alerts')
      .doc(userId)
      .collection('notifications')
      .get()
    
    alertsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Delete alerts parent document
    batch.delete(db.collection('alerts').doc(userId))
    
    // Delete portfolio data if exists
    const portfolioSnapshot = await db
      .collection('portfolios')
      .where('userId', '==', userId)
      .get()
    
    portfolioSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    
    console.log('[GDPR Deletion] Firestore data deleted for user:', userId)
    
    // 2. Log deletion for compliance audit trail
    await db.collection('deletionLogs').add({
      userId: userId,
      email: decodedToken.email,
      deletedAt: new Date(),
      reason: 'User requested account deletion (GDPR Article 17)',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })
    
    console.log('[GDPR Deletion] Deletion logged for audit trail')
    
    // 3. Delete from Firebase Authentication (this will also sign out the user)
    await auth.deleteUser(userId)
    
    console.log('[GDPR Deletion] Firebase Auth user deleted:', userId)
    
    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted in compliance with GDPR Article 17',
      deletedAt: new Date().toISOString(),
      dataRemoved: {
        userProfile: true,
        analysisHistory: true,
        watchlist: true,
        alerts: true,
        portfolio: true,
        authentication: true,
      }
    })
    
  } catch (error) {
    console.error('[GDPR Deletion] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
