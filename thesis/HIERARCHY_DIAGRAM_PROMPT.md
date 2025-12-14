# 🏗️ Complete Hierarchy Diagram Prompt for Nanobanna

**Copy and paste this entire prompt into Nanobanna or any AI diagram generator:**

---

## **PROJECT: Tokenomics Lab - System Function Hierarchy Diagram**

### **DIAGRAM SPECIFICATIONS**

**Title**: Hierarchical Structure of Computerized Functions - Tokenomics Lab Platform  
**Diagram Type**: Organizational/Hierarchical Tree Diagram  
**Standard**: IEEE Software Architecture Documentation  
**Format**: Academic thesis quality (high resolution, clear labels)  
**Layout**: Portrait orientation, A3 size optimized  
**Purpose**: Show the complete hierarchical organization of all system functions across all architectural layers

---

## **CRITICAL DESIGN RULES**

### **1. Visual Structure**
- **Root Node**: System name at the top
- **Layer Nodes**: Major architectural layers (Level 1)
- **Module Nodes**: Functional modules within each layer (Level 2)
- **Function Nodes**: Individual functions within modules (Level 3)
- **Leaf Nodes**: Specific operations or API endpoints (Level 4)

### **2. Visual Elements**
- **Boxes**: Rectangular boxes for all nodes
- **Lines**: Connecting lines from parent to child (vertical tree structure)
- **Colors**: Differentiate layers with distinct colors
- **Font**: Sans-serif, hierarchical sizing (larger for higher levels)

### **3. Hierarchy Levels**

```
Level 0: Root (System)
    ↓
Level 1: Architectural Layers (7 major layers)
    ↓
Level 2: Modules/Components (Grouped functions)
    ↓
Level 3: Functions (Individual operations)
    ↓
Level 4: Sub-functions (Detailed operations)
```

---

## **COMPLETE HIERARCHY STRUCTURE**

### **LEVEL 0: ROOT NODE**

```
┌─────────────────────────────────────────────┐
│     TOKENOMICS LAB PLATFORM                 │
│   Cryptocurrency Token Risk Analysis        │
│   Three-Tier Hybrid Payment Model           │
└─────────────────────────────────────────────┘
```

**Visual**: Large box at top center, bold text, background color: #2196F3 (blue), white text

---

### **LEVEL 1: ARCHITECTURAL LAYERS** (7 Main Branches)

Draw 7 boxes below the root, connected with vertical lines:

```
Root System
    ├── 1. PRESENTATION LAYER
    ├── 2. APPLICATION LAYER
    ├── 3. DATA ACCESS LAYER
    ├── 4. EXTERNAL INTEGRATION LAYER
    ├── 5. SECURITY & MIDDLEWARE LAYER
    ├── 6. BACKGROUND JOBS LAYER
    └── 7. UTILITY & LOGGING LAYER
```

**Visual Guidelines**:
- Each layer box: Width 300px, Height 60px
- Background colors:
  - Presentation: #E3F2FD (light blue)
  - Application: #FFF9C4 (light yellow)
  - Data Access: #E8F5E9 (light green)
  - External Integration: #FFEBEE (light red)
  - Security: #F3E5F5 (light purple)
  - Background Jobs: #FCE4EC (light pink)
  - Utility: #E0F2F1 (light teal)

---

### **LEVEL 2: MODULES & COMPONENTS**

#### **1. PRESENTATION LAYER** (Client-Side)

```
PRESENTATION LAYER
    ├── 1.1 User Interface Pages
    │   ├── Authentication Pages
    │   ├── Dashboard Pages
    │   ├── Subscription Pages
    │   └── Profile Pages
    │
    └── 1.2 React Component Tree
        ├── Layout Components
        ├── Authentication Components
        ├── Token Analysis Components
        ├── Watchlist Components
        ├── History Components
        ├── Admin Components
        └── Subscription Components
```

**Level 3 Expansion for React Components**:

```
Token Analysis Components
    ├── TokenSearchBar
    ├── ChainSelector
    ├── AnalysisResultCard
    │   ├── RiskScoreDisplay
    │   ├── RiskFactorBreakdown
    │   ├── SecurityMetrics
    │   ├── MarketMetrics
    │   └── AIInsightsPanel [PRO/PAY-AS-YOU-GO]
    ├── MemeTokenBadge
    ├── OfficialTokenBadge
    └── DeadTokenBadge
```

---

#### **2. APPLICATION LAYER** (Business Logic)

```
APPLICATION LAYER
    ├── 2.1 API Routes (Next.js)
    │   ├── /api/auth
    │   ├── /api/tokens
    │   ├── /api/watchlist
    │   ├── /api/history
    │   ├── /api/credits
    │   ├── /api/subscription
    │   ├── /api/user
    │   └── /api/admin
    │
    ├── 2.2 Core Business Logic
    │   ├── Token Analysis Module
    │   ├── Authentication Module
    │   ├── Payment & Credit Management
    │   └── Watchlist & Alert Module
    │
    └── 2.3 Tier-Based Access Control
        ├── FREE Tier Functions
        ├── PAY-AS-YOU-GO Tier Functions
        ├── PRO Tier Functions
        └── ADMIN Tier Functions
```

**Level 3 Expansion for Token Analysis Module**:

```
Token Analysis Module
    ├── analyzeToken() [MAIN FUNCTION]
    │   ├── validateInput()
    │   ├── checkUserTier()
    │   ├── checkDailyLimit() [FREE only]
    │   ├── deductCredit() [PAY-AS-YOU-GO only]
    │   │
    │   ├── fetchMarketData()
    │   │   ├── callMobulaAPI()
    │   │   ├── callCoinGeckoAPI()
    │   │   └── normalizeMarketData()
    │   │
    │   ├── fetchSecurityData()
    │   │   ├── callGoPlusAPI()
    │   │   ├── callHeliusAPI() [Solana]
    │   │   └── normalizeSecurityData()
    │   │
    │   ├── calculateRiskScore()
    │   │   ├── applyChainWeights()
    │   │   ├── calculate10FactorScore()
    │   │   │   ├── Factor 1: Liquidity
    │   │   │   ├── Factor 2: Market Cap
    │   │   │   ├── Factor 3: Holder Count
    │   │   │   ├── Factor 4: Contract Verification
    │   │   │   ├── Factor 5: Ownership Concentration
    │   │   │   ├── Factor 6: Trading Volume
    │   │   │   ├── Factor 7: Age of Token
    │   │   │   ├── Factor 8: Honeypot Detection
    │   │   │   ├── Factor 9: Buy/Sell Tax
    │   │   │   └── Factor 10: External Security Audits
    │   │   └── normalizeScore()
    │   │
    │   ├── detectMemeToken() [AI - PRO/PAY-AS-YOU-GO]
    │   │   ├── callGroqAPI()
    │   │   ├── analyzeName()
    │   │   ├── analyzeDescription()
    │   │   └── calculateMemeProbability()
    │   │
    │   ├── checkOfficialTokenStatus()
    │   │   ├── queryCoinGeckoVerified()
    │   │   └── applyOfficialOverride()
    │   │
    │   ├── detectDeadToken()
    │   │   ├── checkLiquidityZero()
    │   │   ├── checkTradingVolume()
    │   │   └── applyDeadOverride()
    │   │
    │   ├── generateAISummary() [PRO/PAY-AS-YOU-GO]
    │   │   ├── callGroqAPI()
    │   │   └── generateNaturalLanguageReport()
    │   │
    │   └── fetchTwitterMetrics() [PRO/PAY-AS-YOU-GO]
    │       ├── searchTwitterHandle()
    │       └── aggregateSocialMetrics()
    │
    ├── saveAnalysisHistory() [PRO only]
    ├── updateWatchlistPrices() [PRO/PAY-AS-YOU-GO]
    └── triggerPriceAlerts() [PRO/PAY-AS-YOU-GO]
```

**Level 3 Expansion for Authentication Module**:

```
Authentication Module
    ├── registerUser()
    │   ├── validateEmail()
    │   ├── hashPassword()
    │   ├── createFirestoreUser()
    │   └── sendWelcomeEmail()
    │
    ├── loginUser()
    │   ├── verifyCredentials()
    │   ├── checkAccountStatus()
    │   ├── require2FA() [ADMIN only]
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

**Level 3 Expansion for Payment & Credit Management**:

```
Payment & Credit Management
    ├── x402 Micropayment Flow [PAY-AS-YOU-GO]
    │   ├── initiatex402Payment()
    │   ├── verifyUSDCTransfer()
    │   ├── addCreditsToAccount()
    │   │   ├── atomicTransaction() [Firestore]
    │   │   └── createTransactionRecord()
    │   └── confirmPayment()
    │
    ├── Stripe Subscription Flow [PRO]
    │   ├── createCheckoutSession()
    │   ├── handleWebhook()
    │   │   ├── subscription.created
    │   │   ├── subscription.updated
    │   │   ├── subscription.deleted
    │   │   └── invoice.payment_failed
    │   ├── upgradeUserTier()
    │   └── scheduleRenewal()
    │
    └── Credit Management [PAY-AS-YOU-GO]
        ├── getCreditBalance()
        ├── deductCredit()
        │   ├── atomicTransaction()
        │   ├── checkSufficientBalance()
        │   └── logDeduction()
        ├── addCredits()
        └── getTransactionHistory()
```

---

#### **3. DATA ACCESS LAYER**

```
DATA ACCESS LAYER
    ├── 3.1 Firebase Firestore Collections
    │   ├── users (Collection)
    │   ├── credit_transactions (Collection)
    │   ├── watchlist (Collection)
    │   ├── analysis_history (Collection)
    │   ├── subscriptions (Collection)
    │   └── admin_logs (Collection)
    │
    └── 3.2 CRUD Operations
        ├── User Operations
        │   ├── createUser()
        │   ├── getUserById()
        │   ├── updateUserProfile()
        │   ├── deleteUser()
        │   └── queryUsersByTier()
        │
        ├── Credit Operations [PAY-AS-YOU-GO]
        │   ├── getBalance()
        │   ├── addCredits() [Atomic]
        │   ├── deductCredit() [Atomic]
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

#### **4. EXTERNAL INTEGRATION LAYER**

```
EXTERNAL INTEGRATION LAYER
    ├── 4.1 Blockchain Data APIs
    │   ├── Mobula API
    │   │   ├── /market/multi/[addresses]
    │   │   ├── /wallet/transactions
    │   │   └── /all
    │   │
    │   ├── GoPlus Security API
    │   │   ├── /token_security/[chain]
    │   │   ├── /address_security/[chain]
    │   │   └── /phishing_site
    │   │
    │   ├── Helius API [Solana]
    │   │   ├── /addresses/[address]/transactions
    │   │   ├── /tokens/metadata
    │   │   └── /rpc
    │   │
    │   ├── CoinGecko API
    │   │   ├── /coins/[id]
    │   │   ├── /simple/price
    │   │   └── /search
    │   │
    │   └── Moralis API
    │       ├── /erc20/metadata
    │       ├── /erc20/price
    │       └── /token/[address]/price
    │
    ├── 4.2 AI & ML Services
    │   ├── Groq API (Primary)
    │   │   ├── Model: Llama 3.3 70B
    │   │   ├── detectMemeToken()
    │   │   └── generateAISummary()
    │   │
    │   └── Gemini 1.5 Flash (Fallback)
    │       └── /chat/completions
    │
    ├── 4.3 Payment Processing
    │   ├── x402 Protocol [PAY-AS-YOU-GO]
    │   │   ├── Base USDC blockchain
    │   │   ├── verifyUSDCTransfer()
    │   │   └── confirmTransaction()
    │   │
    │   └── Stripe [PRO]
    │       ├── createCheckoutSession()
    │       ├── handleWebhook()
    │       └── manageSubscription()
    │
    └── 4.4 Communication Services
        ├── Nodemailer (Email)
        │   ├── sendWelcomeEmail()
        │   ├── sendResetEmail()
        │   ├── sendAlertEmail()
        │   └── sendSubscriptionReminder()
        │
        └── Firebase Cloud Messaging (Future)
            ├── sendPushNotification()
            └── sendRealtimeAlert()
```

---

#### **5. SECURITY & MIDDLEWARE LAYER**

```
SECURITY & MIDDLEWARE LAYER
    ├── 5.1 Authentication Middleware
    │   ├── verifyJWTToken()
    │   ├── checkSessionExpiry()
    │   └── refreshToken()
    │
    ├── 5.2 Authorization Middleware
    │   ├── requireAuth()
    │   ├── requireTier(tier: string)
    │   ├── requireAdmin()
    │   └── check2FA() [ADMIN]
    │
    ├── 5.3 Rate Limiting
    │   ├── API Rate Limits
    │   │   ├── FREE: 20 requests/day
    │   │   ├── PAY-AS-YOU-GO: Credit-based
    │   │   └── PRO: 1000 requests/day
    │   │
    │   └── Specific Limits
    │       ├── AI requests: 10/min
    │       ├── Credit purchases: 3/hour
    │       └── Login attempts: 5/15min
    │
    └── 5.4 Data Validation
        ├── sanitizeInput()
        ├── validateContractAddress()
        ├── validateChainId()
        └── preventSQLInjection()
```

---

#### **6. BACKGROUND JOBS LAYER**

```
BACKGROUND JOBS LAYER
    ├── 6.1 Scheduled Cron Jobs
    │   ├── Watchlist Price Monitor [PRO/PAY-AS-YOU-GO]
    │   │   ├── Frequency: Every 5 minutes
    │   │   ├── checkWatchlistPrices()
    │   │   └── triggerAlerts()
    │   │
    │   ├── Daily Limit Reset [FREE]
    │   │   ├── Frequency: Daily at UTC midnight
    │   │   ├── resetDailyLimits()
    │   │   └── clearCounters()
    │   │
    │   ├── Subscription Renewal [PRO]
    │   │   ├── Frequency: Daily
    │   │   ├── processRenewals()
    │   │   └── handleFailedPayments()
    │   │
    │   └── Analytics Aggregation [ADMIN]
    │       ├── Frequency: Daily
    │       ├── aggregateMetrics()
    │       └── generateReports()
    │
    └── 6.2 Event-Driven Jobs
        ├── onUserRegister()
        ├── onTokenAnalysis()
        ├── onCreditPurchase()
        └── onSubscriptionChange()
```

---

#### **7. UTILITY & LOGGING LAYER**

```
UTILITY & LOGGING LAYER
    ├── 7.1 Data Processing Utilities
    │   ├── Data Normalization
    │   │   ├── normalizeMarketData()
    │   │   ├── normalizeSecurityData()
    │   │   ├── normalizeChainData()
    │   │   └── standardizeAddressFormat()
    │   │
    │   ├── Calculation Utilities
    │   │   ├── calculateRiskScore()
    │   │   ├── applyChainWeights()
    │   │   ├── calculatePercentageChange()
    │   │   └── determineRiskLevel()
    │   │
    │   ├── Format Utilities
    │   │   ├── formatCurrency()
    │   │   ├── formatLargeNumber()
    │   │   ├── formatTimestamp()
    │   │   └── formatWalletAddress()
    │   │
    │   └── Validation Utilities
    │       ├── isValidAddress()
    │       ├── isSupportedChain()
    │       ├── isValidEmail()
    │       └── isValidTier()
    │
    └── 7.2 Logging System
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

## **VISUAL LAYOUT INSTRUCTIONS**

### **Hierarchical Tree Structure**

```
                    ┌─────────────────────────────────┐
                    │   TOKENOMICS LAB PLATFORM       │
                    │  (Root Node - Level 0)          │
                    └─────────────────────────────────┘
                                   |
        ┌──────────────────────────┼──────────────────────────┐
        |                          |                          |
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│ PRESENTATION  │        │ APPLICATION   │        │  DATA ACCESS  │
│    LAYER      │        │    LAYER      │        │     LAYER     │
│  (Level 1)    │        │  (Level 1)    │        │  (Level 1)    │
└───────────────┘        └───────────────┘        └───────────────┘
        |                        |                        |
  ┌─────┴─────┐          ┌──────┴──────┐         ┌──────┴──────┐
  |           |          |             |         |             |
[UI Pages] [Components] [API Routes] [Logic]  [Collections] [CRUD]
(Level 2)   (Level 2)   (Level 2)  (Level 2)  (Level 2)   (Level 2)
  |           |          |             |         |             |
[Functions] [Functions] [Endpoints] [Modules] [Tables]  [Operations]
(Level 3)   (Level 3)   (Level 3)  (Level 3)  (Level 3)   (Level 3)

[Continue pattern for remaining layers...]
```

### **Spacing Guidelines**
- **Vertical spacing between levels**: 80px
- **Horizontal spacing between siblings**: 50px
- **Box dimensions**:
  - Level 0 (Root): 400px × 80px
  - Level 1 (Layers): 300px × 60px
  - Level 2 (Modules): 250px × 50px
  - Level 3 (Functions): 200px × 40px
  - Level 4 (Sub-functions): 180px × 35px

### **Connection Lines**
- **Style**: Solid lines, 2px width
- **Color**: #666666 (dark gray)
- **Type**: Orthogonal (vertical then horizontal branches)

---

## **COLOR CODING**

```
Layer Color Scheme:
- Level 0 (Root): #2196F3 (blue) with white text
- Level 1 (Layers):
  * Presentation: #E3F2FD (light blue)
  * Application: #FFF9C4 (light yellow)
  * Data Access: #E8F5E9 (light green)
  * External Integration: #FFEBEE (light red)
  * Security: #F3E5F5 (light purple)
  * Background Jobs: #FCE4EC (light pink)
  * Utility: #E0F2F1 (light teal)
- Level 2 (Modules): Same as parent layer, slightly darker
- Level 3 (Functions): White background, gray border
- Level 4 (Sub-functions): White background, light gray border

Tier-Based Color Coding (add icons/badges):
- FREE functions: 🆓 icon
- PAY-AS-YOU-GO functions: 💰 icon
- PRO functions: ⭐ icon
- ADMIN functions: 🔐 icon
```

---

## **ANNOTATIONS**

Add these text boxes near relevant sections:

**Near Root Node**:
```
"Three-Tier Hybrid Model:
- FREE (20 scans/day)
- PAY-AS-YOU-GO ($0.10/scan via x402)
- PRO ($29/month unlimited)
- ADMIN (All PRO + Management)"
```

**Near Token Analysis Module**:
```
"Core Algorithm:
- 10-factor risk scoring
- Chain-adaptive weights
- AI meme detection (Groq Llama 3.3 70B)
- Official/Dead token overrides
- Real-time blockchain data"
```

**Near External Integration Layer**:
```
"External APIs:
- Mobula (market data)
- GoPlus (security)
- Helius (Solana)
- Groq AI (95% meme detection accuracy)
- CoinGecko (verification)"
```

**Near Payment Processing**:
```
"x402 Protocol:
- Base USDC blockchain
- $0.10 minimum transaction
- ~$0.02 gas fee
- Instant settlement
- No intermediaries"
```

---

## **LEGEND (Bottom Right Corner)**

```
┌──────────────────────────────────────┐
│         NOTATION LEGEND              │
├──────────────────────────────────────┤
│ [Rectangle]  Function/Module         │
│      |       Parent-Child Connection │
│     ───      Sibling Separation      │
│                                      │
│ Tier Access Icons:                   │
│ 🆓  FREE tier only                    │
│ 💰  PAY-AS-YOU-GO tier                │
│ ⭐  PRO tier required                 │
│ 🔐  ADMIN tier required               │
│                                      │
│ Layer Colors:                        │
│ [Blue]    Presentation               │
│ [Yellow]  Application Logic          │
│ [Green]   Data Access                │
│ [Red]     External Integration       │
│ [Purple]  Security & Middleware      │
│ [Pink]    Background Jobs            │
│ [Teal]    Utilities & Logging        │
└──────────────────────────────────────┘
```

---

## **DIAGRAM VALIDATION CHECKLIST**

Before finalizing, verify:

- [ ] Root node is at the top center
- [ ] All 7 architectural layers are clearly separated
- [ ] Hierarchical depth goes to at least Level 3 (functions)
- [ ] Token Analysis Module is fully expanded (shows all sub-functions)
- [ ] Color coding is consistent across layers
- [ ] Tier-based access icons are visible (🆓💰⭐🔐)
- [ ] Connection lines are clean and don't overlap
- [ ] Text is readable at all levels (font sizes decrease by level)
- [ ] Legend is included and matches the diagram
- [ ] Annotations explain key technical concepts
- [ ] No orphaned nodes (all nodes connected to parent)
- [ ] Spacing is consistent between same-level siblings

---

## **EXPORT SPECIFICATIONS**

**Format**: PNG or SVG  
**Resolution**: 300 DPI minimum (for thesis printing)  
**Dimensions**: 2480 × 3508 pixels (A3 portrait at 300 DPI)  
**Background**: White  
**Border**: 20px padding on all sides

---

## **FIGURE CAPTION FOR THESIS**

Use this caption below the diagram:

```
Figure X: Hierarchical Structure of Computerized Functions in Tokenomics Lab Platform

The diagram illustrates the complete hierarchical organization of all computerized functions across seven architectural layers. The system follows a layered architecture pattern with clear separation between presentation, business logic, data access, and external integration concerns. The core Token Analysis Module implements a 10-factor risk scoring algorithm with chain-adaptive weights and AI-powered meme token detection (95% accuracy using Groq Llama 3.3 70B). The three-tier hybrid payment model (FREE, PAY-AS-YOU-GO, PRO) is enforced through tier-based access control at the application layer. The x402 micropayment protocol enables pay-per-scan functionality with transactions as low as $0.10. External integrations include Mobula (market data), GoPlus (security audits), Helius (Solana), CoinGecko (verification), and Stripe (subscriptions). Security middleware enforces authentication, authorization, rate limiting, and data validation across all layers. Background jobs handle watchlist monitoring (5-min intervals), daily limit resets, and subscription renewals.
```

---

## **ADDITIONAL NOTES FOR NANOBANNA**

**Prompt optimization tips**:
1. Start with: "Create a hierarchical tree diagram following these exact specifications:"
2. Emphasize: "Use a top-down tree structure with the root at the top"
3. Specify: "Make boxes larger at higher levels, smaller at lower levels"
4. Request: "Fully expand the Token Analysis Module to show all 10 risk factors"
5. Clarify: "Use distinct colors for each of the 7 architectural layers"
6. Note: "Include tier-based access icons (🆓💰⭐🔐) next to relevant functions"
7. Important: "Show all payment flows: x402 for PAY-AS-YOU-GO, Stripe for PRO"

---

**END OF PROMPT - COPY EVERYTHING ABOVE THIS LINE**

---

This prompt is ready to paste into Nanobanna or any AI diagram generator to create a comprehensive hierarchical diagram of all computerized functions in the Tokenomics Lab platform! 🚀
