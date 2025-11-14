'use client'

/**
 * Admin Login Page
 * Separate login for admin users with elevated privileges
 * Includes 2FA verification for enhanced security
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Shield, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import TwoFactorVerify from '@/components/two-factor-verify'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [tempUserId, setTempUserId] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Get ID token with custom claims
      const idTokenResult = await user.getIdTokenResult()
      
      // Check if user is admin
      if (!idTokenResult.claims.admin && idTokenResult.claims.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.')
        await auth.signOut()
        setLoading(false)
        return
      }

      // Check if 2FA is enabled
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      
      if (userData?.twoFactorEnabled) {
        // Show 2FA verification modal
        setTempUserId(user.uid)
        setShow2FA(true)
        setLoading(false)
      } else {
        // No 2FA, proceed to dashboard
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError('Login failed. Please try again.')
      }
      setLoading(false)
    }
  }

  const handle2FASuccess = () => {
    setShow2FA(false)
    router.push('/admin/dashboard')
  }

  const handle2FACancel = async () => {
    setShow2FA(false)
    setTempUserId(null)
    await auth.signOut()
    setError('2FA verification cancelled. Please login again.')
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20"></div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md mx-4 bg-black/80 backdrop-blur-lg border-red-500/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 border-2 border-red-500 mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white font-mono tracking-wider mb-2">
            ADMIN ACCESS
          </h1>
          <p className="text-red-400 text-sm font-mono">
            RESTRICTED AREA - AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-mono mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              ADMIN EMAIL
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tokenguard.com"
              required
              className="bg-black/50 border-red-500/50 text-white font-mono focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-mono mb-2">
              <Lock className="inline w-4 h-4 mr-2" />
              PASSWORD
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-black/50 border-red-500/50 text-white font-mono focus:border-red-500"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded">
              <p className="text-red-400 text-sm font-mono">⚠️ {error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-mono tracking-wider"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS ADMIN PANEL'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <Link href="/login" className="text-white/60 hover:text-white text-sm font-mono">
            ← Back to User Login
          </Link>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <p className="text-yellow-400 text-xs font-mono text-center">
            🔐 All login attempts are logged and monitored
          </p>
        </div>
      </Card>

      {/* 2FA Verification Modal */}
      {show2FA && tempUserId && (
        <TwoFactorVerify
          userId={tempUserId}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      )}
    </div>
  )
}
