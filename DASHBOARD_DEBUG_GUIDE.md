# Dashboard Not Working - Debug Guide

## Quick Checks

### 1. Check if Dev Server is Running
```bash
pnpm dev
```
Then open: http://localhost:3000/premium/dashboard

### 2. Check Browser Console
Open browser DevTools (F12) and look for errors in Console tab.

Common errors to look for:
- ❌ `Failed to fetch` - API endpoints not responding
- ❌ `userProfile is undefined` - Auth context issue
- ❌ `Cannot read property of undefined` - Data structure mismatch

### 3. Check Network Tab
In DevTools Network tab, after scanning a token:
- Should see: `/api/analyze-token` - Returns token data
- Should see: `/api/token/history` - Returns chart data (6 calls)
- Should see: `/api/token/insights` - Returns insights (3 calls)

If these are missing or failing, that's your issue!

## Common Issues & Fixes

### Issue 1: "Nothing happens when I scan"
**Symptoms**: Click scan, nothing appears

**Debug**:
1. Open Console (F12)
2. Look for errors
3. Check if `setSelectedToken` is being called

**Fix**: Check if you're logged in and have PREMIUM tier
```typescript
// In dashboard, add this temporarily to debug:
console.log('User Profile:', userProfile)
console.log('Is Premium:', isPremium)
console.log('Selected Token:', selectedToken)
```

### Issue 2: "Charts show 'No data available'"
**Symptoms**: Token scans successfully but charts are empty

**Cause**: `loadHistoricalData` not being called or API failing

**Debug**:
```typescript
// Check in browser console:
// Should see: "[Charts] Loading historical data for: ADDRESS"
// Should see: "[Charts] price response: 200"
```

**Fix Options**:

**Option A**: Check if `isPremium` is true
```typescript
// Add to dashboard after line 173:
console.log('🔍 DEBUG isPremium:', isPremium, 'userProfile:', userProfile)
```

**Option B**: Force load data (temporary debug)
```typescript
// Replace line 986-988 with:
if (selectedToken?.address) {
  console.log('🔍 Loading data for:', selectedToken.address)
  loadHistoricalData(selectedToken.address, timeframe)
  loadInsightData(selectedToken.address)
}
```

### Issue 3: "Insights panels show 'No data'"
**Symptoms**: Charts work but insights are empty

**Cause**: `loadInsightData` failing or returning empty

**Debug**: Check Network tab for `/api/token/insights` calls

**Fix**: The API currently returns mock data. Check if API is responding:
```bash
# Test the API directly:
curl http://localhost:3000/api/token/insights?address=0x123&type=sentiment
```

### Issue 4: "Security metrics show UNKNOWN"
**Symptoms**: Security grid shows all UNKNOWN values

**Cause**: `securityData` not being set on `selectedToken`

**Fix**: Check if scan result includes security data
```typescript
// In handleScan function around line 605, add:
console.log('🔍 Security Data:', {
  criticalFlags: result.critical_flags,
  positiveSignals: result.positive_signals,
  securityData: selectedToken.securityData
})
```

## Step-by-Step Debugging

### Step 1: Verify User is Premium
```typescript
// Add after line 173 in dashboard:
useEffect(() => {
  console.log('=== PREMIUM CHECK ===')
  console.log('User:', user?.email)
  console.log('Profile:', userProfile)
  console.log('Plan:', userProfile?.plan)
  console.log('Is Premium:', isPremium)
}, [user, userProfile, isPremium])
```

### Step 2: Verify Token Scan Works
```typescript
// Add in handleScan after setSelectedToken (line 605):
console.log('=== TOKEN SCANNED ===')
console.log('Selected Token:', selectedToken)
console.log('Address:', selectedToken?.address)
console.log('Should load data:', isPremium && selectedToken?.address)
```

### Step 3: Verify Data Loading Triggers
```typescript
// Add at start of loadHistoricalData (around line 820):
console.log('=== LOADING HISTORICAL DATA ===')
console.log('Address:', address)
console.log('Timeframe:', selectedTimeframe)
console.log('Is valid:', address && address !== 'N/A')
```

### Step 4: Verify API Responses
```typescript
// Add in loadHistoricalData after fetch (around line 840):
console.log('=== API RESPONSE ===')
console.log('Type:', type)
console.log('Status:', res.status)
console.log('Data:', data)
```

## Quick Fix: Force Enable Everything

If you just want to see it working, temporarily bypass the premium check:

```typescript
// Line 986, change from:
if (isPremium && selectedToken?.address) {

// To:
if (selectedToken?.address) {
```

This will load charts/insights for all users (remove after debugging).

## Check API Endpoints

### Test History API
```bash
# Should return mock data:
curl http://localhost:3000/api/token/history?address=0x123&type=price&timeframe=30D
```

Expected response:
```json
{
  "success": true,
  "data": [
    {"date": "...", "value": 123, "timestamp": 123456}
  ]
}
```

### Test Insights API
```bash
curl http://localhost:3000/api/token/insights?address=0x123&type=sentiment
```

Expected response:
```json
{
  "success": true,
  "data": {
    "bullish": 45,
    "neutral": 30,
    "bearish": 25,
    "overall": "BULLISH"
  }
}
```

## Common Fixes

### Fix 1: User Not Premium
**Problem**: `userProfile?.plan !== 'PREMIUM'`

**Solution**: Update user in Firestore:
1. Go to Firebase Console
2. Firestore Database
3. Find your user document
4. Set `plan: "PREMIUM"`

### Fix 2: selectedToken.address is Invalid
**Problem**: Address is 'N/A' or undefined

**Solution**: Check token scan result structure
```typescript
// Ensure address is set correctly in setSelectedToken
address: data.priceData?.address || (data as any).address || searchQuery
```

### Fix 3: APIs Not Responding
**Problem**: 404 or 500 errors on API calls

**Solution**: 
1. Check if API files exist:
   - `app/api/token/history/route.ts` ✅
   - `app/api/token/insights/route.ts` ✅
2. Restart dev server: `pnpm dev`
3. Clear Next.js cache: `rm -rf .next`

### Fix 4: Data Not Updating
**Problem**: Old data showing after new scan

**Solution**: Clear state before scan
```typescript
// In handleScan, ensure these are called:
setSelectedToken(null)
setHistoricalData({ risk: [], price: [], ... })
setInsightData({ sentiment: null, security: null, holders: null })
```

## Enable Debug Mode

Add this at the top of the dashboard component:

```typescript
const DEBUG = true // Set to false in production

useEffect(() => {
  if (DEBUG) {
    console.log('=== DASHBOARD STATE ===')
    console.log('isPremium:', isPremium)
    console.log('selectedToken:', selectedToken)
    console.log('historicalData:', historicalData)
    console.log('insightData:', insightData)
    console.log('loadingHistory:', loadingHistory)
    console.log('loadingInsights:', loadingInsights)
  }
}, [isPremium, selectedToken, historicalData, insightData, loadingHistory, loadingInsights])
```

## What Should Happen (Normal Flow)

1. ✅ User scans token
2. ✅ `handleScan()` calls `/api/analyze-token`
3. ✅ `setSelectedToken()` is called with result
4. ✅ useEffect detects `selectedToken?.address` changed
5. ✅ Checks `isPremium === true`
6. ✅ Calls `loadHistoricalData()` - makes 6 API calls
7. ✅ Calls `loadInsightData()` - makes 3 API calls
8. ✅ Charts render with data
9. ✅ Insights panels render with data

## Still Not Working?

Share these details:
1. Browser console errors (screenshot)
2. Network tab showing API calls (screenshot)
3. Value of `isPremium` (from console.log)
4. Value of `selectedToken?.address` (from console.log)
5. Any error messages in terminal where `pnpm dev` is running

## Quick Test

Run this in browser console after scanning:
```javascript
// Check state
console.log('Premium:', window.location.href.includes('premium'))
console.log('Has token:', document.querySelector('[id="scan-results"]') !== null)

// Force load data (if you have a token scanned)
// This will tell you if the functions work
```

---

**Most Likely Issue**: `isPremium` is false because user plan is not set to 'PREMIUM' in Firestore.

**Quick Fix**: Temporarily change line 986 to bypass premium check, or update user plan in Firebase.
