'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

/**
 * Premium page redirect
 * Automatically redirects to /premium/dashboard for premium users
 * or /premium-signup for non-premium users
 */
export default function PremiumPage() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  
  useEffect(() => {
    if (!loading) {
      if (!user || userProfile?.plan !== 'PREMIUM') {
        router.push('/premium-signup')
      } else {
        router.push('/premium/dashboard')
      }
    }
  }, [user, userProfile, loading, router])
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to premium dashboard...</p>
      </div>
    </div>
  )
}
