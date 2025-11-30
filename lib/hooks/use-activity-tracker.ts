/**
 * React hook for automatic activity tracking
 * Tracks page views and user interactions
 */

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { logPageView, logFeatureAccess } from '@/lib/services/activity-logger'

export function useActivityTracker(pageName: string) {
  const { user, userProfile } = useAuth()

  useEffect(() => {
    if (user && userProfile?.email) {
      // Log page view
      logPageView(
        user.uid,
        userProfile.email,
        pageName,
        typeof document !== 'undefined' ? document.referrer : undefined
      ).catch(err => console.error('Failed to log page view:', err))
    }
  }, [user, userProfile, pageName])

  // Return function to log feature access
  const trackFeature = (featureName: string, metadata?: Record<string, any>) => {
    if (user && userProfile?.email) {
      logFeatureAccess(user.uid, userProfile.email, featureName, metadata)
        .catch(err => console.error('Failed to log feature access:', err))
    }
  }

  return { trackFeature }
}
