# Technical Implementation Summary - Tokenomics Lab
## Bachelor's Thesis Documentation

---

## 1. CORE RISK SCORING ALGORITHM (`lib/risk-calculator.ts`)

### Purpose
Main risk calculation engine that analyzes cryptocurrency tokens across 10 risk factors using a weighted scoring system (0-100 scale). Integrates AI classification, social metrics, and multi-chain data.

### Key Functions

#### `calculateRisk(data: TokenData, metadata, plan: 'FREE' | 'PREMIUM'): Promise<RiskResult>`
**Main entry point** - Orchestrates complete risk analysis pipeline.

**Process Flow:**
1. **AI Meme Detection** (Groq Llama 3.3 70B)
   - Classifies token as MEME or UTILITY
   - Applies whitelist check (BTC, ETH, USDT, etc.)
   - Pattern matching for obvious memes (doge/shib/moon/inu)
   - Returns confidence (0-100) and reasoning

2. **Twitter Social Metrics** (Optional)
   - Fetches follower count, engagement rate, tweet frequency
   - Calculates adoption risk score
   - Only if both symbol and Twitter handle provided

3. **10-Factor Risk Calculation**
   - Each factor scored 0-100 (higher = more risky)
   - Weighted aggregation based on token type and chain

4. **Weighted Scoring**
   - Uses chain-adaptive weights from `lib/risk-factors/weights.ts`
   - Different profiles for: Standard, Meme, Solana, Cardano
   - 9 factors (vesting removed): Supply Dilution (18%), Holder Concentration (20%), Liquidity Depth (16%), Contract Control (15%), Tax/Fee (11%), Distribution (8%), Burn/Deflation (6%), Adoption (10%), Audit (4%)

5. **Override Systems**
   - **Meme Baseline**: +15 points for meme tokens (volatility adjustment)
   - **Official Token**: -45 points for verified tokens >$50M market cap (via CoinGecko)
   - **Dead Token**: Forces score to 90+ if abandoned (zero liquidity, no transactions)
   - **Top 1 Holder ≥40%**: Forces score to 94 (critical concentration risk)
   - **2025 Pump.fun Rug**: Detects bundled wallets on Solana, forces critical zone

6. **AI Summary Generation** (Premium only)
   - Groq AI generates comprehensive risk analysis
   - Includes: Overview, Key Insights, Risk Analysis, Recommendation, Technical Details, Calculation Breakdown

### Individual Risk Factor Algorithms

#### Factor 1: Supply Dilution (18% weight)
- **Primary Metric**: FDV/Market Cap ratio
- **Scoring**:
  - ≤1x: 10 points
  - ≤2x: 30 points
  - ≤5x: 50 points
  - ≤10x: 70 points
  - >10x: 90 points
- **Penalties**: +20 if mintable, +15 if unlimited supply with no burns
- **Validation**: Returns 100 if FDV or MCAP ≤ 0 (invalid data)

#### Factor 2: Holder Concentration (20% weight)
- **Metrics**:
  - Top 10 holders percentage
  - Top 50 holders percentage (NEW - wash trading detection)
  - Top 100 holders percentage (NEW - bundle detection)
  - Total holder count
  - Unique buyers 24h (NEW - wash trading)
- **Scoring Examples**:
  - Top 10 > 80%: +50 points
  - Top 50 > 95%: +45 points
  - Unique buyers < 10: +50 points (likely wash trading)
  - < 50 holders: +35 points

#### Factor 3: Liquidity Depth (16% weight)
- **Zero-Liquidity Guard**: Returns 100 if liquidity < $10K
- **Absolute Liquidity**:
  - < $25K: +42 points
  - < $100K: +25 points
  - > $1M: 0 penalty
- **MC/Liquidity Ratio**:
  - > 500x: +38 points
  - > 100x: +22 points
- **Liquidity Drops** (NEW - rug detection):
  - 80%+ drop in 1h: +60 points
  - 90%+ drop in 24h: +50 points
- **LP Lock Check**: +30 if not locked/burned

#### Factor 4: Vesting & Unlock (13% weight)
- Next 30-day unlock > 25%: +30 points
- Team vesting < 12 months: +25 points
- No vesting with >10% team allocation: +40 points

#### Factor 5: Contract Control (15% weight)
- **EVM Chains**:
  - Honeypot detected: +60 points
  - Mintable: +50 points
  - LP not locked: +40 points
  - Owner not renounced: +20 points
- **Solana Chain** (40% weight):
  - Freeze authority exists: +100 points (CRITICAL)
  - Unknown freeze authority: +35 points (conservative default)
  - LP not locked: +40 points
- **Fallback**: +20 base uncertainty penalty if no GoPlus data

#### Factor 6: Tax & Fee (11% weight)
- Sell tax > 30%: +60 points
- Sell tax > 10%: +20 points
- Buy tax > 15%: +20 points
- Tax modifiable: +30 points
- **Fallback**: 50 (neutral) if no GoPlus data

#### Factor 7: Distribution (8% weight)
- Team allocation > 40%: +35 points
- Top 10 holders ≥ 80%: +55 points
- Top 10 holders ≥ 50%: +25 points
- **Validation**: Returns 65 if no real data (default 0.5 estimate)

#### Factor 8: Burn & Deflation (6% weight)
- > 50% burned: 10 points (very safe)
- > 20% burned: 30 points
- No burns + uncapped supply: 80 points
- **Special Case**: Young memes (<60 days) with <1% burned: 10 points penalty

#### Factor 9: Adoption & Usage (10% weight)
- **Transaction Volume**:
  - 0 transactions: +45 points (reduced 30% for new tokens)
  - < 100 transactions: +14 points
- **Volume/MC Ratio**:
  - < 0.0001: +32 points (dead token)
  - > 5: +25 points (excessive volatility)
- **Age Factor**:
  - < 1 day: +8 points (reduced from 22)
  - < 7 days: +4 points

#### Factor 10: Audit & Transparency (4% weight)
- Not open source: +50 points
- LP not locked: +30 points
- **Fallback**: 60 + MC/Liquidity penalty if no GoPlus data

### Override Systems (Applied After Base Calculation)

#### 1. Official Token Resolver (`lib/services/official-token-resolver.ts`)
- Checks CoinGecko API for tokens >$50M market cap
- **Bonus**:
  - Standard tokens: -45 points
  - Meme tokens: -25 points (reduced bonus due to inherent volatility)
  - >$1B market cap: Additional -10 points (standard) or -5 (meme)
- **Cache**: 1-hour TTL to avoid repeated API calls

#### 2. Dead Token Detector (`lib/risk-factors/dead-token.ts`)
- Forces score to 90-100 if token is abandoned
- **Criteria**:
  - Liquidity < $500: Score 100
  - 24h volume < $100: Score 95
  - Down 98%+ from ATH: Score 92
  - Zero transactions in 24h: Score 90
- **Skipped** for official tokens (they have verified data)

#### 3. 2025 Pump.fun Rug Killer
- **Target**: Meme tokens on Solana, <60 days old
- **Patterns**:
  - High MC + low liquidity: +40 points
  - High MC + few holders: +30 points
  - Suspicious naming (69/420/pump/moon): +20 points
  - High volume + few holders: +20 points
  - No token burns: +20 points
- **Force Critical**: If penalty pushes score ≥70, force to 92+

#### 4. Critical Flags Override
- 3+ critical flags: Minimum score 75
- 1-2 critical flags: +15 points

### Algorithm Details

#### Weighted Score Calculation
```
score = Σ (factor_score × factor_weight)

Standard Weights:
  supply_dilution: 18%
  holder_concentration: 20%
  liquidity_depth: 16%
  contract_control: 15%
  tax_fee: 11%
  distribution: 8%
  burn_deflation: 6%
  adoption: 10%
  audit: 4%

Meme Weights (adjusted for volatility):
  holder_concentration: 24% (↑)
  liquidity_depth: 20% (↑)
  adoption: 15% (↑)
  supply_dilution: 14% (↓)
  burn_deflation: 2% (↓)

Solana Weights (chain-specific risks):
  contract_control: 35% (↑ due to freeze authority)
  tax_fee: 0% (N/A on Solana)
```

#### Risk Level Classification
- 0-19: LOW
- 20-34: LOW
- 35-49: MEDIUM
- 50-74: HIGH
- 75-100: CRITICAL

#### Confidence Score
- Premium + GoPlus: 96%
- Premium without GoPlus: 78%
- Free + GoPlus: 85%
- Free without GoPlus: 70%

### Dependencies

**External APIs:**
- **Mobula API**: Market data (price, volume, liquidity, holders, supply)
- **Moralis API**: Transaction counts, holder analytics (EVM chains)
- **GoPlus Security API**: Contract analysis, honeypot detection, tax checks
- **Helius API**: Solana-specific data (freeze authority, mint authority)
- **Groq AI API**: Llama 3.3 70B for meme detection and comprehensive analysis
- **Twitter API**: Social metrics (followers, engagement, tweet frequency)
- **CoinGecko API**: Official token verification

**Internal Services:**
- `detectMemeToken()`: AI-powered token classification
- `isOfficialToken()`: CoinGecko verification
- `checkDeadToken()`: Abandonment detection
- `getTwitterAdoptionData()`: Social metrics fetching
- `generateComprehensiveAISummary()`: AI-powered risk analysis

### Error Handling
- **AI Detection Failure**: Falls back to pattern-based classification
- **Twitter API Unavailable**: Uses fallback adoption score
- **GoPlus Unavailable**: Uses Mobula data with uncertainty penalties
- **Missing Data**: Returns moderate risk (50-65) with uncertainty flags
- **API Timeout**: Continues with available data, marks confidence accordingly

---

## 2. TYPE DEFINITIONS (`lib/types/token-data.ts`)

### TokenData Interface
```typescript
interface TokenData {
  // Mobula Data (Always Available)
  marketCap: number
  fdv: number
  liquidityUSD: number
  totalSupply: number
  circulatingSupply: number
  maxSupply: number | null
  holderCount: number
  top10HoldersPct: number  // 0-1 decimal
  top50HoldersPct?: number  // NEW: Wash trading detection
  top100HoldersPct?: number // NEW: Bundle detection
  volume24h: number
  ageDays: number
  burnedSupply: number
  txCount24h: number
  uniqueBuyers24h?: number  // NEW: Wash trading detection
  
  // Vesting Data
  nextUnlock30dPct?: number
  teamVestingMonths?: number
  teamAllocationPct?: number
  
  // GoPlus Security Data
  is_honeypot?: boolean
  is_mintable?: boolean
  owner_renounced?: boolean
  buy_tax?: number
  sell_tax?: number
  tax_modifiable?: boolean
  is_open_source?: boolean
  lp_locked?: boolean
  lp_in_owner_wallet?: boolean  // NEW: Rug risk indicator
  
  // Solana-Specific
  freeze_authority_exists?: boolean  // CRITICAL flag
  mint_authority_exists?: boolean
  
  // Chain Identifier
  chain?: string  // "EVM", "SOLANA", "CARDANO"
  
  // Liquidity Tracking (NEW)
  liquidity1hAgo?: number
  liquidity24hAgo?: number
}
```

### RiskResult Interface
```typescript
interface RiskResult {
  overall_risk_score: number  // 0-100
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  confidence_score: number  // 70-96
  breakdown: Partial<RiskBreakdown>
  data_sources: string[]
  goplus_status?: "active" | "fallback"
  plan?: "FREE" | "PREMIUM"
  
  // Premium Features
  critical_flags?: string[]
  upcoming_risks?: {
    next_30_days: number
    forecast: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
  }
  detailed_insights?: string[]
  
  // AI Features (Premium)
  ai_insights?: {
    classification: 'MEME_TOKEN' | 'UTILITY_TOKEN'
    confidence: number
    reasoning: string
    meme_baseline_applied: boolean
    is_manual_override?: boolean
  }
  
  twitter_metrics?: {
    followers: number
    engagement_rate: number
    tweets_7d: number
    adoption_score: number
    handle: string
  }
  
  ai_summary?: {
    overview: string
    keyInsights: string[]
    riskAnalysis: string
    recommendation: string
    technicalDetails: string
    calculationBreakdown?: string
  }
  
  positive_signals?: string[]  // Solana-specific good indicators
  upgrade_message?: string  // Free users only
}
```

### RiskBreakdown Interface
```typescript
interface RiskBreakdown {
  supplyDilution: number
  holderConcentration: number
  liquidityDepth: number
  vestingUnlock: number
  contractControl: number
  taxFee: number
  distribution: number
  burnDeflation: number
  adoption: number
  auditTransparency: number
}
```

---

## 3. USER INTERFACE

### Main Landing Page (`app/page.tsx`)

**Purpose**: Marketing page with feature showcase and pricing.

**Key Sections:**
1. **Hero Section**
   - Animated grid background with particles
   - Call-to-action buttons (Start Analyzing, Create Account)
   - Stats display: 10 risk factors, 6 blockchains, 5 API sources

2. **Meme Coin Detection Feature**
   - AI classification showcase
   - Explains +15 risk penalty for meme tokens
   - Manual override option display

3. **Technology Stack Display**
   - Cards for each API: GoPlus, Mobula, Moralis, Helius, CoinMarketCap, Groq AI
   - Purpose and role of each service

4. **Features Grid**
   - AI Meme Classifier (Groq Llama 3.3 70B)
   - Multi-chain search
   - Scam detection (93%+ confidence)
   - Risk scoring (10 factors)
   - Watchlist functionality
   - Live charts (6 types)
   - Smart alerts

5. **How It Works**
   - 3-step process: Search → Analyze → Monitor
   - Visual flow with numbered cards

6. **Pricing Section**
   - Free tier: 20 scans/day, basic risk score, multi-chain
   - Premium tier: $29/month, unlimited scans, AI insights, unlimited watchlist, 6 charts, priority support

**Stack**: Next.js 14, React, TypeScript, Tailwind CSS, Lucide icons

---

### Token Scanning Interface (`app/scan/page.tsx`)

**Purpose**: Real-time token analysis interface for logged-in users.

**Key Features:**

1. **Search Bar**
   - Input: Token address (0x...) or symbol (BTC/ETH/SOL)
   - Example suggestions with click-to-fill
   - Enter key support for quick scanning

2. **Results Display**
   - **Token Info Card**:
     - Token name, symbol, chain badge
     - Current price with 24h change (color-coded)
     - Market cap, volume, liquidity stats grid
   
   - **Risk Assessment Card** (if available):
     - Large risk score (0-100) with color coding
     - Risk level label (LOW/MEDIUM/HIGH/CRITICAL)
     - Critical flags section (red alerts)
     - Risk insights section (detailed warnings)
   
   - **Security Checks Card** (GoPlus data):
     - Grid of boolean security checks
     - Green checkmark (safe) or red X (risky)
     - Examples: is_honeypot, is_mintable, owner_renounced, lp_locked

3. **Error Handling**
   - Clear error messages in red border box
   - Fallback messages for API failures
   - Loading states with spinner

4. **Navigation**
   - Back to dashboard button
   - Sticky navbar with logo

**Data Flow:**
```
User Input → TokenScanService.scanToken()
          → /api/analyze-token (if EVM address)
          → Display CompleteTokenData + RiskResult
```

**Stack**: Next.js 14, React, TypeScript, Tailwind CSS, Firebase Auth integration

---

## 4. SOLANA DATA FETCHING (`lib/api/helius.ts`)

### Purpose
Helius API integration for Solana-specific token data using DAS API and Enhanced Transactions.

### Key Functions

#### `getHeliusSolanaData(tokenAddress: string): Promise<SolanaSecurityData | null>`
**Fetches Solana token authorities for security analysis.**

**Process:**
1. POST request to `/token-metadata` endpoint
2. Extracts freeze authority, mint authority, update authority
3. Returns supply, decimals, holder count

**Data Structure:**
```typescript
interface SolanaSecurityData {
  freezeAuthority: string | null  // CRITICAL: Can freeze wallets
  mintAuthority: string | null    // Can mint new tokens
  programAuthority: string | null // Can update token metadata
  supply?: number
  decimals?: number
  holderCount?: number
}
```

**Usage in Risk Calculator:**
- `freeze_authority_exists: true` → +100 risk penalty (CRITICAL)
- `freeze_authority_exists: false` → Positive signal
- Used in Factor 5 (Contract Control) for Solana chains

#### `getHeliusEnhancedData(tokenAddress: string): Promise<SolanaEnhancedData | null>`
**Comprehensive Solana token data using DAS API.**

**Fetches:**
- Token metadata (name, symbol, decimals, supply)
- Authorities (freeze, mint, update)
- Holder data with concentration metrics
- Transaction patterns (24h count, volume, unique traders)

**Data Structure:**
```typescript
interface SolanaEnhancedData {
  metadata: {
    name: string
    symbol: string
    decimals: number
    supply: number
  }
  authorities: {
    freezeAuthority: string | null
    mintAuthority: string | null
    updateAuthority: string | null
  }
  holders: {
    count: number
    topHolders: Array<{
      address: string
      balance: number
      percentage: number
    }>
  }
  transactions: {
    count24h: number
    volume24h: number
    uniqueTraders24h: number
  }
}
```

#### `getHeliusTokenHolders(tokenAddress: string, totalSupply?: number)`
**Fetches token holders using Helius RPC.**

**Process:**
1. Calls `getTokenLargestAccounts` RPC method
2. Calculates holder percentages if total supply provided
3. Computes concentration metrics (top 10, top 50, top 100)

**Returns:**
```typescript
{
  count: number
  topHolders: Array<{address, balance, percentage}>
  top10Percentage?: number
  top50Percentage?: number  // NEW: Wash trading detection
  top100Percentage?: number // NEW: Bundle detection
}
```

#### `getHeliusTransactions(tokenAddress: string)`
**Fetches recent transactions using Enhanced Transactions API.**

**Process:**
1. GET request to `/addresses/{tokenAddress}/transactions`
2. Filters transactions from last 24 hours
3. Counts unique traders (feePayer and accountData addresses)

**Returns:**
```typescript
{
  count24h: number
  volume24h: number  // Placeholder (would need transfer parsing)
  uniqueTraders24h: number
}
```

### Dependencies
- Environment variable: `HELIUS_API_KEY`
- Base URLs:
  - DAS API: `https://api.helius.xyz/v0`
  - RPC: `https://mainnet.helius-rpc.com/?api-key={key}`

### Error Handling
- Returns `null` on API failures
- Logs warnings with status codes
- Continues with available data if partial failure
- Falls back to other data sources in risk calculator

---

## 5. MEME TOKEN DETECTION (`lib/services/meme-detector.ts`)

### Purpose
AI-powered token classification (meme vs utility) with 95%+ accuracy using Groq Llama 3.3 70B.

### Key Function

#### `detectMemeToken(tokenSymbol: string, tokenName?: string, description?: string): Promise<MemeDetectionResult>`

**3-Step Classification Process:**

**Step 1: Whitelist Check (Instant Return)**
- Checks against `OFFICIAL_TOKEN_WHITELIST` (60+ major tokens)
- Includes: BTC, ETH, BNB, SOL, USDT, USDC, DAI, UNI, AAVE, LINK, etc.
- Returns: `{ isMeme: false, confidence: 100, reasoning: 'Official token in whitelist' }`

**Step 2: Pattern-Based Detection (Fast Path)**
```typescript
// Meme patterns
/doge|shib|pepe|floki|wojak|chad|moon|rocket|100x|1000x|inu|elon|safe|baby|mini|pump|69|420|based/i

// Utility patterns
/swap|finance|protocol|bridge|vault|stake|lend|yield|dao|network/i
```

- If meme keywords AND NOT utility keywords:
  - Returns: `{ isMeme: true, confidence: 95, reasoning: 'Contains obvious meme keywords' }`

**Step 3: AI Classification (Groq Llama 3.3 70B)**

**Prompt Engineering:**
- System role: "Cryptocurrency analyst"
- Task: Classify as MEME or UTILITY
- Few-shot examples:
  ```
  DOGE → MEME (dog-themed, community coin)
  SHIB → MEME (dog theme, viral)
  UNI → UTILITY (DEX protocol)
  PEPE → MEME (frog meme)
  AAVE → UTILITY (lending protocol)
  BONK → MEME (dog sound, Solana)
  LINK → UTILITY (oracle network)
  ```

**Response Format (JSON):**
```json
{
  "classification": "MEME" or "UTILITY",
  "confidence": 0-100,
  "reasoning": "one sentence explanation"
}
```

**AI Configuration:**
- Model: `llama-3.3-70b-versatile`
- Temperature: 0.1 (low for consistency)
- Output: Strict JSON mode

**Fallback Mechanism:**
- If AI fails: Pattern-based with 60% confidence
- If JSON parsing fails: Text search for "meme" keyword

### Data Structure
```typescript
interface MemeDetectionResult {
  isMeme: boolean
  confidence: number  // 0-100
  reasoning: string
}
```

### Integration with Risk Calculator
1. Called early in `calculateRisk()` pipeline
2. Result determines:
   - Which weight profile to use (MEME_WEIGHTS vs STANDARD_WEIGHTS)
   - Whether to apply +15 meme baseline penalty
   - AI insights section content (Premium only)
3. Manual override option available in UI

### Error Handling
- API failure → Pattern-based fallback (60% confidence)
- Missing API key → Pattern-based only
- Invalid JSON → Text parsing fallback
- Always returns a result (never throws error)

---

## 6. OFFICIAL TOKEN VERIFICATION (`lib/services/official-token-resolver.ts`)

### Purpose
Verifies if a token is legitimate using CoinGecko API (market cap >$50M threshold).

### Key Functions

#### `isOfficialToken(tokenSymbol: string, tokenAddress?: string): Promise<{isOfficial: boolean, marketCap?: number, name?: string}>`

**Process:**
1. **Cache Check**: 1-hour TTL to avoid repeated API calls
2. **CoinGecko Search**:
   - If address provided: `/coins/markets?ids={address}`
   - If symbol only: `/coins/markets?symbols={symbol}&per_page=10`
3. **Validation**:
   - Symbol must match (case-insensitive)
   - Market cap must be ≥ $50,000,000
4. **Cache Result**: Store for 1 hour

**Returns:**
```typescript
{
  isOfficial: boolean
  marketCap?: number
  name?: string
}
```

**Example:**
```typescript
// Bitcoin
{
  isOfficial: true,
  marketCap: 1234567890000,
  name: "Bitcoin"
}

// Low-cap token
{
  isOfficial: false
}
```

#### `applyOfficialTokenOverride(currentScore: number, isOfficial: boolean, marketCap?: number, isMemeToken?: boolean)`

**Applies risk score reduction for verified official tokens.**

**Bonuses:**
- **Standard tokens**: -45 points base bonus
- **Meme tokens**: -25 points base bonus (reduced due to inherent volatility)
- **>$1B market cap**: Additional -10 points (standard) or -5 points (meme)
- **>$500M market cap**: Additional -5 points (standard) or -3 points (meme)

**Example:**
```
Unverified token: Score 70 → Remains 70
Official utility token ($2B MC): Score 70 → 15 (70 - 45 - 10)
Official meme token ($2B MC): Score 70 → 40 (70 - 25 - 5)
```

**Rationale:**
- Meme tokens get smaller bonuses because they're volatile even when official (e.g., DOGE, SHIB)
- Large market cap indicates market acceptance and scrutiny
- CoinGecko listing indicates basic legitimacy

#### `getOfficialTokenList(): Promise<string[]>`

**Returns list of top 100 official tokens by market cap.**

**Process:**
1. Cache check (1-hour TTL)
2. Fetch `/coins/markets?order=market_cap_desc&per_page=100`
3. Filter by market cap ≥ $50M
4. Extract symbols (uppercase)
5. Cache result

**Usage:**
- Fast whitelist lookup for batch operations
- Admin dashboards
- Token suggestions in search UI

### Dependencies
- CoinGecko API (free tier, no key required)
- Base URL: `https://api.coingecko.com/api/v3`

### Caching Strategy
```typescript
const tokenCache = new Map<string, {isOfficial: boolean, timestamp: number}>()
const CACHE_TTL = 3600000 // 1 hour
```

**Benefits:**
- Reduces API calls (CoinGecko has rate limits)
- Faster repeated lookups
- Prevents API abuse

### Error Handling
- API failure → Returns `{isOfficial: false}`
- Invalid response → Returns cached value or `{isOfficial: false}`
- Logs warnings but doesn't throw errors

---

## 7. RISK FACTOR WEIGHTS (`lib/risk-factors/weights.ts`)

### Purpose
Defines adaptive weight profiles for different token types and blockchains (9-factor system, vesting removed).

### Weight Profiles

#### Standard Weights (DeFi, Utility Tokens)
```typescript
{
  supply_dilution: 0.18,      // 18% - Most important (inflation risk)
  holder_concentration: 0.20, // 20% - Whale manipulation + wash trading
  liquidity_depth: 0.16,      // 16% - Rug pull + liquidity drops
  contract_control: 0.15,     // 15% - Security critical
  tax_fee: 0.11,             // 11% - Hidden fees
  distribution: 0.08,         // 8% - Holder spread
  burn_deflation: 0.06,       // 6% - Deflation mechanisms
  adoption: 0.10,             // 10% - Social/on-chain activity
  audit: 0.04                 // 4% - Code verification
}
```

**Focus**: Supply control, holder distribution, liquidity.

#### Meme Weights (Sentiment-Driven Tokens)
```typescript
{
  supply_dilution: 0.14,      // 14% - Lower (fixed supply common)
  holder_concentration: 0.24, // 24% ↑ - Whales control markets
  liquidity_depth: 0.20,      // 20% ↑ - Rug pulls extremely common
  contract_control: 0.12,     // 12% - Usually simple contracts
  tax_fee: 0.10,             // 10% - Can have high taxes
  distribution: 0.06,         // 6% - Concentration matters more
  burn_deflation: 0.02,       // 2% ↓ - Rarely burn
  adoption: 0.15,             // 15% ↑ - Social hype is critical
  audit: 0.01                 // 1% ↓ - Rarely audited
}
```

**Focus**: Whale concentration, liquidity depth, social adoption.

#### Solana Weights (Chain-Specific Risks)
```typescript
{
  supply_dilution: 0.13,      // 13% - Fixed supply common
  holder_concentration: 0.20, // 20% - Standard + wash trading detection
  liquidity_depth: 0.18,      // 18% - Rug pulls common + drops
  contract_control: 0.35,     // 35% ↑ - HIGHEST (freeze/mint authority)
  tax_fee: 0.00,             // 0% - N/A (no token taxes on Solana)
  distribution: 0.06,         // 6% - Standard
  burn_deflation: 0.04,       // 4% - Lower
  adoption: 0.10,             // 10% - Standard
  audit: 0.02                 // 2% - SPL tokens rarely audited
}
```

**Focus**: Contract control (35% due to unique freeze authority risk).

#### Cardano Weights (Policy-Based Tokens)
```typescript
{
  supply_dilution: 0.25,      // 25% ↑ - Policy matters most
  holder_concentration: 0.15, // 15% - Better distribution
  liquidity_depth: 0.15,      // 15% - Safer by design
  contract_control: 0.20,     // 20% - Policy lock is key
  tax_fee: 0.00,             // 0% - No tax mechanism
  distribution: 0.15,         // 15% ↑ - Check policy distribution
  burn_deflation: 0.08,       // 8% - Standard
  adoption: 0.10,             // 10% - Standard
  audit: 0.07                 // 7% ↑ - Plutus scripts more audited
}
```

**Focus**: Supply policy and distribution (time-locked minting).

### Weight Selection Function

#### `getWeights(isMeme: boolean, chainType: ChainType): FactorWeights`

**Logic:**
1. If `isMeme === true` → Return `MEME_WEIGHTS` (regardless of chain)
2. Else, check `chainType`:
   - `ChainType.SOLANA` → Return `SOLANA_WEIGHTS`
   - `ChainType.CARDANO` → Return `CARDANO_WEIGHTS`
   - `ChainType.EVM` (default) → Return `STANDARD_WEIGHTS`

**Rationale:**
- Meme tokens have consistent risk patterns across all chains
- Solana has unique critical risks (freeze authority)
- Cardano uses different token model (time-locked policies)
- EVM chains have similar contract models (Ethereum, BSC, Polygon)

### Weighted Score Calculation

#### `calculateWeightedScore(factors: Record<string, number>, weights: FactorWeights): number`

**Formula:**
```
score = Σ (factor_score × factor_weight)

Example:
  supplyDilution: 40 × 0.18 = 7.2
  holderConcentration: 60 × 0.20 = 12.0
  liquidityDepth: 30 × 0.16 = 4.8
  contractControl: 80 × 0.15 = 12.0
  taxFee: 20 × 0.11 = 2.2
  distribution: 50 × 0.08 = 4.0
  burnDeflation: 10 × 0.06 = 0.6
  adoption: 35 × 0.10 = 3.5
  audit: 40 × 0.04 = 1.6
  ────────────────────────────
  Total = 47.9 → Rounded to 48
```

### Weight Rationale Function

#### `getWeightingRationale(isMeme: boolean, chainType: ChainType): string`

Returns human-readable explanation of why specific weights are used:

**Examples:**
- **Meme**: "Prioritizes whale concentration (24%), liquidity depth (20%), and social adoption (15%). Meme coins are sentiment-driven and vulnerable to influencer manipulation."
- **Solana**: "Prioritizes contract control (35%) due to unique freeze/mint authority risks. Solana SPL tokens can have authorities that lock user wallets."
- **Standard**: "Balanced approach prioritizing supply dilution (18%), holder concentration (20%), and liquidity depth (16%) for utility tokens."

### ChainType Enum
```typescript
enum ChainType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  CARDANO = 'CARDANO'
}
```

---

## 8. DEAD TOKEN DETECTOR (`lib/risk-factors/dead-token.ts`)

### Purpose
Detects abandoned tokens and forces risk score to 90-100 (CRITICAL).

### Key Function

#### `checkDeadToken(data: DeadTokenCheckData): {isDead: boolean, score: number, reason: string}`

**Death Criteria (Scored Hierarchically):**

1. **Zero Liquidity (Score: 100 - CRITICAL)**
   - `liquidityUSD < $500`
   - Reason: "Liquidity < $500"
   - Rationale: Can't sell even if you wanted to

2. **No Volume (Score: 95 - CRITICAL)**
   - `volume24h < $100`
   - Reason: "24h volume < $100"
   - Rationale: No trading activity = dead market

3. **Extreme ATH Drop (Score: 92 - HIGH)**
   - Current price down 98%+ from all-time high
   - Reason: "Down 98.5% from ATH"
   - Rationale: Token has collapsed and not recovering

4. **Zero Transactions (Score: 90 - HIGH)**
   - `txCount24h === 0`
   - Reason: "Zero transactions in 24h"
   - Rationale: Complete abandonment

5. **Extreme Price Drops (Score: 85-88 - HIGH)**
   - 7-day drop > 90%: Score 85
   - 30-day drop > 95%: Score 88
   - Reason: "Down 92% in 7 days"
   - Rationale: Death spiral in progress

6. **Very Few Holders (Score: 90 - HIGH)**
   - `holderCount < 10`
   - Reason: "Only 8 holders"
   - Rationale: Community has abandoned the token

**Scoring Logic:**
```typescript
let baseScore = 0
const reasons: string[] = []

// Take maximum of all triggered criteria
if (liquidityUSD < 500) baseScore = 100
if (volume24h < 100) baseScore = Math.max(baseScore, 95)
if (dropFromATH > 0.98) baseScore = Math.max(baseScore, 92)
if (txCount24h === 0) baseScore = Math.max(baseScore, 90)

// isDead = baseScore >= 90
```

### Override Function

#### `applyDeadTokenOverride(currentScore: number, deadCheckResult): {score: number, criticalFlag?: string}`

**Logic:**
```typescript
if (!deadCheckResult.isDead) {
  return { score: currentScore }
}

const newScore = Math.max(currentScore, deadCheckResult.score)

return {
  score: newScore,
  criticalFlag: `🚨 DEAD TOKEN: ${deadCheckResult.reason}`
}
```

**Example:**
```
Current score: 45
Dead check: { isDead: true, score: 95, reason: "Liquidity < $500" }
Final score: 95 (forced to dead token score)
Critical flag: "🚨 DEAD TOKEN: Liquidity < $500"
```

### Integration with Risk Calculator

**Applied after base calculation:**
```typescript
const deadTokenCheck = checkDeadToken({
  liquidityUSD: data.liquidityUSD,
  volume24h: data.volume24h,
  priceChange7d: data.priceChange7d,
  priceChange30d: data.priceChange30d,
  txCount24h: data.txCount24h,
  holderCount: data.holderCount,
  ath: data.ath,
  currentPrice: data.priceUSD
})

// Skip for official tokens (they have verified data)
if (deadTokenCheck.isDead && !officialTokenResult.isOfficial) {
  const override = applyDeadTokenOverride(overallScoreFinal, deadTokenCheck)
  overallScoreFinal = override.score
  if (override.criticalFlag) {
    criticalFlags.push(override.criticalFlag)
  }
}
```

### Error Handling
- Missing data fields are treated as `undefined` (no penalty if data unavailable)
- Only applies penalties when data explicitly shows problems
- Never returns `isDead: true` if all data is missing

---

## 9. AUTHENTICATION SYSTEM (`contexts/auth-context.tsx`)

### Purpose
React Context for Firebase authentication and user profile management.

### Key Components

#### AuthContext Interface
```typescript
interface AuthContextType {
  user: User | null              // Firebase Auth user
  userData: UserData | null      // Legacy user data (backward compatibility)
  userProfile: UserDocument | null  // New Firestore schema
  loading: boolean
  updateProfile: (data: Partial<UserData>) => Promise<void>
  refreshProfile: () => Promise<void>
}
```

#### User Data Structures

**Legacy UserData (Backward Compatibility):**
```typescript
interface UserData {
  uid: string
  email: string
  name?: string
  photoURL?: string | null
  tier: "free" | "pro"
  plan?: "FREE" | "PREMIUM"
  role?: "user" | "admin"
  dailyAnalyses: number
  watchlist: string[]
  alerts: Array<Record<string, unknown>>
  createdAt: string
  nextBillingDate?: string
  walletAddress?: string
  company?: string
  country?: string
}
```

**New UserDocument (Firestore Schema):**
```typescript
interface UserDocument {
  uid: string
  email: string
  displayName?: string
  photoURL?: string | null
  plan: "FREE" | "PREMIUM"
  subscription: {
    status: 'active' | 'cancelled' | 'expired'
    startDate: Date
    endDate: Date | null
    autoRenew: boolean
  }
  usage: {
    tokensAnalyzed: number
    lastResetDate: Date
    dailyLimit: number  // 20 for FREE, unlimited for PREMIUM
  }
  preferences: {
    notifications: boolean
    emailAlerts: boolean
    theme: 'light' | 'dark' | 'system'
  }
  role?: 'user' | 'admin'
  walletAddress?: string
  company?: string
  country?: string
  createdAt: Date
  lastLoginAt: Date
}
```

### Authentication Flow

#### 1. Initial Setup (useEffect)
```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Try to migrate old schema if needed
      let profile = await migrateUserSchema(user.uid)
      
      // If migration didn't return profile, get it normally
      if (!profile) {
        profile = await getUserProfile(user.uid)
      }
      
      if (profile) {
        setUserProfile(profile)
        setUserData(mapToLegacyFormat(profile))
        initializeUserTracking(user.uid, profile)
      } else {
        // Create new user profile
        await createUserProfile(user.uid, user.email, user.displayName)
        profile = await getUserProfile(user.uid)
        // ... set state
      }
    } else {
      setUserData(null)
      setUserProfile(null)
      clearUserTracking()
    }
    setLoading(false)
  })
  
  return unsubscribe
}, [])
```

#### 2. Profile Updates
```typescript
const updateProfile = async (data: Partial<UserData>) => {
  if (!user) return
  
  const userRef = doc(db, "users", user.uid)
  
  // Map UserData fields to Firestore schema
  const updateData: Record<string, any> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.photoURL !== undefined) updateData.photoURL = data.photoURL
  if (data.walletAddress !== undefined) updateData.walletAddress = data.walletAddress
  if (data.company !== undefined) updateData.company = data.company
  if (data.country !== undefined) updateData.country = data.country
  
  await updateDoc(userRef, updateData)
  
  // Update local state
  setUserData((prev) => ({ ...prev, ...data }) as UserData)
  
  // Refresh from server
  await refreshProfile()
}
```

#### 3. Profile Refresh
```typescript
const refreshProfile = async () => {
  if (!user) return
  
  const profile = await getUserProfile(user.uid)
  if (profile) {
    setUserProfile(profile)
    setUserData(mapToLegacyFormat(profile))
  }
}
```

### Schema Migration

**Automatic migration from old schema to new:**
- Called in `onAuthStateChanged` hook
- Preserves existing user data
- Adds new required fields (usage tracking, preferences)
- Handled by `migrateUserSchema()` service

### Analytics Integration

**User tracking initialization:**
```typescript
initializeUserTracking(user.uid, {
  email: user.email,
  plan: profile.plan,
  createdAt: profile.createdAt.toISOString()
})
```

**Logout cleanup:**
```typescript
clearUserTracking()
```

### Dependencies
- **Firebase Auth**: User authentication
- **Firebase Firestore**: User profile storage
- **Firestore Service**: CRUD operations (`getUserProfile`, `createUserProfile`, `updateUserPlan`)
- **Migration Service**: Schema migration (`migrateUserSchema`)
- **Analytics**: User tracking (`initializeUserTracking`, `clearUserTracking`)

### Error Handling
- Fallback profile creation if Firestore fails
- Minimal profile to allow app to function
- Console error logging with detailed messages
- Never throws errors (always sets loading = false)

### Context Usage
```typescript
// In any component
const { user, userData, userProfile, loading, updateProfile, refreshProfile } = useAuth()

// Check if user is premium
if (userProfile?.plan === 'PREMIUM') {
  // Show premium features
}

// Update user profile
await updateProfile({ name: 'New Name', walletAddress: '0x...' })
```

---

## 10. API ROUTES (`app/api/analyze-token/route.ts`)

### Purpose
Main API endpoint for token risk analysis. Orchestrates data fetching, caching, and risk calculation.

### Endpoint: POST `/api/analyze-token`

**Request Body:**
```typescript
{
  tokenAddress: string      // Contract address or token symbol
  chainId: string          // Chain identifier (1=Ethereum, 56=BSC, 501=Solana)
  userId: string           // User ID for rate limiting
  plan: 'FREE' | 'PREMIUM' // User subscription plan
  manualClassification?: 'AUTO_DETECT' | 'MEME_TOKEN' | 'UTILITY_TOKEN'
}
```

**Response (RiskResult):**
```typescript
{
  overall_risk_score: number  // 0-100
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  confidence_score: number    // 70-96
  breakdown: RiskBreakdown    // 10 factor scores
  data_sources: string[]
  goplus_status: "active" | "fallback"
  plan: "FREE" | "PREMIUM"
  
  // Premium only
  critical_flags?: string[]
  upcoming_risks?: {...}
  detailed_insights?: string[]
  ai_insights?: {...}
  twitter_metrics?: {...}
  ai_summary?: {...}
  positive_signals?: string[]
}
```

### Process Flow

#### 1. Rate Limiting
```typescript
await checkRateLimit(userId, plan)
// FREE: 20 requests/day
// PREMIUM: Unlimited
```

#### 2. Cache Check
```typescript
const cacheKey = `${tokenAddress}_${chainId}`
const cached = await getCachedTokenData(cacheKey)

if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
  return NextResponse.json(cached.data)
}
```
**Cache TTL:**
- Standard: 5 minutes
- High-volume tokens: 1 minute
- Dead tokens: 30 minutes

#### 3. Data Fetching (Chain-Adaptive)

**Option A: Unified Fetcher (NEW)**
```typescript
const completeData = await fetchCompleteTokenData(tokenAddress, chainId)

// Adapts automatically:
// - EVM: Mobula + Moralis + GoPlus
// - Solana: Mobula + Helius + Jupiter
// - Cardano: Mobula + Blockfrost

const tokenData = adaptCompleteToLegacy(completeData)
```

**Option B: Legacy Fetcher (Fallback)**
```typescript
// Mobula for market data
const mobiulaData = await getMobiulaTokenData(tokenAddress)

// GoPlus for security (EVM only)
const goplusData = await tryGoPlusWithFallback(tokenAddress, chainId)

// Moralis for holder analytics (EVM only)
const moralisData = await getMoralisTokenMetadata(tokenAddress, chainId)

// Helius for Solana
if (chainId === '501') {
  const heliusData = await getHeliusSolanaData(tokenAddress)
}
```

#### 4. Risk Calculation
```typescript
const riskResult = await calculateRisk(tokenData, {
  tokenSymbol: metadata.symbol,
  tokenName: metadata.name,
  chain: chainType,
  twitterHandle: metadata.twitterHandle,
  manualClassification: manualClassification
}, plan)
```

#### 5. Save to History (Premium only)
```typescript
if (plan === 'PREMIUM') {
  await saveAnalysisHistoryAdmin(userId, {
    tokenAddress,
    chainId,
    riskScore: riskResult.overall_risk_score,
    riskLevel: riskResult.risk_level,
    analyzedAt: new Date()
  })
}
```

#### 6. Increment Usage Counter
```typescript
await incrementTokenAnalyzedAdmin(userId)
```

#### 7. Cache Result
```typescript
await setCachedTokenData(cacheKey, riskResult, CACHE_TTL)
```

### Algorithm Selection

**3 Algorithm Options (Configurable via Flags):**

1. **Legacy Calculator (Default)**
   ```typescript
   USE_ENHANCED_ALGORITHM = false
   USE_MULTICHAIN_ALGORITHM = false
   ```
   - Original 10-factor algorithm
   - Single weight profile
   - Basic GoPlus integration

2. **Enhanced Calculator (Active)**
   ```typescript
   USE_ENHANCED_ALGORITHM = true
   USE_MULTICHAIN_ALGORITHM = false
   ```
   - 9-factor algorithm (vesting removed)
   - Adaptive weights (Standard/Meme/Solana/Cardano)
   - AI meme detection
   - Twitter metrics
   - Dead token detector
   - Official token resolver
   - 2025 Pump.fun rug detector

3. **Multi-Chain Calculator (Experimental)**
   ```typescript
   USE_ENHANCED_ALGORITHM = false
   USE_MULTICHAIN_ALGORITHM = true
   ```
   - Unified data model across all chains
   - Chain-specific factor implementations
   - Advanced behavioral analytics

### Data Source Priority

**Market Data (Mobula Always First):**
1. Mobula API (primary)
2. CoinGecko (fallback)
3. DEX aggregators (last resort)

**Security Data (Chain-Specific):**
- EVM: GoPlus → Mobula estimates
- Solana: Helius → On-chain parsing
- Cardano: Blockfrost → Policy analysis

**Holder Data:**
- EVM: Moralis → GoPlus → Mobula
- Solana: Helius RPC → Jupiter
- Cardano: Blockfrost

### Error Handling

**Graceful Degradation:**
```typescript
try {
  const goplusData = await tryGoPlusWithFallback(tokenAddress, chainId)
} catch (error) {
  console.warn('GoPlus failed, using Mobula fallback')
  // Continue with available data
  // Lower confidence score
}
```

**Error Responses:**
- 429: Rate limit exceeded
- 404: Token not found
- 500: Calculation error (with partial data if available)
- 503: All data sources unavailable

### Caching Strategy

**Cache Keys:**
```typescript
`${tokenAddress}_${chainId}` // Standard
`${tokenAddress}_${chainId}_premium` // Premium features included
```

**TTL by Token State:**
- Active trading: 1 minute
- Normal: 5 minutes
- Dead token: 30 minutes
- Error state: 30 seconds

### Dependencies
- `calculateRisk()`: Main risk calculator
- `tryGoPlusWithFallback()`: Security data with fallback
- `getCachedTokenData()`, `setCachedTokenData()`: Redis/memory cache
- `checkRateLimit()`: Rate limiting service
- `saveAnalysisHistoryAdmin()`: Firestore history tracking
- `incrementTokenAnalyzedAdmin()`: Usage counter

---

## SUMMARY OF KEY FEATURES

### 1. **Multi-Chain Support**
- Ethereum, BSC, Polygon, Avalanche, Arbitrum, Solana, Cardano
- Chain-adaptive risk algorithms
- Chain-specific data sources

### 2. **10-Factor Risk Analysis**
- Supply Dilution (18%)
- Holder Concentration (20%) + wash trading detection
- Liquidity Depth (16%) + rug pull detection
- Vesting & Unlock (13%)
- Contract Control (15%, 35% on Solana)
- Tax & Fee (11%)
- Distribution (8%)
- Burn & Deflation (6%)
- Adoption & Usage (10%)
- Audit & Transparency (4%)

### 3. **AI-Powered Features (Premium)**
- Meme token classification (Groq Llama 3.3 70B)
- Comprehensive risk analysis generation
- Natural language insights

### 4. **Advanced Detection Systems**
- Dead token detector
- Official token verifier (CoinGecko)
- 2025 Pump.fun rug detector
- Wash trading detector (top 50/100 holders, unique buyers)
- Liquidity drop detector (1h/24h tracking)

### 5. **Social Metrics Integration**
- Twitter follower count
- Engagement rate
- Tweet frequency
- Adoption risk scoring

### 6. **Data Sources**
- Mobula: Market data, liquidity, holders
- GoPlus: Security analysis, honeypot detection
- Moralis: Transaction patterns, holder analytics
- Helius: Solana authorities, SPL token data
- CoinGecko: Official token verification
- Groq AI: Token classification, risk analysis
- Twitter API: Social metrics

### 7. **User Management**
- Firebase Authentication
- Firestore user profiles
- Two-tier system (FREE/PREMIUM)
- Usage tracking and limits
- Rate limiting

### 8. **Caching & Performance**
- 1-30 minute TTL based on token state
- Redis or in-memory caching
- Parallel API calls
- Graceful degradation

### 9. **Error Handling**
- Fallback mechanisms at every level
- Partial data analysis
- Confidence score adjustments
- Detailed error logging

### 10. **API Architecture**
- RESTful endpoints
- TypeScript type safety
- Next.js 14 App Router
- Server-side rendering
- Client-side hydration

---

## TECHNOLOGY STACK

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context API
- **Forms**: React Hook Form

### Backend
- **Runtime**: Node.js (Next.js API routes)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Caching**: Redis / In-Memory
- **Rate Limiting**: Custom middleware

### External APIs
- Mobula API (market data)
- GoPlus Security API
- Moralis API (blockchain indexing)
- Helius API (Solana)
- Blockfrost API (Cardano)
- CoinGecko API (verification)
- Groq AI API (Llama 3.3 70B)
- Twitter API (social metrics)

### Infrastructure
- **Hosting**: Vercel / Custom server
- **Analytics**: Firebase Analytics
- **Monitoring**: Console logging + custom error tracking

---

## CONCLUSION

This codebase implements a comprehensive cryptocurrency token risk analysis platform with:

1. **10-factor weighted risk algorithm** with chain-adaptive profiles
2. **AI-powered token classification** using Groq Llama 3.3 70B
3. **Multi-chain support** with chain-specific data sources and risk factors
4. **Advanced detection systems** for dead tokens, rug pulls, and wash trading
5. **Social metrics integration** for adoption scoring
6. **Official token verification** via CoinGecko
7. **Two-tier subscription model** (FREE/PREMIUM)
8. **Comprehensive error handling** with fallback mechanisms
9. **Intelligent caching** for performance optimization
10. **Modern tech stack** (Next.js 14, TypeScript, Firebase, Tailwind)

The system prioritizes **data accuracy**, **user experience**, and **actionable insights** for cryptocurrency investors to make informed decisions and avoid scams.

**Total Lines of Code Analyzed**: ~5000+ lines across 10+ core files

**Key Innovation**: Chain-adaptive risk scoring with AI-powered token classification and multi-layer override systems for maximum accuracy.
