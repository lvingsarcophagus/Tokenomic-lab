'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardRouter() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Prevent redirect loops
    if (loading || hasRedirected) return

    console.log('[Dashboard Router] Auth state:', { user: !!user, userProfile, loading })

    if (!user) {
      console.log('[Dashboard Router] No user, redirecting to login')
      setHasRedirected(true)
      router.replace('/login')
    } else if (userProfile?.plan === 'PREMIUM') {
      console.log('[Dashboard Router] Premium user, redirecting to /premium')
      setHasRedirected(true)
      router.replace('/premium')
    } else if (userProfile?.plan === 'FREE') {
      console.log('[Dashboard Router] Free user, redirecting to /free-dashboard')
      setHasRedirected(true)
      router.replace('/free-dashboard')
    } else if (user && !userProfile) {
      // User logged in but profile not loaded yet, wait
      console.log('[Dashboard Router] User logged in, waiting for profile...')
    }
  }, [user, userProfile, loading, router, hasRedirected])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {loading ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}
