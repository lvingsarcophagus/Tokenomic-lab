# 🎯 Complete UML Use Case Diagram Prompt for Nanobanna

**Copy and paste this entire prompt into Nanobanna or any AI diagram generator:**

---

## **PROJECT: Tokenomics Lab - UML Use Case Diagram**

### **DIAGRAM SPECIFICATIONS**

**Title**: Use Case Diagram for Tokenomics Lab Platform  
**Standard**: UML 2.5 Notation  
**Format**: Academic thesis quality (high resolution, clear labels)  
**Layout**: Landscape orientation, A3 size optimized

---

## **CRITICAL NOTATION RULES (MUST FOLLOW EXACTLY)**

### **1. System Boundary**
- **Visual**: Solid rectangle box
- **Label**: "Tokenomics Lab Platform (Authenticated Only)"
- **Note at top**: "⚠️ NO GUEST ACCESS - All users must authenticate"
- **What goes inside**: All use cases (ovals)
- **What goes outside**: All actors (stick figures)

### **2. Actors (Stick Figures)**
- **Position**: OUTSIDE the system boundary box
- **Types**: 
  - Primary Actors (left side): FREE User, PAY-AS-YOU-GO User, PRO User, ADMIN User
  - Secondary Actors (right side): External APIs, Payment System, Email Service

### **3. Use Cases (Ovals)**
- **Position**: INSIDE the system boundary box
- **Format**: Verb-Noun format (e.g., "Analyze Token", not "Token Analysis")
- **Alignment**: Horizontally centered, grouped by function

### **4. Relationships (Lines)**

| Relationship | Line Type | Arrow | Label | Direction |
|--------------|-----------|-------|-------|-----------|
| **Association** | Solid line | NO arrow | None | Actor ↔ Use Case |
| **Generalization** | Solid line | Hollow triangle △ | None | Child → Parent |
| **Include** | Dashed line | Open arrow → | <<include>> | Base → Included |
| **Extend** | Dashed line | Open arrow → | <<extend>> | Extension → Base |

---

## **ACTORS DEFINITION**

### **Primary Actors (Left Side, Top to Bottom)**

#### **1. FREE User**
```
Stick Figure Icon
Label: "FREE User"
Subtitle: "20 scans/day"
```

#### **2. PAY-AS-YOU-GO User**
```
Stick Figure Icon
Label: "PAY-AS-YOU-GO User"
Subtitle: "$0.10/scan"
```

#### **3. PRO User**
```
Stick Figure Icon
Label: "PRO User"
Subtitle: "$29/month unlimited"
```

#### **4. ADMIN User**
```
Stick Figure Icon
Label: "ADMIN User"
Subtitle: "System Management + 2FA"
```

### **Secondary Actors (Right Side, Top to Bottom)**

#### **5. External APIs**
```
Stick Figure Icon (or System Icon)
Label: "External APIs"
Subtitle: "Mobula, GoPlus, Helius, Groq"
```

#### **6. Payment System**
```
Stick Figure Icon (or System Icon)
Label: "Payment System"
Subtitle: "x402 + Stripe + Base USDC"
```

#### **7. Email Service**
```
Stick Figure Icon (or System Icon)
Label: "Email Service"
Subtitle: "Nodemailer (Alerts)"
```

---

## **USE CASES (INSIDE SYSTEM BOUNDARY)**

### **Group 1: Authentication** (Top Section)

```
UC-01: Register Account
UC-02: Log In
UC-03: Log Out
UC-04: Reset Password
UC-05: Enable 2FA (Admin Only)
UC-06: Verify 2FA Code
```

### **Group 2: Subscription Management** (Below Authentication)

```
UC-07: View Pricing Plans
UC-08: Purchase Scan Credits (x402)
UC-09: Upgrade to PRO Plan
UC-10: Manage Subscription
UC-11: View Credit Balance
UC-12: View Usage Statistics
```

### **Group 3: Token Discovery** (Middle Left Section)

```
UC-13: Search Token by Symbol
UC-14: Search Token by Address
UC-15: Browse Popular Tokens
UC-16: Filter by Blockchain
```

### **Group 4: Core Analysis** (Center Section - MAIN FEATURE)

```
UC-17: Analyze Token Risk (PRIMARY USE CASE - Make this larger)
  ├─ UC-18: Fetch Market Data (<<include>>)
  ├─ UC-19: Fetch Security Data (<<include>>)
  ├─ UC-20: Calculate Risk Score (<<include>>)
  ├─ UC-21: Detect Meme Token (AI) (<<include>>)
  ├─ UC-22: Check Official Token Status (<<include>>)
  ├─ UC-23: Detect Dead Token (<<include>>)
  ├─ UC-24: Check Daily Limit (<<extend>> - FREE only)
  ├─ UC-25: Deduct Scan Credit (<<extend>> - PAY-AS-YOU-GO only)
  ├─ UC-26: Generate AI Summary (<<extend>> - PRO/PAY-AS-YOU-GO)
  └─ UC-27: Fetch Twitter Metrics (<<extend>> - PRO/PAY-AS-YOU-GO)

UC-28: View Risk Breakdown
UC-29: View AI Insights (PRO/PAY-AS-YOU-GO)
UC-30: Export Analysis Report (PDF)
```

### **Group 5: Watchlist & Alerts** (Middle Right Section - PRO/PAY-AS-YOU-GO Only)

```
UC-31: Add Token to Watchlist
UC-32: Remove from Watchlist
UC-33: View Watchlist
UC-34: Set Price Alert
UC-35: Edit Alert Threshold
UC-36: Receive Alert Notification
```

### **Group 6: History & Analytics** (Bottom Right - PRO Only)

```
UC-37: View Analysis History
UC-38: Re-analyze Past Token
UC-39: Filter History by Date
UC-40: Filter History by Risk Level
```

### **Group 7: Profile Management** (Bottom Left - All Users)

```
UC-41: Update Profile Info
UC-42: Upload Profile Picture
UC-43: Configure Notifications
UC-44: Export User Data (GDPR)
UC-45: Delete Account (GDPR)
```

### **Group 8: Admin Dashboard** (Bottom Section - ADMIN Only)

```
UC-46: View All Users
UC-47: Search Users
UC-48: Upgrade User Plan
UC-49: Add Credits Manually (PAY-AS-YOU-GO)
UC-50: Ban/Suspend User
UC-51: View Platform Analytics
UC-52: View Activity Logs
UC-53: Configure System Settings
```

---

## **RELATIONSHIPS (LINES & ARROWS)**

### **Generalization (Inheritance) - Hollow Triangle △**

**CRITICAL**: Triangle points TOWARD the parent (upward)

```
FREE User
    △
    |
PAY-AS-YOU-GO User
    △
    |
PRO User
    △
    |
ADMIN User
```

**Visual notation**:
- **Line**: Solid
- **Arrow**: Hollow triangle (△) pointing UP to parent
- **Meaning**: 
  - PAY-AS-YOU-GO inherits all FREE capabilities
  - PRO inherits all PAY-AS-YOU-GO capabilities
  - ADMIN inherits all PRO capabilities

### **Association (Interaction) - Solid Line, No Arrow**

Connect actors to use cases they can perform:

**FREE User** → (solid line, no arrow) → ALL use cases in Groups 1, 3, 4 (limited), 7

**PAY-AS-YOU-GO User** → (solid line, no arrow) → All FREE + Groups 2, 5, 6 (partial)

**PRO User** → (solid line, no arrow) → All PAY-AS-YOU-GO + Group 6 (complete)

**ADMIN User** → (solid line, no arrow) → All PRO + Group 8

**External APIs** → (solid line, no arrow) → UC-18, UC-19, UC-21, UC-22, UC-23, UC-27

**Payment System** → (solid line, no arrow) → UC-08, UC-09

**Email Service** → (solid line, no arrow) → UC-36

### **Include (Mandatory) - Dashed Line, Open Arrow →, <<include>>**

**CRITICAL**: Arrow points FROM base use case TO included use case

```
UC-17 (Analyze Token Risk) --<<include>>--> UC-18 (Fetch Market Data)
UC-17 (Analyze Token Risk) --<<include>>--> UC-19 (Fetch Security Data)
UC-17 (Analyze Token Risk) --<<include>>--> UC-20 (Calculate Risk Score)
UC-17 (Analyze Token Risk) --<<include>>--> UC-21 (Detect Meme Token)
UC-17 (Analyze Token Risk) --<<include>>--> UC-22 (Check Official Token)
UC-17 (Analyze Token Risk) --<<include>>--> UC-23 (Detect Dead Token)
```

**Visual notation**:
- **Line**: Dashed (- - - - -)
- **Arrow**: Open arrow (→) pointing to included use case
- **Label**: <<include>> (centered on line)

### **Extend (Optional) - Dashed Line, Open Arrow →, <<extend>>**

**CRITICAL**: Arrow points FROM extension use case TO base use case

```
UC-24 (Check Daily Limit) --<<extend>>--> UC-17 (Analyze Token Risk)
  Condition: User tier = FREE

UC-25 (Deduct Scan Credit) --<<extend>>--> UC-17 (Analyze Token Risk)
  Condition: User tier = PAY-AS-YOU-GO

UC-26 (Generate AI Summary) --<<extend>>--> UC-17 (Analyze Token Risk)
  Condition: User tier = PRO OR PAY-AS-YOU-GO

UC-27 (Fetch Twitter Metrics) --<<extend>>--> UC-17 (Analyze Token Risk)
  Condition: User tier = PRO OR PAY-AS-YOU-GO AND Twitter handle provided
```

**Visual notation**:
- **Line**: Dashed (- - - - -)
- **Arrow**: Open arrow (→) pointing BACK to base use case
- **Label**: <<extend>> (centered on line)
- **Note**: Add condition text near arrow

---

## **VISUAL LAYOUT INSTRUCTIONS**

### **Spatial Organization**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 Tokenomics Lab Platform (Authenticated Only)            │
│                      ⚠️ NO GUEST ACCESS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [TOP SECTION]                                                            │
│  Authentication Group (UC-01 to UC-06)                                   │
│                                                                           │
│  [UPPER MIDDLE]                                                           │
│  Subscription Management (UC-07 to UC-12)                                │
│                                                                           │
│  [CENTER - LARGEST]                                                       │
│  ┌─────────────────────────────────┐                                    │
│  │   UC-17: Analyze Token Risk     │ ← Make this oval 2x larger         │
│  │      (PRIMARY USE CASE)          │                                    │
│  └─────────────────────────────────┘                                    │
│    ↑ ↑ ↑ (<<include>> arrows from UC-18 to UC-23)                      │
│    ↓ ↓ ↓ (<<extend>> arrows to UC-24, UC-25, UC-26, UC-27)             │
│                                                                           │
│  [LEFT MIDDLE]                      [RIGHT MIDDLE]                        │
│  Token Discovery (UC-13 to UC-16)  Watchlist (UC-31 to UC-36)          │
│                                                                           │
│  [BOTTOM LEFT]                      [BOTTOM RIGHT]                        │
│  Profile Mgmt (UC-41 to UC-45)     History (UC-37 to UC-40)             │
│                                                                           │
│  [BOTTOM CENTER]                                                          │
│  Admin Dashboard (UC-46 to UC-53)                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

LEFT SIDE (Outside):                  RIGHT SIDE (Outside):
  FREE User                             External APIs
  PAY-AS-YOU-GO User                    Payment System
  PRO User                              Email Service
  ADMIN User
```

### **Size Guidelines**
- **System Boundary Box**: 80% of canvas width, 75% of canvas height
- **Primary Use Case (UC-17)**: 2x larger than other use cases
- **Actor Icons**: Consistent size, approximately 5% of system box height
- **Use Case Ovals**: Width = 2.5 × Height ratio
- **Font Size**: 
  - System title: 18pt bold
  - Use case names: 11pt
  - Actor names: 11pt bold
  - Relationship labels: 9pt italic

---

## **COLOR CODING (OPTIONAL BUT RECOMMENDED)**

```
Color Scheme:
- System Boundary: Dark gray border (#333333), white fill
- Actors: Black stick figures
- FREE Tier Use Cases: Light blue fill (#E3F2FD)
- PAY-AS-YOU-GO Tier Use Cases: Light yellow fill (#FFF9C4)
- PRO Tier Use Cases: Light green fill (#E8F5E9)
- ADMIN Tier Use Cases: Light red fill (#FFEBEE)
- Core Analysis (UC-17): Bold blue fill (#2196F3) with white text
- Association Lines: Black solid
- Include Lines: Blue dashed
- Extend Lines: Orange dashed
- Generalization Lines: Black solid with hollow triangle
```

---

## **ANNOTATIONS TO INCLUDE**

Add these text boxes near relevant sections:

**Near System Boundary (Top)**:
```
"⚠️ NO GUEST ACCESS: All features require authentication"
```

**Near FREE User**:
```
"FREE Tier:
- 20 scans/day (resets UTC midnight)
- Basic risk analysis only
- No AI insights, no watchlist"
```

**Near PAY-AS-YOU-GO User**:
```
"PAY-AS-YOU-GO Tier:
- $0.10 per scan (1 credit)
- x402 protocol (Base USDC)
- AI insights, watchlist included
- No analysis history"
```

**Near PRO User**:
```
"PRO Tier:
- $29/month subscription
- Unlimited scans
- All features + analysis history
- Smart alerts (24/7 monitoring)"
```

**Near ADMIN User**:
```
"ADMIN Tier:
- All PRO features
- User management
- Platform analytics
- 2FA authentication required"
```

**Near UC-17 (Analyze Token Risk)**:
```
"Core Algorithm:
- 10-factor risk scoring
- Chain-adaptive weights
- AI meme detection (95% accuracy)
- Override systems (official/dead/meme)"
```

**Near External APIs**:
```
"External Systems:
- Mobula (market data)
- GoPlus (security)
- Helius (Solana)
- Groq AI (Llama 3.3 70B)
- CoinGecko (verification)"
```

**Near Payment System**:
```
"Payment Integration:
- x402 micropayments (Base USDC)
- Stripe (subscriptions)
- Instant settlement
- $0.10 minimum transaction"
```

---

## **LEGEND (Include in Bottom Right Corner)**

```
┌─────────────────────────────────────┐
│          NOTATION LEGEND            │
├─────────────────────────────────────┤
│ ────────  Association               │
│           (Actor interacts with UC) │
│                                     │
│ ── △ ──  Generalization            │
│  Child   (Inheritance)              │
│                                     │
│ - - →    <<include>>                │
│          (Mandatory dependency)     │
│                                     │
│ - - →    <<extend>>                 │
│          (Optional extension)       │
│                                     │
│ [Oval]   Use Case                   │
│ 🧍       Actor                       │
│ [Box]    System Boundary            │
└─────────────────────────────────────┘
```

---

## **DIAGRAM VALIDATION CHECKLIST**

Before finalizing, verify:

- [ ] System boundary is a solid rectangle with clear label
- [ ] ALL actors are OUTSIDE the system box
- [ ] ALL use cases are INSIDE the system box
- [ ] No floating lines (every line touches an actor or use case)
- [ ] Generalization triangles point UPWARD toward parent
- [ ] <<include>> arrows point FROM base TO included use case
- [ ] <<extend>> arrows point FROM extension TO base use case
- [ ] Association lines have NO arrows
- [ ] All use cases use Verb-Noun format
- [ ] UC-17 (Analyze Token Risk) is visibly larger (primary use case)
- [ ] No PAY-PER-USE tier (only FREE, PAY-AS-YOU-GO, PRO, ADMIN)
- [ ] Warning note "NO GUEST ACCESS" is visible at top
- [ ] All relationship labels (<<include>>, <<extend>>) are present
- [ ] Legend is included and matches notation used

---

## **EXPORT SPECIFICATIONS**

**Format**: PNG or SVG  
**Resolution**: 300 DPI minimum (for thesis printing)  
**Dimensions**: 3508 × 2480 pixels (A3 landscape at 300 DPI)  
**Background**: White  
**Border**: None (system boundary serves as border)

---

## **FIGURE CAPTION FOR THESIS**

Use this caption below the diagram:

```
Figure X: Use Case Diagram for Tokenomics Lab Platform

The diagram illustrates the complete functional scope of the Tokenomics Lab platform using UML 2.5 notation. The system serves four authenticated user tiers (FREE, PAY-AS-YOU-GO, PRO, ADMIN) with distinct capabilities. The core use case "Analyze Token Risk" (UC-17) orchestrates mandatory data fetching operations via <<include>> relationships and tier-specific extensions via <<extend>> relationships. Generalization relationships demonstrate the inheritance hierarchy where higher tiers inherit all lower-tier capabilities. External actors (APIs, Payment System, Email Service) interact with the system through well-defined interfaces. The x402 protocol enables micropayments for the PAY-AS-YOU-GO tier, supporting transactions as low as $0.10. No guest access is permitted—all functionality requires authentication.
```

---

## **ADDITIONAL NOTES FOR NANOBANNA**

**Prompt optimization tips**:
1. Start with: "Create a UML 2.5 Use Case Diagram following these exact specifications:"
2. Emphasize: "Follow UML 2.5 notation standards precisely"
3. Specify: "Use proper arrowheads: hollow triangle for generalization, open arrow for include/extend"
4. Request: "Make UC-17 (Analyze Token Risk) 2x larger as it's the primary use case"
5. Clarify: "All actors OUTSIDE system boundary, all use cases INSIDE"

---

**END OF PROMPT - COPY EVERYTHING ABOVE THIS LINE**

---

This prompt is ready to paste into Nanobanna or any AI diagram generator. It follows strict UML 2.5 standards and includes all the details from your Tokenomics Lab Pay-Per-Use system! 🚀
