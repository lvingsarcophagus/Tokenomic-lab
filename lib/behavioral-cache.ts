/**
 * ============================================================================
 * BEHAVIORAL DATA CACHING SYSTEM
 * ============================================================================
 * 
 * Caches expensive behavioral data from Moralis, Helius, and Blockfrost
 * to reduce API calls and improve response times.
 * 
 * Cache Strategy:
 * - Holder history: 10 minute TTL (data changes slowly)
 * - Liquidity history: 5 minute TTL (more volatile)
 * - Transaction patterns: 5 minute TTL (active trading)
 * - Wallet age: 15 minute TTL (static data)
 * - Solana authorities: 15 minute TTL (rarely changes)
 * - Cardano policies: 15 minute TTL (immutable once set)
 */

import { MultiChainTokenData } from './risk-algorithms/multi-chain-enhanced-calculator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export enum CacheKey {
  HOLDER_HISTORY = 'holder_history',
  LIQUIDITY_HISTORY = 'liquidity_history',
  TRANSACTION_PATTERNS = 'transaction_patterns',
  WALLET_AGE = 'wallet_age',
  AVERAGE_HOLDER_AGE = 'average_holder_age',
  SOLANA_SECURITY = 'solana_security',
  CARDANO_SECURITY = 'cardano_security'
}

// Cache TTLs in milliseconds
export const CACHE_TTL: Record<CacheKey, number> = {
  [CacheKey.HOLDER_HISTORY]: 10 * 60 * 1000,        // 10 minutes
  [CacheKey.LIQUIDITY_HISTORY]: 5 * 60 * 1000,      // 5 minutes
  [CacheKey.TRANSACTION_PATTERNS]: 5 * 60 * 1000,   // 5 minutes
  [CacheKey.WALLET_AGE]: 15 * 60 * 1000,            // 15 minutes
  [CacheKey.AVERAGE_HOLDER_AGE]: 15 * 60 * 1000,    // 15 minutes
  [CacheKey.SOLANA_SECURITY]: 15 * 60 * 1000,       // 15 minutes
  [CacheKey.CARDANO_SECURITY]: 15 * 60 * 1000       // 15 minutes
};

// ============================================================================
// IN-MEMORY CACHE (Replace with Redis in production)
// ============================================================================

class BehavioralCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  
  constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  /**
   * Generate cache key from token address, chain ID, and data type
   */
  private generateKey(tokenAddress: string, chainId: number, cacheKey: CacheKey): string {
    return `${tokenAddress.toLowerCase()}_${chainId}_${cacheKey}`;
  }
  
  /**
   * Set a value in the cache
   */
  set<T>(
    tokenAddress: string,
    chainId: number,
    cacheKey: CacheKey,
    data: T
  ): void {
    const key = this.generateKey(tokenAddress, chainId, cacheKey);
    const ttl = CACHE_TTL[cacheKey];
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`[Cache] SET ${cacheKey} for ${tokenAddress} (TTL: ${ttl / 1000}s)`);
  }
  
  /**
   * Get a value from the cache
   */
  get<T>(
    tokenAddress: string,
    chainId: number,
    cacheKey: CacheKey
  ): T | null {
    const key = this.generateKey(tokenAddress, chainId, cacheKey);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      console.log(`[Cache] MISS ${cacheKey} for ${tokenAddress}`);
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      console.log(`[Cache] EXPIRED ${cacheKey} for ${tokenAddress} (age: ${age / 1000}s)`);
      return null;
    }
    
    this.hits++;
    const remainingTTL = Math.round((entry.ttl - age) / 1000);
    console.log(`[Cache] HIT ${cacheKey} for ${tokenAddress} (TTL remaining: ${remainingTTL}s)`);
    return entry.data as T;
  }
  
  /**
   * Check if a value exists in cache (without incrementing hit/miss)
   */
  has(tokenAddress: string, chainId: number, cacheKey: CacheKey): boolean {
    const key = this.generateKey(tokenAddress, chainId, cacheKey);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age <= entry.ttl;
  }
  
  /**
   * Invalidate cache for a specific token
   */
  invalidate(tokenAddress: string, chainId: number, cacheKey?: CacheKey): void {
    if (cacheKey) {
      const key = this.generateKey(tokenAddress, chainId, cacheKey);
      this.cache.delete(key);
      console.log(`[Cache] INVALIDATED ${cacheKey} for ${tokenAddress}`);
    } else {
      // Invalidate all cache entries for this token
      const prefix = `${tokenAddress.toLowerCase()}_${chainId}`;
      let count = 0;
      
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
          count++;
        }
      }
      
      console.log(`[Cache] INVALIDATED ${count} entries for ${tokenAddress}`);
    }
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests
    };
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log(`[Cache] CLEARED ${size} entries`);
  }
  
  /**
   * Get all cached tokens (for admin panel)
   */
  getCachedTokens(): Array<{ tokenAddress: string; chainId: number; cacheKeys: CacheKey[] }> {
    const tokenMap = new Map<string, Set<CacheKey>>();
    
    for (const key of this.cache.keys()) {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const tokenAddress = parts[0];
        const chainId = parseInt(parts[1]);
        const cacheKey = parts.slice(2).join('_') as CacheKey;
        
        const tokenKey = `${tokenAddress}_${chainId}`;
        if (!tokenMap.has(tokenKey)) {
          tokenMap.set(tokenKey, new Set());
        }
        tokenMap.get(tokenKey)!.add(cacheKey);
      }
    }
    
    return Array.from(tokenMap.entries()).map(([tokenKey, cacheKeys]) => {
      const [tokenAddress, chainId] = tokenKey.split('_');
      return {
        tokenAddress,
        chainId: parseInt(chainId),
        cacheKeys: Array.from(cacheKeys)
      };
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const behavioralCache = new BehavioralCache();

// ============================================================================
// HELPER FUNCTIONS FOR CACHING BEHAVIORAL DATA
// ============================================================================

/**
 * Cache holder history data
 */
export function cacheHolderHistory(
  tokenAddress: string,
  chainId: number,
  data: MultiChainTokenData['holderHistory']
): void {
  if (data) {
    behavioralCache.set(tokenAddress, chainId, CacheKey.HOLDER_HISTORY, data);
  }
}

/**
 * Get cached holder history
 */
export function getCachedHolderHistory(
  tokenAddress: string,
  chainId: number
): MultiChainTokenData['holderHistory'] | null {
  return behavioralCache.get(tokenAddress, chainId, CacheKey.HOLDER_HISTORY);
}

/**
 * Cache liquidity history data
 */
export function cacheLiquidityHistory(
  tokenAddress: string,
  chainId: number,
  data: MultiChainTokenData['liquidityHistory']
): void {
  if (data) {
    behavioralCache.set(tokenAddress, chainId, CacheKey.LIQUIDITY_HISTORY, data);
  }
}

/**
 * Get cached liquidity history
 */
export function getCachedLiquidityHistory(
  tokenAddress: string,
  chainId: number
): MultiChainTokenData['liquidityHistory'] | null {
  return behavioralCache.get(tokenAddress, chainId, CacheKey.LIQUIDITY_HISTORY);
}

/**
 * Cache transaction patterns
 */
export function cacheTransactionPatterns(
  tokenAddress: string,
  chainId: number,
  data: {
    uniqueBuyers24h?: number;
    uniqueSellers24h?: number;
    buyTransactions24h?: number;
    sellTransactions24h?: number;
  }
): void {
  behavioralCache.set(tokenAddress, chainId, CacheKey.TRANSACTION_PATTERNS, data);
}

/**
 * Get cached transaction patterns
 */
export function getCachedTransactionPatterns(
  tokenAddress: string,
  chainId: number
) {
  return behavioralCache.get(tokenAddress, chainId, CacheKey.TRANSACTION_PATTERNS);
}

/**
 * Cache wallet ages
 */
export function cacheWalletAge(
  tokenAddress: string,
  chainId: number,
  deployerWalletAge: number | undefined,
  averageHolderWalletAge: number | undefined
): void {
  behavioralCache.set(tokenAddress, chainId, CacheKey.WALLET_AGE, {
    deployerWalletAge,
    averageHolderWalletAge
  });
}

/**
 * Get cached wallet ages
 */
export function getCachedWalletAge(
  tokenAddress: string,
  chainId: number
): { deployerWalletAge?: number; averageHolderWalletAge?: number } | null {
  return behavioralCache.get(tokenAddress, chainId, CacheKey.WALLET_AGE);
}

/**
 * Cache Solana security data
 */
export function cacheSolanaSecurity(
  tokenAddress: string,
  chainId: number,
  data: MultiChainTokenData['solanaData']
): void {
  if (data) {
    behavioralCache.set(tokenAddress, chainId, CacheKey.SOLANA_SECURITY, data);
  }
}

/**
 * Get cached Solana security data
 */
export function getCachedSolanaSecurity(
  tokenAddress: string,
  chainId: number
): MultiChainTokenData['solanaData'] | null {
  return behavioralCache.get(tokenAddress, chainId, CacheKey.SOLANA_SECURITY);
}

/**
 * Cache Cardano security data
 */
export function cacheCardanoSecurity(
  tokenAddress: string,
  chainId: number,
  data: MultiChainTokenData['cardanoData']
): void {
  if (data) {
    behavioralCache.set(tokenAddress, chainId, CacheKey.CARDANO_SECURITY, data);
  }
}

/**
 * Get cached Cardano security data
 */
export function getCachedCardanoSecurity(
  tokenAddress: string,
  chainId: number
): MultiChainTokenData['cardanoData'] | null {
  return behavioralCache.get(tokenAddress, chainId, CacheKey.CARDANO_SECURITY);
}

/**
 * Get cache statistics (for admin panel)
 */
export function getCacheStats() {
  return behavioralCache.getStats();
}

/**
 * Clear cache (admin only)
 */
export function clearCache(): void {
  behavioralCache.clear();
}

/**
 * Get all cached tokens (for admin panel)
 */
export function getCachedTokensList() {
  return behavioralCache.getCachedTokens();
}

/**
 * Invalidate cache for a token
 */
export function invalidateTokenCache(tokenAddress: string, chainId: number): void {
  behavioralCache.invalidate(tokenAddress, chainId);
}

export default behavioralCache;
