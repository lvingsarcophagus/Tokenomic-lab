/**
 * Fix User Tier Script
 * Directly updates a user's tier/plan in Firestore
 * 
 * Usage: node scripts/fix-user-tier.js <email> <tier>
 * Example: node scripts/fix-user-tier.js iyuji189@gmail.com PREMIUM
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'))
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  })
}

const db = admin.firestore()

async function fixUserTier(email, tier) {
  try {
    console.log(`\n🔍 Searching for user: ${email}`)
    
    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()
    
    if (usersSnapshot.empty) {
      console.error(`❌ User not found: ${email}`)
      return
    }
    
    const userDoc = usersSnapshot.docs[0]
    const userId = userDoc.id
    const currentData = userDoc.data()
    
    console.log(`\n📋 Current user data:`)
    console.log(`   UID: ${userId}`)
    console.log(`   Email: ${currentData.email}`)
    console.log(`   Current tier: ${currentData.tier}`)
    console.log(`   Current plan: ${currentData.plan}`)
    console.log(`   Current role: ${currentData.role}`)
    
    // Update user tier/plan
    const updates = {
      tier: tier,
      plan: tier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    console.log(`\n✏️  Updating to:`)
    console.log(`   tier: ${tier}`)
    console.log(`   plan: ${tier}`)
    
    await db.collection('users').doc(userId).update(updates)
    
    console.log(`\n✅ User tier updated successfully!`)
    
    // Verify the update
    const updatedDoc = await db.collection('users').doc(userId).get()
    const updatedData = updatedDoc.data()
    
    console.log(`\n✓ Verified updated data:`)
    console.log(`   tier: ${updatedData.tier}`)
    console.log(`   plan: ${updatedData.plan}`)
    console.log(`   updatedAt: ${updatedData.updatedAt?.toDate()}`)
    
    console.log(`\n💡 User should see changes within 30 seconds or after page refresh`)
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message)
    throw error
  }
}

// Get command line arguments
const email = process.argv[2]
const tier = process.argv[3] || 'PREMIUM'

if (!email) {
  console.error('❌ Usage: node scripts/fix-user-tier.js <email> <tier>')
  console.error('   Example: node scripts/fix-user-tier.js user@example.com PREMIUM')
  process.exit(1)
}

// Valid tiers
const validTiers = ['FREE', 'PREMIUM', 'ADMIN']
if (!validTiers.includes(tier)) {
  console.error(`❌ Invalid tier: ${tier}`)
  console.error(`   Valid tiers: ${validTiers.join(', ')}`)
  process.exit(1)
}

// Run the fix
fixUserTier(email, tier)
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })
