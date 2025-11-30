/**
 * Subscription Expiration Checker (Cron Job)
 * Checks for expiring/expired subscriptions and sends email alerts
 * Should be called daily via cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all premium users
    const usersSnapshot = await db.collection('users')
      .where('tier', '==', 'PREMIUM')
      .get();

    const results = {
      checked: 0,
      expired: 0,
      expiringSoon: 0,
      downgraded: 0,
      emailsSent: 0,
      errors: 0,
    };

    for (const userDoc of usersSnapshot.docs) {
      results.checked++;
      const userData = userDoc.data();
      const userId = userDoc.id;
      const expiresAt = userData.premiumExpiresAt?.toDate();
      const autoRenew = userData.autoRenew ?? true;

      if (!expiresAt) continue;

      // Check if expired
      if (expiresAt < now) {
        results.expired++;

        // Downgrade to FREE if auto-renewal is disabled
        if (!autoRenew) {
          await db.collection('users').doc(userId).update({
            tier: 'FREE',
            downgradedAt: now,
            downgradedReason: 'subscription_expired',
          });
          results.downgraded++;

          // Send expiration email
          if (userData.email) {
            await sendExpirationEmail(userData.email, userData.name || 'User');
            results.emailsSent++;
          }
        } else {
          // Send renewal reminder for auto-renew users
          if (userData.email) {
            await sendRenewalReminderEmail(userData.email, userData.name || 'User');
            results.emailsSent++;
          }
        }
      }
      // Check if expiring within 7 days
      else if (expiresAt < sevenDaysFromNow && !autoRenew) {
        results.expiringSoon++;
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Send warning email
        if (userData.email) {
          await sendExpiringWarningEmail(userData.email, userData.name || 'User', daysRemaining);
          results.emailsSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Email sending functions
async function sendExpirationEmail(email: string, name: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email not configured, skipping email to:', email);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '⚠️ Your Tokenomics Lab Premium Subscription Has Expired',
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff; border: 1px solid #333;">
        <h2 style="color: #fff; border-bottom: 2px solid #fff; padding-bottom: 10px;">SUBSCRIPTION EXPIRED</h2>
        
        <p>Hi ${name},</p>
        
        <p>Your Tokenomics Lab Premium subscription has expired. You've been downgraded to the FREE tier.</p>
        
        <div style="background: #1a1a1a; border: 1px solid #333; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>What you've lost access to:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Unlimited token scans</li>
            <li>AI-powered analysis</li>
            <li>Real-time alerts</li>
            <li>Historical analytics</li>
          </ul>
        </div>
        
        <p><strong>Want to continue using Premium features?</strong></p>
        <p>Renew your subscription now to regain full access.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tokenomicslab.com'}/premium-signup" 
           style="display: inline-block; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          RENEW NOW
        </a>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Tokenomics Lab - Multi-Chain Token Risk Analysis
        </p>
      </div>
    `,
  });
}

async function sendRenewalReminderEmail(email: string, name: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email not configured, skipping email to:', email);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔄 Time to Renew Your Tokenomics Lab Premium',
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff; border: 1px solid #333;">
        <h2 style="color: #fff; border-bottom: 2px solid #fff; padding-bottom: 10px;">RENEWAL REMINDER</h2>
        
        <p>Hi ${name},</p>
        
        <p>Your Tokenomics Lab Premium subscription has expired. Since you have auto-renewal enabled, please make a payment to continue your subscription.</p>
        
        <div style="background: #1a1a1a; border: 1px solid #333; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Premium Benefits:</strong></p>
          <ul style="margin: 10px 0;">
            <li>✓ Unlimited token scans</li>
            <li>✓ AI-powered analysis</li>
            <li>✓ Real-time alerts</li>
            <li>✓ Historical analytics</li>
          </ul>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tokenomicslab.com'}/premium-signup" 
           style="display: inline-block; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          RENEW SUBSCRIPTION
        </a>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Tokenomics Lab - Multi-Chain Token Risk Analysis
        </p>
      </div>
    `,
  });
}

async function sendExpiringWarningEmail(email: string, name: string, daysRemaining: number) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email not configured, skipping email to:', email);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `⏰ Your Premium Subscription Expires in ${daysRemaining} Days`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff; border: 1px solid #333;">
        <h2 style="color: #fbbf24; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">EXPIRING SOON</h2>
        
        <p>Hi ${name},</p>
        
        <p>Your Tokenomics Lab Premium subscription will expire in <strong>${daysRemaining} days</strong>.</p>
        
        <div style="background: #1a1a1a; border: 1px solid #fbbf24; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #fbbf24;"><strong>⚠️ Action Required</strong></p>
          <p style="margin: 10px 0;">Renew now to avoid losing access to premium features.</p>
        </div>
        
        <p><strong>Don't lose access to:</strong></p>
        <ul>
          <li>Unlimited token scans</li>
          <li>AI-powered analysis</li>
          <li>Real-time alerts</li>
          <li>Historical analytics</li>
        </ul>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tokenomicslab.com'}/premium-signup" 
           style="display: inline-block; background: #fbbf24; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          RENEW NOW
        </a>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Tokenomics Lab - Multi-Chain Token Risk Analysis
        </p>
      </div>
    `,
  });
}
