/**
 * Example x402-protected API endpoint
 * Requires micro-payment to access premium analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { withX402Payment } from '@/lib/middleware/x402';

// Configure payment requirements
const X402_CONFIG = {
  endpoint: '/api/premium/paid-analysis',
  price: '0.01', // $0.01 in USDC
  asset: 'USDC',
  chain: 'solana' as const,
  recipientAddress: process.env.X402_RECIPIENT_ADDRESS || '',
};

async function handler(request: NextRequest) {
  try {
    const { tokenAddress, chain } = await request.json();

    if (!tokenAddress || !chain) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Perform premium analysis (this is now paid content)
    const analysis = {
      tokenAddress,
      chain,
      premiumInsights: {
        whaleActivity: 'High accumulation detected in last 24h',
        smartMoneyFlow: '+$2.3M net inflow from known smart wallets',
        socialSentiment: 'Bullish - 78% positive mentions',
        technicalSignals: ['Golden cross forming', 'RSI oversold recovery'],
      },
      riskScore: 35,
      recommendation: 'MODERATE BUY',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Paid analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

// Wrap handler with x402 payment middleware
export const POST = withX402Payment(X402_CONFIG, handler);
