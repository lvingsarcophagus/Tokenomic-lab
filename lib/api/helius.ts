/**
 * Helius API Service (Solana)
 * Provides comprehensive Solana data using DAS API and Enhanced Transactions
 * Free tier includes: Token metadata, authorities, holder data, transaction history
 */

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface SolanaSecurityData {
  freezeAuthority: string | null;
  mintAuthority: string | null;
  programAuthority: string | null;
  supply?: number;
  decimals?: number;
  holderCount?: number;
}

export interface SolanaEnhancedData {
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
  };
  authorities: {
    freezeAuthority: string | null;
    mintAuthority: string | null;
    updateAuthority: string | null;
  };
  holders: {
    count: number;
    topHolders: Array<{
      address: string;
      balance: number;
      percentage: number;
    }>;
  };
  transactions: {
    count24h: number;
    volume24h: number;
    uniqueTraders24h: number;
  };
}

/**
 * Get Solana token authorities for security analysis
 */
export async function getHeliusSolanaData(
  tokenAddress: string
): Promise<SolanaSecurityData | null> {
  try {
    console.log(`[Helius] API key available: ${!!HELIUS_API_KEY}`);
    if (!HELIUS_API_KEY) {
      console.warn('[Helius] API key not configured');
      return null;
    }

    console.log(`[Helius] Fetching Solana data for ${tokenAddress}`);

    const response = await fetch(
      `${HELIUS_BASE_URL}/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mintAccounts: [tokenAddress]
        })
      }
    );

    if (!response.ok) {
      console.warn(`[Helius] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn('[Helius] No data returned for token');
      return null;
    }

    const tokenData = data[0];

    // Extract authorities and additional data
    const securityData: SolanaSecurityData = {
      freezeAuthority: tokenData.freezeAuthority || null,
      mintAuthority: tokenData.mintAuthority || null,
      programAuthority: tokenData.updateAuthority || null,
      supply: tokenData.supply || tokenData.tokenAmount?.amount,
      decimals: tokenData.decimals || tokenData.tokenAmount?.decimals,
      holderCount: tokenData.holderCount
    };

    console.log(`[Helius] Security data retrieved:`, {
      freezeAuthority: securityData.freezeAuthority ? 'Set' : 'Revoked',
      mintAuthority: securityData.mintAuthority ? 'Set' : 'Revoked',
      programAuthority: securityData.programAuthority ? 'Set' : 'Revoked',
      supply: securityData.supply ? 'Available' : 'N/A',
      decimals: securityData.decimals || 'N/A',
      holderCount: securityData.holderCount || 'N/A'
    });

    return securityData;
  } catch (error: any) {
    console.error('[Helius] Error fetching Solana data:', error.message);
    return null;
  }
}

/**
 * Get Solana token supply info
 */
export async function getHeliusSupplyInfo(
  tokenAddress: string
): Promise<{ supply: number; decimals: number } | null> {
  try {
    if (!HELIUS_API_KEY) {
      return null;
    }

    const response = await fetch(
      `${HELIUS_BASE_URL}/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mintAccounts: [tokenAddress]
        })
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const tokenData = data[0];

    return {
      supply: tokenData.supply || 0,
      decimals: tokenData.decimals || 9
    };
  } catch (error: any) {
    console.error('[Helius] Error fetching supply info:', error.message);
    return null;
  }
}


/**
 * Get comprehensive Solana token data using DAS API
 * Uses Helius free tier features for enhanced analysis
 */
export async function getHeliusEnhancedData(
  tokenAddress: string
): Promise<SolanaEnhancedData | null> {
  try {
    if (!HELIUS_API_KEY) {
      console.warn('[Helius] API key not configured for enhanced data');
      return null;
    }

    console.log(`[Helius] Fetching enhanced data for ${tokenAddress}`);

    // Fetch token metadata using DAS API
    const metadataResponse = await fetch(
      `${HELIUS_BASE_URL}/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [tokenAddress] })
      }
    );

    if (!metadataResponse.ok) {
      console.warn(`[Helius] Metadata fetch failed: ${metadataResponse.status}`);
      return null;
    }

    const metadataData = await metadataResponse.json();
    const tokenMeta = metadataData[0];

    if (!tokenMeta) {
      console.warn('[Helius] No metadata found for token');
      return null;
    }

    // Get token holders using RPC
    const holdersData = await getHeliusTokenHolders(tokenAddress);

    // Get recent transactions using Enhanced Transactions API
    const transactionsData = await getHeliusTransactions(tokenAddress);

    const enhancedData: SolanaEnhancedData = {
      metadata: {
        name: tokenMeta.onChainMetadata?.metadata?.data?.name || tokenMeta.offChainMetadata?.name || 'Unknown',
        symbol: tokenMeta.onChainMetadata?.metadata?.data?.symbol || tokenMeta.offChainMetadata?.symbol || 'UNKNOWN',
        decimals: tokenMeta.decimals || 9,
        supply: tokenMeta.supply || 0
      },
      authorities: {
        freezeAuthority: tokenMeta.freezeAuthority || null,
        mintAuthority: tokenMeta.mintAuthority || null,
        updateAuthority: tokenMeta.updateAuthority || null
      },
      holders: holdersData || {
        count: 0,
        topHolders: []
      },
      transactions: transactionsData || {
        count24h: 0,
        volume24h: 0,
        uniqueTraders24h: 0
      }
    };

    console.log(`[Helius] Enhanced data retrieved:`, {
      name: enhancedData.metadata.name,
      symbol: enhancedData.metadata.symbol,
      supply: enhancedData.metadata.supply,
      holderCount: enhancedData.holders.count,
      tx24h: enhancedData.transactions.count24h
    });

    return enhancedData;
  } catch (error: any) {
    console.error('[Helius] Error fetching enhanced data:', error.message);
    return null;
  }
}

/**
 * Get token holders using Helius RPC
 */
async function getHeliusTokenHolders(tokenAddress: string): Promise<{ count: number; topHolders: any[] } | null> {
  try {
    if (!HELIUS_API_KEY) return null;

    // Use getTokenAccounts RPC method to get holders
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-holders',
        method: 'getTokenLargestAccounts',
        params: [tokenAddress]
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.result && data.result.value) {
      const accounts = data.result.value;
      
      return {
        count: accounts.length,
        topHolders: accounts.slice(0, 10).map((acc: any, index: number) => ({
          address: acc.address,
          balance: acc.amount,
          percentage: 0 // Would need total supply to calculate
        }))
      };
    }

    return null;
  } catch (error) {
    console.error('[Helius] Error fetching holders:', error);
    return null;
  }
}

/**
 * Get recent transactions using Enhanced Transactions API
 */
async function getHeliusTransactions(tokenAddress: string): Promise<{ count24h: number; volume24h: number; uniqueTraders24h: number } | null> {
  try {
    if (!HELIUS_API_KEY) return null;

    // Get recent transactions for the token
    const response = await fetch(
      `${HELIUS_BASE_URL}/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=100`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) return null;

    const transactions = await response.json();
    
    if (!Array.isArray(transactions)) return null;

    // Filter transactions from last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recent24h = transactions.filter((tx: any) => {
      const txTime = tx.timestamp ? tx.timestamp * 1000 : 0;
      return txTime > oneDayAgo;
    });

    // Count unique traders
    const uniqueAddresses = new Set<string>();
    recent24h.forEach((tx: any) => {
      if (tx.feePayer) uniqueAddresses.add(tx.feePayer);
      if (tx.accountData) {
        tx.accountData.forEach((acc: any) => {
          if (acc.account) uniqueAddresses.add(acc.account);
        });
      }
    });

    return {
      count24h: recent24h.length,
      volume24h: 0, // Would need to parse transfer amounts
      uniqueTraders24h: uniqueAddresses.size
    };
  } catch (error) {
    console.error('[Helius] Error fetching transactions:', error);
    return null;
  }
}

/**
 * Get detailed transaction history with human-readable format
 * Uses Enhanced Transactions API for better UX
 */
export async function getHeliusTransactionHistory(
  tokenAddress: string,
  limit: number = 50
): Promise<any[] | null> {
  try {
    if (!HELIUS_API_KEY) return null;

    const response = await fetch(
      `${HELIUS_BASE_URL}/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) return null;

    const transactions = await response.json();
    return Array.isArray(transactions) ? transactions : null;
  } catch (error) {
    console.error('[Helius] Error fetching transaction history:', error);
    return null;
  }
}

/**
 * Get token price data from Helius DAS API
 * Free tier includes top 10k tokens by 24h volume
 */
export async function getHeliusTokenPrice(
  tokenAddress: string
): Promise<{ price: number; priceChange24h: number } | null> {
  try {
    if (!HELIUS_API_KEY) return null;

    // Use DAS API to get token metadata which includes price for verified tokens
    const response = await fetch(
      `${HELIUS_BASE_URL}/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [tokenAddress] })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const tokenData = data[0];

    if (!tokenData) return null;

    // Extract price data if available
    return {
      price: tokenData.price || 0,
      priceChange24h: tokenData.priceChange24h || 0
    };
  } catch (error) {
    console.error('[Helius] Error fetching token price:', error);
    return null;
  }
}

/**
 * Get comprehensive dashboard data for Solana tokens
 * Combines all Helius free tier features
 */
export async function getHeliusDashboardData(
  tokenAddress: string
): Promise<{
  metadata: any;
  authorities: any;
  holders: any;
  transactions: any;
  price: any;
  recentActivity: any[];
} | null> {
  try {
    if (!HELIUS_API_KEY) {
      console.warn('[Helius] API key not configured for dashboard data');
      return null;
    }

    console.log(`[Helius] Fetching comprehensive dashboard data for ${tokenAddress}`);

    // Fetch all data in parallel for better performance
    const [enhancedData, transactionHistory, priceData] = await Promise.all([
      getHeliusEnhancedData(tokenAddress),
      getHeliusTransactionHistory(tokenAddress, 20),
      getHeliusTokenPrice(tokenAddress)
    ]);

    if (!enhancedData) {
      console.warn('[Helius] No enhanced data available');
      return null;
    }

    return {
      metadata: enhancedData.metadata,
      authorities: enhancedData.authorities,
      holders: enhancedData.holders,
      transactions: enhancedData.transactions,
      price: priceData,
      recentActivity: transactionHistory || []
    };
  } catch (error: any) {
    console.error('[Helius] Error fetching dashboard data:', error.message);
    return null;
  }
}
