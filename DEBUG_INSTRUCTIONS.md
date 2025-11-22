# Debug Instructions - Find Out Why It's Not Working

## I've Added Debug Logging

The dashboard now has extensive console logging. Here's what to do:

### Step 1: Start Dev Server
```bash
pnpm dev
```

### Step 2: Open Browser Console
1. Go to http://localhost:3000/premium/dashboard
2. Press F12 to open DevTools
3. Go to Console tab
4. Clear the console (trash icon)

### Step 3: Scan a Token
1. Click "SCAN TOKEN"
2. Search for "BONK" or paste a Solana address
3. Wait for scan to complete

### Step 4: Check Console Output

You should see these logs in order:

#### 1. Premium Status Check
```
🔍 PREMIUM STATUS: {
  userProfile: {...},
  plan: "PREMIUM",  // ← Should be "PREMIUM"
  isPremium: true,  // ← Should be true
  user: "your@email.com"
}
```

**If `isPremium: false`** → Your user plan is not set correctly in Firestore

#### 2. Data Load Trigger
```
🔍 DATA LOAD TRIGGER: {
  isPremium: true,
  hasAddress: true,  // ← Should be true
  address: "0x123...",  // ← Should be a valid address
  willLoad: true  // ← Should be true
}
```

**If `willLoad: false`** → Either not premium or no valid address

#### 3. Loading Confirmation
```
✅ Loading historical data and insights...
```

**If you see `❌ Not loading data`** → Check the reason in the log

#### 4. Historical Data Loading
```
📊 [loadHistoricalData] Called with: {
  address: "0x123...",
  selectedTimeframe: "30D"
}
```

**If you don't see this** → The function isn't being called

#### 5. Insights Data Loading
```
💡 [loadInsightData] Called with: {
  address: "0x123..."
}
```

**If you don't see this** → The function isn't being called

### Step 5: Check Network Tab

Switch to Network tab in DevTools:

**You should see these API calls:**
- `/api/token/history?address=...&type=risk&timeframe=30D`
- `/api/token/history?address=...&type=price&timeframe=30D`
- `/api/token/history?address=...&type=holders&timeframe=30D`
- `/api/token/history?address=...&type=volume&timeframe=30D`
- `/api/token/history?address=...&type=transactions&timeframe=30D`
- `/api/token/history?address=...&type=whales&timeframe=30D`
- `/api/token/insights?address=...&type=sentiment`
- `/api/token/insights?address=...&type=security`
- `/api/token/insights?address=...&type=holders`

**If these are missing** → The functions aren't making API calls

**If these show 404/500 errors** → API endpoints have issues

## Common Issues & What Console Will Show

### Issue 1: Not Premium
**Console shows:**
```
🔍 PREMIUM STATUS: { isPremium: false, plan: "FREE" }
❌ Not loading data: { reason: 'Not premium' }
```

**Fix:** Update user plan in Firestore to "PREMIUM"

### Issue 2: Invalid Address
**Console shows:**
```
🔍 DATA LOAD TRIGGER: { hasAddress: false, address: "N/A" }
⚠️ [loadHistoricalData] Skipping - invalid address: N/A
```

**Fix:** Token scan isn't setting a valid address

### Issue 3: Functions Not Called
**Console shows:**
```
🔍 DATA LOAD TRIGGER: { willLoad: true }
```
But no `📊 [loadHistoricalData]` or `💡 [loadInsightData]` logs

**Fix:** Functions exist but aren't executing - check for errors

### Issue 4: API Calls Failing
**Console shows:**
```
📊 [loadHistoricalData] Called with: {...}
💡 [loadInsightData] Called with: {...}
```
But Network tab shows 404 errors

**Fix:** API endpoints not responding - restart dev server

## What to Share

After following these steps, share:

1. **Screenshot of Console** showing all the 🔍 📊 💡 logs
2. **Screenshot of Network tab** showing API calls (or lack thereof)
3. **Tell me which step fails** - which log do you NOT see?

## Quick Tests

### Test 1: Is Premium Check Working?
Look for: `🔍 PREMIUM STATUS: { isPremium: true }`

### Test 2: Is Address Valid?
Look for: `🔍 DATA LOAD TRIGGER: { hasAddress: true, address: "0x..." }`

### Test 3: Are Functions Called?
Look for: `📊 [loadHistoricalData]` and `💡 [loadInsightData]`

### Test 4: Are APIs Called?
Check Network tab for `/api/token/history` and `/api/token/insights`

## Expected Full Console Output

```
🔍 PREMIUM STATUS: { isPremium: true, plan: "PREMIUM", user: "..." }
[User scans token]
🔍 DATA LOAD TRIGGER: { isPremium: true, hasAddress: true, willLoad: true }
✅ Loading historical data and insights...
📊 [loadHistoricalData] Called with: { address: "0x123...", selectedTimeframe: "30D" }
💡 [loadInsightData] Called with: { address: "0x123..." }
[Charts] Loading historical data for: 0x123...
[Insights] Loading insights for address: 0x123...
```

If you see all of this, the code is working! If charts still don't show, it's a rendering issue.

---

**Next Step:** Run the dashboard, scan a token, and tell me which log you DON'T see.
