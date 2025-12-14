'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Eye,
  BarChart3,
  Activity,
  Zap
} from "lucide-react"

interface TokenResult {
  address: string
  symbol: string
  name: string
  balance: number
  riskScore: number | null
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'
  success: boolean
  criticalFlags?: string[]
  chain: string
  error?: string
}

interface PortfolioAuditResults {
  success: boolean
  totalTokens: number
  analyzed: number
  failed: number
  results: TokenResult[]
  processingTime: number
  plan: string
  userId: string
}

interface PortfolioAnalysis {
  portfolio: string
  totalTokens: number
  successRate: string
  processingTime: number
  riskDistribution: {
    LOW: number
    MEDIUM: number
    HIGH: number
    CRITICAL: number
    UNKNOWN: number
  }
  averageRiskScore: string
  criticalTokens: Array<{
    symbol: string
    riskScore: number
    criticalFlags: string[]
  }>
  recommendations: string[]
}

interface PortfolioAuditResultsProps {
  auditResults: PortfolioAuditResults
  analysis: PortfolioAnalysis
  walletType: string
}

export function PortfolioAuditResults({ auditResults, analysis, walletType }: PortfolioAuditResultsProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
      case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return <CheckCircle className="w-4 h-4" />
      case 'MEDIUM': return <Eye className="w-4 h-4" />
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />
      case 'CRITICAL': return <XCircle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getWalletTypeDescription = (type: string) => {
    const descriptions = {
      'SAFE_DEFI': 'Conservative DeFi investor with established protocols',
      'RISKY_MEME': 'High-risk meme token trader',
      'MIXED_PORTFOLIO': 'Balanced portfolio with mixed risk levels',
      'SCAM_HEAVY': 'Portfolio with many potential scam tokens',
      'BLUE_CHIP': 'Ultra-conservative with only blue chip tokens',
      'NEW_TRADER': 'New trader with typical risky choices'
    }
    return descriptions[type as keyof typeof descriptions] || 'Mixed portfolio'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-white/20 bg-black/60 backdrop-blur-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-mono tracking-wider">
              PORTFOLIO AUDIT RESULTS
            </h2>
            <p className="text-white/60 font-mono text-sm mt-1">
              {getWalletTypeDescription(walletType)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${auditResults.success ? 'bg-green-400/10 text-green-400 border-green-400/30' : 'bg-red-400/10 text-red-400 border-red-400/30'} font-mono`}>
              {auditResults.success ? 'COMPLETED' : 'FAILED'}
            </Badge>
            <Badge className="bg-white/10 text-white/80 border-white/30 font-mono">
              {auditResults.plan}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">{auditResults.totalTokens}</div>
            <div className="text-white/60 text-xs font-mono">TOTAL TOKENS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 font-mono">{auditResults.analyzed}</div>
            <div className="text-white/60 text-xs font-mono">ANALYZED</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 font-mono">{auditResults.failed}</div>
            <div className="text-white/60 text-xs font-mono">FAILED</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">{(auditResults.processingTime / 1000).toFixed(1)}s</div>
            <div className="text-white/60 text-xs font-mono">PROCESSING TIME</div>
          </div>
        </div>

        {/* Success Rate Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 font-mono text-sm">Success Rate</span>
            <span className="text-white font-mono text-sm font-bold">{analysis.successRate}%</span>
          </div>
          <Progress 
            value={parseFloat(analysis.successRate)} 
            className="h-2 bg-white/10"
          />
        </div>
      </div>

      {/* Risk Distribution */}
      <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white font-mono tracking-wider">RISK DISTRIBUTION</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(analysis.riskDistribution).map(([level, count]) => (
              <div key={level} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 border-2 flex items-center justify-center ${getRiskColor(level)}`}>
                  {getRiskIcon(level)}
                </div>
                <div className="text-2xl font-bold text-white font-mono">{count}</div>
                <div className="text-white/60 text-xs font-mono">{level}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono">{analysis.averageRiskScore}</div>
              <div className="text-white/60 text-xs font-mono">AVERAGE RISK SCORE</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400 font-mono">{analysis.criticalTokens.length}</div>
              <div className="text-white/60 text-xs font-mono">CRITICAL TOKENS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Tokens Alert */}
      {analysis.criticalTokens.length > 0 && (
        <Card className="bg-red-400/5 backdrop-blur-lg border border-red-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-400 font-mono tracking-wider">CRITICAL RISK TOKENS</h3>
            </div>
            
            <div className="space-y-3">
              {analysis.criticalTokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-400/10 border border-red-400/20">
                  <div>
                    <div className="text-white font-mono font-bold">{token.symbol}</div>
                    <div className="text-red-400/80 text-xs font-mono">
                      {token.criticalFlags.join(', ')}
                    </div>
                  </div>
                  <div className="text-red-400 font-mono font-bold text-lg">
                    {token.riskScore}/100
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-white" />
              <h3 className="text-xl font-bold text-white font-mono tracking-wider">RECOMMENDATIONS</h3>
            </div>
            
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10">
                  <div className="w-6 h-6 border border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/80 font-mono text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="text-white/80 font-mono text-sm leading-relaxed">
                    {recommendation}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Results Table */}
      <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white font-mono tracking-wider">TOKEN ANALYSIS RESULTS</h3>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditResults.results.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-white/60 font-mono text-sm w-8">#{index + 1}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-bold">{token.symbol}</span>
                      <Badge className="bg-white/10 text-white/60 border-white/20 font-mono text-xs">
                        {token.chain.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-white/60 text-xs font-mono">{token.name}</div>
                    {token.criticalFlags && token.criticalFlags.length > 0 && (
                      <div className="text-red-400/80 text-xs font-mono mt-1">
                        {token.criticalFlags.slice(0, 2).join(', ')}
                        {token.criticalFlags.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white/60 font-mono text-xs">Balance</div>
                    <div className="text-white font-mono text-sm">{token.balance.toLocaleString()}</div>
                  </div>
                  
                  {token.success ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-white font-mono font-bold text-lg">
                          {token.riskScore}/100
                        </div>
                      </div>
                      <Badge className={`${getRiskColor(token.riskLevel)} font-mono`}>
                        {token.riskLevel}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <Badge className="bg-red-400/10 text-red-400 border-red-400/30 font-mono">
                        FAILED
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-black/40 backdrop-blur-lg border border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white font-mono text-sm font-bold">Processing Speed</div>
                <div className="text-white/60 font-mono text-xs">
                  {(auditResults.processingTime / auditResults.totalTokens).toFixed(0)}ms per token
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-lg border border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-mono text-sm font-bold">Success Rate</div>
                <div className="text-green-400 font-mono text-xs">
                  {analysis.successRate}% analyzed successfully
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-lg border border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white font-mono text-sm font-bold">Risk Coverage</div>
                <div className="text-white/60 font-mono text-xs">
                  {auditResults.analyzed}/{auditResults.totalTokens} tokens scanned
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}