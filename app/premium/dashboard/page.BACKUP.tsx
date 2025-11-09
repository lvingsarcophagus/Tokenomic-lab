'use client'

/**
 * ============================================================================
 * ENHANCED PREMIUM DASHBOARD
 * ============================================================================
 * 
 * Features:
 * - Real-time portfolio tracking with live prices
 * - Behavioral analysis insights (holder velocity, wash trading, smart money)
 * - Advanced charts (risk score history, holder trends, liquidity stability)
 * - Watchlist with alerts and notifications
 * - Multi-chain support (EVM, Solana, Cardano)
 * - Premium-only behavioral metrics
 * - AI-powered risk predictions
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { auth } from '@/lib/firebase'
import { 
  Shield, TrendingUp, TrendingDown, Activity, Users, Droplet,
  Zap, Crown, AlertCircle, CheckCircle, Sparkles, BarChart3,
  Clock, Target, Plus, Search, Bell, Settings, LogOut,
  ChevronDown, ChevronUp, ArrowRight, Flame, BadgeCheck,
  Loader2, AlertTriangle, Eye, EyeOff, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WatchlistToken {
  address: string
  name: string
  symbol: string
  chain: string
  chainId: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  price: number
  change24h: number
  lastUpdated: number
  alerts: Alert[]
  behavioralSignals?: {
    holderVelocity?: number
    washTrading?: boolean
    smartMoney?: boolean
    liquidityStability?: number
  }
}

interface Alert {
  id: string
  type: 'risk_increase' | 'price_change' | 'holder_exodus' | 'liquidity_drop'
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: number
  read: boolean
}

interface PortfolioStats {
  totalTokens: number
  averageRiskScore: number
  criticalTokens: number
  totalScans: number
  behavioralInsights: number
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EnhancedPremiumDashboard() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  
  // State management
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<WatchlistToken | null>(null)
  const [showBehavioralInsights, setShowBehavioralInsights] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Check premium access
  useEffect(() => {
    if (!authLoading && (!user || userProfile?.plan !== 'PREMIUM')) {
      router.push('/premium-signup')
    }
  }, [user, userProfile, authLoading, router])
  
  // Load dashboard data
  useEffect(() => {
    if (user && userProfile?.plan === 'PREMIUM') {
      loadDashboardData()
    }
  }, [user, userProfile])
  
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      // Simulated data for demonstration
      setWatchlist([
        {
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          name: 'Uniswap',
          symbol: 'UNI',
          chain: 'Ethereum',
          chainId: 1,
          riskScore: 29,
          riskLevel: 'LOW',
          price: 6.02,
          change24h: 3.5,
          lastUpdated: Date.now(),
          alerts: [],
          behavioralSignals: {
            holderVelocity: 2.3,
            washTrading: false,
            smartMoney: true,
            liquidityStability: 92.5
          }
        }
      ])
      
      setAlerts([
        {
          id: '1',
          type: 'holder_exodus',
          severity: 'warning',
          message: 'TOKEN_ABC: 15% holder decrease in 7 days',
          timestamp: Date.now() - 3600000,
          read: false
        }
      ])
      
      setPortfolioStats({
        totalTokens: 12,
        averageRiskScore: 34,
        criticalTokens: 1,
        totalScans: 145,
        behavioralInsights: 8
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your premium dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold">Token Guard Pro</h1>
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <Crown className="w-4 h-4" />
                  <span>Premium Dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Notifications */}
              <button className="relative p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                {alerts.filter(a => !a.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {alerts.filter(a => !a.read).length}
                  </span>
                )}
              </button>
              
              {/* Settings */}
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              
              {/* User Menu */}
              <button
                onClick={() => {
                  auth.signOut()
                  router.push('/login')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Total Tokens"
            value={portfolioStats?.totalTokens || 0}
            trend={null}
            color="purple"
          />
          <StatCard
            icon={<Shield className="w-6 h-6" />}
            label="Avg Risk Score"
            value={portfolioStats?.averageRiskScore || 0}
            trend={-5.2}
            color="green"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Critical Alerts"
            value={portfolioStats?.criticalTokens || 0}
            trend={null}
            color="red"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Total Scans"
            value={portfolioStats?.totalScans || 0}
            trend={12.5}
            color="blue"
          />
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            label="Behavioral Insights"
            value={portfolioStats?.behavioralInsights || 0}
            trend={null}
            color="yellow"
          />
        </div>
        
        {/* Watchlist & Behavioral Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Watchlist */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                Watchlist
              </h2>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                Add Token
              </button>
            </div>
            
            <div className="space-y-3">
              {watchlist.map((token) => (
                <WatchlistTokenCard
                  key={token.address}
                  token={token}
                  onClick={() => setSelectedToken(token)}
                />
              ))}
              
              {watchlist.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tokens in your watchlist</p>
                  <p className="text-sm mt-1">Add tokens to track their risk and get alerts</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Behavioral Insights Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Behavioral Insights
            </h2>
            
            <div className="space-y-4">
              <InsightCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Holder Velocity"
                value="Stable Growth"
                description="Holder count increased 2.3% in 7 days"
                color="green"
              />
              
              <InsightCard
                icon={<Users className="w-5 h-5" />}
                label="Smart Money"
                value="3 VC Wallets"
                description="Identified whale accumulation"
                color="blue"
              />
              
              <InsightCard
                icon={<Droplet className="w-5 h-5" />}
                label="Liquidity Stability"
                value="92.5%"
                description="Liquidity stable over 30 days"
                color="purple"
              />
              
              <InsightCard
                icon={<Activity className="w-5 h-5" />}
                label="Wash Trading"
                value="Not Detected"
                description="Transaction patterns normal"
                color="green"
              />
            </div>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Risk Score History */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Risk Score Trend
            </h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={generateMockRiskData()}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#riskGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Holder Growth Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-green-500" />
              Holder Growth
            </h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={generateMockHolderData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="holders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Alerts */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-red-500" />
            Recent Alerts
          </h2>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts</p>
                <p className="text-sm mt-1">You'll be notified of any important changes</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  trend: number | null
  color: 'purple' | 'green' | 'red' | 'blue' | 'yellow'
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  const colorClasses: Record<StatCardProps['color'], string> = {
    purple: 'bg-purple-500/20 text-purple-500',
    green: 'bg-green-500/20 text-green-500',
    red: 'bg-red-500/20 text-red-500',
    blue: 'bg-blue-500/20 text-blue-500',
    yellow: 'bg-yellow-500/20 text-yellow-500'
  }
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {trend !== null && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface WatchlistTokenCardProps {
  token: WatchlistToken
  onClick: () => void
}

function WatchlistTokenCard({ token, onClick }: WatchlistTokenCardProps) {
  const riskColors: Record<WatchlistToken['riskLevel'], string> = {
    LOW: 'text-green-500 bg-green-500/20',
    MEDIUM: 'text-yellow-500 bg-yellow-500/20',
    HIGH: 'text-orange-500 bg-orange-500/20',
    CRITICAL: 'text-red-500 bg-red-500/20'
  }
  
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 border border-gray-600 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-lg">{token.symbol}</h3>
          <p className="text-sm text-gray-400">{token.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">${token.price.toFixed(2)}</p>
          <p className={`text-sm ${token.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColors[token.riskLevel]}`}>
            {token.riskLevel}
          </span>
          <span className="text-sm text-gray-400">Risk: {token.riskScore}</span>
        </div>
        
        {token.behavioralSignals?.smartMoney && (
          <div title="Smart Money Detected">
            <BadgeCheck className="w-5 h-5 text-blue-500" />
          </div>
        )}
      </div>
    </button>
  )
}

interface InsightCardProps {
  icon: React.ReactNode
  label: string
  value: string
  description: string
  color: 'purple' | 'green' | 'blue' | 'red' | 'yellow'
}

function InsightCard({ icon, label, value, description, color }: InsightCardProps) {
  const colorClasses: Record<InsightCardProps['color'], string> = {
    purple: 'text-purple-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500'
  }
  
  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
      <div className="flex items-start gap-3">
        <div className={colorClasses[color]}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="font-bold mb-1">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  )
}

function AlertCard({ alert }: { alert: Alert }) {
  const severityColors = {
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-500',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500',
    critical: 'bg-red-500/20 border-red-500/50 text-red-500'
  }
  
  const severityIcons = {
    info: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    critical: <Flame className="w-5 h-5" />
  }
  
  return (
    <div className={`rounded-lg p-4 border ${severityColors[alert.severity]} ${alert.read ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        {severityIcons[alert.severity]}
        <div className="flex-1">
          <p className="font-medium">{alert.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        {!alert.read && (
          <span className="px-2 py-1 bg-purple-600 rounded text-xs font-bold">NEW</span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function generateMockRiskData() {
  const data = []
  const now = Date.now()
  for (let i = 29; i >= 0; i--) {
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      risk: Math.floor(Math.random() * 30) + 20
    })
  }
  return data
}

function generateMockHolderData() {
  const data = []
  const now = Date.now()
  let holders = 380000
  for (let i = 29; i >= 0; i--) {
    holders += Math.floor(Math.random() * 2000) - 800
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      holders
    })
  }
  return data
}
