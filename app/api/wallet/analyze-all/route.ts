import { NextRequest, NextResponse } from 'next/server'

/**
 * Analyze all tokens in a wallet
 * Returns risk scores for all tokens
 */
export async function POST(req: NextRequest) {
  try {
    const { tokens, userId, plan } = await req.json()
    
    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: 'Tokens array required' },
        { status: 400 }
      )
    }
    
    console.log(`[Bulk Analysis] Analyzing ${tokens.length} tokens`)
    
    // Analyze tokens in parallel (limit to 10 at a time to avoid rate limits)
    const batchSize = 10
    const results: any[] = []
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(async (token: any) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze-token`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tokenAddress: token.address,
                  chainId: '501', // Solana
                  plan: plan || 'PREMIUM',
                  userId: userId || 'anonymous',
                  bypassCache: false,
                  metadata: {
                    tokenSymbol: token.symbol,
                    tokenName: token.name,
                    chain: 'SOLANA'
                  }
                })
              }
            )
            
            if (!response.ok) {
              throw new Error(`Analysis failed: ${response.status}`)
            }
            
            const data = await response.json()
            
            return {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: token.uiAmount,
              riskScore: data.overall_risk_score,
              riskLevel: data.risk_level,
              success: true
            }
          } catch (error: any) {
            console.error(`[Bulk Analysis] Failed for ${token.symbol}:`, error.message)
            return {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: token.uiAmount,
              riskScore: null,
              riskLevel: 'UNKNOWN',
              success: false,
              error: error.message
            }
          }
        })
      )
      
      // Extract results
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        }
      })
      
      // Small delay between batches
      if (i + batchSize < tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Sort by risk score (highest first)
    results.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
    
    console.log(`[Bulk Analysis] Completed: ${results.filter(r => r.success).length}/${results.length} successful`)
    
    return NextResponse.json({
      success: true,
      totalTokens: tokens.length,
      analyzed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
  } catch (error: any) {
    console.error('[Bulk Analysis] Error:', error)
    return NextResponse.json(
      { 
        error: 'Bulk analysis failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
