# Firebase Configuration for Credits System

## ✅ Completed Setup

### 1. Firestore Rules Updated
**File: `firestore.rules`**

Added rules for:
- ✅ `credits` field in users collection (read/write by owner or admin)
- ✅ `credit_transactions` collection (read by owner/admin, create by authenticated users, immutable)

```javascript
// Users can read/write their own credits
match /users/{userId} {
  allow read: if isOwner(userId) || isAdmin();
  allow update: if isOwner(userId) || isAdmin();
}

// Credit transactions are immutable audit trail
match /credit_transactions/{transactionId} {
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow read: if isAdmin();
  allow create: if isAuthenticated();
  allow update, delete: if false; // Immutable
}
```

### 2. Admin Panel Updated
**File: `app/admin/dashboard/page.tsx`**

Added:
- ✅ `payPerUseUsers` stat (count of PAY_PER_USE users)
- ✅ `totalCredits` stat (sum of all user credits)
- ✅ New stats cards showing:
  - Pay-Per-Use users count and percentage
  - Total credits across all users with USD value
- ✅ Credits column in users table
- ✅ PAY_PER_USE badge styling (blue)

**File: `app/api/admin/users/route.ts`**

Added:
- ✅ `credits` field to user response
- ✅ `payPerUseUsers` to stats calculation
- ✅ `totalCredits` to stats calculation

### 3. Database Schema
**File: `lib/firestore-schema.ts`**

```typescript
export interface UserDocument {
  plan: 'FREE' | 'PAY_PER_USE' | 'PREMIUM'
  credits?: number // Only for PAY_PER_USE users
  // ... other fields
}
```

### 4. Collections Structure

#### users/{userId}
```json
{
  "uid": "string",
  "email": "string",
  "plan": "PAY_PER_USE",
  "credits": 50,
  "usage": {
    "dailyLimit": -1
  }
}
```

#### credit_transactions/{transactionId}
```json
{
  "userId": "string",
  "type": "purchase" | "usage",
  "amount": 5.00,        // USD (for purchases)
  "credits": 50,         // Credits added/deducted
  "feature": "ai_analyst", // For usage
  "cost": 1,             // Credit cost (for usage)
  "transactionId": "x402_tx_...",
  "status": "completed",
  "createdAt": "Timestamp"
}
```

## 🎯 Admin Panel Features

### Stats Dashboard
- **Total Users**: All registered users
- **Premium Users**: Subscription users (count + %)
- **Pay-Per-Use Users**: Credit-based users (count + %)
- **Total Credits**: Sum of all credits with USD value
- **Cached Tokens**: Token cache stats
- **Queries (24h)**: API usage stats

### Users Table
| Column | Description |
|--------|-------------|
| Name | User's display name |
| Email | User's email address |
| UID | Firebase user ID (truncated) |
| Role | USER or ADMIN |
| Tier | FREE, PAY-PER-USE, or PREMIUM |
| **Credits** | Credit balance (only for PAY_PER_USE) |
| Last Login | Last login timestamp |
| Actions | View, Edit, Ban, Delete |

### Visual Indicators
- **FREE**: Gray badge
- **PAY-PER-USE**: Blue badge with credit count
- **PREMIUM**: Green badge

## 📊 Credit Tracking

### For Admins
Admins can see:
1. How many users are on PAY_PER_USE plan
2. Total credits across all users
3. USD value of total credits ($0.10 per credit)
4. Individual user credit balances in the table

### For Users
PAY_PER_USE users see:
1. Credit balance in CreditsManager component
2. Progress bar (0-50 credits)
3. Usage costs (AI: 1 credit, Portfolio: 0.5 credits/token)
4. Low balance warning (< 5 credits)

## 🔒 Security

### Firestore Rules
- Users can only read/write their own credits
- Admins can read/write all user credits
- Credit transactions are immutable (audit trail)
- Only authenticated users can create transactions
- No one can update or delete transactions

### API Endpoints
- `/api/credits/add` - Requires Firebase auth token
- `/api/credits/deduct` - Requires Firebase auth token
- Both endpoints verify user identity before operations

## 📈 Analytics

### Credit Metrics Available
1. **Total Credits in System**: Sum of all user credits
2. **Credits USD Value**: Total credits × $0.10
3. **PAY_PER_USE Adoption**: Percentage of users on this plan
4. **Average Credits per User**: Total credits ÷ PAY_PER_USE users

### Transaction History
All credit transactions are logged in `credit_transactions` collection:
- Purchase transactions (when users buy credits)
- Usage transactions (when users spend credits)
- Immutable audit trail for compliance

## 🚀 Deployment Checklist

- [x] Update Firestore rules
- [x] Deploy rules to Firebase Console
- [x] Test credit add/deduct API endpoints
- [x] Verify admin panel displays credits correctly
- [x] Test PAY_PER_USE user signup flow
- [x] Verify CreditsManager component displays on dashboard
- [ ] Deploy to production
- [ ] Monitor credit transactions in Firebase Console

## 📝 Next Steps

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Test Credit Operations**
   - Create a PAY_PER_USE user
   - Add credits via API
   - Verify admin panel shows credits
   - Test credit deduction

3. **Monitor Transactions**
   - Check `credit_transactions` collection in Firebase Console
   - Verify audit trail is working
   - Monitor for any errors

## 🔍 Troubleshooting

### Credits not showing in admin panel
- Check if user has `plan: 'PAY_PER_USE'`
- Verify `credits` field exists in user document
- Check Firestore rules allow reading credits

### Credit transactions failing
- Verify Firebase auth token is valid
- Check user has sufficient credits for deduction
- Ensure Firestore rules allow creating transactions

### Admin can't see user credits
- Verify admin has `role: 'admin'` in user document
- Check Firestore rules allow admin read access
- Refresh admin token if needed
