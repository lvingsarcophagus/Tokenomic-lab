import { NextRequest, NextResponse } from 'next/server'
import { getHeliusDashboardData } from '@/lib/api/helius'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      )
    }

    // Validate Solana address format
    if (address.length < 32 || address.length > 44) {
      return NextResponse.json(
        { success: false, error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    console.log(`[Helius API] Fetching dashboard data for ${address}`)

    const data = await getHeliusDashboardData(address)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch Helius data. Token may not exist or API key not configured.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    console.error('[Helius API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
