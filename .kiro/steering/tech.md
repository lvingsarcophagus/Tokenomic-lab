# Technology Stack

## Core Framework

- **Next.js 16.0.0** with App Router (React 19.2.0)
- **TypeScript 5.9.3** with strict mode enabled
- **pnpm 10.10.0** as package manager

## Frontend

- **Tailwind CSS 4.1.17** for styling with glassmorphism design patterns
- **Radix UI** for accessible component primitives
- **Framer Motion 12.23.24** for animations
- **Recharts 2.15.4** for data visualization
- **Lucide React 0.454.0** for monotone icons
- **next-themes** for dark/light mode support

## Backend & Database

- **Firebase 12.5.0** (Authentication, Firestore, Storage, Analytics)
- **firebase-admin 12.7.0** for server-side operations
- **Firestore** for real-time database with security rules

## AI & External APIs

- **Groq SDK 0.34.0** with Llama 3.3 70B for AI analysis
- **Google Generative AI 0.24.1** (Gemini) as fallback
- **Mobula API** - Primary market data source
- **Moralis API** - Transaction patterns and holder data
- **GoPlus API** - Contract security analysis
- **Helius API** - Solana-specific data
- **CoinMarketCap API** - Token search

## Form & Validation

- **React Hook Form 7.66.0** with **Zod 3.25.76** schemas
- **@hookform/resolvers 3.10.0** for validation integration

## Common Commands

```bash
# Development
pnpm dev              # Start dev server on localhost:3000

# Build & Deploy
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Testing
node test-chains.js           # Test multi-chain analysis
node test-tokens.js           # Test 5-token battle suite
node scripts/test-apis.js     # Test API integrations
node scripts/make-admin.js    # Promote user to admin
node scripts/make-premium.js  # Upgrade user to premium
```

## Environment Variables

Required in `.env.local`:

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# APIs (Server)
MOBULA_API_KEY=           # Required - market data
MORALIS_API_KEY=          # Required - transaction data
GOPLUS_API_KEY=           # Optional - security data
HELIUS_API_KEY=           # Optional - Solana data
GROQ_API_KEY=             # Required - AI analysis
COINMARKETCAP_API_KEY=    # Optional - token search
COINGECKO_API_KEY=        # Optional - fallback data

# Email Notifications
EMAIL_USER=               # Gmail SMTP user
EMAIL_PASSWORD=           # Gmail app password

# Firebase Admin (Server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## Build Configuration

- **TypeScript**: Targets ES2017, strict mode, no emit (Next.js handles compilation)
- **Next.js**: Exposes API keys via `env` config in `next.config.js`
- **Excluded from build**: `scripts/**/*` to prevent Netlify build failures
- **PostCSS**: Tailwind CSS with autoprefixer

## Key Libraries

- **class-variance-authority** + **clsx** + **tailwind-merge** for dynamic styling
- **date-fns 4.1.0** for date manipulation
- **sonner 1.7.4** for toast notifications
- **nodemailer 7.0.10** for email sending
- **three 0.181.1** for 3D generative art scenes
