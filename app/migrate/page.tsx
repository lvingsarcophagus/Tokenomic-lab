'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { migrateUserSchema, needsMigration } from '@/lib/services/migration-service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function MigrationTestPage() {
  const { user, userProfile } = useAuth()
  const [migrating, setMigrating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [checkResult, setCheckResult] = useState<boolean | null>(null)

  const handleCheckMigration = async () => {
    if (!user) {
      setResult('No user logged in')
      return
    }

    const needs = await needsMigration(user.uid)
    setCheckResult(needs)
    setResult(needs ? 'User needs migration' : 'User schema is up to date')
  }

  const handleMigrate = async () => {
    if (!user) {
      setResult('No user logged in')
      return
    }

    setMigrating(true)
    setResult(null)

    try {
      const migratedProfile = await migrateUserSchema(user.uid)
      
      if (migratedProfile) {
        setResult(`✅ Migration successful! Plan: ${migratedProfile.plan}`)
        setCheckResult(false)
        // Refresh page after 2 seconds
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setResult('❌ Migration failed - profile not found or already migrated')
      }
    } catch (error) {
      setResult(`❌ Migration error: ${error}`)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Schema Migration Tool</h1>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-4">User Status</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">User ID:</span>
              <span className="text-white font-mono">{user?.uid || 'Not logged in'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">Email:</span>
              <span className="text-white">{user?.email || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">Current Plan:</span>
              <span className="text-white font-semibold">
                {userProfile?.plan || 'UNDEFINED'}
                {!userProfile?.plan && <span className="text-yellow-500 ml-2">⚠️ Needs Migration</span>}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">Schema Status:</span>
              {checkResult === null && <span className="text-slate-400">Not checked</span>}
              {checkResult === true && (
                <span className="text-yellow-500 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Old Schema
                </span>
              )}
              {checkResult === false && (
                <span className="text-green-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  New Schema
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          
          <div className="space-y-3">
            <Button
              onClick={handleCheckMigration}
              className="w-full"
              variant="outline"
              disabled={!user}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Migration Status
            </Button>

            <Button
              onClick={handleMigrate}
              className="w-full"
              disabled={!user || migrating || checkResult === false}
            >
              {migrating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Migrate to New Schema
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded ${
              result.includes('✅') 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : result.includes('❌')
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            }`}>
              {result}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Info</h2>
          
          <pre className="bg-slate-950 p-4 rounded text-xs text-slate-300 overflow-auto">
            {JSON.stringify({
              user: user ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
              } : null,
              userProfile: userProfile ? {
                plan: userProfile.plan,
                email: userProfile.email,
                usage: userProfile.usage,
                subscription: userProfile.subscription
              } : null
            }, null, 2)}
          </pre>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="flex-1"
          >
            Back to Dashboard
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  )
}
