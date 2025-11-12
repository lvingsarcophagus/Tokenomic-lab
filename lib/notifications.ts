import { toast } from 'sonner'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NotificationOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Show a notification toast
 */
export function showNotification(
  message: string,
  type: NotificationType = 'info',
  options?: NotificationOptions
) {
  const { duration = 4000, action } = options || {}

  const toastOptions = {
    duration,
    ...(action && { action: { label: action.label, onClick: action.onClick } }),
  }

  switch (type) {
    case 'success':
      toast.success(message, toastOptions)
      break
    case 'error':
      toast.error(message, toastOptions)
      break
    case 'warning':
      toast.warning(message, toastOptions)
      break
    case 'info':
    default:
      toast(message, toastOptions)
      break
  }
}

/**
 * Show success notification
 */
export function notifySuccess(message: string, options?: NotificationOptions) {
  showNotification(message, 'success', options)
}

/**
 * Show error notification
 */
export function notifyError(message: string, options?: NotificationOptions) {
  showNotification(message, 'error', options)
}

/**
 * Show warning notification
 */
export function notifyWarning(message: string, options?: NotificationOptions) {
  showNotification(message, 'warning', options)
}

/**
 * Show info notification
 */
export function notifyInfo(message: string, options?: NotificationOptions) {
  showNotification(message, 'info', options)
}
