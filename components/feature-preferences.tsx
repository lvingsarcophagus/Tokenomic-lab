/**
 * Feature Preferences Component
 * Allows pay-per-use users to toggle optional features
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Sparkles, Wallet, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FeaturePreferences {
  aiRiskAnalyst: boolean
  portfolioAudit: boolean
}

export default function FeaturePreferences() {
  const { user, userProfile, refreshProfile } = useAuth()
  const [preferences, setPreferences] = useState<FeaturePreferences>({
    aiRiskAnalyst: true,
    portfolioAudit: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userProfile?.featurePreferences) {
      setPreferences(userProfile.featurePreferences)
    }
    setLoading(false)
  }, [userProfile])

  const handleToggle = async (feature: keyof FeaturePreferences) => {
    const newPreferences = {
      ...preferences,
      [feature]: !preferences[feature],
    }
    
    setPreferences(newPreferences)
    setSaving(true)

    try {
      const token = await user?.getIdToken()
      const response = await fetch('/api/user/feature-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: newPreferences }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      await refreshProfile()
      toast.success('Preferences updated')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save preferences')
      // Revert on error
      setPreferences(preferences)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-black/60 border border-white/20 backdrop-blur-lg p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/60 border border-white/20 backdrop-blur-lg p-6">
      <h3 className="text-white font-mono text-sm font-bold mb-4 flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        OPTIONAL FEATURES
      </h3>
      <p className="text-white/60 text-xs font-mono mb-6">
        Choose which features to use when scanning tokens. Disabled features won't deduct credits.
      </p>

      <div className="space-y-4">
        {/* AI Risk Analyst */}
        <div className="flex items-start justify-between gap-4 p-4 bg-black/40 border border-white/10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-mono text-sm font-bold">AI Risk Analyst</span>
            </div>
            <p className="text-white/60 text-xs font-mono mb-2">
              Get AI-powered natural language explanations of token risks
            </p>
            <div className="text-white/40 text-xs font-mono">
              Cost: 1 credit per report
            </div>
          </div>
          <button
            onClick={() => handleToggle('aiRiskAnalyst')}
            disabled={saving}
            className={`relative w-14 h-7 border-2 transition-all ${
              preferences.aiRiskAnalyst
                ? 'bg-white border-white'
                : 'bg-black border-white/30'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 transition-all ${
                preferences.aiRiskAnalyst
                  ? 'right-0.5 bg-black'
                  : 'left-0.5 bg-white'
              }`}
            />
          </button>
        </div>

        {/* Portfolio Audit */}
        <div className="flex items-start justify-between gap-4 p-4 bg-black/40 border border-white/10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-white" />
              <span className="text-white font-mono text-sm font-bold">Portfolio Audit</span>
            </div>
            <p className="text-white/60 text-xs font-mono mb-2">
              Automatically scan all tokens in your connected wallet
            </p>
            <div className="text-white/40 text-xs font-mono">
              Cost: 0.5 credits per token
            </div>
          </div>
          <button
            onClick={() => handleToggle('portfolioAudit')}
            disabled={saving}
            className={`relative w-14 h-7 border-2 transition-all ${
              preferences.portfolioAudit
                ? 'bg-white border-white'
                : 'bg-black border-white/30'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 transition-all ${
                preferences.portfolioAudit
                  ? 'right-0.5 bg-black'
                  : 'left-0.5 bg-white'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-black/20 border border-white/10">
        <p className="text-white/60 text-xs font-mono">
          💡 <span className="text-white">Tip:</span> Disable features you don't need to save credits. 
          Basic risk scores and honeypot checks are always free.
        </p>
      </div>
    </div>
  )
}
