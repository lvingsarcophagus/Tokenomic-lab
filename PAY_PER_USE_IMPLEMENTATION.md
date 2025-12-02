# Pay-Per-Use Tier Implementation Summary

## Overview
Implemented a credit-based pay-per-use tier that allows users to access premium features by purchasing credits via x402 protocol.

## Changes Made

### 1. Type System Updates

**hooks/use-user-role.ts**
- Added `PAY_PER_USE` to UserRole type
- Added `isPayPerUse` boolean to UserRoleData interface
- Updated role detection logic

**lib/firestore-schema.ts**
- Added `PAY_PER_USE` to plan enum
- Added `credits` field to UserDocument (optional number)
- Updated usage.dailyLimit to be unlimited (-1) for PAY_PER_USE users

### 2. Dashboard Updates

**app/dashboard/page.tsx**
- Updated `isPremium` check to include PAY_PER_USE users
- Added `isPayPerUse` and `credits` state variables
- PAY_PER_USE users now access premium dashboard with credit checks
- Updated plan detection in loadDashboardData()

### 3. Credits Management

**components/credits-manager.tsx** (NEW)
- Displays current credit balance
- Progress bar showing credits (0-50)
- "ADD FUNDS" button
- Usage info (AI Analyst: 1 credit, Portfolio Audit: 0.5 credits/token)
- Low balance warning when credits < 5

**app/api/credits/add/route.ts** (NEW)
- POST endpoint to add credits after x402 payment
- Calculates credits: 1 credit = $0.10 (so $5 = 50 credits)
- Updates user document with new credit balance
- Logs transaction in credit_transactions collection

**app/api/credits/deduct/route.ts** (NEW)
- POST endpoint to deduct credits when using features
- Feature costs:
  - AI Analyst: 1 credit ($0.10)
  - Portfolio Audit: 0.5 credits per token ($0.05)
- Checks sufficient balance before deducting
- Returns 402 Payment Required if insufficient credits
- Logs usage transaction

### 4. Landing Page Updates

**app/page.tsx**
- Updated pricing cards with proper black/white glassmorphism theme
- Changed Pay-As-You-Go card:
  - Badge: "⚡ x402 CREDITS"
  - Pricing: "$5 = 50 Credits"
  - Button: "BUY CREDITS" → links to /pay-per-scan
  - Features show credit costs instead of dollar amounts
- Added "How Credits Work" section with 4-step workflow
- Proper icons in bordered squares (Shield, BarChart3, CheckCircle, Cpu, Eye, Bell)
- Removed all color themes except black/white

## Workflow

### User Journey (Pay-As-You-Go)

1. **Sign Up**
   - User creates account
   - Selects "PAY_PER_USE" plan during signup
   - Account created with 0 credits

2. **Add Credits**
   - User clicks "BUY CREDITS" or "ADD FUNDS"
   - Redirected to /pay-per-scan page
   - Selects amount (e.g., $5 for 50 credits)
   - Pays via x402 protocol (USDC on Base)
   - Credits added to account instantly

3. **Track Balance**
   - Dashboard shows CreditsManager component
   - Progress bar displays: "Credits Remaining: 50 / 50"
   - Low balance warning appears when < 5 credits

4. **Use Features**
   - Request AI Analyst report → Deducts 1 credit
   - Run Portfolio Audit (10 tokens) → Deducts 5 credits
   - No wallet popup needed (credits pre-purchased)
   - Balance updates in real-time

### API Integration

```typescript
// Add credits after x402 payment
POST /api/credits/add
Authorization: Bearer <firebase-token>
Body: {
  amount: 5.00,  // USD amount paid
  transactionId: "x402_tx_..."
}
Response: {
  success: true,
  credits: 50,  // New balance
  added: 50     // Credits added
}

// Deduct credits when using feature
POST /api/credits/deduct
Authorization: Bearer <firebase-token>
Body: {
  feature: "ai_analyst",  // or "portfolio_audit"
  amount: 1  // Optional, defaults to feature cost
}
Response: {
  success: true,
  credits: 49,  // New balance
  deducted: 1   // Credits deducted
}
```

## Database Schema

### users/{userId}
```typescript
{
  plan: 'FREE' | 'PAY_PER_USE' | 'PREMIUM',
  credits: 50,  // Only for PAY_PER_USE users
  usage: {
    dailyLimit: -1  // Unlimited for PAY_PER_USE
  }
}
```

### credit_transactions (NEW COLLECTION)
```typescript
{
  userId: string,
  type: 'purchase' | 'usage',
  amount?: number,      // USD amount (for purchases)
  credits: number,      // Credits added/deducted
  feature?: string,     // Feature used (for usage)
  cost?: number,        // Credit cost (for usage)
  transactionId?: string,  // x402 transaction ID
  status: 'completed',
  createdAt: Timestamp
}
```

## TODO: Remaining Implementation

### 1. Update Signup Page
- Add plan selection radio buttons (FREE vs PAY_PER_USE)
- Update user document creation to set selected plan
- Set credits to 0 for PAY_PER_USE users

### 2. Update Pay-Per-Scan Page
- Add credit purchase options ($5, $10, $20, $50)
- Integrate x402 payment flow
- Call /api/credits/add after successful payment

### 3. Integrate Credit Checks
- Update AI analysis endpoints to check/deduct credits
- Update portfolio audit to check/deduct credits
- Show "Insufficient Credits" modal when balance too low

### 4. Add Credits Manager to Dashboard
- Import and display CreditsManager component
- Add "Add Funds" modal/redirect

### 5. Update Premium Dashboard Access
- Allow PAY_PER_USE users to access /premium/dashboard
- Show credit balance instead of subscription status
- Gate features behind credit checks

## Feature Gating Logic

```typescript
// Check if user can use AI Analyst
const canUseAIAnalyst = (userProfile) => {
  if (userProfile.plan === 'PREMIUM') return true
  if (userProfile.plan === 'PAY_PER_USE' && userProfile.credits >= 1) return true
  return false
}

// Check if user can audit portfolio
const canAuditPortfolio = (userProfile, tokenCount) => {
  if (userProfile.plan === 'PREMIUM') return true
  const requiredCredits = tokenCount * 0.5
  if (userProfile.plan === 'PAY_PER_USE' && userProfile.credits >= requiredCredits) return true
  return false
}
```

## Benefits

1. **No Subscription Commitment**: Users pay only for what they use
2. **Instant Access**: No wallet popup for each transaction
3. **Transparent Pricing**: Clear credit costs displayed
4. **Profitable Micropayments**: x402 enables $0.10 transactions
5. **Premium Features**: Access to AI analysis and portfolio audits
6. **Flexible**: Top up anytime, credits don't expire

## Pricing Comparison

| Feature | FREE | PAY_PER_USE | PREMIUM |
|---------|------|-------------|---------|
| Honeypot Check | ✅ | ✅ | ✅ |
| Risk Score | ✅ | ✅ | ✅ |
| PDF Export | Watermarked | No watermark | Custom logo |
| AI Analyst | ❌ | 1 credit | Unlimited |
| Portfolio Audit | ❌ | 0.5 credits/token | Unlimited |
| Smart Alerts | ❌ | ❌ | ✅ 24/7 |
| **Cost** | **$0** | **$5 = 50 credits** | **$29/month** |
