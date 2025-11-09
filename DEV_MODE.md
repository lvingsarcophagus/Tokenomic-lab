# 🔧 Developer Mode Guide

Developer mode allows you to test both **Free** and **Premium** tier features without authentication or rate limiting.

## Quick Start

### 1. Enable Developer Mode

Create or update `.env.local` in the project root:

```bash
# Enable developer mode
NEXT_PUBLIC_DEV_MODE=true

# Set default plan (FREE or PREMIUM)
NEXT_PUBLIC_DEV_DEFAULT_PLAN=PREMIUM

# Bypass rate limiting
NEXT_PUBLIC_DEV_BYPASS_RATE_LIMIT=true
```

### 2. Restart Development Server

```bash
npm run dev
# or
pnpm dev
```

### 3. Use the Developer Toggle

When dev mode is enabled, you'll see a **yellow floating panel** in the bottom-right corner with controls to:
- Switch between **FREE** and **PREMIUM** plans
- Toggle rate limiting on/off
- View current dev mode status

## Features

### 🎯 What Developer Mode Does

✅ **Bypasses Authentication** - No login required  
✅ **Mock User ID** - Uses `dev-user-12345` automatically  
✅ **Plan Switching** - Test both FREE and PREMIUM algorithms  
✅ **Rate Limit Control** - Enable/disable 10 queries/day limit  
✅ **API Debugging** - Response includes `dev_mode` metadata  

### 🆓 Free Plan Testing

**Algorithm**: 3-factor basic analysis
- Security Risk (40%)
- Liquidity Risk (35%)
- Holder Concentration (25%)

**Rate Limit**: 10 queries/day (can be bypassed)

**Response Format**:
```json
{
  "success": true,
  "plan": "FREE",
  "data": {
    "overall_risk_score": 65,
    "risk_level": "medium",
    "breakdown": { ... },
    "upgrade_prompt": "..."
  },
  "dev_mode": {
    "enabled": true,
    "plan": "FREE",
    "bypassRateLimit": true,
    "userId": "dev-user-12345"
  }
}
```

### 💎 Premium Plan Testing

**Algorithm**: 10-factor advanced tokenomics
- Supply Economics (18%)
- Token Distribution (15%)
- Vesting Schedules (13%)
- Utility & Demand (12%)
- Liquidity Depth (10%)
- Market Valuation (9%)
- Transfer Network (9%)
- Time-Based Behavior (7%)
- Contract Security (5%)
- Social Activity (2%)

**Rate Limit**: Unlimited

**Response Format**:
```json
{
  "success": true,
  "plan": "PREMIUM",
  "data": {
    "overall_risk_score": 42,
    "risk_level": "low",
    "confidence_score": 87,
    "detailed_insights": [ ... ],
    "upcoming_risks": { ... },
    "scam_probability": 15
  },
  "dev_mode": { ... }
}
```

## API Testing

### Using the Analyze Token Endpoint

```bash
# Test with PREMIUM plan
curl -X POST http://localhost:3000/api/analyze-token \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "chainId": "1",
    "userId": "dev-user",
    "devPlan": "PREMIUM"
  }'

# Test with FREE plan
curl -X POST http://localhost:3000/api/analyze-token \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "chainId": "1",
    "userId": "dev-user",
    "devPlan": "FREE"
  }'
```

### Request Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `tokenAddress` | ✅ Yes | Token contract address or symbol |
| `chainId` | ✅ Yes | Blockchain ID (1=Ethereum, 56=BSC, etc.) |
| `userId` | ⚠️ Optional in dev mode | User identifier |
| `devPlan` | ⚠️ Optional | Override plan: "FREE" or "PREMIUM" |

## Frontend Integration

### Using Dev Settings in Components

```tsx
import { getDevSettings } from '@/components/dev-mode-toggle'

function TokenAnalysis() {
  const handleAnalyze = async (tokenAddress: string) => {
    const devSettings = getDevSettings()
    
    const response = await fetch('/api/analyze-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenAddress,
        chainId: '1',
        userId: 'dev-user',
        devPlan: devSettings?.plan // Uses dev mode plan
      })
    })
    
    const result = await response.json()
    console.log(result)
  }
  
  return <button onClick={() => handleAnalyze('USDT')}>Analyze</button>
}
```

## Environment Variables

### Complete Configuration

```bash
# ===========================================
# DEVELOPER MODE
# ===========================================
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DEV_DEFAULT_PLAN=PREMIUM
NEXT_PUBLIC_DEV_BYPASS_RATE_LIMIT=true

# ===========================================
# API KEYS
# ===========================================
MOBULA_API_KEY=your_key_here
COINMARKETCAP_API_KEY=your_key_here
COINGECKO_API_KEY=your_key_here

# ===========================================
# FIREBASE
# ===========================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=app_id
```

## Debugging

### Check Dev Mode Status

The API response includes dev mode metadata when enabled:

```json
{
  "dev_mode": {
    "enabled": true,
    "plan": "PREMIUM",
    "bypassRateLimit": true,
    "userId": "dev-user-12345"
  }
}
```

### Console Logs

When dev mode is active, you'll see:
```
🔧 DEV MODE: Using PREMIUM plan
🔧 DEV MODE: Rate limiting bypassed
```

## Production

### ⚠️ Disabling for Production

**IMPORTANT**: Always disable dev mode before deploying:

```bash
# Remove or set to false
NEXT_PUBLIC_DEV_MODE=false
```

Or remove the variable entirely from `.env.local`.

## Troubleshooting

### Dev Mode Not Showing

1. Check `.env.local` has `NEXT_PUBLIC_DEV_MODE=true`
2. Restart the development server
3. Clear browser cache
4. Check browser console for errors

### Rate Limiting Still Active

1. Ensure `NEXT_PUBLIC_DEV_BYPASS_RATE_LIMIT=true`
2. Toggle "Bypass Rate Limit" ON in the dev panel
3. Check localStorage has saved the setting

### API Returns 400 Error

Make sure you're sending required fields:
- `tokenAddress` ✅
- `chainId` ✅
- `userId` (optional in dev mode)

## Security

Developer mode should **ONLY** be used in development environments:
- ❌ Never enable in production
- ❌ Never commit `.env.local` to Git
- ✅ Use `.env.local.example` as a template
- ✅ Add `.env.local` to `.gitignore`

---

**Happy Testing! 🚀**
