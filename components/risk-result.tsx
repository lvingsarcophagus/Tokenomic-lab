"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RiskResult, RiskBreakdown } from "@/lib/types/token-data"
import { Shield, AlertTriangle, Gauge, Info, CalendarClock, CheckCircle2 } from "lucide-react"

interface RiskResultProps {
  result: RiskResult
}

const FACTOR_LABELS: Record<keyof RiskBreakdown, string> = {
  supplyDilution: 'SUPPLY DILUTION',
  holderConcentration: 'HOLDER CONCENTRATION',
  liquidityDepth: 'LIQUIDITY DEPTH',
  vestingUnlock: 'VESTING & UNLOCKS',
  contractControl: 'CONTRACT CONTROL',
  taxFee: 'TAX & FEES',
  distribution: 'DISTRIBUTION',
  burnDeflation: 'BURN & DEFLATION',
  adoption: 'ADOPTION & USAGE',
  auditTransparency: 'AUDIT & TRANSPARENCY',
}

export default function RiskResultView({ result }: RiskResultProps) {
  const plan = result.plan || 'FREE'
  const breakdownEntries = Object.entries(result.breakdown || {}) as [keyof RiskBreakdown, number][]
  const riskColor = result.risk_level === 'CRITICAL' ? 'text-red-400' : 
                     result.risk_level === 'HIGH' ? 'text-orange-400' :
                     result.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all group">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 font-mono tracking-wider text-sm">
            <div className="p-1.5 border border-white/30 group-hover:bg-white group-hover:text-black transition-all">
              <Shield className="w-4 h-4 text-white group-hover:text-black" />
            </div>
            UNIFIED RISK ANALYSIS ({plan})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-3">
              <div className="p-4 bg-black/40 border border-white/20">
                <div className="text-xs text-white/60 mb-2 font-mono">OVERALL RISK SCORE</div>
                <div className={`text-5xl font-bold font-mono ${riskColor} transition-colors`}>
                  {result.overall_risk_score}
                  <span className="text-xl text-white/40">/100</span>
                </div>
                <div className={`mt-2 text-xs font-mono font-bold ${riskColor}`}>LEVEL: {result.risk_level}</div>
                <div className="mt-3 h-1 bg-white/10 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.risk_level === 'CRITICAL' ? 'bg-red-400' :
                      result.risk_level === 'HIGH' ? 'bg-orange-400' :
                      result.risk_level === 'MEDIUM' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, result.overall_risk_score))}%` }}
                  />
                </div>
              </div>
              <div className="p-3 bg-black/40 border border-white/20 hover:border-white/30 transition-all">
                <div className="flex items-center gap-2 text-xs text-white/60 font-mono mb-1">
                  <Gauge className="w-3 h-3" />
                  CONFIDENCE
                </div>
                <div className="text-lg font-bold text-white font-mono">{result.confidence_score}%</div>
              </div>
              <div className="p-3 bg-black/40 border border-white/20 hover:border-white/30 transition-all">
                <div className="text-[10px] text-white/60 font-mono mb-2">DATA SOURCES</div>
                <div className="text-[10px] text-white/80 font-mono space-y-1">
                  {result.data_sources.map((src, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                      {src}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-white/40 font-mono mt-2 pt-2 border-t border-white/10">
                  GOPLUS: <span className={result.goplus_status === 'active' ? 'text-green-400' : 'text-yellow-400'}>{result.goplus_status?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="grid md:grid-cols-2 gap-3">
                {breakdownEntries.map(([key, value]) => {
                  const factorRisk = value >= 70 ? 'border-red-400/30' : value >= 50 ? 'border-orange-400/30' : value >= 30 ? 'border-yellow-400/30' : 'border-green-400/30'
                  return (
                    <div key={key} className={`p-4 bg-black/40 border ${factorRisk} hover:border-white/40 transition-all group`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-white/60 font-mono">{FACTOR_LABELS[key]}</div>
                        <div className="text-[10px] text-white/80 font-mono font-bold">{Math.round(value)}</div>
                      </div>
                      <div className="h-1.5 bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-700 group-hover:bg-white/80" 
                          style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {plan === 'FREE' && result.upgrade_message && (
                <div className="mt-4 p-3 bg-black/40 border border-white/20 text-[10px] text-white/80 font-mono">
                  {result.upgrade_message}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {result.critical_flags && result.critical_flags.length > 0 && (
        <Card className="bg-black/60 backdrop-blur-lg border border-red-400/30 hover:border-red-400/50 transition-all">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2 font-mono tracking-wider text-sm">
              <div className="p-1.5 border border-red-400/30">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              CRITICAL FLAGS ({result.critical_flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {result.critical_flags.map((f, i) => (
                <div key={i} className="p-3 bg-red-400/10 border border-red-400/20 hover:border-red-400/40 text-xs text-white/90 font-mono transition-all animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 50}ms` }}>
                  {f}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.upcoming_risks && (
        <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-mono tracking-wider text-sm">
              <CalendarClock className="w-4 h-4 text-white" />
              30-DAY RISK FORECAST
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 border border-white/20">
                <div className="text-[10px] text-white/60 font-mono">UNLOCK PCT</div>
                <div className="text-xl font-bold text-white font-mono">{Math.round((result.upcoming_risks.next_30_days || 0) * 100)}%</div>
              </div>
              <div className="p-4 bg-black/40 border border-white/20">
                <div className="text-[10px] text-white/60 font-mono">FORECAST</div>
                <div className="text-xl font-bold text-white font-mono">{result.upcoming_risks.forecast}</div>
              </div>
              <div className="p-4 bg-black/40 border border-white/20">
                <div className="text-[10px] text-white/60 font-mono">STATUS</div>
                <div className="text-xs text-white/80 font-mono flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> CALCULATED</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result.detailed_insights && result.detailed_insights.length > 0 && (
        <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-mono tracking-wider text-sm">
              <Info className="w-4 h-4 text-white" />
              DETAILED INSIGHTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.detailed_insights.map((ins, i) => (
                <div key={i} className="p-3 bg-black/40 border border-white/20 text-[10px] text-white/80 font-mono">
                  {ins}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


