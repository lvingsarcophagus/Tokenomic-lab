# Project Structure

## Directory Organization

```
token-guard/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (server-side)
│   │   ├── analyze-token/ # Main token analysis endpoint
│   │   ├── admin/         # Admin operations (set-user-role, notification-preferences)
│   │   └── user/          # User operations (watchlist, upgrade-premium)
│   ├── admin/             # Admin dashboard pages
│   ├── dashboard/         # Dashboard router (redirects based on tier)
│   ├── free-dashboard/    # Free tier dashboard
│   ├── premium/           # Premium tier pages
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── profile/
│   ├── pricing/
│   ├── scan/              # Token scanning interface
│   ├── token-search/      # Token search with CMC integration
│   ├── contact/           # Contact form (Formspree)
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
│
├── components/            # Reusable React components
│   ├── ui/               # Radix UI primitives (button, dialog, card, etc.)
│   ├── navbar.tsx        # Main navigation with glassmorphism
│   ├── token-search.tsx  # Token search component
│   ├── token-search-cmc.tsx # CoinMarketCap search integration
│   ├── risk-result.tsx   # Risk score display
│   ├── token-analysis.tsx # Analysis results display
│   ├── detailed-token-card.tsx # Token details card
│   ├── ai-analysis-accordion.tsx # AI insights accordion
│   ├── HistoricalChart.tsx # Recharts historical data
│   ├── notification-bell.tsx # Real-time notifications
│   ├── admin-panel.tsx   # Admin control panel
│   ├── chain-selector.tsx # Blockchain selector
│   ├── cookie-consent.tsx # GDPR cookie consent
│   └── toast-provider.tsx # Sonner toast notifications
│
├── contexts/              # React Context providers
│   └── auth-context.tsx  # Firebase auth + user profile state
│
├── hooks/                 # Custom React hooks
│   ├── use-pro-features.ts # Premium feature access control
│   └── use-user-role.ts   # User role checking
│
├── lib/                   # Core business logic
│   ├── api/              # External API integrations
│   │   ├── goplus.ts     # GoPlus security API
│   │   ├── moralis.ts    # Moralis blockchain data
│   │   └── helius.ts     # Helius Solana API
│   ├── ai/               # AI analysis modules
│   │   └── groq.ts       # Groq AI integration (Llama 3.3)
│   ├── apis/             # Additional API wrappers
│   ├── data/             # Data fetching layer
│   │   └── chain-adaptive-fetcher.ts # Unified multi-chain data fetcher
│   ├── risk-algorithms/  # Risk calculation engines
│   │   ├── enhanced-risk-calculator.ts # 7-factor algorithm
│   │   └── multi-chain-enhanced-calculator.ts # Multi-chain support
│   ├── risk-engine/      # Risk scoring utilities
│   ├── risk-factors/     # Individual risk factor calculations
│   │   └── weights.ts    # Chain-adaptive weight profiles
│   ├── services/         # Database services
│   │   └── firestore-admin-service.ts # Firestore operations
│   ├── twitter/          # Twitter API integration
│   ├── types/            # TypeScript type definitions
│   │   └── token-data.ts # Core data types
│   ├── firebase.ts       # Firebase client initialization
│   ├── firebase-admin.ts # Firebase admin SDK
│   ├── firebase-analytics.ts # Analytics events
│   ├── firestore-schema.ts # Firestore type definitions
│   ├── risk-calculator.ts # Main 10-factor risk algorithm
│   ├── chain-detector.ts # Chain identification
│   ├── tokenomics-cache.ts # Token data caching
│   ├── rate-limit.ts     # API rate limiting
│   ├── notifications.ts  # Toast notification utilities
│   ├── email-notifications.ts # Email sending (nodemailer)
│   ├── admin-setup.ts    # Admin initialization
│   └── utils.ts          # Utility functions
│
├── scripts/               # Utility scripts (excluded from build)
│   ├── make-admin.js     # Promote user to admin
│   ├── make-premium.js   # Upgrade user to premium
│   ├── test-apis.js      # Test API integrations
│   ├── test-multiple-tokens.js # Multi-token testing
│   └── debug-mobula.js   # Debug Mobula API
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── QUICK_START.md    # Getting started guide
│   ├── TESTING_GUIDE.md  # Testing instructions
│   ├── ADMIN_SETUP.md    # Admin configuration
│   └── TOKEN_GUARD_PRO_DOCUMENTATION.md # Full docs
│
├── public/                # Static assets
│   ├── Logo.png          # Main logo
│   └── logo-alt.png      # Alternative logo
│
├── .kiro/                 # Kiro AI configuration
│   └── steering/         # AI steering rules
│
├── test-chains.js         # Multi-chain test suite
├── test-tokens.js         # Token battle test (PEPE, BONK, etc.)
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── package.json           # Dependencies
└── .env.local            # Environment variables (not in git)
```

## Key Architectural Patterns

### API Route Structure
- All API routes in `app/api/` follow Next.js 13+ conventions
- Use `NextRequest` and `NextResponse` for type safety
- Rate limiting applied to FREE tier users
- Firebase Admin SDK for server-side Firestore operations

### Component Conventions
- Client components use `"use client"` directive
- Server components by default (no directive needed)
- Radix UI components in `components/ui/` folder
- Glassmorphism styling: `bg-black/40 backdrop-blur-xl border border-white/10`
- Monotone icons from Lucide React (no colorful emojis)

### Data Flow
1. User input → API route (`app/api/analyze-token/route.ts`)
2. Unified fetcher → External APIs (Mobula, Moralis, GoPlus)
3. Risk calculator → 10-factor algorithm with AI enhancement
4. Result → Firestore (if authenticated) + Client response
5. Client → Display with Recharts visualization

### State Management
- **Global**: AuthContext for user authentication and profile
- **Local**: React useState/useEffect for component state
- **Server**: Firestore for persistent data
- **Cache**: In-memory tokenomics cache for performance

### Firestore Collections
```
users/{userId}                           # User profiles
watchlist/{userId}/tokens/{address}      # Personal watchlists
alerts/{userId}/notifications/{alertId}  # Premium alerts
analysis_history/{userId}/scans/{scanId} # Scan history
admin_notification_preferences/{userId}  # Admin settings
```

### Security Rules
- Firestore security rules in `firestore.rules`
- User can only access their own data
- Premium features gated by `tier === 'pro'`
- Admin features gated by `role === 'admin'`

## File Naming Conventions

- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx`
- **API Routes**: `route.ts`
- **Components**: `kebab-case.tsx` (e.g., `token-search.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `risk-calculator.ts`)
- **Types**: `PascalCase` interfaces/types in `.ts` files
- **Constants**: `SCREAMING_SNAKE_CASE`

## Import Aliases

Use `@/` for absolute imports from project root:
```typescript
import { calculateRisk } from '@/lib/risk-calculator'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
```
