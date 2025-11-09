'use client'

/**
 * PRO DASHBOARD - Premium Features Only
 * Advanced tokenomics analysis, portfolio tracking, alerts, and AI insights
 */

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Shield, TrendingUp, TrendingDown, AlertTriangle, Bell, 
  Star, Zap, BarChart3, Activity, Clock, DollarSign,
  Target, Eye, Brain, Sparkles, ChevronRight, Lock,
  Wallet, LineChart, PieChart, ArrowUpRight, ArrowDownRight,
  Search, Plus, X, Check, AlertCircle, Info, Send, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { 
  LineChart as RechartsLine, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBar,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts'

interface WatchlistToken {
  address: string
  name: string
  symbol: string
  riskScore: number
  priceChange24h: number
  marketCap: number
  addedAt: string
  alerts: number
}

interface Alert {
  id: string
  type: 'price' | 'risk' | 'whale' | 'rugpull'
  token: string
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface PortfolioStats {
  totalValue: number
  totalTokens: number
  avgRiskScore: number
  highRiskTokens: number
  alerts24h: number
  profitLoss24h: number
}

export default function ProDashboard() {
  const router = useRouter()
  const { role, isPremium, isAdmin, loading: roleLoading } = useUserRole()
  
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalTokens: 0,
    avgRiskScore: 0,
    highRiskTokens: 0,
    alerts24h: 0,
    profitLoss24h: 0
  })
  
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'alerts' | 'analytics' | 'ai'>('overview')
  const [newTokenAddress, setNewTokenAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roleLoading && !isPremium && !isAdmin) {
      router.push('/pricing')
    }
  }, [roleLoading, isPremium, isAdmin, router])

  useEffect(() => {
    if (isPremium || isAdmin) {
      loadProData()
    }
  }, [isPremium, isAdmin])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const loadProData = async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      // Load watchlist
      const watchlistResponse = await fetch('/api/pro/watchlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (watchlistResponse.ok) {
        const data = await watchlistResponse.json()
        setWatchlist(data.tokens || [])
      }

      // Load alerts
      const alertsResponse = await fetch('/api/pro/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (alertsResponse.ok) {
        const data = await alertsResponse.json()
        setAlerts(data.alerts || [])
      }

      // Load portfolio stats
      const statsResponse = await fetch('/api/pro/portfolio-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setPortfolioStats(data.stats || portfolioStats)
      }

    } catch (error) {
      console.error('Failed to load pro data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWatchlist = async () => {
    if (!newTokenAddress.trim()) return

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const response = await fetch('/api/pro/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tokenAddress: newTokenAddress }),
      })

      if (response.ok) {
        setNewTokenAddress('')
        await loadProData()
        alert('✅ Token added to watchlist!')
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      alert('❌ Failed to add token')
    }
  }

  const removeFromWatchlist = async (address: string) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const response = await fetch('/api/pro/watchlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tokenAddress: address }),
      })

      if (response.ok) {
        await loadProData()
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const response = await fetch('/api/pro/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message: userMessage,
          context: portfolioStats
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '❌ Sorry, I encountered an error. Please try again.' 
        }])
      }
    } catch (error) {
      console.error('Failed to send chat message:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Connection error. Please check your network and try again.' 
      }])
    } finally {
      setChatLoading(false)
    }
  }

  // Mock chart data
  const portfolioHistoryData = [
    { date: 'Nov 1', value: 118000, risk: 45 },
    { date: 'Nov 2', value: 122000, risk: 43 },
    { date: 'Nov 3', value: 119500, risk: 44 },
    { date: 'Nov 4', value: 123000, risk: 42 },
    { date: 'Nov 5', value: 121000, risk: 41 },
    { date: 'Nov 6', value: 124500, risk: 42 },
    { date: 'Nov 7', value: 125000, risk: 42 },
  ]

  const riskDistributionData = [
    { name: 'Low Risk', value: 12, color: '#22c55e' },
    { name: 'Medium Risk', value: 8, color: '#eab308' },
    { name: 'High Risk', value: 6, color: '#f97316' },
    { name: 'Critical Risk', value: 4, color: '#ef4444' },
  ]

  const performanceData = [
    { token: 'TOKEN A', performance: 245.8 },
    { token: 'TOKEN B', performance: 156.3 },
    { token: 'TOKEN C', performance: 89.2 },
    { token: 'TOKEN D', performance: 45.7 },
    { token: 'TOKEN E', performance: -12.4 },
    { token: 'TOKEN F', performance: -42.3 },
  ]

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white font-mono">LOADING PRO DASHBOARD...</div>
        </div>
      </div>
    )
  }

  if (!isPremium && !isAdmin) return null

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-20"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-10"></div>
      
      {/* Premium gradient overlay */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="relative border-b border-yellow-500/50 bg-black/95 backdrop-blur-lg z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-yellow-500 bg-yellow-500/10 animate-pulse">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-mono tracking-widest flex items-center gap-2">
                  PRO DASHBOARD
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs rounded font-bold">
                    PREMIUM
                  </span>
                </h1>
                <p className="text-yellow-400 text-xs font-mono">ADVANCED ANALYTICS • UNLIMITED ACCESS</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-mono">Premium Active</span>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black font-mono">
                  Standard View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-8 z-10">
        {/* Premium Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/50 p-6 hover:border-blue-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 text-blue-400" />
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-blue-300 text-xs font-mono mb-1">PORTFOLIO VALUE</p>
              <p className="text-3xl font-bold text-white font-mono">
                ${portfolioStats.totalValue.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm font-mono ${
                portfolioStats.profitLoss24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolioStats.profitLoss24h >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(portfolioStats.profitLoss24h).toFixed(2)}% (24h)
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border-purple-500/50 p-6 hover:border-purple-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-purple-400" />
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-purple-300 text-xs font-mono mb-1">WATCHLIST TOKENS</p>
              <p className="text-3xl font-bold text-white font-mono">{watchlist.length}</p>
              <p className="text-purple-400 text-xs font-mono mt-2">
                Avg Risk: {portfolioStats.avgRiskScore}/100
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-6 hover:border-yellow-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Bell className="w-8 h-8 text-yellow-400 animate-pulse" />
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-yellow-300 text-xs font-mono mb-1">ACTIVE ALERTS</p>
              <p className="text-3xl font-bold text-white font-mono">{alerts.length}</p>
              <p className="text-yellow-400 text-xs font-mono mt-2">
                {portfolioStats.alerts24h} in last 24h
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-700/20 border-red-500/50 p-6 hover:border-red-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <Shield className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-red-300 text-xs font-mono mb-1">HIGH RISK TOKENS</p>
              <p className="text-3xl font-bold text-white font-mono">{portfolioStats.highRiskTokens}</p>
              <p className="text-red-400 text-xs font-mono mt-2">
                Requires attention
              </p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', icon: BarChart3, label: 'OVERVIEW' },
            { id: 'watchlist', icon: Eye, label: 'WATCHLIST' },
            { id: 'alerts', icon: Bell, label: 'ALERTS' },
            { id: 'analytics', icon: LineChart, label: 'ANALYTICS' },
            { id: 'ai', icon: Brain, label: 'AI INSIGHTS' },
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={`font-mono whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-black/60 backdrop-blur-lg border-yellow-500/30 p-6">
              <h2 className="text-xl font-bold text-white font-mono mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                QUICK ACTIONS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard">
                  <Card className="p-4 bg-blue-500/10 border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer group">
                    <Target className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-mono font-bold mb-1">Analyze Token</h3>
                    <p className="text-white/60 text-xs font-mono">Deep scan with AI insights</p>
                  </Card>
                </Link>

                <Card className="p-4 bg-purple-500/10 border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group">
                  <PieChart className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-mono font-bold mb-1">Portfolio Analysis</h3>
                  <p className="text-white/60 text-xs font-mono">Compare all your tokens</p>
                </Card>

                <Card className="p-4 bg-green-500/10 border-green-500/30 hover:border-green-400 transition-all cursor-pointer group">
                  <Brain className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-mono font-bold mb-1">AI Predictions</h3>
                  <p className="text-white/60 text-xs font-mono">ML-powered forecasts</p>
                </Card>
              </div>
            </Card>

            {/* Recent Alerts */}
            <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  RECENT ALERTS
                </h2>
                <Button 
                  onClick={() => setActiveTab('alerts')}
                  variant="outline" 
                  size="sm"
                  className="border-white/20 font-mono"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 mb-2 rounded border ${
                    alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                    alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
                    alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                    'bg-blue-500/10 border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {alert.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />}
                      {alert.severity === 'high' && <AlertCircle className="w-5 h-5 text-orange-400 mt-1" />}
                      {alert.severity === 'medium' && <Info className="w-5 h-5 text-yellow-400 mt-1" />}
                      {alert.severity === 'low' && <Info className="w-5 h-5 text-blue-400 mt-1" />}
                      <div>
                        <p className={`font-mono font-bold text-sm ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-orange-400' :
                          alert.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {alert.token}
                        </p>
                        <p className="text-white/80 text-sm mt-1">{alert.message}</p>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-white/20 mx-auto mb-2" />
                  <p className="text-white/60 font-mono text-sm">No active alerts</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            {/* Add Token */}
            <Card className="bg-black/60 backdrop-blur-lg border-yellow-500/30 p-6">
              <h2 className="text-xl font-bold text-white font-mono mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-400" />
                ADD TO WATCHLIST
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Enter token address..."
                    value={newTokenAddress}
                    onChange={(e) => setNewTokenAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
                    className="pl-10 bg-black/50 border-white/20 text-white font-mono"
                  />
                </div>
                <Button 
                  onClick={addToWatchlist}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-mono"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Token
                </Button>
              </div>
            </Card>

            {/* Watchlist Table */}
            <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-6">
              <h2 className="text-xl font-bold text-white font-mono mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                YOUR WATCHLIST ({watchlist.length})
              </h2>
              
              {watchlist.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3 text-white/60 text-xs font-mono">TOKEN</th>
                        <th className="text-left p-3 text-white/60 text-xs font-mono">RISK SCORE</th>
                        <th className="text-left p-3 text-white/60 text-xs font-mono">24H CHANGE</th>
                        <th className="text-left p-3 text-white/60 text-xs font-mono">MARKET CAP</th>
                        <th className="text-left p-3 text-white/60 text-xs font-mono">ALERTS</th>
                        <th className="text-left p-3 text-white/60 text-xs font-mono">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchlist.map((token) => (
                        <tr key={token.address} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-3">
                            <div>
                              <p className="text-white font-mono font-bold">{token.symbol}</p>
                              <p className="text-white/60 text-xs font-mono">{token.name}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                              token.riskScore >= 70 ? 'bg-red-500/20 text-red-400' :
                              token.riskScore >= 50 ? 'bg-orange-500/20 text-orange-400' :
                              token.riskScore >= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {token.riskScore}/100
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`flex items-center gap-1 font-mono font-bold ${
                              token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {token.priceChange24h >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {Math.abs(token.priceChange24h).toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 text-white font-mono">
                            ${(token.marketCap / 1000000).toFixed(2)}M
                          </td>
                          <td className="p-3">
                            {token.alerts > 0 ? (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-mono font-bold">
                                {token.alerts} new
                              </span>
                            ) : (
                              <span className="text-white/40 text-xs font-mono">None</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                onClick={() => removeFromWatchlist(token.address)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 font-mono mb-2">Your watchlist is empty</p>
                  <p className="text-white/40 text-sm font-mono">Add tokens to monitor them in real-time</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-6">
            <h2 className="text-xl font-bold text-white font-mono mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              ALL ALERTS
            </h2>
            
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded border ${
                    alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                    alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
                    alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                    'bg-blue-500/10 border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {alert.severity === 'critical' && <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />}
                      {alert.severity === 'high' && <AlertCircle className="w-6 h-6 text-orange-400 mt-1" />}
                      {alert.severity === 'medium' && <Info className="w-6 h-6 text-yellow-400 mt-1" />}
                      {alert.severity === 'low' && <Info className="w-6 h-6 text-blue-400 mt-1" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-mono font-bold uppercase ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs font-mono">
                            {alert.type}
                          </span>
                        </div>
                        <p className="text-white font-mono font-bold mb-1">{alert.token}</p>
                        <p className="text-white/80">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-white/40 text-xs font-mono">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 font-mono mb-2">No alerts</p>
                  <p className="text-white/40 text-sm font-mono">You'll be notified of any suspicious activity</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Timeframe Selector */}
            <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-400" />
                  ADVANCED ANALYTICS
                </h2>
                <div className="flex gap-2">
                  {(['24h', '7d', '30d'] as const).map((tf) => (
                    <Button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      variant={selectedTimeframe === tf ? 'default' : 'outline'}
                      size="sm"
                      className={`font-mono ${
                        selectedTimeframe === tf 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'border-white/20'
                      }`}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Portfolio Value Chart */}
            <Card className="bg-black/60 backdrop-blur-lg border-blue-500/30 p-6">
              <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Portfolio Value & Risk Over Time
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioHistoryData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
                    <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#eab308" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '1px solid #ffffff40',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorValue)"
                      name="Portfolio Value ($)"
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="risk" 
                      stroke="#eab308" 
                      fillOpacity={1} 
                      fill="url(#colorRisk)"
                      name="Avg Risk Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Distribution Pie Chart */}
              <Card className="bg-black/60 backdrop-blur-lg border-purple-500/30 p-6">
                <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Risk Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#000', 
                          border: '1px solid #ffffff40',
                          fontFamily: 'monospace',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Token Performance Bar Chart */}
              <Card className="bg-black/60 backdrop-blur-lg border-green-500/30 p-6">
                <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Token Performance (%)
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBar data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="token" stroke="#ffffff60" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
                      <YAxis stroke="#ffffff60" style={{ fontSize: '12px', fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#000', 
                          border: '1px solid #ffffff40',
                          fontFamily: 'monospace',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="performance" fill="#22c55e">
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.performance >= 0 ? '#22c55e' : '#ef4444'} />
                        ))}
                      </Bar>
                    </RechartsBar>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Old Analytics Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/60 backdrop-blur-lg border-blue-500/30 p-6">
                <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div>
                      <p className="text-green-400 text-xs font-mono mb-1">Best Performer</p>
                      <p className="text-white font-mono font-bold">+245.8%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <div>
                      <p className="text-red-400 text-xs font-mono mb-1">Worst Performer</p>
                      <p className="text-white font-mono font-bold">-42.3%</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div>
                      <p className="text-blue-400 text-xs font-mono mb-1">Average Return</p>
                      <p className="text-white font-mono font-bold">+18.7%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-lg border-yellow-500/30 p-6">
                <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI Summary
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-blue-400 text-xs font-mono mb-1">📊 Portfolio Status</p>
                    <p className="text-white/80 text-sm">Your portfolio is well-diversified with moderate risk. Consider rebalancing if top 3 tokens exceed 60% allocation.</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 text-xs font-mono mb-1">⚠️ Risk Alert</p>
                    <p className="text-white/80 text-sm">3 tokens showing elevated risk scores. Review their fundamentals and consider reducing position sizes.</p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-green-400 text-xs font-mono mb-1">💡 Opportunity</p>
                    <p className="text-white/80 text-sm">Market sentiment is improving. Quality tokens at 30-40 risk scores may present good entry points.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Chat */}
            <Card className="lg:col-span-2 bg-black/60 backdrop-blur-lg border-purple-500/30 p-6 flex flex-col" style={{ height: '600px' }}>
              <h2 className="text-xl font-bold text-white font-mono mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                AI ASSISTANT
                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded font-bold ml-2">
                  BETA
                </span>
              </h2>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" style={{ maxHeight: 'calc(600px - 180px)' }}>
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                    <p className="text-white/60 font-mono mb-2">AI Assistant Ready</p>
                    <p className="text-white/40 text-sm font-mono">Ask me about your portfolio, risk analysis, or market insights</p>
                    <div className="mt-6 grid grid-cols-2 gap-2 max-w-md mx-auto">
                      <Button
                        onClick={() => {
                          setChatInput('How is my portfolio performing?')
                          setTimeout(() => sendChatMessage(), 100)
                        }}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs font-mono"
                      >
                        Portfolio Status
                      </Button>
                      <Button
                        onClick={() => {
                          setChatInput('Which tokens are risky?')
                          setTimeout(() => sendChatMessage(), 100)
                        }}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs font-mono"
                      >
                        Risk Analysis
                      </Button>
                      <Button
                        onClick={() => {
                          setChatInput('Show my alerts')
                          setTimeout(() => sendChatMessage(), 100)
                        }}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs font-mono"
                      >
                        Alert Summary
                      </Button>
                      <Button
                        onClick={() => {
                          setChatInput('What are the market trends?')
                          setTimeout(() => sendChatMessage(), 100)
                        }}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs font-mono"
                      >
                        Market Insights
                      </Button>
                    </div>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50' 
                        : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50'
                    }`}>
                      <div className="flex items-start gap-3">
                        {msg.role === 'assistant' && <Brain className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className={`text-xs font-mono mb-1 ${
                            msg.role === 'user' ? 'text-blue-400' : 'text-purple-400'
                          }`}>
                            {msg.role === 'user' ? 'YOU' : 'AI ASSISTANT'}
                          </p>
                          <div className="text-white/90 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ask me anything about your portfolio..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && sendChatMessage()}
                  disabled={chatLoading}
                  className="flex-1 bg-black/50 border-purple-500/30 text-white font-mono placeholder:text-white/40"
                />
                <Button 
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-mono"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* AI Insights Panel */}
            <Card className="bg-black/60 backdrop-blur-lg border-purple-500/30 p-6">
              <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                QUICK INSIGHTS
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-mono font-bold text-sm mb-2">Market Sentiment</h4>
                      <p className="text-white/80 text-xs mb-3">
                        67% of your watchlist showing bullish indicators based on on-chain activity and social trends.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono font-bold">
                          BULLISH: 67%
                        </span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-mono font-bold">
                          BEARISH: 33%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-400 font-mono font-bold text-sm mb-2">Smart Alerts</h4>
                      <p className="text-white/80 text-xs mb-3">
                        3 tokens with unusual whale activity detected. 2 tokens showing early risk indicators.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('alerts')}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs"
                      >
                        View Alerts
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-400 font-mono font-bold text-sm mb-2">Risk Forecast</h4>
                      <p className="text-white/80 text-xs mb-3">
                        ML models predict elevated risk for 4 tokens based on liquidity and contract patterns.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('watchlist')}
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-mono text-xs"
                      >
                        Review Tokens
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-mono font-bold text-sm mb-2">Opportunities</h4>
                      <p className="text-white/80 text-xs mb-3">
                        5 quality tokens at attractive risk scores (30-40). Good entry points identified.
                      </p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                        OPPORTUNITY DETECTED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
