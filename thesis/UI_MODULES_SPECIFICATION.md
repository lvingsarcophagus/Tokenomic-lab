# 🖥️ User Interface Modules Specification - Tokenomics Lab

**Section 4.3 of Bachelor's Thesis**  
**Last Updated**: December 11, 2025

---

## 4.3 User Interface Modules

This section documents the software components comprising the user interface layer, their responsibilities, and the structural relationships between them. The frontend is built using Next.js 16 with the App Router architecture and React 19 Server/Client Components.

---

### 4.3.1 Architecture Overview

The UI follows a **hierarchical component architecture** with clear separation between:
- **Layout Components**: Define page structure and shared elements
- **Feature Components**: Implement specific functionality
- **Presentational Components**: Render UI with no business logic
- **Context Providers**: Manage global application state

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SHELL                                │
│  RootLayout (app/layout.tsx)                                            │
│  ├── AuthProvider (Authentication State)                                │
│  ├── ToastProvider (Notifications)                                      │
│  ├── ModalProvider (Dialog System)                                      │
│  └── {children} (Page Content)                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           PAGE LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Landing    │  │  Dashboard  │  │   Admin     │  │  Profile    │    │
│  │  (page.tsx) │  │ (dashboard/)│  │ (admin/)    │  │ (profile/)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Navigation: Navbar, NotificationBell, UserMenu                  │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ Token Analysis: TokenSearch, RiskOverview, MarketMetrics        │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ AI Features: AIAnalysisAccordion, CalculationBreakdown          │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ Premium: WalletConnect, CreditsManager, WatchlistPanel          │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ Admin: AdminPanel, AdminPaymentsPanel, CacheViewer              │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          UI PRIMITIVES                                   │
│  Button, Card, Input, Label, Switch, GlowingEffect, MorphingSquare     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3.2 Module Directory Structure

```
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   ├── dashboard/page.tsx            # Main user dashboard
│   ├── profile/page.tsx              # User profile management
│   ├── pricing/page.tsx              # Subscription tiers
│   ├── login/page.tsx                # Authentication
│   ├── signup/page.tsx               # Registration
│   ├── docs/page.tsx                 # Documentation
│   └── admin/
│       ├── login/page.tsx            # Admin login with 2FA
│       ├── dashboard/page.tsx        # Admin control panel
│       └── tier/page.tsx             # Tier management
│
├── components/                       # Reusable UI components
│   ├── ui/                           # Primitive components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── switch.tsx
│   ├── navbar.tsx                    # Global navigation
│   ├── token-search-cmc.tsx          # Token search
│   ├── risk-overview.tsx             # Risk display
│   └── [47 other components]
│
├── contexts/                         # React Context providers
│   └── auth-context.tsx              # Authentication state
│
├── hooks/                            # Custom React hooks
│   ├── use-modal.ts                  # Modal control
│   ├── use-user-role.ts              # Role-based access
│   ├── use-pro-features.ts           # Premium feature gates
│   └── use-x402-payment.tsx          # Payment integration
│
└── lib/                              # Utilities and services
    ├── services/                     # Business logic
    └── types/                        # TypeScript definitions
```

---

### 4.3.3 Context Providers (Global State)

#### **Table 13: Context Provider Modules**

| Provider | File | Purpose | Consumed By |
|----------|------|---------|-------------|
| `AuthProvider` | `contexts/auth-context.tsx` | User authentication, profile, tier | All authenticated pages |
| `ToastProvider` | `components/toast-provider.tsx` | Toast notifications | All components |
| `ModalProvider` | `components/modal-provider.tsx` | Custom modal dialogs | All components |

**AuthProvider State Interface:**
```typescript
interface AuthContextType {
  user: FirebaseUser | null          // Firebase auth user
  userProfile: UserProfile | null    // Firestore user document
  loading: boolean                   // Auth state loading
  error: string | null               // Auth errors
  updateProfile: (updates) => void   // Profile update function
  refreshProfile: () => void         // Force profile refresh
}
```

**Provider Hierarchy:**
```
<AuthProvider>                    ← Authentication state
  <ToastProvider />               ← Toast notifications
  <ModalProvider />               ← Modal dialogs
  <main>{children}</main>         ← Page content
</AuthProvider>
```

---

### 4.3.4 Page Modules

#### **Table 14: Page Module Specifications**

| Page | Route | Access | Description | Key Components |
|------|-------|--------|-------------|----------------|
| Landing | `/` | Public | Marketing homepage | Hero, Features, Pricing CTA |
| Dashboard | `/dashboard` | Authenticated | Main analysis interface | TokenSearch, RiskOverview, Watchlist |
| Profile | `/profile` | Authenticated | User settings | ProfileImageUpload, PersonalInfo |
| Pricing | `/pricing` | Public | Subscription plans | PricingCards, SubscriptionManager |
| Admin Login | `/admin/login` | Admin | 2FA authentication | TwoFactorVerify |
| Admin Panel | `/admin/dashboard` | Admin + 2FA | System management | AdminPanel, UsersTab, AnalyticsTab |
| Documentation | `/docs` | Public | Algorithm explanation | MarkdownRenderer |

---

### 4.3.5 Feature Component Modules

#### **4.3.5.1 Navigation Module**

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `Navbar` | `navbar.tsx` | - | Global floating navigation bar |
| `NotificationBell` | `notification-bell.tsx` | `alerts: Alert[]` | Alert indicator dropdown |
| `UserMenu` | (in navbar) | - | Profile dropdown with logout |

**Navbar Features:**
- Floating design with glassmorphism effect
- Smart scroll detection (hides on scroll down)
- Role-aware menu items (shows Admin link for admins)
- Mobile hamburger menu
- User avatar with dropdown

**Component Relationship:**
```
Navbar
├── Logo (Link to /)
├── NavLinks[] (Dashboard, Features, Docs, Pricing)
├── NotificationBell
│   └── AlertDropdown
│       └── AlertItem[]
└── UserMenu
    ├── Avatar
    └── Dropdown
        ├── Profile Link
        ├── Admin Link (if admin)
        └── Logout Button
```

---

#### **4.3.5.2 Token Analysis Module**

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `TokenSearchCMC` | `token-search-cmc.tsx` | `onTokenSelect` | CoinMarketCap search |
| `DexSearchPremium` | `dex-search-premium.tsx` | `onTokenSelect` | DexScreener search |
| `ChainSelector` | `chain-selector.tsx` | `selected, onChange` | Blockchain dropdown |
| `RiskOverview` | `risk-overview.tsx` | `riskResult` | Risk score gauge |
| `MarketMetrics` | `market-metrics.tsx` | `tokenData` | Price, volume, liquidity |
| `HolderDistribution` | `holder-distribution.tsx` | `holders` | Holder concentration chart |
| `CalculationBreakdown` | `calculation-breakdown.tsx` | `factors` | 10-factor weighted scores |
| `ChainSpecificInfo` | `chain-specific-info.tsx` | `chainData` | Solana/EVM details |
| `AIAnalysisAccordion` | `ai-analysis-accordion.tsx` | `aiSummary` | AI insights panel |

**Token Analysis Flow:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TokenSearch    │────►│  API: analyze   │────►│  RiskOverview   │
│  (User Input)   │     │  /api/analyze   │     │  (Display)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Parallel Render     │
                    ├───────────────────────┤
                    │ • MarketMetrics       │
                    │ • HolderDistribution  │
                    │ • CalculationBreakdown│
                    │ • AIAnalysisAccordion │
                    │ • ChainSpecificInfo   │
                    └───────────────────────┘
```

**RiskOverview Props Interface:**
```typescript
interface RiskOverviewProps {
  riskResult: {
    overall_risk_score: number      // 0-100
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    confidence_score: number        // 0-100
    breakdown: Record<string, number>
    critical_flags?: string[]
    meme_token?: {
      detected: boolean
      probability: number
    }
    dead_token?: {
      detected: boolean
      flags: string[]
    }
    official_token?: {
      verified: boolean
      source: string
    }
  }
}
```

---

#### **4.3.5.3 Premium Features Module**

| Component | File | Tier Required | Description |
|-----------|------|---------------|-------------|
| `WalletConnect` | `wallet-connect.tsx` | PAY-AS-YOU-GO | Solana wallet connection |
| `CreditsManager` | `credits-manager.tsx` | PAY-AS-YOU-GO | Credit balance & purchase |
| `PaymentConfirmationModal` | `payment-confirmation-modal.tsx` | PAY-AS-YOU-GO | x402 payment flow |
| `SubscriptionManager` | `subscription-manager.tsx` | PRO | Stripe subscription |
| `FeaturePreferences` | `feature-preferences.tsx` | PRO | Feature toggles |
| `WatchlistPanel` | (in dashboard) | PRO/PAY-AS-YOU-GO | Token watchlist |

**Credit Purchase Flow:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ CreditsManager  │────►│ WalletConnect   │────►│ x402 Protocol   │
│ (Select Amount) │     │ (Phantom/Solflare)    │ (Solana TX)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                            ┌─────────────────┐
                                            │ PaymentConfirm  │
                                            │ (Success/Error) │
                                            └─────────────────┘
```

---

#### **4.3.5.4 Admin Module**

| Component | File | Description |
|-----------|------|-------------|
| `AdminPanel` | `admin-panel.tsx` | Main admin container with tabs |
| `AdminPaymentsPanel` | `admin-payments-panel.tsx` | Payment transactions view |
| `AdminSmartAlertsPanel` | `admin-smart-alerts-panel.tsx` | Alert configuration |
| `CacheViewer` | `admin-cache-viewer.tsx` | Token cache management |
| `TwoFactorSetup` | `two-factor-setup.tsx` | TOTP QR code generation |
| `TwoFactorVerify` | `two-factor-verify.tsx` | TOTP code verification |

**Admin Panel Tabs:**
```
AdminPanel
├── UsersTab
│   ├── UserSearch
│   ├── UserTable
│   └── UserActions (Edit Tier, Ban, Delete)
├── AnalyticsTab
│   ├── UserGrowthChart
│   ├── ScanActivityChart
│   └── ChainUsageChart
├── PaymentsTab
│   └── AdminPaymentsPanel
├── CacheTab
│   └── CacheViewer
├── AlertsTab
│   └── AdminSmartAlertsPanel
├── LogsTab
│   └── ActivityLogsTable
└── SettingsTab
    ├── MaintenanceMode
    ├── FreeTierLimit
    └── CacheExpiration
```

---

#### **4.3.5.5 UI Primitives Module**

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `ui/button.tsx` | Styled button with variants |
| `Card` | `ui/card.tsx` | Container with glassmorphism |
| `Input` | `ui/input.tsx` | Styled text input |
| `Label` | `ui/label.tsx` | Form label |
| `Switch` | `ui/switch.tsx` | Toggle switch |
| `GlowingEffect` | `ui/glowing-effect.tsx` | Animated glow border |
| `MorphingSquare` | `ui/morphing-square.tsx` | Loading animation |

**Button Variants:**
```typescript
type ButtonVariant = 
  | 'default'    // White border, transparent bg
  | 'primary'    // Solid accent color
  | 'ghost'      // No border, subtle hover
  | 'destructive'// Red for dangerous actions
  | 'outline'    // Bordered, transparent

type ButtonSize = 'sm' | 'md' | 'lg'
```

---

### 4.3.6 Custom Hooks

#### **Table 15: Custom Hook Specifications**

| Hook | File | Purpose | Returns |
|------|------|---------|---------|
| `useAuth` | `contexts/auth-context.tsx` | Authentication access | `{ user, userProfile, loading }` |
| `useModal` | `hooks/use-modal.ts` | Modal control | `{ showModal, hideModal }` |
| `useUserRole` | `hooks/use-user-role.ts` | Role checks | `{ isFree, isPro, isAdmin, tier }` |
| `useProFeatures` | `hooks/use-pro-features.ts` | Feature gates | `{ canAccessWatchlist, canExport }` |
| `useX402Payment` | `hooks/use-x402-payment.tsx` | Payment flow | `{ initPayment, status, txHash }` |

**useUserRole Implementation:**
```typescript
export function useUserRole() {
  const { userProfile } = useAuth()
  
  return {
    isFree: userProfile?.tier === 'FREE',
    isPayAsYouGo: userProfile?.tier === 'PAY_AS_YOU_GO',
    isPro: userProfile?.tier === 'PRO',
    isAdmin: userProfile?.tier === 'ADMIN',
    tier: userProfile?.tier || 'FREE',
    credits: userProfile?.credits || 0
  }
}
```

---

### 4.3.7 Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT DEPENDENCY DIAGRAM                          │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  AuthContext │
                              │   Provider   │
                              └──────┬───────┘
                                     │ provides auth state
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
   │   Navbar    │           │  Dashboard  │           │ AdminPanel  │
   │  Component  │           │    Page     │           │    Page     │
   └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
          │                         │                         │
          │                         │ uses hooks              │ requires isAdmin
          │                         │                         │
          │                  ┌──────┴──────┐                  │
          │                  │             │                  │
          │                  ▼             ▼                  │
          │           ┌───────────┐ ┌───────────┐            │
          │           │useUserRole│ │useProFeatures          │
          │           └─────┬─────┘ └─────┬─────┘            │
          │                 │             │                   │
          │                 │ gates features                  │
          │                 ▼             ▼                   │
          │           ┌───────────────────────┐               │
          │           │   Feature Components  │               │
          │           ├───────────────────────┤               │
          │           │ TokenSearch           │               │
          │           │ RiskOverview          │               │
          │           │ CreditsManager        │◄──────────────┤
          │           │ WatchlistPanel        │               │
          │           │ AIAnalysisAccordion   │               │
          │           └───────────┬───────────┘               │
          │                       │                           │
          │                       │ uses primitives           │
          │                       ▼                           │
          │              ┌─────────────────┐                  │
          │              │  UI Primitives  │                  │
          │              │ Button, Card,   │◄─────────────────┤
          │              │ Input, Switch   │                  │
          │              └─────────────────┘                  │
          │                                                   │
          └──────────────────────┬────────────────────────────┘
                                 │
                                 │ all use
                                 ▼
                        ┌─────────────────┐
                        │   ModalProvider │
                        │   ToastProvider │
                        └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                           LEGEND                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ─────►  Uses / Imports                                                 │
│  ◄─────  Provides / Exports                                             │
│  [Box]   Component Module                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3.8 Data Flow Between Components

#### **Token Analysis Data Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TOKEN ANALYSIS DATA FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

User Input                   API Layer                    UI Components
─────────────────────────────────────────────────────────────────────────

TokenSearchCMC              /api/analyze-token           ScanResults
     │                            │                           │
     │ onTokenSelect              │                           │
     ▼                            │                           │
┌─────────────┐                   │                           │
│ Token:      │                   │                           │
│ - address   │───────────────────┼───────────────────────────┤
│ - chainId   │     POST          │                           │
│ - symbol    │                   ▼                           │
└─────────────┘            ┌─────────────┐                    │
                           │ Response:   │                    │
                           │ - riskScore │────────────────────┤
                           │ - breakdown │                    │
                           │ - aiSummary │                    ▼
                           │ - marketData│           ┌─────────────────┐
                           └─────────────┘           │ State Update:   │
                                                     │ setRiskResult() │
                                                     │ setScannedToken()
                                                     └────────┬────────┘
                                                              │
                    ┌─────────────────────────────────────────┴────────┐
                    │                                                   │
                    ▼                                                   ▼
             ┌─────────────┐                                    ┌─────────────┐
             │ RiskOverview│                                    │ MarketMetrics│
             │ Props:      │                                    │ Props:       │
             │ {riskResult}│                                    │ {tokenData}  │
             └─────────────┘                                    └─────────────┘
                    │
                    ├───────────────────────────────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
             ┌─────────────────┐                              ┌─────────────────┐
             │ HolderDistribution                             │AIAnalysisAccordion
             │ Props:          │                              │ Props:          │
             │ {holders, top10}│                              │ {aiSummary}     │
             └─────────────────┘                              └─────────────────┘
```

---

### 4.3.9 Responsive Design Specifications

#### **Table 16: Breakpoint System**

| Breakpoint | Min Width | Target Device | Layout Changes |
|------------|-----------|---------------|----------------|
| `xs` | 0px | Mobile portrait | Single column, stacked |
| `sm` | 640px | Mobile landscape | Single column |
| `md` | 768px | Tablet | 2 columns, sidebar |
| `lg` | 1024px | Desktop | 3 columns, full nav |
| `xl` | 1280px | Large desktop | Expanded spacing |
| `2xl` | 1536px | Extra large | Max content width |

#### **Responsive Patterns:**

```typescript
// Grid layout adaptation
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Navbar visibility
<nav className="hidden md:flex">  // Hidden on mobile
<button className="md:hidden">   // Hamburger on mobile

// Text scaling
<h1 className="text-xl md:text-2xl lg:text-4xl">

// Spacing adaptation
<section className="p-4 md:p-6 lg:p-8">
```

---

### 4.3.10 Design System Constants

#### **Color Palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#000000` | Page background |
| `--bg-card` | `rgba(0,0,0,0.6)` | Card backgrounds |
| `--border-default` | `rgba(255,255,255,0.1)` | Subtle borders |
| `--border-hover` | `rgba(255,255,255,0.3)` | Hover states |
| `--text-primary` | `#FFFFFF` | Primary text |
| `--text-muted` | `rgba(255,255,255,0.7)` | Secondary text |
| `--success` | `#22C55E` | LOW risk, success |
| `--warning` | `#EAB308` | MEDIUM risk, caution |
| `--error` | `#EF4444` | HIGH/CRITICAL risk |
| `--info` | `#3B82F6` | Informational |

#### **Typography:**

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | JetBrains Mono | 24-48px | 700 |
| Body | JetBrains Mono | 14-16px | 400 |
| Labels | JetBrains Mono | 12px | 500 |
| Code | JetBrains Mono | 12px | 400 |

#### **Glassmorphism Effect:**

```css
.glass-card {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

---

### 4.3.11 Figure Caption for Component Diagram

```
Figure X: User Interface Component Architecture - Tokenomics Lab

The component architecture diagram illustrates the modular structure of the 
Tokenomics Lab frontend application. The architecture follows a hierarchical 
pattern with three distinct layers: Application Shell (providers and layout), 
Page Layer (route-specific containers), and Component Layer (reusable UI modules). 

The AuthProvider serves as the central state management hub, propagating 
authentication state to all child components. Feature components like 
TokenSearch, RiskOverview, and AIAnalysisAccordion consume this state through 
custom hooks (useAuth, useUserRole, useProFeatures) to implement tier-based 
feature gating. 

The Admin module operates independently with enhanced security requirements 
(2FA verification) and accesses system-level functionality through dedicated 
components (AdminPaymentsPanel, CacheViewer). All components utilize a shared 
set of UI primitives (Button, Card, Input) ensuring visual consistency across 
the platform.

Data flows unidirectionally from API responses through parent components to 
child presentational components via props, following React's recommended 
composition pattern. The ModalProvider and ToastProvider enable cross-cutting 
concerns (dialogs and notifications) to be triggered from any component in 
the tree without prop drilling.
```

---

**END OF USER INTERFACE MODULES SPECIFICATION**
