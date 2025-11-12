/**
 * Email Notification Service
 * Sends email notifications for tier changes and other events
 */

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nayanjoshymaniyathjoshy@gmail.com',
    pass: process.env.EMAIL_PASSWORD || '',
  },
})

export interface EmailNotificationPayload {
  recipientEmail: string
  recipientName?: string
  type: 'tier_upgrade' | 'tier_downgrade' | 'warning' | 'info'
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
}

/**
 * Send email notification
 */
export async function sendEmailNotification(payload: EmailNotificationPayload): Promise<boolean> {
  try {
    // Skip if no email password configured
    if (!process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email notifications disabled: EMAIL_PASSWORD not configured')
      return false
    }

    const { recipientEmail, recipientName = 'User', type, title, message, actionUrl, actionLabel } = payload

    // Build HTML email based on notification type
    const getEmailTemplate = () => {
      const backgroundColor = {
        tier_upgrade: '#10b981',
        tier_downgrade: '#f97316',
        warning: '#ef4444',
        info: '#3b82f6',
      }[type]

      const icon = {
        tier_upgrade: '🎉',
        tier_downgrade: '⚠️',
        warning: '❌',
        info: 'ℹ️',
      }[type]

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Courier New', monospace; background-color: #000; color: #fff; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${backgroundColor}20; border-left: 4px solid ${backgroundColor}; padding: 20px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; margin: 0; display: flex; align-items: center; gap: 10px; }
              .content { background-color: #1a1a1a; padding: 20px; border: 1px solid #333; margin-bottom: 20px; }
              .message { font-size: 14px; line-height: 1.6; margin-bottom: 15px; }
              .action-button { background-color: ${backgroundColor}; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold; }
              .footer { color: #666; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="title">
                  <span>${icon}</span>
                  <span>${title}</span>
                </div>
              </div>
              <div class="content">
                <p class="message">${message}</p>
                ${actionUrl ? `<a href="${actionUrl}" class="action-button">${actionLabel || 'View Details'}</a>` : ''}
              </div>
              <div class="footer">
                <p>© 2025 Tokenomics Lab. All rights reserved.</p>
                <p>You received this email because your account was updated.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'nayanjoshymaniyathjoshy@gmail.com',
      to: recipientEmail,
      subject: title,
      html: getEmailTemplate(),
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email notification sent to ${recipientEmail}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send email notification:', error)
    return false
  }
}

/**
 * Send tier upgrade notification email
 */
export async function sendTierUpgradeEmail(recipientEmail: string, recipientName?: string): Promise<boolean> {
  return sendEmailNotification({
    recipientEmail,
    recipientName,
    type: 'tier_upgrade',
    title: '🎉 PREMIUM UPGRADE!',
    message: 'Congratulations! Your account has been upgraded to PREMIUM. You now have access to unlimited scans, advanced analytics, priority support, and exclusive features.',
    actionUrl: 'https://tokenomics-lab.com/premium/dashboard',
    actionLabel: 'Go to Dashboard',
  })
}

/**
 * Send tier downgrade notification email
 */
export async function sendTierDowngradeEmail(recipientEmail: string, recipientName?: string): Promise<boolean> {
  return sendEmailNotification({
    recipientEmail,
    recipientName,
    type: 'tier_downgrade',
    title: '⚠️ Account Tier Updated',
    message: 'Your account tier has been updated. Some premium features may no longer be available. Visit your dashboard to see what features are currently available.',
    actionUrl: 'https://tokenomics-lab.com/free-dashboard',
    actionLabel: 'Go to Dashboard',
  })
}

/**
 * Send admin notification email
 */
export async function sendAdminNotificationEmail(
  recipientEmail: string,
  subject: string,
  message: string,
  type: 'info' | 'warning' = 'info'
): Promise<boolean> {
  return sendEmailNotification({
    recipientEmail,
    type,
    title: subject,
    message,
    actionUrl: 'https://tokenomics-lab.com/admin/dashboard',
    actionLabel: 'Go to Admin Dashboard',
  })
}
