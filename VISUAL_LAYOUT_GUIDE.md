# Visual Layout Guide - Enhanced Dashboard

## Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky top)                                            │
│  TOKEN GUARD    [SCAN TOKEN] [UPGRADE] [PROFILE] [LOGOUT]     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  ──── FREE TIER ───────────────────────────────────────────     │
│  SECURITY DASHBOARD                    [UPGRADE TO PREMIUM]     │
│  YOUR.EMAIL@EXAMPLE.COM                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  USAGE ALERT (if <= 3 scans remaining)                         │
│  ⚠️  USAGE LIMIT WARNING                                        │
│  3 SCANS REMAINING TODAY. UPGRADE FOR UNLIMITED ACCESS.         │
└─────────────────────────────────────────────────────────────────┘

┌───────────┬───────────┬───────────┬───────────┐
│ SCANS     │ WATCHLIST │ ALERTS    │ AVG RISK  │
│ 7/10      │ 3/5       │ 2         │ 42        │
│ TODAY     │ MAX 5     │ BASIC     │ AVG       │
└───────────┴───────────┴───────────┴───────────┘

┌─────────────────────────────┬─────────────────────────────┐
│  WEEKLY USAGE               │  RECENT SCANS               │
│  [Area Chart]               │  [Bar Chart]                │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DAILY LIMIT                                                    │
│  7 OF 10 SCANS USED                                      70%    │
│  [████████████████████░░░░░░░░░]                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  👑 UNLOCK PREMIUM FEATURES                [UPGRADE NOW →]      │
│  ✓ UNLIMITED TOKEN SCANS                                        │
│  ✓ ADVANCED RISK ANALYTICS                                      │
│  ✓ REAL-TIME ALERTS                                            │
│  ✓ PORTFOLIO TRACKING                                          │
│  ✓ PRIORITY SUPPORT                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ──── LATEST SCAN ANALYSIS ─────────────────────────────────    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TOKEN GUARD                            [PREMIUM BADGE]     │ │
│  │ ──────────────────────────────────────────────────────────│ │
│  │ PEPE INU  |  $420K MC  |  2 h old  |  SOLANA             │ │
│  │ ──────────────────────────────────────────────────────────│ │
│  │                                                            │ │
│  │ ┌─────────────┬─────────────┬─────────────┐              │ │
│  │ │ OVERALL RISK│ CONFIDENCE  │ FRESHNESS   │              │ │
│  │ │     29      │    94%      │  4 min ago  │              │ │
│  │ │ ████░░░░    │ ████████░   │ █████████   │              │ │
│  │ │ LOW RISK    │ PREMIUM DATA│ LIVE        │              │ │
│  │ └─────────────┴─────────────┴─────────────┘              │ │
│  │                                                            │ │
│  │ ┌────────────────────────────────────────────────────────┐│ │
│  │ │ ✓ CRITICAL FLAGS                          None 🎉     ││ │
│  │ └────────────────────────────────────────────────────────┘│ │
│  │                                                            │ │
│  │ ┌────────────────────────────────────────────────────────┐│ │
│  │ │ ─ 7-FACTOR BREAKDOWN                                   ││ │
│  │ │                                                         ││ │
│  │ │ 🛡️  Contract Security     ████░░░░  25   (verified)   ││ │
│  │ │ 💧 Supply Risk           ██░░░░░░  18   (on-chain)   ││ │
│  │ │ 👥 Whale Concentration   █░░░░░░░  10   (95% top10)  ││ │
│  │ │ 📈 Liquidity Depth       ████████  75   ($89K)       ││ │
│  │ │ 📊 Market Activity       █████░░░  48   (12 tx/h)    ││ │
│  │ │ 🔥 Burn Mechanics        ████░░░░  08   (defi)       ││ │
│  │ │ ⏰ Token Age             ███░░░░░  07   (2 h)        ││ │
│  │ └────────────────────────────────────────────────────────┘│ │
│  │                                                            │ │
│  │ ┌────────────────────────────────────────────────────────┐│ │
│  │ │ ⚠️  RED FLAGS                                          ││ │
│  │ │                                                         ││ │
│  │ │ ⚠️  Top 10 hold 95% → possible dump                    ││ │
│  │ │ ⚠️  Liquidity unlocked → rug risk                      ││ │
│  │ └────────────────────────────────────────────────────────┘│ │
│  │                                                            │ │
│  │ ┌────────────────────────────────────────────────────────┐│ │
│  │ │ ✅ POSITIVE SIGNALS                                     ││ │
│  │ │                                                         ││ │
│  │ │ ✅ LP locked 100%                                       ││ │
│  │ │ ✅ Renounced ownership                                  ││ │
│  │ │ ✅ 4 audit badges                                       ││ │
│  │ └────────────────────────────────────────────────────────┘│ │
│  │                                                            │ │
│  │ ┌────────────────────────────────────────────────────────┐│ │
│  │ │ RAW JSON DATA                                      [v] ││ │
│  │ └────────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┬───────────────┬───────────────┐
│ ⚡ SCAN TOKEN │ 🎯 WATCHLIST  │ 👑 UPGRADE    │
│ Analyze new   │ Monitor saved │ Unlock all    │
│ token security│ tokens        │ features      │
└───────────────┴───────────────┴───────────────┘
```

## Color Scheme

### Background Layers
- Base: `bg-black`
- Cards: `bg-black/60` with `border-white/20`
- Overlays: `bg-black/80` with `border-white/30`

### Risk Colors
- **Green** (`bg-green-500`): Low Risk (0-30)
- **Yellow** (`bg-yellow-500`): Medium Risk (31-60)
- **Red** (`bg-red-500`): High Risk (61-100)

### Text Hierarchy
- Primary: `text-white` (100% opacity)
- Secondary: `text-white/80` (80% opacity)
- Tertiary: `text-white/60` (60% opacity)
- Subtle: `text-white/40` (40% opacity)

### Accent Colors
- Critical/Red Flags: `text-red-400` / `text-red-500`
- Positive Signals: `text-green-400` / `text-green-500`
- Warnings: `text-yellow-400` / `text-yellow-500`

## Typography
- **Font**: Monospace (system default)
- **Sizes**:
  - Huge Numbers: `text-4xl` (36px)
  - Headers: `text-2xl` to `text-3xl` (24-30px)
  - Body: `text-sm` to `text-base` (14-16px)
  - Small: `text-xs` (12px)
  - Tiny: `text-[10px]` (10px)

## Spacing & Layout
- Container: `max-w-7xl mx-auto`
- Padding: `p-4` to `p-8` based on importance
- Gaps: `gap-4` to `gap-6` for consistent spacing
- Borders: `border` with `border-white/20` to `border-white/40`

## Interactive States
- **Hover**: `hover:border-white hover:bg-white/5`
- **Active**: Slightly darker background
- **Transitions**: `transition-all duration-200` to `duration-300`

## Icons
All from `lucide-react`:
- Shield, Crown, AlertTriangle, CheckCircle
- Activity, Users, TrendingUp, Flame, Clock
- BarChart3, Droplet, Search, Menu, LogOut

## Responsive Breakpoints
- Mobile: Default (< 768px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

## Animation
- Fade in: `animate-in fade-in`
- Slide up: `slide-in-from-bottom-4`
- Duration: `duration-500`
- Smooth transitions on all interactive elements
