"use client"

import { useState } from "react"
import { Search, AlertCircle, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TokenScanService, CompleteTokenData } from "@/lib/token-scan-service"
import type { RiskResult } from "@/lib/types/token-data"
import { LoadingSpinner } from "./loading"

interface TokenSearchProps {
  onTokenSelect: (token: CompleteTokenData) => void
  onRiskResult?: (result: RiskResult) => void
  plan?: 'FREE' | 'PREMIUM'
  userId?: string
}

export default function TokenSearch({ onTokenSelect, onRiskResult, plan = 'FREE', userId }: TokenSearchProps) {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!search.trim()) return

    setLoading(true)
    setError("")

    try {
      // Real-time scanning using all APIs
      const query = search.trim()
      const tokenData = await TokenScanService.scanToken(query)
      if (!tokenData.priceData && !tokenData.securityData) {
        setError("TOKEN NOT FOUND. PLEASE CHECK THE ADDRESS OR SYMBOL.")
        setLoading(false)
        return
      }
      onTokenSelect(tokenData)

      // If looks like an EVM address, also call unified risk API
      if (onRiskResult && query.startsWith('0x')) {
        try {
          const res = await fetch('/api/analyze-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tokenAddress: query,
              chainId: tokenData.chain,
              userId: userId || 'web-user',
              plan,
            }),
          })
          if (res.ok) {
            const risk: RiskResult = await res.json()
            onRiskResult(risk)
          } else {
            const err = await res.json().catch(() => ({}))
            console.warn('Analyze API error', err)
          }
        } catch (e) {
          console.warn('Analyze API failed', e)
        }
      }
    } catch (err) {
      console.error("Token search error:", err)
      setError("FAILED TO ANALYZE TOKEN. PLEASE TRY AGAIN.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 border border-white/30">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-px bg-white"></div>
            <h3 className="text-xl lg:text-2xl font-bold text-white font-mono tracking-wider">TOKEN SCANNER</h3>
          </div>
          <p className="text-xs text-white/60 font-mono">ANALYZE TOKENS FOR SECURITY RISKS</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
              placeholder="ENTER TOKEN ADDRESS (0x... OR SOLANA) OR SYMBOL (BTC, ETH, SOL)..."
              className="pl-12 h-12 bg-black/40 border border-white/20 text-white placeholder:text-white/40 text-sm font-mono focus:border-white/40 focus:ring-0"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !search.trim()}
            className="h-12 px-6 bg-transparent border border-white text-white font-mono text-sm hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>SCANNING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>ANALYZE</span>
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-black/60 border border-white/20 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
            <span className="text-xs text-white font-mono">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-[8px] text-white/40 font-mono flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>LIVE SCANNING • MOBULA • COINGECKO • COINMARKETCAP • GOPLUS (EVM ONLY)</span>
          </div>
          
          {loading && (
            <div className="text-[8px] text-white/60 font-mono animate-pulse">
              ANALYZING TOKEN SECURITY...
            </div>
          )}
        </div>

        {/* Example searches */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-[8px] text-white/40 mb-2 font-mono">TRY THESE EXAMPLES:</div>
          <div className="flex flex-wrap gap-2">
            {["BTC", "ETH", "SOL", "0xdac17f958d2ee523a2206206994597c13d831ec7"].map((example) => (
              <button
                key={example}
                onClick={() => setSearch(example)}
                className="px-3 py-1 bg-black/40 hover:bg-black/60 border border-white/20 hover:border-white/40 text-xs text-white/60 hover:text-white font-mono transition-all"
              >
                {example.length > 20 ? `${example.slice(0, 10)}...${example.slice(-8)}` : example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
