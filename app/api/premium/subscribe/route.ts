/**
 * Premium Subscription via x402
 * One-time payment for monthly premium access
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment, type X402Config } from '@/lib/middleware/x402';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

// Get testnet setting from Firestore (falls back to env var)
async function getX402Config(): Promise<X402Config> {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection('admin_settings').doc('x402').get();
    const settings = settingsDoc.data();
    
    const useTestnet = settings?.useTestnet ?? false; // Default to mainnet
    const recipientAddress = settings?.recipientAddress || process.env.X402_RECIPIENT_ADDRESS || 'UpBuwdHP6en13y8HW9en9rHAVxLNU8X4MNgKtgH4FUS';
    const price = settings?.price || '29.00';
    const asset = settings?.asset || 'USDC'; // Default to USDC
    
    console.log('[Premium Subscribe] Mode:', useTestnet ? 'TESTNET' : 'MAINNET');
    console.log('[Premium Subscribe] Price:', price, asset);
    console.log('[Premium Subscribe] Recipient:', recipientAddress);
    
    return {
      endpoint: '/api/premium/subscribe',
      price,
      asset, // Use the asset from settings
      chain: 'solana',
      recipientAddress,
    };
  } catch (error) {
    console.error('[Premium Subscribe] Failed to load settings:', error);
    // Fallback to mainnet defaults
    return {
      endpoint: '/api/premium/subscribe',
      price: '29.00',
      asset: 'USDC',
      chain: 'solana',
      recipientAddress: process.env.X402_RECIPIENT_ADDRESS || 'UpBuwdHP6en13y8HW9en9rHAVxLNU8X4MNgKtgH4FUS',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get config from Firestore
    const config = await getX402Config();

    // Check for payment proof
    const hasPaidHeader = request.headers.get('X-Payment-TxHash');
    
    console.log('[Premium Subscribe] Payment header present?', !!hasPaidHeader);

    if (!hasPaidHeader) {
      // No payment, return 402 with payment details
      console.log('[Premium Subscribe] Returning 402 with address:', config.recipientAddress);
      
      const headers: Record<string, string> = {
        'X-Payment-Required': 'true',
        'X-Payment-Price': config.price,
        'X-Payment-Asset': config.asset,
        'X-Payment-Chain': config.chain,
        'X-Payment-Address': config.recipientAddress,
        'X-Payment-Nonce': `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      };

      return NextResponse.json(
        {
          error: 'Payment Required',
          message: `Premium subscription requires payment of ${config.price} ${config.asset}`,
          payment: {
            price: config.price,
            asset: config.asset,
            chain: config.chain,
            address: config.recipientAddress,
          },
        },
        { status: 402, headers }
      );
    }

    // Verify payment
    console.log('[Premium Subscribe] Verifying payment...');
    const verification = await verifyPayment(request, config);

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid payment', details: verification.error },
        { status: 402 }
      );
    }

    console.log('[Premium Subscribe] Payment verified:', verification.txHash);

    // Upgrade user to premium
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

    const db = getAdminDb();
    
    await db.collection('users').doc(userId).update({
      tier: 'pro',
      plan: 'PREMIUM',
      subscriptionStatus: 'active',
      subscriptionStart: new Date(),
      subscriptionExpiry: expiryDate,
      paymentMethod: 'x402',
      lastPaymentTxHash: verification.txHash,
      lastPaymentAmount: config.price,
      lastPaymentDate: new Date(),
      updatedAt: new Date(),
    });

    // Log the subscription
    await db.collection('subscriptions').add({
      userId,
      txHash: verification.txHash,
      amount: config.price,
      asset: config.asset,
      chain: config.chain,
      tier: 'pro',
      startDate: new Date(),
      expiryDate,
      status: 'active',
      createdAt: new Date(),
    });

    console.log(`[Premium Subscribe] User ${userId} upgraded to premium until ${expiryDate.toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      tier: 'pro',
      expiryDate: expiryDate.toISOString(),
      txHash: verification.txHash,
    });
  } catch (error: any) {
    console.error('[Premium Subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Subscription failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
