/**
 * Rate Limiting Service for Free Plan Users
 * 
 * Implements daily query limits using Firebase Firestore
 * Free Plan: 10 queries per day
 * Premium Plan: Unlimited queries
 */

import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

/**
 * Check if user has exceeded their daily rate limit
 * 
 * @param userId - Firebase user ID
 * @param plan - User's subscription plan ('FREE' or 'PREMIUM')
 * @returns Rate limit status
 */
export async function checkRateLimit(
  userId: string,
  plan: 'FREE' | 'PREMIUM'
): Promise<RateLimitResult> {
  try {
    // Premium users have unlimited queries
    if (plan === 'PREMIUM') {
      return {
        allowed: true,
        remaining: -1, // -1 indicates unlimited
        resetTime: 0,
        limit: -1
      }
    }

    // Free plan limit: 10 queries per day
    const DAILY_LIMIT = 10

    // Get today's date as string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]
    
    // Reference to user's rate limit document
    const rateLimitRef = doc(db, 'rateLimits', userId)
    const rateLimitDoc = await getDoc(rateLimitRef)

    // Calculate reset time (midnight UTC)
    const tomorrow = new Date()
    tomorrow.setUTCHours(24, 0, 0, 0)
    const resetTime = tomorrow.getTime()

    if (!rateLimitDoc.exists()) {
      // First query of the day - create new document
      await setDoc(rateLimitRef, {
        userId,
        date: today,
        count: 1,
        lastQuery: Date.now()
      })

      return {
        allowed: true,
        remaining: DAILY_LIMIT - 1,
        resetTime,
        limit: DAILY_LIMIT
      }
    }

    const data = rateLimitDoc.data()

    // Check if it's a new day
    if (data.date !== today) {
      // Reset counter for new day
      await setDoc(rateLimitRef, {
        userId,
        date: today,
        count: 1,
        lastQuery: Date.now()
      })

      return {
        allowed: true,
        remaining: DAILY_LIMIT - 1,
        resetTime,
        limit: DAILY_LIMIT
      }
    }

    // Same day - check if limit exceeded
    if (data.count >= DAILY_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        limit: DAILY_LIMIT
      }
    }

    // Increment counter
    await updateDoc(rateLimitRef, {
      count: increment(1),
      lastQuery: Date.now()
    })

    return {
      allowed: true,
      remaining: DAILY_LIMIT - (data.count + 1),
      resetTime,
      limit: DAILY_LIMIT
    }

  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: 0,
      resetTime: 0,
      limit: 10
    }
  }
}

/**
 * Get user's current rate limit status without incrementing
 * 
 * @param userId - Firebase user ID
 * @param plan - User's subscription plan
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
  userId: string,
  plan: 'FREE' | 'PREMIUM'
): Promise<RateLimitResult> {
  try {
    if (plan === 'PREMIUM') {
      return {
        allowed: true,
        remaining: -1,
        resetTime: 0,
        limit: -1
      }
    }

    const DAILY_LIMIT = 10
    const today = new Date().toISOString().split('T')[0]
    
    const rateLimitRef = doc(db, 'rateLimits', userId)
    const rateLimitDoc = await getDoc(rateLimitRef)

    const tomorrow = new Date()
    tomorrow.setUTCHours(24, 0, 0, 0)
    const resetTime = tomorrow.getTime()

    if (!rateLimitDoc.exists() || rateLimitDoc.data().date !== today) {
      return {
        allowed: true,
        remaining: DAILY_LIMIT,
        resetTime,
        limit: DAILY_LIMIT
      }
    }

    const data = rateLimitDoc.data()
    const remaining = Math.max(0, DAILY_LIMIT - data.count)

    return {
      allowed: remaining > 0,
      remaining,
      resetTime,
      limit: DAILY_LIMIT
    }

  } catch (error) {
    console.error('Rate limit status error:', error)
    return {
      allowed: true,
      remaining: 0,
      resetTime: 0,
      limit: 10
    }
  }
}

/**
 * Reset rate limit for a user (admin function)
 * 
 * @param userId - Firebase user ID
 */
export async function resetRateLimit(userId: string): Promise<void> {
  try {
    const rateLimitRef = doc(db, 'rateLimits', userId)
    await setDoc(rateLimitRef, {
      userId,
      date: new Date().toISOString().split('T')[0],
      count: 0,
      lastQuery: Date.now()
    })
  } catch (error) {
    console.error('Rate limit reset error:', error)
    throw error
  }
}
