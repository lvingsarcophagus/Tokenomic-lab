# 📊 Complete Level 1 Data Flow Diagram (DFD) Prompt for Nanobanna

**Copy and paste this entire prompt into Nanobanna or any AI diagram generator:**

---

## **PROJECT: Tokenomics Lab - Level 1 Data Flow Diagram**

### **DIAGRAM SPECIFICATIONS**

**Title**: Level 1 DFD - Token Analysis System with Three-Tier Access Control  
**Diagram Type**: Level 1 Data Flow Diagram (DFD)  
**Standard**: Yourdon-DeMarco Notation  
**Format**: Academic thesis quality (high resolution, clear labels)  
**Layout**: Landscape orientation, A3 size optimized  
**Purpose**: Show major processes, data stores, external entities, and data flows in the token analysis system

---

## **CRITICAL DFD NOTATION RULES**

### **1. External Entities (Rectangles)**
- **Symbol**: Rectangle box
- **Purpose**: Sources or destinations of data OUTSIDE the system
- **Examples**: User, External APIs, Payment System
- **Naming**: Noun phrases (singular)

### **2. Processes (Circles/Rounded Rectangles)**
- **Symbol**: Circle or rounded rectangle
- **Numbering**: 1.0, 2.0, 3.0, etc. (Level 1)
- **Purpose**: Transform incoming data into outgoing data
- **Naming**: Verb + Object (e.g., "Authenticate User", "Calculate Risk")

### **3. Data Stores (Open Rectangles)**
- **Symbol**: Open-ended rectangle (parallel lines)
- **Numbering**: D1, D2, D3, etc.
- **Purpose**: Storage of data at rest
- **Naming**: Noun phrases (plural or collective)

### **4. Data Flows (Arrows)**
- **Symbol**: Arrow with label
- **Purpose**: Movement of data between entities, processes, and stores
- **Naming**: Noun describing the data (e.g., "User Credentials", "Risk Score")
- **Direction**: Shows flow direction

---

## **EXTERNAL ENTITIES**

### **E1: User** (Left Side)
```
┌──────────┐
│   USER   │
│          │
└──────────┘
```
- **Role**: Initiates token analysis requests
- **Tiers**: FREE, PAY-AS-YOU-GO, PRO, ADMIN

### **E2: Blockchain APIs** (Top Right)
```
┌───────────────────┐
│  Blockchain APIs  │
│  (Mobula, GoPlus, │
│   CoinGecko)      │
└───────────────────┘
```
- **Role**: Provides market data, security data, verification

### **E3: AI APIs** (Top Right)
```
┌───────────────────┐
│     AI APIs       │
│  (Groq, Gemini)   │
└───────────────────┘
```
- **Role**: Meme token detection, AI summary generation

### **E4: Payment System** (Bottom Right)
```
┌───────────────────┐
│  Payment System   │
│ (x402 + Stripe)   │
└───────────────────┘
```
- **Role**: Processes credit purchases and subscriptions
- **x402**: Solana blockchain (USDT + SOL)

### **E5: Email Service** (Bottom Right)
```
┌───────────────────┐
│  Email Service    │
│   (Nodemailer)    │
└───────────────────┘
```
- **Role**: Sends alerts, notifications, password resets

---

## **DATA STORES**

### **D1: users**
```
D1 ║ users ║
```
- **Contents**: userId, email, tier, dailyScanCount, twoFactorEnabled, profilePicture
- **Purpose**: Store user profiles and tier information

### **D2: user_credits**
```
D2 ║ user_credits ║
```
- **Contents**: userId, balance, totalPurchased, totalSpent, lastUpdated
- **Purpose**: Track credit balance for PAY-AS-YOU-GO users

### **D3: activity_logs**
```
D3 ║ activity_logs ║
```
- **Contents**: userId, action, timestamp, ipAddress, userAgent, dailyScanCount
- **Purpose**: Log all user actions and track daily scan count for FREE users

### **D4: analysis_cache**
```
D4 ║ analysis_cache ║
```
- **Contents**: tokenAddress, chain, cachedData, timestamp, expiresAt
- **Purpose**: Cache recent analysis results to improve performance

### **D5: chain_config**
```
D5 ║ chain_config ║
```
- **Contents**: chainType, weights, riskThresholds, supportedFeatures
- **Purpose**: Store chain-specific risk calculation weights and configuration

### **D6: analysis_history**
```
D6 ║ analysis_history ║
```
- **Contents**: userId, tokenAddress, chain, riskScore, analysisData, timestamp
- **Purpose**: Store analysis history for PRO users only

### **D7: watchlist**
```
D7 ║ watchlist ║
```
- **Contents**: userId, tokenAddress, chain, symbol, addedAt, lastPriceCheck
- **Purpose**: Store watchlist tokens for PRO/PAY-AS-YOU-GO users

---

## **PROCESSES (Level 1)**

### **Process 1.0: Authenticate & Authorize User**
```
    ┌─────────────────────────────┐
    │   1.0                       │
    │   Authenticate &            │
    │   Authorize User            │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Login Credentials (from User)
- Session Token (from User)

**Outputs:**
- Authenticated User + Tier Info
- Error Message (if authentication fails)

**Data Stores Accessed:**
- **READ**: D1 users (retrieve user profile, tier, 2FA status)

**Description**: Validates user credentials, checks 2FA for ADMIN, retrieves user tier information.

---

### **Process 2.0: Check Tier & Access Control**
```
    ┌─────────────────────────────┐
    │   2.0                       │
    │   Check Tier &              │
    │   Access Control            │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Authenticated User + Tier Info (from 1.0)
- Analysis Request (token address, chain)

**Outputs:**
- Approved Request (if access granted)
- Access Denied Error (if daily limit exceeded or insufficient credits)

**Data Stores Accessed:**
- **READ**: D3 activity_logs (check daily scan count for FREE)
- **READ/WRITE**: D2 user_credits (check balance and deduct credit for PAY-AS-YOU-GO)
- **WRITE**: D3 activity_logs (log access attempt)

**Decision Logic:**
- **FREE Tier**: Check if dailyScanCount < 20
- **PAY-AS-YOU-GO Tier**: Check if balance ≥ 1 credit, deduct 1 credit atomically
- **PRO Tier**: Proceed (unlimited)
- **ADMIN Tier**: Proceed (unlimited + logging)

---

### **Process 3.0: Validate Input**
```
    ┌─────────────────────────────┐
    │   3.0                       │
    │   Validate Input            │
    │   (Address & Chain)         │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Approved Request (from 2.0)

**Outputs:**
- Valid Token Request
- Validation Error (if invalid address format)

**Data Stores Accessed:**
- **READ**: D5 chain_config (verify supported chains)

**Description**: Validates contract address format, checks chain support, sanitizes input.

---

### **Process 4.0: Check Analysis Cache**
```
    ┌─────────────────────────────┐
    │   4.0                       │
    │   Check Analysis Cache      │
    │                             │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Valid Token Request (from 3.0)

**Outputs:**
- Cached Result (if cache hit and not expired)
- Cache Miss Signal (proceed to fetch)

**Data Stores Accessed:**
- **READ**: D4 analysis_cache (lookup by tokenAddress + chain)

**Description**: Checks if recent analysis exists (< 5 minutes old), returns cached data if valid.

---

### **Process 5.0: Fetch & Normalize Data**
```
    ┌─────────────────────────────┐
    │   5.0                       │
    │   Fetch & Normalize         │
    │   External Data             │
    │   (Parallel API Calls)      │
    └─────────────────────────────┘
```
**Inputs:**
- Cache Miss Signal (from 4.0)
- Token Address + Chain (from 3.0)

**Outputs:**
- Normalized Market Data
- Normalized Security Data
- Normalized AI Data (meme detection)

**External Entities Accessed:**
- **E2: Blockchain APIs** → Market data, security data, verification
- **E3: AI APIs** → Meme token detection

**Data Stores Accessed:**
- **WRITE**: D4 analysis_cache (store fetched data)

**Description**: Makes parallel API calls to Mobula (market), GoPlus (security), Groq (AI meme detection), normalizes responses to unified format.

---

### **Process 6.0: Calculate Risk Score**
```
    ┌─────────────────────────────┐
    │   6.0                       │
    │   Calculate Risk Score      │
    │   (10-Factor Algorithm)     │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Normalized Market Data (from 5.0)
- Normalized Security Data (from 5.0)
- Chain-Specific Weights (from D5)

**Outputs:**
- Raw Risk Score (0-100)
- 10-Factor Breakdown
- Risk Level (LOW/MEDIUM/HIGH/CRITICAL)

**Data Stores Accessed:**
- **READ**: D5 chain_config (retrieve chain-specific weights)

**Description**: Applies 10-factor risk algorithm with chain-adaptive weights, calculates normalized score (0-100).

---

### **Process 7.0: Apply Override Rules**
```
    ┌─────────────────────────────┐
    │   7.0                       │
    │   Apply Override Rules      │
    │   (Official/Dead/Meme)      │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Raw Risk Score (from 6.0)
- Normalized AI Data (from 5.0)
- Security Data (from 5.0)

**Outputs:**
- Final Risk Score (with overrides applied)
- Token Status Flags (official, dead, meme)

**External Entities Accessed:**
- **E2: Blockchain APIs** → CoinGecko verification status

**Description**: Checks official token status (override to LOW risk if verified), dead token status (override to CRITICAL if inactive), applies meme token flag.

---

### **Process 8.0: Generate AI Summary (Conditional)**
```
    ┌─────────────────────────────┐
    │   8.0                       │
    │   Generate AI Summary       │
    │   [PRO/PAY-AS-YOU-GO Only]  │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Final Risk Score (from 7.0)
- 10-Factor Breakdown (from 6.0)
- User Tier Info (from 1.0)

**Outputs:**
- AI Risk Analysis Report (natural language)
- None (if FREE tier)

**External Entities Accessed:**
- **E3: AI APIs** → Groq Llama 3.3 70B (primary), Gemini 1.5 Flash (fallback)

**Condition**: Only executes if User Tier = PRO OR PAY-AS-YOU-GO

**Description**: Calls Groq AI to generate natural language risk summary, explains red flags, provides recommendations.

---

### **Process 9.0: Archive Analysis (Conditional)**
```
    ┌─────────────────────────────┐
    │   9.0                       │
    │   Archive Analysis          │
    │   [PRO Users Only]          │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Final Risk Score (from 7.0)
- Complete Analysis Data (from 6.0, 7.0, 8.0)
- User Tier Info (from 1.0)

**Outputs:**
- Saved Analysis Record

**Data Stores Accessed:**
- **WRITE**: D6 analysis_history (save complete analysis)

**Condition**: Only executes if User Tier = PRO

**Description**: Saves complete analysis to history database for future reference.

---

### **Process 10.0: Update Watchlist (Conditional)**
```
    ┌─────────────────────────────┐
    │   10.0                      │
    │   Update Watchlist          │
    │   [PRO/PAY-AS-YOU-GO Only]  │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Token Address + Chain (from 3.0)
- Final Risk Score (from 7.0)
- User Tier Info (from 1.0)

**Outputs:**
- Updated Watchlist Record (if token is in watchlist)

**Data Stores Accessed:**
- **READ/WRITE**: D7 watchlist (update lastPriceCheck, current risk score)

**Condition**: Only executes if User Tier = PRO OR PAY-AS-YOU-GO AND token exists in watchlist

**Description**: Updates watchlist entry with latest analysis results, triggers price alerts if thresholds met.

---

### **Process 11.0: Generate Report & Export**
```
    ┌─────────────────────────────┐
    │   11.0                      │
    │   Generate Report &         │
    │   Export (PDF)              │
    │                             │
    └─────────────────────────────┘
```
**Inputs:**
- Final Risk Score (from 7.0)
- 10-Factor Breakdown (from 6.0)
- AI Summary (from 8.0, if available)
- User Tier Info (from 1.0)

**Outputs:**
- Analysis Report (JSON to User)
- PDF Report (with/without watermark based on tier)

**Description**: Formats analysis results for display, generates PDF report (watermarked for FREE, custom branding for PRO).

---

## **COMPLETE DATA FLOW CONNECTIONS**

### **1. User → 1.0 Authenticate & Authorize**
- **Flow**: Login Credentials
- **Arrow**: User → [Login Credentials] → 1.0

### **2. 1.0 → D1 users (READ)**
- **Flow**: Credential Lookup
- **Arrow**: 1.0 → [Credential Lookup] → D1 users
- **Return**: 1.0 ← [User Profile + Tier] ← D1 users

### **3. 1.0 → 2.0 Check Tier & Access Control**
- **Flow**: Authenticated User + Tier Info
- **Arrow**: 1.0 → [Authenticated User + Tier] → 2.0

### **4. User → 2.0 Check Tier & Access Control**
- **Flow**: Analysis Request (token address, chain)
- **Arrow**: User → [Analysis Request] → 2.0

### **5. 2.0 → D3 activity_logs (READ - FREE Tier)**
- **Flow**: Daily Scan Count Check
- **Arrow**: 2.0 → [Check Daily Count] → D3 activity_logs
- **Return**: 2.0 ← [Current Count] ← D3 activity_logs

### **6. 2.0 → D2 user_credits (READ/WRITE - PAY-AS-YOU-GO Tier)**
- **Flow**: Credit Balance Check & Deduction
- **Arrow**: 2.0 → [Check Balance] → D2 user_credits
- **Action**: 2.0 → [Deduct 1 Credit (Atomic)] → D2 user_credits
- **Return**: 2.0 ← [New Balance] ← D2 user_credits

### **7. 2.0 → D3 activity_logs (WRITE - All Tiers)**
- **Flow**: Log Access Attempt
- **Arrow**: 2.0 → [Log Action] → D3 activity_logs

### **8. 2.0 → 3.0 Validate Input**
- **Flow**: Approved Request
- **Arrow**: 2.0 → [Approved Request] → 3.0

### **9. 3.0 → D5 chain_config (READ)**
- **Flow**: Supported Chain Verification
- **Arrow**: 3.0 → [Chain Lookup] → D5 chain_config
- **Return**: 3.0 ← [Chain Support Status] ← D5 chain_config

### **10. 3.0 → 4.0 Check Analysis Cache**
- **Flow**: Valid Token Request
- **Arrow**: 3.0 → [Valid Token Request] → 4.0

### **11. 4.0 → D4 analysis_cache (READ)**
- **Flow**: Cache Lookup
- **Arrow**: 4.0 → [Token Address + Chain] → D4 analysis_cache
- **Return**: 4.0 ← [Cached Data OR Cache Miss] ← D4 analysis_cache

### **12. 4.0 → 11.0 Generate Report (Cache Hit Path)**
- **Flow**: Cached Result
- **Arrow**: 4.0 → [Cached Analysis Result] → 11.0

### **13. 4.0 → 5.0 Fetch & Normalize (Cache Miss Path)**
- **Flow**: Cache Miss Signal
- **Arrow**: 4.0 → [Cache Miss + Token Request] → 5.0

### **14. 5.0 → E2 Blockchain APIs**
- **Flow**: API Request (token address, chain)
- **Arrow**: 5.0 → [Token Lookup Request] → E2 Blockchain APIs
- **Return**: 5.0 ← [Market + Security Data] ← E2 Blockchain APIs

### **15. 5.0 → E3 AI APIs**
- **Flow**: Meme Detection Request
- **Arrow**: 5.0 → [Token Name + Description] → E3 AI APIs
- **Return**: 5.0 ← [Meme Probability (0-100%)] ← E3 AI APIs

### **16. 5.0 → D4 analysis_cache (WRITE)**
- **Flow**: Store Fetched Data
- **Arrow**: 5.0 → [Normalized Data] → D4 analysis_cache

### **17. 5.0 → 6.0 Calculate Risk Score**
- **Flow**: Normalized Market + Security Data
- **Arrow**: 5.0 → [Normalized Data] → 6.0

### **18. D5 chain_config → 6.0 (READ)**
- **Flow**: Chain-Specific Weights
- **Arrow**: D5 chain_config → [Risk Weights] → 6.0

### **19. 6.0 → 7.0 Apply Override Rules**
- **Flow**: Raw Risk Score + Breakdown
- **Arrow**: 6.0 → [Raw Risk Score + Factors] → 7.0

### **20. 5.0 → 7.0 Apply Override Rules**
- **Flow**: AI Data + Security Data
- **Arrow**: 5.0 → [AI + Security Data] → 7.0

### **21. 7.0 → E2 Blockchain APIs (CoinGecko)**
- **Flow**: Verification Status Check
- **Arrow**: 7.0 → [Token Verification Request] → E2 Blockchain APIs
- **Return**: 7.0 ← [Official Status] ← E2 Blockchain APIs

### **22. 7.0 → 8.0 Generate AI Summary**
- **Flow**: Final Risk Score + Breakdown
- **Arrow**: 7.0 → [Final Risk Score + Factors] → 8.0

### **23. 1.0 → 8.0 Generate AI Summary**
- **Flow**: User Tier Info (condition check)
- **Arrow**: 1.0 → [User Tier] → 8.0

### **24. 8.0 → E3 AI APIs**
- **Flow**: Summary Generation Request
- **Arrow**: 8.0 → [Risk Data + Context] → E3 AI APIs
- **Return**: 8.0 ← [Natural Language Summary] ← E3 AI APIs

### **25. 7.0 → 9.0 Archive Analysis**
- **Flow**: Final Risk Score + Complete Data
- **Arrow**: 7.0 → [Complete Analysis Data] → 9.0

### **26. 8.0 → 9.0 Archive Analysis**
- **Flow**: AI Summary (if generated)
- **Arrow**: 8.0 → [AI Summary] → 9.0

### **27. 1.0 → 9.0 Archive Analysis**
- **Flow**: User Tier Info (condition check)
- **Arrow**: 1.0 → [User Tier] → 9.0

### **28. 9.0 → D6 analysis_history (WRITE)**
- **Flow**: Save Complete Analysis
- **Arrow**: 9.0 → [Analysis Record] → D6 analysis_history

### **29. 7.0 → 10.0 Update Watchlist**
- **Flow**: Token Address + Final Risk Score
- **Arrow**: 7.0 → [Token + Risk Score] → 10.0

### **30. 1.0 → 10.0 Update Watchlist**
- **Flow**: User Tier Info (condition check)
- **Arrow**: 1.0 → [User Tier] → 10.0

### **31. 10.0 → D7 watchlist (READ/WRITE)**
- **Flow**: Check if Token in Watchlist
- **Arrow**: 10.0 → [Token Lookup] → D7 watchlist
- **Return**: 10.0 ← [Watchlist Entry OR Not Found] ← D7 watchlist
- **Update**: 10.0 → [Update Price + Risk] → D7 watchlist

### **32. 10.0 → E5 Email Service (if alert triggered)**
- **Flow**: Alert Notification Request
- **Arrow**: 10.0 → [Alert Details] → E5 Email Service

### **33. 7.0 → 11.0 Generate Report**
- **Flow**: Final Risk Score + Breakdown
- **Arrow**: 7.0 → [Final Results] → 11.0

### **34. 8.0 → 11.0 Generate Report**
- **Flow**: AI Summary (if available)
- **Arrow**: 8.0 → [AI Summary] → 11.0

### **35. 1.0 → 11.0 Generate Report**
- **Flow**: User Tier Info (for PDF formatting)
- **Arrow**: 1.0 → [User Tier] → 11.0

### **36. 11.0 → User**
- **Flow**: Analysis Report (JSON + PDF)
- **Arrow**: 11.0 → [Analysis Report] → User

---

## **SECONDARY FLOW: CREDIT PURCHASE (x402)**

### **Process 12.0: Process Credit Purchase**
```
    ┌─────────────────────────────┐
    │   12.0                      │
    │   Process Credit Purchase   │
    │   (x402 Protocol)           │
    │                             │
    └─────────────────────────────┘
```

**Inputs:**
- Credit Purchase Request (from User)
- Amount (10, 50, 100 credits)

**Outputs:**
- Payment Success + New Balance
- Payment Failed Error

**External Entities Accessed:**
- **E4: Payment System** → x402 (Solana blockchain - USDT/SOL)

**Data Stores Accessed:**
- **WRITE**: D2 user_credits (add credits atomically)
- **WRITE**: D3 activity_logs (log purchase transaction)

**Flow Connections:**
- User → [Purchase Request] → 12.0
- 12.0 → [Payment Details] → E4 Payment System
- 12.0 ← [Transaction Confirmed] ← E4 Payment System
- 12.0 → [Add Credits (Atomic)] → D2 user_credits
- 12.0 → [Log Purchase] → D3 activity_logs
- 12.0 → [Purchase Success] → User

---

## **VISUAL LAYOUT INSTRUCTIONS**

### **Spatial Organization**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  TOKENOMICS LAB - LEVEL 1 DFD                           │
│            Token Analysis System (Three-Tier Access Model)              │
└─────────────────────────────────────────────────────────────────────────┘

LEFT SIDE                 CENTER                      RIGHT SIDE
┌──────────┐                                     ┌───────────────┐
│   USER   │                                     │ Blockchain    │
│  (E1)    │                                     │ APIs (E2)     │
└──────────┘                                     └───────────────┘
     ↓                                                  ↑ ↓
     ↓                                           ┌───────────────┐
     ↓         ┌───────────────┐                │  AI APIs      │
     └────────→│ 1.0           │                │  (E3)         │
               │ Authenticate  │                └───────────────┘
               └───────────────┘                       ↑ ↓
                      ↓ ↑
                      ↓ D1 users
                      ↓
               ┌───────────────┐
               │ 2.0           │
               │ Check Tier    │← D2 user_credits
               └───────────────┘← D3 activity_logs
                      ↓
               ┌───────────────┐
               │ 3.0           │
               │ Validate      │← D5 chain_config
               └───────────────┘
                      ↓
               ┌───────────────┐
               │ 4.0           │
               │ Cache Check   │← D4 analysis_cache
               └───────────────┘
                  ↓ (miss) ↓ (hit)
               ┌───────────────┐
               │ 5.0           │← E2 Blockchain APIs
               │ Fetch Data    │← E3 AI APIs
               └───────────────┘→ D4 analysis_cache
                      ↓
               ┌───────────────┐
               │ 6.0           │← D5 chain_config
               │ Calculate Risk│
               └───────────────┘
                      ↓
               ┌───────────────┐
               │ 7.0           │← E2 CoinGecko
               │ Apply Overrides│
               └───────────────┘
                   ↓  ↓  ↓
        ┌──────────┴──┴──┴──────────┐
        ↓          ↓            ↓
┌───────────┐ ┌───────────┐ ┌──────────┐
│ 8.0 AI    │ │ 9.0 Archive│ │ 10.0     │
│ Summary   │ │ (PRO only) │ │ Watchlist│
│ (PRO/PAY) │ │            │ │ (PRO/PAY)│
└───────────┘ └───────────┘ └──────────┘
     ↓ ↑            ↓              ↓ ↑
     ↓ E3 AI APIs   ↓ D6 history   ↓ D7 watchlist
     ↓              ↓              ↓ → E5 Email
     └──────────────┴──────────────┘
                    ↓
             ┌───────────────┐
             │ 11.0          │
             │ Generate      │
             │ Report        │
             └───────────────┘
                    ↓
             [Analysis Report]
                    ↓
                  USER

BOTTOM RIGHT:
┌───────────────┐
│ Payment       │
│ System (E4)   │
└───────────────┘
      ↑ ↓
┌───────────────┐
│ 12.0          │← D2 user_credits
│ Credit        │→ D3 activity_logs
│ Purchase      │
└───────────────┘
      ↑ ↓
    USER
```

### **Element Sizing**

- **External Entities**: 120px × 80px rectangles
- **Processes**: 140px × 100px circles or rounded rectangles
- **Data Stores**: 200px × 40px open rectangles (parallel lines)
- **Arrows**: 2px width, solid lines with arrowheads
- **Labels**: 10pt font, positioned near arrows

---

## **COLOR CODING**

```
Color Scheme:
- External Entities: Blue (#2196F3)
- Processes:
  * Authentication/Authorization (1.0, 2.0): Light Red (#FFEBEE)
  * Core Analysis (3.0-7.0): Light Yellow (#FFF9C4)
  * Premium Features (8.0, 9.0, 10.0): Light Green (#E8F5E9)
  * Report Generation (11.0): Light Blue (#E3F2FD)
  * Payment (12.0): Light Purple (#F3E5F5)
- Data Stores: Light Gray (#F5F5F5) with dark border
- Arrows: Black (#000000)
- Tier-Specific Flows:
  * FREE: Blue arrows
  * PAY-AS-YOU-GO: Yellow arrows
  * PRO: Green arrows
```

---

## **ANNOTATIONS**

Add these text boxes near relevant sections:

**Near Process 2.0:**
```
"Three-Tier Access Control:
- FREE: Check daily limit (20 scans/day)
- PAY-AS-YOU-GO: Deduct 1 credit (atomic)
- PRO: Unlimited access
- ADMIN: Unlimited + 2FA required"
```

**Near Process 5.0:**
```
"Parallel API Calls:
- Mobula API (market data)
- GoPlus API (security audit)
- Groq AI (meme detection)
Average response time: 2-3 seconds"
```

**Near Process 6.0:**
```
"10-Factor Risk Algorithm:
- Liquidity, Market Cap, Holder Distribution
- Contract Verification, Ownership Concentration
- Trading Volume, Token Age, Honeypot Detection
- Buy/Sell Tax, External Audits
Chain-adaptive weights applied"
```

**Near D2 user_credits:**
```
"Atomic Transactions:
Firestore transactions ensure credit
deduction is atomic and consistent.
Prevents race conditions."
```

**Near Process 12.0:**
```
"x402 Micropayment Protocol:
- Solana blockchain
- Accepts USDT + SOL
- $0.10 minimum transaction
- ~$0.00025 gas fee
- Instant settlement"
```

---

## **LEGEND (Bottom Right Corner)**

```
┌──────────────────────────────────────┐
│         DFD NOTATION LEGEND          │
├──────────────────────────────────────┤
│ ┌────┐   External Entity            │
│ │ E1 │   (outside system)            │
│ └────┘                               │
│                                      │
│   ( )    Process (transforms data)   │
│  (1.0)   Numbered for Level 1        │
│                                      │
│ D1 ║ ║   Data Store (at rest)        │
│                                      │
│ ────→    Data Flow (labeled arrow)   │
│                                      │
│ Tier-Based Flows:                    │
│ ───→  FREE (blue)                    │
│ ───→  PAY-AS-YOU-GO (yellow)         │
│ ───→  PRO (green)                    │
└──────────────────────────────────────┘
```

---

## **DIAGRAM VALIDATION CHECKLIST**

Before finalizing, verify:

- [ ] All processes are numbered (1.0, 2.0, ... 12.0)
- [ ] All data stores are labeled (D1, D2, ... D7)
- [ ] All external entities are labeled (E1, E2, ... E5)
- [ ] All arrows have data flow labels
- [ ] No orphaned processes (all connected to something)
- [ ] Data store arrows are bidirectional where appropriate (READ/WRITE)
- [ ] External entity connections are clearly shown
- [ ] Tier-specific conditional flows are annotated
- [ ] Credit deduction flow is marked as "atomic"
- [ ] Cache hit/miss paths are clearly distinguished
- [ ] Legend matches notation used
- [ ] Annotations explain complex logic

---

## **EXPORT SPECIFICATIONS**

**Format**: PNG or SVG  
**Resolution**: 300 DPI minimum (for thesis printing)  
**Dimensions**: 3508 × 2480 pixels (A3 landscape at 300 DPI)  
**Background**: White  
**Border**: 20px padding on all sides

---

## **FIGURE CAPTION FOR THESIS**

Use this caption below the diagram:

```
Figure X: Level 1 Data Flow Diagram - Token Analysis System with Three-Tier Access Control

The Level 1 DFD illustrates the major processes, data stores, and external entities in the Tokenomics Lab token analysis system. Process 1.0 authenticates users via Firebase, and Process 2.0 enforces tier-based access control: FREE users are subject to daily limits (20 scans/day) tracked in D3 activity_logs, PAY-AS-YOU-GO users undergo atomic credit deduction from D2 user_credits, and PRO users have unlimited access. Process 4.0 implements caching (D4 analysis_cache) to optimize performance. Process 5.0 performs parallel API calls to external blockchain APIs (Mobula, GoPlus) and AI APIs (Groq Llama 3.3 70B) for data fetching. Process 6.0 applies a 10-factor risk algorithm using chain-adaptive weights from D5 chain_config. Conditional processes 8.0 (AI summary generation), 9.0 (analysis archiving to D6 analysis_history), and 10.0 (watchlist updates to D7 watchlist) execute only for PRO or PAY-AS-YOU-GO tiers. Process 12.0 handles credit purchases via x402 micropayment protocol (Solana blockchain, accepting USDT and SOL). The system demonstrates clear separation of concerns, data persistence, and tier-based feature differentiation.
```

---

## **ADDITIONAL NOTES FOR NANOBANNA**

**Prompt optimization tips**:
1. Start with: "Create a Level 1 Data Flow Diagram (Yourdon-DeMarco notation) following these exact specifications:"
2. Emphasize: "Use circles for processes, open rectangles for data stores, rectangles for external entities"
3. Specify: "Number processes 1.0, 2.0, 3.0 (Level 1), label data stores D1, D2, D3"
4. Request: "Show all data flows with labeled arrows indicating data content"
5. Clarify: "Distinguish tier-specific flows with color-coded arrows (FREE=blue, PAY-AS-YOU-GO=yellow, PRO=green)"
6. Note: "Mark atomic transactions and conditional processes clearly"
7. Important: "Show bidirectional arrows for READ/WRITE data store access"

---

**END OF PROMPT - COPY EVERYTHING ABOVE THIS LINE**

---

This prompt is ready to paste into Nanobanna or any AI diagram generator to create a comprehensive Level 1 DFD showing the complete token analysis workflow with three-tier access control, all major processes, data stores, and external integrations! 🚀
