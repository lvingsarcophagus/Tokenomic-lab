/**
 * Cron job to clean up activity logs older than 30 days
 * Should be called daily via a cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getAdminDb()
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    console.log('[Cleanup] Deleting activity logs older than:', thirtyDaysAgo.toISOString())
    
    // Query logs older than 30 days
    const logsRef = db.collection('activity_logs')
    const oldLogsQuery = logsRef.where('timestamp', '<', thirtyDaysAgo)
    const oldLogsSnapshot = await oldLogsQuery.get()
    
    if (oldLogsSnapshot.empty) {
      console.log('[Cleanup] No old logs to delete')
      return NextResponse.json({
        success: true,
        message: 'No logs to delete',
        deleted: 0
      })
    }
    
    // Delete in batches of 500 (Firestore limit)
    const batchSize = 500
    let deletedCount = 0
    
    const deleteInBatches = async (snapshot: any) => {
      const batch = db.batch()
      snapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      return snapshot.size
    }
    
    // Process all old logs
    let currentSnapshot = oldLogsSnapshot
    while (!currentSnapshot.empty) {
      const deleted = await deleteInBatches(currentSnapshot)
      deletedCount += deleted
      
      // Get next batch if there are more
      if (currentSnapshot.size === batchSize) {
        const lastDoc = currentSnapshot.docs[currentSnapshot.docs.length - 1]
        currentSnapshot = await oldLogsQuery.startAfter(lastDoc).limit(batchSize).get()
      } else {
        break
      }
    }
    
    console.log(`[Cleanup] Successfully deleted ${deletedCount} old activity logs`)
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} logs older than 30 days`,
      deleted: deletedCount,
      cutoffDate: thirtyDaysAgo.toISOString()
    })
  } catch (error: any) {
    console.error('[Cleanup] Error cleaning up logs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup logs' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
