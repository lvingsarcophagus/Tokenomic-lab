'use client'

import { Sparkles, AlertTriangle, CheckCircle, Info, TrendingUp, Shield, Zap } from 'lucide-react'
import { theme } from '@/lib/theme'

interface RiskExplanationProps {
  riskScore: number
  riskLevel: string
  aiInsights?: {
    classification: string
    confidence: number
    reasoning: string
    meme_baseline_applied: boolean
  }
  aiSummary?: {
    overview: string
    key_risks: string[]
    opportunities: string[]
    recommendation: string
  }
  criticalFlags?: string[]
  isPremium: boolean
}

export default function RiskExplanation({
  riskScore,
  riskLevel,
  aiInsights,
  aiSummary,
  criticalFlags = [],
  isPremium
}: RiskExplanationProps) {
  // Debug logging
  console.log('[RiskExplanation] Rendering with:', {
    riskScore,
    riskLevel,
    hasAiInsights: !!aiInsights,
    hasAiSummary: !!aiSummary,
    criticalFlagsCount: criticalFlags.length,
    isPremium
  })
  
  if (!riskScore && riskScore !== 0) {
    console.warn('[RiskExplanation] No risk score provided')
    return null
  }
  const getRiskColor = () => {
    if (riskScore < 30) return 'from-green-500/20 to-green-500/5 border-green-500/30'
    if (riskScore < 60) return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
    if (riskScore < 80) return 'from-orange-500/20 to-orange-500/5 border-orange-500/30'
    return 'from-red-500/20 to-red-500/5 border-red-500/30'
  }

  const getRiskIcon = () => {
    if (riskScore < 30) return <CheckCircle className="w-6 h-6 text-green-400" />
    if (riskScore < 60) return <Info className="w-6 h-6 text-yellow-400" />
    if (riskScore < 80) return <AlertTriangle className="w-6 h-6 text-orange-400" />
    return <AlertTriangle className="w-6 h-6 text-red-400" />
  }

  const getRecommendation = () => {
    if (riskScore < 30) return {
      text: 'LOW RISK - Generally safe for investment',
      color: 'text-green-400',
      icon: <CheckCircle className="w-5 h-5" />
    }
    if (riskScore < 60) return {
      text: 'MEDIUM RISK - Research thoroughly before investing',
      color: 'text-yellow-400',
      icon: <Info className="w-5 h-5" />
    }
    if (riskScore < 80) return {
      text: 'HIGH RISK - Proceed with extreme caution',
      color: 'text-orange-400',
      icon: <AlertTriangle className="w-5 h-5" />
    }
    return {
      text: 'CRITICAL RISK - Avoid investment',
      color: 'text-red-400',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="space-y-4">
      {/* Main Risk Explanation Card */}
      <div className={`bg-gradient-to-br ${getRiskColor()} border rounded-xl p-6 backdrop-blur-sm`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getRiskIcon()}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 flex items-center gap-2`}>
              RISK ASSESSMENT: {riskLevel}
            </h3>
            <div className={`flex items-center gap-2 ${recommendation.color} ${theme.fonts.mono} text-sm mb-3`}>
              {recommendation.icon}
              <span className="font-bold">{recommendation.text}</span>
            </div>
            
            {/* Score Breakdown */}
            <div className="bg-black/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`${theme.text.secondary} ${theme.fonts.mono} text-xs uppercase`}>Risk Score</span>
                <span className={`${theme.text.primary} ${theme.fonts.mono} text-lg font-bold`}>{riskScore}/100</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    riskScore < 30 ? 'bg-green-500' :
                    riskScore < 60 ? 'bg-yellow-500' :
                    riskScore < 80 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            {/* Why This Score? */}
            <div className="space-y-2">
              <p className={`${theme.text.secondary} ${theme.fonts.mono} text-sm font-bold uppercase flex items-center gap-2`}>
                <Zap className="w-4 h-4" />
                Why This Score?
              </p>
              <ul className={`${theme.text.secondary} ${theme.fonts.mono} text-sm space-y-1 ml-6`}>
                {riskScore >= 80 && (
                  <li className="list-disc">Critical risk factors detected - multiple red flags present</li>
                )}
                {riskScore >= 60 && riskScore < 80 && (
                  <li className="list-disc">Significant risk factors identified - careful analysis required</li>
                )}
                {riskScore >= 30 && riskScore < 60 && (
                  <li className="list-disc">Moderate concerns present - standard due diligence recommended</li>
                )}
                {riskScore < 30 && (
                  <li className="list-disc">Strong fundamentals with minimal risk indicators</li>
                )}
                
                {aiInsights?.meme_baseline_applied && (
                  <li className="list-disc text-yellow-400">+15 baseline risk added (Meme token classification)</li>
                )}
                
                {criticalFlags.length > 0 && (
                  <li className="list-disc text-red-400">
                    {criticalFlags.length} critical flag{criticalFlags.length > 1 ? 's' : ''} detected
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI Classification */}
      {aiInsights && (
        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-full bg-purple-500/20 border border-purple-500/30">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className={`text-base ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2`}>
                AI CLASSIFICATION
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.fonts.mono} ${
                    aiInsights.classification === 'MEME_TOKEN' 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {aiInsights.classification === 'MEME_TOKEN' ? '🎭 MEME TOKEN' : '⚙️ UTILITY TOKEN'}
                  </span>
                  <span className={`${theme.text.secondary} ${theme.fonts.mono} text-xs`}>
                    {aiInsights.confidence}% confidence
                  </span>
                </div>
                <p className={`${theme.text.secondary} ${theme.fonts.mono} text-sm`}>
                  {aiInsights.reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary (Premium) */}
      {isPremium && aiSummary && (
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-full bg-purple-500/20 border border-purple-500/30">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className={`text-base ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 flex items-center gap-2`}>
                AI INSIGHTS
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">PREMIUM</span>
              </h3>
              <p className={`${theme.text.secondary} ${theme.fonts.mono} text-sm leading-relaxed`}>
                {aiSummary.overview}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Key Risks */}
            {aiSummary.key_risks && aiSummary.key_risks.length > 0 && (
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className={`text-sm ${theme.fonts.bold} text-red-400 ${theme.fonts.mono} mb-2 flex items-center gap-2`}>
                  <AlertTriangle className="w-4 h-4" />
                  KEY RISKS
                </h4>
                <ul className="space-y-1">
                  {aiSummary.key_risks.slice(0, 3).map((risk, i) => (
                    <li key={i} className={`${theme.text.secondary} ${theme.fonts.mono} text-xs flex items-start gap-2`}>
                      <span className="text-red-400 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {aiSummary.opportunities && aiSummary.opportunities.length > 0 && (
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className={`text-sm ${theme.fonts.bold} text-green-400 ${theme.fonts.mono} mb-2 flex items-center gap-2`}>
                  <CheckCircle className="w-4 h-4" />
                  OPPORTUNITIES
                </h4>
                <ul className="space-y-1">
                  {aiSummary.opportunities.slice(0, 3).map((opp, i) => (
                    <li key={i} className={`${theme.text.secondary} ${theme.fonts.mono} text-xs flex items-start gap-2`}>
                      <span className="text-green-400 mt-1">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendation */}
          {aiSummary.recommendation && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg border-l-4 border-purple-500">
              <p className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold`}>
                💡 {aiSummary.recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <p className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold`}>
                  Unlock AI-Powered Insights
                </p>
                <p className={`${theme.text.secondary} ${theme.fonts.mono} text-xs`}>
                  Get detailed AI analysis, risk predictions, and investment recommendations
                </p>
              </div>
            </div>
            <a href="/pricing" className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-mono text-xs font-bold transition-all">
              UPGRADE
            </a>
          </div>
        </div>
      )}

      {/* Critical Flags */}
      {criticalFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
          <h4 className={`text-sm ${theme.fonts.bold} text-red-400 ${theme.fonts.mono} mb-3 flex items-center gap-2`}>
            <AlertTriangle className="w-4 h-4" />
            CRITICAL FLAGS DETECTED
          </h4>
          <div className="space-y-2">
            {criticalFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2 bg-black/20 rounded p-2">
                <span className="text-red-400 mt-0.5">⚠️</span>
                <span className={`${theme.text.secondary} ${theme.fonts.mono} text-xs`}>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
