'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function DevModeToggle() {
  const [devPlan, setDevPlan] = useState<'FREE' | 'PREMIUM'>('PREMIUM')
  const [bypassRateLimit, setBypassRateLimit] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if dev mode is enabled via environment variable
    const isDevEnv = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    setIsVisible(isDevEnv)
    
    // Load saved preferences from localStorage
    const saved = localStorage.getItem('devModeSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setDevPlan(settings.plan || 'PREMIUM')
      setBypassRateLimit(settings.bypassRateLimit ?? true)
    }
  }, [])

  useEffect(() => {
    // Save preferences to localStorage
    if (isVisible) {
      localStorage.setItem('devModeSettings', JSON.stringify({
        plan: devPlan,
        bypassRateLimit
      }))
    }
  }, [devPlan, bypassRateLimit, isVisible])

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-yellow-50 border-yellow-500 border-2 z-50 shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        <h3 className="font-bold text-sm">🔧 Developer Mode</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <label className="block font-medium mb-1">Test Plan:</label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={devPlan === 'FREE' ? 'default' : 'outline'}
              onClick={() => setDevPlan('FREE')}
              className="flex-1"
            >
              FREE
            </Button>
            <Button
              size="sm"
              variant={devPlan === 'PREMIUM' ? 'default' : 'outline'}
              onClick={() => setDevPlan('PREMIUM')}
              className="flex-1"
            >
              PREMIUM
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="font-medium">Bypass Rate Limit:</label>
          <Button
            size="sm"
            variant={bypassRateLimit ? 'default' : 'outline'}
            onClick={() => setBypassRateLimit(!bypassRateLimit)}
          >
            {bypassRateLimit ? 'ON' : 'OFF'}
          </Button>
        </div>

        <div className="pt-2 border-t border-yellow-300 text-xs text-gray-600">
          <p>✓ Authentication bypassed</p>
          <p>✓ Mock user: dev-user-12345</p>
          <p>✓ Current Plan: <strong>{devPlan}</strong></p>
          {bypassRateLimit && <p>✓ Rate limiting disabled</p>}
        </div>
      </div>
    </Card>
  )
}

// Export the current dev settings for use in API calls
export function getDevSettings() {
  if (typeof window === 'undefined') return null
  
  const saved = localStorage.getItem('devModeSettings')
  if (!saved) return { plan: 'PREMIUM', bypassRateLimit: true }
  
  return JSON.parse(saved)
}
