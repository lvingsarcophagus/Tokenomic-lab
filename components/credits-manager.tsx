'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Zap, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CreditsManagerProps {
  onAddCredits?: () => void
}

export default function CreditsManager({ onAddCredits }: CreditsManagerProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const credits = userProfile?.credits || 0
  const isPayPerUse = userProfile?.plan === 'PAY_PER_USE'
  
  if (!isPayPerUse) {
    return null
  }
  
  const handleAddCredits = () => {
    if (onAddCredits) {
      onAddCredits()
    }
  }
  
  return (
    <Card className="bg-black/60 backdrop-blur-lg border border-white/20" data-credits-manager>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-white/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-mono text-sm font-bold">CREDITS</h3>
              <p className="text-white/50 text-xs font-mono">Pay-As-You-Go Balance</p>
            </div>
          </div>
          
          <button
            onClick={handleAddCredits}
            disabled={loading}
            className="px-4 py-2 bg-white text-black border-2 border-white font-mono text-xs hover:bg-transparent hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            ADD FUNDS
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-mono">BALANCE</span>
            <span className="text-white font-mono text-sm font-bold">{credits} Credits</span>
          </div>
          <div className="w-full h-2 bg-white/10 border border-white/20">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/40 text-[10px] font-mono">0</span>
            <span className="text-white/40 text-[10px] font-mono">50</span>
          </div>
        </div>
        
        {/* Usage Info */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs font-mono">AI Analyst</span>
            <span className="text-white/60 text-xs font-mono">1 Credit</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs font-mono">Portfolio Audit</span>
            <span className="text-white/60 text-xs font-mono">0.5 Credits/token</span>
          </div>
        </div>
        
        {credits < 5 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-yellow-400 text-xs font-mono">
              ⚠️ LOW BALANCE - Add more credits to continue using premium features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
