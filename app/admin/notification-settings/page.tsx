'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { auth } from '@/lib/firebase'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Settings, Mail, Bell } from 'lucide-react'

interface NotificationPreferences {
  userId?: string
  emailNotifications: boolean
  inAppNotifications: boolean
  notificationTypes: {
    tierChanges: boolean
    userActivity: boolean
    systemAlerts: boolean
    securityEvents: boolean
  }
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never'
  updatedAt?: string
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const { role } = useUserRole()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    inAppNotifications: true,
    notificationTypes: {
      tierChanges: true,
      userActivity: true,
      systemAlerts: true,
      securityEvents: true,
    },
    emailFrequency: 'immediate',
  })

  // Redirect if not admin
  useEffect(() => {
    if (role && role !== 'ADMIN') {
      router.push('/admin')
    }
  }, [role, router])

  // Fetch preferences
  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('/api/admin/notification-preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
      notifyError('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('/api/admin/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotifications: preferences.emailNotifications,
          inAppNotifications: preferences.inAppNotifications,
          notificationTypes: preferences.notificationTypes,
          emailFrequency: preferences.emailFrequency,
        }),
      })

      if (response.ok) {
        notifySuccess('✓ Notification preferences saved successfully')
      } else {
        const error = await response.json()
        notifyError(`Failed to save preferences: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      notifyError('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-white/60 font-mono">LOADING...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-white" />
            <h1 className="text-3xl font-bold font-mono">NOTIFICATION SETTINGS</h1>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Email Notifications */}
          <Card className="border border-white/20 bg-black/40 backdrop-blur-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-mono font-bold text-lg">EMAIL NOTIFICATIONS</h3>
                  <p className="text-white/60 text-sm font-mono mt-1">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
              </label>
            </div>

            {preferences.emailNotifications && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-mono text-white/80 mb-2">EMAIL FREQUENCY</label>
                  <select
                    value={preferences.emailFrequency}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        emailFrequency: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white font-mono text-sm"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>
            )}
          </Card>

          {/* In-App Notifications */}
          <Card className="border border-white/20 bg-black/40 backdrop-blur-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-mono font-bold text-lg">IN-APP NOTIFICATIONS</h3>
                  <p className="text-white/60 text-sm font-mono mt-1">See notifications in the dashboard</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      inAppNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
              </label>
            </div>
          </Card>

          {/* Notification Types */}
          <Card className="border border-white/20 bg-black/40 backdrop-blur-xl p-6">
            <h3 className="font-mono font-bold text-lg mb-4">NOTIFICATION TYPES</h3>
            <div className="space-y-3">
              {[
                { key: 'tierChanges', label: 'Tier Changes', desc: 'When users upgrade or downgrade' },
                { key: 'userActivity', label: 'User Activity', desc: 'User registrations and deletions' },
                { key: 'systemAlerts', label: 'System Alerts', desc: 'Server and system issues' },
                { key: 'securityEvents', label: 'Security Events', desc: 'Suspicious activities detected' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                  <div>
                    <p className="font-mono text-sm font-bold text-white">{item.label}</p>
                    <p className="text-xs text-white/60 font-mono">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        preferences.notificationTypes[
                          item.key as keyof typeof preferences.notificationTypes
                        ]
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          notificationTypes: {
                            ...preferences.notificationTypes,
                            [item.key]: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3 justify-end pt-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                CANCEL
              </Button>
            </Link>
            <Button
              onClick={handleSavePreferences}
              disabled={saving}
              className="bg-white text-black hover:bg-white/90"
            >
              {saving ? 'SAVING...' : '✓ SAVE SETTINGS'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
