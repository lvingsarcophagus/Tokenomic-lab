/**
 * Developer Mode Configuration
 * 
 * Enables testing of Premium and Free tier features without authentication
 * Set DEV_MODE=true in .env.local to enable
 */

export const DEV_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
  defaultPlan: (process.env.NEXT_PUBLIC_DEV_DEFAULT_PLAN as 'FREE' | 'PREMIUM') || 'PREMIUM',
  bypassRateLimit: process.env.NEXT_PUBLIC_DEV_BYPASS_RATE_LIMIT === 'true',
  mockUserId: 'dev-user-12345',
}

/**
 * Check if developer mode is active
 */
export function isDevMode(): boolean {
  return DEV_CONFIG.enabled
}

/**
 * Get the plan to use in dev mode
 */
export function getDevPlan(): 'FREE' | 'PREMIUM' {
  return DEV_CONFIG.defaultPlan
}

/**
 * Check if rate limiting should be bypassed
 */
export function shouldBypassRateLimit(): boolean {
  return DEV_CONFIG.enabled && DEV_CONFIG.bypassRateLimit
}

/**
 * Get user ID for dev mode
 */
export function getDevUserId(): string {
  return DEV_CONFIG.mockUserId
}

/**
 * Developer mode info for debugging
 */
export function getDevModeInfo() {
  return {
    enabled: DEV_CONFIG.enabled,
    plan: DEV_CONFIG.defaultPlan,
    bypassRateLimit: DEV_CONFIG.bypassRateLimit,
    userId: DEV_CONFIG.mockUserId,
  }
}
