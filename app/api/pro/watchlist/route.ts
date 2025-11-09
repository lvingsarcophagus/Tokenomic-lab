import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

/**
 * PRO API: Watchlist Management
 * GET - Get user's watchlist
 * POST - Add token to watchlist
 * DELETE - Remove token from watchlist
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // Check if user is premium
    const customClaims = decodedToken as any
    if (!customClaims.isPremium && !customClaims.admin) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    // Get watchlist from Firestore
    const db = getAdminDb()
    const watchlistRef = db.collection('watchlists').doc(uid)
    const watchlistDoc = await watchlistRef.get()

    if (!watchlistDoc.exists) {
      return NextResponse.json({ tokens: [] })
    }

    const tokens = watchlistDoc.data()?.tokens || []

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // Check if user is premium
    const customClaims = decodedToken as any
    if (!customClaims.isPremium && !customClaims.admin) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    const body = await request.json()
    const { tokenAddress } = body

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 })
    }

    // Fetch token data (simplified - you'd call your token analysis API here)
    const tokenData = {
      address: tokenAddress,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      riskScore: 50,
      priceChange24h: 0,
      marketCap: 0,
      addedAt: new Date().toISOString(),
      alerts: 0
    }

    // Add to watchlist
    const db = getAdminDb()
    const watchlistRef = db.collection('watchlists').doc(uid)
    const watchlistDoc = await watchlistRef.get()

    let tokens = []
    if (watchlistDoc.exists) {
      tokens = watchlistDoc.data()?.tokens || []
    }

    // Check if token already exists
    const existingIndex = tokens.findIndex((t: any) => t.address === tokenAddress)
    if (existingIndex !== -1) {
      return NextResponse.json({ error: 'Token already in watchlist' }, { status: 400 })
    }

    tokens.push(tokenData)

    await watchlistRef.set({ tokens, updatedAt: new Date().toISOString() }, { merge: true })

    return NextResponse.json({ success: true, token: tokenData })
  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // Check if user is premium
    const customClaims = decodedToken as any
    if (!customClaims.isPremium && !customClaims.admin) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    const body = await request.json()
    const { tokenAddress } = body

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 })
    }

    // Remove from watchlist
    const db = getAdminDb()
    const watchlistRef = db.collection('watchlists').doc(uid)
    const watchlistDoc = await watchlistRef.get()

    if (!watchlistDoc.exists) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    let tokens = watchlistDoc.data()?.tokens || []
    tokens = tokens.filter((t: any) => t.address !== tokenAddress)

    await watchlistRef.set({ tokens, updatedAt: new Date().toISOString() }, { merge: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
