# Admin Panel - 2FA Setup & UI Cleanup

## Summary
Added admin 2FA setup functionality and cleaned up redundant UI elements from the admin panel header.

## Changes Made

### 1. UI Cleanup
**Removed from Admin Panel Header:**
- ❌ "USER VIEW" button (redundant - navbar already has profile menu)
- ❌ "LOGOUT" button (redundant - navbar already has logout in profile dropdown)

**Kept:**
- ✅ System status indicator (green pulse with "SYSTEM STATUS: OPERATIONAL")

### 2. Admin 2FA Setup Feature

#### New UI Section in Settings Tab
- **Admin 2FA Card**: Dedicated section for admin to setup their own 2FA
- **Status Display**: Shows if 2FA is enabled/disabled for current admin
- **Setup Button**: Initiates 2FA setup flow
- **Disable Button**: Allows admin to disable their 2FA

#### TOTP Setup Modal
- **QR Code Display**: Visual QR code for scanning with authenticator apps
- **Manual Secret**: Copy-to-clipboard secret key for manual entry
- **Verification Input**: 6-digit code input with auto-formatting
- **Verify & Enable**: Confirms setup and enables 2FA
- **Cancel**: Closes modal without enabling

### 3. New API Endpoints

#### `/api/admin/totp/setup` (POST)
- Generates new TOTP secret
- Creates QR code data URL
- Stores pending secret in Firestore
- Returns secret and QR code

#### `/api/admin/totp/verify` (POST)
- Verifies TOTP code against secret
- Enables 2FA if code is valid
- Stores secret permanently in Firestore

#### `/api/admin/totp/disable` (POST)
- Disables 2FA for admin account
- Removes TOTP secret from Firestore
- Requires confirmation

#### `/api/admin/totp/status` (GET)
- Checks if admin has 2FA enabled
- Returns boolean status

### 4. Enhanced TOTP Library (`lib/totp.ts`)

**New Functions:**
```typescript
// Generate QR code data URL (server-side)
generateQRCode(secret: string, email: string, issuer: string): Promise<string>

// Synchronous TOTP verification (server-side)
verifyTOTPToken(secret: string, token: string): boolean
```

**Features:**
- Uses `qrcode` package for QR generation
- Node.js crypto for server-side HMAC
- 30-second time window
- ±1 time step tolerance

### 5. State Management

**New State Variables:**
```typescript
adminTotpSecret: string          // Current TOTP secret
adminTotpQR: string              // QR code data URL
adminTotpEnabled: boolean        // 2FA status
showTotpSetup: boolean           // Modal visibility
totpVerifyCode: string           // User input code
totpCopied: boolean              // Copy feedback
```

**New Functions:**
```typescript
loadAdminTotpStatus()   // Load 2FA status on mount
setupAdminTotp()        // Initiate setup flow
verifyAdminTotp()       // Verify and enable 2FA
disableAdminTotp()      // Disable 2FA
copyToClipboard()       // Copy secret to clipboard
```

## User Flow

### Setup 2FA
1. Admin clicks "SETUP 2FA" button in Settings tab
2. System generates secret and QR code
3. Modal displays QR code and manual secret
4. Admin scans QR with authenticator app (Google Authenticator, Authy, etc.)
5. Admin enters 6-digit verification code
6. System verifies code and enables 2FA
7. Success message displayed

### Disable 2FA
1. Admin clicks "DISABLE 2FA" button
2. Confirmation dialog appears
3. Admin confirms
4. System removes TOTP secret
5. 2FA disabled

## Security Features

- **Admin-only access**: All endpoints verify admin role
- **Pending secrets**: Setup secrets stored separately until verified
- **Time-based codes**: 30-second validity window
- **Window tolerance**: ±1 time step for clock drift
- **Secure storage**: Secrets stored in Firestore with encryption
- **Confirmation required**: Disable action requires user confirmation

## Firestore Schema

### `users/{userId}` Document
```typescript
{
  totpSecret: string              // Active TOTP secret (encrypted)
  totpEnabled: boolean            // 2FA status
  totpSecretPending: string       // Temporary secret during setup
  totpEnabledAt: Timestamp        // When 2FA was enabled
  totpDisabledAt: Timestamp       // When 2FA was disabled
  totpSetupAt: Timestamp          // When setup was initiated
}
```

## Dependencies

**Already in package.json:**
- `qrcode` - QR code generation

**Built-in:**
- Node.js `crypto` module (server-side HMAC)
- Web Crypto API (client-side HMAC)

## Testing

### Test 2FA Setup
```bash
1. Login as admin
2. Navigate to Admin Dashboard > Settings tab
3. Click "SETUP 2FA" button
4. Scan QR code with Google Authenticator
5. Enter 6-digit code from app
6. Click "VERIFY & ENABLE"
7. Verify success message and status change
```

### Test 2FA Disable
```bash
1. With 2FA enabled
2. Click "DISABLE 2FA" button
3. Confirm in dialog
4. Verify status changes to disabled
```

### Test Copy Secret
```bash
1. During setup, click copy icon
2. Verify clipboard contains secret
3. Verify checkmark appears briefly
```

## Authenticator Apps Supported

- ✅ Google Authenticator (iOS/Android)
- ✅ Authy (iOS/Android/Desktop)
- ✅ Microsoft Authenticator
- ✅ 1Password
- ✅ LastPass Authenticator
- ✅ Any TOTP-compatible app

## Next Steps

Consider adding:
- Backup codes for account recovery
- 2FA requirement enforcement for all admins
- 2FA login flow integration
- Audit log for 2FA events
- Email notification on 2FA changes
- SMS backup option
