# Troubleshooting AI Features

## Problem: AI Meme Detection and Summary Not Working

### Step 1: Verify GROQ_API_KEY is Set

**Check `.env.local` file:**
```bash
# Open .env.local and verify this line exists:
```

✅ **CONFIRMED**: Key is in `.env.local`

### Step 2: Restart Dev Server (CRITICAL!)

Environment variables are only loaded when the server starts. You MUST restart:

```bash
# Stop the current server
# Press Ctrl+C in the terminal

# Start it again
pnpm dev
```

**Why?** Node.js reads `.env.local` only at startup. Adding the key while server is running won't work.

### Step 3: Test Groq API Directly

Run the test script:

```bash
node scripts/test-groq-api.js
```

**Expected Output:**
```
🧪 Testing Groq API Connection...

1. Checking API Key:
   - Exists: true
   - Length: 56
   - Starts with: gsk_d2RK3R...

2. Initializing Groq Client...
   ✅ Client initialized successfully

3. Testing Meme Token Detection...
   ✅ API call successful

4. Response:
{
  "classification": "MEME_TOKEN",
  "confidence": 95,
  "reasoning": "..."
}

5. Parsing JSON...
   ✅ JSON parsed successfully

6. Classification Result:
   - Type: MEME_TOKEN
   - Confidence: 95%
   - Reasoning: ...

✅ All tests passed! Groq API is working correctly.
```

**If this fails:**
- API key is invalid → Get new key from https://console.groq.com/keys
- Network issue → Check internet connection
- Rate limit → Wait a few minutes

### Step 4: Check Server Logs

After restarting and scanning a token, check terminal for:

```
🤖 [AI] Detecting meme token for PEPE...
🤖 [AI] GROQ_API_KEY exists: true
✓ [AI] Classification: MEME (95% confident)
✓ [AI] Reasoning: ...
```

**If you see:**
```
🤖 [AI] GROQ_API_KEY exists: false
```
→ Server didn't load `.env.local` - restart again!

**If you see:**
```
❌ [AI] Detection failed: ...
```
→ Check the error message for details

### Step 5: Verify User is PREMIUM

AI features are **PREMIUM-only**. Check:

```javascript
// In browser console after login
console.log(userProfile?.plan)
// Should output: "PREMIUM"
```

**If FREE:**
- Upgrade to PREMIUM
- Or test with admin account

### Step 6: Check Metadata is Passed

The analyze-token API needs metadata:

```typescript
{
  "tokenAddress": "0x...",
  "chainId": "1",
  "plan": "PREMIUM",
  "metadata": {
    "tokenName": "Pepe",      // ← Required for AI
    "tokenSymbol": "PEPE"     // ← Required for AI
  }
}
```

**Without metadata**, AI won't run!

### Step 7: Check Browser Console

After scanning, check for errors:

```javascript
// F12 → Console
console.log(riskResult?.aiClassification)
console.log(riskResult?.ai_summary)
```

**Should show:**
```javascript
{
  isMeme: true,
  confidence: 95,
  reasoning: "...",
  classification: "MEME_TOKEN"
}
```

**If undefined:**
- Check server logs for errors
- Verify PREMIUM plan
- Check metadata was passed

## Common Issues & Solutions

### Issue 1: "GROQ_API_KEY not configured"

**Cause**: Server didn't load `.env.local`

**Solution**:
1. Verify key is in `.env.local`
2. Restart dev server
3. Check logs show "GROQ_API_KEY exists: true"

### Issue 2: "AI detection failed"

**Cause**: API error or rate limit

**Solution**:
1. Run test script: `node scripts/test-groq-api.js`
2. Check error message
3. Wait if rate limited
4. Verify API key is valid

### Issue 3: "No AI summary showing"

**Cause**: User is FREE plan

**Solution**:
1. Upgrade to PREMIUM
2. Or use admin account for testing

### Issue 4: "Classification is cached"

**Cause**: Token was scanned before

**Solution**:
- This is intentional for consistency!
- Use different token to test
- Or clear cache in Firestore

### Issue 5: "Metadata not passed"

**Cause**: Token selected from dropdown without clicking "ANALYZE"

**Solution**:
1. Select token from dropdown
2. **Click "ANALYZE TOKEN" button**
3. Don't expect AI from dropdown alone

## Quick Checklist

- [ ] GROQ_API_KEY in `.env.local`
- [ ] Dev server restarted after adding key
- [ ] Test script passes: `node scripts/test-groq-api.js`
- [ ] User has PREMIUM plan
- [ ] Token metadata (name/symbol) provided
- [ ] "ANALYZE TOKEN" button clicked (not just dropdown)
- [ ] Server logs show "AI Classification" messages
- [ ] Browser console shows `aiClassification` in result

## Still Not Working?

### Debug Mode

Add this to your scan:

```typescript
// In browser console before scanning
localStorage.setItem('debug', 'true')

// Then scan token and check logs
```

### Manual Test

```bash
curl -X POST http://localhost:3000/api/analyze-token \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    "chainId": "1",
    "userId": "test",
    "plan": "PREMIUM",
    "metadata": {
      "tokenName": "Pepe",
      "tokenSymbol": "PEPE"
    }
  }' | jq '.aiClassification, .ai_summary'
```

Should return AI data.

### Check Firestore

If using cache, check Firestore:
1. Go to Firebase Console
2. Open Firestore
3. Check `tokenCache` collection
4. Look for `aiClassification` field

## Contact Support

If still not working after all steps:

1. Share server logs (last 50 lines)
2. Share browser console errors
3. Share test script output
4. Confirm: Server restarted? PREMIUM plan? Metadata passed?

---

**Most Common Fix**: Just restart the dev server! 🔄
