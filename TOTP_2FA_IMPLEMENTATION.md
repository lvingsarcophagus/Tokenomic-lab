# TOTP 2FA Implementation for Admin Panel ✅

## Overview
Complete Two-Factor Authentication (2FA) system using TOTP (Time-based One-Time Password) for admin panel security.

## Files Created

### 1. `lib/totp.ts`
Core TOTP functionality:
- `generateTOTPSecret()` - Creates random 32-character Base32 secret
- `generateTOTPUri()` - Creates otpauth:// URI for QR codes
- `generateTOTP()` - Generates 6-digit TOTP code
- `verifyTOTP()` - Verifies user-entered code (with ±1 time window)
- `enable2FA()` - Enables 2FA for user in Firestore
- `disable2FA()` - Disables 2FA for user
- `has2FAEnabled()` - Checks if user has 2FA enabled
- `get2FASecret()` - Retrieves user's 2FA secret

### 2. `components/two-factor-setup.tsx`
React component for 2FA setup:
- QR code display
- Manual secret key entry
- Code verification
- Success/error handling
- Copy-to-clipboard functionality

## Installation Required

```bash
pnpm add qrcode.react
pnpm add -D @types/qrcode.react
```

## Firestore Schema Updates

Add to `users` collection:
```typescript
{
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  twoFactorEnabledAt: Date
  twoFactorDisabledAt: Date
}
```

## Usage in Admin Panel

### 1. Add to Profile/Settings Page

```tsx
import TwoFactorSetup from '@/components/two-factor-setup'

// In your admin profile page
<TwoFactorSetup />
```

### 2. Add 2FA Check to Login

```typescript
import { has2FAEnabled, get2FASecret, verifyTOTP } from '@/lib/totp'

// After successful email/password login
const needs2FA = await has2FAEnabled(user.uid)

if (needs2FA) {
  // Show 2FA code input
  const userCode = prompt('Enter 2FA code')
  const secret = await get2FASecret(user.uid)
  
  if (secret) {
    const isValid = await verifyTOTP(secret, userCode)
    
    if (!isValid) {
      // Deny access
      await signOut(auth)
      throw new Error('Invalid 2FA code')
    }
  }
}

// Continue with login
```

### 3. Create 2FA Login Component

```tsx
'use client'

import { useState } from 'react'
import { verifyTOTP, get2FASecret } from '@/lib/totp'

export default function TwoFactorLogin({ userId, onSuccess, onError }) {
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const secret = await get2FASecret(userId)
      if (!secret) {
        onError('2FA not configured')
        return
      }

      const isValid = await verifyTOTP(secret, code)
      if (isValid) {
        onSuccess()
      } else {
        onError('Invalid code')
      }
    } catch (error) {
      onError('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-mono text-xl">ENTER 2FA CODE</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="w-full bg-black border border-white/30 text-white px-4 py-3 font-mono text-lg text-center"
        maxLength={6}
      />
      <button
        onClick={handleVerify}
        disabled={verifying || code.length !== 6}
        className="w-full px-6 py-3 bg-white text-black font-mono"
      >
        {verifying ? 'VERIFYING...' : 'VERIFY'}
      </button>
    </div>
  )
}
```

## Compatible Authenticator Apps

- ✅ Google Authenticator (iOS/Android)
- ✅ Authy (iOS/Android/Desktop)
- ✅ Microsoft Authenticator
- ✅ 1Password
- ✅ LastPass Authenticator
- ✅ Duo Mobile
- ✅ Any TOTP-compatible app

## Security Features

1. **Time-based**: Codes expire every 30 seconds
2. **Window tolerance**: Accepts codes from ±30 seconds (prevents clock drift issues)
3. **Secure storage**: Secrets stored encrypted in Firestore
4. **No SMS**: Uses cryptographic TOTP (more secure than SMS)
5. **Standard compliant**: RFC 6238 TOTP implementation

## Implementation Steps

### Step 1: Install Dependencies
```bash
pnpm add qrcode.react
```

### Step 2: Update Firestore Schema
Add 2FA fields to user documents (see schema above)

### Step 3: Add to Admin Profile
```tsx
// app/admin/profile/page.tsx or app/profile/page.tsx
import TwoFactorSetup from '@/components/two-factor-setup'

export default function ProfilePage() {
  return (
    <div>
      <h1>Security Settings</h1>
      <TwoFactorSetup />
    </div>
  )
}
```

### Step 4: Protect Admin Routes
```tsx
// middleware.ts or in admin layout
import { has2FAEnabled } from '@/lib/totp'

export async function checkAdminAccess(userId: string) {
  const needs2FA = await has2FAEnabled(userId)
  
  if (needs2FA) {
    // Redirect to 2FA verification page
    // Store intended destination
    // After verification, redirect to intended page
  }
}
```

### Step 5: Add 2FA to Login Flow
Update your login component to check for 2FA after email/password authentication.

## Testing

1. **Setup**: Navigate to profile, enable 2FA
2. **Scan QR**: Use Google Authenticator to scan
3. **Verify**: Enter 6-digit code
4. **Login**: Log out and log back in
5. **2FA Prompt**: Should see 2FA code input
6. **Success**: Enter code from app, gain access

## Backup Codes (Optional Enhancement)

Generate backup codes for account recovery:

```typescript
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}

// Store in Firestore
await updateDoc(userRef, {
  backupCodes: generateBackupCodes()
})
```

## Disable 2FA

```tsx
import { disable2FA } from '@/lib/totp'

async function handleDisable2FA() {
  if (confirm('Are you sure you want to disable 2FA?')) {
    await disable2FA(user.uid)
    // Show success message
  }
}
```

## Error Handling

```typescript
try {
  const isValid = await verifyTOTP(secret, code)
  if (!isValid) {
    // Invalid code - show error
    // Allow retry (max 3 attempts?)
  }
} catch (error) {
  // Network error or other issue
  // Show user-friendly error message
}
```

## Rate Limiting (Recommended)

Add rate limiting to prevent brute force:

```typescript
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Track failed attempts in Firestore
await updateDoc(userRef, {
  twoFactorFailedAttempts: increment(1),
  twoFactorLastFailedAt: new Date()
})

// Check if locked out
if (failedAttempts >= MAX_ATTEMPTS) {
  const timeSinceLastFail = Date.now() - lastFailedAt.getTime()
  if (timeSinceLastFail < LOCKOUT_DURATION) {
    throw new Error('Too many failed attempts. Try again later.')
  }
}
```

## Summary

✅ Complete TOTP implementation
✅ QR code generation
✅ Manual secret entry
✅ Code verification
✅ Firestore integration
✅ React components ready
✅ Compatible with all major authenticator apps
✅ Secure and standards-compliant

Just install `qrcode.react` and integrate into your admin panel!
