import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
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
    
    console.log('[GDPR Export] Starting data export for user:', userId)
    
    // Fetch all user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    
    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 })
    }
    
    // Fetch analysis history
    const analysisHistorySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('analysisHistory')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get()
    
    const analysisHistory = analysisHistorySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null
    }))
    
    // Fetch watchlist
    const watchlistSnapshot = await db
      .collection('watchlist')
      .doc(userId)
      .collection('tokens')
      .get()
    
    const watchlist = watchlistSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate?.()?.toISOString() || null,
      lastUpdatedAt: doc.data().lastUpdatedAt?.toDate?.()?.toISOString() || null
    }))
    
    // Fetch alerts
    const alertsSnapshot = await db
      .collection('alerts')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    
    const alerts = alertsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }))
    
    // Compile complete data export
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      legalBasis: 'GDPR Article 15 (Right to Access) & Article 20 (Data Portability)',
      
      account: {
        userId: userId,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || null,
        lastLoginAt: userData.lastLoginAt?.toDate?.()?.toISOString() || null,
        plan: userData.plan || 'FREE',
      },
      
      subscription: {
        status: userData.subscription?.status || 'N/A',
        startDate: userData.subscription?.startDate?.toDate?.()?.toISOString() || null,
        endDate: userData.subscription?.endDate?.toDate?.()?.toISOString() || null,
        autoRenew: userData.subscription?.autoRenew || false,
      },
      
      usage: {
        tokensAnalyzed: userData.usage?.tokensAnalyzed || 0,
        lastResetDate: userData.usage?.lastResetDate?.toDate?.()?.toISOString() || null,
        dailyLimit: userData.usage?.dailyLimit || 10,
      },
      
      preferences: {
        notifications: userData.preferences?.notifications ?? true,
        emailAlerts: userData.preferences?.emailAlerts ?? true,
        theme: userData.preferences?.theme || 'system',
      },
      
      activity: {
        analysisHistory: analysisHistory,
        totalAnalyses: analysisHistory.length,
        watchlist: watchlist,
        watchlistCount: watchlist.length,
        alerts: alerts,
        alertCount: alerts.length,
      },
      
      dataProcessing: {
        dataRetentionPeriod: '90 days for search history, indefinite for account data',
        dataLocation: 'Firebase servers (US/EU regions)',
        thirdPartyProcessors: [
          'Firebase/Google Cloud (hosting & database)',
          'Moralis (blockchain data)',
          'Mobula (market data)',
          'Helius (Solana data)',
          'GoPlus Labs (security analysis)',
        ],
        dataPurpose: 'Token risk analysis, user authentication, platform functionality',
        legalBasis: 'Consent (GDPR Article 6.1.a) and Contract (GDPR Article 6.1.b)',
      },
      
      gdprRights: {
        rightToAccess: 'Exercised by this data export',
        rightToRectification: 'Update data in your account settings',
        rightToErasure: 'Delete account in privacy settings',
        rightToRestriction: 'Contact support@tokenomicslab.com',
        rightToDataPortability: 'This export file (JSON format)',
        rightToObject: 'Unsubscribe from emails or contact support',
      }
    }
    
    console.log('[GDPR Export] Export completed for user:', userId)
    
    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tokenomicslab-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
    
  } catch (error) {
    console.error('[GDPR Export] Error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
