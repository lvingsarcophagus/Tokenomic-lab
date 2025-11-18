'use client'

import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface AIExplanationPanelProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
  }
  riskScore: number
  riskLevel: string
}

export default function AIExplanationPanel({ aiSummary, riskScore, riskLevel }: AIExplanationPanelProps) {
  const getRiskColor = () => {
    if (riskScore < 30) return 'from-green-500/20 to-green-500/5 border-green-500/30'
    if (riskScore < 60) return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
    if (riskScore < 80) return 'from-orange-500/20 to-orange-500/5 border-orange-500/30'
    return 'from-red-500/20 to-red-500/5 border-red-500/30'
  }

  const getRiskIcon = () => {
    if (riskScore < 30) return <CheckCircle className="w-5 h-5 text-green-400" />
    if (riskScore < 60) return <Info className="w-5 h-5 text-yellow-400" />
    return <AlertTriangle className="w-5 h-5 text-red-400" />
  }

  return (
    <div className={`border bg-gradient-to-br ${getRiskColor()} backdrop-blur-xl p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 border border-purple-500/30 bg-purple-500/10">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-mono text-sm tracking-wider font-bold">AI RISK EXPLANATION</h3>
          <p className="text-white/40 font-mono text-[9px] tracking-wider">POWERED BY GROQ AI (LLAMA 3.3 70B)</p>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-6">
        <div className="flex items-start gap-3 p-4 bg-black/40 border border-white/10">
          {getRiskIcon()}
          <div className="flex-1">
            <p className="text-white font-mono text-sm leading-relaxed">
              {aiSummary.overview}
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h4 className="text-white/80 font-mono text-xs tracking-wider mb-3 uppercase">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiSummary.keyInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-black/40 border border-white/10">
              <div className="text-purple-400 font-mono text-xs mt-0.5">•</div>
              <p className="text-white/80 font-mono text-xs leading-relaxed flex-1">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="mb-6">
        <h4 className="text-white/80 font-mono text-xs tracking-wider mb-3 uppercase flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Risk Analysis
        </h4>
        <div className="p-4 bg-black/40 border border-white/10">
          <p className="text-white/80 font-mono text-xs leading-relaxed">
            {aiSummary.riskAnalysis}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-4">
        <h4 className="text-white/80 font-mono text-xs tracking-wider mb-3 uppercase">Recommendation</h4>
        <div className={`p-4 border ${
          riskScore < 30 ? 'bg-green-500/10 border-green-500/30' :
          riskScore < 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
          riskScore < 80 ? 'bg-orange-500/10 border-orange-500/30' :
          'bg-red-500/10 border-red-500/30'
        }`}>
          <p className={`font-mono text-sm font-bold ${
            riskScore < 30 ? 'text-green-400' :
            riskScore < 60 ? 'text-yellow-400' :
            riskScore < 80 ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {aiSummary.recommendation}
          </p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-white/40 font-mono text-[10px] leading-relaxed">
          {aiSummary.technicalDetails}
        </p>
      </div>
    </div>
  )
}
