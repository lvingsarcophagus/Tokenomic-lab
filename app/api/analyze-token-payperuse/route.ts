/**
 * Pay-Per-Use Token Analysis Endpoint
 * Accepts x402 micro-payments for anonymous token scans
 * Price: $0.05 per scan (5 cents in USDC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPayPerUse } from '@/lib/middleware/hybrid-auth';
import { calculateRisk } from '@/lib/risk-calculator';
import { fetchCompleteTokenData } from '@/lib/data/chain-adaptive-fetcher';
import type { TokenData } from '@/lib/types/token-data';

const PAY_PER_USE_CONFIG = {
  price: '0.05', // $0.05 per scan
  asset: 'USDC',
  chain: 'solana' as const,
  recipientAddress: process.env.X402_RECIPIENT_ADDRESS || '',
};

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenAddress, chainId, metadata } = body;

    if (!tokenAddress || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenAddress and chainId' },
        { status: 400 }
      );
    }

    console.log(`[Pay-Per-Use] Analyzing ${tokenAddress} on chain ${chainId}`);

    // Fetch complete token data
    const completeData = await fetchCompleteTokenData(tokenAddress, chainId);

    // Convert to legacy format for risk calculator
    const tokenData: TokenData = {
      marketCap: completeData.marketCap,
      fdv: completeData.fdv,
      liquidityUSD: completeData.liquidityUSD,
      volume24h: completeData.volume24h,
      totalSupply: completeData.totalSupply,
      circulatingSupply: completeData.circulatingSupply,
      maxSupply: completeData.maxSupply,
      burnedSupply: completeData.burnedSupply,
      holderCount: completeData.holderCount,
      top10HoldersPct: completeData.top10HoldersPct,
      txCount24h: completeData.txCount24h,
      ageDays: completeData.ageDays,
      chain: completeData.chainType,
      is_honeypot: completeData.criticalFlags.some(f => f.toLowerCase().includes('honeypot')),
      is_mintable: completeData.criticalFlags.some(f => f.toLowerCase().includes('mintable')),
      owner_renounced: !completeData.criticalFlags.some(f => f.toLowerCase().includes('owner control')),
      freeze_authority_exists: completeData.criticalFlags.some(f => f.toLowerCase().includes('freeze authority')),
      buy_tax: 0,
      sell_tax: 0,
    };

    // Add tokenAddress for official token resolver
    (tokenData as any).tokenAddress = tokenAddress;

    // Calculate risk (use PREMIUM plan features for paid users)
    const result = await calculateRisk(tokenData, 'PREMIUM', metadata);

    console.log(`[Pay-Per-Use] Analysis complete: ${result.overall_risk_score}/100`);

    return NextResponse.json({
      success: true,
      payPerUse: true,
      price: PAY_PER_USE_CONFIG.price,
      asset: PAY_PER_USE_CONFIG.asset,
      ...result,
      raw_data: {
        marketCap: tokenData.marketCap,
        fdv: tokenData.fdv,
        liquidityUSD: tokenData.liquidityUSD,
        holderCount: tokenData.holderCount,
        top10HoldersPct: tokenData.top10HoldersPct,
        is_mintable: tokenData.is_mintable,
        owner_renounced: tokenData.owner_renounced,
      },
    });
  } catch (error: any) {
    console.error('[Pay-Per-Use] Error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Wrap with pay-per-use middleware
export const POST = withPayPerUse(PAY_PER_USE_CONFIG, handler);
