'use client'

import { Users } from 'lucide-react'

interface HolderData {
  address: string
  balance: number
  percentage?: number
}

interface HolderDistributionProps {
  totalHolders?: number
  topHolders?: HolderData[]
  totalSupply?: number
  top10Percentage?: number
  top50Percentage?: number
  top100Percentage?: number
  tokenData?: any // Accept full token data object
}

export default function HolderDistribution({
  totalHolders,
  topHolders,
  totalSupply,
  top10Percentage,
  top50Percentage,
  top100Percentage,
  tokenData
}: HolderDistributionProps) {
  // Extract data from tokenData if provided
  let extractedData = {
    totalHolders: totalHolders || 0,
    topHolders: topHolders || [],
    totalSupply: totalSupply,
    top10Percentage: top10Percentage,
    top50Percentage: top50Percentage,
    top100Percentage: top100Percentage
  }

  if (tokenData) {
    // Try multiple paths to extract holder data
    const rawData = tokenData.rawData
    const enhancedData = tokenData.enhancedData
    
    // Check for Helius data (Solana) - this is the main path for BONK
    if (rawData?.heliusData?.holders) {
      const heliusHolders = rawData.heliusData.holders
      extractedData.totalHolders = heliusHolders.count || 0
      extractedData.topHolders = heliusHolders.topHolders || []
      extractedData.top10Percentage = heliusHolders.top10Percentage
      extractedData.top50Percentage = heliusHolders.top50Percentage
      extractedData.top100Percentage = heliusHolders.top100Percentage
    }
    // Check for enhanced data holder info
    else if (enhancedData?.holder_analysis) {
      const holderAnalysis = enhancedData.holder_analysis
      extractedData.totalHolders = holderAnalysis.total_holders || 0
      extractedData.topHolders = holderAnalysis.top_holders || []
      extractedData.top10Percentage = holderAnalysis.top_10_concentration
      extractedData.top50Percentage = holderAnalysis.top_50_concentration
      extractedData.top100Percentage = holderAnalysis.top_100_concentration
    }
    // Check for security data holder count
    else if (rawData?.securityData?.holderCount) {
      extractedData.totalHolders = rawData.securityData.holderCount
    }
    // Check for Moralis holder data
    else if (rawData?.moralisData?.holders) {
      extractedData.totalHolders = rawData.moralisData.holders.length || 0
      extractedData.topHolders = rawData.moralisData.holders || []
    }
    // Check for holder count in various data paths
    else if (rawData?.holderCount) {
      extractedData.totalHolders = rawData.holderCount
    }
    else if (enhancedData?.holderCount) {
      extractedData.totalHolders = enhancedData.holderCount
    }
    else if (rawData?.unifiedData?.holderCount) {
      extractedData.totalHolders = rawData.unifiedData.holderCount
    }
    else if (tokenData.holderCount) {
      extractedData.totalHolders = tokenData.holderCount
    }
    // Extract from AI summary as fallback (this is what's working for BONK)
    else if (tokenData.ai_summary?.overview) {
      const overview = tokenData.ai_summary.overview
      const holderMatch = overview.match(/(\d{1,3}(?:,\d{3})*)\s+holders/i)
      if (holderMatch) {
        const holderCount = parseInt(holderMatch[1].replace(/,/g, ''))
        extractedData.totalHolders = holderCount
      }
    }
  }

  // Calculate percentages if totalSupply is provided
  const holdersWithPercentages = (extractedData.topHolders || []).map(holder => {
    if (holder.percentage !== undefined) {
      return holder
    }
    if (totalSupply && totalSupply > 0) {
      return {
        ...holder,
        percentage: (holder.balance / totalSupply) * 100
      }
    }
    return holder
  })

  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const renderProgressBar = (percentage: number) => {
    const filled = Math.round((percentage / 100) * 10)
    const empty = 10 - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  return (
    <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Glassmorphism background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-white font-mono text-xs tracking-wider mb-4 flex items-center gap-2">
          <div className="p-1.5 border border-purple-500/30 bg-purple-500/10 rounded">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          HOLDER DISTRIBUTION
        </h3>

        {/* Total Holders - Enhanced */}
        <div className="relative mb-6 pb-4 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded"></div>
          <div className="relative p-4 text-center">
            <div className="text-white/60 font-mono text-[9px] tracking-wider mb-2 uppercase">
              Total Holders
            </div>
            <div className="text-white font-mono text-3xl font-bold mb-1">
              {extractedData.totalHolders > 0 ? extractedData.totalHolders.toLocaleString() : 'N/A'}
            </div>
            {extractedData.totalHolders > 0 && (
              <div className="text-purple-400 font-mono text-xs">
                {extractedData.totalHolders > 10000 ? 'WIDELY DISTRIBUTED' : 
                 extractedData.totalHolders > 1000 ? 'MODERATELY DISTRIBUTED' : 'LIMITED DISTRIBUTION'}
              </div>
            )}
          </div>
        </div>

        {/* Concentration Metrics - Enhanced */}
        {(extractedData.top10Percentage || extractedData.top50Percentage || extractedData.top100Percentage) && (
          <div className="space-y-4 mb-6">
            <div className="text-white/60 font-mono text-[9px] tracking-wider mb-3 uppercase text-center">
              Concentration Analysis
            </div>
            
            {extractedData.top10Percentage !== undefined && (
              <div className="relative p-3 border border-cyan-500/20 bg-cyan-500/5 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 font-mono text-[10px] tracking-wider uppercase">
                    Top 10 Holders
                  </span>
                  <span className="text-cyan-400 font-mono text-sm font-bold">
                    {extractedData.top10Percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(extractedData.top10Percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-right">
                  <span className={`font-mono text-[9px] ${
                    extractedData.top10Percentage > 50 ? 'text-red-400' :
                    extractedData.top10Percentage > 30 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {extractedData.top10Percentage > 50 ? 'HIGH RISK' :
                     extractedData.top10Percentage > 30 ? 'MODERATE' : 'HEALTHY'}
                  </span>
                </div>
              </div>
            )}

            {extractedData.top50Percentage !== undefined && (
              <div className="relative p-3 border border-yellow-500/20 bg-yellow-500/5 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 font-mono text-[10px] tracking-wider uppercase">
                    Top 50 Holders
                  </span>
                  <span className="text-yellow-400 font-mono text-sm font-bold">
                    {extractedData.top50Percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(extractedData.top50Percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {extractedData.top100Percentage !== undefined && (
              <div className="relative p-3 border border-orange-500/20 bg-orange-500/5 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 font-mono text-[10px] tracking-wider uppercase">
                    Top 100 Holders
                  </span>
                  <span className="text-orange-400 font-mono text-sm font-bold">
                    {extractedData.top100Percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(extractedData.top100Percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Holders List - Enhanced */}
        {holdersWithPercentages.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <div className="text-white/60 font-mono text-[9px] tracking-wider mb-3 uppercase text-center">
              Top {Math.min(5, holdersWithPercentages.length)} Holders
            </div>
            <div className="space-y-2">
              {holdersWithPercentages.slice(0, 5).map((holder, index) => (
                <div key={holder.address} className="relative group/holder">
                  <div className="flex items-center justify-between p-3 border border-white/10 bg-black/20 rounded hover:bg-black/30 hover:border-white/20 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                        <span className="text-white/60 font-mono text-[10px] font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-white font-mono text-xs">
                        {formatAddress(holder.address)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {holder.percentage !== undefined && (
                        <>
                          <span className={`font-mono text-xs font-bold ${
                            holder.percentage > 10 ? 'text-red-400' :
                            holder.percentage > 5 ? 'text-orange-400' :
                            holder.percentage > 2 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {holder.percentage.toFixed(2)}%
                          </span>
                          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                holder.percentage > 10 ? 'bg-red-400' :
                                holder.percentage > 5 ? 'bg-orange-400' :
                                holder.percentage > 2 ? 'bg-yellow-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${Math.min(holder.percentage * 2, 100)}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Message - Enhanced */}
        {holdersWithPercentages.length === 0 && extractedData.totalHolders === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-white/20 rounded-full flex items-center justify-center bg-white/5">
              <Users className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/40 font-mono text-xs mb-2">
              NO HOLDER DATA AVAILABLE
            </p>
            <p className="text-white/30 font-mono text-[10px]">
              Scan a token to view distribution
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
