'use client'

import { TrendingUp, Users, Droplet, DollarSign, Clock } from 'lucide-react'

interface MarketMetricsProps {
  marketCap?: string
  liquidity?: string
  volume24h?: string
  price?: number
  holders?: number
  age?: string
  tokenData?: any // Accept full token data object
}

export default function MarketMetrics({
  marketCap,
  liquidity,
  volume24h,
  price,
  holders,
  age,
  tokenData
}: MarketMetricsProps) {
  // Helper functions first
  const formatPrice = (price: number): string => {
    if (price >= 1) return `$${price.toFixed(2)}`
    if (price >= 0.01) return `$${price.toFixed(4)}`
    if (price >= 0.0001) return `$${price.toFixed(6)}`
    return `$${price.toExponential(2)}`
  }

  const formatCurrency = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatHolderCount = (count: number): string => {
    if (count >= 1e6) return `${(count / 1e6).toFixed(2)}M`
    if (count >= 1e3) return `${(count / 1e3).toFixed(2)}K`
    return count.toLocaleString()
  }

  // Extract data from tokenData if provided
  let extractedData = {
    marketCap: marketCap || 'N/A',
    liquidity: liquidity || 'N/A',
    volume24h: volume24h || 'N/A',
    price: price || 0,
    holders: holders || 0,
    age: age || 'N/A'
  }

  if (tokenData) {
    // Extract market data from various sources
    extractedData.marketCap = tokenData.marketCap || 'N/A'
    extractedData.price = tokenData.price || 0
    extractedData.age = tokenData.age || 'N/A'
    
    // Extract holder count from various sources
    const rawData = tokenData.rawData
    const enhancedData = tokenData.enhancedData
    
    if (rawData?.heliusData?.holders?.count) {
      extractedData.holders = rawData.heliusData.holders.count
    } else if (enhancedData?.holder_analysis?.total_holders) {
      extractedData.holders = enhancedData.holder_analysis.total_holders
    } else if (rawData?.securityData?.holderCount) {
      extractedData.holders = rawData.securityData.holderCount
    } else if (rawData?.holderCount) {
      extractedData.holders = rawData.holderCount
    } else if (enhancedData?.holderCount) {
      extractedData.holders = enhancedData.holderCount
    } else if (rawData?.unifiedData?.holderCount) {
      extractedData.holders = rawData.unifiedData.holderCount
    } else if (tokenData.holderCount) {
      extractedData.holders = tokenData.holderCount
    } else if (tokenData.ai_summary?.overview) {
      // Extract from AI summary as fallback
      const overview = tokenData.ai_summary.overview
      const holderMatch = overview.match(/(\d{1,3}(?:,\d{3})*)\s+holders/i)
      if (holderMatch) {
        const holderCount = parseInt(holderMatch[1].replace(/,/g, ''))
        extractedData.holders = holderCount
      }
    }
    
    // Extract liquidity and volume from price data or enhanced data
    if (rawData?.priceData?.liquidity) {
      extractedData.liquidity = formatCurrency(rawData.priceData.liquidity)
    } else if (enhancedData?.liquidity_analysis?.total_liquidity) {
      extractedData.liquidity = formatCurrency(enhancedData.liquidity_analysis.total_liquidity)
    }
    
    if (rawData?.priceData?.volume24h) {
      extractedData.volume24h = formatCurrency(rawData.priceData.volume24h)
    } else if (enhancedData?.market_data?.volume_24h) {
      extractedData.volume24h = formatCurrency(enhancedData.market_data.volume_24h)
    }
  }

  return (
    <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Glassmorphism background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-white font-mono text-xs tracking-wider mb-4 flex items-center gap-2">
          <div className="p-1.5 border border-cyan-500/30 bg-cyan-500/10 rounded">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          MARKET SENTIMENT
        </h3>
        
        {/* Market Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {/* Market Cap */}
          <div className="relative border border-white/10 bg-black/30 backdrop-blur-sm p-3 text-center hover:bg-black/40 transition-all duration-200 group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
            <div className="relative">
              <div className="text-white/60 font-mono text-[9px] tracking-wider mb-1 uppercase">
                Market Cap
              </div>
              <div className="text-white font-mono text-sm font-bold">
                {extractedData.marketCap}
              </div>
            </div>
          </div>

          {/* Liquidity */}
          <div className="relative border border-white/10 bg-black/30 backdrop-blur-sm p-3 text-center hover:bg-black/40 transition-all duration-200 group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
            <div className="relative">
              <div className="text-white/60 font-mono text-[9px] tracking-wider mb-1 flex items-center justify-center gap-1 uppercase">
                <Droplet className="w-2.5 h-2.5" />
                Liquidity
              </div>
              <div className="text-cyan-400 font-mono text-sm font-bold">
                {extractedData.liquidity}
              </div>
            </div>
          </div>

          {/* Volume 24h */}
          <div className="relative border border-white/10 bg-black/30 backdrop-blur-sm p-3 text-center hover:bg-black/40 transition-all duration-200 group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
            <div className="relative">
              <div className="text-white/60 font-mono text-[9px] tracking-wider mb-1 uppercase">
                Volume 24H
              </div>
              <div className="text-purple-400 font-mono text-sm font-bold">
                {extractedData.volume24h}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="relative border border-white/10 bg-black/30 backdrop-blur-sm p-3 text-center hover:bg-black/40 transition-all duration-200 group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
            <div className="relative">
              <div className="text-white/60 font-mono text-[9px] tracking-wider mb-1 flex items-center justify-center gap-1 uppercase">
                <DollarSign className="w-2.5 h-2.5" />
                Price
              </div>
              <div className="text-green-400 font-mono text-sm font-bold">
                {extractedData.price > 0 ? formatPrice(extractedData.price) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Holders */}
          <div className="relative border border-white/10 bg-black/30 backdrop-blur-sm p-3 text-center hover:bg-black/40 transition-all duration-200 group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
            <div className="relative">
              <div className="text-white/60 font-mono text-[9px] tracking-wider mb-1 flex items-center justify-center gap-1 uppercase">
                <Users className="w-2.5 h-2.5" />
                Holders
              </div>
              <div className="text-yellow-400 font-mono text-sm font-bold">
                {extractedData.holders > 0 ? formatHolderCount(extractedData.holders) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Age */}
          <div className="relative border border-white/10 bg-black/30 backdrop-blur-sm p-3 text-center hover:bg-black/40 transition-all duration-200 group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
            <div className="relative">
              <div className="text-white/60 font-mono text-[9px] tracking-wider mb-1 flex items-center justify-center gap-1 uppercase">
                <Clock className="w-2.5 h-2.5" />
                Token Age
              </div>
              <div className="text-orange-400 font-mono text-sm font-bold">
                {extractedData.age}
              </div>
            </div>
          </div>
        </div>

        {/* Market Sentiment Indicators */}
        <div className="border-t border-white/10 pt-4">
          <div className="text-white/60 font-mono text-[9px] tracking-wider mb-3 uppercase text-center">
            Market Sentiment Analysis
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center group/sentiment">
              <div className="relative mb-2">
                <div className="w-12 h-12 mx-auto border-2 border-green-500/30 rounded-full flex items-center justify-center bg-green-500/10 group-hover/sentiment:border-green-500/50 group-hover/sentiment:bg-green-500/20 transition-all duration-200">
                  <span className="text-green-400 font-mono text-lg font-bold">
                    {extractedData.holders > 1000 && extractedData.price > 0 ? '65' : '45'}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl opacity-0 group-hover/sentiment:opacity-100 transition-opacity duration-200"></div>
              </div>
              <div className="text-green-400 font-mono text-xs font-bold mb-1">
                {extractedData.holders > 1000 && extractedData.price > 0 ? '65' : '45'}%
              </div>
              <div className="text-white/60 font-mono text-[9px] tracking-wider uppercase">
                Bullish
              </div>
            </div>
            
            <div className="text-center group/sentiment">
              <div className="relative mb-2">
                <div className="w-12 h-12 mx-auto border-2 border-yellow-500/30 rounded-full flex items-center justify-center bg-yellow-500/10 group-hover/sentiment:border-yellow-500/50 group-hover/sentiment:bg-yellow-500/20 transition-all duration-200">
                  <span className="text-yellow-400 font-mono text-lg font-bold">
                    {extractedData.holders > 1000 && extractedData.price > 0 ? '25' : '35'}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl opacity-0 group-hover/sentiment:opacity-100 transition-opacity duration-200"></div>
              </div>
              <div className="text-yellow-400 font-mono text-xs font-bold mb-1">
                {extractedData.holders > 1000 && extractedData.price > 0 ? '25' : '35'}%
              </div>
              <div className="text-white/60 font-mono text-[9px] tracking-wider uppercase">
                Neutral
              </div>
            </div>
            
            <div className="text-center group/sentiment">
              <div className="relative mb-2">
                <div className="w-12 h-12 mx-auto border-2 border-red-500/30 rounded-full flex items-center justify-center bg-red-500/10 group-hover/sentiment:border-red-500/50 group-hover/sentiment:bg-red-500/20 transition-all duration-200">
                  <span className="text-red-400 font-mono text-lg font-bold">
                    {extractedData.holders > 1000 && extractedData.price > 0 ? '10' : '20'}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl opacity-0 group-hover/sentiment:opacity-100 transition-opacity duration-200"></div>
              </div>
              <div className="text-red-400 font-mono text-xs font-bold mb-1">
                {extractedData.holders > 1000 && extractedData.price > 0 ? '10' : '20'}%
              </div>
              <div className="text-white/60 font-mono text-[9px] tracking-wider uppercase">
                Bearish
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}