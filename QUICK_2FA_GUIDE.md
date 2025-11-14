# 🔐 Quick 2FA Setup Guide (3 Minutes)

## For Admin Users

### Step 1: Go to Settings
```
1. Login to admin panel
2. Click "Settings" tab
3. Look for green card: "🔐 TWO-FACTOR AUTHENTICATION"
```

### Step 2: Download Authenticator App
```
📱 Choose one:
   • Google Authenticator (recommended for beginners)
   • Microsoft Authenticator
   • Authy
   • 1Password
   • Bitwarden
```

### Step 3: Scan QR Code
```
1. Open authenticator app
2. Tap "+" button
3. Select "Scan QR Code"
4. Point camera at QR code on screen
5. Account added automatically! ✅
```

### Step 4: Enable 2FA
```
1. App now shows 6-digit code
2. Enter code in verification field
3. Click "ENABLE 2FA"
4. See success message ✅
```

### Step 5: Test It
```
1. Logout
2. Login with email/password
3. 2FA modal appears
4. Enter code from app
5. Access granted! 🎉
```

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD → SETTINGS TAB                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  🔐 TWO-FACTOR AUTHENTICATION                           │
│  ┌───────────────┐                                      │
│  │   QR CODE     │  ← Scan this with your app          │
│  │   ▓▓▓▓▓▓▓▓    │                                      │
│  │   ▓▓▓▓▓▓▓▓    │                                      │
│  └───────────────┘                                      │
│                                                          │
│  Secret Key: ABCD EFGH IJKL MNOP  ← Or enter manually  │
│                                                          │
│  [Enter 6-digit code]  [ENABLE 2FA]                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ 2FA ENABLED SUCCESSFULLY!                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  LOGOUT → LOGIN AGAIN                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  🔐 TWO-FACTOR AUTHENTICATION REQUIRED                  │
│                                                          │
│  Enter 6-digit code from your authenticator app:        │
│  [______]                                               │
│                                                          │
│  [VERIFY]  [CANCEL]                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ ACCESS GRANTED - ADMIN DASHBOARD                    │
└─────────────────────────────────────────────────────────┘
```

---

## Authenticator App Setup

### Google Authenticator (Simplest)
```
1. Download from App Store/Play Store
2. Open app (no account needed)
3. Tap "+" at bottom right
4. Select "Scan a QR code"
5. Point at screen
6. Done! ✅
```

### Microsoft Authenticator
```
1. Download from App Store/Play Store
2. Open app
3. Tap "+" at top right
4. Select "Other account (Google, Facebook, etc.)"
5. Scan QR code
6. Done! ✅
```

### Authy (Has Cloud Backup)
```
1. Download from App Store/Play Store
2. Create Authy account
3. Tap "+" button
4. Select "Scan QR Code"
5. Point at screen
6. Done! ✅
```

---

## What You'll See

### In Authenticator App:
```
┌─────────────────────────┐
│ Tokenomics Lab          │
│ admin@example.com       │
│                         │
│      123 456            │  ← 6-digit code
│                         │
│ ⏱️ 28 seconds left      │  ← Countdown
└─────────────────────────┘
```

### On Login:
```
┌─────────────────────────────────────┐
│  🔐 TWO-FACTOR AUTHENTICATION       │
│                                     │
│  Enter code from your app:          │
│  ┌─────────────────────────────┐   │
│  │  1  2  3  4  5  6           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [VERIFY]  [CANCEL]                │
└─────────────────────────────────────┘
```

---

## Important Notes

✅ **Save your secret key** - Write it down or save in password manager
✅ **Code changes every 30 seconds** - Don't panic, just wait for next one
✅ **Each code works once** - Can't reuse old codes
✅ **Phone time must be accurate** - Set to automatic
✅ **Works offline** - No internet needed for codes

---

## Troubleshooting

### Code not working?
```
1. Check phone time is automatic
2. Wait for next code
3. Make sure you're using correct account
```

### QR code won't scan?
```
1. Use manual entry instead
2. Copy secret key from screen
3. Enter in app manually
```

### Lost phone?
```
1. Use saved secret key
2. Enter in new device
3. Or contact admin to disable 2FA
```

---

## Security Tips

🔒 **DO:**
- Save secret key in secure place
- Use strong password + 2FA
- Enable 2FA on all admin accounts
- Keep authenticator app updated

❌ **DON'T:**
- Share secret key with anyone
- Screenshot QR code and save in cloud
- Use SMS-based 2FA (less secure)
- Disable 2FA unless necessary

---

**You're all set! Your admin panel is now ultra-secure! 🚀🔒**
