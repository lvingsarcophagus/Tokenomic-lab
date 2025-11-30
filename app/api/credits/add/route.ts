import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { withX402Payment } from '@/lib/middleware/x402'

/**
 * POST /api/credits/add
 * Add credits to user account after x402 payment
 */
async function handleAddCredits(request: NextRequest) {
  try {
    console.log('[handleAddCredits] Starting...')
    
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()
    console.log('[handleAddCredits] Firebase Admin initialized')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[handleAddCredits] Missing or invalid auth header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    console.log('[handleAddCredits] Verifying Firebase token...')
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid
    console.log('[handleAddCredits] User ID:', userId)

    let body
    try {
      body = await request.json()
    } catch (e) {
      // Body might have been read already, try to get from clone
      console.log('[handleAddCredits] Body already read, using cached data')
      body = (request as any).cachedBody || {}
    }
    const { amount, transactionId, credits: providedCredits } = body
    console.log('[handleAddCredits] Body:', { amount, transactionId, providedCredits })

    if (!amount || amount <= 0) {
      console.error('[handleAddCredits] Invalid amount:', amount)
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Calculate credits (1 credit = €0.10, so €5 = 50 credits)
    // Use provided credits if available (from POST wrapper), otherwise calculate
    const credits = providedCredits || Math.floor(amount * 10)
    console.log('[handleAddCredits] Calculated credits:', credits)

    // Update user document
    const userRef = adminDb.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentCredits = userDoc.data()?.credits || 0

    await userRef.update({
      credits: FieldValue.increment(credits),
      'usage.dailyLimit': -1, // Unlimited scans for PAY_PER_USE
      updatedAt: FieldValue.serverTimestamp()
    })

    // Log transaction
    const db = getAdminDb()
    await db.collection('credit_transactions').add({
      userId,
      amount,
      credits,
      transactionId,
      type: 'purchase',
      status: 'completed',
      createdAt: FieldValue.serverTimestamp()
    })

    // Log activity
    const userEmail = userDoc.data()?.email || 'unknown'
    await db.collection('activity_logs').add({
      userId,
      userEmail,
      action: 'credits_purchased',
      details: `Purchased ${credits} credits for $${amount}`,
      metadata: {
        amount,
        credits,
        transactionId,
        balanceBefore: currentCredits,
        balanceAfter: currentCredits + credits
      },
      timestamp: FieldValue.serverTimestamp(),
      userAgent: request.headers.get('user-agent') || 'Unknown'
    })

    console.log(`✅ Added ${credits} credits to user ${userId} (transaction: ${transactionId})`)

    return NextResponse.json({
      success: true,
      credits: currentCredits + credits,
      added: credits
    })
  } catch (error: any) {
    console.error('❌ Error adding credits:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add credits' },
      { status: 500 }
    )
  }
}

/**
 * Wrap handler with x402 payment middleware
 * Price and recipient will be fetched from admin settings
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Credits Add] Starting request processing...')
    
    // Clone request to read body multiple times
    const clonedRequest = request.clone()
    
    // Get payment asset from header (SOL or USDC)
    const selectedAsset = request.headers.get('X-Payment-Asset') || 'USDC'
    console.log('[Credits Add] Selected asset:', selectedAsset)
    
    // Get amount from request body to calculate price
    const body = await clonedRequest.json()
    const { amount } = body
    console.log('[Credits Add] Amount:', amount)
    
    if (!amount || amount <= 0) {
      console.error('[Credits Add] Invalid amount:', amount)
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    
    // Get x402 settings from Firestore
    console.log('[Credits Add] Fetching x402 settings...')
    const db = getAdminDb()
    const settingsDoc = await db.collection('admin_settings').doc('x402').get()
    const settings = settingsDoc.data()
    
    if (!settings) {
      console.error('[Credits Add] Payment system not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }
    
    console.log('[Credits Add] Settings loaded:', {
      hasUsdcAddress: !!settings.usdcRecipientAddress,
      hasSolAddress: !!settings.solRecipientAddress
    })
    
    const recipientAddress = selectedAsset === 'USDC' 
      ? settings.usdcRecipientAddress 
      : settings.solRecipientAddress
    
    if (!recipientAddress) {
      console.error(`[Credits Add] ${selectedAsset} recipient address not configured`)
      return NextResponse.json({ 
        error: `${selectedAsset} payments not configured. Please contact support.` 
      }, { status: 500 })
    }
    
    console.log('[Credits Add] Recipient address:', recipientAddress)
    
    // Convert EUR to crypto amount
    const EUR_TO_USD = 1.09
    const SOL_PRICE_USD = 140 // Should be fetched from API in production
    const USDC_PRICE_USD = 1
    
    // Ensure amount is a number
    const eurAmount = parseFloat(amount.toString())
    const usdAmount = eurAmount * EUR_TO_USD
    let cryptoAmount: number
    
    if (selectedAsset === 'SOL') {
      cryptoAmount = usdAmount / SOL_PRICE_USD
      console.log('[Credits Add] SOL calculation:', { usdAmount, SOL_PRICE_USD, result: cryptoAmount })
    } else {
      cryptoAmount = usdAmount / USDC_PRICE_USD
    }
    
    console.log('[Credits Add] Conversion:', {
      eurAmount: amount,
      usdAmount,
      cryptoAmount,
      asset: selectedAsset
    })
    
    // Create x402 config with crypto price
    const x402Config = {
      endpoint: '/api/credits/add',
      price: cryptoAmount.toFixed(selectedAsset === 'SOL' ? 6 : 2),
      asset: selectedAsset,
      chain: 'solana' as const,
      recipientAddress
    }
    
    console.log('[Credits Add] x402 config:', x402Config)
    
    // Wrap with x402 middleware
    console.log('[Credits Add] Wrapping with x402 middleware...')
    const handler = withX402Payment(x402Config, handleAddCredits)
    
    return handler(request)
  } catch (error: any) {
    console.error('❌ [Credits Add] Error in POST handler:', error)
    console.error('❌ [Credits Add] Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
