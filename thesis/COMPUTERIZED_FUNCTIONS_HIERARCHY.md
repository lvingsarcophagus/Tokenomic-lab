# Hierarchy of Computerized Functions - Tokenomics Lab

## Document Information
**Purpose**: Define the hierarchical structure of all computerized functions within the Tokenomics Lab platform  
**Date**: December 11, 2025  
**For**: Bachelor's Thesis Documentation  
**Standard**: IEEE Software Architecture Documentation

---

## System Architecture Overview

The Tokenomics Lab platform follows a **layered architecture** with clear separation of concerns across presentation, business logic, data access, and external integration layers.

---

## 1. PRESENTATION LAYER (Client-Side)

### 1.1 User Interface Components
```
├── Public Pages
│   ├── Landing Page (/)
│   ├── Pricing Page (/pricing)
│   ├── Documentation Index (/docs)
│   ├── Algorithm Explanation (/docs/algorithm)
│   └── 404 Not Found (/not-found)
│
├── Authentication Pages
│   ├── Login Page (/login)
│   ├── Signup Page (/signup)
│   ├── Password Reset (/reset-password)
│   └── Admin Login with 2FA (/admin/login)
│
├── Dashboard Pages (Protected)
│   ├── Unified Dashboard (/dashboard) [Role-aware]
│   ├── Token Analysis Interface (embedded in dashboard)
│   ├── Watchlist Page (dashboard section) [PRO/PAY-AS-YOU-GO]
│   ├── Analysis History (dashboard section) [PRO]
│   └── Admin Dashboard (/admin/dashboard) [ADMIN]
│
├── Credit Management Pages [PAY-AS-YOU-GO]
│   ├── Credit Purchase Modal (x402 integration)
│   ├── Credit Balance Display
│   └── Transaction History View
│
└── User Profile Pages
    ├── Profile Settings (/profile)
    ├── Data Export (GDPR) (/profile/export)
    └── Account Deletion (/profile/delete)
```

### 1.2 React Component Hierarchy
```
App Component (Root)
│
├── Layout Component
│   ├── Header Component
│   │   ├── Navigation Component
│   │   ├── User Menu Component
│   │   └── Credit Balance Display
│   │
│   ├── Sidebar Component
│   │   ├── Menu Items
│   │   └── Tier Badge
│   │
│   └── Footer Component
│
├── Authentication Components
│   ├── LoginForm
│   ├── RegisterForm
│   ├── PasswordResetForm
│   └── TwoFactorAuthInput
│
├── Token Analysis Components
│   ├── TokenSearchBar
│   ├── ChainSelector
│   ├── AnalysisResultCard
│   │   ├── RiskScoreDisplay
│   │   ├── RiskFactorBreakdown
│   │   ├── SecurityMetrics
│   │   ├── MarketMetrics
│   │   └── AIInsightsPanel [PRO/PAY-AS-YOU-GO]
│   │
│   ├── MemeTokenBadge
│   ├── OfficialTokenBadge
│   └── DeadTokenBadge
│
├── Watchlist Components [PRO/PAY-AS-YOU-GO]
│   ├── WatchlistTable
│   ├── AddTokenToWatchlist
│   ├── AlertConfigModal
│   └── AlertNotificationToast
│
├── History Components [PRO]
│   ├── AnalysisHistoryTable
│   ├── HistoryFilters
│   └── ReanalyzeButton
│
├── Admin Components [ADMIN]
│   ├── UserManagementTable
│   ├── UserSearchBar
│   ├── UserActionsDropdown
│   └── PlatformAnalyticsDashboard
│
└── Subscription Components
    ├── PricingCards
    ├── CreditPurchaseForm
    ├── StripeCheckoutButton
    └── x402PaymentButton
```

---

## 2. APPLICATION LAYER (Business Logic)

### 2.1 API Routes (Next.js Server-Side)
```
/api
│
├── /auth
│   ├── POST /register → Create new user account
│   ├── POST /login → Authenticate user
│   ├── POST /logout → End user session
│   ├── POST /reset-password → Send password reset email
│   ├── POST /verify-2fa → Verify two-factor authentication
│   └── GET /session → Get current user session
│
├── /tokens (Token Analysis)
│   ├── POST /analyze-token → Main token analysis endpoint
│   ├── GET /search → Token search (CoinMarketCap)
│   ├── GET /history → Token price history
│   └── GET /insights → Token insights
│
├── /pro [PRO/PAY-AS-YOU-GO]
│   ├── Watchlist Management
│   │   ├── POST /watchlist → Add/remove watchlist items
│   │   └── GET /watchlist → Get user's watchlist
│   │
│   └── Smart Alerts (24/7 monitoring)
│       ├── POST /alerts → Create price alert
│       └── GET /alerts → Get user's alerts
│
├── /history [PRO]
│   ├── GET / → Get analysis history
│   ├── GET /[id] → Get specific analysis
│   ├── POST /reanalyze → Re-run past analysis
│   └── GET /export → Export history (CSV/PDF)
│
├── /credits [PAY-AS-YOU-GO]
│   ├── GET /balance → Get current credit balance
│   ├── POST /add → Purchase credits (x402)
│   ├── POST /deduct → Deduct credits for feature usage
│   └── GET /history → Get credit transaction history
│
├── /premium [PAY-AS-YOU-GO]
│   ├── POST /ai-analysis → AI risk analysis (1 credit)
│   └── POST /portfolio-audit → Portfolio audit (0.5 credits per token)
│
├── /subscription
│   ├── GET /plans → Get all pricing plans
│   ├── POST /upgrade → Upgrade to PRO plan
│   ├── POST /cancel → Cancel subscription
│   ├── GET /status → Get subscription status
│   └── POST /webhook → Stripe webhook handler
│
├── /user
│   ├── GET /profile → Get user profile
│   ├── PATCH /profile → Update profile info
│   ├── POST /export-data → Export user data (GDPR compliance)
│   └── POST /delete-load-avatar → Upload profile picture
│   ├── GET /usage-stats → Get usage statistics
│   └── DELETE /account → Delete account (GDPR)
│
└── /admUser Management
    │   ├── GET /users → List all users
    │   └── PUT /users → Update user tier/status
    │
    ├── Analytics & Monitoring
    │   ├── GET /analytics → Platform analytics
    │   └── GET /activity-logs → Activity logs
    │
    ├── Settings Management
    │   ├── GET /settings → Get admin settings
    │   └── PUT /settings → Update admin settings
    │
    └── Two-Factor Authentication
        ├── POST / [MAIN FUNCTION]
│   ├── validateInput()
│   ├── checkUserTier()
│   ├── checkDailyLimit() [FREE - 20 scans/day]
│   ├── deductCredit() [PAY-AS-YOU-GO]
│   │
│   ├── fetchMarketData()
│   │   ├── callMobulaAPI() → Market data (price, volume, liquidity)
│   │   ├── callCoinGeckoAPI() → Verification data
│   │   ├── callMoralisAPI() → Transaction data (EVM)
│   │   └── normalizeMarketData()
│   │
│   ├── fetchSecurityData()
│   │   ├── callGoPlusAPI() → Contract security (EVM)
│   │   ├── callHeliusAPI() → Solana-specific data (DAS API)
│   │   └── normalizeSecurityData()
│   │
│   ├── calculateRiskScore() [10-Factor Algorithm]
│   │   ├── applyChainWeights() → Chain-specific adjustments
│   │   ├── calculate10FactorScore()
│   │   │   ├── Factor 1: Liquidity Risk
│   │   │   ├── Factor 2: Market Cap Stability
│   │   │   ├── Factor 3: Holder Distribution
│   │   │   ├── Factor 4: Contract Verification
│   │   │   ├── Factor 5: Ownership Concentration
│   │   │   ├── Factor 6: Trading Volume
│   │   │   ├── Factor 7: Token Age
│   │   │   ├── Factor 8: Honeypot Detection
│   │   │   ├── Factor 9: Buy/Sell Tax Analysis
│   │   │   └── Factor 10: External Security Audits
│   │   └── normalizeScore() → 0-100 scale
│   │
│   ├── detectMemeToken() [AI - Groq Llama 3.3 70B]
│   │   ├── callGroqAPI()
│   │   │   └── Fallback: callGeminiAPI()
│   │   ├── analyzeName()
│   │   ├── analyzeDescription()
│   │   └── calculateMemeProbability() → 0-100%
│   │
│   ├── checkOfficialTokenStatus()
│   │   ├── queryCoinGeckoVerified()
│   │   └── applyOfficialOverride() → Override risk if official
│   │
│   ├── detectDeadToken()
│   │   ├── checkLiquidityZero()
│   │   ├── checkTradingVolume()
│   │   └── applyDeadOverride() → Flag as dead if inactive
│   │
│   ├── generateAISummary() [PRO/PAY-AS-YOU-GO - 1 credit]
│   │   ├── callGroqAPI()
│   │   └── generateNaturalLanguageReport()
│   │
│   ├── fetchTwitterMetrics() [PRO/PAY-AS-YOU-GO]
│   │   ├── searchTwitterHandle()
│   │   └── aggregateSocialMetrics()
│   │
│   └── exportPDF() [All tiers]
│       ├── generatePDFReport()
│       └── addWatermark() [FREE tier only]
│
├── portfolioAudit() [PAY-AS-YOU-GO - 0.5 credits per token]
│   ├── validateTokenAddresses()
│   ├── analyzeMultipleTokens()
│   └── generatePortfolioReport()
│
├── saveAnalysisHistory() [PRO only)
│   │
│   ├── generateAISummary() [PRO/PAY-AS-YOU-GO]
│   │   ├── callGroqAPI()
│   │   └── generateNaturalLanguageReport()
│   │
│   └── fetchTwitterMetrics() [PRO/PAY-AS-YOU-GO]
│       ├── searchTwitterHandle()
│       └── aggregateSocialMetrics()
│
├── saveAnalysisHistory() [PRO]
├── updateWatchlistPrices() [PRO/PAY-AS-YOU-GO]
└── triggerPriceAlerts() [PRO/PAY-AS-YOU-GO]
```

### 2.3 Authentication & Authorization Module
```
Authentication Flow
│
├── registerUser()
│   ├── validateEmail()
│   ├── hashPassword()
│   ├── createFirestoreUser()
│   └── sendWelcomeEmail()
│
├── loginUser()
│   ├── verifyCredentials()
│   ├── checkAccountStatus()
│   ├── require2FA() [ADMIN]
│   └── generateSession()
│
├── resetPassword()
│   ├── generateResetToken()
│   ├── sendResetEmail()
│   └── validateResetToken()
│
└── authorizeAccess()
    ├── checkAuthentication()
    ├── checkUserTier()
    ├── checkFeatureAccess()
    └── logAccessAttempt()
```

### 2.4 Payment & Credit Management Module
```
Payment Processing
│
├── x402 Micropayment Flow [PAY-AS-YOU-GO]
│   ├── initiatex402Payment()
│   └── userId (Document)
│       ├── email: string
│       ├── displayName: string
│       ├── tier: "FREE" | "PAY-AS-YOU-GO" | "PRO" | "ADMIN"
│       ├── createdAt: timestamp
│       ├── lastLogin: timestamp
│       ├── twoFactorEnabled: boolean [ADMIN]
│       ├── totpSecret: string [ADMIN - encrypted]
│       ├── profilePicture: string
│       └── dailyScanCount: number [FREE - resets UTC midnight]
│
├── user_credits (Collection) [PAY-AS-YOU-GO]
│   └── userId (Document)
│       ├── balance: number
│       ├── totalPurchased: number
│       ├── totalSpent: number
│       └──uctCredit()
    │   ├── atomicTransaction()
    │   ├── checkSufficientBalance()
    │   └── logDeduction()
    │
    ├── addCredits()
    └── getTransactionHistory()
```

---

## 3. DATA ACCESS LAYER

### 3.1 Firebase Firestore Collections
```
Firestore Database
│
├── useruserId (Document)
│       └── tokens (Subcollection)
│           └── tokenAddress (Document)
│               ├── chain: string
│               ├── symbol: string
│               ├── addedAt: timestamp
│               └── lastPriceCheck: timestamp
│
├── alerts (Collection) [PRO/PAY-AS-YOU-GO]
│   └── userId (Document)
│       └── notifications (Subcollection)
│           └── alertId (Document)
│               ├── tokenAddress: string
│               ├── chain: string
│               ├── alertType: "PRICE_ABOVE" | "PRICE_BELOW" | "RISK_CHANGE"
│               ├── threshold: number
│               ├── enabled: boolean
│               └── createdAt: timestampmestamp
│   │   ├── twoFactorEnabled: boolean [ADMIN]
│   │   └── profilePicture: string
│   │
│   └── user_credits (Subcollection) [PAY-AS-YOU-GO]
│       └── balance: number
│           totalPurchased: number
│           totalSpent: number
│           lastUpdated: timestamp
│
├── credit_transactions (Collection) [PAY-AS-YOU-GO]
│   └── transactionId (Document)
│       userId (Document)
│       └── scans (Subcollection)
│           └── scanId (Document)
│               ├── tokenAddress: string
│               ├── chain: string
│               ├── symbol: string
│               ├── riskScore: number
│               ├── analysisData: object
│               ├── timestamp: timestamp
│               └── aiSummaryIncluded: booleann) [PRO/PAY-AS-YOU-GO]
│   └── watchlistId (Document)
│       ├── userId: string
│       ├── tokenAddress: string
│       ├── chain: string
│       ├── addedAt: timestamp
│       └── alerts: array
│
├── analysis_history (Collection) [PRO]
│   └── analysisId (Document)
│       ├── userId: string
│       ├── tokenAddress: string
│       ├── chain: string
├── activity_logs (Collection) [All users]
│   └── userId (Document)
│       └── actions (Subcollection)
│           └── actionId (Document)
│               ├── action: string
│               ├── timestamp: timestamp
│               ├── ipAddress: string
│               └── userAgent: string
│
├── admin_notification_preferences (Collection) [ADMIN]
│   └── userId (Document)
│       ├── emailNotifications: boolean
│       ├── alertThresholds: object
│       └── updatedAt: timestamp
│
└── subscriptions (Collection) [PRO - Stripe integration]
    └── subscriptionId (Document)
        ├── userId: string
        ├── stripeCustomerId: string
        ├── stripeSubscriptionId: string
        ├── status: "active" | "cancelled" | "past_due"
        ├── currentPeriodEnd: timestamp
        └── cancelAtPeriodEnd: booleanument)
│       ├── userId: string
│       ├── stripeCustomerId: string
│       ├── stripeSubscriptionId: string
│       ├── status: "active" | "cancelled" | "past_due"
│       ├── currentPeriodEnd: timestamp
│       └── cancelAtPeriodEnd: boolean
│
└── admin_logs (Collection) [ADMIN]
    └── logId (Document)
        ├── adminUserId: string
        ├── action: string
        ├── targetUserId: string
        ├── timestamp: timestamp
        └── details: object
```

### 3.2 Database Operations
```
CRUD Operations
│
├── User Operations
│   ├── createUser()
│   ├── getUserById()
│   ├── updateUserProfile()
│   ├── deleteUser()
│   └── queryUsersByTier()
│
├── Credit Operations [PAY-AS-YOU-GO]
│   ├── getBalance()
│   ├── addCredits() [Atomic Transaction]
│   ├── deductCredit() [Atomic Transaction]
│   └── getTransactionHistory()
│
├── Watchlist Operations [PRO/PAY-AS-YOU-GO]
│   ├── addToWatchlist()
│   ├── removeFromWatchlist()
│   ├── getWatchlist()
│   └── updateAlerts()
│
├── History Operations [PRO]
│   ├── saveAnalysis()
│   ├── getHistoryByUser()
│   ├── getHistoryByDateRange()
│   └── deleteOldHistory()
│
└── Admin Operations [ADMIN]
    ├── getAllUsers()
    ├── updateUserTier()
    ├── banUser()
    ├── logAdminAction()
    └── generateAnalytics()
```

---

## 4. EXTERNAL INTEGRATION LAYER

### 4.1 Blockchain Data APIs
```
External API Integrations
│
├── Mobula API AI)
│   ├── Model: Llama 3.3 70B
│   ├── /chat/completions → Meme detection (95% accuracy)
│   ├── /chat/completions → AI summary generation
│   └── Rate Limit: 10 requests/min
│
└── Google Gemini (Fallback AI)
    ├── Model: Gemini 1.5 Flash
    └── /chat/completions → Used when Groq fails
├── GoPlus Security API
│   ├── /token_security/[chain] → Security audit
│   ├── /address_security/[chain] → Address risk
│   └── /phishing_site → Phishing detection
│
├── Helius API [Solana]
│   ├── /addresses/[address]/transactions → Solana transactions
│   ├── /tokens/metadata → Token metadata
│   └── /rpc → Solana RPC calls
storical prices
```

### 4.2 AI & ML Services
```
AI Integration
│
├── Groq API (Primary)
│   ├── Model: Llama 3.3 70B
│   ├── /chat/completions → Meme detection
│   ├── /chat/completions → AI summary generation
│   └── Fallback: Gemini 1.5 Flash
│
└── AI Functions
    ├── detectMemeToken()
    │   ├── Analyze token name
    │   ├── Analyze description
    │   └── Return probability (0-100%)
    │
    └── generateAISummary()
        ├── Summarize risk factors
        ├── Explain red flags
        └── Provide recommendations
```

### 4.3 Payment Processing Services
```
Payment Gateways
│
├── x402 Protocol [PAY-AS-YOU-GO]
│   ├── USDC on Base blockchain
│   ├── Micropayment: $0.10 minimum
│   ├── Gas fees: ~$0.02
│   └── Instant settlement
│
└── Stripe [PRO]
    ├── Subscription management
    ├── Webhook handling
    ├── Automatic billing
    └── Payment method storage
```

### 4.4 Communication Services
```
External Services
│
├── Nodemailer (Email)
│   ├── Welcome emails
│   ├── Password reset emails
│   ├── Price alert notifications
│   └── Subscription reminders
│
└── Firebase Cloud Messaging (Future)
    ├── Push notifications
    └── Real-time alerts
```

---

## 5. SECURITY & MIDDLEWARE LAYER

### 5.1 Security Functions
```
Security Mechanisms
│
├── Authentication Middleware
│   ├── verifyJWTToken()
│   ├── checkSessionExpiry()
│   └── refreshToken()
│
├── Authorization Middleware
│   ├── requireAuth()
│   ├── requireTier(tier: string)
│   ├── requireAdmin()
│   └── check2FA() [ADMIN]
│
├── Rate Limiting
│   ├── API rate limits
│   │   ├── FREE: 20 requests/day
│   │   ├── PAY-AS-YOU-GO: Credit-based
│   │   └── PRO: 1000 requests/day
│   │
│   └── Specific limits
│       ├── AI requests: 10/min
│       ├── Credit purchases: 3/hour
│       └── Login attempts: 5/15min
│
└── Data Validation
    ├── sanitizeInput()
    ├── validateContractAddress()
    ├── validateChainId()
    └── preventSQLInjection()
```

---

## 6. BACKGROUND JOBS & SCHEDULED TASKS

### 6.1 Cron Jobs
```
Scheduled Functions
│
├── Watchlist Price Monitor [PRO/PAY-AS-YOU-GO]
│   ├── Frequency: Every 5 minutes
│   ├── Function: checkWatchlistPrices()
│   └── Action: Trigger alerts if thresholds met
│
├── Daily Limit Reset [FREE]
│   ├── Frequency: Daily at UTC midnight
│   ├── Function: resetDailyLimits()
│   └── Action: Reset scan counters
│
├── Subscription Renewal [PRO]
│   ├── Frequency: Daily
│   ├── Function: processRenewals()
│   └── Action: Handle Stripe renewals
│
└── Analytics Aggregation [ADMIN]
    ├── Frequency: Daily
    ├── Function: aggregateMetrics()
    └── Action: Generate platform statistics
```

---

## 7. UTILITY & HELPER FUNCTIONS

### 7.1 Data Processing Utilities
```
Utility Functions
│
├── Data Normalization
│   ├── normalizeMarketData()
│   ├── normalizeSecurityData()
│   ├── normalizeChainData()
│   └── standardizeAddressFormat()
│
├── Calculation Utilities
│   ├── calculateRiskScore()
│   ├── applyChainWeights()
│   ├── calculatePercentageChange()
│   └── determineRiskLevel()
│
├── Format Utilities
│   ├── formatCurrency()
│   ├── formatLargeNumber()
│   ├── formatTimestamp()
│   └── formatWalletAddress()
│
└── Validation Utilities
    ├── isValidAddress()
    ├── isSupportedChain()
    ├── isValidEmail()
    └── isValidTier()
```

---

## 8. LOGGING & MONITORING

### 8.1 Logging Functions
```
Logging System
│
├── Application Logs
│   ├── logAPIRequest()
│   ├── logAPIResponse()
│   ├── logError()
│   └── logWarning()
│
├── Security Logs
│   ├── logLoginAttempt()
│   ├── logFailedAuth()
│   ├── logTierViolation()
│   └── logSuspiciousActivity()
│
└── Admin Logs [ADMIN]
    ├── logUserAction()
    ├── logTierChange()
    ├── logCreditManualAdd()
    └── logBanAction()
```

---

## Function Call Hierarchy (Execution Flow)

### Example: FREE User Analyzes Token
```
1. User clicks "Analyze" button
   └─> onClick handler (UI)
       └─> analyzeToken() (API call)
           └─> POST /api/tokens/analyze
               ├─> requireAuth() (middleware)
               ├─> validateInput()
               ├─> checkUserTier() → Returns "FREE"
               ├─> checkDailyLimit() → Verifies < 20 scans today
               │
               ├─> fetchMarketData()
               │   ├─> callMobulaAPI()
               │   └─> normalizeMarketData()
               │
               ├─> fetchSecurityData()
               │   ├─> callGoPlusAPI()
               │   └─> normalizeSecurityData()
               │
               ├─> calculateRiskScore()
               │   ├─> applyChainWeights()
               │   └─> calculate10FactorScore()
               │
               ├─> detectMemeToken()
               │   └─> callGroqAPI()
               │
               ├─> checkOfficialTokenStatus()
               ├─> detectDeadToken()
               │
               └─> Return analysis result to UI
```

### Example: PAY-AS-YOU-GO User Analyzes Token
```
1. User clicks "Analyze" button
   └─> onClick handler (UI)
       └─> analyzeToken() (API call)
           └─> POST /api/tokens/analyze
               ├─> requireAuth() (middleware)
               ├─> validateInput()
               ├─> checkUserTier() → Returns "PAY-AS-YOU-GO"
               ├─> deductCredit()
               │   ├─> getCreditBalance()
               │   ├─> checkSufficientBalance()
               │   ├─> atomicTransaction() [Firestore]
               │   └─> logDeduction()
               │
               ├─> fetchMarketData()
               ├─> fetchSecurityData()
               ├─> calculateRiskScore()
               ├─> detectMemeToken()
               ├─> checkOfficialTokenStatus()
               ├─> detectDeadToken()
               ├─> generateAISummary() [AI]
  **Authentication** |
| Register/Login | ✅ | ✅ | ✅ | ✅ |
| 2FA (TOTP) | ❌ | ❌ | ❌ | ✅ Required |
| **Core Analysis** |
| Honeypot Check | ✅ (20/day) | ✅ (Per scan) | ✅ (Unlimited) | ✅ |
| Risk Score (0-100) | ✅ (20/day) | ✅ (Per scan) | ✅ (Unlimited) | ✅ |
| 10-Factor Analysis | ✅ (20/day) | ✅ (Per scan) | ✅ (Unlimited) | ✅ |
| Chain-Adaptive Weights | ✅ | ✅ | ✅ | ✅ |
| Meme Token Detection (AI) | ✅ | ✅ | ✅ | ✅ |
| Dead Token Detection | ✅ | ✅ | ✅ | ✅ |
| Official Token Verification | ✅ | ✅ | ✅ | ✅ |
| **Premium Features** |
| AI Risk Analyst | ❌ | ✅ (1 credit) | ✅ (Unlimited) | ✅ |
| Portfolio Audit | ❌ | ✅ (0.5 credit/token) | ✅ (Unlimited) | ✅ |
| PDF Export | ✅ (Watermarked) | ✅ (No watermark) | ✅ (Custom branding) | ✅ |
| **Pro Features** |
| Smart Alerts (24/7) | ❌ | ✅ | ✅ | ✅ |
| Watchlist Management | ❌ | ✅ | ✅ | ✅ |
| Analysis History | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| **Admin Features** |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Platform Analytics | ❌ | ❌ | ❌ | ✅ |
| Activity Logs | ❌ | ❌ | ❌ | ✅ |
| Manual Credit Add | ❌ | ❌ | ❌ | ✅ |
| **Data Privacy** |
| Data Export (GDPR) | ✅ | ✅ | ✅ | ✅ |
| Account Deletion | ✅ | ✅ | ✅✅ (20/day) | ✅ (Pay per scan) | ✅ (Unlimited) | ✅ |
| View Risk Breakdown | ✅ | ✅ | ✅ | ✅ |
| AI Insights | ❌ | ✅ | ✅ | ✅ |
| Twitter Metrics | ❌ | ✅ | ✅ | ✅ |
| Add to Watchlist | ❌ | ✅ | ✅ | ✅ |
| Price Alerts | ❌ | ✅ | ✅ | ✅ |
| Analysis History | ❌ | ❌ | ✅ | ✅ |
| Export Reports | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Platform Analytics | ❌ | ❌ | ❌ | ✅ |
| Manual Credit Add | ❌ | ❌ | ❌ | ✅ |
| 2FA Required | ❌ | ❌ | ❌ | ✅ |

---

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5.9, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Firebase Firestore (NoSQL) |
| **Authentication** | NextAuth.js + Speakeasy (2FA) |
| **Blockchain APIs** | Mobula, GoPlus, Helius, Moralis, CoinGecko |
| **AI/ML** | Groq (Llama 3.3 70B), Gemini 1.5 Flash |
| **Payment** | x402 (Base USDC), Stripe |
| **Email** | Nodemailer |
| **Hosting** | Vercel |

---

**End of Hierarchy Documentation**
