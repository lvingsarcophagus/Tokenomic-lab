/**
 * Admin API: View all cached data
 * GET /api/admin/cache-data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Check if user is admin
    const adminDb = getAdminDb()
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()
    
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'timestamp'
    const order = searchParams.get('order') || 'desc'
    const searchQuery = searchParams.get('search') || ''

    // Fetch cached tokens
    let query = adminDb.collection('tokenCache')
      .orderBy(sortBy === 'timestamp' ? 'cachedAt' : sortBy, order as any)
      .limit(limit)

    const snapshot = await query.get()
    
    let cacheData = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        address: data.address || doc.id,
        chain: data.chain || 'unknown',
        symbol: data.symbol || 'N/A',
        name: data.name || 'N/A',
        riskScore: data.riskScore || 0,
        cachedAt: data.cachedAt?.toDate?.()?.toISOString() || null,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
        hitCount: data.hitCount || 0,
        lastAccessed: data.lastAccessed?.toDate?.()?.toISOString() || null,
        dataSize: JSON.stringify(data).length,
        hasAIAnalysis: !!data.ai_insights,
        hasPriceData: !!data.priceData,
        hasSecurityData: !!data.securityData,
      }
    })

    // Apply search filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      cacheData = cacheData.filter(item => 
        item.address.toLowerCase().includes(query) ||
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.chain.toLowerCase().includes(query)
      )
    }

    // Calculate statistics
    const totalSize = cacheData.reduce((sum, item) => sum + item.dataSize, 0)
    const totalHits = cacheData.reduce((sum, item) => sum + item.hitCount, 0)
    const avgHits = cacheData.length > 0 ? totalHits / cacheData.length : 0

    // Get total count
    const totalCount = await adminDb.collection('tokenCache').count().get()

    return NextResponse.json({
      success: true,
      data: cacheData,
      stats: {
        totalEntries: totalCount.data().count,
        returnedEntries: cacheData.length,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        totalHits: totalHits,
        avgHitsPerEntry: avgHits.toFixed(2),
        withAIAnalysis: cacheData.filter(d => d.hasAIAnalysis).length,
        withPriceData: cacheData.filter(d => d.hasPriceData).length,
        withSecurityData: cacheData.filter(d => d.hasSecurityData).length,
      }
    })
  } catch (error: any) {
    console.error('Error fetching cache data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cache data' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/cache-data?address=xxx
 * Delete specific cache entry
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Check if user is admin
    const adminDb = getAdminDb()
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()
    
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    const deleteAll = searchParams.get('all') === 'true'

    if (deleteAll) {
      // Delete all cache entries
      const snapshot = await adminDb.collection('tokenCache').get()
      const batch = adminDb.batch()
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${snapshot.size} cache entries`,
        deleted: snapshot.size
      })
    } else if (address) {
      // Delete specific entry
      await adminDb.collection('tokenCache').doc(address.toLowerCase()).delete()
      
      return NextResponse.json({
        success: true,
        message: `Deleted cache entry for ${address}`,
        deleted: 1
      })
    } else {
      return NextResponse.json(
        { error: 'Missing address or all parameter' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting cache:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete cache' },
      { status: 500 }
    )
  }
}
