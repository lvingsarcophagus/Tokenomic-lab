import { NextRequest, NextResponse } from 'next/server'

/**
 * Fetch all tokens in a Solana wallet using Helius DAS API
 */
export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }
    
    const heliusApiKey = process.env.HELIUS_API_KEY
    
    if (!heliusApiKey) {
      console.warn('[Wallet API] Helius API key not configured')
      return NextResponse.json(
        { error: 'Helius API not configured' },
        { status: 500 }
      )
    }
    
    // Fetch tokens using Helius DAS API
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'wallet-tokens',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: 1000,
            displayOptions: {
              showFungible: true,
              showNativeBalance: true
            }
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || 'Helius API error')
    }
    
    const assets = data.result?.items || []
    
    // Filter and format tokens
    const tokens = assets
      .filter((asset: any) => {
        // Only include fungible tokens (SPL tokens)
        return asset.interface === 'FungibleToken' || 
               asset.interface === 'FungibleAsset'
      })
      .map((asset: any) => {
        const tokenInfo = asset.token_info || {}
        const content = asset.content || {}
        const metadata = content.metadata || {}
        
        return {
          address: asset.id,
          symbol: tokenInfo.symbol || metadata.symbol || 'UNKNOWN',
          name: metadata.name || tokenInfo.name || 'Unknown Token',
          balance: tokenInfo.balance || 0,
          decimals: tokenInfo.decimals || 9,
          uiAmount: tokenInfo.balance 
            ? tokenInfo.balance / Math.pow(10, tokenInfo.decimals || 9)
            : 0,
          logoURI: content.links?.image || metadata.image
        }
      })
      .filter((token: any) => token.uiAmount > 0) // Only tokens with balance
      .sort((a: any, b: any) => b.uiAmount - a.uiAmount) // Sort by balance
    
    console.log(`[Wallet API] Found ${tokens.length} tokens for ${walletAddress}`)
    
    return NextResponse.json({
      success: true,
      walletAddress,
      tokenCount: tokens.length,
      tokens
    })
  } catch (error: any) {
    console.error('[Wallet API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch wallet tokens',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
