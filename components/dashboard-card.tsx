import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  icon?: LucideIcon
  label?: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  children?: ReactNode
}

export function DashboardCard({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  trend,
  className = '',
  children 
}: DashboardCardProps) {
  return (
    <div className={`border border-white/20 bg-black/60 backdrop-blur-xl p-6 hover:border-white/40 transition-all group ${className}`}>
      {(Icon || label) && (
        <div className="flex items-center justify-between mb-4">
          {Icon && <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />}
          {label && <span className="text-white/40 font-mono text-xs tracking-wider">{label}</span>}
        </div>
      )}
      
      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-3xl font-bold text-white font-mono">{value}</div>
        {trend && (
          <span className={`text-sm font-mono ${trend.isPositive ? 'text-white/60' : 'text-white/60'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {description && (
        <div className="text-white/60 font-mono text-xs">{description}</div>
      )}
      
      {children}
    </div>
  )
}

interface ScanResultCardProps {
  title: string
  children: ReactNode
  className?: string
}

export function ScanResultCard({ title, children, className = '' }: ScanResultCardProps) {
  return (
    <div className={`border border-white/20 bg-black/60 backdrop-blur-xl p-6 ${className}`}>
      <h3 className="text-white font-mono text-sm tracking-wider mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-white"></div>
        {title}
      </h3>
      {children}
    </div>
  )
}

interface RiskScoreDisplayProps {
  score: number
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence?: number
}

export function RiskScoreDisplay({ score, level, confidence }: RiskScoreDisplayProps) {
  const getColor = () => {
    if (score <= 30) return 'text-white'
    if (score <= 60) return 'text-white'
    return 'text-white'
  }

  const getBgColor = () => {
    if (score <= 30) return 'bg-white/10'
    if (score <= 60) return 'bg-white/10'
    return 'bg-white/10'
  }

  return (
    <div className="border border-white/30 bg-black/80 backdrop-blur-xl p-8 text-center">
      <div className="mb-4">
        <div className={`text-7xl font-bold ${getColor()} font-mono mb-2`}>
          {score}
        </div>
        <div className="text-white/60 font-mono text-sm">RISK SCORE</div>
      </div>
      
      <div className={`inline-block px-6 py-2 ${getBgColor()} border border-white/30 mb-4`}>
        <span className={`${getColor()} font-mono text-sm font-bold tracking-wider`}>
          {level} RISK
        </span>
      </div>
      
      {confidence && (
        <div className="text-white/40 font-mono text-xs">
          {confidence}% CONFIDENCE
        </div>
      )}
      
      {/* Risk bar */}
      <div className="mt-6 h-2 bg-white/10 relative overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-white transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
