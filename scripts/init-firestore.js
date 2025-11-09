/**
 * Script to initialize Firestore with test user and proper structure
 * Run: node scripts/init-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
  
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Failed to load service account:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function initializeFirestore() {
  console.log('\n🔧 Initializing Firestore...\n');

  try {
    // Create test user document
    const testUserId = 'test-user';
    const testUserRef = db.collection('users').doc(testUserId);
    
    await testUserRef.set({
      email: 'test@example.com',
      displayName: 'Test User',
      plan: 'FREE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      usage: {
        tokensAnalyzed: 0,
        apiCalls: 0,
        lastReset: admin.firestore.FieldValue.serverTimestamp()
      },
      settings: {
        theme: 'dark',
        notifications: true
      }
    }, { merge: true });
    
    console.log('✅ Created test user:', testUserId);

    // Create watchlist subcollection structure
    await db.collection('watchlist').doc(testUserId).collection('tokens').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Initialized watchlist structure');

    // Create alerts subcollection structure
    await db.collection('alerts').doc(testUserId).collection('notifications').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Initialized alerts structure');

    // Create analysis history subcollection structure
    await db.collection('analysis_history').doc(testUserId).collection('scans').doc('_placeholder').set({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Initialized analysis history structure');

    console.log('\n✨ Firestore initialization complete!\n');
    console.log('You can now use the app with test-user');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

// Run initialization
initializeFirestore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
