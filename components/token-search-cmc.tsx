"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface TokenSearchResult {
  name: string
  symbol: string
  address: string | null
  chain: string | null
  cmcId: number
  rank: number
  slug: string
}

interface TokenSearchProps {
  onTokenSelect: (address: string, chain: string, symbol: string, name: string) => void
  // notify parent about query changes so the page can keep an external searchQuery in sync
  onQueryChange?: (q: string) => void
  // optional chain hint to prefer results from a specific network (e.g., 'solana')
  chain?: string
}

export default function TokenSearchComponent({ onTokenSelect, onQueryChange, chain }: TokenSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TokenSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number; maxHeight?: number } | null>(null)

  // Debounced search effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setError(null)
      setShowDropdown(false)
      return
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const chainParam = chain ? `&chain=${encodeURIComponent(chain)}` : ''
        const response = await fetch(`/api/search-token?query=${encodeURIComponent(query)}${chainParam}`)
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        console.log('[TokenSearch] fetched results', { query, chain, count: data.results?.length })
        if (data.results && data.results.length > 0) {
          setResults(data.results)
          setShowDropdown(true)
          console.log('[TokenSearch] showing dropdown - results set')
        } else {
          setResults([])
          setError(`No tokens found for "${query}"`)
          console.log('[TokenSearch] no results')
        }
      } catch (err: any) {
        setError(err.message || 'Search failed')
        setResults([])
        console.error('Token search error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [query])

  // Update dropdown position when dropdown is shown, or when window resizes/scrolls
  useEffect(() => {
    const updatePos = () => {
      if (inputRef.current && showDropdown) {
        const r = inputRef.current.getBoundingClientRect()

        // Compute available space below and above the input
        const margin = 12
        const availableBelow = Math.max(0, window.innerHeight - r.bottom - margin)
        const availableAbove = Math.max(0, r.top - margin)

        // Preferred max dropdown height
        const preferredMax = 500

        console.log('[TokenSearch] updatePos', { availableBelow, availableAbove, innerH: window.innerHeight, rTop: r.top, rBottom: r.bottom })

        if (availableBelow < 180 && availableAbove > 80) {
          // Render above the input. Ensure we don't position off-screen.
          let maxHeight = Math.min(preferredMax, availableAbove)
          // Clamp so top won't be negative
          const tentativeTop = Math.round(r.top - maxHeight)
          const minTop = margin
          if (tentativeTop < minTop) {
            // Reduce maxHeight to fit
            maxHeight = Math.max(80, r.top - minTop)
          }
          const top = Math.round(r.top - maxHeight)
          const pos = { top: Math.max(minTop, top), left: Math.round(r.left), width: Math.round(r.width), maxHeight }
          console.log('[TokenSearch] set dropdownPos (above)', pos)
          setDropdownPos(pos)
        } else {
          // Default: render below and cap height to available space
          let maxHeight = Math.min(preferredMax, Math.max(120, availableBelow))
          const top = Math.round(r.bottom)
          // Ensure dropdown doesn't overflow viewport bottom
          if (top + maxHeight > window.innerHeight - margin) {
            maxHeight = Math.max(80, window.innerHeight - margin - top)
          }
          const pos = { top, left: Math.round(r.left), width: Math.round(r.width), maxHeight }
          console.log('[TokenSearch] set dropdownPos (below)', pos)
          setDropdownPos(pos)
        }
      }
    }

    updatePos()
    window.addEventListener('resize', updatePos)
    window.addEventListener('scroll', updatePos, true)
    return () => {
      window.removeEventListener('resize', updatePos)
      window.removeEventListener('scroll', updatePos, true)
    }
  }, [showDropdown, results])

  const handleSelectToken = (token: TokenSearchResult) => {
    if (!token.address) {
      setError(`${token.symbol} doesn't have a contract address (native blockchain token)`)
      return
    }

    // Clear the search and close dropdown
    setQuery('')
    setResults([])
    setShowDropdown(false)
    
    onTokenSelect(token.address, token.chain || 'Unknown', token.symbol, token.name)
  }

  // Dropdown portal — rendered into document.body to avoid stacking context clipping
  const dropdownPortal =
    showDropdown && results.length > 0 && dropdownPos ? (
      createPortal(
        <div
          id="tg-search-dropdown"
          role="listbox"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            maxHeight: dropdownPos.maxHeight,
            overflowY: 'auto',
            pointerEvents: 'auto',
            zIndex: 2147483647,
            transform: 'none',
          }}
          className="bg-black/95 backdrop-blur-xl border-2 border-white/20 rounded-lg shadow-2xl shadow-black/50"
        >
          <div className="p-3 border-b border-white/10 text-white/50 text-[10px] font-mono tracking-wider">
            {results.length} RESULT{results.length > 1 ? 'S' : ''} FOUND
          </div>

          {results.map((token, index) => (
            <button
              key={`${token.cmcId}-${token.chain}`}
              onClick={() => {
                handleSelectToken(token)
                setShowDropdown(false)
              }}
              className="w-full p-4 text-left hover:bg-white/5 transition-all border-b border-white/5 last:border-b-0 group"
            >
              <div className="flex items-center gap-4">
                {/* Token Icon Placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:border-white/40 transition-all">
                  <span className="text-white font-mono text-xs font-bold">{token.symbol.substring(0, 2)}</span>
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-mono text-sm font-bold tracking-wider">{token.symbol}</span>
                    <span className="text-white/50 font-mono text-xs truncate">{token.name}</span>
                  </div>
                  {token.address ? (
                    <div className="text-white/30 font-mono text-[10px] truncate tracking-wider">{token.address}</div>
                  ) : (
                    <div className="text-orange-400/80 font-mono text-[10px] tracking-wider">⚠ NATIVE TOKEN</div>
                  )}
                </div>

                {/* Chain & Rank */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="px-2.5 py-1 bg-white/10 text-white font-mono text-[9px] tracking-widest whitespace-nowrap border border-white/20 group-hover:bg-white/20 transition-all">
                    {token.chain || 'UNKNOWN'}
                  </span>
                  {token.rank && (
                    <span className="text-white/40 font-mono text-[9px] tracking-wider">
                      #{token.rank}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>,
        document.getElementById('tg-portal-root')!
      )
    ) : null

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search token by name or symbol (e.g., PEPE, BONK, DOGE)..."
          value={query}
          onChange={(e: any) => {
            const v = e.target.value
            setQuery(v)
            if (onQueryChange) onQueryChange(v)
          }}
          onFocus={() => showDropdown && setShowDropdown(true)}
          className="w-full bg-black border border-white/30 text-white px-4 py-3 font-mono text-xs tracking-wider focus:outline-none focus:border-white placeholder:text-white/40 rounded"
        />

        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-white/60" />
          </div>
        )}
      </div>

      {error && !results.length && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-xs font-mono">{error}</div>
      )}

      {dropdownPortal}
    </div>
  )
}
