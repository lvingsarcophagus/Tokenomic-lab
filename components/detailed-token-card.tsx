'use client'

import { useState } from 'react'
import {
  Shield,
  Crown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Droplet,
  Users,
  TrendingUp,
  Flame,
  Clock
} from 'lucide-react'

interface TokenData {
  name: string
  symbol: string
  address: string
  chain: string
  marketCap: string
  age: string
  overallRisk: number
  confidence: number
  lastUpdated: string
  factors: {
    contractSecurity: number
    supplyRisk: number
    whaleConcentration: number
    liquidityDepth: number
    marketActivity: number
    burnMechanics: number
    tokenAge: number
  }
  redFlags: string[]
  positiveSignals: string[]
  criticalFlags: string[]
  rawData: any
}

interface DetailedTokenCardProps {
  token: TokenData
  isPremium?: boolean
}

export default function DetailedTokenCard({ token, isPremium = false }: DetailedTokenCardProps) {

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-500'
    if (score <= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'LOW RISK'
    if (score <= 60) return 'MEDIUM RISK'
    return 'HIGH RISK'
  }

  const getRiskBarWidth = (score: number) => {
    return `${(score / 100) * 100}%`
  }

  const factorsList = [
    { name: 'Contract Security', score: token.factors.contractSecurity, badge: 'verified', icon: Shield },
    { name: 'Supply Risk', score: token.factors.supplyRisk, badge: 'on-chain', icon: Droplet },
    { name: 'Whale Concentration', score: token.factors.whaleConcentration, badge: '95% top10', icon: Users },
    { name: 'Liquidity Depth', score: token.factors.liquidityDepth, badge: '$89K', icon: TrendingUp },
    { name: 'Market Activity', score: token.factors.marketActivity, badge: '12 tx/h', icon: Activity },
    { name: 'Burn Mechanics', score: token.factors.burnMechanics, badge: 'defi', icon: Flame },
    { name: 'Token Age', score: token.factors.tokenAge, badge: '2 h', icon: Clock },
  ]

  return (
    <div className="border border-white/30 bg-black/60 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Token Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-wider">
              TOKENOMICS LAB
            </h2>
            {isPremium && (
              <div className="px-3 py-1 bg-white/10 border border-white/30">
                <span className="text-white font-mono text-xs tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  PREMIUM
                </span>
              </div>
            )}
          </div>
          <div className="w-full h-px bg-white/30 mb-3"></div>
          <div className="flex flex-wrap items-center gap-2 text-white font-mono text-sm">
            <span className="font-bold">{token.symbol}</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">{token.marketCap} MC</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">{token.age} old</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">{token.chain}</span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-px bg-white/30 mb-6"></div>

      {/* Main Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall Risk */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 font-mono text-xs tracking-wider">OVERALL RISK</span>
            <span className="text-white font-mono text-xs">{token.lastUpdated}</span>
          </div>
          <div className="text-4xl font-bold text-white font-mono mb-2">
            {token.overallRisk}
          </div>
          <div className="h-2 bg-black border border-white/20 mb-2">
            <div 
              className={`h-full ${getRiskColor(token.overallRisk)}`}
              style={{ width: getRiskBarWidth(token.overallRisk) }}
            ></div>
          </div>
          <span className={`text-sm font-mono font-bold ${
            token.overallRisk <= 30 ? 'text-green-400' :
            token.overallRisk <= 60 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {getRiskLabel(token.overallRisk)}
          </span>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 font-mono text-xs tracking-wider">CONFIDENCE</span>
          </div>
          <div className="text-4xl font-bold text-white font-mono mb-2">
            {token.confidence}%
          </div>
          <div className="h-2 bg-black border border-white/20 mb-2">
            <div 
              className="h-full bg-white"
              style={{ width: `${token.confidence}%` }}
            ></div>
          </div>
          <span className="text-sm font-mono text-white/60">
            {isPremium ? 'PREMIUM DATA' : 'BASIC DATA'}
          </span>
        </div>

        {/* Freshness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 font-mono text-xs tracking-wider">FRESHNESS</span>
          </div>
          <div className="text-4xl font-bold text-white font-mono mb-2">
            {token.lastUpdated}
          </div>
          <div className="h-2 bg-black border border-white/20 mb-2">
            <div className="h-full bg-white" style={{ width: '90%' }}></div>
          </div>
          <span className="text-sm font-mono text-green-400 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            LIVE
          </span>
        </div>
      </div>

      {/* Critical Flags Alert */}
      {token.criticalFlags.length > 0 ? (
        <div className="bg-red-500/20 border-2 border-red-500 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-500 font-mono text-sm font-bold tracking-wider">
              CRITICAL FLAGS
            </span>
          </div>
          <div className="space-y-2">
            {token.criticalFlags.map((flag, i) => (
              <div key={i} className="text-white font-mono text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-400 font-mono text-sm font-bold tracking-wider">
              CRITICAL FLAGS
            </span>
            <span className="text-white font-mono text-sm ml-auto">None 🎉</span>
          </div>
        </div>
      )}

      {/* 7-Factor Breakdown */}
      <div className="border border-white/30 bg-black/40 p-6 mb-6">
        <h3 className="text-white font-mono text-sm tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          7-FACTOR BREAKDOWN
        </h3>
        <div className="space-y-3">
          {factorsList.map((factor, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <factor.icon className="w-3 h-3 text-white/40" />
                  <span className="text-white/80 font-mono text-xs">{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-xs font-bold">{factor.score}</span>
                  <span className="text-white/40 font-mono text-[10px]">({factor.badge})</span>
                </div>
              </div>
              <div className="h-1.5 bg-black border border-white/10">
                <div 
                  className={`h-full transition-all duration-300 ${getRiskColor(factor.score)}`}
                  style={{ width: getRiskBarWidth(factor.score) }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags */}
      {token.redFlags.length > 0 && (
        <div className="border border-red-500/30 bg-red-500/5 p-6 mb-6">
          <h3 className="text-red-400 font-mono text-lg font-bold tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            RED FLAGS
          </h3>
          <div className="space-y-3">
            {token.redFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 text-white/90 font-mono text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive Signals */}
      {token.positiveSignals.length > 0 && (
        <div className="border border-green-500/30 bg-green-500/5 p-6 mb-6">
          <h3 className="text-green-400 font-mono text-lg font-bold tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            POSITIVE SIGNALS
          </h3>
          <div className="space-y-3">
            {token.positiveSignals.map((signal, i) => (
              <div key={i} className="flex items-start gap-3 text-white/90 font-mono text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  )
}
