/**
 * x402 Payment Protocol Middleware
 * Implements HTTP 402 Payment Required for paid API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

export interface X402Config {
  endpoint: string;
  price: string; // e.g., "0.01"
  asset: string; // e.g., "USDC"
  chain: 'solana' | 'ethereum' | 'polygon' | 'bsc';
  recipientAddress: string;
}

export interface X402Headers {
  'X-Payment-Required': 'true';
  'X-Payment-Price': string;
  'X-Payment-Asset': string;
  'X-Payment-Chain': string;
  'X-Payment-Address': string;
  'X-Payment-Nonce': string;
}

/**
 * Generate a unique payment nonce for tracking
 */
function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create x402 payment required response
 */
export function createPaymentRequiredResponse(config: X402Config): NextResponse {
  const nonce = generateNonce();
  
  const headers: Record<string, string> = {
    'X-Payment-Required': 'true',
    'X-Payment-Price': config.price,
    'X-Payment-Asset': config.asset,
    'X-Payment-Chain': config.chain,
    'X-Payment-Address': config.recipientAddress,
    'X-Payment-Nonce': nonce,
  };

  return NextResponse.json(
    {
      error: 'Payment Required',
      message: `This endpoint requires payment of ${config.price} ${config.asset} on ${config.chain}`,
      payment: {
        price: config.price,
        asset: config.asset,
        chain: config.chain,
        address: config.recipientAddress,
        nonce,
      },
    },
    { status: 402, headers }
  );
}

/**
 * Verify payment proof from request headers
 */
export async function verifyPayment(
  request: NextRequest,
  config: X402Config
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  const txHash = request.headers.get('X-Payment-TxHash');
  const nonce = request.headers.get('X-Payment-Nonce');

  if (!txHash || !nonce) {
    return { valid: false, error: 'Missing payment proof' };
  }

  try {
    // Verify transaction on-chain based on chain type
    if (config.chain === 'solana') {
      return await verifySolanaPayment(txHash, config);
    } else {
      return await verifyEvmPayment(txHash, config);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return { valid: false, error: 'Payment verification failed' };
  }
}

/**
 * Verify Solana payment using Helius
 */
async function verifySolanaPayment(
  txHash: string,
  config: X402Config
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  const heliusApiKey = process.env.HELIUS_API_KEY;
  if (!heliusApiKey) {
    return { valid: false, error: 'Helius API not configured' };
  }

  // Check testnet mode from Firestore (falls back to env var)
  let isTestnet = process.env.X402_USE_TESTNET === 'true';
  
  try {
    // Try to get setting from Firestore
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();
    const settingsDoc = await db.collection('admin_settings').doc('x402').get();
    const settings = settingsDoc.data();
    if (settings && typeof settings.useTestnet === 'boolean') {
      isTestnet = settings.useTestnet;
    }
  } catch (error) {
    console.log('[x402] Using env var for testnet setting');
  }
  
  console.log('[x402] Using endpoint:', isTestnet ? 'DEVNET' : 'MAINNET');
  console.log('[x402] Verifying transaction:', txHash);

  // For devnet, use Solana RPC directly instead of Helius enhanced API
  if (isTestnet) {
    const rpcUrl = `https://api.devnet.solana.com`;
    console.log('[x402] Using Solana devnet RPC');
    console.log('[x402] Transaction hash:', txHash);
    
    // Retry up to 10 times with 2 second delays (20 seconds total for devnet)
    for (let attempt = 1; attempt <= 10; attempt++) {
      console.log(`[x402] Attempt ${attempt}/10 - waiting 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            txHash,
            { encoding: 'json', maxSupportedTransactionVersion: 0 }
          ]
        }),
      });

      if (!response.ok) {
        console.log('[x402] RPC request failed:', response.status);
        continue;
      }

      const data = await response.json();
      console.log(`[x402] Attempt ${attempt} response:`, data.result ? 'FOUND' : 'null');
      
      if (data.error) {
        console.log('[x402] RPC error:', data.error);
        // Don't fail immediately on error, keep retrying
        continue;
      }

      if (data.result) {
        console.log('[x402] TESTNET transaction confirmed!');
        console.log('[x402] Transaction details:', JSON.stringify(data.result, null, 2));
        return { valid: true, txHash };
      }
    }

    console.log('[x402] Transaction not found after 10 attempts (20 seconds)');
    return { valid: false, error: 'Transaction not confirmed yet. Please wait a moment and try refreshing the page.' };
  }

  // Wait for mainnet transaction
  await new Promise(resolve => setTimeout(resolve, 2000));

  // For mainnet, use Helius enhanced API
  const heliusEndpoint = `https://api.helius.xyz/v0/transactions/?api-key=${heliusApiKey}`;
  const response = await fetch(
    heliusEndpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [txHash] }),
    }
  );

  if (!response.ok) {
    return { valid: false, error: 'Failed to fetch transaction' };
  }

  const data = await response.json();
  const tx = Array.isArray(data) ? data[0] : data;
  
  if (!tx) {
    return { valid: false, error: 'Transaction not found' };
  }

  console.log('[x402] Transaction data:', JSON.stringify(tx, null, 2));
  
  // Verify transaction details
  const expectedAmount = parseFloat(config.price);
  const recipient = config.recipientAddress.toLowerCase();
  
  if (isTestnet) {
    console.log('[x402] TESTNET mode - lenient verification');
    // Just verify the transaction exists and is confirmed
    if (tx.signature || tx.transactionHash) {
      console.log('[x402] TESTNET payment accepted');
      return { valid: true, txHash };
    }
  }

  // Check native transfers or token transfers
  const nativeTransfers = tx.nativeTransfers || [];
  const tokenTransfers = tx.tokenTransfers || [];

  console.log('[x402] Native transfers:', nativeTransfers.length);
  console.log('[x402] Token transfers:', tokenTransfers.length);

  // Check native SOL transfers
  for (const transfer of nativeTransfers) {
    const toAccount = (transfer.toUserAccount || '').toLowerCase();
    console.log('[x402] Checking native transfer to:', toAccount, 'amount:', transfer.amount);
    
    if (
      toAccount === recipient &&
      transfer.amount >= expectedAmount * 1e9 // SOL has 9 decimals
    ) {
      console.log('[x402] Native SOL payment verified!');
      return { valid: true, txHash };
    }
  }

  // Check USDC/token transfers (6 decimals for USDC)
  for (const transfer of tokenTransfers) {
    const toAccount = (transfer.toUserAccount || '').toLowerCase();
    console.log('[x402] Checking token transfer to:', toAccount, 'amount:', transfer.tokenAmount);
    
    if (
      toAccount === recipient &&
      transfer.tokenAmount >= expectedAmount * 1e6 // USDC has 6 decimals
    ) {
      console.log('[x402] Token payment verified!');
      return { valid: true, txHash };
    }
  }

  console.log('[x402] Payment verification failed - no matching transfers found');
  return { valid: false, error: 'Payment amount or recipient mismatch' };
}

/**
 * Verify EVM payment using Moralis
 */
async function verifyEvmPayment(
  txHash: string,
  config: X402Config
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  const moralisApiKey = process.env.MORALIS_API_KEY;
  if (!moralisApiKey) {
    return { valid: false, error: 'Moralis API not configured' };
  }

  // Map chain to Moralis chain ID
  const chainMap: Record<string, string> = {
    ethereum: '0x1',
    polygon: '0x89',
    bsc: '0x38',
  };

  const chainId = chainMap[config.chain];
  if (!chainId) {
    return { valid: false, error: 'Unsupported chain' };
  }

  const response = await fetch(
    `https://deep-index.moralis.io/api/v2/transaction/${txHash}?chain=${chainId}`,
    {
      headers: { 'X-API-Key': moralisApiKey },
    }
  );

  if (!response.ok) {
    return { valid: false, error: 'Failed to fetch transaction' };
  }

  const tx = await response.json();

  // Verify recipient and amount
  const expectedAmount = parseFloat(config.price);
  const recipient = config.recipientAddress.toLowerCase();

  if (tx.to_address?.toLowerCase() === recipient) {
    const value = parseFloat(tx.value) / 1e18; // ETH/BNB/MATIC have 18 decimals
    if (value >= expectedAmount) {
      return { valid: true, txHash };
    }
  }

  return { valid: false, error: 'Payment amount or recipient mismatch' };
}

/**
 * x402 middleware wrapper for API routes
 */
export function withX402Payment(
  config: X402Config,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check if payment proof is provided
    const hasPaidHeader = request.headers.get('X-Payment-TxHash');

    if (!hasPaidHeader) {
      // No payment proof, return 402
      return createPaymentRequiredResponse(config);
    }

    // Verify payment
    const verification = await verifyPayment(request, config);

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid payment', details: verification.error },
        { status: 402 }
      );
    }

    // Payment verified, proceed with handler
    return handler(request);
  };
}
