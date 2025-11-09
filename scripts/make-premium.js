#!/usr/bin/env node

/**
 * Make Premium User Script
 * 
 * Sets a user to PREMIUM tier
 * 
 * Usage:
 *   node scripts/make-premium.js <user-uid>
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

require('dotenv').config({ path: '.env.local' })

const uid = process.argv[2]

if (!uid) {
  console.error('❌ Error: User UID is required')
  console.log('\nUsage: node scripts/make-premium.js <user-uid>')
  process.exit(1)
}

async function makePremium() {
  try {
    if (getApps().length === 0) {
      const projectId = process.env.PROJECT_ID
      const clientEmail = process.env.CLIENT_EMAIL
      let privateKey = process.env.PRIVATE_KEY
      
      if (privateKey) {
        privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
      }

      if (!projectId || !clientEmail || !privateKey) {
        console.error('❌ Missing Firebase credentials')
        process.exit(1)
      }

      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
    }

    const auth = getAuth()
    const db = getFirestore()

    const userRecord = await auth.getUser(uid)
    console.log(`\n👤 User: ${userRecord.email || userRecord.uid}`)

    await auth.setCustomUserClaims(uid, {
      role: 'PREMIUM',
      admin: false,
    })

    await db.collection('users').doc(uid).set({
      role: 'PREMIUM',
      tier: 'pro',
      admin: false,
      email: userRecord.email,
      premiumSince: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    console.log('✅ User upgraded to PREMIUM')
    console.log('\n⚠️  User must sign out and sign in again to see changes.')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

makePremium()
