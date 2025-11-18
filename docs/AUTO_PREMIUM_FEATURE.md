# Auto-Premium Feature

## Overview

The Auto-Premium feature allows administrators to automatically grant PREMIUM tier access to all new user signups. This is useful for promotional periods, beta testing, or special campaigns.

## How It Works

### Admin Control

1. **Admin Dashboard** → Navigate to the **Settings** tab
2. **Auto-Premium Toggle** → Located at the top of the settings page
3. **Toggle Switch** → Click to enable/disable the feature

### Visual Indicators

- **ENABLED (Purple)** → Toggle is ON, new signups get PREMIUM
- **DISABLED (Gray)** → Toggle is OFF, new signups get FREE tier

### Status Display

- ✅ **ENABLED** - "All new signups automatically get PREMIUM tier"
- ❌ **DISABLED** - "New signups get FREE tier (normal behavior)"

## Technical Implementation

### Database Structure

**Firestore Collection:** `system/platform_settings`

```json
{
  "autoPremiumEnabled": true,
  "updatedAt": "2025-11-17T...",
  "updatedBy": "admin_uid"
}
```

### API Endpoint

**GET** `/api/admin/auto-premium`
- Returns current setting status
- Requires admin authentication

**POST** `/api/admin/auto-premium`
- Updates the setting
- Requires admin authentication
- Body: `{ "enabled": true/false }`

### Signup Flow

1. User fills out signup form
2. System checks `system/platform_settings` document
3. If `autoPremiumEnabled === true`:
   - User tier set to "PREMIUM"
   - User plan set to "PREMIUM"
   - Daily limit set to 999999
   - Redirected to `/premium/dashboard`
4. If `autoPremiumEnabled === false` or not set:
   - User tier set to "FREE"
   - User plan set to "FREE"
   - Daily limit set to 10
   - Redirected to `/free-dashboard`

### User Metadata

When auto-premium is granted, the user document includes:

```json
{
  "tier": "PREMIUM",
  "plan": "PREMIUM",
  "metadata": {
    "autoPremiumGranted": true,
    "signupSource": "web",
    ...
  }
}
```

## Use Cases

### 1. Promotional Campaigns
Enable auto-premium during marketing campaigns to attract new users with free premium access.

### 2. Beta Testing
Grant all beta testers premium features automatically without manual upgrades.

### 3. Special Events
Offer premium access during product launches, conferences, or special events.

### 4. Partner Programs
Automatically upgrade users from partner referrals or special signup links.

### 5. Early Adopters
Reward early adopters with automatic premium access during initial launch.

## Security

### Authentication Required
- Only users with `role === 'admin'` can access the toggle
- Firebase ID token verification on every request
- Unauthorized attempts return 401/403 errors

### Audit Trail
- Every toggle change is logged with:
  - Timestamp (`updatedAt`)
  - Admin user ID (`updatedBy`)
  - New setting value

### Firestore Security Rules

```javascript
match /system/platform_settings {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Admin Dashboard UI

### Location
**Admin Dashboard** → **Settings Tab** → **Top Section**

### Components
- **Toggle Switch** - Interactive on/off switch
- **Status Badge** - Shows current state (ACTIVE/INACTIVE)
- **Description Text** - Explains current behavior
- **Visual Feedback** - Purple when enabled, gray when disabled

### Accessibility
- Keyboard accessible (Tab + Enter)
- Screen reader friendly
- Loading state during toggle
- Success/error notifications

## Monitoring

### Admin View
- Current status visible in Settings tab
- Real-time toggle updates
- Toast notifications on changes

### User Impact
- New signups immediately affected
- Existing users unaffected
- No retroactive tier changes

## Best Practices

### When to Enable
✅ During promotional campaigns
✅ For beta testing periods
✅ During special events
✅ For partner programs
✅ For early adopter rewards

### When to Disable
❌ After promotion ends
❌ When returning to normal operations
❌ If premium features are limited
❌ During system maintenance
❌ If costs become unsustainable

## Troubleshooting

### Toggle Not Working
1. Check admin authentication
2. Verify Firebase Admin SDK is configured
3. Check browser console for errors
4. Verify Firestore security rules

### New Users Not Getting Premium
1. Check toggle is enabled in admin dashboard
2. Verify `system/platform_settings` document exists
3. Check signup page console logs
4. Verify user document in Firestore

### Toggle State Not Persisting
1. Check Firestore write permissions
2. Verify admin authentication token
3. Check network requests in browser DevTools
4. Verify Firebase Admin credentials

## API Examples

### Check Current Setting (Admin)

```typescript
const token = await auth.currentUser.getIdToken()
const response = await fetch('/api/admin/auto-premium', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const data = await response.json()
console.log(data.autoPremiumEnabled) // true or false
```

### Enable Auto-Premium (Admin)

```typescript
const token = await auth.currentUser.getIdToken()
const response = await fetch('/api/admin/auto-premium', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ enabled: true })
})
const data = await response.json()
console.log(data.message) // "Auto-premium enabled successfully"
```

### Disable Auto-Premium (Admin)

```typescript
const token = await auth.currentUser.getIdToken()
const response = await fetch('/api/admin/auto-premium', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ enabled: false })
})
const data = await response.json()
console.log(data.message) // "Auto-premium disabled successfully"
```

## Future Enhancements

### Potential Features
- [ ] Time-based auto-disable (set expiration date)
- [ ] Usage limits for auto-premium users
- [ ] Email notification to admin on toggle
- [ ] Analytics dashboard for auto-premium signups
- [ ] Conditional auto-premium (based on referral source)
- [ ] Tiered auto-premium (different levels)
- [ ] Auto-premium for specific domains/emails
- [ ] Bulk upgrade existing users option

## Related Files

- `app/api/admin/auto-premium/route.ts` - API endpoint
- `app/admin/dashboard/page.tsx` - Admin UI toggle
- `app/signup/page.tsx` - Signup logic with auto-premium check
- `lib/firebase-admin.ts` - Firebase Admin SDK setup

## Support

For issues or questions about the auto-premium feature:
- Check admin dashboard Settings tab
- Review Firestore `system/platform_settings` document
- Check browser console for errors
- Contact: nayanjoshymaniyathjoshy@gmail.com

---

**Last Updated:** November 17, 2025
**Feature Status:** ✅ Active and Production-Ready
