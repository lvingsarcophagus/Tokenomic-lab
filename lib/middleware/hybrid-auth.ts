/**
 * Hybrid Authentication Middleware
 * Supports both traditional Firebase auth AND x402 pay-per-use
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment, createPaymentRequiredResponse, type X402Config } from './x402';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export interface HybridAuthConfig extends X402Config {
  allowFreeUsers?: boolean; // Allow FREE tier users without payment
  allowPremiumUsers?: boolean; // Allow PREMIUM users without payment
  requirePaymentForFree?: boolean; // Force FREE users to pay
}

/**
 * Check if user is authenticated via Firebase
 */
async function verifyFirebaseAuth(
  request: NextRequest
): Promise<{ authenticated: boolean; userId?: string; plan?: string; error?: string }> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No auth token' };
    }

    const token = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user profile from Firestore
    const db = getAdminDb();
    const userDoc = await db
      .collection('users')
      .doc(decodedToken.uid)
      .get();

    const userData = userDoc.data();
    const plan = userData?.plan || 'FREE';

    return {
      authenticated: true,
      userId: decodedToken.uid,
      plan,
    };
  } catch (error) {
    console.error('Firebase auth error:', error);
    return { authenticated: false, error: 'Invalid token' };
  }
}

/**
 * Hybrid middleware: Accept either Firebase auth OR x402 payment
 */
export function withHybridAuth(
  config: HybridAuthConfig,
  handler: (request: NextRequest, context?: { userId?: string; plan?: string; paidViaX402?: boolean }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check for x402 payment proof first
    const hasPaidHeader = request.headers.get('X-Payment-TxHash');

    if (hasPaidHeader) {
      // User is attempting to pay via x402
      console.log('[Hybrid Auth] x402 payment detected, verifying...');
      
      const verification = await verifyPayment(request, config);

      if (!verification.valid) {
        return NextResponse.json(
          { error: 'Invalid payment', details: verification.error },
          { status: 402 }
        );
      }

      console.log('[Hybrid Auth] x402 payment verified:', verification.txHash);
      
      // Payment verified, proceed with handler
      return handler(request, { paidViaX402: true });
    }

    // No x402 payment, check Firebase auth
    const auth = await verifyFirebaseAuth(request);

    if (auth.authenticated) {
      // User is authenticated via Firebase
      const { userId, plan } = auth;

      // Check if user's plan allows free access
      if (plan === 'PREMIUM' && config.allowPremiumUsers !== false) {
        console.log('[Hybrid Auth] PREMIUM user, allowing free access');
        return handler(request, { userId, plan });
      }

      if (plan === 'FREE' && config.allowFreeUsers && !config.requirePaymentForFree) {
        console.log('[Hybrid Auth] FREE user, allowing free access');
        return handler(request, { userId, plan });
      }

      // FREE user but payment required
      if (plan === 'FREE' && config.requirePaymentForFree) {
        console.log('[Hybrid Auth] FREE user, payment required');
        return createPaymentRequiredResponse(config);
      }

      // Default: allow access
      return handler(request, { userId, plan });
    }

    // No auth and no payment - require payment
    console.log('[Hybrid Auth] No auth or payment, returning 402');
    return createPaymentRequiredResponse(config);
  };
}

/**
 * Pay-per-use wrapper for existing endpoints
 * Allows anonymous users to pay per request
 */
export function withPayPerUse(
  config: Omit<X402Config, 'endpoint'>,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const fullConfig: X402Config = {
    ...config,
    endpoint: '', // Will be set from request URL
  };

  return async (request: NextRequest): Promise<NextResponse> => {
    fullConfig.endpoint = request.nextUrl.pathname;

    // Check for payment proof
    const hasPaidHeader = request.headers.get('X-Payment-TxHash');

    if (!hasPaidHeader) {
      // No payment, return 402
      return createPaymentRequiredResponse(fullConfig);
    }

    // Verify payment
    const verification = await verifyPayment(request, fullConfig);

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid payment', details: verification.error },
        { status: 402 }
      );
    }

    // Payment verified, proceed
    return handler(request);
  };
}
