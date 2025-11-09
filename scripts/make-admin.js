#!/usr/bin/env node

/**
 * Make Admin Script
 * 
 * Creates the first admin user by setting custom claims directly
 * Run this once to bootstrap your first admin
 * 
 * Usage:
 *   node scripts/make-admin.js <user-uid>
 *   node scripts/make-admin.js abc123def456
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const uid = process.argv[2]

if (!uid) {
  console.error('❌ Error: User UID is required')
  console.log('\nUsage: node scripts/make-admin.js <user-uid>')
  console.log('\nExample: node scripts/make-admin.js abc123def456')
  console.log('\nTo find your UID:')
  console.log('  1. Go to Firebase Console → Authentication')
  console.log('  2. Find your user and copy the UID')
  process.exit(1)
}

async function makeAdmin() {
  try {
    // Initialize Firebase Admin
    if (getApps().length === 0) {
      const projectId = process.env.PROJECT_ID
      const clientEmail = process.env.CLIENT_EMAIL
      let privateKey = process.env.PRIVATE_KEY
      
      if (privateKey) {
        privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
      }

      if (!projectId || !clientEmail || !privateKey) {
        console.error('❌ Missing Firebase credentials in .env.local')
        console.log('\nRequired environment variables:')
        console.log('  - PROJECT_ID')
        console.log('  - CLIENT_EMAIL')
        console.log('  - PRIVATE_KEY')
        process.exit(1)
      }

      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })

      console.log('✅ Firebase Admin initialized')
    }

    const auth = getAuth()
    const db = getFirestore()

    // Get user to verify it exists
    const userRecord = await auth.getUser(uid)
    console.log(`\n👤 User found: ${userRecord.email || userRecord.uid}`)

    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      role: 'ADMIN',
      admin: true,
    })

    console.log('✅ Custom claims set: { role: "ADMIN", admin: true }')

    // Update Firestore user document
    await db.collection('users').doc(uid).set({
      role: 'ADMIN',
      tier: 'pro',
      admin: true,
      email: userRecord.email,
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    console.log('✅ Firestore user document updated')

    console.log('\n🎉 Success! User is now an ADMIN')
    console.log('\n⚠️  Important: The user must sign out and sign in again to get the new claims.')
    console.log('\nNext steps:')
    console.log('  1. User should sign out of the app')
    console.log('  2. User should sign in again')
    console.log('  3. User will now have admin privileges')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    
    if (error.code === 'auth/user-not-found') {
      console.log('\nUser not found. Make sure:')
      console.log('  1. The UID is correct')
      console.log('  2. The user exists in Firebase Authentication')
    }
    
    process.exit(1)
  }
}

makeAdmin()
