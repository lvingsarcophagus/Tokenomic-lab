# Activity Logging Integration Summary

## Problem
Activity logs only showed user login and logout events. Most user actions were not being tracked.

## Solution
Integrated comprehensive activity logging throughout the application to track all major user actions.

## Activities Now Being Logged

### 1. ✅ Authentication Events
**Location:** `contexts/auth-context.tsx`, `components/navbar.tsx`, `app/signup/page.tsx`

- **user_login** - When user logs in (tracked in auth context)
- **admin_login** - When admin logs in (tracked in auth context)
- **user_logout** - When user logs out (tracked in navbar)
- **user_signup** - When new user signs up (already implemented)

### 2. ✅ Token Analysis
**Location:** `app/dashboard/page.tsx`

- **token_scan** - Every time a user scans a token
  - Includes: token address, chain, risk score
  - Logged after successful analysis

### 3. ✅ Credit System
**Location:** `app/api/credits/deduct/route.ts`, `app/api/credits/add/route.ts`

- **credits_used** - When user spends credits
  - Includes: cost, feature, reason, balance before/after
- **credits_purchased** - When user buys credits
  - Includes: amount, credits, transaction ID, balance before/after

## Files Modified

### 1. `app/dashboard/page.tsx`
```typescript
// Added import
import { logTokenScan } from '@/lib/services/activity-logger'

// Added logging after successful scan
if (user && userProfile?.email) {
  logTokenScan(
    user.uid,
    userProfile.email,
    data.address,
    data.chainInfo?.chainName || 'unknown',
    riskScore
  ).catch(err => console.error('Failed to log scan:', err))
}
```

### 2. `contexts/auth-context.tsx`
```typescript
// Added import
import { logAuth } from '@/lib/services/activity-logger'

// Added logging on login
if (user.email) {
  const isAdmin = profile.role === 'admin'
  logAuth(user.uid, user.email, isAdmin ? 'admin_login' : 'user_login')
    .catch(err => console.error('Failed to log login:', err))
}
```

### 3. `app/api/credits/deduct/route.ts`
```typescript
// Added activity logging after credit deduction
await adminDb.collection('activity_logs').add({
  userId,
  userEmail: userData?.email || 'unknown',
  action: 'credits_used',
  details: `Used ${cost} credits for ${reason || feature}`,
  metadata: {
    cost,
    feature,
    reason,
    tokenAddress,
    balanceBefore: currentCredits,
    balanceAfter: currentCredits - cost
  },
  timestamp: FieldValue.serverTimestamp(),
  userAgent: request.headers.get('user-agent') || 'Unknown'
})
```

### 4. `app/api/credits/add/route.ts`
```typescript
// Added activity logging after credit purchase
await db.collection('activity_logs').add({
  userId,
  userEmail,
  action: 'credits_purchased',
  details: `Purchased ${credits} credits for $${amount}`,
  metadata: {
    amount,
    credits,
    transactionId,
    balanceBefore: currentCredits,
    balanceAfter: currentCredits + credits
  },
  timestamp: FieldValue.serverTimestamp(),
  userAgent: request.headers.get('user-agent') || 'Unknown'
})
```

## Activity Log Structure

Each log entry contains:
```typescript
{
  userId: string           // User's Firebase UID
  userEmail: string        // User's email
  action: ActivityAction   // Type of action (see below)
  details: string          // Human-readable description
  metadata: object         // Additional context data
  timestamp: Timestamp     // When it happened
  userAgent: string        // Browser/device info
}
```

## Activity Types Currently Tracked

1. **user_login** - User authentication
2. **admin_login** - Admin authentication
3. **user_logout** - User signs out
4. **user_signup** - New user registration
5. **token_scan** - Token analysis performed
6. **credits_used** - Credits spent on features
7. **credits_purchased** - Credits bought via x402

## Additional Activities Ready to Track

The activity logger service supports 30+ activity types. To add more tracking:

### Watchlist Actions
```typescript
import { logWatchlist } from '@/lib/services/activity-logger'

// When adding to watchlist
await logWatchlist(userId, email, 'watchlist_add', tokenAddress, tokenSymbol)

// When removing from watchlist
await logWatchlist(userId, email, 'watchlist_remove', tokenAddress, tokenSymbol)
```

### Payment Activities
```typescript
import { logPayment } from '@/lib/services/activity-logger'

await logPayment(userId, email, 'payment_completed', 29.00, 'USDC', {
  subscriptionId: 'sub_123',
  plan: 'PREMIUM'
})
```

### Wallet Activities
```typescript
import { logWallet } from '@/lib/services/activity-logger'

await logWallet(userId, email, 'wallet_connected', walletAddress, 'Phantom')
```

### AI Analysis
```typescript
import { logAIAnalysis } from '@/lib/services/activity-logger'

await logAIAnalysis(userId, email, tokenAddress, 'risk-analysis', 1)
```

### Page Views (Automatic)
```typescript
import { useActivityTracker } from '@/lib/hooks/use-activity-tracker'

export default function MyPage() {
  const { trackFeature } = useActivityTracker('Page Name')
  
  // Automatically logs page view on mount
  // Manually track features:
  const handleClick = () => {
    trackFeature('special-feature', { metadata: 'value' })
  }
  
  return <div>...</div>
}
```

## Viewing Activity Logs

### Admin Dashboard
1. Navigate to Admin Dashboard
2. Click "Activity Logs" tab
3. View all user activities with filters
4. Filter by action type
5. Search by user email

### Firestore Console
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `activity_logs` collection
4. View raw log entries

## Testing

### Verify Logging Works
1. **Login:** Check logs show user_login
2. **Scan Token:** Check logs show token_scan with address
3. **Buy Credits:** Check logs show credits_purchased
4. **Use Credits:** Check logs show credits_used
5. **Logout:** Check logs show user_logout

### Check Log Data
```typescript
// In browser console after action
const logs = await db.collection('activity_logs')
  .where('userId', '==', user.uid)
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get()

logs.docs.forEach(doc => console.log(doc.data()))
```

## Performance Considerations

1. **Non-blocking:** All logging is async and doesn't block user actions
2. **Error handling:** Logging failures don't break the app
3. **Batch operations:** Consider batching for high-volume actions
4. **Automatic cleanup:** Logs older than 30 days are auto-deleted

## Future Enhancements

### High Priority
- [ ] Add logging to watchlist add/remove
- [ ] Add logging to wallet connect/disconnect
- [ ] Add logging to profile updates
- [ ] Add logging to settings changes

### Medium Priority
- [ ] Add logging to AI analysis requests
- [ ] Add logging to PDF exports
- [ ] Add logging to portfolio audits
- [ ] Add page view tracking with hook

### Low Priority
- [ ] Add logging to search queries
- [ ] Add logging to filter changes
- [ ] Add logging to chart interactions
- [ ] Add logging to notification actions

## Troubleshooting

### Logs Not Appearing
1. Check Firestore rules allow writes to `activity_logs`
2. Verify user is authenticated
3. Check browser console for errors
4. Verify Firebase configuration

### Missing User Email
- Ensure `userProfile?.email` is available
- Fallback to `user.email` if needed
- Use 'unknown' as last resort

### Duplicate Logs
- Check if logging is called multiple times
- Verify component isn't re-rendering unnecessarily
- Add debouncing if needed

## Best Practices

1. **Always include context:** Add relevant metadata
2. **Use descriptive details:** Make logs human-readable
3. **Handle errors gracefully:** Don't break app if logging fails
4. **Be consistent:** Use standard activity types
5. **Respect privacy:** Don't log sensitive data (passwords, keys, etc.)
