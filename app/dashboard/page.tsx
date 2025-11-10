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
      setHasRedirected(true)
      router.replace('/login')
    } else if (userProfile?.plan === 'PREMIUM') {
      setHasRedirected(true)
      router.replace('/premium/dashboard')
    } else if (user && userProfile) {
      setHasRedirected(true)
      router.replace('/free-dashboard')
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
