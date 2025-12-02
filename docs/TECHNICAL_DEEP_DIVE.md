# Tokenomics Lab - Complete Technical Architecture

**Last Updated**: November 24, 2025  
**Version**: 1.0  
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

---

## 1. System Overview

### 1.1 Platform Purpose

Tokenomics Lab is a multi-chain cryptocurrency token risk analysis platform that provides:
- Real-time risk scoring (0-100 scale)
- AI-powered security assessments
- Multi-chain support (Ethereum, BSC, Solana, Polygon, etc.)
- Tiered access (FREE, PREMIUM, ADMIN)
- Historical analytics and watchlist management

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  Next.js 16 App Router + React 19 + TypeScript 5.9         │
│  (Server Components + Client Components)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API ROUTE LAYER                            │
│  /api/analyze-token  /api/token/*  /api/user/*             │
│  /api/admin/*        /api/pro/*    /api/solana/*           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│  Risk Calculator │ Token Scanner │ AI Services              │
│  Data Fetchers   │ Security      │ Activity Logger          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES LAYER                         │
│  Mobula API  │ Moralis API  │ GoPlus API                   │
│  Helius API  │ Groq AI      │ Gemini AI                    │
│  Firebase    │ CoinMarketCap│ CoinGecko                    │
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

**Setup Flow**:
```
1. Admin requests 2FA setup
        ↓
2. Generate TOTP secret
        ↓
3. Display QR code
        ↓
4. Admin scans with authenticator app
        ↓
5. Admin enters verification code
        ↓
6. Verify code (±30 second window)
        ↓
7. Save encrypted secret to Firestore
        ↓
8. Enable 2FA for account
```

**Implementation**:
```typescript
// lib/totp.ts
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
    qrCode: totp.toString()
  }
}

export function verifyTOTP(
  token: string,
  secret: string
): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  })
  
  // Allow ±1 period (30 seconds) for clock skew
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

### 12.3 Data Protection

#### 12.3.1 PII Handling

**User Data Encryption**:
```typescript
// Profile images stored as base64 in Firestore
// Encrypted at rest by Firebase

interface UserProfile {
  email: string           // Encrypted by Firebase Auth
  photoURL?: string       // Base64 encoded
  totpSecret?: string     // Encrypted by Firebase
}
```

**Data Export** (GDPR Compliance):
```typescript
// app/api/user/export-data/route.ts
export async function POST(req: Request) {
  const { userId } = await req.json()
  
  // Gather all user data
  const userData = await getUserProfile(userId)
  const watchlist = await getWatchlist(userId)
  const history = await getAnalysisHistory(userId)
  const alerts = await getAlerts(userId)
  
  const exportData = {
    profile: userData,
    watchlist: watchlist,
    analysisHistory: history,
    alerts: alerts,
    exportedAt: new Date().toISOString()
  }
  
  return NextResponse.json(exportData)
}
```

**Data Deletion** (Right to be Forgotten):
```typescript
// app/api/user/delete-account/route.ts
export async function POST(req: Request) {
  const { userId } = await req.json()
  
  // Delete all user data
  await deleteDoc(doc(db, 'users', userId))
  await deleteCollection(db, `watchlist/${userId}/tokens`)
  await deleteCollection(db, `analysis_history/${userId}/scans`)
  await deleteCollection(db, `alerts/${userId}/notifications`)
  
  // Delete Firebase Auth account
  await admin.auth().deleteUser(userId)
  
  return NextResponse.json({ success: true })
}
```


#### 12.3.2 XSS Prevention

**React's Built-in Protection**:
```typescript
// ✅ SAFE: React escapes by default
<div>{userInput}</div>

// ❌ DANGEROUS: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE: Sanitize if HTML needed
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Content Security Policy** (Next.js headers):
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.mobula.io https://api.moralis.io"
            ].join('; ')
          }
        ]
      }
    ]
  }
}
```

#### 12.3.3 CSRF Protection

**Next.js Built-in Protection**:
- API routes use POST/PUT/DELETE methods
- Same-origin policy enforced
- Credentials required for authenticated requests

**Additional Headers**:
```typescript
// API route example
export async function POST(req: Request) {
  // Verify origin
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://tokenomicslab.com',
    'http://localhost:3000'
  ]
  
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  
  // Process request
}
```

### 12.4 Activity Logging

**Implementation** (`lib/services/activity-logger.ts`):
```typescript
export async function logActivity(
  userId: string,
  action: ActivityAction,
  details?: Record<string, any>,
  req?: Request
): Promise<void> {
  try {
    const activityLog: ActivityLog = {
      id: crypto.randomUUID(),
      userId,
      userEmail: details?.userEmail || 'unknown',
      action,
      details,
      ipAddress: req?.headers.get('x-forwarded-for') || 
                 req?.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: req?.headers.get('user-agent') || 'unknown',
      timestamp: Timestamp.now()
    }
    
    await addDoc(
      collection(db, `activity_logs/${userId}/actions`),
      activityLog
    )
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - logging failure shouldn't break app
  }
}

// Usage examples
await logActivity(userId, 'LOGIN', { method: 'email' })
await logActivity(userId, 'TOKEN_SCAN', { 
  tokenAddress, 
  chainId, 
  riskScore 
})
await logActivity(userId, 'TIER_UPGRADE', { 
  from: 'FREE', 
  to: 'PREMIUM' 
})
```

**Admin Monitoring**:
```typescript
// app/admin/dashboard/page.tsx - Logs Tab
const [logs, setLogs] = useState<ActivityLog[]>([])

useEffect(() => {
  const fetchLogs = async () => {
    const logsSnapshot = await getDocs(
      query(
        collectionGroup(db, 'actions'),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
    )
    
    const logsData = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    setLogs(logsData)
  }
  
  fetchLogs()
}, [])
```

---

## 13. Performance Optimization

### 13.1 Caching Strategy

#### 13.1.1 Token Data Caching

**Implementation** (`lib/tokenomics-cache.ts`):
```typescript
interface CachedTokenData {
  address: string
  name: string
  symbol: string
  priceData?: {
    price: number
    marketCap: number
    volume24h: number
    liquidity: number
  }
  securityData?: {
    riskScore: number
    riskLevel: string
    critical_flags: string[]
  }
  aiSummary?: any
  lastUpdated: string
  queryCount: number
}

const CACHE_DURATION = 5 * 60 * 1000  // 5 minutes

export async function getCachedTokenData(
  tokenAddress: string
): Promise<CachedTokenData | null> {
  try {
    const cacheDoc = await getDoc(
      doc(db, 'token_cache', tokenAddress)
    )
    
    if (!cacheDoc.exists()) return null
    
    const data = cacheDoc.data() as CachedTokenData
    const age = Date.now() - new Date(data.lastUpdated).getTime()
    
    if (age > CACHE_DURATION) {
      // Cache expired
      return null
    }
    
    return data
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

export async function setCachedTokenData(
  tokenAddress: string,
  data: Partial<CachedTokenData>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'token_cache', tokenAddress),
      {
        ...data,
        address: tokenAddress,
        lastUpdated: new Date().toISOString(),
        queryCount: increment(1)
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Cache write error:', error)
  }
}
```

**Cache Invalidation**:
```typescript
// User can force fresh scan
const handleScan = async (bypassCache = false) => {
  const response = await fetch('/api/analyze-token', {
    method: 'POST',
    body: JSON.stringify({
      tokenAddress,
      chainId,
      bypassCache: bypassCache,  // Force fresh data
      forceFresh: bypassCache
    })
  })
}
```


#### 13.1.2 API Response Caching

**Next.js Route Caching**:
```typescript
// app/api/token/search/route.ts
export const revalidate = 300  // Cache for 5 minutes

export async function GET(req: Request) {
  // Response automatically cached by Next.js
  const data = await fetchTokenList()
  return NextResponse.json(data)
}
```

**Client-Side Caching** (React Query pattern):
```typescript
// Custom hook for data fetching
function useTokenData(tokenAddress: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const cacheRef = useRef<Map<string, any>>(new Map())
  
  useEffect(() => {
    // Check cache first
    if (cacheRef.current.has(tokenAddress)) {
      setData(cacheRef.current.get(tokenAddress))
      setLoading(false)
      return
    }
    
    // Fetch if not cached
    fetchTokenData(tokenAddress).then(result => {
      cacheRef.current.set(tokenAddress, result)
      setData(result)
      setLoading(false)
    })
  }, [tokenAddress])
  
  return { data, loading }
}
```

### 13.2 Code Splitting

**Dynamic Imports**:
```typescript
// Lazy load heavy components
const AdminPanel = dynamic(() => import('@/components/admin-panel'), {
  loading: () => <Loader message="Loading admin panel..." />,
  ssr: false  // Client-side only
})

const Charts = dynamic(() => import('recharts'), {
  loading: () => <div>Loading charts...</div>,
  ssr: false
})
```

**Route-Based Splitting**:
```typescript
// Next.js automatically splits by route
app/
├── page.tsx           → landing.chunk.js
├── dashboard/         → dashboard.chunk.js
├── admin/             → admin.chunk.js
└── profile/           → profile.chunk.js
```

### 13.3 Image Optimization

**Next.js Image Component**:
```typescript
import Image from 'next/image'

// ✅ Optimized
<Image
  src={userProfile.photoURL}
  alt="Profile"
  width={40}
  height={40}
  className="rounded-full"
  priority={false}  // Lazy load
/>

// ❌ Not optimized
<img src={userProfile.photoURL} alt="Profile" />
```

**Base64 Encoding** (for small images):
```typescript
// Profile pictures stored as base64
const base64Image = await convertToBase64(file)
await updateProfile({ photoURL: base64Image })
```

### 13.4 Database Query Optimization

**Firestore Indexing**:
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "actions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "scans",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "analyzedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Query Pagination**:
```typescript
// Limit results and use cursor-based pagination
const ITEMS_PER_PAGE = 20

async function getAnalysisHistory(
  userId: string,
  lastDoc?: DocumentSnapshot
) {
  let q = query(
    collection(db, `analysis_history/${userId}/scans`),
    orderBy('analyzedAt', 'desc'),
    limit(ITEMS_PER_PAGE)
  )
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc))
  }
  
  const snapshot = await getDocs(q)
  
  return {
    docs: snapshot.docs.map(doc => doc.data()),
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  }
}
```

**Batch Operations**:
```typescript
// Use batch writes for multiple updates
const batch = writeBatch(db)

tokens.forEach(token => {
  const ref = doc(db, `watchlist/${userId}/tokens/${token.address}`)
  batch.set(ref, token)
})

await batch.commit()  // Single network call
```

### 13.5 API Request Optimization

**Parallel Fetching**:
```typescript
// lib/data/chain-adaptive-fetcher.ts
const [mobulaData, moralisData, goplusData, heliusData] = 
  await Promise.allSettled([
    fetchMobulaData(tokenAddress),
    fetchMoralisData(tokenAddress, chainId),
    fetchGoPlusData(tokenAddress, chainId),
    fetchHeliusData(tokenAddress)
  ])

// Process results
const marketData = mobulaData.status === 'fulfilled' 
  ? mobulaData.value 
  : null
```

**Request Deduplication**:
```typescript
// Prevent duplicate requests for same token
const pendingRequests = new Map<string, Promise<any>>()

async function fetchTokenData(tokenAddress: string) {
  const key = tokenAddress.toLowerCase()
  
  if (pendingRequests.has(key)) {
    // Return existing promise
    return pendingRequests.get(key)
  }
  
  const promise = actualFetchFunction(tokenAddress)
  pendingRequests.set(key, promise)
  
  try {
    const result = await promise
    return result
  } finally {
    pendingRequests.delete(key)
  }
}
```


### 13.6 Bundle Size Optimization

**Analysis**:
```bash
# Analyze bundle size
pnpm build
pnpm analyze  # If configured

# Check output
.next/
├── static/chunks/
│   ├── main-[hash].js        # ~200KB
│   ├── framework-[hash].js   # ~150KB
│   └── pages/
│       ├── index-[hash].js   # ~50KB
│       └── dashboard-[hash].js  # ~100KB
```

**Tree Shaking**:
```typescript
// ✅ Import only what you need
import { useState, useEffect } from 'react'
import { Shield, TrendingUp } from 'lucide-react'

// ❌ Import entire library
import * as React from 'react'
import * as Icons from 'lucide-react'
```

**Dependency Optimization**:
```json
// package.json - Use specific versions
{
  "dependencies": {
    "next": "16.0.0",           // Exact version
    "react": "19.2.0",
    "date-fns": "4.1.0"         // Lighter than moment.js
  }
}
```

---

## 14. Deployment Architecture

### 14.1 Hosting Platform

**Recommended**: Vercel or Netlify

**Why Vercel**:
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Edge network (CDN)
- Serverless functions
- Preview deployments

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_VERSION": "20.x"
  },
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### 14.2 Environment Configuration

**Development** (`.env.local`):
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=dev-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev.firebaseapp.com
# ... other dev keys

# APIs
MOBULA_API_KEY=dev-key
GROQ_API_KEY=dev-key
```

**Production** (Vercel Environment Variables):
```bash
# Set via Vercel dashboard or CLI
vercel env add MOBULA_API_KEY production
vercel env add GROQ_API_KEY production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
```

**Environment Detection**:
```typescript
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

if (isDevelopment) {
  console.log('[DEV] Detailed logging enabled')
}
```

### 14.3 CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run linter
        run: pnpm lint
      
      - name: Type check
        run: pnpm tsc --noEmit
      
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          MOBULA_API_KEY: ${{ secrets.MOBULA_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Pre-deployment Checks**:
```bash
# Run before deploying
pnpm lint          # Check code style
pnpm tsc --noEmit  # Type check
pnpm build         # Test build
```


### 14.4 Monitoring & Logging

#### 14.4.1 Error Tracking

**Sentry Integration** (optional):
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  }
})
```

**Custom Error Logging**:
```typescript
// lib/logger.ts
export function logError(
  error: Error,
  context?: Record<string, any>
) {
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context })
  }
}

// Usage
try {
  await riskyOperation()
} catch (error) {
  logError(error, {
    operation: 'token-analysis',
    tokenAddress,
    userId
  })
}
```

#### 14.4.2 Performance Monitoring

**Web Vitals**:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Custom Metrics**:
```typescript
// lib/metrics.ts
export function trackPerformance(
  metricName: string,
  duration: number,
  metadata?: Record<string, any>
) {
  console.log('[PERF]', {
    metric: metricName,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString()
  })
  
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: duration,
      event_category: 'Performance'
    })
  }
}

// Usage
const start = Date.now()
await analyzeToken(tokenAddress)
trackPerformance('token-analysis', Date.now() - start, {
  tokenAddress,
  chainId
})
```

### 14.5 Backup & Disaster Recovery

#### 14.5.1 Firestore Backups

**Automated Backups** (Firebase Console):
```bash
# Enable automatic daily backups
gcloud firestore backups schedules create \
  --database='(default)' \
  --recurrence=daily \
  --retention=7d
```

**Manual Backup**:
```bash
# Export Firestore data
gcloud firestore export gs://tokenomics-lab-backups/$(date +%Y%m%d)
```

**Restore Process**:
```bash
# Import from backup
gcloud firestore import gs://tokenomics-lab-backups/20250124
```

#### 14.5.2 Code Backups

**Git Strategy**:
```bash
# Main branch: production
# Develop branch: staging
# Feature branches: development

git checkout -b feature/new-feature
# Make changes
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR to develop
# After testing, merge to main
```

**Version Tags**:
```bash
# Tag releases
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 14.6 Scaling Strategy

#### 14.6.1 Horizontal Scaling

**Serverless Functions**:
- Vercel automatically scales API routes
- Each request handled by separate instance
- No server management needed

**Database Scaling**:
- Firestore automatically scales
- No manual sharding required
- Handles millions of operations/second

#### 14.6.2 Vertical Scaling

**Function Memory**:
```json
// vercel.json
{
  "functions": {
    "app/api/analyze-token/route.ts": {
      "memory": 1024,      // 1GB for heavy calculations
      "maxDuration": 30    // 30 seconds timeout
    },
    "app/api/token/search/route.ts": {
      "memory": 512,       // 512MB for simple queries
      "maxDuration": 10
    }
  }
}
```

#### 14.6.3 CDN & Edge Caching

**Static Assets**:
```
Static files automatically cached at edge:
- Images: /public/*
- CSS: /_next/static/css/*
- JS: /_next/static/chunks/*
```

**API Caching**:
```typescript
// Cache at edge for 5 minutes
export const revalidate = 300

export async function GET() {
  const data = await fetchData()
  return NextResponse.json(data)
}
```


---

## 15. Detailed Flow Diagrams

### 15.1 Complete Token Analysis Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INITIATES SCAN                           │
│  Dashboard → Enter Token Address → Select Chain → Click Scan    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENT-SIDE VALIDATION                         │
│  • Validate address format (EVM: 0x..., Solana: base58)        │
│  • Check if user is authenticated                               │
│  • Display loading state                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/analyze-token                             │
│  Body: {                                                         │
│    tokenAddress: "0x...",                                       │
│    chainId: "1",                                                │
│    plan: "PREMIUM",                                             │
│    userId: "abc123",                                            │
│    bypassCache: false,                                          │
│    metadata: { tokenSymbol, tokenName, chain }                  │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RATE LIMIT CHECK                              │
│  IF plan === 'FREE':                                            │
│    • Check Firestore: users/{userId}.tokensAnalyzed            │
│    • If >= 20 today: Return 429 error                          │
│    • Else: Continue                                             │
│  IF plan === 'PREMIUM': Skip check                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CACHE CHECK                                   │
│  IF bypassCache === false:                                      │
│    • Query token_cache/{tokenAddress}                           │
│    • Check if age < 5 minutes                                   │
│    • If valid: Return cached data                              │
│  ELSE: Skip cache                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│            CHAIN-ADAPTIVE DATA FETCHING                          │
│  (lib/data/chain-adaptive-fetcher.ts)                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Detect Chain Type:                                          │
│     • chainId === '501' → Solana                               │
│     • chainId === '1815' → Cardano                             │
│     • Other → EVM                                               │
│                                                                 │
│  2. Parallel API Calls (Promise.allSettled):                   │
│     ┌──────────────────────────────────────────────┐          │
│     │ Mobula API                                    │          │
│     │ • Market cap, FDV, liquidity                 │          │
│     │ • Price, volume, price changes               │          │
│     │ • Supply data, holder count                  │          │
│     │ • Token age                                   │          │
│     └──────────────────────────────────────────────┘          │
│                                                                 │
│     ┌──────────────────────────────────────────────┐          │
│     │ Moralis API (EVM only)                       │          │
│     │ • Verified holder count                      │          │
│     │ • Transaction patterns (24h)                 │          │
│     │ • Average holder wallet age                  │          │
│     │ • Supply details                             │          │
│     └──────────────────────────────────────────────┘          │
│                                                                 │
│     ┌──────────────────────────────────────────────┐          │
│     │ GoPlus API (EVM only)                        │          │
│     │ • Honeypot detection                         │          │
│     │ • Mintable status                            │          │
│     │ • Owner renounced                            │          │
│     │ • Buy/sell tax                               │          │
│     │ • LP holders                                 │          │
│     └──────────────────────────────────────────────┘          │
│                                                                 │
│     ┌──────────────────────────────────────────────┐          │
│     │ Helius API (Solana only)                     │          │
│     │ • Token authorities (mint, freeze)           │          │
│     │ • Accurate holder count                      │          │
│     │ • Transaction count                          │          │
│     │ • Metadata                                   │          │
│     └──────────────────────────────────────────────┘          │
│                                                                 │
│  3. Merge & Validate Data:                                     │
│     • Combine all successful responses                         │
│     • Calculate data quality score (0-100)                     │
│     • Identify critical flags                                  │
│     • Return CompleteTokenData                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  RISK CALCULATION ENGINE                         │
│  (lib/risk-calculator.ts)                                       │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1: Stablecoin Override                                   │
│    • Check if USDT, USDC, DAI, etc.                           │
│    • If yes: Return risk score 10 (LOW)                       │
│                                                                 │
│  STEP 2: Meme Token Detection (AI)                            │
│    • Call Groq AI with token name/symbol                      │
│    • Get classification + confidence                           │
│    • If meme: Add +15 baseline risk                           │
│                                                                 │
│  STEP 3: Calculate 10 Risk Factors                            │
│    ┌────────────────────────────────────────┐                │
│    │ 1. Supply Dilution (18% weight)        │                │
│    │    circulating / total supply           │                │
│    ├────────────────────────────────────────┤                │
│    │ 2. Holder Concentration (16%)          │                │
│    │    top 10 holders percentage            │                │
│    ├────────────────────────────────────────┤                │
│    │ 3. Liquidity Depth (14%)               │                │
│    │    liquidity / market cap ratio         │                │
│    ├────────────────────────────────────────┤                │
│    │ 4. Vesting Unlock (13%)                │                │
│    │    upcoming token unlocks               │                │
│    ├────────────────────────────────────────┤                │
│    │ 5. Contract Control (12%)              │                │
│    │    mintable, owner, honeypot            │                │
│    ├────────────────────────────────────────┤                │
│    │ 6. Tax/Fee (10%)                       │                │
│    │    buy + sell tax percentage            │                │
│    ├────────────────────────────────────────┤                │
│    │ 7. Distribution (9%)                   │                │
│    │    token distribution fairness          │                │
│    ├────────────────────────────────────────┤                │
│    │ 8. Burn/Deflation (8%)                 │                │
│    │    burned supply percentage             │                │
│    ├────────────────────────────────────────┤                │
│    │ 9. Adoption (7%)                       │                │
│    │    24h transaction count                │                │
│    ├────────────────────────────────────────┤                │
│    │ 10. Audit Transparency (3%)            │                │
│    │     open source, verified               │                │
│    └────────────────────────────────────────┘                │
│                                                                 │
│  STEP 4: Apply Chain-Adaptive Weights                         │
│    • Get weight profile for chain                             │
│    • Adjust factor importance                                 │
│                                                                 │
│  STEP 5: Calculate Base Score                                 │
│    baseScore = Σ(factor × weight)                             │
│                                                                 │
│  STEP 6: Apply Overrides                                      │
│    • Official Token: -45 points                               │
│    • Dead Token: Force to 90+                                 │
│    • Meme Token: +15 points                                   │
│                                                                 │
│  STEP 7: Classify Risk Level                                  │
│    • 0-34: LOW                                                │
│    • 35-49: MEDIUM                                            │
│    • 50-74: HIGH                                              │
│    • 75-100: CRITICAL                                         │
│                                                                 │
│  STEP 8: Generate AI Summary (Premium only)                   │
│    • Call Groq AI with all data                              │
│    • Generate overview, insights, analysis                    │
│    • Create calculation breakdown                             │
│    • Add recommendation                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  SAVE TO FIRESTORE                              │
│  • Increment user.tokensAnalyzed                               │
│  • Save to analysis_history/{userId}/scans/{scanId}           │
│  • Log activity to activity_logs                               │
│  • Cache result to token_cache/{tokenAddress}                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  RETURN RESPONSE                                 │
│  {                                                              │
│    overall_risk_score: 44,                                     │
│    risk_level: "MEDIUM",                                       │
│    confidence_score: 96,                                       │
│    breakdown: { ... },                                         │
│    critical_flags: [...],                                      │
│    warning_flags: [...],                                       │
│    positive_signals: [...],                                    │
│    ai_insights: { ... },                                       │
│    ai_summary: { ... },                                        │
│    raw_data: { ... }                                           │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CLIENT RENDERS RESULTS                          │
│  • Display risk score with color coding                        │
│  • Show AI Analysis Accordion                                  │
│  • Render risk overview charts                                 │
│  • Display market metrics                                      │
│  • Show holder distribution                                    │
│  • Display calculation breakdown                               │
│  • Show chain-specific info                                    │
└─────────────────────────────────────────────────────────────────┘
```


### 15.2 Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS SITE                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              AUTH CONTEXT INITIALIZATION                         │
│  (contexts/auth-context.tsx)                                    │
├─────────────────────────────────────────────────────────────────┤
│  useEffect(() => {                                              │
│    const unsubscribe = onAuthStateChanged(auth, async (user) => {│
│      if (user) {                                                │
│        // User logged in                                        │
│        const profile = await getUserProfile(user.uid)          │
│        setUser(user)                                            │
│        setUserProfile(profile)                                  │
│      } else {                                                   │
│        // User logged out                                       │
│        setUser(null)                                            │
│        setUserProfile(null)                                     │
│      }                                                          │
│      setLoading(false)                                          │
│    })                                                           │
│    return unsubscribe                                           │
│  }, [])                                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
              NOT LOGGED IN    LOGGED IN
                    │               │
                    ↓               ↓
        ┌───────────────────┐  ┌───────────────────┐
        │  Show Landing     │  │  Fetch Profile    │
        │  Page with        │  │  from Firestore   │
        │  Login/Signup     │  │                   │
        └───────────────────┘  └───────────────────┘
                                        ↓
                            ┌───────────────────────┐
                            │  Check User Tier      │
                            │  • FREE               │
                            │  • PREMIUM            │
                            │  • ADMIN              │
                            └───────────────────────┘
                                        ↓
                    ┌───────────────────┴───────────────────┐
                    │                   │                   │
                  FREE              PREMIUM              ADMIN
                    │                   │                   │
                    ↓                   ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
        │  Dashboard        │  │  Dashboard        │  │  Admin Panel      │
        │  • 20 scans/day   │  │  • Unlimited      │  │  • All features   │
        │  • Basic analysis │  │  • AI insights    │  │  • User mgmt      │
        │  • No watchlist   │  │  • Watchlist      │  │  • Analytics      │
        │                   │  │  • Alerts         │  │  • Logs           │
        └───────────────────┘  └───────────────────┘  └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW (Email/Password)                   │
├─────────────────────────────────────────────────────────────────┤
│  1. User enters email + password                                │
│  2. Call signInWithEmailAndPassword(auth, email, password)     │
│  3. Firebase validates credentials                              │
│  4. onAuthStateChanged fires                                    │
│  5. Fetch user profile from Firestore                          │
│  6. Check if email verified                                     │
│  7. Redirect to dashboard                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW (OAuth - Google)                   │
├─────────────────────────────────────────────────────────────────┤
│  1. User clicks "Sign in with Google"                          │
│  2. Call signInWithPopup(auth, googleProvider)                 │
│  3. Google OAuth popup opens                                    │
│  4. User authorizes                                             │
│  5. Firebase receives OAuth token                               │
│  6. Create/update user profile with:                           │
│     • displayName from Google                                   │
│     • photoURL from Google                                      │
│     • email from Google                                         │
│  7. onAuthStateChanged fires                                    │
│  8. Redirect to dashboard                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN 2FA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│  1. Admin logs in with email/password                          │
│  2. Check if user.tier === 'ADMIN'                            │
│  3. Check if user.totpEnabled === true                         │
│  4. If yes:                                                     │
│     a. Show TOTP input prompt                                   │
│     b. User enters 6-digit code from authenticator app         │
│     c. Call verifyTOTP(code, user.totpSecret)                  │
│     d. If valid: Grant access                                   │
│     e. If invalid: Show error, allow retry                     │
│  5. If no 2FA: Direct access to admin panel                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PROTECTED ROUTE CHECK                         │
├─────────────────────────────────────────────────────────────────┤
│  // In page component                                           │
│  const { user, userProfile, loading } = useAuth()              │
│  const router = useRouter()                                     │
│                                                                 │
│  useEffect(() => {                                              │
│    if (!loading && !user) {                                    │
│      router.push('/login')                                      │
│    }                                                            │
│                                                                 │
│    if (!loading && user && userProfile?.tier !== 'ADMIN') {   │
│      router.push('/dashboard')  // Redirect non-admins         │
│    }                                                            │
│  }, [user, userProfile, loading])                              │
│                                                                 │
│  if (loading) return <Loader />                                │
│  if (!user) return null                                        │
│                                                                 │
│  return <ProtectedContent />                                    │
└─────────────────────────────────────────────────────────────────┘
```


### 15.3 Watchlist Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              USER ADDS TOKEN TO WATCHLIST                        │
│  (Premium/Admin only)                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CLIENT-SIDE VALIDATION                          │
│  • Check if user is Premium/Admin                              │
│  • Check if token already in watchlist                         │
│  • Validate token data                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/pro/watchlist                             │
│  Body: {                                                         │
│    action: "add",                                               │
│    userId: "abc123",                                            │
│    token: {                                                     │
│      address: "0x...",                                          │
│      symbol: "TOKEN",                                           │
│      name: "Token Name",                                        │
│      chain: "Ethereum",                                         │
│      chainId: "1",                                              │
│      lastRiskScore: 45,                                         │
│      alertEnabled: true,                                        │
│      alertThreshold: 70                                         │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER-SIDE VALIDATION                          │
│  • Verify user authentication                                   │
│  • Check user tier (Premium/Admin)                             │
│  • Validate token data structure                               │
│  • Check watchlist limit (5 for Free, unlimited for Premium)   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  SAVE TO FIRESTORE                              │
│  Collection: watchlist/{userId}/tokens/{tokenAddress}          │
│  Document: {                                                    │
│    address: "0x...",                                            │
│    symbol: "TOKEN",                                             │
│    name: "Token Name",                                          │
│    chain: "Ethereum",                                           │
│    chainId: "1",                                                │
│    addedAt: Timestamp.now(),                                    │
│    lastRiskScore: 45,                                           │
│    lastChecked: Timestamp.now(),                                │
│    alertEnabled: true,                                          │
│    alertThreshold: 70                                           │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LOG ACTIVITY                                    │
│  await logActivity(userId, 'WATCHLIST_ADD', {                  │
│    tokenAddress,                                                │
│    tokenSymbol,                                                 │
│    chainId                                                      │
│  })                                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  RETURN SUCCESS                                  │
│  { success: true, message: "Token added to watchlist" }        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  UPDATE UI                                       │
│  • Add token to watchlist display                              │
│  • Show success toast notification                             │
│  • Update button state (Add → Remove)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              BACKGROUND: WATCHLIST MONITORING                    │
│  (Runs periodically via Cloud Functions or Cron)               │
├─────────────────────────────────────────────────────────────────┤
│  FOR EACH user WITH watchlist:                                 │
│    FOR EACH token IN user.watchlist:                           │
│      1. Fetch current risk score                               │
│      2. Compare with lastRiskScore                             │
│      3. IF alertEnabled AND change > threshold:                │
│         a. Create alert notification                            │
│         b. Save to alerts/{userId}/notifications/{alertId}     │
│         c. Send email (if enabled)                             │
│         d. Update lastRiskScore                                │
│         e. Update lastChecked timestamp                        │
└─────────────────────────────────────────────────────────────────┘
```

### 15.4 Admin Panel Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              ADMIN ACCESSES ADMIN PANEL                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION CHECK                            │
│  • Verify user is logged in                                     │
│  • Verify user.tier === 'ADMIN'                                │
│  • Check 2FA if enabled                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              LOAD ADMIN DASHBOARD                                │
│  Tabs: Users | Analytics | Settings | Logs                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                   │                   │
    USERS TAB         ANALYTICS TAB        LOGS TAB
        │                   │                   │
        ↓                   ↓                   ↓

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  GET /api/admin/    │  │  GET /api/admin/    │  │  GET /api/admin/    │
│  users              │  │  analytics          │  │  activity-logs      │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│  1. Query Firestore │  │  1. Aggregate data  │  │  1. Query collection│
│     users collection│  │     from users      │  │     Group: actions  │
│  2. Map user data   │  │  2. Calculate:      │  │  2. Order by time   │
│  3. Return array:   │  │     • Total users   │  │  3. Limit 100       │
│     [{              │  │     • By tier       │  │  4. Return logs:    │
│       uid,          │  │     • Scans/day     │  │     [{              │
│       email,        │  │     • Chain usage   │  │       userId,       │
│       tier,         │  │  3. Return metrics  │  │       action,       │
│       tokensAnalyzed│  │                     │  │       timestamp,    │
│     }]              │  │                     │  │       details       │
│                     │  │                     │  │     }]              │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
        │                           │                       │
        ↓                           ↓                       ↓
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  RENDER USER TABLE  │  │  RENDER CHARTS      │  │  RENDER LOG TABLE   │
│  • Email            │  │  • Line chart       │  │  • User             │
│  • Tier badge       │  │  • Bar chart        │  │  • Action           │
│  • Scans count      │  │  • Pie chart        │  │  • Timestamp        │
│  • Actions:         │  │  • Area chart       │  │  • Details          │
│    - Edit tier      │  │                     │  │  • Filters          │
│    - Suspend        │  │                     │  │                     │
│    - Delete         │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ADMIN UPDATES USER TIER                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Admin clicks "Edit" on user                                 │
│  2. Modal opens with tier selector                              │
│  3. Admin selects new tier (FREE → PREMIUM)                    │
│  4. POST /api/admin/users                                       │
│     Body: {                                                     │
│       action: "updateTier",                                     │
│       userId: "abc123",                                         │
│       newTier: "PREMIUM"                                        │
│     }                                                           │
│  5. Server updates Firestore:                                   │
│     await updateDoc(doc(db, 'users', userId), {                │
│       tier: 'PREMIUM',                                          │
│       updatedAt: Timestamp.now()                                │
│     })                                                          │
│  6. Log activity:                                               │
│     await logActivity(userId, 'TIER_UPGRADE', {                │
│       from: 'FREE',                                             │
│       to: 'PREMIUM',                                            │
│       updatedBy: adminId                                        │
│     })                                                          │
│  7. Return success                                              │
│  8. Refresh user list                                           │
│  9. Show success notification                                   │
└─────────────────────────────────────────────────────────────────┘
```


---

## 16. Testing Strategy

### 16.1 Test Scripts

**Location**: `scripts/` directory

**Available Tests**:
```bash
# Test multiple tokens across chains
node scripts/test-multiple-tokens.js

# Test API data sources
node scripts/test-api-data-sources.js

# Test specific token
node test-eth-token.js

# Test Solana transaction count
node test-popcat-tx-count.js

# Test chain detection
node test-chains.js
```

### 16.2 Manual Testing Checklist

**Authentication**:
- [ ] Email/password signup
- [ ] Email/password login
- [ ] Google OAuth login
- [ ] Password reset
- [ ] Email verification
- [ ] Admin 2FA setup
- [ ] Admin 2FA login
- [ ] Logout

**Token Analysis**:
- [ ] Ethereum token scan
- [ ] BSC token scan
- [ ] Solana token scan
- [ ] Polygon token scan
- [ ] Invalid address handling
- [ ] Rate limit (FREE tier)
- [ ] Cache functionality
- [ ] AI insights generation
- [ ] Calculation breakdown display

**Dashboard**:
- [ ] Token search (CMC)
- [ ] Token search (DexScreener)
- [ ] Chain selector
- [ ] Results display
- [ ] Watchlist add (Premium)
- [ ] Watchlist remove (Premium)
- [ ] Alert configuration (Premium)

**Admin Panel**:
- [ ] User list display
- [ ] Tier update
- [ ] User suspension
- [ ] User deletion
- [ ] Analytics charts
- [ ] Activity logs
- [ ] Settings update
- [ ] 2FA management

**Profile**:
- [ ] Profile image upload
- [ ] Personal info update
- [ ] Data export
- [ ] Account deletion

### 16.3 API Testing

**Using cURL**:
```bash
# Test token analysis
curl -X POST http://localhost:3000/api/analyze-token \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    "chainId": "1",
    "plan": "PREMIUM",
    "userId": "test-user"
  }'

# Test token search
curl -X GET "http://localhost:3000/api/token/search?query=PEPE"

# Test user data export
curl -X POST http://localhost:3000/api/user/export-data \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

---

## 17. Troubleshooting Guide

### 17.1 Common Issues

**Issue**: "Rate limit exceeded"
```
Solution:
1. Check user tier in Firestore
2. Verify tokensAnalyzed count
3. Reset counter if needed:
   await updateDoc(doc(db, 'users', userId), {
     tokensAnalyzed: 0,
     lastScanDate: new Date()
   })
```

**Issue**: "Failed to fetch token data"
```
Solution:
1. Check API keys in .env.local
2. Verify API rate limits
3. Check network connectivity
4. Review API response in console
5. Try different data source
```

**Issue**: "AI insights not showing"
```
Solution:
1. Verify GROQ_API_KEY is set
2. Check user tier (Premium required)
3. Review console logs for AI errors
4. Fallback should still work
5. Check ai_summary structure in response
```

**Issue**: "Firestore permission denied"
```
Solution:
1. Check firestore.rules
2. Verify user authentication
3. Check user tier for premium features
4. Review security rules in Firebase Console
```

**Issue**: "Build fails"
```
Solution:
1. Run: pnpm install --frozen-lockfile
2. Check TypeScript errors: pnpm tsc --noEmit
3. Run linter: pnpm lint
4. Clear .next folder: rm -rf .next
5. Rebuild: pnpm build
```

### 17.2 Debug Mode

**Enable Detailed Logging**:
```typescript
// In .env.local
DEBUG=true
LOG_LEVEL=verbose

// In code
if (process.env.DEBUG === 'true') {
  console.log('[DEBUG]', detailedInfo)
}
```

**Browser DevTools**:
```javascript
// Check auth state
console.log('User:', auth.currentUser)
console.log('Profile:', userProfile)

// Check API responses
// Network tab → Filter by "api" → Inspect responses

// Check Firestore queries
// Application tab → IndexedDB → firestore
```

---

## 18. Wallet Portfolio Analysis

### 18.1 Overview

The Phantom Wallet integration now includes **bulk portfolio analysis**, allowing users to analyze all tokens in their Solana wallet simultaneously and get a comprehensive risk overview.

### 18.2 Architecture

#### 18.2.1 Component Structure

```
WalletConnect Component (components/wallet-connect.tsx)
├── Connect Wallet Button
├── Token List View
│   ├── Individual Token Cards
│   └── "Analyze All" Button
├── Portfolio Results View
│   ├── Risk Distribution Dashboard
│   ├── Sorted Token List (by risk)
│   └── Back to List Button
└── Individual Analysis Modal
```

#### 18.2.2 API Endpoints

**New Endpoint**: `/api/wallet/analyze-all`

```typescript
// app/api/wallet/analyze-all/route.ts
export async function POST(request: Request) {
  const { tokens, userId, plan } = await request.json()
  
  // Validate inputs
  if (!tokens || !Array.isArray(tokens)) {
    return NextResponse.json({ error: 'Invalid tokens array' }, { status: 400 })
  }
  
  // Limit to 20 tokens for performance
  const tokensToAnalyze = tokens.slice(0, 20)
  
  // Batch process in groups of 10
  const results = []
  for (let i = 0; i < tokensToAnalyze.length; i += 10) {
    const batch = tokensToAnalyze.slice(i, i + 10)
    
    const batchResults = await Promise.allSettled(
      batch.map(token => analyzeToken(token, userId, plan))
    )
    
    results.push(...batchResults)
    
    // Rate limiting: 1 second delay between batches
    if (i + 10 < tokensToAnalyze.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // Process results
  const analyzed = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
  
  return NextResponse.json({
    success: true,
    analyzed: analyzed.length,
    total: tokensToAnalyze.length,
    results: analyzed
  })
}
```

**Existing Endpoint**: `/api/wallet/tokens`

```typescript
// app/api/wallet/tokens/route.ts
export async function POST(request: Request) {
  const { walletAddress } = await request.json()
  
  // Fetch tokens using Helius DAS API
  const tokens = await fetchWalletTokens(walletAddress)
  
  return NextResponse.json({
    success: true,
    tokens: tokens.map(token => ({
      address: token.mint,
      symbol: token.symbol,
      name: token.name,
      balance: token.balance,
      decimals: token.decimals,
      logoURI: token.logoURI
    }))
  })
}
```

### 18.3 User Flow

#### 18.3.1 Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CONNECTS WALLET                          │
│  Click "Connect Wallet" → Phantom popup → Approve               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FETCH WALLET TOKENS                           │
│  POST /api/wallet/tokens                                        │
│  Body: { walletAddress: "..." }                                 │
│                                                                 │
│  Response: {                                                    │
│    tokens: [                                                    │
│      { address, symbol, name, balance, decimals, logoURI },    │
│      ...                                                        │
│    ]                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DISPLAY TOKEN LIST                            │
│  • Show all tokens with balances                               │
│  • Display token count                                          │
│  • Show "Analyze All" button                                   │
│  • Each token clickable for individual analysis                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
          INDIVIDUAL ANALYSIS   BULK ANALYSIS
                    │               │
                    ↓               ↓

┌─────────────────────────┐  ┌─────────────────────────────────────┐
│  Click Specific Token   │  │  Click "Analyze All" Button         │
├─────────────────────────┤  ├─────────────────────────────────────┤
│  1. Show loading modal  │  │  1. Set analyzing state             │
│  2. Call analyze-token  │  │  2. POST /api/wallet/analyze-all    │
│     API                 │  │     Body: {                         │
│  3. Display full        │  │       tokens: [...],                │
│     analysis:           │  │       userId,                       │
│     • Risk score        │  │       plan                          │
│     • AI insights       │  │     }                               │
│     • Breakdown         │  │  3. Server processes:               │
│     • Factors           │  │     • Batch in groups of 10         │
│     • Recommendations   │  │     • 1s delay between batches      │
│  4. Add to watchlist    │  │     • Handle failures gracefully    │
│     option              │  │  4. Return results                  │
└─────────────────────────┘  └─────────────────────────────────────┘
                                            ↓
                            ┌───────────────────────────────────────┐
                            │  DISPLAY PORTFOLIO DASHBOARD          │
                            ├───────────────────────────────────────┤
                            │  Risk Distribution:                   │
                            │  ┌─────────────────────────────────┐ │
                            │  │ LOW: 3 | MEDIUM: 5 | HIGH: 2 |  │ │
                            │  │ CRITICAL: 1                      │ │
                            │  └─────────────────────────────────┘ │
                            │                                       │
                            │  Token List (sorted by risk):         │
                            │  ┌─────────────────────────────────┐ │
                            │  │ 🔴 SCAM_TOKEN    Risk: 95       │ │
                            │  │ 🟠 RISKY_COIN    Risk: 72       │ │
                            │  │ 🟡 MEME_TOKEN    Risk: 45       │ │
                            │  │ 🟢 SOL           Risk: 15       │ │
                            │  └─────────────────────────────────┘ │
                            │                                       │
                            │  [Back to Token List]                 │
                            └───────────────────────────────────────┘
```

#### 18.3.2 State Management

```typescript
// components/wallet-connect.tsx
const [walletAddress, setWalletAddress] = useState<string | null>(null)
const [tokens, setTokens] = useState<WalletToken[]>([])
const [loadingTokens, setLoadingTokens] = useState(false)
const [analyzing, setAnalyzing] = useState(false)
const [portfolioResults, setPortfolioResults] = useState<AnalysisResult[] | null>(null)
const [showResults, setShowResults] = useState(false)
const [selectedToken, setSelectedToken] = useState<WalletToken | null>(null)

// Connect wallet
const connectWallet = async () => {
  const provider = window.phantom?.solana
  const response = await provider.connect()
  setWalletAddress(response.publicKey.toString())
  await fetchWalletTokens(response.publicKey.toString())
}

// Fetch tokens
const fetchWalletTokens = async (address: string) => {
  setLoadingTokens(true)
  const response = await fetch('/api/wallet/tokens', {
    method: 'POST',
    body: JSON.stringify({ walletAddress: address })
  })
  const data = await response.json()
  setTokens(data.tokens)
  setLoadingTokens(false)
}

// Analyze all tokens
const analyzeAllTokens = async () => {
  setAnalyzing(true)
  const response = await fetch('/api/wallet/analyze-all', {
    method: 'POST',
    body: JSON.stringify({
      tokens: tokens.map(t => ({
        address: t.address,
        symbol: t.symbol,
        name: t.name
      })),
      userId: user?.uid,
      plan: userProfile?.tier || 'FREE'
    })
  })
  const data = await response.json()
  setPortfolioResults(data.results)
  setShowResults(true)
  setAnalyzing(false)
}

// Analyze individual token
const analyzeToken = async (token: WalletToken) => {
  setSelectedToken(token)
  // Show modal with full analysis
}
```

### 18.4 Performance Optimizations

#### 18.4.1 Batch Processing

```typescript
// Process tokens in batches to avoid overwhelming APIs
const BATCH_SIZE = 10
const BATCH_DELAY = 1000 // 1 second

for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
  const batch = tokens.slice(i, i + BATCH_SIZE)
  
  // Parallel processing within batch
  const batchResults = await Promise.allSettled(
    batch.map(token => analyzeToken(token))
  )
  
  results.push(...batchResults)
  
  // Delay between batches
  if (i + BATCH_SIZE < tokens.length) {
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
  }
}
```

#### 18.4.2 Error Resilience

```typescript
// Use Promise.allSettled to continue even if some tokens fail
const results = await Promise.allSettled(
  tokens.map(token => analyzeToken(token))
)

// Process results
const successful = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value)

const failed = results
  .filter(r => r.status === 'rejected')
  .map((r, i) => ({
    token: tokens[i],
    error: r.reason
  }))

console.log(`✅ Analyzed: ${successful.length}/${tokens.length}`)
if (failed.length > 0) {
  console.log(`❌ Failed: ${failed.length}`)
}
```

#### 18.4.3 Caching Strategy

```typescript
// Cache individual token analyses
const tokenCache = new Map<string, AnalysisResult>()

async function analyzeTokenWithCache(token: WalletToken) {
  const cacheKey = `${token.address}_${token.chainId}`
  
  // Check cache first
  if (tokenCache.has(cacheKey)) {
    const cached = tokenCache.get(cacheKey)
    const age = Date.now() - cached.timestamp
    
    // Use cache if less than 5 minutes old
    if (age < 5 * 60 * 1000) {
      return cached.result
    }
  }
  
  // Fetch fresh data
  const result = await analyzeToken(token)
  
  // Update cache
  tokenCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  })
  
  return result
}
```

### 18.5 UI Components

#### 18.5.1 Portfolio Risk Dashboard

```typescript
interface PortfolioRiskDashboardProps {
  results: AnalysisResult[]
}

function PortfolioRiskDashboard({ results }: PortfolioRiskDashboardProps) {
  // Calculate risk distribution
  const distribution = {
    LOW: results.filter(r => r.risk_level === 'LOW').length,
    MEDIUM: results.filter(r => r.risk_level === 'MEDIUM').length,
    HIGH: results.filter(r => r.risk_level === 'HIGH').length,
    CRITICAL: results.filter(r => r.risk_level === 'CRITICAL').length
  }
  
  // Sort by risk score (highest first)
  const sortedResults = [...results].sort((a, b) => 
    b.overall_risk_score - a.overall_risk_score
  )
  
  return (
    <div className="space-y-6">
      {/* Risk Distribution */}
      <div className="grid grid-cols-4 gap-4">
        <RiskCard level="LOW" count={distribution.LOW} color="green" />
        <RiskCard level="MEDIUM" count={distribution.MEDIUM} color="yellow" />
        <RiskCard level="HIGH" count={distribution.HIGH} color="orange" />
        <RiskCard level="CRITICAL" count={distribution.CRITICAL} color="red" />
      </div>
      
      {/* Token List */}
      <div className="space-y-2">
        <h3 className="text-lg font-mono">Tokens (Sorted by Risk)</h3>
        {sortedResults.map(result => (
          <TokenRiskCard key={result.token_address} result={result} />
        ))}
      </div>
    </div>
  )
}
```

#### 18.5.2 Token Risk Card

```typescript
interface TokenRiskCardProps {
  result: AnalysisResult
}

function TokenRiskCard({ result }: TokenRiskCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-400 border-green-500/30'
      case 'MEDIUM': return 'text-yellow-400 border-yellow-500/30'
      case 'HIGH': return 'text-orange-400 border-orange-500/30'
      case 'CRITICAL': return 'text-red-400 border-red-500/30'
      default: return 'text-gray-400 border-gray-500/30'
    }
  }
  
  const getRiskEmoji = (level: string) => {
    switch (level) {
      case 'LOW': return '🟢'
      case 'MEDIUM': return '🟡'
      case 'HIGH': return '🟠'
      case 'CRITICAL': return '🔴'
      default: return '⚪'
    }
  }
  
  return (
    <div className={`
      p-4 rounded-lg border backdrop-blur-lg
      bg-black/40 ${getRiskColor(result.risk_level)}
      hover:bg-black/60 transition-all cursor-pointer
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getRiskEmoji(result.risk_level)}</span>
          <div>
            <div className="font-mono font-bold">{result.token_symbol}</div>
            <div className="text-xs text-gray-400">{result.token_name}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">
            {result.overall_risk_score}
          </div>
          <div className="text-xs uppercase tracking-wider">
            {result.risk_level}
          </div>
        </div>
      </div>
      
      {/* Critical flags */}
      {result.critical_flags && result.critical_flags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-red-400">
            ⚠️ {result.critical_flags[0]}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 18.6 Benefits

#### 18.6.1 For Users

- **Quick Portfolio Overview**: See all token risks at once instead of analyzing one by one
- **Risk Identification**: Instantly spot dangerous tokens in portfolio
- **Time Saving**: Analyze 20 tokens in ~30-60 seconds vs. 10+ minutes individually
- **Better Decision Making**: Portfolio-level risk assessment enables informed actions
- **Visual Risk Distribution**: Understand overall portfolio health at a glance

#### 18.6.2 For Risk Management

- **Portfolio Diversification**: See risk distribution across holdings
- **Red Flag Detection**: Identify scam/rug pull tokens immediately
- **Investment Strategy**: Make data-driven portfolio adjustments
- **Risk Monitoring**: Regular portfolio health checks
- **Prioritization**: Focus on highest-risk tokens first

### 18.7 Technical Specifications

#### 18.7.1 Limits & Constraints

```typescript
const PORTFOLIO_ANALYSIS_LIMITS = {
  MAX_TOKENS: 20,           // Maximum tokens per analysis
  BATCH_SIZE: 10,           // Tokens per batch
  BATCH_DELAY: 1000,        // Milliseconds between batches
  CACHE_DURATION: 300000,   // 5 minutes
  TIMEOUT_PER_TOKEN: 30000  // 30 seconds
}
```

#### 18.7.2 Error Handling

```typescript
// Graceful degradation
try {
  const results = await analyzeAllTokens(tokens)
  setPortfolioResults(results)
} catch (error) {
  console.error('Portfolio analysis failed:', error)
  
  // Show partial results if available
  if (results.length > 0) {
    setPortfolioResults(results)
    showToast('warning', `Analyzed ${results.length}/${tokens.length} tokens`)
  } else {
    showToast('error', 'Failed to analyze portfolio. Please try again.')
  }
}
```

#### 18.7.3 Rate Limiting

```typescript
// Respect API rate limits
const RATE_LIMITS = {
  MOBULA: 100,    // requests per minute
  HELIUS: 50,     // requests per minute
  GROQ: 30        // requests per minute
}

// Implement token bucket algorithm
class RateLimiter {
  private tokens: number
  private lastRefill: number
  
  constructor(private maxTokens: number, private refillRate: number) {
    this.tokens = maxTokens
    this.lastRefill = Date.now()
  }
  
  async acquire(): Promise<void> {
    // Refill tokens based on time elapsed
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const tokensToAdd = (elapsed / 1000) * this.refillRate
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
    
    // Wait if no tokens available
    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate * 1000
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.tokens = 1
    }
    
    this.tokens -= 1
  }
}
```

### 18.8 Future Enhancements

**Planned Improvements**:
- [ ] **Portfolio Value Calculation**: Show USD values for each token
- [ ] **Risk Alerts**: Notify when portfolio risk increases
- [ ] **Historical Tracking**: Track risk changes over time
- [ ] **Export Reports**: Download portfolio analysis as PDF/CSV
- [ ] **Filtering**: Filter by risk level, balance, chain
- [ ] **Sorting Options**: Sort by balance, name, risk, value
- [ ] **Batch Actions**: Add multiple tokens to watchlist at once
- [ ] **Portfolio Comparison**: Compare portfolios over time
- [ ] **Risk Heatmap**: Visual representation of portfolio risk
- [ ] **Automated Monitoring**: Scheduled portfolio scans

---

## 19. Future Enhancements

### 18.1 Planned Features

**Phase 1** (Q1 2026):
- [ ] Real-time price alerts
- [ ] Portfolio tracking
- [ ] Mobile app (React Native)
- [ ] Advanced charting
- [ ] Social sentiment analysis

**Phase 2** (Q2 2026):
- [ ] Multi-language support
- [ ] API for developers
- [ ] Webhook integrations
- [ ] Custom alert rules
- [ ] Team collaboration features

**Phase 3** (Q3 2026):
- [ ] Machine learning predictions
- [ ] Historical backtesting
- [ ] Automated trading signals
- [ ] DeFi protocol analysis
- [ ] NFT collection analysis

### 18.2 Technical Debt

**Priority 1** (High):
- [ ] Add comprehensive unit tests
- [ ] Implement E2E testing (Playwright)
- [ ] Add error boundary components
- [ ] Improve error handling consistency
- [ ] Add request retry logic

**Priority 2** (Medium):
- [ ] Optimize bundle size further
- [ ] Implement service worker for offline
- [ ] Add progressive web app features
- [ ] Improve accessibility (WCAG 2.1 AA)
- [ ] Add internationalization (i18n)

**Priority 3** (Low):
- [ ] Refactor large components
- [ ] Extract common hooks
- [ ] Improve code documentation
- [ ] Add Storybook for components
- [ ] Create design system documentation

---

## 19. Conclusion

This technical documentation provides a comprehensive overview of the Tokenomics Lab platform architecture, covering every major system component from the frontend React components to the backend risk calculation engine, from authentication flows to deployment strategies.

**Key Takeaways**:

1. **Modern Stack**: Next.js 16 + React 19 + TypeScript 5.9 provides type-safe, performant foundation
2. **Multi-Chain Support**: Unified architecture handles Ethereum, BSC, Solana, Polygon, and more
3. **AI-Powered**: Groq AI (Llama 3.3 70B) provides intelligent token classification and risk analysis
4. **Scalable**: Serverless architecture on Vercel with Firebase scales automatically
5. **Secure**: Firebase Auth + 2FA + Firestore rules + rate limiting protect user data
6. **Performant**: Caching, code splitting, parallel fetching optimize user experience

**For Developers**:
- Follow the architecture patterns established
- Maintain type safety with TypeScript
- Write tests for new features
- Document complex logic
- Keep security in mind

**For Maintainers**:
- Monitor error logs regularly
- Keep dependencies updated
- Review security rules periodically
- Backup Firestore data
- Monitor API usage and costs

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Maintained By**: Development Team  
**Contact**: dev@tokenomicslab.com

