/**
 * ============================================================================
 * API RATE LIMIT MONITORING SYSTEM
 * ============================================================================
 * 
 * Tracks real-time API usage across all services:
 * - Moralis: 40 requests/second (free tier)
 * - Helius: 10 requests/second (free tier)
 * - Blockfrost: 10 requests/second (free tier)
 * - GoPlus: 100 requests/minute
 * - Mobula: 500 requests/minute
 * 
 * Features:
 * - Real-time rate tracking with sliding window
 * - Automatic throttling before hitting limits
 * - Admin dashboard integration
 * - Alert system for near-limit conditions
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum APIService {
  MORALIS = 'moralis',
  HELIUS = 'helius',
  BLOCKFROST = 'blockfrost',
  GOPLUS = 'goplus',
  MOBULA = 'mobula',
  COINGECKO = 'coingecko',
  COINMARKETCAP = 'coinmarketcap'
}

export interface RateLimitConfig {
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  burstAllowance?: number; // Allow short bursts above limit
}

export interface APIUsageStats {
  service: APIService;
  requestsLastSecond: number;
  requestsLastMinute: number;
  requestsLastHour: number;
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: number;
  rateLimitHits: number;
  health: 'healthy' | 'warning' | 'critical' | 'offline';
}

interface RequestLog {
  timestamp: number;
  success: boolean;
  responseTime: number;
}

// ============================================================================
// RATE LIMIT CONFIGURATIONS
// ============================================================================

const RATE_LIMITS: Record<APIService, RateLimitConfig> = {
  [APIService.MORALIS]: {
    requestsPerSecond: 40,
    burstAllowance: 50 // Allow short bursts
  },
  [APIService.HELIUS]: {
    requestsPerSecond: 10,
    burstAllowance: 15
  },
  [APIService.BLOCKFROST]: {
    requestsPerSecond: 10,
    burstAllowance: 15
  },
  [APIService.GOPLUS]: {
    requestsPerMinute: 100
  },
  [APIService.MOBULA]: {
    requestsPerMinute: 500
  },
  [APIService.COINGECKO]: {
    requestsPerSecond: 10
  },
  [APIService.COINMARKETCAP]: {
    requestsPerMinute: 30
  }
};

// ============================================================================
// IN-MEMORY STORAGE (Replace with Redis in production)
// ============================================================================

class APIMonitor {
  private requestLogs: Map<APIService, RequestLog[]> = new Map();
  private totalRequests: Map<APIService, number> = new Map();
  private failedRequests: Map<APIService, number> = new Map();
  private rateLimitHits: Map<APIService, number> = new Map();
  
  constructor() {
    // Initialize maps for all services
    Object.values(APIService).forEach(service => {
      this.requestLogs.set(service, []);
      this.totalRequests.set(service, 0);
      this.failedRequests.set(service, 0);
      this.rateLimitHits.set(service, 0);
    });
    
    // Clean up old logs every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  /**
   * Check if a request can be made without hitting rate limits
   */
  canMakeRequest(service: APIService): boolean {
    const config = RATE_LIMITS[service];
    const logs = this.requestLogs.get(service) || [];
    const now = Date.now();
    
    // Check per-second limit
    if (config.requestsPerSecond) {
      const lastSecond = logs.filter(log => now - log.timestamp < 1000).length;
      if (lastSecond >= (config.burstAllowance || config.requestsPerSecond)) {
        return false;
      }
    }
    
    // Check per-minute limit
    if (config.requestsPerMinute) {
      const lastMinute = logs.filter(log => now - log.timestamp < 60000).length;
      if (lastMinute >= config.requestsPerMinute) {
        return false;
      }
    }
    
    // Check per-hour limit
    if (config.requestsPerHour) {
      const lastHour = logs.filter(log => now - log.timestamp < 3600000).length;
      if (lastHour >= config.requestsPerHour) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Wait until a request can be made (throttling)
   */
  async waitForSlot(service: APIService): Promise<void> {
    while (!this.canMakeRequest(service)) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    }
  }
  
  /**
   * Log an API request
   */
  logRequest(service: APIService, success: boolean, responseTime: number): void {
    const logs = this.requestLogs.get(service) || [];
    const now = Date.now();
    
    logs.push({
      timestamp: now,
      success,
      responseTime
    });
    
    // Update counters
    this.totalRequests.set(service, (this.totalRequests.get(service) || 0) + 1);
    if (!success) {
      this.failedRequests.set(service, (this.failedRequests.get(service) || 0) + 1);
    }
    
    this.requestLogs.set(service, logs);
  }
  
  /**
   * Log a rate limit hit
   */
  logRateLimitHit(service: APIService): void {
    this.rateLimitHits.set(service, (this.rateLimitHits.get(service) || 0) + 1);
  }
  
  /**
   * Get usage statistics for a service
   */
  getStats(service: APIService): APIUsageStats {
    const logs = this.requestLogs.get(service) || [];
    const now = Date.now();
    
    // Filter logs by time window
    const lastSecondLogs = logs.filter(log => now - log.timestamp < 1000);
    const lastMinuteLogs = logs.filter(log => now - log.timestamp < 60000);
    const lastHourLogs = logs.filter(log => now - log.timestamp < 3600000);
    
    // Calculate average response time
    const recentLogs = lastMinuteLogs.length > 0 ? lastMinuteLogs : lastHourLogs;
    const avgResponseTime = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length
      : 0;
    
    // Determine health status
    const config = RATE_LIMITS[service];
    const requestsLastSecond = lastSecondLogs.length;
    const requestsLastMinute = lastMinuteLogs.length;
    const failureRate = recentLogs.length > 0 
      ? recentLogs.filter(log => !log.success).length / recentLogs.length 
      : 0;
    
    let health: APIUsageStats['health'] = 'healthy';
    
    // Check if offline (no requests in last 5 minutes)
    if (lastMinuteLogs.length === 0 && this.totalRequests.get(service)! > 0) {
      health = 'offline';
    }
    // Check if near rate limit
    else if (config.requestsPerSecond && requestsLastSecond > config.requestsPerSecond * 0.8) {
      health = 'warning';
    }
    else if (config.requestsPerMinute && requestsLastMinute > config.requestsPerMinute * 0.8) {
      health = 'warning';
    }
    // Check if high failure rate
    else if (failureRate > 0.1) {
      health = 'critical';
    }
    
    return {
      service,
      requestsLastSecond: lastSecondLogs.length,
      requestsLastMinute: lastMinuteLogs.length,
      requestsLastHour: lastHourLogs.length,
      totalRequests: this.totalRequests.get(service) || 0,
      failedRequests: this.failedRequests.get(service) || 0,
      averageResponseTime: Math.round(avgResponseTime),
      lastRequestTime: logs.length > 0 ? logs[logs.length - 1].timestamp : 0,
      rateLimitHits: this.rateLimitHits.get(service) || 0,
      health
    };
  }
  
  /**
   * Get statistics for all services
   */
  getAllStats(): APIUsageStats[] {
    return Object.values(APIService).map(service => this.getStats(service));
  }
  
  /**
   * Clean up old logs (keep last hour only)
   */
  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    this.requestLogs.forEach((logs, service) => {
      const filteredLogs = logs.filter(log => log.timestamp > oneHourAgo);
      this.requestLogs.set(service, filteredLogs);
    });
  }
  
  /**
   * Reset all statistics (admin function)
   */
  reset(): void {
    this.requestLogs.clear();
    this.totalRequests.clear();
    this.failedRequests.clear();
    this.rateLimitHits.clear();
    
    Object.values(APIService).forEach(service => {
      this.requestLogs.set(service, []);
      this.totalRequests.set(service, 0);
      this.failedRequests.set(service, 0);
      this.rateLimitHits.set(service, 0);
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const apiMonitor = new APIMonitor();

// ============================================================================
// WRAPPER FUNCTIONS FOR EASY INTEGRATION
// ============================================================================

/**
 * Execute an API call with automatic rate limiting and monitoring
 */
export async function monitoredAPICall<T>(
  service: APIService,
  apiCall: () => Promise<T>
): Promise<T> {
  // Wait for available slot
  await apiMonitor.waitForSlot(service);
  
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const responseTime = Date.now() - startTime;
    apiMonitor.logRequest(service, true, responseTime);
    return result;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    apiMonitor.logRequest(service, false, responseTime);
    
    // Check if rate limit error
    if (error.status === 429 || error.message?.includes('rate limit')) {
      apiMonitor.logRateLimitHit(service);
    }
    
    throw error;
  }
}

/**
 * Get real-time usage statistics
 */
export function getAPIStats(service?: APIService): APIUsageStats | APIUsageStats[] {
  if (service) {
    return apiMonitor.getStats(service);
  }
  return apiMonitor.getAllStats();
}

/**
 * Check if a request can be made
 */
export function canMakeRequest(service: APIService): boolean {
  return apiMonitor.canMakeRequest(service);
}

/**
 * Reset statistics (admin only)
 */
export function resetAPIStats(): void {
  apiMonitor.reset();
}

/**
 * Get rate limit configuration for a service
 */
export function getRateLimitConfig(service: APIService): RateLimitConfig {
  return RATE_LIMITS[service];
}

export default apiMonitor;
