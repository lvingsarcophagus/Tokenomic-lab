/**
 * Admin Cache Viewer Component
 * Displays all cached token data with search, filter, and delete capabilities
 */

'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { Database, Search, Trash2, RefreshCw, Eye, Download, Filter, X } from 'lucide-react'
import { toast } from 'sonner'

interface CacheEntry {
  id: string
  address: string
  chain: string
  symbol: string
  name: string
  riskScore: number
  cachedAt: string | null
  expiresAt: string | null
  hitCount: number
  lastAccessed: string | null
  dataSize: number
  hasAIAnalysis: boolean
  hasPriceData: boolean
  hasSecurityData: boolean
}

interface CacheStats {
  totalEntries: number
  returnedEntries: number
  totalSize: number
  totalSizeMB: string
  totalHits: number
  avgHitsPerEntry: string
  withAIAnalysis: number
  withPriceData: number
  withSecurityData: number
}

export function CacheViewer() {
  const [loading, setLoading] = useState(true)
  const [cacheData, setCacheData] = useState<CacheEntry[]>([])
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'timestamp' | 'hitCount' | 'riskScore'>('timestamp')
  const [filterChain, setFilterChain] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const loadCacheData = async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const params = new URLSearchParams({
        limit: '100',
        sortBy,
        order: 'desc',
        search: searchQuery
      })

      const response = await fetch(`/api/admin/cache-data?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch cache data')

      const result = await response.json()
      setCacheData(result.data || [])
      setStats(result.stats || null)
    } catch (error: any) {
      console.error('Failed to load cache data:', error)
      toast.error('Failed to load cache data')
    } finally {
      setLoading(false)
    }
  }

  const deleteCacheEntry = async (address: string) => {
    if (!confirm(`Delete cache entry for ${address}?`)) return

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch(`/api/admin/cache-data?address=${address}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete cache entry')

      toast.success('Cache entry deleted')
      loadCacheData()
    } catch (error: any) {
      console.error('Failed to delete cache:', error)
      toast.error('Failed to delete cache entry')
    }
  }

  const clearAllCache = async () => {
    if (!confirm('⚠️ Clear ALL cached data? This cannot be undone!')) return

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('/api/admin/cache-data?all=true', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to clear cache')

      const result = await response.json()
      toast.success(result.message)
      loadCacheData()
    } catch (error: any) {
      console.error('Failed to clear cache:', error)
      toast.error('Failed to clear cache')
    }
  }

  useEffect(() => {
    loadCacheData()
  }, [sortBy, searchQuery])

  const filteredData = filterChain === 'all' 
    ? cacheData 
    : cacheData.filter(entry => entry.chain.toLowerCase() === filterChain.toLowerCase())

  const chains = Array.from(new Set(cacheData.map(d => d.chain)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-white/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-mono tracking-wider">CACHE VIEWER</h2>
            <p className="text-white/50 text-xs font-mono mt-0.5">Token Analysis Cache Management</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border-2 border-white/20 text-white hover:bg-white/5 font-mono text-xs transition-all rounded-xl"
          >
            <Filter className="w-3 h-3 inline mr-2" />
            FILTERS
          </button>
          <button
            onClick={loadCacheData}
            className="px-4 py-2 border-2 border-white/20 text-white hover:bg-white/5 font-mono text-xs transition-all rounded-xl"
          >
            <RefreshCw className="w-3 h-3 inline mr-2" />
            REFRESH
          </button>
          <button
            onClick={clearAllCache}
            className="px-4 py-2 border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-mono text-xs transition-all rounded-xl"
          >
            <Trash2 className="w-3 h-3 inline mr-2" />
            CLEAR ALL
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="text-white/60 text-xs font-mono uppercase mb-2 tracking-wider">Total Entries</div>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalEntries}</div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="text-white/60 text-xs font-mono uppercase mb-2 tracking-wider">Cache Size</div>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalSizeMB} MB</div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="text-white/60 text-xs font-mono uppercase mb-2 tracking-wider">Total Hits</div>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalHits}</div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="text-white/60 text-xs font-mono uppercase mb-2 tracking-wider">Avg Hits</div>
            <div className="text-3xl font-bold text-white font-mono">{stats.avgHitsPerEntry}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-mono text-sm font-bold">FILTERS</h3>
            <button onClick={() => setShowFilters(false)} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white/60 text-xs font-mono uppercase mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-black border-2 border-white/20 text-white font-mono text-sm p-2 rounded-lg focus:outline-none focus:border-white/40"
              >
                <option value="timestamp">Timestamp</option>
                <option value="hitCount">Hit Count</option>
                <option value="riskScore">Risk Score</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs font-mono uppercase mb-2 block">Chain</label>
              <select
                value={filterChain}
                onChange={(e) => setFilterChain(e.target.value)}
                className="w-full bg-black border-2 border-white/20 text-white font-mono text-sm p-2 rounded-lg focus:outline-none focus:border-white/40"
              >
                <option value="all">All Chains</option>
                {chains.map(chain => (
                  <option key={chain} value={chain}>{chain.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs font-mono uppercase mb-2 block">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Address, symbol, name..."
                className="w-full bg-black border-2 border-white/20 text-white font-mono text-sm p-2 rounded-lg focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cache Table */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-white" />
            <h3 className="text-white font-mono text-sm font-bold tracking-wider">CACHED TOKENS</h3>
            <span className="text-white/40 text-xs font-mono ml-2">({filteredData.length} entries)</span>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-white/20 mx-auto mb-3 animate-spin" />
              <p className="text-white/40 font-mono text-sm">Loading cache data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 font-mono text-sm">No cached data found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Token</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Chain</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Risk</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Hits</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Size</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Data</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Cached</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-3">
                        <div className="text-white font-mono text-xs font-bold">{entry.symbol}</div>
                        <div className="text-white/40 text-xs font-mono">{entry.name}</div>
                        <div className="text-white/30 text-xs font-mono mt-1">
                          {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-white/60 font-mono uppercase text-xs">{entry.chain}</span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-1 border rounded-lg text-xs font-mono font-bold ${
                          entry.riskScore < 30 ? 'border-green-500/50 bg-green-500/10 text-green-400' :
                          entry.riskScore < 60 ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' :
                          'border-red-500/50 bg-red-500/10 text-red-400'
                        }`}>
                          {entry.riskScore}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-white font-mono text-sm">{entry.hitCount}</span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-white/60 font-mono text-xs">
                          {(entry.dataSize / 1024).toFixed(1)} KB
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex gap-1">
                          {entry.hasAIAnalysis && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-mono rounded">AI</span>
                          )}
                          {entry.hasPriceData && (
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">$</span>
                          )}
                          {entry.hasSecurityData && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded">SEC</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-white/60 text-xs font-mono">
                          {entry.cachedAt ? new Date(entry.cachedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-white/40 text-xs font-mono">
                          {entry.cachedAt ? new Date(entry.cachedAt).toLocaleTimeString() : ''}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => deleteCacheEntry(entry.address)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete cache entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
