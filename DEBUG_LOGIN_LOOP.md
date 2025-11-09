# 🐛 Login Loop Debugging Guide

## Issue: Stuck in Login Loop

The app keeps redirecting between `/login` and `/dashboard` infinitely.

---

## Root Causes & Fixes Applied

### ✅ Fix 1: Added Redirect Guard to Dashboard Router
**File:** `app/dashboard/page.tsx`

**Problem:** Dashboard was redirecting on every auth state change
**Solution:** Added `hasRedirected` flag to prevent multiple redirects

```typescript
const [hasRedirected, setHasRedirected] = useState(false)

useEffect(() => {
  if (loading || hasRedirected) return // ← Prevents re-redirecting
  // ... redirect logic
}, [user, userProfile, loading, router, hasRedirected])
```

### ✅ Fix 2: Added Auto-Redirect from Login Page
**File:** `app/login/page.tsx`

**Problem:** Login page didn't check if user was already logged in
**Solution:** Added useEffect to redirect logged-in users

```typescript
useEffect(() => {
  if (!authLoading && user && userProfile) {
    if (userProfile.plan === 'PREMIUM') {
      router.replace('/premium')
    } else {
      router.replace('/free-dashboard')
    }
  }
}, [user, userProfile, authLoading, router])
```

### ✅ Fix 3: Added Delay After Login
**Problem:** Router redirected before auth context finished updating
**Solution:** Added 500ms delay to allow state to update

```typescript
await signInWithEmailAndPassword(auth, email, password)
setTimeout(() => {
  router.push("/dashboard")
}, 500)
```

### ✅ Fix 4: Changed to `router.replace()` instead of `router.push()`
**Why:** `replace()` doesn't add to browser history, preventing back button loops

---

## Testing Steps

### 1. Check Browser Console Logs

Open browser DevTools (F12) and look for these logs:

**Dashboard Router logs:**
```
[Dashboard Router] Auth state: { user: true, userProfile: {...}, loading: false }
[Dashboard Router] Free user, redirecting to /free-dashboard
```

**Login page logs:**
```
[Login] User already logged in, redirecting
```

### 2. Expected Flow

**Not Logged In:**
1. Visit `/dashboard`
2. See: `[Dashboard Router] No user, redirecting to login`
3. Redirected to `/login`
4. See login form

**Already Logged In:**
1. Visit `/login`
2. See: `[Login] User already logged in, redirecting`
3. Redirected to `/free-dashboard` or `/premium`

**After Login:**
1. Submit login form
2. Wait 500ms for auth to update
3. Redirect to `/dashboard`
4. Dashboard router checks plan
5. Final redirect to `/free-dashboard` or `/premium`

---

## Debug Checklist

If loop still occurs, check:

- [ ] **Browser console** - Are there continuous redirect logs?
- [ ] **Auth state** - Is `loading` stuck at `true`?
- [ ] **User profile** - Is `userProfile` null even after login?
- [ ] **Network tab** - Are there failed Firestore requests?
- [ ] **Firebase rules** - Are rules deployed correctly?

---

## Manual Debug

Add this to browser console (F12) while on the page:

```javascript
// Check auth state
const authContext = document.querySelector('[data-auth-debug]')
console.log('Auth Context:', {
  user: window.localStorage.getItem('firebase:authUser'),
  loading: document.body.dataset.authLoading,
})

// Watch for redirect loops
let redirectCount = 0
const originalPush = window.history.pushState
window.history.pushState = function(...args) {
  redirectCount++
  console.log(`Redirect #${redirectCount}:`, args[2])
  if (redirectCount > 5) {
    console.error('LOOP DETECTED! Stopping redirects.')
    return
  }
  return originalPush.apply(this, args)
}
```

---

## Common Symptoms & Solutions

### Symptom: Infinite redirect between `/login` and `/dashboard`

**Cause:** Auth context `loading` never becomes `false`

**Fix:**
1. Check `contexts/auth-context.tsx`
2. Verify `setLoading(false)` is called in `finally` block
3. Check browser console for Firebase errors

---

### Symptom: Stuck on "Redirecting..." screen

**Cause:** `hasRedirected` flag blocks all navigation

**Fix:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Refresh page (Ctrl+F5)
3. Check console logs for actual redirect attempt

---

### Symptom: Redirects to login after successful login

**Cause:** User profile not created in Firestore

**Fix:**
1. Check Firebase Console → Firestore → `users` collection
2. Verify your user ID has a document
3. If missing, run:
   ```typescript
   import { createUserProfile } from '@/lib/services/firestore-service'
   await createUserProfile(user.uid, user.email, user.displayName)
   ```

---

### Symptom: "Missing or insufficient permissions" error

**Cause:** Firestore security rules not deployed

**Fix:**
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Or in Firebase Console → Firestore → Rules → Publish
3. Wait 1-2 minutes for rules to propagate

---

## Emergency Reset

If completely stuck:

```typescript
// In browser console:
// 1. Clear all local storage
localStorage.clear()

// 2. Clear session storage
sessionStorage.clear()

// 3. Sign out from Firebase
firebase.auth().signOut()

// 4. Hard refresh
location.reload(true)
```

Then try logging in again.

---

## Next Steps

1. ✅ Check browser console for logs
2. ✅ Verify user profile exists in Firestore
3. ✅ Test login flow from incognito window
4. ✅ Check that Firestore rules are deployed
5. ⏳ If still looping, share console logs

---

**Last Updated:** November 7, 2025
