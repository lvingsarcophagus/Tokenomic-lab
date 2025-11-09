"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { theme } from '@/lib/theme'
import { useAuth } from '@/contexts/auth-context'

export default function PremiumSignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { user, updateProfile } = useAuth()

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/user/upgrade-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upgrade failed')
      setSuccess('Upgraded to premium successfully. Redirecting to dashboard...')
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const upgradeSelf = async () => {
    try {
      setLoading(true)
      setError('')
      await updateProfile({ tier: 'pro' })
      setSuccess('Your account is now Premium. Redirecting to dashboard...')
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (e: unknown) {
      setError('Failed to upgrade current account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${theme.backgrounds.main} overflow-hidden p-4`}>
      <div className={`relative ${theme.backgrounds.card} border ${theme.borders.default} p-8 w-full max-w-md`}>
        <div className="flex items-center gap-2 mb-6 opacity-60">
          <div className={theme.decorative.divider}></div>
          <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>Premium</span>
          <div className="flex-1 h-px bg-white"></div>
        </div>

        <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} mb-6 text-center ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
          Upgrade Account
        </h2>

        {error && (
          <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} ${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono}`}>
            {error}
          </div>
        )}
        {success && (
          <div className={`mb-4 p-3 border ${theme.status.safe.border} ${theme.status.safe.bg} ${theme.status.safe.text} ${theme.text.small} ${theme.fonts.mono}`}>
            {success}
          </div>
        )}

        <form onSubmit={handleUpgrade} className="space-y-4">
          <div>
            <Label htmlFor="email" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="name" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Name (optional)
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="Your Name"
            />
          </div>

          <Button type="submit" disabled={loading} className={`w-full ${theme.buttons.primary} uppercase`}>
            {loading ? 'UPGRADING...' : 'UPGRADE TO PREMIUM'}
          </Button>
        </form>

        {user && (
          <div className="mt-4">
            <Button onClick={upgradeSelf} disabled={loading} className={`w-full ${theme.buttons.secondary || theme.buttons.primary} uppercase`}>
              {loading ? 'UPGRADING...' : 'UPGRADE MY CURRENT ACCOUNT'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


