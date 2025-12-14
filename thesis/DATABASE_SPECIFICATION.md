# 📊 Database Specification - Tokenomics Lab

**Section 4.2 of Bachelor's Thesis**  
**Last Updated**: December 11, 2025

---

## 4.2 Database Specification

### 4.2.1 Database Technology Selection

Tokenomics Lab utilizes **Firebase Firestore**, a NoSQL document-oriented database, as its primary data store. This choice was driven by several factors aligned with the platform's requirements:

| Criterion | Firestore Advantage |
|-----------|---------------------|
| **Scalability** | Automatic horizontal scaling without manual sharding |
| **Real-time Sync** | Built-in WebSocket listeners for live UI updates |
| **Serverless Integration** | Native integration with Next.js API routes |
| **Hierarchical Data** | Sub-collections enable logical grouping (e.g., user → watchlist → tokens) |
| **Security Rules** | Declarative rules enforce row-level access control |
| **Cost Model** | Pay-per-operation suitable for variable workloads |

**Justification for NoSQL over Relational:**

The platform's data access patterns favor document retrieval over complex joins. Token analysis results are self-contained documents that benefit from denormalization, and user-specific data (watchlists, history) naturally fits a hierarchical model where each user owns their sub-collections.

---

### 4.2.2 Data Model Architecture

The database follows a **hierarchical document model** with top-level collections and nested sub-collections to represent one-to-many relationships without expensive JOIN operations.

```
Firestore Database
├── users/{userId}                           # User profiles and tier information
├── watchlist/{userId}/tokens/{tokenAddress} # User's tracked tokens (sub-collection)
├── alerts/{userId}/notifications/{alertId}  # Price/risk alerts (sub-collection)
├── analysis_history/{userId}/scans/{scanId} # PRO user scan history (sub-collection)
├── activity_logs/{userId}/actions/{actionId}# Audit trail (sub-collection)
├── user_credits/{userId}                    # PAY-AS-YOU-GO credit balance
├── credit_transactions/{transactionId}      # Payment/deduction records
└── admin_notification_preferences/{userId}  # Admin settings
```

**Design Rationale:**
- **Sub-collections** enable efficient queries scoped to a single user
- **Document IDs** use meaningful values (userId, tokenAddress) for direct lookups
- **Denormalization** of token data in watchlist avoids cross-collection reads
- **Timestamps** on all documents enable time-based queries and sorting

---

### 4.2.3 Collection Schemas

#### **Table 7: Users Collection Schema**

**Path**: `users/{userId}`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `uid` | `string` | Firebase Auth UID | Primary key, immutable |
| `email` | `string` | User email address | Unique, indexed |
| `displayName` | `string?` | Display name | Optional, max 100 chars |
| `photoURL` | `string?` | Profile image (Base64/URL) | Max 1MB |
| `tier` | `enum` | Access tier | `FREE` \| `PAY_AS_YOU_GO` \| `PRO` \| `ADMIN` |
| `createdAt` | `Timestamp` | Account creation date | Auto-set, immutable |
| `tokensAnalyzed` | `number` | Daily scan counter (FREE tier) | Resets at UTC 00:00 |
| `lastScanDate` | `Timestamp?` | Last scan timestamp | For rate limiting |
| `name` | `string?` | Full name | Profile field |
| `company` | `string?` | Company name | Profile field |
| `country` | `string?` | Country code (ISO 3166-1) | Profile field |
| `totpSecret` | `string?` | 2FA secret (ADMIN only) | Encrypted, server-only |
| `totpEnabled` | `boolean` | 2FA status | Default: `false` |

**Example Document:**
```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "displayName": "John Doe",
  "tier": "PRO",
  "createdAt": "2025-01-15T10:30:00Z",
  "tokensAnalyzed": 5,
  "lastScanDate": "2025-12-11T14:22:00Z",
  "totpEnabled": false
}
```

---

#### **Table 8: Watchlist Sub-Collection Schema**

**Path**: `watchlist/{userId}/tokens/{tokenAddress}`

| Field | Type | Description |
|-------|------|-------------|
| `address` | `string` | Token contract address (document ID) |
| `symbol` | `string` | Token ticker symbol (e.g., "ETH") |
| `name` | `string` | Token full name (e.g., "Ethereum") |
| `chain` | `string` | Blockchain name (e.g., "Ethereum", "Solana") |
| `chainId` | `string` | Mobula chain identifier (e.g., "1", "501") |
| `addedAt` | `Timestamp` | Date added to watchlist |
| `lastRiskScore` | `number?` | Most recent risk score (0-100) |
| `lastChecked` | `Timestamp?` | Last monitoring check |
| `alertEnabled` | `boolean` | Price alert active |
| `alertThreshold` | `number?` | Alert trigger percentage (e.g., 10 = ±10%) |

**Example Document:**
```json
{
  "address": "0x1234...abcd",
  "symbol": "PEPE",
  "name": "Pepe",
  "chain": "Ethereum",
  "chainId": "1",
  "addedAt": "2025-12-01T09:00:00Z",
  "lastRiskScore": 42,
  "lastChecked": "2025-12-11T14:00:00Z",
  "alertEnabled": true,
  "alertThreshold": 15
}
```

---

#### **Table 9: Analysis History Sub-Collection Schema**

**Path**: `analysis_history/{userId}/scans/{scanId}`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique scan identifier (auto-generated) |
| `tokenAddress` | `string` | Analyzed token address |
| `tokenName` | `string` | Token name at scan time |
| `tokenSymbol` | `string` | Token symbol |
| `chainId` | `string` | Blockchain identifier |
| `results.overall_risk_score` | `number` | Final risk score (0-100) |
| `results.risk_level` | `string` | Classification: `LOW`/`MEDIUM`/`HIGH`/`CRITICAL` |
| `results.confidence_score` | `number` | Data quality confidence (0-100) |
| `results.breakdown` | `Map<string, number>` | 10-factor individual scores |
| `results.critical_flags` | `string[]?` | Detected issues (e.g., "Honeypot detected") |
| `results.upcoming_risks` | `string[]?` | Future risk warnings |
| `marketSnapshot.price` | `number` | Price at analysis time (USD) |
| `marketSnapshot.marketCap` | `number` | Market cap (USD) |
| `marketSnapshot.volume24h` | `number` | 24h trading volume (USD) |
| `marketSnapshot.liquidity` | `number` | DEX liquidity (USD) |
| `plan` | `enum` | User tier at scan time |
| `analyzedAt` | `Timestamp` | Scan timestamp |

**Example Document:**
```json
{
  "id": "scan_20251211_143022",
  "tokenAddress": "0x1234...abcd",
  "tokenName": "Pepe",
  "tokenSymbol": "PEPE",
  "chainId": "1",
  "results": {
    "overall_risk_score": 42,
    "risk_level": "MEDIUM",
    "confidence_score": 85,
    "breakdown": {
      "supply_dilution": 25,
      "holder_concentration": 55,
      "liquidity_depth": 30,
      "contract_control": 40,
      "tax_fee": 20,
      "distribution": 45,
      "burn_deflation": 50,
      "adoption": 35,
      "vesting_unlock": 60,
      "audit_transparency": 30
    },
    "critical_flags": []
  },
  "marketSnapshot": {
    "price": 0.00001234,
    "marketCap": 5000000000,
    "volume24h": 150000000,
    "liquidity": 25000000
  },
  "plan": "PRO",
  "analyzedAt": "2025-12-11T14:30:22Z"
}
```

---

#### **Table 10: Activity Logs Sub-Collection Schema**

**Path**: `activity_logs/{userId}/actions/{actionId}`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Log entry identifier (auto-generated) |
| `userId` | `string` | Acting user UID |
| `userEmail` | `string` | User email (for display) |
| `action` | `enum` | Action type (see below) |
| `details` | `Map<string, any>?` | Action-specific metadata |
| `ipAddress` | `string?` | Client IP (for security auditing) |
| `userAgent` | `string?` | Browser/device info |
| `timestamp` | `Timestamp` | Action timestamp |

**Action Types Enum:**
```typescript
type ActionType = 
  | 'LOGIN'           // User logged in
  | 'LOGOUT'          // User logged out
  | 'TOKEN_SCAN'      // Performed token analysis
  | 'PROFILE_UPDATE'  // Updated profile fields
  | 'WATCHLIST_ADD'   // Added token to watchlist
  | 'WATCHLIST_REMOVE'// Removed token from watchlist
  | 'TIER_UPGRADE'    // Upgraded subscription tier
  | 'CREDIT_PURCHASE' // Purchased credits via x402
  | 'DATA_EXPORT'     // Exported personal data (GDPR)
  | 'ACCOUNT_DELETE'  // Deleted account
```

---

#### **Table 11: Credit System Collections**

**Path**: `user_credits/{userId}`

| Field | Type | Description |
|-------|------|-------------|
| `balance` | `number` | Current credit balance (integer) |
| `lastUpdated` | `Timestamp` | Last balance modification |

**Path**: `credit_transactions/{transactionId}`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | User UID |
| `type` | `enum` | `PURCHASE` \| `DEDUCTION` \| `ADMIN_GRANT` \| `REFUND` |
| `amount` | `number` | Credits affected (positive integer) |
| `balanceBefore` | `number` | Balance before transaction |
| `balanceAfter` | `number` | Balance after transaction |
| `paymentMethod` | `string?` | `x402` \| `stripe` (for purchases only) |
| `txHash` | `string?` | Blockchain transaction hash (x402 only) |
| `reason` | `string?` | Description (e.g., "Token Analysis - PEPE") |
| `timestamp` | `Timestamp` | Transaction time |

**Example Transaction Document:**
```json
{
  "userId": "abc123xyz",
  "type": "PURCHASE",
  "amount": 50,
  "balanceBefore": 10,
  "balanceAfter": 60,
  "paymentMethod": "x402",
  "txHash": "5KtP...7xYz",
  "reason": "Credit purchase via x402 (Solana)",
  "timestamp": "2025-12-11T15:00:00Z"
}
```

---

#### **Table 12: Alert Notifications Sub-Collection Schema**

**Path**: `alerts/{userId}/notifications/{alertId}`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Alert identifier |
| `tokenAddress` | `string` | Related token address |
| `tokenSymbol` | `string` | Token symbol |
| `type` | `enum` | `RISK_INCREASE` \| `RISK_DECREASE` \| `PRICE_ABOVE` \| `PRICE_BELOW` |
| `oldValue` | `number` | Previous value (risk score or price) |
| `newValue` | `number` | Current value |
| `threshold` | `number` | User-defined trigger threshold |
| `message` | `string` | Human-readable alert message |
| `read` | `boolean` | Whether user has viewed alert |
| `emailSent` | `boolean` | Whether email notification was sent |
| `createdAt` | `Timestamp` | Alert creation time |

---

### 4.2.4 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TOKENOMICS LAB - DATA MODEL (ERD)                     │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │      USER        │
                              │──────────────────│
                              │ uid (PK)         │
                              │ email (UNIQUE)   │
                              │ tier             │
                              │ tokensAnalyzed   │
                              │ totpEnabled      │
                              │ createdAt        │
                              └────────┬─────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         │ 1:N                         │ 1:N                         │ 1:N
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   WATCHLIST     │         │ ANALYSIS_HISTORY│         │  ACTIVITY_LOG   │
│─────────────────│         │─────────────────│         │─────────────────│
│ tokenAddress(PK)│         │ scanId (PK)     │         │ actionId (PK)   │
│ symbol          │         │ tokenAddress    │         │ action          │
│ name            │         │ tokenName       │         │ details{}       │
│ chain           │         │ results{}       │         │ ipAddress       │
│ chainId         │         │ marketSnapshot{}│         │ timestamp       │
│ lastRiskScore   │         │ analyzedAt      │         │                 │
│ alertEnabled    │         │ plan            │         │                 │
│ addedAt         │         │                 │         │                 │
└────────┬────────┘         └─────────────────┘         └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     ALERT       │
│─────────────────│
│ alertId (PK)    │
│ tokenAddress(FK)│
│ type            │
│ threshold       │
│ message         │
│ read            │
│ createdAt       │
└─────────────────┘


         ┌─────────────────┐
         │  USER_CREDITS   │◄───────────────────┐
         │─────────────────│                    │
         │ userId (PK, FK) │                    │ References
         │ balance         │                    │
         │ lastUpdated     │                    │
         └─────────────────┘                    │
                 ▲                              │
                 │ 1:N                          │
                 │                              │
         ┌───────┴─────────┐                    │
         │CREDIT_TRANSACTION│────────────────────┘
         │─────────────────│
         │ transactionId(PK)│
         │ userId (FK)     │
         │ type            │
         │ amount          │
         │ balanceBefore   │
         │ balanceAfter    │
         │ txHash          │
         │ timestamp       │
         └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                           RELATIONSHIP KEY                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ─────────►  One-to-Many (1:N)                                          │
│  PK         Primary Key                                                  │
│  FK         Foreign Key                                                  │
│  {}         Nested object/map                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2.5 Firestore Security Rules

Access control is enforced at the database level using declarative security rules. These rules run on Firebase servers before any read/write operation.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ═══════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Check if user has premium tier or higher
    function isPremiumOrHigher() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.tier in ['PAY_AS_YOU_GO', 'PRO', 'ADMIN'];
    }
    
    // Check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.tier == 'ADMIN';
    }
    
    // ═══════════════════════════════════════════════════════════════
    // COLLECTION RULES
    // ═══════════════════════════════════════════════════════════════
    
    // USERS: Owner or Admin can read/write
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // WATCHLIST: Owner only, Premium+ required for write
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow create, update: if isOwner(userId) && isPremiumOrHigher();
      allow delete: if isOwner(userId);
    }
    
    // ALERTS: Owner only
    match /alerts/{userId}/notifications/{alertId} {
      allow read, write: if isOwner(userId);
    }
    
    // ANALYSIS HISTORY: Owner read/create, no update (immutable)
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if false;  // Scans are immutable
      allow delete: if isOwner(userId);
    }
    
    // ACTIVITY LOGS: Admin read, authenticated create
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;  // Logs are immutable
    }
    
    // CREDITS: Server-side only (via Admin SDK)
    match /user_credits/{userId} {
      allow read: if isOwner(userId);
      allow write: if false;  // Only server can modify via transactions
    }
    
    // CREDIT TRANSACTIONS: Read own, server-side create
    match /credit_transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
      allow write: if false;  // Only server can create
    }
    
    // ADMIN PREFERENCES: Admin owner only
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```

---

### 4.2.6 Data Integrity Constraints

| Constraint | Implementation | Purpose |
|------------|----------------|---------|
| **Atomic Credit Operations** | Firestore `runTransaction()` with optimistic locking | Prevents double-deduction race conditions |
| **Daily Limit Reset** | Compare `lastScanDate.toDateString()` with current UTC date | Accurate FREE tier enforcement |
| **Referential Integrity** | Application-level validation before writes | Sub-collections tied to parent user existence |
| **Unique Email** | Firebase Auth enforcement | Prevents duplicate accounts |
| **Tier Validation** | Zod schema validation in API routes | Only valid tier enum values accepted |
| **Immutable Scans** | Security rules block `update` on analysis_history | Audit trail integrity |
| **Immutable Logs** | Security rules block `update`/`delete` on activity_logs | Compliance and forensics |

**Atomic Transaction Example (Credit Deduction):**
```typescript
async function deductCredit(userId: string, amount: number): Promise<boolean> {
  const userCreditsRef = doc(db, 'user_credits', userId);
  
  return runTransaction(db, async (transaction) => {
    const creditDoc = await transaction.get(userCreditsRef);
    const currentBalance = creditDoc.data()?.balance || 0;
    
    if (currentBalance < amount) {
      throw new Error('Insufficient credits');
    }
    
    transaction.update(userCreditsRef, {
      balance: currentBalance - amount,
      lastUpdated: serverTimestamp()
    });
    
    // Create transaction record
    const txRef = doc(collection(db, 'credit_transactions'));
    transaction.set(txRef, {
      userId,
      type: 'DEDUCTION',
      amount,
      balanceBefore: currentBalance,
      balanceAfter: currentBalance - amount,
      reason: 'Token Analysis',
      timestamp: serverTimestamp()
    });
    
    return true;
  });
}
```

---

### 4.2.7 Indexing Strategy

Firestore automatically creates single-field indexes for all document fields. **Composite indexes** are required for queries combining multiple fields with different sort orders.

**firestore.indexes.json:**
```json
{
  "indexes": [
    {
      "collectionGroup": "scans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "analyzedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "scans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "chainId", "order": "ASCENDING" },
        { "fieldPath": "analyzedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tokens",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "chain", "order": "ASCENDING" },
        { "fieldPath": "lastRiskScore", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tokens",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "alertEnabled", "order": "ASCENDING" },
        { "fieldPath": "lastChecked", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "actions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "action", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "credit_transactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Index Usage Examples:**
- `scans` by `analyzedAt DESC`: Display recent analysis history
- `tokens` by `alertEnabled + lastChecked`: Background job finds tokens needing price check
- `actions` by `action + timestamp DESC`: Admin filters logs by action type

---

### 4.2.8 Data Retention and Compliance

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| User Profile | Account lifetime + 30 days | GDPR right to erasure |
| Analysis History (PRO) | 1 year | Storage cost optimization |
| Activity Logs | 2 years | Audit compliance |
| Credit Transactions | 7 years | Financial record requirements |
| Watchlist | Account lifetime | User convenience |

**GDPR Data Export Endpoint:**
```
GET /api/user/export-data
```
Returns all user data in JSON format for portability compliance.

**Account Deletion Flow:**
1. User requests deletion via `/api/user/delete-account`
2. All sub-collections (watchlist, history, logs) are deleted
3. User document is anonymized (email → "deleted_user_xxx")
4. Credit balance is forfeited (per Terms of Service)
5. Firebase Auth account is deleted

---

### 4.2.9 Figure Caption for ERD

```
Figure X: Entity Relationship Diagram - Tokenomics Lab Database Schema

The entity relationship diagram illustrates the Firestore NoSQL database structure 
for the Tokenomics Lab platform. The central USER entity connects to multiple 
sub-collections: WATCHLIST (tracked tokens), ANALYSIS_HISTORY (scan records for 
PRO users), ACTIVITY_LOG (audit trail), and ALERT (price/risk notifications). 
The credit system uses separate collections for USER_CREDITS (balance) and 
CREDIT_TRANSACTION (payment history) to enable atomic operations. All relationships 
follow a one-to-many (1:N) pattern where users own their data. The schema supports 
the four-tier access model (FREE, PAY-AS-YOU-GO, PRO, ADMIN) through the tier field 
in the USER document, with security rules enforcing tier-based feature access.
```

---

**END OF DATABASE SPECIFICATION**
