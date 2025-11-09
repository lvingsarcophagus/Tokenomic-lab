'use client'

/**
 * Admin Panel Component
 * 
 * Allows admins to manage user roles
 * Only visible to users with admin role
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useUserRole } from '@/hooks/use-user-role'
import { auth } from '@/lib/firebase'

export function AdminPanel() {
  const { isAdmin, loading } = useUserRole()
  const [targetUid, setTargetUid] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'FREE' | 'PREMIUM' | 'ADMIN'>('FREE')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center">Loading admin panel...</p>
      </Card>
    )
  }

  if (!isAdmin) {
    return null // Don't show panel to non-admins
  }

  const handleSetRole = async () => {
    if (!targetUid) {
      setError('User UID is required')
      return
    }

    setProcessing(true)
    setError('')
    setMessage('')

    try {
      const user = auth.currentUser
      if (!user) {
        setError('Not authenticated')
        return
      }

      const token = await user.getIdToken()

      const response = await fetch('/api/admin/set-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUid,
          role: selectedRole,
          email: targetEmail || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to set role')
        return
      }

      setMessage(`✅ User role updated to ${selectedRole}`)
      setTargetUid('')
      setTargetEmail('')
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="p-6 bg-red-950/20 border-red-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <h2 className="text-xl font-bold">🔐 Admin Panel</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">User UID</label>
          <Input
            type="text"
            placeholder="abc123def456..."
            value={targetUid}
            onChange={(e) => setTargetUid(e.target.value)}
            className="bg-black/50 border-white/20"
          />
          <p className="text-xs text-gray-400 mt-1">
            Find UID in Firebase Console → Authentication
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email (optional)</label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            className="bg-black/50 border-white/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <div className="flex gap-2">
            <Button
              variant={selectedRole === 'FREE' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('FREE')}
              className="flex-1"
            >
              FREE
            </Button>
            <Button
              variant={selectedRole === 'PREMIUM' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('PREMIUM')}
              className="flex-1"
            >
              PREMIUM
            </Button>
            <Button
              variant={selectedRole === 'ADMIN' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('ADMIN')}
              className="flex-1"
            >
              ADMIN
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSetRole}
          disabled={processing || !targetUid}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {processing ? 'Setting Role...' : 'Set User Role'}
        </Button>

        {message && (
          <div className="p-3 bg-green-500/20 border border-green-500 rounded text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded text-sm">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-white/10 text-xs text-gray-400 space-y-1">
          <p>⚠️ Role changes require user to sign out and sign in again</p>
          <p>💡 Use scripts for initial setup:</p>
          <code className="block bg-black/50 p-2 mt-2 rounded">
            node scripts/make-admin.js &lt;uid&gt;<br />
            node scripts/make-premium.js &lt;uid&gt;
          </code>
        </div>
      </div>
    </Card>
  )
}
