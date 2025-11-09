# Dashboard Customization Guide

## Using the Detailed Token Card Component

The `DetailedTokenCard` component is now available for reuse throughout your application.

### Basic Usage

```typescript
import DetailedTokenCard from '@/components/detailed-token-card'

const tokenData = {
  name: 'Pepe Inu',
  symbol: 'PEPE',
  address: '0x123...',
  chain: 'SOLANA',
  marketCap: '$420K',
  age: '2h',
  overallRisk: 29,
  confidence: 94,
  lastUpdated: '4 min ago',
  factors: {
    contractSecurity: 25,
    supplyRisk: 18,
    whaleConcentration: 10,
    liquidityDepth: 75,
    marketActivity: 48,
    burnMechanics: 8,
    tokenAge: 7
  },
  redFlags: [
    'Top 10 hold 95% → possible dump',
    'Liquidity unlocked → rug risk'
  ],
  positiveSignals: [
    'LP locked 100%',
    'Renounced ownership',
    '4 audit badges'
  ],
  criticalFlags: [],
  rawData: { /* full analysis data */ }
}

<DetailedTokenCard token={tokenData} isPremium={true} />
```

## Integrating Real Token Data

### Step 1: Update the Data Mapping
In `app/free-dashboard/page.tsx`, update the `useEffect` that sets `selectedToken`:

```typescript
useEffect(() => {
  if (stats?.recentScans && stats.recentScans.length > 0) {
    const latest = stats.recentScans[0]
    const results = latest.results
    
    setSelectedToken({
      name: latest.tokenSymbol,
      symbol: latest.tokenSymbol,
      address: latest.tokenAddress,
      chain: latest.chainId || 'ETHEREUM',
      marketCap: formatMarketCap(results.market_data?.marketCap),
      age: calculateAge(results.token_info?.createdAt),
      overallRisk: results.overall_risk_score,
      confidence: calculateConfidence(results),
      lastUpdated: formatTimeAgo(latest.timestamp),
      factors: {
        contractSecurity: results.contract_security_score || 0,
        supplyRisk: results.supply_risk_score || 0,
        whaleConcentration: results.whale_concentration_score || 0,
        liquidityDepth: results.liquidity_score || 0,
        marketActivity: results.market_activity_score || 0,
        burnMechanics: results.burn_mechanics_score || 0,
        tokenAge: results.token_age_score || 0
      },
      redFlags: extractRedFlags(results),
      positiveSignals: extractPositiveSignals(results),
      criticalFlags: extractCriticalFlags(results),
      rawData: results
    })
  }
}, [stats])
```

### Step 2: Helper Functions
Add these helper functions to process the data:

```typescript
function formatMarketCap(cap: number): string {
  if (!cap) return 'N/A'
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(2)}K`
  return `$${cap.toFixed(2)}`
}

function calculateAge(createdAt: string | number): string {
  if (!createdAt) return 'Unknown'
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const diff = now - created
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  
  if (months > 0) return `${months}mo`
  if (days > 0) return `${days}d`
  return `${hours}h`
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function calculateConfidence(results: any): number {
  // Calculate based on data quality
  let confidence = 70 // Base confidence
  
  if (results.contract_verified) confidence += 10
  if (results.liquidity_data) confidence += 10
  if (results.holder_data) confidence += 10
  
  return Math.min(confidence, 99)
}

function extractRedFlags(results: any): string[] {
  const flags: string[] = []
  
  if (results.whale_concentration > 80) {
    flags.push(`Top 10 hold ${results.whale_concentration}% → possible dump`)
  }
  if (!results.liquidity_locked) {
    flags.push('Liquidity unlocked → rug risk')
  }
  if (results.honeypot_detected) {
    flags.push('Honeypot mechanism detected')
  }
  if (results.high_tax) {
    flags.push(`High transaction tax: ${results.tax_rate}%`)
  }
  
  return flags
}

function extractPositiveSignals(results: any): string[] {
  const signals: string[] = []
  
  if (results.liquidity_locked === 100) {
    signals.push('LP locked 100%')
  }
  if (results.ownership_renounced) {
    signals.push('Renounced ownership')
  }
  if (results.audit_count > 0) {
    signals.push(`${results.audit_count} audit badge${results.audit_count > 1 ? 's' : ''}`)
  }
  if (results.contract_verified) {
    signals.push('Contract verified')
  }
  
  return signals
}

function extractCriticalFlags(results: any): string[] {
  const critical: string[] = []
  
  if (results.is_honeypot) {
    critical.push('HONEYPOT DETECTED - Cannot sell tokens')
  }
  if (results.is_scam) {
    critical.push('KNOWN SCAM - Do not invest')
  }
  if (results.malicious_code) {
    critical.push('Malicious code detected in contract')
  }
  
  return critical
}
```

## Customizing the Visual Design

### Change Color Scheme
Update the risk color function:

```typescript
const getRiskColor = (score: number) => {
  if (score <= 30) return 'bg-blue-500'    // Change to blue
  if (score <= 60) return 'bg-orange-500'  // Change to orange
  return 'bg-red-500'                       // Keep red
}
```

### Modify Factor Icons
In `components/detailed-token-card.tsx`, update the `factorsList`:

```typescript
const factorsList = [
  { name: 'Contract Security', score: token.factors.contractSecurity, badge: 'verified', icon: ShieldCheck },
  { name: 'Supply Risk', score: token.factors.supplyRisk, badge: 'on-chain', icon: Coins },
  // Add more custom icons...
]
```

### Adjust Layout Density
Make the card more compact:

```typescript
// Change padding
<div className="border border-white/30 bg-black/60 p-4 mb-4"> // Reduced from p-6 mb-6

// Adjust spacing
<div className="space-y-2"> // Reduced from space-y-3

// Smaller text
<span className="text-[10px]"> // Reduced from text-xs
```

## Adding New Sections

### Example: Social Media Metrics

```typescript
// In DetailedTokenCard component, add after Positive Signals:

{token.socialMetrics && (
  <div className="border border-blue-500/30 bg-blue-500/5 p-6 mb-6">
    <h3 className="text-blue-400 font-mono text-lg font-bold tracking-wider mb-4 flex items-center gap-2">
      <Users className="w-5 h-5" />
      SOCIAL METRICS
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <div className="text-xs text-white/60 mb-1">TWITTER</div>
        <div className="text-lg font-bold text-white">{token.socialMetrics.twitter}</div>
      </div>
      <div>
        <div className="text-xs text-white/60 mb-1">TELEGRAM</div>
        <div className="text-lg font-bold text-white">{token.socialMetrics.telegram}</div>
      </div>
      <div>
        <div className="text-xs text-white/60 mb-1">DISCORD</div>
        <div className="text-lg font-bold text-white">{token.socialMetrics.discord}</div>
      </div>
      <div>
        <div className="text-xs text-white/60 mb-1">REDDIT</div>
        <div className="text-lg font-bold text-white">{token.socialMetrics.reddit}</div>
      </div>
    </div>
  </div>
)}
```

### Example: Historical Chart

```typescript
// Add after the main risk indicators:

{token.historicalData && (
  <div className="border border-white/20 bg-black/40 p-6 mb-6">
    <h3 className="text-white font-mono text-sm tracking-wider mb-4">
      RISK TREND (7 DAYS)
    </h3>
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={token.historicalData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
        <XAxis dataKey="date" stroke="#ffffff60" />
        <YAxis stroke="#ffffff60" />
        <Tooltip />
        <Line type="monotone" dataKey="risk" stroke="#ffffff" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}
```

## Performance Optimization

### Lazy Load Components
```typescript
import dynamic from 'next/dynamic'

const DetailedTokenCard = dynamic(() => import('@/components/detailed-token-card'), {
  loading: () => <div>Loading analysis...</div>,
  ssr: false
})
```

### Memoize Expensive Calculations
```typescript
import { useMemo } from 'react'

const processedToken = useMemo(() => {
  return {
    ...selectedToken,
    factors: calculateFactors(selectedToken.rawData),
    // other expensive operations
  }
}, [selectedToken])
```

## Testing

### Mock Data for Development
```typescript
const MOCK_TOKEN_DATA = {
  name: 'Test Token',
  symbol: 'TEST',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  chain: 'ETHEREUM',
  marketCap: '$1.2M',
  age: '5d',
  overallRisk: 42,
  confidence: 87,
  lastUpdated: '2 min ago',
  factors: {
    contractSecurity: 30,
    supplyRisk: 45,
    whaleConcentration: 60,
    liquidityDepth: 55,
    marketActivity: 40,
    burnMechanics: 20,
    tokenAge: 35
  },
  redFlags: ['High whale concentration', 'Low liquidity'],
  positiveSignals: ['Contract verified', 'Active community'],
  criticalFlags: [],
  rawData: {}
}
```

## Premium Features

### Conditional Display
```typescript
{isPremium && (
  <div className="border border-white/20 bg-black/60 p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Crown className="w-5 h-5 text-yellow-500" />
      <h3 className="text-white font-mono text-sm">PREMIUM INSIGHTS</h3>
    </div>
    {/* Premium-only content */}
  </div>
)}
```

### Upgrade Prompts for Free Users
```typescript
{!isPremium && (
  <div className="border border-white/40 bg-white/5 p-6 mb-6 blur-sm">
    <div className="text-center">
      <Lock className="w-8 h-8 text-white/60 mx-auto mb-2" />
      <p className="text-white/60 font-mono text-sm">
        UPGRADE TO VIEW ADVANCED ANALYTICS
      </p>
      <Link href="/pricing">
        <button className="mt-4 px-4 py-2 bg-white text-black font-mono text-xs">
          UNLOCK NOW
        </button>
      </Link>
    </div>
  </div>
)}
```

---

## Next Steps

1. **Test with real data**: Integrate actual scan results
2. **Add animations**: Smooth transitions for factor bars
3. **Export feature**: Allow users to download/share analysis
4. **Comparison mode**: Compare multiple tokens side-by-side
5. **Alerts integration**: Link critical flags to user alerts
6. **Mobile optimization**: Test and refine mobile experience

Your dashboard is now production-ready with a professional, comprehensive token analysis view! 🚀
