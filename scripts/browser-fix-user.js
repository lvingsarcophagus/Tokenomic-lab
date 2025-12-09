/**
 * Browser Console Script to Fix User Tier
 * 
 * INSTRUCTIONS:
 * 1. Open your app in the browser
 * 2. Log in as admin
 * 3. Open browser DevTools (F12) → Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. It will update the user's tier to PREMIUM
 */

(async function fixUserTier() {
  try {
    console.log('🔧 Starting user tier fix...')
    
    // Get Firebase modules
    const { getFirestore, doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')
    
    // Get the Firestore instance from your app
    const db = getFirestore()
    
    // User email to fix
    const emailToFix = 'iyuji189@gmail.com'
    
    console.log(`🔍 Looking for user: ${emailToFix}`)
    
    // You'll need to get the user ID first
    // Option 1: If you know the UID, use it directly
    const userId = prompt('Enter the user UID (check admin dashboard):')
    
    if (!userId) {
      console.error('❌ No user ID provided')
      return
    }
    
    console.log(`📝 Updating user: ${userId}`)
    
    // Get current data
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      console.error('❌ User not found')
      return
    }
    
    const currentData = userSnap.data()
    console.log('📋 Current data:', {
      tier: currentData.tier,
      plan: currentData.plan,
      role: currentData.role
    })
    
    // Update to PREMIUM
    await updateDoc(userRef, {
      tier: 'PREMIUM',
      plan: 'PREMIUM',
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ User updated to PREMIUM!')
    
    // Verify
    const updatedSnap = await getDoc(userRef)
    const updatedData = updatedSnap.data()
    console.log('✓ Verified:', {
      tier: updatedData.tier,
      plan: updatedData.plan
    })
    
    console.log('💡 User should refresh their page to see changes')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
})()
