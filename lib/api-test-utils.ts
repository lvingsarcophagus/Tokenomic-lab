// API testing utilities to verify all endpoints are working

import { MobulaService } from './api-services'
import { GoPlusService } from './api-services'
import { CoinMarketCapService } from './api-services'
import { CoinGeckoService } from './api-services'

export interface APITestResult {
  api: string
  success: boolean
  error?: string
  responseTime: number
  data?: any
}

/**
 * Test all APIs with known tokens
 */
export async function testAllAPIs(): Promise<APITestResult[]> {
  const results: APITestResult[] = []

  // Test tokens
  const testTokens = {
    ethereum: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
    symbol: 'BTC',
  }

  // Test Mobula API
  results.push(await testMobulaAPI(testTokens.ethereum))
  results.push(await testMobulaAPI(testTokens.solana, 'solana'))

  // Test GoPlus API (EVM only)
  results.push(await testGoPlusAPI(testTokens.ethereum, '1'))

  // Test CoinMarketCap API
  results.push(await testCoinMarketCapAPI(testTokens.symbol))

  // Test CoinGecko API
  results.push(await testCoinGeckoAPI(testTokens.symbol))

  return results
}

async function testMobulaAPI(address: string, chain?: string): Promise<APITestResult> {
  const startTime = Date.now()
  try {
    const data = await MobulaService.getTokenData(address)
    return {
      api: `Mobula (${chain || 'auto'})`,
      success: !!data,
      responseTime: Date.now() - startTime,
      data: data ? { name: data.name, symbol: data.symbol } : undefined,
    }
  } catch (error) {
    return {
      api: `Mobula (${chain || 'auto'})`,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    }
  }
}

async function testGoPlusAPI(address: string, chainId: string): Promise<APITestResult> {
  const startTime = Date.now()
  try {
    const data = await GoPlusService.getSecurityAnalysis(chainId, address)
    return {
      api: `GoPlus (Chain ${chainId})`,
      success: !!data,
      responseTime: Date.now() - startTime,
      data: data ? { riskLevel: data.riskLevel, issues: data.issues.length } : undefined,
    }
  } catch (error) {
    return {
      api: `GoPlus (Chain ${chainId})`,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    }
  }
}

async function testCoinMarketCapAPI(symbol: string): Promise<APITestResult> {
  const startTime = Date.now()
  try {
    const data = await CoinMarketCapService.getTokenData(symbol)
    return {
      api: 'CoinMarketCap',
      success: !!data,
      responseTime: Date.now() - startTime,
      data: data ? { name: data.name, symbol: data.symbol } : undefined,
    }
  } catch (error) {
    return {
      api: 'CoinMarketCap',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    }
  }
}

async function testCoinGeckoAPI(symbol: string): Promise<APITestResult> {
  const startTime = Date.now()
  try {
    const data = await CoinGeckoService.getTokenData(symbol.toLowerCase())
    return {
      api: 'CoinGecko',
      success: !!data,
      responseTime: Date.now() - startTime,
      data: data ? { name: data.name, symbol: data.symbol } : undefined,
    }
  } catch (error) {
    return {
      api: 'CoinGecko',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    }
  }
}

/**
 * Test Solana token scanning
 */
export async function testSolanaToken(solanaAddress: string): Promise<APITestResult[]> {
  const results: APITestResult[] = []
  
  // Test Mobula with Solana address
  results.push(await testMobulaAPI(solanaAddress, 'solana'))
  
  // Test with SOL symbol via CoinGecko
  try {
    const startTime = Date.now()
    const geckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
    const geckoResponse = await fetch(geckoUrl, {
      headers: { 'Accept': 'application/json' },
    })
    
    if (geckoResponse.ok) {
      const geckoData = await geckoResponse.json()
      const data = geckoData.solana
      results.push({
        api: 'CoinGecko (Solana)',
        success: !!data,
        responseTime: Date.now() - startTime,
        data: data ? { price: data.usd } : undefined,
      })
    } else {
      results.push({
        api: 'CoinGecko (Solana)',
        success: false,
        error: `HTTP ${geckoResponse.status}`,
        responseTime: Date.now() - startTime,
      })
    }
  } catch (error) {
    results.push({
      api: 'CoinGecko (Solana)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: 0,
    })
  }
  
  // Note: GoPlus doesn't support Solana, so skip that test
  results.push({
    api: 'GoPlus (Solana)',
    success: false,
    error: 'GoPlus Security API supports EVM chains only. Solana is not supported.',
    responseTime: 0,
  })
  
  return results
}

