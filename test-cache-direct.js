/**
 * Direct test of cache functionality without requiring dev server
 * Tests the cache functions directly
 */

// Import required modules
const { setCachedTokenData, getCachedTokenData } = require('./lib/tokenomics-cache.ts')

const testCacheDirectly = async () => {
  console.log('🧪 Testing cache functionality directly...')
  
  const testAddress = '0x6982508145454ce325ddbe47a25d4ec3d2311933' // PEPE
  
  try {
    // Test data to cache
    const testData = {
      address: testAddress,
      name: 'Pepe',
      symbol: 'PEPE',
      chainId: '1',
      priceData: {
        price: 0.000001,
        marketCap: 1000000,
        volume24h: 50000,
        priceChange24h: 0.05,
        liquidity: 100000,
        circulatingSupply: 1000000000,
        totalSupply: 1000000000
      },
      securityData: {
        riskScore: 25,
        riskLevel: 'LOW',
        issues: [],
        isHoneypot: false
      },
      tokenomics: {
        holderCount: 50000,
        topHoldersPercentage: 0.15,
        burnMechanism: true,
        maxSupply: 1000000000
      }
    }

    console.log('📝 Saving test data to cache...')
    await setCachedTokenData(testAddress, testData)
    
    console.log('📖 Reading data from cache...')
    const cachedData = await getCachedTokenData(testAddress)
    
    if (cachedData) {
      console.log('✅ Cache test successful!')
      console.log('Cached data:', {
        address: cachedData.address,
        name: cachedData.name,
        symbol: cachedData.symbol,
        hasPriceData: !!cachedData.priceData,
        hasSecurityData: !!cachedData.securityData,
        hasTokenomics: !!cachedData.tokenomics
      })
    } else {
      console.log('❌ Cache test failed - no data returned')
    }

  } catch (error) {
    console.error('❌ Cache test failed:', error.message)
  }
}

// Run the test
testCacheDirectly()