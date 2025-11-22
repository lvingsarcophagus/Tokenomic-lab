# Data Sources UI & API Testing

## ✅ What Was Added

### 1. **Data Sources Panel in UI**
Added a prominent panel showing exactly which APIs are used for each chain's risk calculation.

#### For Solana Tokens
```
DATA SOURCES FOR CALCULATION
├─ Market Data: Mobula API
├─ Holder Data: Helius RPC
├─ Transaction Data: Helius Enhanced API
├─ Security Check: Helius Metadata + Authorities
└─ AI Classification: Groq (Llama 3.3 70B)
```

#### For EVM Tokens (Ethereum, BSC, Polygon, etc.)
```
DATA SOURCES FOR CALCULATION
├─ Market Data: Mobula API
├─ Holder Data: GoPlus Security
├─ Transaction Data: Moralis API
├─ Security Check: GoPlus + Contract Verification
└─ AI Classification: Groq (Llama 3.3 70B)
```

### 2. **API Testing Script**
Created `scripts/test-api-data-sources.js` to verify all APIs are working correctly.

## 📊 Data Sources Breakdown

### Universal (All Chains)
- **Mobula API**: Market cap, liquidity, volume, price
- **Groq AI**: Token classification (MEME vs UTILITY)

### EVM Chains (Ethereum, BSC, Polygon, Avalanche)
- **GoPlus Security**: 
  - Holder count and distribution
  - Contract security (ownership, proxy, honeypot)
  - Tax/fee detection
- **Moralis API**:
  - Transaction history
  - Token metadata
  - Transfer events

### Solana
- **Helius RPC**:
  - Top token holders
  - Holder concentration
- **Helius Enhanced API**:
  - Transaction count (24h)
  - Unique traders
  - Recent activity
- **Helius Metadata API**:
  - Token name, symbol, decimals
  - Mint authority status
  - Freeze authority status
  - Update authority status

## 🧪 Testing Script Usage

### Run the Test
```bash
node scripts/test-api-data-sources.js
```

### What It Tests

#### Ethereum Token (SHIB)
1. ✅ Mobula API - Market data
2. ✅ GoPlus API - Security and holders
3. ✅ Moralis API - Transaction history

#### Solana Token (Jupiter)
1. ✅ Mobula API - Market data
2. ✅ Helius Metadata - Token info
3. ✅ Helius RPC - Holder data

#### AI Classification
1. ✅ Groq API - Token classification

### Expected Output
```
🧪 TOKENOMICS LAB - API DATA SOURCES TEST

============================================================
ETHEREUM TOKEN TEST (SHIB)
============================================================
✓ Mobula API
  Market Cap: $5,234.56M, Liquidity: $123.45K, Volume 24h: $234.56M
✓ GoPlus API
  Holders: 1234567, Owner: Renounced, Honeypot: NO
✓ Moralis API
  Recent transfers: 10

============================================================
SOLANA TOKEN TEST (Jupiter)
============================================================
✓ Mobula API
  Market Cap: $812.34M, Liquidity: $817.59K, Volume 24h: $4.35M
✓ Helius Metadata
  Name: Jupiter, Symbol: JUP
✓ Helius RPC
  Top holders: 20

============================================================
AI CLASSIFICATION TEST
============================================================
✓ Groq AI
  Classification: MEME_TOKEN

============================================================
TEST SUMMARY
============================================================

Ethereum Data Sources:
  ✓ Mobula: Working
  ✓ GoPlus: Working
  ✓ Moralis: Working

Solana Data Sources:
  ✓ Mobula: Working
  ✓ Helius: Working

Data Completeness Check:
  ✓ Ethereum: All required data available
    - Market Cap: $5,234.56M
    - Liquidity: $123.45K
    - Holders: 1234567
  ✓ Solana: All required data available
    - Market Cap: $812.34M
    - Liquidity: $817.59K
    - Top Holders: 20

✅ Test complete!
```

## 🎯 What Each API Provides for Risk Calculation

### 1. Supply Dilution Factor
**Data Needed**: FDV, Market Cap
**Source**: Mobula API
```json
{
  "market_cap": 812000000,
  "fdv": 1767877759,
  "circulating_supply": 3211652103,
  "total_supply": 6999009955
}
```

### 2. Holder Concentration Factor
**Data Needed**: Top 10 holders percentage
**Source**: 
- EVM: GoPlus API
- Solana: Helius RPC
```json
// EVM (GoPlus)
{
  "holder_count": "1234567",
  "lp_holder_count": "123"
}

// Solana (Helius)
{
  "result": {
    "value": [
      { "address": "...", "amount": "1000000" },
      // ... top 20 holders
    ]
  }
}
```

### 3. Liquidity Depth Factor
**Data Needed**: Market Cap, Liquidity USD
**Source**: Mobula API
```json
{
  "market_cap": 812000000,
  "liquidity": 817590
}
```

### 4. Contract/Program Control Factor
**Data Needed**: Ownership status, authorities
**Source**:
- EVM: GoPlus API
- Solana: Helius Metadata
```json
// EVM (GoPlus)
{
  "owner_address": null, // null = renounced
  "is_proxy": "0"
}

// Solana (Helius)
{
  "mintAuthority": null, // null = revoked
  "freezeAuthority": null,
  "updateAuthority": "..."
}
```

### 5. Tax/Fee Factor (EVM Only)
**Data Needed**: Buy tax, sell tax
**Source**: GoPlus API
```json
{
  "buy_tax": "0.05", // 5%
  "sell_tax": "0.05",
  "is_honeypot": "0"
}
```

### 6. Adoption Factor
**Data Needed**: Transaction count, volume
**Source**: 
- EVM: Moralis API
- Solana: Helius Enhanced API
```json
// EVM (Moralis)
{
  "result": [
    { "block_timestamp": "...", "value": "..." },
    // ... recent transfers
  ]
}

// Solana (Helius)
{
  "transactions": {
    "count24h": 95,
    "uniqueTraders24h": 42
  }
}
```

## 🔍 Troubleshooting

### If APIs Fail

#### Mobula API
```bash
# Check if API key is set
echo $MOBULA_API_KEY

# Test manually
curl -H "Authorization: YOUR_KEY" \
  "https://api.mobula.io/api/1/market/data?asset=0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"
```

#### GoPlus API (No key needed)
```bash
curl "https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"
```

#### Helius API
```bash
# Check if API key is set
echo $HELIUS_API_KEY

# Test metadata
curl -X POST "https://api.helius.xyz/v0/token-metadata?api-key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mintAccounts":["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"]}'
```

#### Moralis API
```bash
# Check if API key is set
echo $MORALIS_API_KEY

# Test transfers
curl -H "X-API-Key: YOUR_KEY" \
  "https://deep-index.moralis.io/api/v2/erc20/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/transfers?chain=eth&limit=10"
```

### Common Issues

#### 1. Rate Limiting
**Symptom**: HTTP 429 errors
**Solution**: 
- Mobula: Upgrade plan or reduce requests
- Helius: Use pagination, add delays
- Moralis: Upgrade plan

#### 2. Missing Data
**Symptom**: Empty responses or null values
**Solution**:
- Check token address is correct
- Verify token exists on that chain
- Some new tokens may not have data yet

#### 3. API Key Issues
**Symptom**: HTTP 401/403 errors
**Solution**:
- Verify API key in `.env.local`
- Check key hasn't expired
- Ensure key has correct permissions

## 📱 UI Features

### Data Sources Panel
- **Location**: Below token header, above risk factors
- **Color**: Cyan border and background
- **Adaptive**: Shows different sources for EVM vs Solana
- **Always Visible**: Displayed for every scanned token

### Visual Indicators
```
┌─────────────────────────────────────────┐
│ 🗄️ DATA SOURCES FOR CALCULATION        │
├─────────────────────────────────────────┤
│ Market Data:        Mobula API          │
│ Holder Data:        Helius RPC          │
│ Transaction Data:   Helius Enhanced API │
│ Security Check:     Helius Metadata     │
│ AI Classification:  Groq (Llama 3.3)    │
└─────────────────────────────────────────┘
```

## 🎨 Implementation Details

### Component Structure
```typescript
{/* Data Sources Panel */}
<div className="border border-cyan-500/30 bg-cyan-500/5 p-4 mb-6">
  <h3 className="text-cyan-400 font-mono text-xs">
    <Database className="w-4 h-4" />
    DATA SOURCES FOR CALCULATION
  </h3>
  
  {selectedChain === 'solana' ? (
    // Solana sources
  ) : (
    // EVM sources
  )}
</div>
```

### Chain Detection
```typescript
const isSolana = selectedChain === 'solana'
const isEVM = ['ethereum', 'bsc', 'polygon', 'avalanche'].includes(selectedChain)
```

## 📊 Data Quality Indicators

The system tracks data quality based on what's available:

### EXCELLENT
- All APIs returned data
- Real holder counts (not estimated)
- Recent transaction data
- Verified security info

### GOOD
- Most APIs returned data
- Some estimated values
- Reasonable data freshness

### MODERATE
- Limited API responses
- Many estimated values
- Older data

### POOR
- Most APIs failed
- Heavily estimated data
- Missing critical info

## 🚀 Next Steps

### Recommended Tests
1. **Run the test script** to verify all APIs
2. **Scan Ethereum token** (e.g., SHIB, PEPE)
3. **Scan Solana token** (e.g., JUP, BONK)
4. **Check data sources panel** appears correctly
5. **Verify risk factors** match data sources

### If Tests Fail
1. Check `.env.local` has all API keys
2. Verify API keys are valid
3. Check network connectivity
4. Review API rate limits
5. Check console logs for errors

## ✨ Summary

**What Changed**:
- Added visible data sources panel in UI
- Created comprehensive API testing script
- Shows exactly which APIs are used per chain

**Why It Matters**:
- Users see transparency in data sources
- Developers can verify APIs are working
- Easy to debug data issues

**Result**: Full transparency and testability! 🎉
