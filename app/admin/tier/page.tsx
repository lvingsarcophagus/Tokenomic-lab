"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { theme } from '@/lib/theme'

export default function TierAdminPage() {
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<'free' | 'pro'>('pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/user/set-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to set tier')
      setSuccess(`Updated ${email} to ${tier.toUpperCase()}`)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.backgrounds.main} p-4`}>
      <div className={`w-full max-w-md ${theme.backgrounds.card} border ${theme.borders.default} p-6`}>
        <div className="flex items-center gap-2 mb-6 opacity-60">
          <div className={theme.decorative.divider}></div>
          <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>Tier Admin</span>
          <div className="flex-1 h-px bg-white"></div>
        </div>

        {error && (
          <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} ${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono}`}>{error}</div>
        )}
        {success && (
          <div className={`mb-4 p-3 border ${theme.status.safe.border} ${theme.status.safe.bg} ${theme.status.safe.text} ${theme.text.small} ${theme.fonts.mono}`}>{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 ${theme.inputs.default}`} placeholder="user@example.com" required />
          </div>

          <div>
            <Label htmlFor="tier" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>Tier</Label>
            <select
              id="tier"
              value={tier}
              onChange={(e) => setTier(e.target.value as 'free' | 'pro')}
              className={`mt-1 w-full ${theme.inputs.default} bg-transparent`}
            >
              <option value="free">Free</option>
              <option value="pro">Premium</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} className={`w-full ${theme.buttons.primary} uppercase`}>
            {loading ? 'UPDATING...' : 'UPDATE TIER'}
          </Button>
        </form>
      </div>
    </div>
  )
}




