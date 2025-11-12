/**
 * Admin Notification Preferences
 * Manages notification settings for admins
 */

export interface AdminNotificationPreferences {
  userId: string
  emailNotifications: boolean
  inAppNotifications: boolean
  notificationTypes: {
    tierChanges: boolean
    userActivity: boolean
    systemAlerts: boolean
    securityEvents: boolean
  }
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never'
  updatedAt: string
}

export const DEFAULT_PREFERENCES: Omit<AdminNotificationPreferences, 'userId' | 'updatedAt'> = {
  emailNotifications: true,
  inAppNotifications: true,
  notificationTypes: {
    tierChanges: true,
    userActivity: true,
    systemAlerts: true,
    securityEvents: true,
  },
  emailFrequency: 'immediate',
}
