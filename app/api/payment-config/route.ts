/**
 * Public endpoint to get payment configuration
 * Used by frontend to determine testnet/mainnet mode
 */

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection('admin_settings').doc('x402').get();
    const settings = settingsDoc.data();

    // Fallback to env var if not in Firestore
    const useTestnet = settings?.useTestnet ?? (process.env.X402_USE_TESTNET === 'true');

    return NextResponse.json({
      useTestnet,
      chain: 'solana',
    });
  } catch (error: any) {
    console.error('[Payment Config] Error:', error);
    // Fallback to env var on error
    return NextResponse.json({
      useTestnet: process.env.X402_USE_TESTNET === 'true',
      chain: 'solana',
    });
  }
}
