# Fix "Missing or insufficient permissions" Error

## The Problem
You're getting "Missing or insufficient permissions" because Firestore security rules need to be updated to allow your authenticated users to create and access their user documents.

## The Solution - Update Firestore Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **token-guard-91e5b**

### Step 2: Navigate to Firestore Rules
1. Click **Firestore Database** in the left sidebar
2. Click the **Rules** tab at the top

### Step 3: Replace the Rules
Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to create and read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write token data
    match /tokens/{tokenId} {
      allow read, write, create: if request.auth != null;
    }
    
    // Allow authenticated users to manage their watchlist
    match /watchlists/{userId} {
      allow read, write, create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to manage their alerts
    match /alerts/{alertId} {
      allow read, write, create: if request.auth != null;
    }
  }
}
```

### Step 4: Publish the Rules
1. Click the **Publish** button
2. Wait for confirmation

## Test It
1. Restart your dev server: Stop (`Ctrl+C`) and run `pnpm dev`
2. Try logging in or signing up again
3. The permission error should be gone!

## Why This Happens
When you first create a Firestore database, Firebase sets very restrictive default rules that don't allow any reads or writes. We need to explicitly grant permissions for authenticated users to access their data.

## What These Rules Do
- **users/{userId}**: Each user can create, read, and update their own user profile
- **tokens/{tokenId}**: Any authenticated user can read/write token scan results
- **watchlists/{userId}**: Each user can manage their own watchlist
- **alerts/{alertId}**: Any authenticated user can manage alerts

Your app should work perfectly after this! 🎉
