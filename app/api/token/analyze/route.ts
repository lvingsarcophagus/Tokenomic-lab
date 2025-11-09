import { NextRequest, NextResponse } from 'next/server'
import { GoPlusService } from '@/lib/api-services'

export async function POST(request: NextRequest) {
  try {
    const { address, chain = '1' } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      )
    }

    // Get security analysis from GoPlus
    const securityAnalysis = await GoPlusService.getSecurityAnalysis(chain, address)

    if (!securityAnalysis) {
      return NextResponse.json(
        { error: 'Failed to fetch security analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: securityAnalysis,
    })
  } catch (error) {
    console.error('Token analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze token' },
      { status: 500 }
    )
  }
}
