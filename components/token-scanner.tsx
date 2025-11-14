"use client"

import { useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import TokenSearchComponent from './token-search-cmc'

interface TokenScannerProps {
  onScan: (query: string) => void
  onTokenSelect?: (address: string, chain: string, symbol: string, name: string) => void
  scanning: boolean
  error?: string
  placeholder?: string
  showChainSelector?: boolean
}

export function TokenScanner({ 
  onScan, 
  onTokenSelect,
  scanning, 
  error,
  placeholder = "Enter token address or symbol...",
  showChainSelector = true
}: TokenScannerProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onScan(query.trim())
    }
  }

  return (
    <div className="space-y-4">
      {/* CoinMarketCap Search */}
      {onTokenSelect && (
        <div className="border border-white/20 bg-black/60 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-white" />
            <h3 className="text-white font-mono text-sm tracking-wider">SEARCH BY NAME</h3>
          </div>
          <TokenSearchComponent onTokenSelect={onTokenSelect} />
          <p className="text-white/40 font-mono text-xs mt-3">
            Search for tokens by name or symbol (e.g., PEPE, BONK, Solana)
          </p>
        </div>
      )}

      {/* Manual Address Input */}
      <div className="border border-white/20 bg-black/60 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-white" />
          <h3 className="text-white font-mono text-sm tracking-wider">SCAN BY ADDRESS</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={scanning}
              className="w-full bg-black/80 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
            />
            {scanning && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/20">
              <AlertCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
              <p className="text-white/80 font-mono text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={scanning || !query.trim()}
            className="w-full px-6 py-4 bg-white text-black hover:bg-transparent hover:text-white border-2 border-white font-mono text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
          >
            {scanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ANALYZING...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                ANALYZE TOKEN
              </>
            )}
          </button>
        </form>

        <p className="text-white/40 font-mono text-xs mt-3">
          Paste contract address (0x... for EVM or base58 for Solana)
        </p>
      </div>
    </div>
  )
}
