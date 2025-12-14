/**
 * Grant Admin Access Script
 * Specifically for nayanjoshy1nj@gmail.com
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function grantAdminAccess() {
  try {
    console.log('\n🔧 Granting admin access to nayanjoshy1nj@gmail.com...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'nayanjoshy1nj@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ User not found with email: nayanjoshy1nj@gmail.com');
      console.log('\nPlease make sure you have signed up and logged in at least once.');
      return;
    }
    
    // Update each matching user (should be only one)
    const promises = [];
    querySnapshot.forEach((docSnapshot) => {
      const userId = docSnapshot.id;
      console.log(`📝 Found user: ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      promises.push(updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date().toISOString()
      }));
    });
    
    await Promise.all(promises);
    
    console.log('✅ SUCCESS! Admin role has been granted!');
    console.log('\nNext steps:');
    console.log('1. Log out of your account');
    console.log('2. Log back in');
    console.log('3. Go to /admin/dashboard');
    console.log('4. You should now see the admin panel\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied. Using Firebase Console method:');
      console.log('1. Go to Firebase Console > Firestore Database');
      console.log('2. Find users collection');
      console.log('3. Look for document with email: nayanjoshy1nj@gmail.com');
      console.log('4. Edit the document and add field: role = "admin"\n');
    }
    
    process.exit(1);
  }
}

// Run the script
grantAdminAccess()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });