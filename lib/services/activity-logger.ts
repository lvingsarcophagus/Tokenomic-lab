/**
 * Activity Logger Service
 * Logs user activities to Firestore for admin monitoring
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface ActivityLog {
  userId: string
  userEmail: string
  action: string
  details: string
  metadata?: Record<string, any>
  timestamp: any
  ipAddress?: string
  userAgent?: string
}

export type ActivityAction =
  | 'user_login'
  | 'user_logout'
  | 'user_signup'
  | 'admin_login'
  | 'admin_logout'
  | 'token_scan'
  | 'token_search'
  | 'watchlist_add'
  | 'watchlist_remove'
  | 'tier_upgrade'
  | 'tier_downgrade'
  | 'profile_update'
  | 'profile_image_upload'
  | 'settings_change'
  | 'export_data'
  | 'delete_account'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'password_change'
  | 'api_call'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'credits_purchased'
  | 'credits_used'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'subscription_renewed'
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'portfolio_analyzed'
  | 'ai_analysis_requested'
  | 'pdf_exported'
  | 'page_view'
  | 'feature_accessed'

/**
 * Log a user activity
 */
export async function logActivity(
  userId: string,
  userEmail: string,
  action: ActivityAction,
  details: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const activityLog: ActivityLog = {
      userId,
      userEmail,
      action,
      details,
      metadata: metadata || {},
      timestamp: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    }

    await addDoc(collection(db, 'activity_logs'), activityLog)
    console.log('[ActivityLogger] Logged:', action, 'for user:', userEmail)
  } catch (error) {
    console.error('[ActivityLogger] Failed to log activity:', error)
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Log token scan activity
 */
export async function logTokenScan(
  userId: string,
  userEmail: string,
  tokenAddress: string,
  chain: string,
  riskScore: number
): Promise<void> {
  await logActivity(
    userId,
    userEmail,
    'token_scan',
    `Scanned token ${tokenAddress.slice(0, 8)}... on ${chain}`,
    { tokenAddress, chain, riskScore }
  )
}

/**
 * Log user authentication
 */
export async function logAuth(
  userId: string,
  userEmail: string,
  action: 'user_login' | 'user_logout' | 'user_signup' | 'admin_login' | 'admin_logout'
): Promise<void> {
  const details = action === 'user_login' 
    ? 'User logged in'
    : action === 'user_logout'
    ? 'User logged out'
    : action === 'user_signup'
    ? 'New user signed up'
    : action === 'admin_login'
    ? 'Admin logged in'
    : 'Admin logged out'
  
  await logActivity(userId, userEmail, action, details)
}

/**
 * Log tier changes
 */
export async function logTierChange(
  userId: string,
  userEmail: string,
  fromTier: string,
  toTier: string
): Promise<void> {
  const action = toTier === 'PREMIUM' ? 'tier_upgrade' : 'tier_downgrade'
  await logActivity(
    userId,
    userEmail,
    action,
    `Tier changed from ${fromTier} to ${toTier}`,
    { fromTier, toTier }
  )
}

/**
 * Log watchlist actions
 */
export async function logWatchlist(
  userId: string,
  userEmail: string,
  action: 'watchlist_add' | 'watchlist_remove',
  tokenAddress: string,
  tokenSymbol?: string
): Promise<void> {
  const details = action === 'watchlist_add'
    ? `Added ${tokenSymbol || tokenAddress.slice(0, 8)} to watchlist`
    : `Removed ${tokenSymbol || tokenAddress.slice(0, 8)} from watchlist`
  
  await logActivity(userId, userEmail, action, details, { tokenAddress, tokenSymbol })
}

/**
 * Log payment activities
 */
export async function logPayment(
  userId: string,
  userEmail: string,
  action: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'credits_purchased',
  amount: number,
  asset: string,
  metadata?: Record<string, any>
): Promise<void> {
  const details = action === 'payment_initiated'
    ? `Initiated payment of ${amount} ${asset}`
    : action === 'payment_completed'
    ? `Completed payment of ${amount} ${asset}`
    : action === 'payment_failed'
    ? `Payment failed for ${amount} ${asset}`
    : `Purchased credits worth ${amount} ${asset}`
  
  await logActivity(userId, userEmail, action, details, { amount, asset, ...metadata })
}

/**
 * Log page views
 */
export async function logPageView(
  userId: string,
  userEmail: string,
  page: string,
  referrer?: string
): Promise<void> {
  await logActivity(
    userId,
    userEmail,
    'page_view',
    `Viewed ${page}`,
    { page, referrer }
  )
}

/**
 * Log feature access
 */
export async function logFeatureAccess(
  userId: string,
  userEmail: string,
  feature: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logActivity(
    userId,
    userEmail,
    'feature_accessed',
    `Accessed feature: ${feature}`,
    { feature, ...metadata }
  )
}

/**
 * Log wallet activities
 */
export async function logWallet(
  userId: string,
  userEmail: string,
  action: 'wallet_connected' | 'wallet_disconnected',
  walletAddress: string,
  walletType?: string
): Promise<void> {
  const details = action === 'wallet_connected'
    ? `Connected wallet ${walletAddress.slice(0, 8)}...`
    : `Disconnected wallet ${walletAddress.slice(0, 8)}...`
  
  await logActivity(userId, userEmail, action, details, { walletAddress, walletType })
}

/**
 * Log AI analysis requests
 */
export async function logAIAnalysis(
  userId: string,
  userEmail: string,
  tokenAddress: string,
  analysisType: string,
  creditsUsed?: number
): Promise<void> {
  await logActivity(
    userId,
    userEmail,
    'ai_analysis_requested',
    `Requested AI analysis for ${tokenAddress.slice(0, 8)}...`,
    { tokenAddress, analysisType, creditsUsed }
  )
}
