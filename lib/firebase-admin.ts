import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let app: App | null = null

function initAdmin() {
  if (getApps().length > 0) {
    return
  }

  // Use the new environment variables from .env.local
  const projectId = process.env.PROJECT_ID
  const clientEmail = process.env.CLIENT_EMAIL
  let privateKey = process.env.PRIVATE_KEY
  
  if (privateKey) {
    // Remove quotes if present and normalize newlines
    privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
  }

  if (projectId && clientEmail && privateKey) {
    try {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
      console.log('✅ Firebase Admin initialized successfully')
      return
    } catch (e) {
      console.error('❌ Admin init failed:', e)
    }
  } else {
    console.error('❌ Missing Firebase admin credentials. Check .env.local')
  }
}

export function getAdminAuth() {
  initAdmin()
  return getAuth()
}

export function getAdminDb() {
  initAdmin()
  return getFirestore()
}

export function isAdminConfigured(): boolean {
  try {
    initAdmin()
    return getApps().length > 0
  } catch {
    return false
  }
}






