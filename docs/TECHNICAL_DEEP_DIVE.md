# Tokenomics Lab - Complete Technical Architecture

**Last Updated**: December 10, 2025  
**Version**: 2.0  
**Author**: Technical Documentation Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Data Flow](#data-flow)
5. [Core Modules](#core-modules)
6. [API Integration Layer](#api-integration-layer)
7. [Risk Calculation Engine](#risk-calculation-engine)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Schema](#database-schema)
10. [Frontend Architecture](#frontend-architecture)
11. [AI Integration](#ai-integration)
12. [Security Implementation](#security-implementation)
13. [Performance Optimization](#performance-optimization)
14. [Deployment Architecture](#deployment-architecture)
15. [**Pay-Per-Use System (NEW)**](#pay-per-use-system)

---

## 1. System Overview

### 1.1 Platform Purpose

Tokenomics Lab is a multi-chain cryptocurrency token risk analysis platform that provides:
- Real-time risk scoring (0-100 scale)
- AI-powered security assessments
- Multi-chain support (Ethereum, BSC, Solana, Polygon, etc.)
- **Three-tier access model (FREE, PAY-AS-YOU-GO, PRO)**
- Historical analytics and watchlist management
- **x402 micropayment integration**

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  Next.js 16 App Router + React 19 + TypeScript 5.9         │
│  - User Dashboard (FREE/PAY-AS-YOU-GO/PRO tiers)           │
│  - Token Analysis Interface                                 │
│  - Credit Purchase Modal (x402 integration)                 │
│  - Admin Panel (user management, analytics)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  Next.js API Routes (Serverless Functions)                  │
│  - Token Analysis Engine (/api/analyze-token)              │
│  - Credit Management (/api/credits/*)                       │
│  - User Authentication (/api/auth/*)                        │
│  - Watchlist & Alerts (/api/watchlist/*)                   │
│  - Payment Processing (x402 protocol)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                              │
│  - Risk Calculator (10-factor algorithm)                    │
│  - AI Service (Groq Llama 3.3 70B + Gemini fallback)      │
│  - Credit Deduction Service (atomic transactions)          │
│  - Chain-Adaptive Fetcher (multi-chain support)            │
│  - Activity Logger (audit trail)                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│  Firebase Firestore (NoSQL Database)                        │
│  - users (profiles, tier, credits balance)                  │
│  - user_credits (balance, transactions)                     │
│  - credit_transactions (purchase/deduction history)         │
│  - watchlist (Premium/Pay-As-You-Go only)                  │
│  - analysis_history (Pro only)                              │
│  - activity_logs (all users)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL LAYER                             │
│  - Blockchain APIs (Mobula, GoPlus, Helius, Moralis)       │
│  - AI APIs (Groq, Google Gemini)                            │
│  - x402 Payment Protocol (Base USDC micropayments)          │
│  - Email Service (Nodemailer for alerts)                    │
└─────────────────────────────────────────────────────────────┘
```


---

## 2. Technology Stack

### 2.1 Core Framework
- **Next.js 16.0.0**: React framework with App Router architecture
- **React 19.2.0**: UI library with Server Components
- **TypeScript 5.9.3**: Strict mode enabled for type safety
- **Node.js 20.x**: Runtime environment

### 2.2 Package Manager
- **pnpm 10.10.0**: Fast, disk-efficient package manager (required)

### 2.3 Styling & UI
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion 12.23.24**: Animation library
- **Lucide React 0.454.0**: Icon library (monotone design)
- **Recharts 2.15.4**: Data visualization

### 2.4 Backend & Database
- **Firebase 12.5.0**: Authentication, Firestore, Storage
- **Firebase Admin 12.7.0**: Server-side operations

### 2.5 AI & External APIs
- **Groq SDK 0.34.0**: Primary AI (Llama 3.3 70B)
- **Google Generative AI 0.24.1**: Fallback AI (Gemini)
- **Mobula API**: Market data (price, volume, liquidity)
- **Moralis API**: Blockchain transaction data
- **GoPlus API**: Contract security (EVM chains)
- **Helius API**: Solana-specific data (DAS API)
- **CoinMarketCap API**: Token search

### 2.6 Key Libraries
- **Zod 3.25.76**: Schema validation
- **Sonner 1.7.4**: Toast notifications
- **QRCode.react 4.2.0**: 2FA QR generation
- **Nodemailer 7.0.10**: Email notifications
- **date-fns 4.1.0**: Date manipulation

---

## 3. Architecture Patterns

### 3.1 Design Patterns Used

#### 3.1.1 Repository Pattern
```typescript
// lib/services/firestore-service.ts
// Abstracts Firestore operations
export async function saveToWatchlist(userId: string, token: WatchlistToken)
export async function getWatchlist(userId: string)
```

#### 3.1.2 Adapter Pattern
```typescript
// lib/security/adapters.ts
// Adapts different API responses to unified format
export function adaptGoPlusData(goplusResponse: any): SecurityData
export function adaptMobulaData(mobulaResponse: any): MarketData
```


#### 3.1.3 Strategy Pattern
```typescript
// lib/risk-factors/weights.ts
// Different weight strategies per chain
export function getWeights(chain: ChainType): WeightProfile {
  switch(chain) {
    case 'SOLANA': return SOLANA_WEIGHTS
    case 'ETHEREUM': return ETHEREUM_WEIGHTS
    // ...
  }
}
```

#### 3.1.4 Factory Pattern
```typescript
// lib/data/chain-adaptive-fetcher.ts
// Creates appropriate fetcher based on chain
function createChainFetcher(chainType: string) {
  if (chainType === 'SOLANA') return new SolanaFetcher()
  if (chainType === 'EVM') return new EVMFetcher()
}
```

#### 3.1.5 Observer Pattern
```typescript
// contexts/auth-context.tsx
// Firebase auth state observer
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user)
  })
  return unsubscribe
}, [])
```

### 3.2 Architectural Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Single Responsibility**: Each module has one clear purpose
3. **Dependency Injection**: Services receive dependencies as parameters
4. **Immutability**: State updates create new objects
5. **Type Safety**: Strict TypeScript throughout

---

## 4. Data Flow

### 4.1 Token Analysis Flow

```
User Input (Token Address)
        ↓
Dashboard Component (app/dashboard/page.tsx)
        ↓
API Route (/api/analyze-token/route.ts)
        ↓
┌─────────────────────────────────────┐
│  Chain-Adaptive Data Fetcher        │
│  (lib/data/chain-adaptive-fetcher)  │
├─────────────────────────────────────┤
│  • Detect Chain Type                │
│  • Fetch Mobula (market data)       │
│  • Fetch Moralis (transactions)     │
│  • Fetch GoPlus (security)          │
│  • Fetch Helius (Solana specific)   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Risk Calculator Engine              │
│  (lib/risk-calculator.ts)            │
├─────────────────────────────────────┤
│  1. Calculate 10 risk factors        │
│  2. Apply chain-adaptive weights     │
│  3. Detect meme tokens (AI)          │
│  4. Check official tokens            │
│  5. Detect dead tokens               │
│  6. Apply overrides                  │
│  7. Generate AI summary              │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  AI Enhancement Layer                │
│  (lib/ai/groq.ts)                    │
├─────────────────────────────────────┤
│  • Meme token classification         │
│  • Risk explanation generation       │
│  • Comprehensive summary             │
│  • Calculation breakdown             │
└─────────────────────────────────────┘
        ↓
Response to Client
        ↓
UI Rendering (Components)
```


### 4.2 Authentication Flow

```
User Login Request
        ↓
Firebase Auth (Email/Password or OAuth)
        ↓
onAuthStateChanged Event
        ↓
AuthContext Provider (contexts/auth-context.tsx)
        ↓
Fetch User Profile from Firestore
        ↓
Update Global State
        ↓
Protected Routes Check Role
        ↓
Render Appropriate Dashboard
```

### 4.3 Watchlist Management Flow

```
User Adds Token to Watchlist
        ↓
/api/pro/watchlist/route.ts
        ↓
Validate User (Premium/Admin)
        ↓
Save to Firestore: watchlist/{userId}/tokens/{tokenAddress}
        ↓
Log Activity (activity-logger.ts)
        ↓
Return Success
        ↓
Update UI State
```

---

## 5. Core Modules

### 5.1 Risk Calculator (`lib/risk-calculator.ts`)

**Purpose**: Core algorithm that calculates token risk scores

**Key Functions**:
```typescript
export async function calculateRisk(
  data: TokenData,
  plan: 'FREE' | 'PREMIUM',
  metadata?: TokenMetadata
): Promise<RiskResult>
```

**Algorithm Steps**:
1. **Stablecoin Override**: Auto-assign LOW risk to major stablecoins
2. **Meme Detection**: Use Groq AI to classify token type
3. **10-Factor Calculation**:
   - Supply Dilution (18% weight)
   - Holder Concentration (16% weight)
   - Liquidity Depth (14% weight)
   - Vesting Unlock (13% weight)
   - Contract Control (12% weight)
   - Tax/Fee (10% weight)
   - Distribution (9% weight)
   - Burn/Deflation (8% weight)
   - Adoption (7% weight)
   - Audit Transparency (3% weight)
4. **Chain-Adaptive Weights**: Adjust based on blockchain
5. **Official Token Check**: Reduce risk for verified tokens
6. **Dead Token Detection**: Flag inactive tokens
7. **AI Summary Generation**: Create human-readable explanation

**Weight Formula**:
```
Risk Score = Σ(Factor Score × Factor Weight)
Final Score = Base Score + Overrides
```


### 5.2 Chain-Adaptive Fetcher (`lib/data/chain-adaptive-fetcher.ts`)

**Purpose**: Unified data fetching across multiple blockchains

**Architecture**:
```typescript
export async function fetchCompleteTokenData(
  tokenAddress: string,
  chainId: string
): Promise<CompleteTokenData>
```

**Chain Detection Logic**:
```
chainId === '501' → Solana
chainId === '1815' → Cardano
chainId === '1' → Ethereum
chainId === '56' → BSC
// ... other EVM chains
```

**Data Sources by Chain**:

**Solana**:
- Mobula: Market data, price, volume
- Helius: Holder count, transaction count, authorities
- DexScreener: Liquidity, pairs

**EVM Chains**:
- Mobula: Market data
- Moralis: Holder count, transactions
- GoPlus: Security analysis, contract info

**Cardano**:
- Mobula: Market data
- Blockfrost: Policy info, metadata

**Quality Scoring**:
```typescript
if (marketCap > 0 && liquidity > 0 && supply > 0) {
  quality = 'EXCELLENT' // 80-100 score
} else if (marketCap > 0 || liquidity > 0) {
  quality = 'GOOD' // 60-79 score
} else if (holders > 0) {
  quality = 'MODERATE' // 40-59 score
} else {
  quality = 'POOR' // 0-39 score
}
```

### 5.3 AI Services

#### 5.3.1 Groq AI (`lib/ai/groq.ts`)

**Primary AI Provider**: Llama 3.3 70B model

**Functions**:

1. **Meme Token Detection**:
```typescript
export async function detectMemeTokenWithAI(
  token: { symbol?: string; name?: string },
  metadata?: TokenMetadata
): Promise<{
  isMeme: boolean
  confidence: number
  reasoning: string
  classification: 'MEME_TOKEN' | 'UTILITY_TOKEN' | 'GOVERNANCE_TOKEN' | 'UNKNOWN'
}>
```

2. **Risk Explanation**:
```typescript
export async function generateAIExplanation(
  tokenName: string,
  tokenSymbol: string,
  riskScore: number,
  riskLevel: string,
  factors: Array<{ name: string; value: number; weight: number }>
): Promise<string>
```

3. **Comprehensive Summary**:
```typescript
export async function generateComprehensiveAISummary(
  tokenData: TokenAnalysisData
): Promise<{
  overview: string
  keyInsights: string[]
  riskAnalysis: string
  recommendation: string
  technicalDetails: string
  calculationBreakdown: string
}>
```


#### 5.3.2 Enhanced Fallback (`lib/ai/groq-fallback.ts`)

**Purpose**: Provides detailed analysis when Groq API is unavailable

**Features**:
- Analyzes top risk factors
- Generates risk-appropriate recommendations
- Creates calculation breakdown with weighted formula
- Explains score adjustments

**Example Output**:
```
Risk Score Calculation:

Weighted Formula:
  • Audit Transparency: 80/100 × 3% = 2.40
  • Burn Deflation: 70/100 × 8% = 5.60
  • Adoption: 65/100 × 7% = 4.55
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Score: 36.78/100
Final Score: 19/100 (LOW)

Note: Final score may differ from base due to:
• Chain-specific adjustments (SOLANA)
• Official token verification (-45 points)
• Dead token detection (+90 points)
• Meme token baseline (+15 points)
```

---

## 6. API Integration Layer

### 6.1 Mobula API (`lib/api/mobula.ts`)

**Purpose**: Primary market data provider

**Endpoints Used**:
- `/api/1/market/data` - Token market data
- `/api/1/market/history` - Price history

**Data Retrieved**:
- Market cap, FDV, liquidity
- Price, volume, price changes
- Supply data (total, circulating, max)
- Token age, holder count

**Rate Limits**: Handled via API key

### 6.2 Moralis API (`lib/api/moralis.ts`)

**Purpose**: Blockchain transaction data (EVM chains)

**Endpoints Used**:
- `/erc20/{address}/metadata` - Token metadata
- `/erc20/{address}/owners` - Holder list
- `/erc20/{address}/transfers` - Transaction history

**Data Retrieved**:
- Verified holder count
- Transaction patterns (24h)
- Average holder wallet age
- Supply details

**Authentication**: API key in headers

### 6.3 GoPlus API (`lib/api/goplus.ts`)

**Purpose**: Contract security analysis (EVM chains)

**Endpoints Used**:
- `/api/v1/token_security/{chainId}` - Security scan

**Data Retrieved**:
- Honeypot detection
- Mintable status
- Owner renounced
- Buy/sell tax
- LP holders
- Contract verification

**Fallback**: Graceful degradation if unavailable


### 6.4 Helius API (`lib/api/helius.ts`)

**Purpose**: Solana-specific data

**Endpoints Used**:
- DAS (Digital Asset Standard) API
- Enhanced Transactions API

**Data Retrieved**:
- Token authorities (mint, freeze)
- Holder count (accurate)
- Transaction count
- Metadata

**Solana-Specific Checks**:
```typescript
// Freeze authority detection
if (freezeAuthority && freezeAuthority !== '11111111111111111111111111111111') {
  criticalFlags.push('Freeze authority exists - tokens can be frozen')
}

// Mint authority detection
if (mintAuthority && mintAuthority !== '11111111111111111111111111111111') {
  criticalFlags.push('Mint authority exists - supply can be inflated')
}
```

### 6.5 CoinMarketCap API (`lib/api/coinmarketcap.ts`)

**Purpose**: Token search and discovery

**Endpoints Used**:
- `/v1/cryptocurrency/map` - Token search

**Use Case**: Token address lookup by symbol

### 6.6 CoinGecko API (`lib/api/coingecko.ts`)

**Purpose**: Official token verification

**Endpoints Used**:
- `/api/v3/coins/list` - Token list
- `/api/v3/coins/{id}` - Token details

**Use Case**: Verify if token is officially listed

---

## 7. Risk Calculation Engine

### 7.1 Risk Factors Deep Dive

#### Factor 1: Supply Dilution (18% weight)
```typescript
function calcSupplyDilution(data: TokenData): number {
  const circulatingRatio = data.circulatingSupply / data.totalSupply
  
  if (circulatingRatio >= 0.95) return 10  // Low risk
  if (circulatingRatio >= 0.80) return 25
  if (circulatingRatio >= 0.60) return 45
  if (circulatingRatio >= 0.40) return 65
  return 85  // High risk - most supply locked
}
```

**Logic**: Lower circulating supply = higher dilution risk

#### Factor 2: Holder Concentration (16% weight)
```typescript
function calcHolderConcentration(data: TokenData): number {
  const top10Pct = data.top10HoldersPct
  
  if (top10Pct >= 0.80) return 95  // Critical - whale control
  if (top10Pct >= 0.60) return 75
  if (top10Pct >= 0.40) return 50
  if (top10Pct >= 0.20) return 25
  return 10  // Well distributed
}
```

**Logic**: Higher concentration = higher manipulation risk


#### Factor 3: Liquidity Depth (14% weight)
```typescript
function calcLiquidityDepth(data: TokenData): number {
  const liquidityRatio = data.liquidityUSD / data.marketCap
  
  if (liquidityRatio >= 0.30) return 5   // Excellent liquidity
  if (liquidityRatio >= 0.15) return 20
  if (liquidityRatio >= 0.08) return 40
  if (liquidityRatio >= 0.03) return 65
  return 90  // Critical - low liquidity
}
```

**Logic**: Lower liquidity = higher slippage and rug pull risk

#### Factor 4: Contract Control (12% weight)
```typescript
function calcContractControl(data: TokenData): number {
  let score = 0
  
  if (data.is_mintable) score += 40        // Can create new tokens
  if (!data.owner_renounced) score += 30   // Owner has control
  if (data.is_honeypot) score += 30        // Cannot sell
  
  // Solana-specific
  if (data.freeze_authority_exists) score += 25
  
  return Math.min(score, 100)
}
```

**Logic**: More control = higher centralization risk

#### Factor 5: Tax/Fee (10% weight)
```typescript
function calcTaxFee(data: TokenData): number {
  const totalTax = (data.buy_tax || 0) + (data.sell_tax || 0)
  
  if (totalTax === 0) return 5
  if (totalTax <= 0.05) return 20   // 5% total
  if (totalTax <= 0.10) return 40   // 10% total
  if (totalTax <= 0.20) return 70   // 20% total
  return 95  // Excessive tax
}
```

**Logic**: Higher taxes = less attractive for trading

#### Factor 6: Adoption (7% weight)
```typescript
function calcAdoption(data: TokenData): number {
  const txCount = data.txCount24h || 0
  
  if (txCount >= 10000) return 5    // Very active
  if (txCount >= 1000) return 20
  if (txCount >= 100) return 45
  if (txCount >= 10) return 70
  return 90  // Dead/inactive
}
```

**Logic**: Lower activity = lower adoption

#### Factor 7: Burn/Deflation (8% weight)
```typescript
function calcBurnDeflation(data: TokenData): number {
  const burnRatio = data.burnedSupply / data.totalSupply
  
  if (burnRatio >= 0.50) return 10   // Highly deflationary
  if (burnRatio >= 0.20) return 30
  if (burnRatio >= 0.05) return 50
  return 70  // No burn mechanism
}
```

**Logic**: More burns = deflationary pressure (good)

#### Factor 8: Audit Transparency (3% weight)
```typescript
function calcAuditTransparency(data: TokenData): number {
  let score = 50  // Base score
  
  if (data.is_open_source) score -= 20
  if (data.is_verified) score -= 20
  if (!data.is_open_source) score += 30
  
  return Math.max(0, Math.min(score, 100))
}
```

**Logic**: Open source + verified = more transparent


### 7.2 Chain-Adaptive Weights

Different blockchains have different risk profiles:

```typescript
// lib/risk-factors/weights.ts

export const ETHEREUM_WEIGHTS = {
  contractControl: 0.20,      // High importance on Ethereum
  holderConcentration: 0.18,
  liquidityDepth: 0.15,
  supplyDilution: 0.14,
  // ...
}

export const SOLANA_WEIGHTS = {
  liquidityDepth: 0.22,       // Liquidity critical on Solana
  holderConcentration: 0.18,
  contractControl: 0.15,      // Authorities important
  adoption: 0.12,             // Activity matters more
  // ...
}

export const BSC_WEIGHTS = {
  taxFee: 0.18,              // Taxes common on BSC
  contractControl: 0.17,
  holderConcentration: 0.16,
  // ...
}
```

**Rationale**:
- **Ethereum**: Contract security paramount (high gas = serious projects)
- **Solana**: Liquidity and activity critical (fast, cheap transactions)
- **BSC**: Tax mechanisms common (need careful evaluation)

### 7.3 Override Mechanisms

#### 7.3.1 Official Token Override
```typescript
// lib/services/official-token-resolver.ts

export function applyOfficialTokenOverride(
  baseScore: number,
  isOfficial: boolean,
  marketCap: number,
  isMeme: boolean
): { score: number; applied: boolean } {
  if (!isOfficial) return { score: baseScore, applied: false }
  
  let reduction = 45  // Base reduction
  
  // Reduce bonus for meme tokens
  if (isMeme) {
    reduction = 25  // Memes are inherently risky
  }
  
  // Scale by market cap
  if (marketCap > 1_000_000_000) {
    reduction += 5  // Extra confidence for $1B+ tokens
  }
  
  return {
    score: Math.max(5, baseScore - reduction),
    applied: true
  }
}
```

**Logic**: Official tokens (CoinGecko listed, >$50M mcap) get risk reduction

#### 7.3.2 Dead Token Override
```typescript
// lib/risk-factors/dead-token.ts

export function checkDeadToken(data: TokenMetrics): DeadTokenResult {
  const flags: string[] = []
  
  // Check liquidity
  if (data.liquidityUSD < 100) {
    flags.push('Liquidity below $100')
  }
  
  // Check volume
  if (data.volume24h < 10) {
    flags.push('24h volume below $10')
  }
  
  // Check transactions
  if (data.txCount24h === 0) {
    flags.push('Zero transactions in 24h')
  }
  
  // Check price crash
  if (data.priceChange30d < -95) {
    flags.push('Price down >95% in 30 days')
  }
  
  const isDead = flags.length >= 2
  
  return { isDead, flags }
}

export function applyDeadTokenOverride(
  baseScore: number,
  deadCheck: DeadTokenResult
): { score: number; criticalFlag?: string } {
  if (!deadCheck.isDead) return { score: baseScore }
  
  return {
    score: Math.max(baseScore, 90),  // Force to 90+
    criticalFlag: `Dead token detected: ${deadCheck.flags.join(', ')}`
  }
}
```

**Logic**: Dead tokens are automatically high risk


#### 7.3.3 Meme Token Baseline
```typescript
// In risk-calculator.ts

if (memeDetection.isMeme) {
  overallScoreRaw += 15  // Add baseline risk
  console.log(`🎭 [Meme Token] Added +15 baseline risk`)
}
```

**Logic**: Meme tokens are inherently more volatile and risky

### 7.4 Risk Classification

```typescript
function classifyRisk(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) return 'CRITICAL'  // 75-100
  if (score >= 50) return 'HIGH'      // 50-74
  if (score >= 35) return 'MEDIUM'    // 35-49
  return 'LOW'                        // 0-34
}
```

**Thresholds**:
- **0-34**: LOW - Generally safe
- **35-49**: MEDIUM - Proceed with caution
- **50-74**: HIGH - Significant risks
- **75-100**: CRITICAL - Avoid

---

## 8. Authentication & Authorization

### 8.1 Firebase Authentication

**Setup** (`lib/firebase.ts`):
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

**Auth Methods Supported**:
1. Email/Password
2. Google OAuth
3. GitHub OAuth (optional)

### 8.2 Auth Context (`contexts/auth-context.tsx`)

**Purpose**: Global authentication state management

```typescript
interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid)
        setUserProfile(profile)
      }
      
      setLoading(false)
    })
    
    return unsubscribe
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, userProfile, loading, ... }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Usage in Components**:
```typescript
const { user, userProfile } = useAuth()

if (!user) {
  return <LoginPrompt />
}

if (userProfile?.tier === 'FREE') {
  return <FreeDashboard />
}
```


### 8.3 Role-Based Access Control

**User Tiers**:
```typescript
type UserTier = 'FREE' | 'PREMIUM' | 'ADMIN'

interface UserProfile {
  uid: string
  email: string
  tier: UserTier
  displayName?: string
  photoURL?: string
  createdAt: Date
  tokensAnalyzed: number
  lastScanDate?: Date
}
```

**Access Control Hook** (`hooks/use-user-role.ts`):
```typescript
export function useUserRole() {
  const { userProfile } = useAuth()
  
  return {
    isFree: userProfile?.tier === 'FREE',
    isPremium: userProfile?.tier === 'PREMIUM',
    isAdmin: userProfile?.tier === 'ADMIN',
    tier: userProfile?.tier || 'FREE'
  }
}
```

**Feature Gating**:
```typescript
// In components
const { isPremium } = useUserRole()

if (!isPremium) {
  return <UpgradePrompt feature="AI Insights" />
}

return <AIInsightsPanel />
```

**API Route Protection**:
```typescript
// In API routes
export async function POST(req: Request) {
  const { userId } = await req.json()
  
  const userProfile = await getUserProfile(userId)
  
  if (userProfile.tier === 'FREE') {
    // Check rate limits
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  }
  
  // Proceed with request
}
```

### 8.4 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Admin Login Flow**:
```
1. User enters email/password
2. Firebase authenticates
3. Check if user has 2FA enabled
4. If yes, prompt for TOTP code
5. Verify TOTP code
6. Grant access
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
    return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**: Black (#000000)
- **Borders**: White with opacity (white/10, white/20, white/30)
- **Text**: White with varying opacity
- **Glassmorphism**: `backdrop-blur-lg bg-black/60`
- **Accents**: 
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

**Typography**:
- **Headings**: `font-mono tracking-wider uppercase`
- **Body**: `font-mono text-sm`
- **Code**: `font-mono text-xs`

### 10.6 Responsive Design

**Breakpoints**:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Approach**:
```typescript
// Base styles for mobile
<div className="p-4 text-sm">
  
// Tablet and up
<div className="p-4 md:p-6 text-sm md:text-base">
  
// Desktop and up
<div className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg">
```

**Responsive Patterns**:
1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. **Flex Direction**: `flex-col md:flex-row`
3. **Hidden Elements**: `hidden md:block`
4. **Text Sizes**: `text-xs md:text-sm lg:text-base`

---

## 11. AI Integration

### 11.1 Groq AI Architecture

**Model**: Llama 3.3 70B Versatile

**Configuration**:
```typescript
const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an expert cryptocurrency analyst..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,      // Low for consistency
  max_tokens: 1500,      // Sufficient for detailed analysis
})
```

**Temperature Settings**:
- **0.3**: Meme detection (need consistency)
- **0.4**: Comprehensive summary (balanced)
- **0.5**: Risk explanation (slightly creative)


### 11.2 Prompt Engineering

#### 11.2.1 Meme Token Detection Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and classify it. Return ONLY valid JSON.

Token Name: ${tokenName}
Symbol: ${tokenSymbol}
${metadata?.description ? `Description: ${metadata.description}` : ''}
${metadata?.website ? `Website: ${metadata.website}` : ''}
${metadata?.twitter ? `Twitter: ${metadata.twitter}` : ''}

Classify as one of: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, or UNKNOWN

Meme tokens typically:
- Have dog, cat, or animal themes
- Use internet memes or viral references
- Have community-focused names
- Lack clear utility beyond speculation

Return JSON format:
{
  "classification": "MEME_TOKEN | UTILITY_TOKEN | GOVERNANCE_TOKEN | UNKNOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`
```

**Key Techniques**:
- Clear output format specification
- Examples of classification criteria
- Structured JSON response
- Confidence scoring

#### 11.2.2 Comprehensive Summary Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and provide structured insights:

## Token Information
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Chain: ${tokenData.chain}
- Risk Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})
- Price: ${tokenData.price}
- Market Cap: ${tokenData.marketCap.toLocaleString()}
- Holders: ${tokenData.holders}
- Liquidity: ${tokenData.liquidity.toLocaleString()}
- Age: ${tokenData.age}

## Risk Factors
${factorsSummary}

${tokenData.redFlags?.length > 0 ? `## Red Flags\n${tokenData.redFlags.join('\n')}` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overview": "2-3 sentence summary of the token",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "riskAnalysis": "detailed risk assessment (3-4 sentences)",
  "recommendation": "clear investment recommendation",
  "technicalDetails": "technical highlights and chain-specific details"
}

Be professional, actionable, and data-driven. No speculation.`
```

**Key Techniques**:
- Structured data presentation
- Clear section headers
- Specific output requirements
- Professional tone guidance

### 11.3 AI Response Processing

**JSON Cleaning**:
```typescript
let jsonText = responseText
if (jsonText.includes('```json')) {
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
} else if (jsonText.includes('```')) {
  jsonText = jsonText.replace(/```\n?/g, '')
}

const response = JSON.parse(jsonText)
```

**Validation**:
```typescript
if (!response.classification || !response.confidence || !response.reasoning) {
  throw new Error('Invalid response structure from Groq')
}
```

**Error Handling**:
```typescript
try {
  const aiSummary = await generateComprehensiveAISummary(tokenData)
  result.ai_summary = aiSummary
} catch (error) {
  console.error('[Groq AI] Failed:', error.message)
  // Use enhanced fallback
  result.ai_summary = generateEnhancedFallback(tokenData)
}
```

### 11.4 Fallback Strategy

**Hierarchy**:
```
1. Groq AI (Primary)
        ↓ (if fails)
2. Enhanced Fallback (lib/ai/groq-fallback.ts)
        ↓ (always works)
3. Basic Fallback (minimal data)
```

**Enhanced Fallback Features**:
- Analyzes risk factors programmatically
- Generates risk-appropriate recommendations
- Creates calculation breakdown
- Explains score adjustments
- No external API dependency


---

## 12. Security Implementation

### 12.1 API Security

#### 12.1.1 Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
interface RateLimitConfig {
  FREE: {
    maxRequests: 20,
    windowMs: 86400000  // 24 hours
  },
  PREMIUM: {
    maxRequests: -1,    // Unlimited
    windowMs: 0
  }
}

export async function checkRateLimit(
  userId: string,
  tier: 'FREE' | 'PREMIUM'
): Promise<{ allowed: boolean; resetTime?: Date }> {
  if (tier === 'PREMIUM') {
    return { allowed: true }
  }
  
  // Get user's scan count from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  
  const today = new Date().toDateString()
  const lastScanDate = userData?.lastScanDate?.toDate().toDateString()
  
  if (lastScanDate !== today) {
    // Reset counter for new day
    await updateDoc(doc(db, 'users', userId), {
      tokensAnalyzed: 0,
      lastScanDate: new Date()
    })
    return { allowed: true }
  }
  
  const scansToday = userData?.tokensAnalyzed || 0
  
  if (scansToday >= 20) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      resetTime: tomorrow
    }
  }
  
  return { allowed: true }
}
```

**Usage in API Routes**:
```typescript
export async function POST(req: Request) {
  const { userId, plan } = await req.json()
  
  if (plan === 'FREE' && userId) {
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Free plan: 20 scans per day',
          upgrade_prompt: 'Upgrade to Premium for unlimited scans',
          reset_time: rateLimit.resetTime
        },
        { status: 429 }
      )
    }
  }
  
  // Process request
}
```

#### 12.1.2 Input Validation

**Token Address Validation**:
```typescript
function validateTokenAddress(address: string, chainId: string): boolean {
  // Ethereum/EVM: 0x + 40 hex characters
  if (chainId !== '501' && chainId !== '1815') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Solana: 32-44 base58 characters
  if (chainId === '501') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  
  // Cardano: Bech32 format
  if (chainId === '1815') {
    return /^addr1[a-z0-9]{58}$/.test(address)
  }
  
  return false
}
```

**Zod Schema Validation**:
```typescript
import { z } from 'zod'

const AnalyzeTokenSchema = z.object({
  tokenAddress: z.string().min(32).max(66),
  chainId: z.string(),
  userId: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ADMIN']),
  metadata: z.object({
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    chain: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = AnalyzeTokenSchema.parse(body)
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

#### 12.1.3 API Key Protection

**Environment Variables**:
```bash
# Never commit these to git
MOBULA_API_KEY=xxx
MORALIS_API_KEY=xxx
GOPLUS_API_KEY=xxx
HELIUS_API_KEY=xxx
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx
```

**Server-Side Only**:
```typescript
// ✅ CORRECT: API routes (server-side)
const apiKey = process.env.MOBULA_API_KEY

// ❌ WRONG: Client components
// Never expose API keys to client
```

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  env: {
    // Only expose public keys
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // Server-only keys stay hidden
  }
}
```


### 12.2 Authentication Security

#### 12.2.1 Firebase Auth Configuration

**Security Rules**:
```javascript
// firebase.json
{
  "auth": {
    "settings": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumeric": true
      },
      "emailVerification": {
        "required": true
      }
    }
  }
}
```

**Session Management**:
```typescript
// contexts/auth-context.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
        setError('Please verify your email')
        return
      }
      
      // Check if account is active
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile?.status === 'SUSPENDED') {
        await signOut(auth)
        setError('Account suspended')
        return
      }
      
      setUser(firebaseUser)
      setUserProfile(profile)
    } else {
      setUser(null)
      setUserProfile(null)
    }
  })
  
  return unsubscribe
}, [])
```

#### 12.2.2 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Login with 2FA**:
```typescript
// app/admin/login/page.tsx
async function handleLogin(email: string, password: string) {
  // Step 1: Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Step 2: Check if 2FA enabled
  const profile = await getUserProfile(userCredential.user.uid)
  
  if (profile.totpEnabled) {
    // Step 3: Prompt for TOTP code
    setShow2FAPrompt(true)
    return
  }
  
  // No 2FA, proceed to dashboard
  router.push('/admin/dashboard')
}

async function verify2FA(code: string) {
  const profile = await getUserProfile(user.uid)
  const isValid = verifyTOTP(code, profile.totpSecret)
  
  if (isValid) {
    router.push('/admin/dashboard')
  } else {
    setError('Invalid code')
  }
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
       return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**: Black (#000000)
- **Borders**: White with opacity (white/10, white/20, white/30)
- **Text**: White with varying opacity
- **Glassmorphism**: `backdrop-blur-lg bg-black/60`
- **Accents**: 
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

**Typography**:
- **Headings**: `font-mono tracking-wider uppercase`
- **Body**: `font-mono text-sm`
- **Code**: `font-mono text-xs`

### 10.6 Responsive Design

**Breakpoints**:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Approach**:
```typescript
// Base styles for mobile
<div className="p-4 text-sm">
  
// Tablet and up
<div className="p-4 md:p-6 text-sm md:text-base">
  
// Desktop and up
<div className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg">
```

**Responsive Patterns**:
1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. **Flex Direction**: `flex-col md:flex-row`
3. **Hidden Elements**: `hidden md:block`
4. **Text Sizes**: `text-xs md:text-sm lg:text-base`

---

## 11. AI Integration

### 11.1 Groq AI Architecture

**Model**: Llama 3.3 70B Versatile

**Configuration**:
```typescript
const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an expert cryptocurrency analyst..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,      // Low for consistency
  max_tokens: 1500,      // Sufficient for detailed analysis
})
```

**Temperature Settings**:
- **0.3**: Meme detection (need consistency)
- **0.4**: Comprehensive summary (balanced)
- **0.5**: Risk explanation (slightly creative)


### 11.2 Prompt Engineering

#### 11.2.1 Meme Token Detection Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and classify it. Return ONLY valid JSON.

Token Name: ${tokenName}
Symbol: ${tokenSymbol}
${metadata?.description ? `Description: ${metadata.description}` : ''}
${metadata?.website ? `Website: ${metadata.website}` : ''}
${metadata?.twitter ? `Twitter: ${metadata.twitter}` : ''}

Classify as one of: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, or UNKNOWN

Meme tokens typically:
- Have dog, cat, or animal themes
- Use internet memes or viral references
- Have community-focused names
- Lack clear utility beyond speculation

Return JSON format:
{
  "classification": "MEME_TOKEN | UTILITY_TOKEN | GOVERNANCE_TOKEN | UNKNOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`
```

**Key Techniques**:
- Clear output format specification
- Examples of classification criteria
- Structured JSON response
- Confidence scoring

#### 11.2.2 Comprehensive Summary Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and provide structured insights:

## Token Information
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Chain: ${tokenData.chain}
- Risk Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})
- Price: ${tokenData.price}
- Market Cap: ${tokenData.marketCap.toLocaleString()}
- Holders: ${tokenData.holders}
- Liquidity: ${tokenData.liquidity.toLocaleString()}
- Age: ${tokenData.age}

## Risk Factors
${factorsSummary}

${tokenData.redFlags?.length > 0 ? `## Red Flags\n${tokenData.redFlags.join('\n')}` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overview": "2-3 sentence summary of the token",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "riskAnalysis": "detailed risk assessment (3-4 sentences)",
  "recommendation": "clear investment recommendation",
  "technicalDetails": "technical highlights and chain-specific details"
}

Be professional, actionable, and data-driven. No speculation.`
```

**Key Techniques**:
- Structured data presentation
- Clear section headers
- Specific output requirements
- Professional tone guidance

### 11.3 AI Response Processing

**JSON Cleaning**:
```typescript
let jsonText = responseText
if (jsonText.includes('```json')) {
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
} else if (jsonText.includes('```')) {
  jsonText = jsonText.replace(/```\n?/g, '')
}

const response = JSON.parse(jsonText)
```

**Validation**:
```typescript
if (!response.classification || !response.confidence || !response.reasoning) {
  throw new Error('Invalid response structure from Groq')
}
```

**Error Handling**:
```typescript
try {
  const aiSummary = await generateComprehensiveAISummary(tokenData)
  result.ai_summary = aiSummary
} catch (error) {
  console.error('[Groq AI] Failed:', error.message)
  // Use enhanced fallback
  result.ai_summary = generateEnhancedFallback(tokenData)
}
```

### 11.4 Fallback Strategy

**Hierarchy**:
```
1. Groq AI (Primary)
        ↓ (if fails)
2. Enhanced Fallback (lib/ai/groq-fallback.ts)
        ↓ (always works)
3. Basic Fallback (minimal data)
```

**Enhanced Fallback Features**:
- Analyzes risk factors programmatically
- Generates risk-appropriate recommendations
- Creates calculation breakdown
- Explains score adjustments
- No external API dependency


---

## 12. Security Implementation

### 12.1 API Security

#### 12.1.1 Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
interface RateLimitConfig {
  FREE: {
    maxRequests: 20,
    windowMs: 86400000  // 24 hours
  },
  PREMIUM: {
    maxRequests: -1,    // Unlimited
    windowMs: 0
  }
}

export async function checkRateLimit(
  userId: string,
  tier: 'FREE' | 'PREMIUM'
): Promise<{ allowed: boolean; resetTime?: Date }> {
  if (tier === 'PREMIUM') {
    return { allowed: true }
  }
  
  // Get user's scan count from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  
  const today = new Date().toDateString()
  const lastScanDate = userData?.lastScanDate?.toDate().toDateString()
  
  if (lastScanDate !== today) {
    // Reset counter for new day
    await updateDoc(doc(db, 'users', userId), {
      tokensAnalyzed: 0,
      lastScanDate: new Date()
    })
    return { allowed: true }
  }
  
  const scansToday = userData?.tokensAnalyzed || 0
  
  if (scansToday >= 20) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      resetTime: tomorrow
    }
  }
  
  return { allowed: true }
}
```

**Usage in API Routes**:
```typescript
export async function POST(req: Request) {
  const { userId, plan } = await req.json()
  
  if (plan === 'FREE' && userId) {
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Free plan: 20 scans per day',
          upgrade_prompt: 'Upgrade to Premium for unlimited scans',
          reset_time: rateLimit.resetTime
        },
        { status: 429 }
      )
    }
  }
  
  // Process request
}
```

#### 12.1.2 Input Validation

**Token Address Validation**:
```typescript
function validateTokenAddress(address: string, chainId: string): boolean {
  // Ethereum/EVM: 0x + 40 hex characters
  if (chainId !== '501' && chainId !== '1815') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Solana: 32-44 base58 characters
  if (chainId === '501') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  
  // Cardano: Bech32 format
  if (chainId === '1815') {
    return /^addr1[a-z0-9]{58}$/.test(address)
  }
  
  return false
}
```

**Zod Schema Validation**:
```typescript
import { z } from 'zod'

const AnalyzeTokenSchema = z.object({
  tokenAddress: z.string().min(32).max(66),
  chainId: z.string(),
  userId: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ADMIN']),
  metadata: z.object({
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    chain: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = AnalyzeTokenSchema.parse(body)
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

#### 12.1.3 API Key Protection

**Environment Variables**:
```bash
# Never commit these to git
MOBULA_API_KEY=xxx
MORALIS_API_KEY=xxx
GOPLUS_API_KEY=xxx
HELIUS_API_KEY=xxx
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx
```

**Server-Side Only**:
```typescript
// ✅ CORRECT: API routes (server-side)
const apiKey = process.env.MOBULA_API_KEY

// ❌ WRONG: Client components
// Never expose API keys to client
```

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  env: {
    // Only expose public keys
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // Server-only keys stay hidden
  }
}
```


### 12.2 Authentication Security

#### 12.2.1 Firebase Auth Configuration

**Security Rules**:
```javascript
// firebase.json
{
  "auth": {
    "settings": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumeric": true
      },
      "emailVerification": {
        "required": true
      }
    }
  }
}
```

**Session Management**:
```typescript
// contexts/auth-context.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
        setError('Please verify your email')
        return
      }
      
      // Check if account is active
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile?.status === 'SUSPENDED') {
        await signOut(auth)
        setError('Account suspended')
        return
      }
      
      setUser(firebaseUser)
      setUserProfile(profile)
    } else {
      setUser(null)
      setUserProfile(null)
    }
  })
  
  return unsubscribe
}, [])
```

#### 12.2.2 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Login with 2FA**:
```typescript
// app/admin/login/page.tsx
async function handleLogin(email: string, password: string) {
  // Step 1: Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Step 2: Check if 2FA enabled
  const profile = await getUserProfile(userCredential.user.uid)
  
  if (profile.totpEnabled) {
    // Step 3: Prompt for TOTP code
    setShow2FAPrompt(true)
    return
  }
  
  // No 2FA, proceed to dashboard
  router.push('/admin/dashboard')
}

async function verify2FA(code: string) {
  const profile = await getUserProfile(user.uid)
  const isValid = verifyTOTP(code, profile.totpSecret)
  
  if (isValid) {
    router.push('/admin/dashboard')
  } else {
    setError('Invalid code')
  }
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
    return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**: Black (#000000)
- **Borders**: White with opacity (white/10, white/20, white/30)
- **Text**: White with varying opacity
- **Glassmorphism**: `backdrop-blur-lg bg-black/60`
- **Accents**: 
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

**Typography**:
- **Headings**: `font-mono tracking-wider uppercase`
- **Body**: `font-mono text-sm`
- **Code**: `font-mono text-xs`

### 10.6 Responsive Design

**Breakpoints**:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Approach**:
```typescript
// Base styles for mobile
<div className="p-4 text-sm">
  
// Tablet and up
<div className="p-4 md:p-6 text-sm md:text-base">
  
// Desktop and up
<div className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg">
```

**Responsive Patterns**:
1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. **Flex Direction**: `flex-col md:flex-row`
3. **Hidden Elements**: `hidden md:block`
4. **Text Sizes**: `text-xs md:text-sm lg:text-base`

---

## 11. AI Integration

### 11.1 Groq AI Architecture

**Model**: Llama 3.3 70B Versatile

**Configuration**:
```typescript
const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an expert cryptocurrency analyst..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,      // Low for consistency
  max_tokens: 1500,      // Sufficient for detailed analysis
})
```

**Temperature Settings**:
- **0.3**: Meme detection (need consistency)
- **0.4**: Comprehensive summary (balanced)
- **0.5**: Risk explanation (slightly creative)


### 11.2 Prompt Engineering

#### 11.2.1 Meme Token Detection Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and classify it. Return ONLY valid JSON.

Token Name: ${tokenName}
Symbol: ${tokenSymbol}
${metadata?.description ? `Description: ${metadata.description}` : ''}
${metadata?.website ? `Website: ${metadata.website}` : ''}
${metadata?.twitter ? `Twitter: ${metadata.twitter}` : ''}

Classify as one of: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, or UNKNOWN

Meme tokens typically:
- Have dog, cat, or animal themes
- Use internet memes or viral references
- Have community-focused names
- Lack clear utility beyond speculation

Return JSON format:
{
  "classification": "MEME_TOKEN | UTILITY_TOKEN | GOVERNANCE_TOKEN | UNKNOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`
```

**Key Techniques**:
- Clear output format specification
- Examples of classification criteria
- Structured JSON response
- Confidence scoring

#### 11.2.2 Comprehensive Summary Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and provide structured insights:

## Token Information
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Chain: ${tokenData.chain}
- Risk Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})
- Price: ${tokenData.price}
- Market Cap: ${tokenData.marketCap.toLocaleString()}
- Holders: ${tokenData.holders}
- Liquidity: ${tokenData.liquidity.toLocaleString()}
- Age: ${tokenData.age}

## Risk Factors
${factorsSummary}

${tokenData.redFlags?.length > 0 ? `## Red Flags\n${tokenData.redFlags.join('\n')}` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overview": "2-3 sentence summary of the token",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "riskAnalysis": "detailed risk assessment (3-4 sentences)",
  "recommendation": "clear investment recommendation",
  "technicalDetails": "technical highlights and chain-specific details"
}

Be professional, actionable, and data-driven. No speculation.`
```

**Key Techniques**:
- Structured data presentation
- Clear section headers
- Specific output requirements
- Professional tone guidance

### 11.3 AI Response Processing

**JSON Cleaning**:
```typescript
let jsonText = responseText
if (jsonText.includes('```json')) {
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
} else if (jsonText.includes('```')) {
  jsonText = jsonText.replace(/```\n?/g, '')
}

const response = JSON.parse(jsonText)
```

**Validation**:
```typescript
if (!response.classification || !response.confidence || !response.reasoning) {
  throw new Error('Invalid response structure from Groq')
}
```

**Error Handling**:
```typescript
try {
  const aiSummary = await generateComprehensiveAISummary(tokenData)
  result.ai_summary = aiSummary
} catch (error) {
  console.error('[Groq AI] Failed:', error.message)
  // Use enhanced fallback
  result.ai_summary = generateEnhancedFallback(tokenData)
}
```

### 11.4 Fallback Strategy

**Hierarchy**:
```
1. Groq AI (Primary)
        ↓ (if fails)
2. Enhanced Fallback (lib/ai/groq-fallback.ts)
        ↓ (always works)
3. Basic Fallback (minimal data)
```

**Enhanced Fallback Features**:
- Analyzes risk factors programmatically
- Generates risk-appropriate recommendations
- Creates calculation breakdown
- Explains score adjustments
- No external API dependency


---

## 12. Security Implementation

### 12.1 API Security

#### 12.1.1 Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
interface RateLimitConfig {
  FREE: {
    maxRequests: 20,
    windowMs: 86400000  // 24 hours
  },
  PREMIUM: {
    maxRequests: -1,    // Unlimited
    windowMs: 0
  }
}

export async function checkRateLimit(
  userId: string,
  tier: 'FREE' | 'PREMIUM'
): Promise<{ allowed: boolean; resetTime?: Date }> {
  if (tier === 'PREMIUM') {
    return { allowed: true }
  }
  
  // Get user's scan count from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  
  const today = new Date().toDateString()
  const lastScanDate = userData?.lastScanDate?.toDate().toDateString()
  
  if (lastScanDate !== today) {
    // Reset counter for new day
    await updateDoc(doc(db, 'users', userId), {
      tokensAnalyzed: 0,
      lastScanDate: new Date()
    })
    return { allowed: true }
  }
  
  const scansToday = userData?.tokensAnalyzed || 0
  
  if (scansToday >= 20) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      resetTime: tomorrow
    }
  }
  
  return { allowed: true }
}
```

**Usage in API Routes**:
```typescript
export async function POST(req: Request) {
  const { userId, plan } = await req.json()
  
  if (plan === 'FREE' && userId) {
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Free plan: 20 scans per day',
          upgrade_prompt: 'Upgrade to Premium for unlimited scans',
          reset_time: rateLimit.resetTime
        },
        { status: 429 }
      )
    }
  }
  
  // Process request
}
```

#### 12.1.2 Input Validation

**Token Address Validation**:
```typescript
function validateTokenAddress(address: string, chainId: string): boolean {
  // Ethereum/EVM: 0x + 40 hex characters
  if (chainId !== '501' && chainId !== '1815') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Solana: 32-44 base58 characters
  if (chainId === '501') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  
  // Cardano: Bech32 format
  if (chainId === '1815') {
    return /^addr1[a-z0-9]{58}$/.test(address)
  }
  
  return false
}
```

**Zod Schema Validation**:
```typescript
import { z } from 'zod'

const AnalyzeTokenSchema = z.object({
  tokenAddress: z.string().min(32).max(66),
  chainId: z.string(),
  userId: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ADMIN']),
  metadata: z.object({
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    chain: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = AnalyzeTokenSchema.parse(body)
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

#### 12.1.3 API Key Protection

**Environment Variables**:
```bash
# Never commit these to git
MOBULA_API_KEY=xxx
MORALIS_API_KEY=xxx
GOPLUS_API_KEY=xxx
HELIUS_API_KEY=xxx
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx
```

**Server-Side Only**:
```typescript
// ✅ CORRECT: API routes (server-side)
const apiKey = process.env.MOBULA_API_KEY

// ❌ WRONG: Client components
// Never expose API keys to client
```

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  env: {
    // Only expose public keys
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // Server-only keys stay hidden
  }
}
```


### 12.2 Authentication Security

#### 12.2.1 Firebase Auth Configuration

**Security Rules**:
```javascript
// firebase.json
{
  "auth": {
    "settings": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumeric": true
      },
      "emailVerification": {
        "required": true
      }
    }
  }
}
```

**Session Management**:
```typescript
// contexts/auth-context.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
        setError('Please verify your email')
        return
      }
      
      // Check if account is active
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile?.status === 'SUSPENDED') {
        await signOut(auth)
        setError('Account suspended')
        return
      }
      
      setUser(firebaseUser)
      setUserProfile(profile)
    } else {
      setUser(null)
      setUserProfile(null)
    }
  })
  
  return unsubscribe
}, [])
```

#### 12.2.2 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Login with 2FA**:
```typescript
// app/admin/login/page.tsx
async function handleLogin(email: string, password: string) {
  // Step 1: Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Step 2: Check if 2FA enabled
  const profile = await getUserProfile(userCredential.user.uid)
  
  if (profile.totpEnabled) {
    // Step 3: Prompt for TOTP code
    setShow2FAPrompt(true)
    return
  }
  
  // No 2FA, proceed to dashboard
  router.push('/admin/dashboard')
}

async function verify2FA(code: string) {
  const profile = await getUserProfile(user.uid)
  const isValid = verifyTOTP(code, profile.totpSecret)
  
  if (isValid) {
    router.push('/admin/dashboard')
  } else {
    setError('Invalid code')
  }
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
    return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**: Black (#000000)
- **Borders**: White with opacity (white/10, white/20, white/30)
- **Text**: White with varying opacity
- **Glassmorphism**: `backdrop-blur-lg bg-black/60`
- **Accents**: 
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

**Typography**:
- **Headings**: `font-mono tracking-wider uppercase`
- **Body**: `font-mono text-sm`
- **Code**: `font-mono text-xs`

### 10.6 Responsive Design

**Breakpoints**:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Approach**:
```typescript
// Base styles for mobile
<div className="p-4 text-sm">
  
// Tablet and up
<div className="p-4 md:p-6 text-sm md:text-base">
  
// Desktop and up
<div className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg">
```

**Responsive Patterns**:
1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. **Flex Direction**: `flex-col md:flex-row`
3. **Hidden Elements**: `hidden md:block`
4. **Text Sizes**: `text-xs md:text-sm lg:text-base`

---

## 11. AI Integration

### 11.1 Groq AI Architecture

**Model**: Llama 3.3 70B Versatile

**Configuration**:
```typescript
const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an expert cryptocurrency analyst..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,      // Low for consistency
  max_tokens: 1500,      // Sufficient for detailed analysis
})
```

**Temperature Settings**:
- **0.3**: Meme detection (need consistency)
- **0.4**: Comprehensive summary (balanced)
- **0.5**: Risk explanation (slightly creative)


### 11.2 Prompt Engineering

#### 11.2.1 Meme Token Detection Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and classify it. Return ONLY valid JSON.

Token Name: ${tokenName}
Symbol: ${tokenSymbol}
${metadata?.description ? `Description: ${metadata.description}` : ''}
${metadata?.website ? `Website: ${metadata.website}` : ''}
${metadata?.twitter ? `Twitter: ${metadata.twitter}` : ''}

Classify as one of: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, or UNKNOWN

Meme tokens typically:
- Have dog, cat, or animal themes
- Use internet memes or viral references
- Have community-focused names
- Lack clear utility beyond speculation

Return JSON format:
{
  "classification": "MEME_TOKEN | UTILITY_TOKEN | GOVERNANCE_TOKEN | UNKNOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`
```

**Key Techniques**:
- Clear output format specification
- Examples of classification criteria
- Structured JSON response
- Confidence scoring

#### 11.2.2 Comprehensive Summary Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and provide structured insights:

## Token Information
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Chain: ${tokenData.chain}
- Risk Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})
- Price: ${tokenData.price}
- Market Cap: ${tokenData.marketCap.toLocaleString()}
- Holders: ${tokenData.holders}
- Liquidity: ${tokenData.liquidity.toLocaleString()}
- Age: ${tokenData.age}

## Risk Factors
${factorsSummary}

${tokenData.redFlags?.length > 0 ? `## Red Flags\n${tokenData.redFlags.join('\n')}` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overview": "2-3 sentence summary of the token",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "riskAnalysis": "detailed risk assessment (3-4 sentences)",
  "recommendation": "clear investment recommendation",
  "technicalDetails": "technical highlights and chain-specific details"
}

Be professional, actionable, and data-driven. No speculation.`
```

**Key Techniques**:
- Structured data presentation
- Clear section headers
- Specific output requirements
- Professional tone guidance

### 11.3 AI Response Processing

**JSON Cleaning**:
```typescript
let jsonText = responseText
if (jsonText.includes('```json')) {
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
} else if (jsonText.includes('```')) {
  jsonText = jsonText.replace(/```\n?/g, '')
}

const response = JSON.parse(jsonText)
```

**Validation**:
```typescript
if (!response.classification || !response.confidence || !response.reasoning) {
  throw new Error('Invalid response structure from Groq')
}
```

**Error Handling**:
```typescript
try {
  const aiSummary = await generateComprehensiveAISummary(tokenData)
  result.ai_summary = aiSummary
} catch (error) {
  console.error('[Groq AI] Failed:', error.message)
  // Use enhanced fallback
  result.ai_summary = generateEnhancedFallback(tokenData)
}
```

### 11.4 Fallback Strategy

**Hierarchy**:
```
1. Groq AI (Primary)
        ↓ (if fails)
2. Enhanced Fallback (lib/ai/groq-fallback.ts)
        ↓ (always works)
3. Basic Fallback (minimal data)
```

**Enhanced Fallback Features**:
- Analyzes risk factors programmatically
- Generates risk-appropriate recommendations
- Creates calculation breakdown
- Explains score adjustments
- No external API dependency


---

## 12. Security Implementation

### 12.1 API Security

#### 12.1.1 Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
interface RateLimitConfig {
  FREE: {
    maxRequests: 20,
    windowMs: 86400000  // 24 hours
  },
  PREMIUM: {
    maxRequests: -1,    // Unlimited
    windowMs: 0
  }
}

export async function checkRateLimit(
  userId: string,
  tier: 'FREE' | 'PREMIUM'
): Promise<{ allowed: boolean; resetTime?: Date }> {
  if (tier === 'PREMIUM') {
    return { allowed: true }
  }
  
  // Get user's scan count from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  
  const today = new Date().toDateString()
  const lastScanDate = userData?.lastScanDate?.toDate().toDateString()
  
  if (lastScanDate !== today) {
    // Reset counter for new day
    await updateDoc(doc(db, 'users', userId), {
      tokensAnalyzed: 0,
      lastScanDate: new Date()
    })
    return { allowed: true }
  }
  
  const scansToday = userData?.tokensAnalyzed || 0
  
  if (scansToday >= 20) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      resetTime: tomorrow
    }
  }
  
  return { allowed: true }
}
```

**Usage in API Routes**:
```typescript
export async function POST(req: Request) {
  const { userId, plan } = await req.json()
  
  if (plan === 'FREE' && userId) {
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Free plan: 20 scans per day',
          upgrade_prompt: 'Upgrade to Premium for unlimited scans',
          reset_time: rateLimit.resetTime
        },
        { status: 429 }
      )
    }
  }
  
  // Process request
}
```

#### 12.1.2 Input Validation

**Token Address Validation**:
```typescript
function validateTokenAddress(address: string, chainId: string): boolean {
  // Ethereum/EVM: 0x + 40 hex characters
  if (chainId !== '501' && chainId !== '1815') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Solana: 32-44 base58 characters
  if (chainId === '501') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  
  // Cardano: Bech32 format
  if (chainId === '1815') {
    return /^addr1[a-z0-9]{58}$/.test(address)
  }
  
  return false
}
```

**Zod Schema Validation**:
```typescript
import { z } from 'zod'

const AnalyzeTokenSchema = z.object({
  tokenAddress: z.string().min(32).max(66),
  chainId: z.string(),
  userId: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ADMIN']),
  metadata: z.object({
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    chain: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = AnalyzeTokenSchema.parse(body)
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

#### 12.1.3 API Key Protection

**Environment Variables**:
```bash
# Never commit these to git
MOBULA_API_KEY=xxx
MORALIS_API_KEY=xxx
GOPLUS_API_KEY=xxx
HELIUS_API_KEY=xxx
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx
```

**Server-Side Only**:
```typescript
// ✅ CORRECT: API routes (server-side)
const apiKey = process.env.MOBULA_API_KEY

// ❌ WRONG: Client components
// Never expose API keys to client
```

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  env: {
    // Only expose public keys
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // Server-only keys stay hidden
  }
}
```


### 12.2 Authentication Security

#### 12.2.1 Firebase Auth Configuration

**Security Rules**:
```javascript
// firebase.json
{
  "auth": {
    "settings": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumeric": true
      },
      "emailVerification": {
        "required": true
      }
    }
  }
}
```

**Session Management**:
```typescript
// contexts/auth-context.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
        setError('Please verify your email')
        return
      }
      
      // Check if account is active
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile?.status === 'SUSPENDED') {
        await signOut(auth)
        setError('Account suspended')
        return
      }
      
      setUser(firebaseUser)
      setUserProfile(profile)
    } else {
      setUser(null)
      setUserProfile(null)
    }
  })
  
  return unsubscribe
}, [])
```

#### 12.2.2 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Login with 2FA**:
```typescript
// app/admin/login/page.tsx
async function handleLogin(email: string, password: string) {
  // Step 1: Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Step 2: Check if 2FA enabled
  const profile = await getUserProfile(userCredential.user.uid)
  
  if (profile.totpEnabled) {
    // Step 3: Prompt for TOTP code
    setShow2FAPrompt(true)
    return
  }
  
  // No 2FA, proceed to dashboard
  router.push('/admin/dashboard')
}

async function verify2FA(code: string) {
  const profile = await getUserProfile(user.uid)
  const isValid = verifyTOTP(code, profile.totpSecret)
  
  if (isValid) {
    router.push('/admin/dashboard')
  } else {
    setError('Invalid code')
  }
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
    return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**: Black (#000000)
- **Borders**: White with opacity (white/10, white/20, white/30)
- **Text**: White with varying opacity
- **Glassmorphism**: `backdrop-blur-lg bg-black/60`
- **Accents**: 
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

**Typography**:
- **Headings**: `font-mono tracking-wider uppercase`
- **Body**: `font-mono text-sm`
- **Code**: `font-mono text-xs`

### 10.6 Responsive Design

**Breakpoints**:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Approach**:
```typescript
// Base styles for mobile
<div className="p-4 text-sm">
  
// Tablet and up
<div className="p-4 md:p-6 text-sm md:text-base">
  
// Desktop and up
<div className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg">
```

**Responsive Patterns**:
1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. **Flex Direction**: `flex-col md:flex-row`
3. **Hidden Elements**: `hidden md:block`
4. **Text Sizes**: `text-xs md:text-sm lg:text-base`

---

## 11. AI Integration

### 11.1 Groq AI Architecture

**Model**: Llama 3.3 70B Versatile

**Configuration**:
```typescript
const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an expert cryptocurrency analyst..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,      // Low for consistency
  max_tokens: 1500,      // Sufficient for detailed analysis
})
```

**Temperature Settings**:
- **0.3**: Meme detection (need consistency)
- **0.4**: Comprehensive summary (balanced)
- **0.5**: Risk explanation (slightly creative)


### 11.2 Prompt Engineering

#### 11.2.1 Meme Token Detection Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and classify it. Return ONLY valid JSON.

Token Name: ${tokenName}
Symbol: ${tokenSymbol}
${metadata?.description ? `Description: ${metadata.description}` : ''}
${metadata?.website ? `Website: ${metadata.website}` : ''}
${metadata?.twitter ? `Twitter: ${metadata.twitter}` : ''}

Classify as one of: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, or UNKNOWN

Meme tokens typically:
- Have dog, cat, or animal themes
- Use internet memes or viral references
- Have community-focused names
- Lack clear utility beyond speculation

Return JSON format:
{
  "classification": "MEME_TOKEN | UTILITY_TOKEN | GOVERNANCE_TOKEN | UNKNOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`
```

**Key Techniques**:
- Clear output format specification
- Examples of classification criteria
- Structured JSON response
- Confidence scoring

#### 11.2.2 Comprehensive Summary Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and provide structured insights:

## Token Information
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Chain: ${tokenData.chain}
- Risk Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})
- Price: ${tokenData.price}
- Market Cap: ${tokenData.marketCap.toLocaleString()}
- Holders: ${tokenData.holders}
- Liquidity: ${tokenData.liquidity.toLocaleString()}
- Age: ${tokenData.age}

## Risk Factors
${factorsSummary}

${tokenData.redFlags?.length > 0 ? `## Red Flags\n${tokenData.redFlags.join('\n')}` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overview": "2-3 sentence summary of the token",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "riskAnalysis": "detailed risk assessment (3-4 sentences)",
  "recommendation": "clear investment recommendation",
  "technicalDetails": "technical highlights and chain-specific details"
}

Be professional, actionable, and data-driven. No speculation.`
```

**Key Techniques**:
- Structured data presentation
- Clear section headers
- Specific output requirements
- Professional tone guidance

### 11.3 AI Response Processing

**JSON Cleaning**:
```typescript
let jsonText = responseText
if (jsonText.includes('```json')) {
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
} else if (jsonText.includes('```')) {
  jsonText = jsonText.replace(/```\n?/g, '')
}

const response = JSON.parse(jsonText)
```

**Validation**:
```typescript
if (!response.classification || !response.confidence || !response.reasoning) {
  throw new Error('Invalid response structure from Groq')
}
```

**Error Handling**:
```typescript
try {
  const aiSummary = await generateComprehensiveAISummary(tokenData)
  result.ai_summary = aiSummary
} catch (error) {
  console.error('[Groq AI] Failed:', error.message)
  // Use enhanced fallback
  result.ai_summary = generateEnhancedFallback(tokenData)
}
```

### 11.4 Fallback Strategy

**Hierarchy**:
```
1. Groq AI (Primary)
        ↓ (if fails)
2. Enhanced Fallback (lib/ai/groq-fallback.ts)
        ↓ (always works)
3. Basic Fallback (minimal data)
```

**Enhanced Fallback Features**:
- Analyzes risk factors programmatically
- Generates risk-appropriate recommendations
- Creates calculation breakdown
- Explains score adjustments
- No external API dependency


---

## 12. Security Implementation

### 12.1 API Security

#### 12.1.1 Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
interface RateLimitConfig {
  FREE: {
    maxRequests: 20,
    windowMs: 86400000  // 24 hours
  },
  PREMIUM: {
    maxRequests: -1,    // Unlimited
    windowMs: 0
  }
}

export async function checkRateLimit(
  userId: string,
  tier: 'FREE' | 'PREMIUM'
): Promise<{ allowed: boolean; resetTime?: Date }> {
  if (tier === 'PREMIUM') {
    return { allowed: true }
  }
  
  // Get user's scan count from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  
  const today = new Date().toDateString()
  const lastScanDate = userData?.lastScanDate?.toDate().toDateString()
  
  if (lastScanDate !== today) {
    // Reset counter for new day
    await updateDoc(doc(db, 'users', userId), {
      tokensAnalyzed: 0,
      lastScanDate: new Date()
    })
    return { allowed: true }
  }
  
  const scansToday = userData?.tokensAnalyzed || 0
  
  if (scansToday >= 20) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      resetTime: tomorrow
    }
  }
  
  return { allowed: true }
}
```

**Usage in API Routes**:
```typescript
export async function POST(req: Request) {
  const { userId, plan } = await req.json()
  
  if (plan === 'FREE' && userId) {
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Free plan: 20 scans per day',
          upgrade_prompt: 'Upgrade to Premium for unlimited scans',
          reset_time: rateLimit.resetTime
        },
        { status: 429 }
      )
    }
  }
  
  // Process request
}
```

#### 12.1.2 Input Validation

**Token Address Validation**:
```typescript
function validateTokenAddress(address: string, chainId: string): boolean {
  // Ethereum/EVM: 0x + 40 hex characters
  if (chainId !== '501' && chainId !== '1815') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Solana: 32-44 base58 characters
  if (chainId === '501') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  
  // Cardano: Bech32 format
  if (chainId === '1815') {
    return /^addr1[a-z0-9]{58}$/.test(address)
  }
  
  return false
}
```

**Zod Schema Validation**:
```typescript
import { z } from 'zod'

const AnalyzeTokenSchema = z.object({
  tokenAddress: z.string().min(32).max(66),
  chainId: z.string(),
  userId: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ADMIN']),
  metadata: z.object({
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    chain: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = AnalyzeTokenSchema.parse(body)
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

#### 12.1.3 API Key Protection

**Environment Variables**:
```bash
# Never commit these to git
MOBULA_API_KEY=xxx
MORALIS_API_KEY=xxx
GOPLUS_API_KEY=xxx
HELIUS_API_KEY=xxx
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx
```

**Server-Side Only**:
```typescript
// ✅ CORRECT: API routes (server-side)
const apiKey = process.env.MOBULA_API_KEY

// ❌ WRONG: Client components
// Never expose API keys to client
```

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  env: {
    // Only expose public keys
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // Server-only keys stay hidden
  }
}
```


### 12.2 Authentication Security

#### 12.2.1 Firebase Auth Configuration

**Security Rules**:
```javascript
// firebase.json
{
  "auth": {
    "settings": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumeric": true
      },
      "emailVerification": {
        "required": true
      }
    }
  }
}
```

**Session Management**:
```typescript
// contexts/auth-context.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
        setError('Please verify your email')
        return
      }
      
      // Check if account is active
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile?.status === 'SUSPENDED') {
        await signOut(auth)
        setError('Account suspended')
        return
      }
      
      setUser(firebaseUser)
      setUserProfile(profile)
    } else {
      setUser(null)
      setUserProfile(null)
    }
  })
  
  return unsubscribe
}, [])
```

#### 12.2.2 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Login with 2FA**:
```typescript
// app/admin/login/page.tsx
async function handleLogin(email: string, password: string) {
  // Step 1: Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Step 2: Check if 2FA enabled
  const profile = await getUserProfile(userCredential.user.uid)
  
  if (profile.totpEnabled) {
    // Step 3: Prompt for TOTP code
    setShow2FAPrompt(true)
    return
  }
  
  // No 2FA, proceed to dashboard
  router.push('/admin/dashboard')
}

async function verify2FA(code: string) {
  const profile = await getUserProfile(user.uid)
  const isValid = verifyTOTP(code, profile.totpSecret)
  
  if (isValid) {
    router.push('/admin/dashboard')
  } else {
    setError('Invalid code')
  }
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
    return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**: Black (#000000)
- **Borders**: White with opacity (white/10, white/20, white/30)
- **Text**: White with varying opacity
- **Glassmorphism**: `backdrop-blur-lg bg-black/60`
- **Accents**: 
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

**Typography**:
- **Headings**: `font-mono tracking-wider uppercase`
- **Body**: `font-mono text-sm`
- **Code**: `font-mono text-xs`

### 10.6 Responsive Design

**Breakpoints**:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Approach**:
```typescript
// Base styles for mobile
<div className="p-4 text-sm">
  
// Tablet and up
<div className="p-4 md:p-6 text-sm md:text-base">
  
// Desktop and up
<div className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg">
```

**Responsive Patterns**:
1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
2. **Flex Direction**: `flex-col md:flex-row`
3. **Hidden Elements**: `hidden md:block`
4. **Text Sizes**: `text-xs md:text-sm lg:text-base`

---

## 11. AI Integration

### 11.1 Groq AI Architecture

**Model**: Llama 3.3 70B Versatile

**Configuration**:
```typescript
const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an expert cryptocurrency analyst..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,      // Low for consistency
  max_tokens: 1500,      // Sufficient for detailed analysis
})
```

**Temperature Settings**:
- **0.3**: Meme detection (need consistency)
- **0.4**: Comprehensive summary (balanced)
- **0.5**: Risk explanation (slightly creative)


### 11.2 Prompt Engineering

#### 11.2.1 Meme Token Detection Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and classify it. Return ONLY valid JSON.

Token Name: ${tokenName}
Symbol: ${tokenSymbol}
${metadata?.description ? `Description: ${metadata.description}` : ''}
${metadata?.website ? `Website: ${metadata.website}` : ''}
${metadata?.twitter ? `Twitter: ${metadata.twitter}` : ''}

Classify as one of: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, or UNKNOWN

Meme tokens typically:
- Have dog, cat, or animal themes
- Use internet memes or viral references
- Have community-focused names
- Lack clear utility beyond speculation

Return JSON format:
{
  "classification": "MEME_TOKEN | UTILITY_TOKEN | GOVERNANCE_TOKEN | UNKNOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`
```

**Key Techniques**:
- Clear output format specification
- Examples of classification criteria
- Structured JSON response
- Confidence scoring

#### 11.2.2 Comprehensive Summary Prompt

```typescript
const prompt = `Analyze this cryptocurrency token and provide structured insights:

## Token Information
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Chain: ${tokenData.chain}
- Risk Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})
- Price: ${tokenData.price}
- Market Cap: ${tokenData.marketCap.toLocaleString()}
- Holders: ${tokenData.holders}
- Liquidity: ${tokenData.liquidity.toLocaleString()}
- Age: ${tokenData.age}

## Risk Factors
${factorsSummary}

${tokenData.redFlags?.length > 0 ? `## Red Flags\n${tokenData.redFlags.join('\n')}` : ''}

Provide a comprehensive analysis in JSON format:
{
  "overview": "2-3 sentence summary of the token",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "riskAnalysis": "detailed risk assessment (3-4 sentences)",
  "recommendation": "clear investment recommendation",
  "technicalDetails": "technical highlights and chain-specific details"
}

Be professional, actionable, and data-driven. No speculation.`
```

**Key Techniques**:
- Structured data presentation
- Clear section headers
- Specific output requirements
- Professional tone guidance

### 11.3 AI Response Processing

**JSON Cleaning**:
```typescript
let jsonText = responseText
if (jsonText.includes('```json')) {
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
} else if (jsonText.includes('```')) {
  jsonText = jsonText.replace(/```\n?/g, '')
}

const response = JSON.parse(jsonText)
```

**Validation**:
```typescript
if (!response.classification || !response.confidence || !response.reasoning) {
  throw new Error('Invalid response structure from Groq')
}
```

**Error Handling**:
```typescript
try {
  const aiSummary = await generateComprehensiveAISummary(tokenData)
  result.ai_summary = aiSummary
} catch (error) {
  console.error('[Groq AI] Failed:', error.message)
  // Use enhanced fallback
  result.ai_summary = generateEnhancedFallback(tokenData)
}
```

### 11.4 Fallback Strategy

**Hierarchy**:
```
1. Groq AI (Primary)
        ↓ (if fails)
2. Enhanced Fallback (lib/ai/groq-fallback.ts)
        ↓ (always works)
3. Basic Fallback (minimal data)
```

**Enhanced Fallback Features**:
- Analyzes risk factors programmatically
- Generates risk-appropriate recommendations
- Creates calculation breakdown
- Explains score adjustments
- No external API dependency


---

## 12. Security Implementation

### 12.1 API Security

#### 12.1.1 Rate Limiting

**Implementation** (`lib/rate-limit.ts`):
```typescript
interface RateLimitConfig {
  FREE: {
    maxRequests: 20,
    windowMs: 86400000  // 24 hours
  },
  PREMIUM: {
    maxRequests: -1,    // Unlimited
    windowMs: 0
  }
}

export async function checkRateLimit(
  userId: string,
  tier: 'FREE' | 'PREMIUM'
): Promise<{ allowed: boolean; resetTime?: Date }> {
  if (tier === 'PREMIUM') {
    return { allowed: true }
  }
  
  // Get user's scan count from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  
  const today = new Date().toDateString()
  const lastScanDate = userData?.lastScanDate?.toDate().toDateString()
  
  if (lastScanDate !== today) {
    // Reset counter for new day
    await updateDoc(doc(db, 'users', userId), {
      tokensAnalyzed: 0,
      lastScanDate: new Date()
    })
    return { allowed: true }
  }
  
  const scansToday = userData?.tokensAnalyzed || 0
  
  if (scansToday >= 20) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return {
      allowed: false,
      resetTime: tomorrow
    }
  }
  
  return { allowed: true }
}
```

**Usage in API Routes**:
```typescript
export async function POST(req: Request) {
  const { userId, plan } = await req.json()
  
  if (plan === 'FREE' && userId) {
    const rateLimit = await checkRateLimit(userId, 'FREE')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Free plan: 20 scans per day',
          upgrade_prompt: 'Upgrade to Premium for unlimited scans',
          reset_time: rateLimit.resetTime
        },
        { status: 429 }
      )
    }
  }
  
  // Process request
}
```

#### 12.1.2 Input Validation

**Token Address Validation**:
```typescript
function validateTokenAddress(address: string, chainId: string): boolean {
  // Ethereum/EVM: 0x + 40 hex characters
  if (chainId !== '501' && chainId !== '1815') {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Solana: 32-44 base58 characters
  if (chainId === '501') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  
  // Cardano: Bech32 format
  if (chainId === '1815') {
    return /^addr1[a-z0-9]{58}$/.test(address)
  }
  
  return false
}
```

**Zod Schema Validation**:
```typescript
import { z } from 'zod'

const AnalyzeTokenSchema = z.object({
  tokenAddress: z.string().min(32).max(66),
  chainId: z.string(),
  userId: z.string().optional(),
  plan: z.enum(['FREE', 'PREMIUM', 'ADMIN']),
  metadata: z.object({
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    chain: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = AnalyzeTokenSchema.parse(body)
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

#### 12.1.3 API Key Protection

**Environment Variables**:
```bash
# Never commit these to git
MOBULA_API_KEY=xxx
MORALIS_API_KEY=xxx
GOPLUS_API_KEY=xxx
HELIUS_API_KEY=xxx
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx
```

**Server-Side Only**:
```typescript
// ✅ CORRECT: API routes (server-side)
const apiKey = process.env.MOBULA_API_KEY

// ❌ WRONG: Client components
// Never expose API keys to client
```

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  env: {
    // Only expose public keys
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // Server-only keys stay hidden
  }
}
```


### 12.2 Authentication Security

#### 12.2.1 Firebase Auth Configuration

**Security Rules**:
```javascript
// firebase.json
{
  "auth": {
    "settings": {
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumeric": true
      },
      "emailVerification": {
        "required": true
      }
    }
  }
}
```

**Session Management**:
```typescript
// contexts/auth-context.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
        setError('Please verify your email')
        return
      }
      
      // Check if account is active
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile?.status === 'SUSPENDED') {
        await signOut(auth)
        setError('Account suspended')
        return
      }
      
      setUser(firebaseUser)
      setUserProfile(profile)
    } else {
      setUser(null)
      setUserProfile(null)
    }
  })
  
  return unsubscribe
}, [])
```

#### 12.2.2 Admin 2FA (TOTP)

**Setup** (`lib/totp.ts`):
```typescript
import * as OTPAuth from 'otpauth'

export function generateTOTPSecret(): {
  secret: string
  qrCode: string
  uri: string
} {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: 'Tokenomics Lab',
    label: 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  })
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrCode: totp.toString()  // Used with QRCode.react
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}
```

**Login with 2FA**:
```typescript
// app/admin/login/page.tsx
async function handleLogin(email: string, password: string) {
  // Step 1: Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // Step 2: Check if 2FA enabled
  const profile = await getUserProfile(userCredential.user.uid)
  
  if (profile.totpEnabled) {
    // Step 3: Prompt for TOTP code
    setShow2FAPrompt(true)
    return
  }
  
  // No 2FA, proceed to dashboard
  router.push('/admin/dashboard')
}

async function verify2FA(code: string) {
  const profile = await getUserProfile(user.uid)
  const isValid = verifyTOTP(code, profile.totpSecret)
  
  if (isValid) {
    router.push('/admin/dashboard')
  } else {
    setError('Invalid code')
  }
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users/{userId}`
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string  // Base64 or URL
  tier: 'FREE' | 'PREMIUM' | 'ADMIN'
  createdAt: Timestamp
  tokensAnalyzed: number
  lastScanDate?: Timestamp
  
  // Profile fields
  name?: string
  company?: string
  country?: string
  
  // Admin fields
  totpSecret?: string
  totpEnabled: boolean
}
```


#### Collection: `watchlist/{userId}/tokens/{tokenAddress}`
```typescript
interface WatchlistToken {
  address: string
  symbol: string
  name: string
  chain: string
  chainId: string
  addedAt: Timestamp
  lastRiskScore?: number
  lastChecked?: Timestamp
  alertEnabled: boolean
  alertThreshold?: number
}
```

#### Collection: `alerts/{userId}/notifications/{alertId}`
```typescript
interface AlertNotification {
  id: string
  tokenAddress: string
  tokenSymbol: string
  type: 'RISK_INCREASE' | 'RISK_DECREASE' | 'PRICE_CHANGE'
  oldValue: number
  newValue: number
  message: string
  read: boolean
  createdAt: Timestamp
}
```

#### Collection: `analysis_history/{userId}/scans/{scanId}`
```typescript
interface AnalysisHistory {
  id: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  chainId: string
  results: {
    overall_risk_score: number
    risk_level: string
    confidence_score: number
    breakdown: Record<string, number>
    critical_flags?: string[]
    upcoming_risks?: string[]
  }
  marketSnapshot: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  plan: 'FREE' | 'PREMIUM'
  analyzedAt: Timestamp
}
```

#### Collection: `activity_logs/{userId}/actions/{actionId}`
```typescript
interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_SCAN' | 'PROFILE_UPDATE' | 
          'WATCHLIST_ADD' | 'WATCHLIST_REMOVE' | 'TIER_UPGRADE' |
          'DATA_EXPORT' | 'ACCOUNT_DELETE'
  details?: {
    tokenAddress?: string
    chainId?: string
    riskScore?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}
```

#### Collection: `admin_notification_preferences/{userId}`
```typescript
interface AdminNotificationPreferences {
  emailNotifications: boolean
  criticalAlertsOnly: boolean
  dailyDigest: boolean
  notificationEmail?: string
}
```

### 9.2 Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPremiumOrAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier in ['PREMIUM', 'ADMIN'];
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.tier == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // Watchlist collection
    match /watchlist/{userId}/tokens/{tokenAddress} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isPremiumOrAdmin();
    }
    
    // Analysis history
    match /analysis_history/{userId}/scans/{scanId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Activity logs (admin only)
    match /activity_logs/{userId}/actions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Admin preferences
    match /admin_notification_preferences/{userId} {
      allow read, write: if isOwner(userId) && isAdmin();
    }
  }
}
```


---

## 10. Frontend Architecture

### 10.1 Next.js App Router Structure

**Directory Layout**:
```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── not-found.tsx              # 404 page
├── sitemap.ts                 # Dynamic sitemap
│
├── login/
│   └── page.tsx               # Login page
├── signup/
│   └── page.tsx               # Signup page
│
├── dashboard/
│   └── page.tsx               # Unified dashboard (role-aware)
│
├── profile/
│   └── page.tsx               # User profile management
│
├── admin/
│   ├── login/page.tsx         # Admin login with 2FA
│   └── dashboard/page.tsx     # Admin panel
│
├── docs/
│   ├── page.tsx               # Documentation index
│   └── algorithm/page.tsx     # Algorithm explanation
│
├── pricing/
│   └── page.tsx               # Pricing tiers
│
├── api/                       # API routes
│   ├── analyze-token/
│   │   └── route.ts           # Main analysis endpoint
│   ├── token/
│   │   ├── search/route.ts
│   │   ├── history/route.ts
│   │   └── insights/route.ts
│   ├── user/
│   │   ├── export-data/route.ts
│   │   └── delete-account/route.ts
│   ├── admin/
│   │   ├── users/route.ts
│   │   ├── analytics/route.ts
│   │   ├── settings/route.ts
│   │   ├── activity-logs/route.ts
│   │   └── totp/
│   │       ├── setup/route.ts
│   │       ├── verify/route.ts
│   │       └── disable/route.ts
│   └── pro/
│       ├── watchlist/route.ts
│       └── alerts/route.ts
```

### 10.2 Component Architecture

**Component Hierarchy**:
```
App
├── Providers (AuthContext, ModalProvider)
│   ├── Navbar (Global navigation)
│   │   ├── UserMenu (Dropdown)
│   │   └── MobileMenu (Hamburger)
│   │
│   ├── Page Content
│   │   ├── Dashboard
│   │   │   ├── TokenSearch (CMC/DexScreener)
│   │   │   ├── ScanResults
│   │   │   │   ├── TokenHeader
│   │   │   │   ├── AIAnalysisAccordion
│   │   │   │   ├── RiskOverview
│   │   │   │   ├── MarketMetrics
│   │   │   │   ├── HolderDistribution
│   │   │   │   ├── CalculationBreakdown
│   │   │   │   └── ChainSpecificInfo
│   │   │   └── WatchlistPanel (Premium)
│   │   │
│   │   ├── AdminPanel
│   │   │   ├── Sidebar
│   │   │   ├── UsersTab
│   │   │   ├── AnalyticsTab (Charts)
│   │   │   ├── SettingsTab
│   │   │   └── LogsTab
│   │   │
│   │   └── Profile
│   │       ├── ProfileImageUpload
│   │       ├── PersonalInfo
│   │       └── AccountActions
│   │
│   └── CustomModal (Global modal system)
```

### 10.3 Key Components Deep Dive

#### 10.3.1 Navbar (`components/navbar.tsx`)

**Features**:
- Floating design with glassmorphism
- Smart scroll detection (hides on scroll down)
- Role-aware menu items
- User dropdown with profile picture
- Hamburger menu for mobile

**Implementation**:
```typescript
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const { isAdmin } = useUserRole()
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                     transition-all duration-300
                     ${scrolled ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
      {/* Navbar content */}
    </nav>
  )
}
```


#### 10.3.2 Token Search (`components/token-search-cmc.tsx`)

**Features**:
- CoinMarketCap API integration
- DexScreener search
- Chain selector
- Recent searches
- Autocomplete

**Search Flow**:
```
User Types Query
        ↓
Debounce (300ms)
        ↓
Call /api/token/search
        ↓
Display Results
        ↓
User Selects Token
        ↓
Trigger Analysis
```

#### 10.3.3 AI Analysis Accordion (`components/ai-analysis-accordion.tsx`)

**Structure**:
```typescript
interface AIAnalysisAccordionProps {
  aiSummary: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  tokenName: string
  riskLevel: string
}
```

**Sections**:
1. **Collapsed Header**: Shows preview of overview
2. **Expanded Content**:
   - Overview
   - Risk Analysis
   - Key Insights (4 bullet points)
   - Recommendation (color-coded)
   - Calculation Breakdown (formula with weights)
   - Technical Details

**Color Coding**:
```typescript
const getRecommendationColor = (rec: string) => {
  if (rec.includes('avoid') || rec.includes('critical')) {
    return 'text-red-400 bg-red-400/10 border-red-500/30'
  }
  if (rec.includes('caution') || rec.includes('high risk')) {
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
  }
  if (rec.includes('low risk') || rec.includes('safe')) {
    return 'text-green-400 bg-green-400/10 border-green-500/30'
  }
  return 'text-gray-400 bg-gray-400/10 border-gray-500/30'
}
```

#### 10.3.4 Custom Modal System (`components/custom-modal.tsx`)

**Purpose**: Replace browser alerts with themed modals

**Types**:
```typescript
type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Usage**:
```typescript
const { showModal } = useModal()

showModal({
  type: 'confirm',
  title: 'Delete Account',
  message: 'Are you sure? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await deleteAccount()
  }
})
```

#### 10.3.5 Loader Component (`components/loader.tsx`)

**Variants**:
```typescript
type LoaderVariant = 'default' | 'small' | 'large' | 'fullscreen'

interface LoaderProps {
  variant?: LoaderVariant
  message?: string
}
```

**Animation**:
- Rotating rings (3 concentric circles)
- Pulsing dots (3 dots)
- Smooth transitions
- Glassmorphic background


### 10.4 State Management

**Approach**: React Context + Local State (no Redux)

**Global State** (via Context):
- Authentication state (`AuthContext`)
- Modal state (`ModalProvider`)

**Local State** (via useState):
- Component-specific UI state
- Form inputs
- Loading states
- Search results

**Why No Redux?**:
- Next.js Server Components reduce client state needs
- Context API sufficient for auth and modals
- Most data fetched on-demand via API routes
- Simpler architecture, less boilerplate

### 10.5 Styling System

**Tailwind Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

**Design System**:
- **Background**:

---

## 15. Pay-Per-Use System

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
