# Activity Logging System

## Overview
Comprehensive activity tracking system that logs all user interactions and automatically cleans up logs older than 30 days.

## Features

### 1. Comprehensive Activity Tracking
The system tracks 30+ different activity types:

**Authentication:**
- user_login, user_logout, user_signup
- admin_login, admin_logout
- 2fa_enabled, 2fa_disabled
- password_change

**Token Analysis:**
- token_scan, token_search
- ai_analysis_requested
- portfolio_analyzed

**Payments & Credits:**
- payment_initiated, payment_completed, payment_failed
- credits_purchased, credits_used
- subscription_created, subscription_cancelled, subscription_renewed

**User Actions:**
- watchlist_add, watchlist_remove
- wallet_connected, wallet_disconnected
- profile_update, profile_image_upload
- settings_change, export_data, delete_account
- pdf_exported

**General:**
- page_view, feature_accessed, api_call

### 2. Automatic Page View Tracking
Use the `useActivityTracker` hook in any page component:

```typescript
import { useActivityTracker } from '@/lib/hooks/use-activity-tracker'

export default function MyPage() {
  const { trackFeature } = useActivityTracker('My Page Name')
  
  const handleFeatureClick = () => {
    trackFeature('special-feature', { metadata: 'value' })
  }
  
  return <div>...</div>
}
```

### 3. Manual Activity Logging
Use the activity logger service directly:

```typescript
import { 
  logActivity, 
  logTokenScan, 
  logPayment, 
  logWallet,
  logAIAnalysis 
} from '@/lib/services/activity-logger'

// Log token scan
await logTokenScan(userId, userEmail, tokenAddress, 'ethereum', 45)

// Log payment
await logPayment(userId, userEmail, 'payment_completed', 29.00, 'USDC')

// Log wallet connection
await logWallet(userId, userEmail, 'wallet_connected', walletAddress, 'Phantom')

// Log AI analysis
await logAIAnalysis(userId, userEmail, tokenAddress, 'risk-analysis', 1)
```

### 4. Automatic 30-Day Cleanup
Logs are automatically deleted after 30 days via cron job.

## Setup

### 1. Environment Variables
Add to `.env.local`:
```bash
CRON_SECRET=your-secure-random-string
```

### 2. Firestore Rules
Already configured in `firestore.rules`:
```
match /activity_logs/{logId} {
  allow read: if isAdmin();
  allow write: if request.auth != null;
}
```

### 3. Cron Job Setup

#### Option A: Vercel Cron (Recommended)
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-logs",
    "schedule": "0 2 * * *"
  }]
}
```

#### Option B: GitHub Actions
Create `.github/workflows/cleanup-logs.yml`:
```yaml
name: Cleanup Old Logs
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cleanup
        run: |
          curl -X POST https://your-domain.com/api/cron/cleanup-logs \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Option C: External Cron Service
Use services like:
- cron-job.org
- EasyCron
- AWS EventBridge

Configure to call:
```
POST https://your-domain.com/api/cron/cleanup-logs
Header: Authorization: Bearer YOUR_CRON_SECRET
```

### 4. Manual Cleanup
Trigger cleanup manually via API:
```bash
curl -X POST https://your-domain.com/api/cron/cleanup-logs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Admin Dashboard

### Viewing Logs
1. Navigate to Admin Dashboard
2. Click "Activity Logs" tab
3. Filter by action type
4. View user activities with timestamps

### Log Data Structure
```typescript
{
  userId: string
  userEmail: string
  action: ActivityAction
  details: string
  metadata: Record<string, any>
  timestamp: Timestamp
  userAgent: string
}
```

## Modern Floating Sidebar
The admin dashboard now features a modern floating sidebar with:
- Glassmorphism effect (backdrop-blur-xl)
- Active state indicators (white background + left border)
- Hover states
- Proper spacing and padding
- Fixed positioning with proper margins

## Best Practices

### 1. Log Important Actions
Always log:
- Authentication events
- Payment transactions
- Data modifications
- Feature usage
- Security-related actions

### 2. Include Metadata
Provide context in metadata:
```typescript
await logActivity(userId, email, 'token_scan', 'Scanned token', {
  tokenAddress,
  chain,
  riskScore,
  scanDuration: 1234
})
```

### 3. Don't Log Sensitive Data
Never log:
- Passwords
- API keys
- Private keys
- Credit card numbers
- Personal identification numbers

### 4. Handle Errors Gracefully
Logging failures shouldn't break the app:
```typescript
try {
  await logActivity(...)
} catch (error) {
  console.error('Failed to log activity:', error)
  // Continue with main flow
}
```

## Monitoring

### Check Log Count
```typescript
const logsRef = db.collection('activity_logs')
const snapshot = await logsRef.count().get()
console.log('Total logs:', snapshot.data().count)
```

### Check Old Logs
```typescript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const oldLogs = await db.collection('activity_logs')
  .where('timestamp', '<', thirtyDaysAgo)
  .count()
  .get()

console.log('Logs to cleanup:', oldLogs.data().count)
```

## Troubleshooting

### Logs Not Appearing
1. Check Firestore rules
2. Verify user is authenticated
3. Check browser console for errors
4. Verify Firebase configuration

### Cleanup Not Running
1. Verify cron job is configured
2. Check CRON_SECRET matches
3. Review cron job logs
4. Test manual trigger

### Performance Issues
If you have millions of logs:
1. Increase batch size (max 500)
2. Run cleanup more frequently
3. Add composite indexes
4. Consider archiving instead of deleting

## Future Enhancements
- Export logs to CSV
- Real-time activity feed
- Activity analytics dashboard
- Anomaly detection
- User behavior insights
