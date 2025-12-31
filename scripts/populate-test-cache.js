/**
 * Populate Test Cache Data
 * 
 * This script adds sample token data to the Firestore cache
 * for testing the admin cache viewer functionality.
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n')
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.PROJECT_ID
  })
}

const db = admin.firestore()

async function populateTestCache() {
  console.log('🚀 Populating test cache data...')

  const testTokens = [
    {
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      name: 'Bonk',
      symbol: 'BONK',
      chain: 'solana',
      riskScore: 45,
      priceData: {
        price: 0.000034,
        marketCap: 2400000000,
        volume24h: 89000000,
        priceChange24h: 12.5,
        liquidity: 45000000
      },
      securityData: {
        riskScore: 45,
        riskLevel: 'MEDIUM',
        issues: ['High holder concentration', 'Meme token volatility'],
        isHoneypot: false
      },
      tokenomics: {
        holderCount: 19937,
        topHoldersPercentage: 68.5,
        burnMechanism: true
      },
      ai_insights: {
        summary: 'BONK is a popular Solana meme token with moderate risk due to holder concentration.',
        riskFactors: ['Meme token', 'Holder concentration'],
        confidence: 0.85
      },
      hitCount: 127,
      queryCount: 127
    },
    {
      address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      name: 'Pepe',
      symbol: 'PEPE',
      chain: 'ethereum',
      riskScore: 72,
      priceData: {
        price: 0.00002156,
        marketCap: 9100000000,
        volume24h: 1200000000,
        priceChange24h: -8.2,
        liquidity: 125000000
      },
      securityData: {
        riskScore: 72,
        riskLevel: 'HIGH',
        issues: ['Extreme volatility', 'Speculative trading', 'No utility'],
        isHoneypot: false
      },
      tokenomics: {
        holderCount: 245678,
        topHoldersPercentage: 45.2,
        burnMechanism: false
      },
      ai_insights: {
        summary: 'PEPE is a high-risk meme token with extreme volatility and speculative nature.',
        riskFactors: ['Meme token', 'High volatility', 'No utility'],
        confidence: 0.92
      },
      hitCount: 89,
      queryCount: 89
    },
    {
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      name: 'Shiba Inu',
      symbol: 'SHIB',
      chain: 'ethereum',
      riskScore: 38,
      priceData: {
        price: 0.00002845,
        marketCap: 16800000000,
        volume24h: 890000000,
        priceChange24h: 5.7,
        liquidity: 280000000
      },
      securityData: {
        riskScore: 38,
        riskLevel: 'MEDIUM',
        issues: ['Meme token characteristics', 'High supply'],
        isHoneypot: false
      },
      tokenomics: {
        holderCount: 1345892,
        topHoldersPercentage: 32.1,
        burnMechanism: true
      },
      ai_insights: {
        summary: 'SHIB is an established meme token with better distribution than most meme coins.',
        riskFactors: ['Meme token', 'Large supply'],
        confidence: 0.78
      },
      hitCount: 203,
      queryCount: 203
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      name: 'USD Coin',
      symbol: 'USDC',
      chain: 'bsc',
      riskScore: 8,
      priceData: {
        price: 1.0002,
        marketCap: 32500000000,
        volume24h: 4200000000,
        priceChange24h: 0.01,
        liquidity: 890000000
      },
      securityData: {
        riskScore: 8,
        riskLevel: 'LOW',
        issues: [],
        isHoneypot: false
      },
      tokenomics: {
        holderCount: 2456789,
        topHoldersPercentage: 15.8,
        burnMechanism: false
      },
      ai_insights: {
        summary: 'USDC is a regulated stablecoin with minimal risk and strong backing.',
        riskFactors: [],
        confidence: 0.98
      },
      hitCount: 1024,
      queryCount: 1024
    }
  ]

  const batch = db.batch()

  for (const token of testTokens) {
    const docRef = db.collection('tokenCache').doc(token.address.toLowerCase())
    
    const cacheData = {
      ...token,
      address: token.address.toLowerCase(),
      cachedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000)), // Random time in last 6 hours
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 60 * 1000)), // 30 hours from now
      lastAccessed: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 60 * 60 * 1000)), // Random time in last hour
      lastUpdated: new Date().toISOString(),
      chainId: token.chain === 'ethereum' ? '1' : token.chain === 'bsc' ? '56' : token.chain === 'solana' ? 'solana' : '1'
    }

    batch.set(docRef, cacheData)
    console.log(`✅ Added ${token.symbol} (${token.address})`)
  }

  await batch.commit()
  console.log('🎉 Test cache data populated successfully!')
  
  // Show stats
  const snapshot = await db.collection('tokenCache').get()
  console.log(`📊 Total cache entries: ${snapshot.size}`)
  
  process.exit(0)
}

// Handle errors
populateTestCache().catch(error => {
  console.error('❌ Error populating cache:', error)
  process.exit(1)
})