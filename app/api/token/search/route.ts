import { NextRequest, NextResponse } from 'next/server'

interface TokenSearchResult {
  symbol: string
  name: string
  address: string
  chainId: string
  chainName: string
  marketCap?: number
  price?: number
  logo?: string
}

/**
 * Token Search API - Search for tokens across multiple chains
 * GET /api/token/search?query=UNI
 * Updated: 2025-11-09 00:30
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[TokenSearch] === NEW REQUEST ===')
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    console.log('[TokenSearch] Query:', query)

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toUpperCase()
    const tokens: TokenSearchResult[] = []

    // Try Mobula API first (more reliable for contract addresses)
    try {
      console.log('[TokenSearch] Trying Mobula API...')
      // Mobula uses /search?input= not /metadata/search?query=
      const mobulaUrl = `https://api.mobula.io/api/1/search?input=${encodeURIComponent(query)}`
      const headers: HeadersInit = {
        'Accept': 'application/json',
      }
      
      // Add API key if available (optional for Mobula)
      if (process.env.MOBULA_API_KEY) {
        headers['Authorization'] = process.env.MOBULA_API_KEY
      }
      
      const mobulaResponse = await fetch(mobulaUrl, { headers })

      console.log('[TokenSearch] Mobula response:', mobulaResponse.status)
      
      if (mobulaResponse.ok) {
        const data = await mobulaResponse.json()
        console.log('[TokenSearch] Mobula found:', data.data?.length || 0, 'tokens')
        
        if (data.data && Array.isArray(data.data)) {
          const chainMap: Record<string, { id: string; name: string }> = {
            'Ethereum': { id: '1', name: 'Ethereum' },
            'BNB Smart Chain (BEP20)': { id: '56', name: 'BSC' },
            'Polygon': { id: '137', name: 'Polygon' },
            'Avalanche C-Chain': { id: '43114', name: 'Avalanche' },
            'Arbitrum': { id: '42161', name: 'Arbitrum' },
            'Optimistic': { id: '10', name: 'Optimism' },
            'Base': { id: '8453', name: 'Base' },
          }
          
          // Process first 5 tokens (sorted by relevance)
          for (const token of data.data.slice(0, 5)) {
            // Mobula returns contracts and blockchains as space-separated strings
            // Sometimes multiple contracts per blockchain separated by commas
            const contractStr = token.contracts?.toString() || ''
            const blockchainStr = token.blockchains?.toString() || ''
            
            // Split by space first (different blockchains)
            const contractGroups = contractStr.split(' ')
            const blockchains = blockchainStr.split(' ')
            
            // Match each contract group with its blockchain
            for (let i = 0; i < Math.min(contractGroups.length, blockchains.length); i++) {
              // Some groups have multiple addresses separated by commas - take first only
              const addresses = contractGroups[i].split(',')
              const address = addresses[0]?.trim()
              const blockchain = blockchains[i]?.trim()
              
              if (address && blockchain && address.startsWith('0x')) {
                // Find matching chain (partial match on first word)
                const chainEntry = Object.entries(chainMap).find(([key]) => 
                  blockchain.includes(key.split(' ')[0])
                )?.[1]
                
                if (chainEntry) {
                  const tokenResult = {
                    symbol: (token.symbol || '').toUpperCase(),
                    name: token.name || '',
                    address: address,
                    chainId: chainEntry.id,
                    chainName: chainEntry.name,
                    marketCap: token.market_cap,
                    price: token.price,
                    logo: token.logo || '',
                  }
                  console.log('[TokenSearch] Adding:', tokenResult.symbol, 'on', tokenResult.chainName, '-', address.substring(0, 10) + '...')
                  tokens.push(tokenResult)
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[TokenSearch] Mobula error:', error)
    }

    // Fallback: Try CoinGecko API if Mobula didn't return enough results
    if (tokens.length < 3) {
      console.log('[TokenSearch] Trying CoinGecko as fallback...')
      try {
      const coingeckoUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      console.log('[TokenSearch] Fetching from CoinGecko:', coingeckoUrl)
      const response = await fetch(coingeckoUrl, {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY } : {}),
        },
      })

      console.log('[TokenSearch] CoinGecko response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('[TokenSearch] CoinGecko found coins:', data.coins?.length || 0)
        
        if (data.coins && Array.isArray(data.coins)) {
          console.log('[TokenSearch] Processing', Math.min(data.coins.length, 3), 'top coins')
          // Process top 3 results only - CoinGecko free tier has strict rate limits
          for (const coin of data.coins.slice(0, 3)) {
            try {
              // Use simpler coins/markets endpoint instead of individual coin details
              const marketsUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
              console.log('[TokenSearch] Fetching:', coin.id)
              
              const detailResponse = await fetch(marketsUrl, {
                headers: {
                  'Accept': 'application/json',
                  ...(process.env.COINGECKO_API_KEY ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY } : {}),
                },
              })

              console.log('[TokenSearch] Response:', detailResponse.status)
              
              if (detailResponse.ok) {
                const detailData = await detailResponse.json()
                const platforms = detailData.platforms || {}
                const marketData = detailData.market_data || {}
                
                console.log('[TokenSearch] Found', Object.keys(platforms).length, 'platforms for', coin.symbol)

                // Map of supported chains
                const chainMap: Record<string, { id: string; name: string }> = {
                  'ethereum': { id: '1', name: 'Ethereum' },
                  'binance-smart-chain': { id: '56', name: 'BSC' },
                  'polygon-pos': { id: '137', name: 'Polygon' },
                  'avalanche': { id: '43114', name: 'Avalanche' },
                  'arbitrum-one': { id: '42161', name: 'Arbitrum' },
                  'optimistic-ethereum': { id: '10', name: 'Optimism' },
                  'base': { id: '8453', name: 'Base' },
                }

                // Add token for each supported chain
                for (const [platform, address] of Object.entries(platforms)) {
                  if (address && typeof address === 'string' && address !== '' && !address.includes('.')) {
                    const chain = chainMap[platform]
                    if (chain) {
                      const token = {
                        symbol: (detailData.symbol || coin.symbol || '').toUpperCase(),
                        name: detailData.name || coin.name,
                        address: address as string,
                        chainId: chain.id,
                        chainName: chain.name,
                        marketCap: marketData.market_cap?.usd,
                        price: marketData.current_price?.usd,
                        logo: detailData.image?.small || coin.thumb,
                      }
                      console.log('[TokenSearch] Adding:', token.symbol, 'on', token.chainName, '-', token.address.substring(0, 10) + '...')
                      tokens.push(token)
                    }
                  }
                }
              } else if (detailResponse.status === 429) {
                console.log('[TokenSearch] Rate limited, stopping')
                break // Stop if rate limited
              }

              // Delay to avoid rate limiting (CoinGecko free tier: 10-50 calls/min)
              await new Promise(resolve => setTimeout(resolve, 1500))
            } catch (error) {
              console.error(`[TokenSearch] Error for ${coin.id}:`, error)
            }
          }
        }
      }
      } catch (error) {
        console.error('[TokenSearch] CoinGecko error:', error)
      }
    }

    // Remove duplicates based on address + chainId
    const uniqueTokens = tokens.filter((token, index, self) =>
      index === self.findIndex((t) => 
        t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId
      )
    )

    // Sort by market cap (highest first), then alphabetically
    uniqueTokens.sort((a, b) => {
      if (a.marketCap && b.marketCap) {
        return b.marketCap - a.marketCap
      }
      if (a.marketCap) return -1
      if (b.marketCap) return 1
      return a.symbol.localeCompare(b.symbol)
    })

    console.log('[TokenSearch] Returning', uniqueTokens.length, 'unique tokens')
    return NextResponse.json({
      success: true,
      query: searchTerm,
      count: uniqueTokens.length,
      tokens: uniqueTokens,
    })
  } catch (error) {
    console.error('[TokenSearch] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
