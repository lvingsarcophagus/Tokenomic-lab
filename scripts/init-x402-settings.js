/**
 * Initialize x402 payment settings in Firestore
 * Run with: node scripts/init-x402-settings.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.PROJECT_ID
});

const db = admin.firestore();

async function initSettings() {
  try {
    const recipientAddress = process.env.X402_RECIPIENT_ADDRESS;
    const solAddress = process.env.X402_SOL_RECIPIENT_ADDRESS || recipientAddress;
    const usdcAddress = process.env.X402_USDC_RECIPIENT_ADDRESS || recipientAddress;
    const useTestnet = process.env.X402_USE_TESTNET === 'true';

    if (!recipientAddress) {
      console.error('❌ X402_RECIPIENT_ADDRESS not set in .env.local');
      process.exit(1);
    }

    console.log('🔧 Initializing x402 settings...');
    console.log('   Recipient Address:', recipientAddress);
    console.log('   SOL Address:', solAddress);
    console.log('   USDC Address:', usdcAddress);
    console.log('   Testnet Mode:', useTestnet);

    await db.collection('admin_settings').doc('x402').set({
      recipientAddress,
      solRecipientAddress: solAddress,
      usdcRecipientAddress: usdcAddress,
      useTestnet,
      price: '29.00',
      asset: useTestnet ? 'SOL' : 'USDC',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'system'
    }, { merge: true });

    console.log('✅ x402 settings initialized successfully!');
    console.log('\n📝 Settings saved:');
    console.log('   - SOL payments:', solAddress);
    console.log('   - USDC payments:', usdcAddress);
    console.log('   - Mode:', useTestnet ? 'TESTNET' : 'MAINNET');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
}

initSettings();
