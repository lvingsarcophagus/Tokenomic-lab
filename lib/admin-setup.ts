// Admin account setup utility
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface AdminUserData {
  uid: string
  email: string
  name?: string
  tier: 'pro'
  role: 'admin'
  dailyAnalyses: number
  watchlist: string[]
  alerts: Array<Record<string, unknown>>
  createdAt: string
}

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return false
    }

    const userData = userDoc.data()
    return userData.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Set a user as admin (call this after creating the user in Firebase Auth)
 * You can also manually set role: 'admin' in Firestore for a user
 */
export async function setUserAsAdmin(userId: string, email: string, name?: string) {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    const existingData = userDoc.exists() ? userDoc.data() : {}
    
    const adminData = {
      ...existingData,
      uid: userId,
      email,
      name: name || existingData.name || 'Admin',
      tier: 'pro' as const,
      role: 'admin' as const,
      dailyAnalyses: existingData.dailyAnalyses || 0,
      watchlist: existingData.watchlist || [],
      alerts: existingData.alerts || [],
      createdAt: existingData.createdAt || new Date().toISOString(),
    }

    await setDoc(userRef, adminData, { merge: true })
    console.log(`Admin account set up for ${email}`)
    return adminData
  } catch (error) {
    console.error('Error setting up admin account:', error)
    throw error
  }
}

/**
 * Set a user as premium tier (role user)
 */
export async function setUserAsPremium(userId: string, email: string, name?: string) {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    const existingData = userDoc.exists() ? userDoc.data() : {}

    const premiumData = {
      ...existingData,
      uid: userId,
      email,
      name: name || existingData.name || 'Premium User',
      tier: 'pro' as const,
      role: (existingData.role as 'user' | 'admin') || 'user',
      dailyAnalyses: existingData.dailyAnalyses || 0,
      watchlist: existingData.watchlist || [],
      alerts: existingData.alerts || [],
      createdAt: existingData.createdAt || new Date().toISOString(),
    }

    await setDoc(userRef, premiumData, { merge: true })
    console.log(`Premium account set up for ${email}`)
    return premiumData
  } catch (error) {
    console.error('Error setting up premium account:', error)
    throw error
  }
}
