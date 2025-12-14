# 📚 User Guide & Programmer's Guide - Tokenomics Lab

**Section 5 of Bachelor's Thesis**  
**Last Updated**: December 11, 2025

---

## Table of Contents

- [5.1 User Guide](#51-user-guide)
  - [5.1.1 Getting Started](#511-getting-started)
  - [5.1.2 Account Registration & Login](#512-account-registration--login)
  - [5.1.3 Dashboard Navigation](#513-dashboard-navigation)
  - [5.1.4 Performing Token Analysis](#514-performing-token-analysis)
  - [5.1.5 Understanding Risk Results](#515-understanding-risk-results)
  - [5.1.6 Managing Watchlist](#516-managing-watchlist)
  - [5.1.7 Subscription Tiers & Credits](#517-subscription-tiers--credits)
  - [5.1.8 Admin Panel Guide](#518-admin-panel-guide)
- [5.2 Programmer's Guide](#52-programmers-guide)
  - [5.2.1 Development Environment Setup](#521-development-environment-setup)
  - [5.2.2 Project Structure](#522-project-structure)
  - [5.2.3 API Reference](#523-api-reference)
  - [5.2.4 Adding New Blockchain Support](#524-adding-new-blockchain-support)
  - [5.2.5 Testing Guide](#525-testing-guide)
  - [5.2.6 Deployment Guide](#526-deployment-guide)

---

# 5.1 User Guide

This section provides step-by-step instructions for end users to navigate and utilize all features of the Tokenomics Lab platform.

---

## 5.1.1 Getting Started

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Browser | Chrome 90+, Firefox 88+, Safari 14+ | Latest Chrome or Brave |
| Internet | 1 Mbps | 10+ Mbps |
| Screen | 320px width (mobile) | 1280px+ (desktop) |
| Wallet (optional) | Phantom, Solflare, or Backpack | Phantom Browser Extension |

### Accessing the Platform

1. Open your web browser
2. Navigate to `https://tokenomics.lab` (or localhost:3000 for development)
3. The landing page displays the platform overview and features
4. Click **"GET STARTED"** to create an account or **"LOGIN"** if returning

---

## 5.1.2 Account Registration & Login

### Creating a New Account

1. Click **"Sign Up"** in the navigation bar
2. Enter your email address
3. Create a secure password (minimum 8 characters)
4. Click **"Create Account"**
5. Verify your email address via the confirmation link sent to your inbox
6. Complete your profile (optional: add display name and profile photo)

### Logging In

1. Click **"Login"** in the navigation bar
2. Enter your registered email and password
3. Click **"Sign In"**
4. You will be redirected to your Dashboard

### Password Recovery

1. On the login page, click **"Forgot Password?"**
2. Enter your registered email address
3. Check your inbox for the password reset link
4. Create a new password and confirm

---

## 5.1.3 Dashboard Navigation

Upon logging in, you arrive at the main Dashboard interface. The layout consists of:

### Navigation Bar (Top)
- **Logo**: Click to return to landing page
- **Dashboard**: Access your analysis dashboard
- **Features**: View platform capabilities
- **Docs**: Read algorithm documentation
- **Pricing**: View subscription options (hidden for PRO users)
- **Notification Bell**: View alerts for watched tokens
- **Profile Menu**: Access settings, admin panel (if admin), and logout

### Dashboard Sections

| Section | Purpose | Location |
|---------|---------|----------|
| Statistics Cards | View total scans, average risk, alerts | Top of page |
| Token Search | Enter token address or search by name | Center panel |
| Scan Results | View analysis after scanning | Below search |
| Watchlist | Monitor saved tokens | Right sidebar or below results |
| Credits Panel | View/purchase credits (PAY-AS-YOU-GO) | Top right |

---

## 5.1.4 Performing Token Analysis

### Step 1: Select Blockchain
Choose the blockchain network from the dropdown:
- Ethereum (ETH)
- Binance Smart Chain (BSC)
- Polygon (MATIC)
- Avalanche (AVAX)
- Solana (SOL)
- Base

### Step 2: Enter Token Information
**Option A - Search by Name:**
1. Type the token name or symbol (e.g., "PEPE" or "Bonk")
2. Select from the autocomplete suggestions
3. The contract address auto-fills

**Option B - Direct Address:**
1. Paste the contract address directly
2. Format: `0x...` for EVM chains or base58 for Solana

### Step 3: Initiate Scan
1. Click **"SCAN TOKEN"** or **"ANALYZE"**
2. Wait 3-10 seconds for analysis to complete
3. View results in the scan results panel

### Step 4: Review Results
The analysis returns:
- Overall Risk Score (0-100)
- Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
- 10-Factor Breakdown
- AI-Generated Summary
- Market Metrics
- Critical Flags (if any)

---

## 5.1.5 Understanding Risk Results

### Risk Score Interpretation

| Score Range | Risk Level | Color | Meaning |
|-------------|------------|-------|---------|
| 0-25 | LOW | Green | Generally safe, established token |
| 26-50 | MEDIUM | Yellow | Some concerns, proceed with caution |
| 51-75 | HIGH | Orange | Significant risks detected |
| 76-100 | CRITICAL | Red | Extreme risk, potential scam indicators |

### 10-Factor Breakdown

Each factor contributes to the overall score:

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| Supply Dilution (F1) | 12% | FDV vs Market Cap ratio |
| Holder Concentration (F2) | 14% | Top 10 holders ownership % |
| Liquidity Depth (F3) | 13% | Available liquidity vs market cap |
| Vesting Unlock (F4) | 13% | Token unlock schedules |
| Contract Control (F5) | 11% | Owner permissions, mintability |
| Tax/Fee (F6) | 9% | Buy/sell transaction fees |
| Distribution (F7) | 9% | Fair token distribution |
| Burn/Deflation (F8) | 6% | Token burning mechanisms |
| Adoption (F9) | 8% | Transaction count, active users |
| Audit/Transparency (F10) | 5% | Third-party audits |

### Critical Flags

Red warning indicators that require immediate attention:
- 🚨 **Honeypot Detected**: Cannot sell after buying
- 🚨 **Ownership Not Renounced**: Owner can modify contract
- 🚨 **Mintable Token**: New tokens can be created
- 🚨 **High Tax (>10%)**: Excessive transaction fees
- 🚨 **Liquidity Not Locked**: Rug pull risk
- 🚨 **Whale Concentration (>50%)**: Single holder dominance

### AI Analysis Summary

The AI analyst (Groq Llama 3.3 70B) provides:
- Plain-language risk explanation
- Key concerns in priority order
- Contextual comparison to similar tokens
- Actionable recommendations

---

## 5.1.6 Managing Watchlist

### Adding Tokens to Watchlist
1. After scanning a token, click **"Add to Watchlist"** (star icon)
2. The token appears in your Watchlist panel
3. Maximum tokens: 10 (FREE), 25 (PAY-AS-YOU-GO), 50 (PRO)

### Viewing Watchlist
1. Navigate to the Watchlist section on your dashboard
2. View each token's:
   - Last known risk score
   - Current price
   - 24-hour price change
   - Alert status

### Removing Tokens
1. Click the **"X"** or trash icon next to the token
2. Confirm removal when prompted

### Smart Alerts
For PAY-AS-YOU-GO and PRO users:
- Receive notifications when watched tokens:
  - Risk score increases by >10 points
  - Price drops >20% in 24 hours
  - Holder concentration increases significantly
  - Liquidity decreases >30%

---

## 5.1.7 Subscription Tiers & Credits

### Tier Comparison

| Feature | FREE | PAY-AS-YOU-GO | PRO ($29/mo) |
|---------|------|---------------|--------------|
| Daily Scans | 20 | Unlimited* | Unlimited |
| AI Analysis | Basic | Full | Full |
| Watchlist Tokens | 10 | 25 | 50 |
| Smart Alerts | ❌ | ✅ | ✅ |
| Export Reports | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| DexScreener Search | ❌ | ✅ | ✅ |
| Cost | $0 | $0.10/scan | $29/month |

*PAY-AS-YOU-GO requires credit balance

### Purchasing Credits (PAY-AS-YOU-GO)

1. Connect your Solana wallet (Phantom, Solflare, or Backpack)
2. Click **"Add Credits"** in the Credits Manager panel
3. Select credit package:
   - 10 credits = $1.00
   - 50 credits = $4.50 (10% bonus)
   - 100 credits = $8.00 (20% bonus)
4. Approve the transaction in your wallet
5. Credits are added instantly after blockchain confirmation
6. Transaction fee: ~$0.00025 (Solana network)

### Upgrading to PRO

1. Navigate to **Pricing** page
2. Click **"Subscribe to PRO"**
3. Complete payment via Stripe (credit card)
4. PRO benefits activate immediately
5. Cancel anytime from Profile settings

---

## 5.1.8 Admin Panel Guide

*Available only for users with ADMIN tier*

### Accessing Admin Panel

1. Complete standard login
2. Navigate to `/admin/login`
3. Enter your 6-digit TOTP code from authenticator app
4. Access granted to Admin Panel

### Admin Functions

**Users Tab:**
- Search users by name, email, or UID
- View user details (tier, credits, last login)
- Modify user tier (FREE → PRO upgrade)
- Lock or delete user accounts

**Analytics Tab:**
- View user growth charts
- Monitor scan activity over time
- Analyze chain usage distribution
- Track revenue metrics

**Payments Tab:**
- View all x402 transactions
- Monitor Stripe subscriptions
- Track credit purchases
- Export transaction reports

**Cache Tab:**
- View cached token analyses
- Clear individual cache entries
- Flush entire cache
- Monitor cache hit rates

**Settings Tab:**
- Toggle maintenance mode
- Adjust free tier daily limits
- Configure cache expiration times
- Manage API rate limits

---

# 5.2 Programmer's Guide

This section provides technical documentation for developers working on the Tokenomics Lab codebase.

---

## 5.2.1 Development Environment Setup

### Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or 20.x | JavaScript runtime |
| pnpm | 8.x+ | Package manager |
| Git | 2.x+ | Version control |
| VS Code | Latest | Recommended IDE |

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/token-guard.git
cd token-guard

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (see below)

# 5. Start development server
pnpm dev

# 6. Open browser to http://localhost:3000
```

### Environment Variables

Create `.env.local` with the following:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# API Keys - Data Sources
COINMARKETCAP_API_KEY=your_cmc_key
MORALIS_API_KEY=your_moralis_key
HELIUS_API_KEY=your_helius_key
DEXSCREENER_API_KEY=optional_key
GOPLUSLABS_API_KEY=your_goplus_key

# AI Provider
GROQ_API_KEY=your_groq_key
GOOGLE_AI_API_KEY=your_gemini_key_fallback

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
X402_MERCHANT_WALLET=your_solana_wallet_address

# Security
ADMIN_SECRET_KEY=random_32_char_string
TWO_FACTOR_ENCRYPTION_KEY=random_32_char_string
```

---

## 5.2.2 Project Structure

```
token-guard/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API route handlers
│   │   ├── analyze-token/        # Main analysis endpoint
│   │   ├── admin/                # Admin API routes
│   │   ├── auth/                 # Authentication routes
│   │   └── webhooks/             # Stripe/x402 webhooks
│   ├── dashboard/                # User dashboard page
│   ├── admin/                    # Admin pages
│   └── layout.tsx                # Root layout with providers
│
├── components/                   # React components
│   ├── ui/                       # Primitive components (Button, Card, etc.)
│   ├── navbar.tsx                # Global navigation
│   ├── token-search-cmc.tsx      # Token search component
│   ├── risk-overview.tsx         # Risk display component
│   └── [50+ other components]
│
├── lib/                          # Core business logic
│   ├── risk-calculator.ts        # 10-factor algorithm
│   ├── token-scan-service.ts     # Orchestrates data fetching
│   ├── ai-analyst.ts             # AI summary generation
│   ├── firebase.ts               # Firebase client SDK
│   ├── firebase-admin.ts         # Firebase Admin SDK
│   └── services/                 # External API integrations
│       ├── moralis.ts            # Moralis API client
│       ├── helius.ts             # Helius API client
│       ├── coingecko.ts          # CoinGecko client
│       └── gopluslabs.ts         # GoPlus security API
│
├── contexts/                     # React Context providers
│   └── auth-context.tsx          # Authentication state
│
├── hooks/                        # Custom React hooks
│   ├── use-user-role.ts          # Role-based access control
│   └── use-x402-payment.tsx      # Payment integration
│
├── scripts/                      # Utility scripts
│   ├── test-multiple-tokens.js   # Multi-chain test suite
│   └── make-premium.js           # Upgrade user tier
│
└── thesis/                       # Documentation for thesis
    ├── UI_MODULES_SPECIFICATION.md
    └── DATABASE_SPECIFICATION.md
```

---

## 5.2.3 API Reference

### POST `/api/analyze-token`

Main endpoint for token risk analysis.

**Request Body:**
```typescript
{
  tokenAddress: string      // Contract address
  chainId: number          // 1=ETH, 56=BSC, 137=Polygon, 501=Solana
  userId?: string          // Firebase UID (for quota tracking)
  plan?: 'FREE' | 'PAY_AS_YOU_GO' | 'PRO' | 'ADMIN'
  metadata?: {
    tokenSymbol?: string
    tokenName?: string
    twitterHandle?: string
  }
}
```

**Response (Success):**
```typescript
{
  overall_risk_score: number        // 0-100
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence_score: number          // 0-100
  breakdown: {
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
  raw_data: {
    marketCap: number
    fdv: number
    liquidityUSD: number
    holderCount: number
    top10HoldersPct: number
    txCount24h: number
    ageDays: number
    is_mintable: boolean
    owner_renounced: boolean
    lp_locked: boolean
  }
  ai_summary?: string
  detailed_insights?: string[]
  critical_flags?: string[]
  data_sources: string[]
  meme_token?: { detected: boolean, probability: number }
  dead_token?: { detected: boolean, flags: string[] }
  cached?: boolean
  cached_at?: string
}
```

**Error Response:**
```typescript
{
  error: string
  code?: string
  details?: any
}
```

### GET `/api/user/profile`

Fetch current user's profile and tier information.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```typescript
{
  uid: string
  email: string
  displayName: string
  tier: 'FREE' | 'PAY_AS_YOU_GO' | 'PRO' | 'ADMIN'
  credits: number
  dailyScansUsed: number
  lastScanReset: string
  createdAt: string
}
```

---

## 5.2.4 Adding New Blockchain Support

### Step 1: Add Chain Configuration

Edit `lib/chain-config.ts`:

```typescript
export const CHAIN_CONFIG = {
  // ... existing chains
  
  // Add new chain
  42161: {
    name: 'Arbitrum',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeToken: 'ETH',
    type: 'EVM',
    moralisSupported: true,
    heliusSupported: false
  }
}
```

### Step 2: Create Data Fetcher

Create `lib/services/arbitrum.ts`:

```typescript
export class ArbitrumService {
  async getTokenData(address: string) {
    // Implement chain-specific data fetching
    // Can reuse Moralis for EVM chains
  }
  
  async getHolderData(address: string) {
    // Fetch holder distribution
  }
}
```

### Step 3: Register in Token Scan Service

Edit `lib/token-scan-service.ts`:

```typescript
import { ArbitrumService } from './services/arbitrum'

// In the scanToken method:
case 42161:
  return this.scanEVMToken(address, 42161)
```

### Step 4: Add UI Support

Edit `components/chain-selector.tsx`:

```typescript
const CHAINS = [
  // ... existing
  { id: 42161, name: 'Arbitrum', icon: '/chains/arbitrum.svg' }
]
```

### Step 5: Adjust Risk Weights (Optional)

If the chain has unique characteristics, adjust weights in `lib/risk-calculator.ts`:

```typescript
const CHAIN_WEIGHTS = {
  // ... existing
  42161: {  // Arbitrum
    liquidityDepth: 0.15,  // Higher weight for L2
    // ... other adjustments
  }
}
```

---

## 5.2.5 Testing Guide

### Running Test Suites

```bash
# Run multi-token test across chains
node scripts/test-multiple-tokens.js

# Run specific chain test
node test-chains.js

# Run Helius/Solana tests
node test-helius.js
```

### Test File: `test-multiple-tokens.js`

Tests 4 tokens across BSC chain with validation:

| Token | Expected Type | Expected Risk Range |
|-------|---------------|---------------------|
| MAGA (BSC) | MEME | 50-70 |
| WBNB (BSC) | UTILITY | 0-30 |
| USDT (BSC) | UTILITY | 0-40 |
| SafeMoon (BSC) | MEME | 40-80 |

**Validation Checks:**
1. Risk score within expected range
2. Confidence score ≥ 70%
3. Multiple data sources used (≥2)

### Adding New Test Tokens

```javascript
const tokens = [
  {
    name: 'New Token',
    address: '0x...',
    chainId: 1,
    plan: 'PREMIUM',
    metadata: {
      tokenSymbol: 'NEW',
      tokenName: 'New Token',
      chain: 'ETHEREUM'
    },
    expectedType: 'UTILITY',
    expectedRiskRange: [20, 40]
  }
]
```

### Manual Testing Checklist

- [ ] Token search autocomplete works
- [ ] All 6 chains scan successfully
- [ ] Risk scores match expected ranges
- [ ] AI analysis generates meaningful content
- [ ] Critical flags display correctly
- [ ] Watchlist add/remove functions
- [ ] Credit purchase completes
- [ ] Admin panel accessible with 2FA

---

## 5.2.6 Deployment Guide

### Production Build

```bash
# Create optimized production build
pnpm build

# Test production build locally
pnpm start
```

### Vercel Deployment (Recommended)

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to `main` branch

### Environment Variables for Production

Ensure all variables from `.env.local` are configured in Vercel:
- Use "Production" environment only for sensitive keys
- Enable "Preview" environment for staging

### Post-Deployment Checks

1. **Health Check**: Visit `/api/health` for status
2. **Token Scan**: Test a known token (USDC on Ethereum)
3. **Authentication**: Complete full login flow
4. **Payments**: Test with Stripe test cards
5. **Admin**: Verify 2FA access works

### Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Firebase Console**: Authentication and Firestore metrics
- **Error Tracking**: Check Vercel logs for runtime errors

---

## Appendix: Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm lint                   # Run ESLint
pnpm type-check             # TypeScript validation

# Database
node scripts/make-premium.js <userId>    # Upgrade user to PRO

# Testing
node scripts/test-multiple-tokens.js     # Run test suite
node test-chains.js                      # Chain compatibility test

# Production
pnpm build                  # Production build
pnpm start                  # Start production server
```

---

**END OF USER AND PROGRAMMER'S GUIDE**
