# 🔄 Complete Activity Diagram Prompt for Nanobanna

**Copy and paste this entire prompt into Nanobanna or any AI diagram generator:**

---

## **PROJECT: Tokenomics Lab - System Activity Diagram**

### **DIAGRAM SPECIFICATIONS**

**Title**: Activity Diagram - Token Analysis Workflow with Three-Tier Access Model  
**Diagram Type**: UML 2.5 Activity Diagram  
**Standard**: UML 2.5 Notation  
**Format**: Academic thesis quality (high resolution, clear labels)  
**Layout**: Landscape orientation, A3 size optimized  
**Purpose**: Show the complete workflow of token analysis from user authentication to result delivery, with tier-based decision branching

---

## **CRITICAL UML NOTATION RULES**

### **1. Activity Diagram Elements**

| Element | UML Symbol | Description |
|---------|-----------|-------------|
| **Start Node** | ● (filled circle) | Single start point (black) |
| **End Node** | ⊙ (circle with dot) | Flow termination point |
| **Activity** | Rounded rectangle | Action or operation |
| **Decision Node** | ◇ (diamond) | Conditional branching |
| **Merge Node** | ◇ (diamond) | Multiple flows merge |
| **Fork Node** | ▬ (thick horizontal bar) | Split into parallel flows |
| **Join Node** | ▬ (thick horizontal bar) | Parallel flows synchronize |
| **Swim Lane** | Vertical columns | Actor/tier responsibilities |
| **Object Node** | Rectangle | Data/object flowing |
| **Control Flow** | → Solid arrow | Sequential flow |

### **2. Layout Structure**

```
Use SWIM LANES (vertical columns) to separate responsibilities:

┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  FREE User  │ PAY-AS-YOU-GO│  PRO User    │   ADMIN      │   SYSTEM     │
│             │    User      │              │              │  (Backend)   │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│             │              │              │              │              │
│ [Activities]│ [Activities] │ [Activities] │ [Activities] │ [Activities] │
│             │              │              │              │              │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## **MAIN WORKFLOW: TOKEN ANALYSIS (PRIMARY FLOW)**

### **Phase 1: Authentication & Authorization**

```
START (●)
   ↓
[User Opens Platform]
   ↓
◇ Is User Authenticated?
   ├─ NO → [Redirect to Login Page]
   │         ↓
   │       [Enter Credentials]
   │         ↓
   │       [Firebase Authentication]
   │         ↓
   │       ◇ Valid Credentials?
   │         ├─ NO → [Show Error] → ◇ Retry?
   │         │                       ├─ YES → [Enter Credentials]
   │         │                       └─ NO → END (⊙)
   │         └─ YES → [Load User Profile]
   │                    ↓
   │                  [Determine User Tier]
   │                    ↓
   └─ YES → [Load User Profile]
              ↓
            [Determine User Tier]
              ↓
            ◇ User Tier?
              ├─ FREE → [Display "20 scans/day" badge]
              ├─ PAY-AS-YOU-GO → [Display Credit Balance]
              ├─ PRO → [Display "Unlimited" badge]
              └─ ADMIN → [Require 2FA] → [Verify TOTP Code] → ◇ Valid?
                                                                  ├─ NO → [Access Denied] → END (⊙)
                                                                  └─ YES → [Load Admin Dashboard]
```

### **Phase 2: Token Input & Validation**

```
[Navigate to Analysis Page]
   ↓
[Enter Token Information]
   ├─ Input: Token Address
   ├─ Input: Select Blockchain (Ethereum, BSC, Solana, Polygon, etc.)
   └─ Optional: Twitter Handle
   ↓
[Click "Analyze" Button]
   ↓
◇ Valid Contract Address?
   ├─ NO → [Show Validation Error: "Invalid Address Format"]
   │        ↓
   │       [User Corrects Input]
   │        ↓
   │       [Click "Analyze" Button]
   │
   └─ YES → [Proceed to Tier Check]
```

### **Phase 3: Tier-Based Access Control** (CRITICAL DECISION POINT)

```
◇ User Tier Check
   │
   ├─────────────────────────────────────────────────────────────────┐
   │                                                                   │
   ├─ FREE Tier                                                        │
   │   ↓                                                              │
   │  [Check Daily Scan Count]                                        │
   │   ↓                                                              │
   │  ◇ Scans Used < 20 Today?                                       │
   │   ├─ NO → [Show Error: "Daily Limit Reached (20/20)"]          │
   │   │        ↓                                                     │
   │   │       [Suggest: Upgrade to Pay-As-You-Go or PRO]            │
   │   │        ↓                                                     │
   │   │       END (⊙)                                               │
   │   │                                                              │
   │   └─ YES → [Increment Daily Counter]                            │
   │             ↓                                                    │
   │            [Proceed to Data Fetching]                            │
   │                                                                   │
   ├─ PAY-AS-YOU-GO Tier                                              │
   │   ↓                                                              │
   │  [Check Credit Balance]                                          │
   │   ↓                                                              │
   │  ◇ Balance ≥ 1 Credit?                                          │
   │   ├─ NO → [Show Error: "Insufficient Credits"]                 │
   │   │        ↓                                                     │
   │   │       [Offer: Purchase Credits (x402)]                      │
   │   │        ↓                                                     │
   │   │       ◇ User Clicks "Buy Credits"?                          │
   │   │         ├─ NO → END (⊙)                                    │
   │   │         └─ YES → [JUMP TO: Credit Purchase Flow]           │
   │   │                   ↓                                          │
   │   │                  [After Purchase] → [Proceed to Deduction]  │
   │   │                                                              │
   │   └─ YES → [Deduct 1 Credit (Atomic Transaction)]              │
   │             ↓                                                    │
   │            [Log Transaction: "DEDUCTION - Token Analysis"]       │
   │             ↓                                                    │
   │            [Proceed to Data Fetching]                            │
   │                                                                   │
   ├─ PRO Tier                                                        │
   │   ↓                                                              │
   │  [No Limits - Proceed to Data Fetching]                         │
   │                                                                   │
   └─ ADMIN Tier                                                      │
       ↓                                                              │
      [No Limits - Proceed to Data Fetching]                         │
```

### **Phase 4: Parallel Data Fetching** (FORK/JOIN)

```
[Data Fetching Phase]
   ↓
▬▬▬▬▬▬▬ FORK (Split into 3 parallel processes) ▬▬▬▬▬▬▬
   ║                    ║                    ║
   ║                    ║                    ║
   ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Process 1:  │  │  Process 2:  │  │  Process 3:  │
│ Market Data  │  │Security Data │  │   AI Data    │
├──────────────┤  ├──────────────┤  ├──────────────┤
│              │  │              │  │              │
│ Call Mobula  │  │ Call GoPlus  │  │ Call Groq AI │
│    API       │  │    API       │  │  (Llama 3.3) │
│      ↓       │  │      ↓       │  │      ↓       │
│ Get Price    │  │ Get Contract │  │ Detect Meme  │
│ Get Volume   │  │  Security    │  │   Token      │
│ Get Liquidity│  │ Get Honeypot │  │  (0-100%)    │
│      ↓       │  │      ↓       │  │      ↓       │
│ Normalize    │  │ Normalize    │  │ ◇ Groq Fail? │
│    Data      │  │    Data      │  │ ├─YES→Gemini │
│              │  │              │  │ └─NO→Continue│
└──────────────┘  └──────────────┘  └──────────────┘
   ║                    ║                    ║
   ▼                    ▼                    ▼
▬▬▬▬▬▬▬ JOIN (Wait for all 3 to complete) ▬▬▬▬▬▬▬
   ↓
[All Data Collected]
```

### **Phase 5: Risk Calculation (10-Factor Algorithm)**

```
[Risk Calculation Engine]
   ↓
[Apply Chain-Specific Weights]
   ├─ IF Solana → Use Solana Weight Profile
   ├─ IF Ethereum → Use Ethereum Weight Profile
   ├─ IF BSC → Use BSC Weight Profile
   └─ Etc.
   ↓
[Calculate 10 Risk Factors]
   ├── Factor 1: Liquidity Risk (Weight: varies by chain)
   ├── Factor 2: Market Cap Stability
   ├── Factor 3: Holder Distribution
   ├── Factor 4: Contract Verification
   ├── Factor 5: Ownership Concentration
   ├── Factor 6: Trading Volume
   ├── Factor 7: Token Age
   ├── Factor 8: Honeypot Detection
   ├── Factor 9: Buy/Sell Tax Analysis
   └── Factor 10: External Security Audits
   ↓
[Aggregate Scores]
   ↓
[Normalize to 0-100 Scale]
   ↓
◇ Apply Override Rules?
   ├─ IF Official Token (CoinGecko verified) → [Set Risk = LOW]
   ├─ IF Dead Token (0 liquidity + 0 volume) → [Set Risk = CRITICAL]
   └─ ELSE → [Use Calculated Score]
   ↓
[Final Risk Score: 0-100]
```

### **Phase 6: Tier-Based Feature Enrichment**

```
◇ User Tier Check (for additional features)
   │
   ├─ FREE Tier
   │   ↓
   │  [Skip AI Summary]
   │  [Skip Twitter Metrics]
   │  [Prepare PDF with Watermark]
   │   ↓
   │  [Return Basic Results]
   │
   ├─ PAY-AS-YOU-GO Tier
   │   ↓
   │  ◇ User Requested AI Summary?
   │   ├─ YES → [Deduct 1 Additional Credit]
   │   │         ↓
   │   │        [Call Groq API: Generate Summary]
   │   │         ↓
   │   │        [Include AI Insights in Results]
   │   │
   │   └─ NO → [Skip AI Summary]
   │   ↓
   │  ◇ Twitter Handle Provided?
   │   ├─ YES → [Fetch Twitter Metrics]
   │   └─ NO → [Skip Twitter Metrics]
   │   ↓
   │  [Prepare PDF (No Watermark)]
   │   ↓
   │  [Return Enhanced Results]
   │
   ├─ PRO Tier
   │   ↓
   │  [Generate AI Summary (Automatic)]
   │   ↓
   │  ◇ Twitter Handle Provided?
   │   ├─ YES → [Fetch Twitter Metrics]
   │   └─ NO → [Skip Twitter Metrics]
   │   ↓
   │  [Save to Analysis History]
   │   ↓
   │  [Check Watchlist]
   │   ↓
   │  ◇ Token in Watchlist?
   │   ├─ YES → [Update Last Analysis Timestamp]
   │   └─ NO → [Offer: Add to Watchlist]
   │   ↓
   │  [Prepare PDF (Custom Branding)]
   │   ↓
   │  [Return Full Results]
   │
   └─ ADMIN Tier
       ↓
      [Same as PRO + Log Admin Action]
```

### **Phase 7: Result Display & User Actions**

```
[Display Analysis Results on Dashboard]
   ↓
[Show Components:]
   ├─ Risk Score Gauge (0-100)
   ├─ Risk Level Badge (LOW/MEDIUM/HIGH/CRITICAL)
   ├─ 10-Factor Breakdown Chart
   ├─ Security Metrics Panel
   ├─ Market Metrics Panel
   ├─ Meme Token Badge (if probability > 70%)
   ├─ Official Token Badge (if verified)
   ├─ Dead Token Badge (if detected)
   └─ AI Insights Panel (PRO/PAY-AS-YOU-GO only)
   ↓
[User Actions Available]
   ↓
◇ What does user want to do?
   │
   ├─ Export PDF → [Generate PDF Report]
   │                ↓
   │               [Download File]
   │                ↓
   │               END (⊙)
   │
   ├─ Add to Watchlist (PRO/PAY-AS-YOU-GO only)
   │   ↓
   │  [Save Token to Firestore: watchlist collection]
   │   ↓
   │  ◇ Set Price Alert?
   │   ├─ YES → [Configure Alert Threshold]
   │   │         ↓
   │   │        [Save Alert to alerts collection]
   │   │         ↓
   │   │        [Show Success: "Alert Created"]
   │   │
   │   └─ NO → [Show Success: "Added to Watchlist"]
   │   ↓
   │  END (⊙)
   │
   ├─ Analyze Another Token
   │   ↓
   │  [Clear Current Results]
   │   ↓
   │  [Return to Token Input Phase]
   │
   └─ Close/Exit
       ↓
      END (⊙)
```

---

## **SECONDARY WORKFLOW: CREDIT PURCHASE FLOW (x402 Protocol)**

```
START: [User Clicks "Buy Credits"]
   ↓
[Display Credit Purchase Modal]
   ↓
[Show Options:]
   ├─ 10 Credits = $1.00
   ├─ 50 Credits = $5.00
   ├─ 100 Credits = $10.00
   └─ Custom Amount
   ↓
[User Selects Amount]
   ↓
[Click "Purchase with x402"]
   ↓
[Initiate x402 Payment Flow]
   ↓
▬▬▬ FORK (Payment Process) ▬▬▬
   ║                    ║
   ▼                    ▼
[Generate QR Code]  [Connect Wallet]
   ↓                    ↓
[Show Payment Info] [Verify Solana Network]
   ↓                    ↓
[Wait for User]     ◇ Correct Network?
   ↓                 ├─NO→[Prompt Switch]
   ↓                 └─YES↓
   ↓                [Select USDT or SOL]
   ↓                    ↓
   ↓                [Approve Token Transfer]
   ↓                    ↓
   ↓                [Sign Transaction]
   ║                    ║
   ▼                    ▼
▬▬▬ JOIN (Transaction Submitted) ▬▬▬
   ↓
[Monitor Blockchain]
   ↓
◇ Transaction Confirmed?
   ├─ NO (Timeout after 5 min) → [Show Error: "Payment Failed"]
   │                               ↓
   │                              [Offer Retry]
   │                               ↓
   │                              ◇ Retry?
   │                                ├─YES→[Return to Purchase Modal]
   │                                └─NO→END (⊙)
   │
   └─ YES → [Verify Transaction Hash]
             ↓
            [Add Credits to User Balance (Atomic Transaction)]
             ↓
            [Create Transaction Record]
             ├─ type: "PURCHASE"
             ├─ amount: [credits]
             ├─ paymentMethod: "x402"
             ├─ txHash: [blockchain hash]
             └─ timestamp: [now]
             ↓
            [Update UI: Show New Balance]
             ↓
            [Show Success Message: "+X credits added!"]
             ↓
            END (⊙) or [Return to Analysis]
```

---

## **TERTIARY WORKFLOW: WATCHLIST PRICE MONITORING (Background Job)**

```
START (⊙) [Every 5 Minutes - Cron Job]
   ↓
[Query Firestore: Get All Active Watchlists]
   ↓
◇ Any Watchlists Found?
   ├─ NO → [Wait 5 Minutes] → [Restart]
   │
   └─ YES → [For Each Token in Watchlist]
             ↓
            ▬▬▬ FORK (Parallel Processing) ▬▬▬
             ║
             ▼
            [Fetch Current Price from Mobula API]
             ↓
            [Compare with Last Price]
             ↓
            [Update lastPriceCheck timestamp]
             ↓
            ◇ User Has Active Alerts?
             ├─ NO → [Continue to Next Token]
             │
             └─ YES → [For Each Alert]
                       ↓
                      ◇ Alert Condition Met?
                       ├─ PRICE_ABOVE → ◇ Current > Threshold?
                       ├─ PRICE_BELOW → ◇ Current < Threshold?
                       └─ RISK_CHANGE → ◇ Risk Changed?
                       │
                       ├─ NO → [Continue]
                       │
                       └─ YES → [Trigger Alert]
                                 ↓
                                [Send Email Notification via Nodemailer]
                                 ↓
                                [Create In-App Notification]
                                 ↓
                                [Log Alert Event]
                                 ↓
                                ◇ Disable One-Time Alert?
                                 ├─YES→[Set alert.enabled = false]
                                 └─NO→[Keep Active]
             ║
             ▼
            ▬▬▬ JOIN (All Tokens Processed) ▬▬▬
             ↓
            [Wait 5 Minutes]
             ↓
            [Restart] → (Loop back to START)
```

---

## **ADMIN WORKFLOW: USER MANAGEMENT**

```
START (⊙) [Admin Logs In]
   ↓
[Verify 2FA (TOTP)]
   ↓
◇ Valid 2FA Code?
   ├─ NO → [Access Denied] → END (⊙)
   │
   └─ YES → [Load Admin Dashboard]
             ↓
            [Display User Management Panel]
             ↓
            ◇ Admin Action?
             │
             ├─ View All Users
             │   ↓
             │  [Query Firestore: users collection]
             │   ↓
             │  [Display Users Table]
             │   ↓
             │  [Show Filters: Tier, Status, Date]
             │
             ├─ Search User
             │   ↓
             │  [Enter Email or User ID]
             │   ↓
             │  [Query Firestore]
             │   ↓
             │  ◇ User Found?
             │   ├─NO→[Show "Not Found"]
             │   └─YES→[Display User Details]
             │
             ├─ Update User Tier
             │   ↓
             │  [Select User]
             │   ↓
             │  [Choose New Tier: FREE/PAY-AS-YOU-GO/PRO/ADMIN]
             │   ↓
             │  [Confirm Action]
             │   ↓
             │  [Update Firestore: users/{userId}.tier]
             │   ↓
             │  [Log Admin Action]
             │   ↓
             │  [Show Success]
             │
             ├─ Add Credits Manually
             │   ↓
             │  [Select PAY-AS-YOU-GO User]
             │   ↓
             │  [Enter Credit Amount]
             │   ↓
             │  [Confirm Action]
             │   ↓
             │  [Add Credits (Atomic Transaction)]
             │   ↓
             │  [Create Transaction Record: type="ADMIN_GRANT"]
             │   ↓
             │  [Log Admin Action]
             │   ↓
             │  [Show Success]
             │
             └─ View Platform Analytics
                 ↓
                [Query Aggregated Data]
                 ├─ Total Users (by tier)
                 ├─ Total Scans (last 30 days)
                 ├─ Revenue (x402 + Stripe)
                 ├─ Active Watchlists
                 └─ Error Rates
                 ↓
                [Display Analytics Dashboard]
                 ↓
                END (⊙)
```

---

## **VISUAL LAYOUT INSTRUCTIONS**

### **Swim Lane Structure**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TOKENOMICS LAB - ACTIVITY DIAGRAM                    │
│                     Token Analysis Workflow (Primary)                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┬──────────────────────────┐
│  FREE    │ PAY-AS-  │   PRO    │  ADMIN   │       SYSTEM             │
│  USER    │ YOU-GO   │  USER    │  USER    │      (Backend)           │
│          │  USER    │          │          │                          │
├──────────┼──────────┼──────────┼──────────┼──────────────────────────┤
│          │          │          │          │                          │
│   ●START │          │          │          │                          │
│    ↓     │          │          │          │                          │
│ [Enter   │          │          │          │   [Authenticate]         │
│  Token]  │          │          │          │        ↓                 │
│    ↓     │          │          │          │   [Check Tier]           │
│    ┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┼→ ◇ User Tier?             │
│          │          │          │          │    ├─FREE                │
│  ◇Daily  │          │          │          │    ├─PAY-AS-YOU-GO       │
│  Limit?  │  ◇Credit │          │          │    ├─PRO                 │
│    ↓     │  Balance?│          │          │    └─ADMIN               │
│  [Fetch  │    ↓     │  [Fetch  │ [Verify  │        ↓                 │
│   Data] ←┼─ [Deduct]│   Data] ←┼─  2FA]   │   [Fetch Market Data]   │
│    ↓     │    ↓     │    ↓     │    ↓     │        ↓                 │
│          │          │          │          │   [Fetch Security]       │
│  [Show   │  [Show   │  [Show   │  [Show   │        ↓                 │
│ Results] │ Results +│ Results +│ Results +│   [Calculate Risk]       │
│ (Basic)] │    AI]   │   Full]  │   Full]  │        ↓                 │
│    ↓     │    ↓     │    ↓     │    ↓     │   [Return Results]       │
│   ⊙END   │   ⊙END   │   ⊙END   │   ⊙END   │                          │
│          │          │          │          │                          │
└──────────┴──────────┴──────────┴──────────┴──────────────────────────┘
```

### **Element Sizing & Spacing**

- **Start Node (●)**: 20px diameter, filled black
- **End Node (⊙)**: 20px outer circle, 10px inner dot
- **Activity Boxes**: 150px × 50px, rounded corners (10px radius)
- **Decision Diamonds**: 100px × 100px, rotated 45°
- **Fork/Join Bars**: 200px × 10px, filled black
- **Arrows**: 2px width, solid lines
- **Vertical Spacing**: 40px between activities
- **Horizontal Spacing**: 30px between swim lanes

---

## **COLOR CODING**

```
Swim Lane Colors:
- FREE User: #E3F2FD (light blue)
- PAY-AS-YOU-GO User: #FFF9C4 (light yellow)
- PRO User: #E8F5E9 (light green)
- ADMIN User: #FFEBEE (light red)
- SYSTEM (Backend): #F5F5F5 (light gray)

Activity Colors:
- Start/End Nodes: Black (#000000)
- Normal Activities: White background, black border
- Decision Nodes: Yellow fill (#FFEB3B)
- Fork/Join Bars: Black (#000000)
- Critical Activities (credit deduction, 2FA): Red border (#F44336)

Arrow Colors:
- Normal Flow: Black (#000000)
- Conditional Flow (from decisions): Blue (#2196F3)
- Error/Retry Flow: Red (#F44336)
```

---

## **ANNOTATIONS**

Add these text boxes near relevant sections:

**Near Start Node:**
```
"User initiates token analysis workflow.
All users must authenticate before proceeding."
```

**Near Tier Decision:**
```
"Three-Tier Access Control:
- FREE: 20 scans/day (resets UTC midnight)
- PAY-AS-YOU-GO: $0.10 per scan (credit-based)
- PRO: Unlimited scans ($29/month)"
```

**Near Fork (Parallel Fetching):**
```
"Parallel API Calls:
- Mobula (market data)
- GoPlus (security)
- Groq AI (meme detection)
Average response time: 2-3 seconds"
```

**Near Risk Calculation:**
```
"10-Factor Risk Algorithm:
- Chain-adaptive weights
- 0-100 normalized score
- Override rules for official/dead tokens"
```

**Near Credit Deduction:**
```
"Atomic Transaction:
- Firestore transaction ensures atomicity
- Prevents double-deduction
- Logs all credit movements"
```

**Near x402 Payment:**
```
"x402 Micropayment Protocol:
- Solana blockchain
- Accepts USDT + SOL
- ~$0.00025 gas fee
- Instant settlement
- No intermediaries"
```

---

## **LEGEND (Bottom Right Corner)**

```
┌──────────────────────────────────────┐
│       ACTIVITY DIAGRAM LEGEND        │
├──────────────────────────────────────┤
│ ●        Start Node                  │
│ ⊙        End Node                    │
│ [  ]     Activity/Action             │
│ ◇        Decision Point              │
│ ▬▬▬      Fork/Join (Parallel)        │
│ →        Control Flow                │
│ ┄→       Cross-Lane Flow             │
│                                      │
│ Swim Lane Tiers:                     │
│ [Blue]   FREE User                   │
│ [Yellow] PAY-AS-YOU-GO User          │
│ [Green]  PRO User                    │
│ [Red]    ADMIN User                  │
│ [Gray]   System Backend              │
└──────────────────────────────────────┘
```

---

## **DIAGRAM VALIDATION CHECKLIST**

Before finalizing, verify:

- [ ] Single start node (●) at the top
- [ ] Multiple end nodes (⊙) for different exit paths
- [ ] All activities in rounded rectangles
- [ ] All decisions in diamond shapes
- [ ] Fork/Join bars are thick horizontal lines
- [ ] Swim lanes clearly separate FREE, PAY-AS-YOU-GO, PRO, ADMIN, SYSTEM
- [ ] Arrows show flow direction clearly
- [ ] Conditional branches are labeled (YES/NO, tier names)
- [ ] Parallel processes use fork/join correctly
- [ ] Credit deduction is marked as atomic transaction
- [ ] All tier-specific features are in correct swim lanes
- [ ] Legend matches the notation used
- [ ] Annotations explain complex processes

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
Figure X: Activity Diagram - Token Analysis Workflow with Three-Tier Access Model

The activity diagram illustrates the complete workflow of token analysis in the Tokenomics Lab platform, from user authentication to result delivery. The diagram uses swim lanes to separate responsibilities across user tiers (FREE, PAY-AS-YOU-GO, PRO, ADMIN) and system backend. The workflow demonstrates tier-based access control where FREE users face daily limits (20 scans/day), PAY-AS-YOU-GO users undergo credit deduction via atomic Firestore transactions, and PRO users access unlimited features. The risk calculation phase employs parallel data fetching (fork/join pattern) from three external APIs (Mobula, GoPlus, Groq) to optimize performance. The 10-factor risk algorithm applies chain-adaptive weights and override rules for official/dead token detection. The x402 micropayment flow (secondary workflow) enables sub-dollar transactions ($0.10 minimum) via Solana blockchain (accepting USDT and SOL) with instant settlement. Admin workflows include 2FA authentication (TOTP) and user management capabilities. Background jobs monitor watchlists every 5 minutes, triggering email alerts when price thresholds are met.
```

---

## **ADDITIONAL NOTES FOR NANOBANNA**

**Prompt optimization tips**:
1. Start with: "Create a UML 2.5 Activity Diagram with swim lanes following these exact specifications:"
2. Emphasize: "Use swim lanes to separate FREE, PAY-AS-YOU-GO, PRO, ADMIN, and SYSTEM responsibilities"
3. Specify: "Show parallel data fetching using fork/join bars (thick horizontal lines)"
4. Request: "Highlight decision nodes in yellow and critical operations (credit deduction, 2FA) with red borders"
5. Clarify: "Use rounded rectangles for activities, diamonds for decisions, filled circles for start/end"
6. Note: "Show the complete flow from authentication to result delivery, including error handling"

---

**END OF PROMPT - COPY EVERYTHING ABOVE THIS LINE**

---

This prompt is ready to paste into Nanobanna or any AI diagram generator to create a comprehensive UML 2.5 Activity Diagram showing the complete token analysis workflow with three-tier access control! 🚀
