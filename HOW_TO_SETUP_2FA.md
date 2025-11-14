# 🔐 How to Setup Two-Factor Authentication (2FA)

## What You'll Need

- **A TOTP Authenticator App** (choose one):
  - ✅ Google Authenticator (iOS/Android)
  - ✅ Microsoft Authenticator (iOS/Android)
  - ✅ Authy (iOS/Android/Desktop)
  - ✅ 1Password (with TOTP support)
  - ✅ Bitwarden (with TOTP support)

---

## 📱 Step 1: Download an Authenticator App

1. Open your phone's app store
2. Search for "Google Authenticator" or "Microsoft Authenticator"
3. Download and install the app
4. Open the app (no account needed for Google Authenticator)

---

## 🔑 Step 2: Enable 2FA in Your Profile

### For Regular Users:

1. **Login** to your Tokenomics Lab account
2. Go to **Profile** page (click your name in navbar)
3. Scroll down to **"SECURITY & TWO-FACTOR AUTHENTICATION"** section
4. You'll see:
   - A QR code
   - A secret key (text format)
   - A verification code input

### For Admin Users:

1. **Login** to admin panel at `/admin/login`
2. Go to **Admin Dashboard** 
3. Click **"Settings"** tab
4. Find **"TWO-FACTOR AUTHENTICATION"** section
5. You'll see the same QR code and secret key

---

## 📸 Step 3: Scan the QR Code

### Option A: Scan QR Code (Easiest)

1. Open your authenticator app
2. Tap **"+"** or **"Add Account"**
3. Select **"Scan QR Code"**
4. Point your camera at the QR code on screen
5. The app will automatically add the account

### Option B: Manual Entry (If QR doesn't work)

1. Open your authenticator app
2. Tap **"+"** or **"Add Account"**
3. Select **"Enter Setup Key"** or **"Manual Entry"**
4. Enter these details:
   - **Account Name**: Tokenomics Lab (or your email)
   - **Key**: Copy the secret key from the screen
   - **Type**: Time-based (TOTP)
5. Save the account

---

## ✅ Step 4: Verify and Enable

1. Your authenticator app now shows a **6-digit code** that changes every 30 seconds
2. Enter the current 6-digit code in the **"Verification Code"** field
3. Click **"ENABLE 2FA"**
4. You'll see a success message: **"2FA enabled successfully!"**

---

## 🔓 Step 5: Test Your 2FA

1. **Logout** from your account
2. **Login** again with your email and password
3. After entering your password, you'll see a **2FA verification modal**
4. Open your authenticator app
5. Enter the current 6-digit code
6. Click **"VERIFY"**
7. You're in! 🎉

---

## 🚨 Important Notes

### Security Tips:
- ✅ **Save your secret key** in a secure place (password manager)
- ✅ If you lose your phone, you can use the secret key to restore access
- ✅ The 6-digit code changes every 30 seconds
- ✅ Each code can only be used once

### Troubleshooting:
- ❌ **"Invalid code"** error? 
  - Make sure your phone's time is set to automatic
  - Wait for the next code (codes expire every 30 seconds)
  - Check you're entering the code from the correct account

- ❌ **Lost your phone?**
  - Contact admin to disable 2FA on your account
  - Use your saved secret key to restore access on a new device

- ❌ **QR code not scanning?**
  - Use manual entry with the secret key instead
  - Make sure your camera has permission to access

---

## 🔄 How to Disable 2FA

1. Go to your **Profile** page
2. Scroll to **"SECURITY & TWO-FACTOR AUTHENTICATION"**
3. Click **"DISABLE 2FA"**
4. Enter your current 6-digit code to confirm
5. 2FA will be disabled

---

## 🛡️ What's Protected by 2FA?

Once enabled, 2FA protects:
- ✅ Login access
- ✅ Admin panel access
- ✅ Profile settings
- ✅ Premium dashboard
- ✅ All sensitive operations

---

## 📞 Need Help?

If you're having trouble setting up 2FA:
1. Check that your phone's time is set to automatic
2. Try using a different authenticator app
3. Contact support with your issue

---

## 🎯 Quick Reference

| Action | Code Required |
|--------|---------------|
| Login | ✅ Yes |
| View Dashboard | ❌ No (after login) |
| Change Settings | ❌ No (after login) |
| Admin Access | ✅ Yes |
| Disable 2FA | ✅ Yes |

---

**Your account is now protected with enterprise-grade security! 🔒**
