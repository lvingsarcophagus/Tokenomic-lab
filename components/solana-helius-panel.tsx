'use client'

import { useEffect, useState } from 'react'
import { 
  Activity, Users, Shield, TrendingUp, Clock, 
  AlertCircle, CheckCircle, XCircle, Loader2,
  RefreshCw, Eye, Lock, Unlock, Zap, ChevronDown
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SolanaHeliusPanelProps {
  tokenAddress: string
  onDataLoaded?: (data: any) => void
}

export default function SolanaHeliusPanel({ tokenAddress, onDataLoaded }: SolanaHeliusPanelProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadHeliusData = async () => {
    if (!tokenAddress || tokenAddress.length < 32) {
      setError('Invalid Solana address')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/solana/helius-data?address=${tokenAddress}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Helius data: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load data')
      }

      setData(result.data)
      if (onDataLoaded) {
        onDataLoaded(result.data)
      }
    } catch (err: any) {
      console.error('[Helius Panel] Error:', err)
      setError(err.message || 'Failed to load Solana data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadHeliusData()
  }, [tokenAddress])

  const handleRefresh = () => {
    setRefreshing(true)
    loadHeliusData()
  }

  if (loading && !refreshing) {
    return (
      <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-white/60 font-mono text-xs">LOADING SOLANA DATA...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/5 backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-red-400 font-mono text-sm">HELIUS DATA UNAVAILABLE</h3>
        </div>
        <p className="text-white/60 font-mono text-xs">{error}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { metadata, authorities, holders, transactions, price, recentActivity } = data

  // Prepare holder distribution data for chart
  const holderDistribution = holders?.topHolders?.slice(0, 5).map((holder: any, index: number) => ({
    name: `Holder ${index + 1}`,
    address: `${holder.address.slice(0, 4)}...${holder.address.slice(-4)}`,
    percentage: holder.percentage || 0,
    balance: holder.balance
  })) || []

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  return (
    <div className="border border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-purple-500/30 bg-purple-500/10">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-mono text-xs tracking-wider">SOLANA DATA</h2>
            <p className="text-white/40 font-mono text-[9px]">HELIUS API</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1.5 border border-white/20 bg-black/40 text-white font-mono text-[10px] hover:border-white/40 hover:bg-white/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 inline mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'REFRESHING' : 'REFRESH'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Compact Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-white/10 bg-black/20 p-3">
            <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Name</p>
            <p className="text-white font-mono text-xs truncate">{metadata?.name || 'N/A'}</p>
          </div>
          <div className="border border-white/10 bg-black/20 p-3">
            <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Symbol</p>
            <p className="text-white font-mono text-xs">{metadata?.symbol || 'N/A'}</p>
          </div>
          <div className="border border-white/10 bg-black/20 p-3">
            <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Decimals</p>
            <p className="text-white font-mono text-xs">{metadata?.decimals || 0}</p>
          </div>
          <div className="border border-white/10 bg-black/20 p-3">
            <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Supply</p>
            <p className="text-white font-mono text-xs">
              {metadata?.supply ? (metadata.supply / Math.pow(10, metadata.decimals || 9)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Compact Authority Status */}
        <div>
          <h3 className="text-white font-mono text-[10px] tracking-wider mb-3 flex items-center gap-2 uppercase">
            <Shield className="w-3 h-3" />
            Authority Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AuthorityRowCompact label="FREEZE" value={authorities?.freezeAuthority} />
            <AuthorityRowCompact label="MINT" value={authorities?.mintAuthority} />
            <AuthorityRowCompact label="UPDATE" value={authorities?.updateAuthority} />
          </div>
        </div>

        {/* Holder Distribution - Simplified */}
        {holders && holders.count > 0 && (
          <div>
            <h3 className="text-white font-mono text-[10px] tracking-wider mb-3 flex items-center gap-2 uppercase">
              <Users className="w-3 h-3" />
              Holder Distribution
            </h3>
            <div className="border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/40 font-mono text-[9px] uppercase">Total Holders</p>
                  <p className="text-white font-mono text-2xl font-bold">{holders.count.toLocaleString()}</p>
                </div>
                {holderDistribution.length > 0 && (
                  <div className="text-right">
                    <p className="text-white/40 font-mono text-[9px] uppercase">Top 5 Hold</p>
                    <p className="text-white font-mono text-2xl font-bold">
                      {holderDistribution.slice(0, 5).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
              
              {holderDistribution.length > 0 && (
                <div className="space-y-1.5">
                  {holderDistribution.map((holder: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 transition-all">
                      <span className="text-white/60 font-mono text-[10px]">#{index + 1} {holder.address}</span>
                      <span className="text-white font-mono text-[10px] font-bold">{holder.percentage.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 24H Activity - Compact */}
        {transactions && (
          <div>
            <h3 className="text-white font-mono text-[10px] tracking-wider mb-3 flex items-center gap-2 uppercase">
              <Activity className="w-3 h-3" />
              24H Activity
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-white/10 bg-black/20 p-3 text-center">
                <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Transactions</p>
                <p className="text-white font-mono text-lg font-bold">{transactions.count24h.toLocaleString()}</p>
              </div>
              <div className="border border-white/10 bg-black/20 p-3 text-center">
                <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Traders</p>
                <p className="text-white font-mono text-lg font-bold">{transactions.uniqueTraders24h.toLocaleString()}</p>
              </div>
              <div className="border border-white/10 bg-black/20 p-3 text-center">
                <p className="text-white/40 font-mono text-[9px] mb-1 uppercase">Volume</p>
                <p className="text-white font-mono text-lg font-bold">
                  {transactions.volume24h > 0 ? `$${(transactions.volume24h / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions - Collapsed by default */}
        {recentActivity && recentActivity.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-white font-mono text-[10px] tracking-wider flex items-center gap-2 uppercase hover:text-white/80 transition-colors">
              <Clock className="w-3 h-3" />
              Recent Transactions ({recentActivity.length})
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform ml-auto" />
            </summary>
            <div className="mt-3 space-y-1 max-h-[300px] overflow-y-auto">
              {recentActivity.slice(0, 10).map((tx: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 transition-all text-[10px]">
                  <span className="text-white/60 font-mono">
                    {tx.signature?.slice(0, 6)}...{tx.signature?.slice(-6)}
                  </span>
                  <span className="text-white/40 font-mono">
                    {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

function AuthorityRowCompact({ label, value }: { label: string; value: string | null }) {
  const isRevoked = !value || value === 'null'
  
  return (
    <div className="border border-white/10 bg-black/20 p-3 flex items-center justify-between">
      <span className="text-white/60 font-mono text-[10px] uppercase">{label}</span>
      <div className="flex items-center gap-1.5">
        {isRevoked ? (
          <>
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-mono text-[10px] font-bold">REVOKED</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-[10px] font-bold">ACTIVE</span>
          </>
        )}
      </div>
    </div>
  )
}
