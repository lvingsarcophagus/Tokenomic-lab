import { NextRequest, NextResponse } from 'next/server'
import { testAllAPIs, testSolanaToken } from '@/lib/api-test-utils'

/**
 * API Route to test all integrated APIs
 * GET /api/test - Test all APIs
 * GET /api/test?solana=ADDRESS - Test Solana token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const solanaAddress = searchParams.get('solana')

    let results

    if (solanaAddress) {
      // Test specific Solana token
      results = await testSolanaToken(solanaAddress)
    } else {
      // Test all APIs
      results = await testAllAPIs()
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      averageResponseTime: Math.round(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      ),
    }

    return NextResponse.json({
      success: true,
      summary,
      results,
    })
  } catch (error) {
    console.error('API test error:', error)
    return NextResponse.json(
      {
        error: 'Failed to run API tests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}






