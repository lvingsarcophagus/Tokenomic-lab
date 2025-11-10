/**
 * Chain-Adaptive Token Data Fetcher
 * Unified data fetching for ALL blockchains
 */

import { checkEVMSecurity, checkSolanaSecurity, checkCardanoSecurity } from '../security/adapters'
import { fetchCoinMarketCapData } from '../api/coinmarketcap'

export type ChainType = 'EVM' | 'SOLANA' | 'CARDANO' | 'OTHER'

export interface CompleteTokenData {
  // Market data (from Mobula - universal)
  marketCap: number
  fdv: number
  liquidityUSD: number
  volume24h: number
  price: number
  
  // Supply data
  totalSupply: number
  circulatingSupply: number
  maxSupply: number | null
  burnedSupply: number
  burnedPercentage: number
  
  // Holder data (chain-specific APIs)
  holderCount: number
  top10HoldersPct: number
  
  // Activity data
  txCount24h: number
  ageDays: number
  
  // Security data (chain-specific)
  securityScore: number
  criticalFlags: string[]
  warnings: string[]
  
  // Metadata
  chainType: ChainType
  chainId: number
  dataQuality: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR'
}

/**
 * Detect blockchain type from chainId
 */
export function detectChainType(chainId: number | string): ChainType {
  const id = typeof chainId === 'string' ? parseInt(chainId) : chainId
  
  // Solana
  if (id === 501 || id === 900) return 'SOLANA'
  
  // Cardano
  if (id === 1815) return 'CARDANO'
  
  // EVM chains
  const evmChains = [1, 56, 137, 43114, 250, 42161, 10, 8453, 324, 59144, 42220]
  if (evmChains.includes(id)) return 'EVM'
  
  return 'OTHER'
}

/**
 * Universal data fetcher - works for ALL chains
 */
export async function fetchCompleteTokenData(
  tokenAddress: string,
  chainId: number | string
): Promise<CompleteTokenData> {
  
  const chainType = detectChainType(chainId)
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId) : chainId
  
  console.log(`\n🌐 [Data Fetcher] Fetching ${chainType} token data for ${tokenAddress}`)
  
  // Step 1: Get market data (Mobula first, CoinMarketCap fallback)
  let marketData = await fetchMobulaMarketData(tokenAddress)
  
  // If Mobula failed completely, try CoinMarketCap
  if (marketData.marketCap === 0 && marketData.liquidityUSD === 0 && marketData.totalSupply === 0) {
    console.log(`⚠️ [Data Fetcher] Mobula returned no data, trying CoinMarketCap...`)
    const cmcData = await fetchCoinMarketCapData(tokenAddress, chainIdNum)
    
    if (cmcData) {
      console.log(`✅ [CoinMarketCap] Using CMC data as fallback`)
      marketData = {
        ...cmcData,
        burnedSupply: cmcData.totalSupply - cmcData.circulatingSupply,
        burnedPercentage: cmcData.totalSupply > 0 
          ? ((cmcData.totalSupply - cmcData.circulatingSupply) / cmcData.totalSupply) * 100 
          : 0,
        txCount24h: 0,  // CMC doesn't provide this
        ageDays: 0      // CMC doesn't provide this
      }
    }
  }
  
  // Step 2: Get chain-specific data (holders, security, etc.)
  let chainData
  
  switch (chainType) {
    case 'EVM':
      chainData = await fetchEVMChainData(tokenAddress, chainIdNum)
      break
      
    case 'SOLANA':
      chainData = await fetchSolanaChainData(tokenAddress)
      break
      
    case 'CARDANO':
      chainData = await fetchCardanoChainData(tokenAddress)
      break
      
    default:
      chainData = getDefaultChainData()
  }
  
  // Step 3: Calculate data quality
  const dataQuality = assessDataQuality(marketData, chainData)
  
  // Step 4: Combine everything
  const completeData: CompleteTokenData = {
    ...marketData,
    ...chainData,
    chainType,
    chainId: chainIdNum,
    dataQuality
  }
  
  console.log(`✅ [Data Fetcher] Complete data assembled (Quality: ${dataQuality})`)
  console.log(`   Market Cap: $${(completeData.marketCap / 1e6).toFixed(2)}M`)
  console.log(`   Liquidity: $${(completeData.liquidityUSD / 1e3).toFixed(2)}K`)
  console.log(`   Holders: ${completeData.holderCount.toLocaleString()}`)
  console.log(`   Top 10%: ${(completeData.top10HoldersPct * 100).toFixed(1)}%`)
  console.log(`   Security Score: ${completeData.securityScore}/100`)
  
  return completeData
}

// ============================================================================
// MOBULA MARKET DATA (Universal - All Chains)
// ============================================================================

async function fetchMobulaMarketData(tokenAddress: string) {
  try {
    const apiKey = process.env.MOBULA_API_KEY || ''
    const url = `https://api.mobula.io/api/1/market/data?asset=${encodeURIComponent(tokenAddress)}`
    
    console.log(`📊 [Mobula] Fetching market data...`)
    
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.log(`⚠️ [Mobula] API returned ${response.status} - will try fallback`)
      return getDefaultMarketData()
    }
    
    const json = await response.json()
    const data = json.data
    
    if (!data) {
      console.log(`⚠️ [Mobula] No data in response - will try fallback`)
      return getDefaultMarketData()
    }
    
    // Calculate burned supply
    const totalSupply = data.total_supply || 0
    const circulatingSupply = data.circulating_supply || totalSupply
    const burnedSupply = totalSupply - circulatingSupply
    const burnedPercentage = totalSupply > 0 ? (burnedSupply / totalSupply) * 100 : 0
    
    // Calculate age
    const ageDays = data.creation_date 
      ? Math.floor((Date.now() - new Date(data.creation_date * 1000).getTime()) / 86400000)
      : data.age_days || 0
    
    console.log(`✓ [Mobula] Market data fetched successfully`)
    
    return {
      marketCap: data.market_cap || 0,
      fdv: data.market_cap_diluted || data.fully_diluted_valuation || data.market_cap || 0,
      liquidityUSD: data.liquidity || 0,
      volume24h: data.volume || 0,
      price: data.price || 0,
      totalSupply,
      circulatingSupply,
      maxSupply: data.max_supply || null,
      burnedSupply,
      burnedPercentage,
      txCount24h: data.transactions_24h || data.tx_count_24h || 0,
      ageDays
    }
  } catch (error) {
    console.error(`❌ [Mobula] Fetch error:`, error instanceof Error ? error.message : 'Unknown error')
    return getDefaultMarketData()
  }
}

// ============================================================================
// EVM CHAIN DATA (GoPlus Security + Holder Data)
// ============================================================================

async function fetchEVMChainData(tokenAddress: string, chainId: number) {
  try {
    console.log(`🔗 [EVM] Fetching chain data...`)
    
    // Get GoPlus data
    const response = await fetch(
      `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${tokenAddress}`,
      { headers: { 'Accept': 'application/json' } }
    )
    
    const data = await response.json()
    const token = data.result?.[tokenAddress.toLowerCase()]
    
    if (!token) {
      console.log(`⚠️ [EVM] No GoPlus data available`)
      return getDefaultChainData()
    }
    
    // Parse holder data
    const holderCount = parseInt(token.holder_count || '0')
    
    // Calculate top 10 holders percentage
    let top10HoldersPct = 0.5 // Default 50%
    if (token.holders && Array.isArray(token.holders) && token.holders.length >= 10) {
      const top10 = token.holders.slice(0, 10)
      top10HoldersPct = top10.reduce((sum: number, h: any) => 
        sum + parseFloat(h.percent || '0'), 0
      ) / 100
    }
    
    // Run security checks
    const securityResult = await checkEVMSecurity(tokenAddress, chainId)
    
    console.log(`✓ [EVM] Chain data fetched (${holderCount.toLocaleString()} holders)`)
    
    return {
      holderCount,
      top10HoldersPct,
      securityScore: securityResult.score,
      criticalFlags: securityResult.checks
        .filter(c => c.severity === 'CRITICAL')
        .map(c => c.message),
      warnings: securityResult.checks
        .filter(c => c.severity === 'WARNING')
        .map(c => c.message)
    }
  } catch (error) {
    console.error(`❌ [EVM] Fetch failed:`, error)
    return getDefaultChainData()
  }
}

// ============================================================================
// SOLANA CHAIN DATA (Helius RPC + Security Checks)
// ============================================================================

async function fetchSolanaChainData(mintAddress: string) {
  try {
    console.log(`☀️ [Solana] Fetching chain data...`)
    
    const apiKey = process.env.HELIUS_API_KEY
    if (!apiKey) {
      console.log(`⚠️ [Solana] No Helius API key configured`)
      return getDefaultChainData()
    }
    
    // Get token metadata
    const metadataResponse = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [mintAddress] })
      }
    )
    
    const metadata = await metadataResponse.json()
    const token = metadata[0]
    
    if (!token) {
      console.log(`⚠️ [Solana] No token metadata found`)
      return getDefaultChainData()
    }
    
    // Get largest token accounts (top holders)
    const rpcResponse = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenLargestAccounts',
          params: [mintAddress]
        })
      }
    )
    
    const rpcData = await rpcResponse.json()
    const largestHolders = rpcData.result?.value || []
    
    // Calculate holder concentration
    const totalSupply = parseFloat(
      token.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.supply || '0'
    )
    
    const top10Balance = largestHolders.slice(0, 10).reduce((sum: number, holder: any) => {
      return sum + parseFloat(holder.amount || '0')
    }, 0)
    
    const top10HoldersPct = totalSupply > 0 ? top10Balance / totalSupply : 0.5
    
    // Run Solana security checks
    const securityResult = await checkSolanaSecurity(mintAddress)
    
    console.log(`✓ [Solana] Chain data fetched (Top 10: ${(top10HoldersPct * 100).toFixed(1)}%)`)
    
    return {
      holderCount: largestHolders.length, // Approximate (top 20 only from RPC)
      top10HoldersPct,
      securityScore: securityResult.score,
      criticalFlags: securityResult.checks
        .filter(c => c.severity === 'CRITICAL')
        .map(c => c.message),
      warnings: securityResult.checks
        .filter(c => c.severity === 'WARNING')
        .map(c => c.message)
    }
  } catch (error) {
    console.error(`❌ [Solana] Fetch failed:`, error)
    return getDefaultChainData()
  }
}

// ============================================================================
// CARDANO CHAIN DATA (Blockfrost API)
// ============================================================================

async function fetchCardanoChainData(assetId: string) {
  try {
    console.log(`₳ [Cardano] Fetching chain data...`)
    
    const projectId = process.env.BLOCKFROST_PROJECT_ID
    if (!projectId) {
      console.log(`⚠️ [Cardano] No Blockfrost project ID configured`)
      return getDefaultChainData()
    }
    
    // Run Cardano security checks
    const securityResult = await checkCardanoSecurity(assetId)
    
    console.log(`✓ [Cardano] Chain data fetched`)
    
    return {
      holderCount: 0, // Blockfrost doesn't provide holder count easily
      top10HoldersPct: 0.5, // Default estimate
      securityScore: securityResult.score,
      criticalFlags: securityResult.checks
        .filter(c => c.severity === 'CRITICAL')
        .map(c => c.message),
      warnings: securityResult.checks
        .filter(c => c.severity === 'WARNING')
        .map(c => c.message)
    }
  } catch (error) {
    console.error(`❌ [Cardano] Fetch failed:`, error)
    return getDefaultChainData()
  }
}

// ============================================================================
// FALLBACK DATA (When APIs fail)
// ============================================================================

function getDefaultMarketData() {
  return {
    marketCap: 0,
    fdv: 0,
    liquidityUSD: 0,
    volume24h: 0,
    price: 0,
    totalSupply: 0,
    circulatingSupply: 0,
    maxSupply: null,
    burnedSupply: 0,
    burnedPercentage: 0,
    txCount24h: 0,
    ageDays: 0
  }
}

function getDefaultChainData() {
  return {
    holderCount: 0,
    top10HoldersPct: 0.65, // Assume concentrated (risky default)
    securityScore: 60, // Assume moderate-high risk
    criticalFlags: ['⚠️ Insufficient data - using conservative estimates'],
    warnings: ['Data quality is limited']
  }
}

// ============================================================================
// DATA QUALITY ASSESSMENT
// ============================================================================

function assessDataQuality(marketData: any, chainData: any): 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' {
  let score = 0
  
  // Market data quality (more lenient scoring)
  if (marketData.marketCap > 0) score += 30      // Increased from 25
  if (marketData.liquidityUSD > 0) score += 20   // Decreased from 25
  if (marketData.volume24h > 0) score += 10      // Same
  if (marketData.totalSupply > 0) score += 15    // Increased from 10
  
  // Chain data quality (optional, not critical)
  if (chainData.holderCount > 0) score += 15     // Decreased from 20
  if (chainData.top10HoldersPct !== 0.5 && chainData.top10HoldersPct !== 0.65) score += 10 // Real data
  
  // More lenient thresholds
  if (score >= 85) return 'EXCELLENT'  // Was 90
  if (score >= 60) return 'GOOD'       // Was 70
  if (score >= 40) return 'MODERATE'   // Was 50
  return 'POOR'                        // Only if < 40 (missing critical market data)
}
