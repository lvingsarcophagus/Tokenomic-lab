import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

const adminAuth = getAdminAuth()
const adminDb = getAdminDb()

const SETTINGS_DOC = 'platform_settings'
const SETTINGS_COLLECTION = 'system'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()
    
    if (!userData || (userData.role !== 'ADMIN' && userData.plan !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get auto-premium setting
    const settingsDoc = await adminDb
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC)
      .get()

    const settings = settingsDoc.data()
    const autoPremiumEnabled = settings?.autoPremiumEnabled || false

    return NextResponse.json({
      success: true,
      autoPremiumEnabled
    })
  } catch (error: any) {
    console.error('[Auto-Premium GET] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get auto-premium setting' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()
    
    if (!userData || (userData.role !== 'ADMIN' && userData.plan !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get the new setting value
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid enabled value' }, { status: 400 })
    }

    // Update the setting
    await adminDb
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC)
      .set(
        {
          autoPremiumEnabled: enabled,
          updatedAt: new Date(),
          updatedBy: decodedToken.uid
        },
        { merge: true }
      )

    console.log(`[Auto-Premium] Setting updated to: ${enabled} by admin ${decodedToken.email}`)

    return NextResponse.json({
      success: true,
      autoPremiumEnabled: enabled,
      message: `Auto-premium ${enabled ? 'enabled' : 'disabled'} successfully`
    })
  } catch (error: any) {
    console.error('[Auto-Premium POST] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update auto-premium setting' },
      { status: 500 }
    )
  }
}
