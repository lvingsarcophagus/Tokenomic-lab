/**
 * Admin API for x402 payment settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user is admin
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get current settings from Firestore
    const settingsDoc = await db.collection('admin_settings').doc('x402').get();
    const settings = settingsDoc.data() || {
      useTestnet: process.env.X402_USE_TESTNET === 'true',
      recipientAddress: process.env.X402_RECIPIENT_ADDRESS || '',
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('[Admin x402 Settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings', message: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user is admin
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { useTestnet, recipientAddress, price, asset, solRecipientAddress, usdcRecipientAddress } = body;

    // Determine asset based on testnet mode if not explicitly provided
    const paymentAsset = asset || (useTestnet ? 'SOL' : 'USDC');

    // Update settings in Firestore with both legacy and new fields
    await db.collection('admin_settings').doc('x402').set({
      useTestnet: useTestnet ?? false,
      recipientAddress: recipientAddress || process.env.X402_RECIPIENT_ADDRESS || '',
      // Store separate addresses for SOL and USDC
      solRecipientAddress: solRecipientAddress || (paymentAsset === 'SOL' ? recipientAddress : '') || process.env.X402_SOL_RECIPIENT_ADDRESS || '',
      usdcRecipientAddress: usdcRecipientAddress || (paymentAsset === 'USDC' ? recipientAddress : '') || process.env.X402_USDC_RECIPIENT_ADDRESS || '',
      price: price || '29.00',
      asset: paymentAsset,
      updatedAt: new Date(),
      updatedBy: decodedToken.uid,
    }, { merge: true });

    console.log(`[Admin x402 Settings] Updated: testnet=${useTestnet}, address=${recipientAddress}, asset=${paymentAsset}`);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('[Admin x402 Settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', message: error?.message },
      { status: 500 }
    );
  }
}
