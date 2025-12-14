# Pay-Per-Use System Documentation

## Overview

The Pay-Per-Use system implements a hybrid monetization model using the x402 protocol for micropayments. This allows users to pay only for premium features they actually use, without requiring monthly subscriptions.

## System Architecture

### 1. **Three-Tier Structure**

#### Tier 1: FREE ($0/month)
- **Target Audience**: Beginners and Social Sharers
- **Purpose**: User acquisition funnel and ethical fraud reduction
- **Features**:
  - ✅ Honeypot Check (Free)
  - ✅ Risk Score 0-100 (Free)
  - ✅ PDF Export with watermark (Free)
  - ❌ AI Risk Analyst
  - ❌ Portfolio Audit
  - ❌ Smart Alerts
- **Monetization**: Ad-supported, encourages social sharing via watermarked PDFs

#### Tier 2: PAY-AS-YOU-GO (x402 Credits)
- **Target Audience**: Casual/weekend traders who don't want monthly subscriptions
- **Purpose**: Solve micropayment market gap using x402 protocol
- **Credit System**: $5.00 = 50 Credits (USDC on Base)
- **Features**:
  - ✅ All Free tier features (no watermark on PDFs)
  - ⚡ AI Risk Analyst (1 Credit per report)
  - ⚡ Portfolio Audit (0.5 Credits per token)
  - ❌ Smart Alerts (Pro exclusive)
- **Payment Method**: x402 protocol with USDC on Base blockchain

#### Tier 3: PRO PLAN ($29/month)
- **Target Audience**: Active daily traders and power users
- **Purpose**: Long-term financial sustainability
- **Features**:
  - ✅ All Pay-As-You-Go features (unlimited)
  - ⚡ Smart Alerts (24/7 monitoring)
  - ✅ Custom branding on PDFs
  - ✅ Priority support
- **Infrastructure**: Covers VPS costs for 24/7 background workers

## x402 Protocol Integration

### What is x402?
The x402 protocol enables HTTP-native micropayments, allowing users to pay for individual API calls or features without traditional payment processor overhead.

### Technical Implementation

#### 1. **Credit Purchase Flow**
```typescript
// User initiates credit purchase
POST /api/credits/add
{
  amount: 5.00,        // USD amount
  credits: 50,         // Credits to add
  currency: "USDC",    // Payment currency
  network: "base"      // Base blockchain
}
```

#### 2. **Credit Deduction Flow**
```typescript
// Feature usage deducts credits
POST /api/credits/deduct
{
  userId: "user123",
  amount: 1.0,         // Credits to deduct
  feature: "ai_analysis", // Feature used
  metadata: {
    tokenAddress: "0x...",
    timestamp: Date.now()
  }
}
```

#### 3. **Balance Tracking**
```typescript
// Real-time balance updates
interface UserCredits {
  balance: number      // Current credit balance
  totalPurchased: number // Lifetime credits purchased
  totalSpent: number   // Lifetime credits spent
  lastUpdated: Date    // Last balance update
}
```

### Payment Processing

#### Traditional vs x402 Comparison
| Method | Min Transaction | Fixed Fee | Variable Fee | Profitable at $0.10? |
|--------|----------------|-----------|--------------|---------------------|
| Stripe | $0.50 | $0.30 | 2.9% | ❌ No |
| PayPal | $1.00 | $0.30 | 2.9% | ❌ No |
| x402 | $0.01 | ~$0.02 | 1-2% | ✅ Yes |

#### Why x402 Works for Micropayments
1. **Low Fixed Costs**: Blockchain transactions have minimal fixed fees
2. **No Intermediaries**: Direct wallet-to-wallet payments
3. **Instant Settlement**: No 2-3 day payment processing delays
4. **Global Access**: Works anywhere with crypto wallet access

## Credit Pricing Strategy

### Cost Analysis
```
AI Analysis (Groq API): ~$0.08 per request
Portfolio Audit: ~$0.04 per token
Platform Overhead: ~$0.02 per request
```

### Pricing Structure
```
AI Risk Analyst: 1.0 Credits ($0.10)
- Cost: $0.08 (API) + $0.02 (overhead)
- Margin: $0.00 (break-even for user acquisition)

Portfolio Audit: 0.5 Credits per token ($0.05)
- Cost: $0.04 (API) + $0.01 (overhead)  
- Margin: $0.00 (break-even for user acquisition)
```

### Volume Economics
```
$5.00 purchase = 50 Credits
- 50 AI Reports OR
- 100 Portfolio token scans OR
- Mixed usage (25 AI + 50 tokens)
```

## User Experience Flow

### 1. **Account Setup**
```
1. User signs up with email/wallet
2. Account created with 0 credits
3. Dashboard shows credit balance: "0 / 0"
```

### 2. **Credit Purchase**
```
1. User clicks "Add Funds" button
2. Modal shows: "$5.00 = 50 Credits"
3. x402 payment flow initiated
4. USDC payment on Base network
5. Credits added to account instantly
```

### 3. **Feature Usage**
```
1. User requests AI analysis
2. System checks credit balance
3. If sufficient: deduct 1 credit, provide service
4. If insufficient: show "Add Funds" prompt
5. Balance updated in real-time
```

### 4. **Balance Management**
```
Dashboard displays:
- Current balance: "Credits: 23 / 50"
- Usage history: Recent transactions
- Top-up button: Always visible
- Upgrade option: "Go unlimited with Pro"
```

## Business Model Justification

### Market Gap Solution
Traditional payment processors cannot profitably handle transactions under $1.00 due to fixed fees. This creates a gap for:
- Casual users who want occasional premium features
- Users in regions with limited payment options
- Crypto-native users who prefer on-chain payments

### Revenue Sustainability
```
Break-even Analysis:
- Credit sales cover API costs exactly
- User acquisition through low-friction payments
- Conversion funnel: Free → Pay-Per-Use → Pro
- Pro subscriptions provide profit margin
```

### Competitive Advantage
1. **No Minimum Commitment**: Users can try premium features for $0.10
2. **Crypto-Native**: Appeals to Web3 audience
3. **Transparent Pricing**: Clear cost per feature
4. **Global Access**: No geographic payment restrictions

## Technical Infrastructure

### Database Schema
```sql
-- User credits table
CREATE TABLE user_credits (
  user_id VARCHAR(255) PRIMARY KEY,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_purchased DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Credit transactions table
CREATE TABLE credit_transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('purchase', 'deduction') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  feature VARCHAR(100),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uid)
);
```

### API Endpoints

#### Credit Management
```typescript
// Add credits (purchase)
POST /api/credits/add
Authorization: Bearer <firebase-token>
Body: { amount: number, credits: number }

// Deduct credits (usage)
POST /api/credits/deduct  
Authorization: Bearer <firebase-token>
Body: { amount: number, feature: string, metadata?: object }

// Get balance
GET /api/credits/balance
Authorization: Bearer <firebase-token>
Response: { balance: number, totalPurchased: number, totalSpent: number }

// Get transaction history
GET /api/credits/history
Authorization: Bearer <firebase-token>
Response: { transactions: Transaction[] }
```

#### Feature Integration
```typescript
// AI Analysis with credit check
POST /api/premium/ai-analysis
Authorization: Bearer <firebase-token>
Body: { tokenAddress: string, chainId: string }
Response: { analysis: object, creditsDeducted: number, remainingCredits: number }

// Portfolio Audit with credit check
POST /api/premium/portfolio-audit
Authorization: Bearer <firebase-token>
Body: { walletAddress: string, chainId: string }
Response: { audit: object, creditsDeducted: number, remainingCredits: number }
```

## Security Considerations

### 1. **Double-Spending Prevention**
```typescript
// Atomic credit deduction with database transactions
async function deductCredits(userId: string, amount: number) {
  const transaction = await db.transaction()
  try {
    const user = await transaction.get(userRef)
    if (user.credits < amount) {
      throw new Error('Insufficient credits')
    }
    await transaction.update(userRef, {
      credits: user.credits - amount,
      totalSpent: user.totalSpent + amount
    })
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

### 2. **Rate Limiting**
```typescript
// Prevent abuse with rate limiting
const rateLimiter = {
  aiAnalysis: '10 requests per minute',
  portfolioAudit: '5 requests per minute',
  creditPurchase: '3 purchases per hour'
}
```

### 3. **Audit Trail**
```typescript
// Complete transaction logging
interface CreditTransaction {
  id: string
  userId: string
  type: 'purchase' | 'deduction'
  amount: number
  feature?: string
  metadata?: {
    tokenAddress?: string
    walletAddress?: string
    timestamp: number
    ipAddress: string
  }
  createdAt: Date
}
```

## Monitoring and Analytics

### Key Metrics
```typescript
interface PayPerUseMetrics {
  // User Behavior
  averageCreditsPerUser: number
  conversionRate: number // Free → Pay-Per-Use
  upgradeRate: number    // Pay-Per-Use → Pro
  
  // Financial
  totalCreditsRevenue: number
  averageTransactionSize: number
  costPerFeature: number
  
  // Usage Patterns
  mostUsedFeatures: string[]
  peakUsageHours: number[]
  retentionRate: number
}
```

### Dashboard Analytics
```typescript
// Admin dashboard metrics
const analytics = {
  dailyCreditsRevenue: '$127.50',
  activePayPerUseUsers: 45,
  averageCreditsPerUser: 23.4,
  topFeatures: [
    { name: 'AI Analysis', usage: '67%' },
    { name: 'Portfolio Audit', usage: '33%' }
  ]
}
```

## Future Enhancements

### 1. **Credit Packages**
```typescript
const creditPackages = [
  { price: 5.00, credits: 50, bonus: 0 },      // Standard
  { price: 20.00, credits: 220, bonus: 20 },  // 10% bonus
  { price: 50.00, credits: 600, bonus: 100 }  // 20% bonus
]
```

### 2. **Feature Bundles**
```typescript
const bundles = [
  {
    name: 'Analysis Bundle',
    price: 5.0, // credits
    features: ['AI Analysis', 'Portfolio Audit', 'PDF Export'],
    savings: '20%'
  }
]
```

### 3. **Loyalty Program**
```typescript
const loyaltyTiers = [
  { spent: 50, discount: 0.05 },   // 5% discount after $50
  { spent: 200, discount: 0.10 },  // 10% discount after $200
  { spent: 500, discount: 0.15 }   // 15% discount after $500
]
```

## Conclusion

The Pay-Per-Use system bridges the gap between free and subscription tiers, providing:

1. **User Benefits**: No commitment, pay only for what you use
2. **Business Benefits**: User acquisition, conversion funnel, sustainable costs
3. **Technical Innovation**: Demonstrates x402 protocol capabilities
4. **Market Differentiation**: Unique offering in crypto analysis space

This hybrid model ensures accessibility while maintaining financial sustainability, making advanced token analysis tools available to users regardless of their usage patterns or financial commitment preferences.