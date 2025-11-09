/**
 * Migration Service
 * Handles migration from old schema to new schema
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserDocument } from '@/lib/firestore-schema'

/**
 * Migrate old user schema to new schema
 */
export async function migrateUserSchema(userId: string): Promise<UserDocument | null> {
  try {
    console.log('[Migration] Checking user schema for:', userId)
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      console.log('[Migration] User document does not exist')
      return null
    }

    const data = userSnap.data()
    
    // Check if user has old schema (has 'tier' field instead of 'plan')
    if (data.tier && !data.plan) {
      console.log('[Migration] Old schema detected, migrating...')
      
      // Map old schema to new schema
      const newUserDoc: UserDocument = {
        uid: userId,
        email: data.email || '',
        displayName: data.displayName || data.name || null,
        photoURL: data.photoURL || null,
        
        // Map tier -> plan
        plan: data.tier === 'pro' || data.role === 'PREMIUM' ? 'PREMIUM' : 'FREE',
        
        subscription: {
          status: data.subscriptionStatus || 'active',
          startDate: data.subscriptionStart ? new Date(data.subscriptionStart) : new Date(),
          endDate: data.subscriptionEnd ? new Date(data.subscriptionEnd) : null,
          autoRenew: data.autoRenew || false
        },
        
        usage: {
          tokensAnalyzed: data.dailyAnalyses || 0,
          lastResetDate: data.lastResetDate ? new Date(data.lastResetDate) : new Date(),
          dailyLimit: data.tier === 'pro' ? 999999 : 10
        },
        
        preferences: {
          notifications: data.notifications !== false, // default true
          emailAlerts: data.emailAlerts || false,
          theme: data.theme || 'system'
        },
        
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        lastLoginAt: new Date()
      }

      // Update document with new schema
      await setDoc(userRef, newUserDoc, { merge: true })
      
      console.log('[Migration] User migrated successfully:', {
        oldTier: data.tier,
        newPlan: newUserDoc.plan
      })
      
      return newUserDoc
    } else if (data.plan) {
      console.log('[Migration] User already on new schema')
      
      // User already has new schema, just return it
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
        subscription: {
          ...data.subscription,
          startDate: data.subscription?.startDate?.toDate?.() || data.subscription?.startDate,
          endDate: data.subscription?.endDate?.toDate?.() || data.subscription?.endDate,
        },
        usage: {
          ...data.usage,
          lastResetDate: data.usage?.lastResetDate?.toDate?.() || data.usage?.lastResetDate,
        }
      } as UserDocument
    }

    console.log('[Migration] Unknown schema format')
    return null
  } catch (error) {
    console.error('[Migration] Migration error:', error)
    return null
  }
}

/**
 * Check if user needs migration
 */
export async function needsMigration(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return false

    const data = userSnap.data()
    return !!(data.tier && !data.plan)
  } catch (error) {
    console.error('[Migration] Check migration error:', error)
    return false
  }
}
