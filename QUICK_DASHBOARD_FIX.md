# Quick Dashboard Fix - Make It Work Now!

## The Problem

Charts and insights aren't loading because of the premium check on line 986:
```typescript
if (isPremium && selectedToken?.address) {
```

## Quick Fix (Choose One)

### Option 1: Update Your User Plan in Firebase (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database
4. Find the `users` collection
5. Find your user document (by email)
6. Edit the document
7. Set `plan` field to `"PREMIUM"` (with quotes)
8. Save

Now refresh the dashboard and scan a token - it should work!

### Option 2: Temporarily Bypass Premium Check (For Testing)

Edit `app/premium/dashboard/page.tsx` line 986:

**Change from:**
```typescript
if (isPremium && selectedToken?.address) {
```

**Change to:**
```typescript
if (selectedToken?.address) {  // Removed isPremium check
```

Save the file, the page will hot-reload, and charts should work!

⚠️ **Remember to change it back** after testing!

### Option 3: Add Debug Logging

Add this after line 173 to see what's happening:

```typescript
const isPremium = userProfile?.plan === 'PREMIUM'

// ADD THIS:
console.log('🔍 PREMIUM CHECK:', {
  userProfile,
  plan: userProfile?.plan,
  isPremium,
  hasAddress: !!selectedToken?.address
})
```

Then check browser console to see the values.

## Test It Works

1. Make one of the changes above
2. Go to dashboard: http://localhost:3000/premium/dashboard
3. Scan a token (try "BONK" or paste a Solana address)
4. After scan completes, scroll down
5. You should see:
   - ✅ 6 charts with data
   - ✅ 3 insight panels with data
   - ✅ Security metrics showing values

## If Still Not Working

### Check 1: Is Dev Server Running?
```bash
pnpm dev
```

### Check 2: Any Console Errors?
Open browser DevTools (F12) → Console tab
Look for red errors

### Check 3: Are APIs Responding?
Open DevTools → Network tab
After scanning, you should see:
- `/api/token/history` (called 6 times)
- `/api/token/insights` (called 3 times)

If these are missing, the useEffect isn't triggering.

### Check 4: Is selectedToken Set?
Add this temporarily after line 605:
```typescript
setSelectedToken({
  // ... existing code
})

// ADD THIS:
console.log('✅ Selected Token Set:', selectedToken)
```

## Most Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Not logged in | Redirects to login | Log in first |
| Plan not PREMIUM | isPremium = false | Update Firestore or use Option 2 |
| selectedToken.address invalid | Address is 'N/A' | Check scan result |
| APIs not called | No network requests | Check useEffect dependencies |
| APIs return errors | 404/500 in Network tab | Restart dev server |

## Verify Your Setup

Run this in browser console after scanning a token:

```javascript
// Check if everything is loaded
console.log({
  hasPremiumDashboard: window.location.pathname.includes('premium'),
  hasSelectedToken: document.querySelector('[id="scan-results"]') !== null,
  hasCharts: document.querySelectorAll('svg').length > 0
})
```

## Expected Behavior

After scanning a token, you should see:

1. **Token Header** - Name, symbol, risk score ✅
2. **Data Sources Panel** - Shows which APIs used ✅
3. **Risk Overview** - 3-column grid with score/level/confidence ✅
4. **Market Metrics** - 6 metrics in grid ✅
5. **Risk Factors** - 9-10 factors with progress bars ✅
6. **Charts Section** - 6 charts with timeframe selector ✅
7. **Insights Panels** - 3 panels (sentiment, security, holders) ✅

If you see 1-5 but not 6-7, it's the premium check issue!

---

**TL;DR**: Change line 986 from `if (isPremium && selectedToken?.address)` to `if (selectedToken?.address)` and it will work immediately.
