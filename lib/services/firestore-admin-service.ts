/**
 * Firestore Admin Service Layer
 * Server-side database operations using Firebase Admin SDK
 */

import { getAdminDb } from '../firebase-admin'
import type { AnalysisHistoryDocument } from '../firestore-schema'

/**
 * Save analysis history (server-side)
 */
export async function saveAnalysisHistoryAdmin(
  userId: string,
  analysis: Omit<AnalysisHistoryDocument, 'id'>
): Promise<void> {
  try {
    const db = getAdminDb()
    const historyRef = db
      .collection('analysis_history')
      .doc(userId)
      .collection('scans')
      .doc()

    await historyRef.set({
      ...analysis,
      analyzedAt: analysis.analyzedAt || new Date()
    })

    console.log(`[Firestore Admin] Saved analysis history for user ${userId}`)
  } catch (error) {
    console.error('[Firestore Admin] Save analysis history error:', error)
    throw error
  }
}

/**
 * Increment token analyzed count (server-side)
 */
export async function incrementTokenAnalyzedAdmin(userId: string): Promise<void> {
  try {
    const db = getAdminDb()
    const userRef = db.collection('users').doc(userId)

    await userRef.update({
      'usage.tokensAnalyzed': require('firebase-admin').firestore.FieldValue.increment(1)
    })

    console.log(`[Firestore Admin] Incremented token count for user ${userId}`)
  } catch (error) {
    console.error('[Firestore Admin] Increment token analyzed error:', error)
    throw error
  }
}
