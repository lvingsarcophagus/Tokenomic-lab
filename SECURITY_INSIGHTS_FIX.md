# Security Insights Structure Fix

## Issue

Runtime error in premium dashboard:
```
TypeError: can't access property "score", security.contractSecurity is undefined
```

## Root Cause

The `/api/token/insights` endpoint was returning a flat structure:
```typescript
{
  contractVerified: true,
  ownershipRenounced: false,
  securityScore: 75
}
```

But the dashboard expected a nested structure:
```typescript
{
  contractSecurity: {
    score: 75,
    grade: 'B'
  },
  liquidityLock: {
    locked: true,
    percentage: 80
  },
  auditStatus: {
    audited: true,
    score: 85
  },
  ownership: {
    status: 'RENOUNCED',
    score: 90
  }
}
```

## Solution

Updated `app/api/token/insights/route.ts` to return the correct nested structure:

### Security Analysis Response
```typescript
{
  contractSecurity: {
    score: 0-100,        // Security score
    grade: 'A'|'B'|'C'|'D'  // Letter grade
  },
  liquidityLock: {
    locked: boolean,     // Is liquidity locked?
    percentage: 0-100    // Lock percentage
  },
  auditStatus: {
    audited: boolean,    // Is contract audited?
    score: 0-100        // Audit score
  },
  ownership: {
    status: 'RENOUNCED'|'CENTRALIZED'|'DECENTRALIZED',
    score: 0-100        // Ownership score
  },
  // Flat structure kept for backward compatibility
  contractVerified: boolean,
  ownershipRenounced: boolean,
  liquidityLocked: boolean,
  securityScore: number,
  isHoneypot: boolean,
  isMintable: boolean,
  isProxy: boolean,
  sellTax: string,
  buyTax: string
}
```

## Grade Calculation

```typescript
score >= 80 → Grade A
score >= 60 → Grade B
score >= 40 → Grade C
score < 40  → Grade D
```

## Ownership Status

```typescript
owner_address === '0x0000...' → RENOUNCED
otherwise → CENTRALIZED
```

## Testing

```bash
# Test the endpoint
curl "http://localhost:3000/api/token/insights?address=0xdac17f958d2ee523a2206206994597c13d831ec7&type=security"

# Expected response structure:
{
  "success": true,
  "data": {
    "contractSecurity": {
      "score": 75,
      "grade": "B"
    },
    "liquidityLock": {
      "locked": true,
      "percentage": 80
    },
    "auditStatus": {
      "audited": true,
      "score": 85
    },
    "ownership": {
      "status": "CENTRALIZED",
      "score": 50
    }
  }
}
```

## Status

✅ **FIXED** - Dashboard now displays security metrics without errors
