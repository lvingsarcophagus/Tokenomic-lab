import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

/**
 * Hook for Premium/Pro features access
 */

interface ProFeatures {
  hasAccess: boolean
  watchlistLimit: number
  alertsEnabled: boolean
  aiInsights: boolean
  advancedAnalytics: boolean
  realTimeMonitoring: boolean
  portfolioTracking: boolean
}

export function useProFeatures() {
  const [user, setUser] = useState<User | null>(null)
  const [features, setFeatures] = useState<ProFeatures>({
    hasAccess: false,
    watchlistLimit: 0,
    alertsEnabled: false,
    aiInsights: false,
    advancedAnalytics: false,
    realTimeMonitoring: false,
    portfolioTracking: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult()
          const isPremium = !!(tokenResult.claims.isPremium || tokenResult.claims.admin)
          
          setFeatures({
            hasAccess: isPremium,
            watchlistLimit: isPremium ? 100 : 5,
            alertsEnabled: isPremium,
            aiInsights: isPremium,
            advancedAnalytics: isPremium,
            realTimeMonitoring: isPremium,
            portfolioTracking: isPremium
          })
        } catch (error) {
          console.error('Error fetching user claims:', error)
        }
      } else {
        setFeatures({
          hasAccess: false,
          watchlistLimit: 0,
          alertsEnabled: false,
          aiInsights: false,
          advancedAnalytics: false,
          realTimeMonitoring: false,
          portfolioTracking: false
        })
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, features, loading }
}
