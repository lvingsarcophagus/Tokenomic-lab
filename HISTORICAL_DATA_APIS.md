# 📊 Historical Data API Integration Plan

**Date**: November 9, 2025  
**Status**: Planning comprehensive historical data sources

## Current Implementation Status

### ✅ **What's Currently Working**

**API Endpoints:**
- `/api/token/history` - 6 chart types (risk, price, holders, volume, transactions, whales)
- `/api/token/insights` - 3 insight types (sentiment, security, holders)

**Data Sources Active:**
1. **Firestore** - Risk scores, transaction counts from scan history
2. **Mobula API** - Price history, volume history, market data
3. **Moralis API (cached)** - Holder counts

**Current Data Flow:**
```
Premium Dashboard
    ↓
/api/token/history?address=X&type=price&timeframe=30D
    ↓
Mobula: market/history → price/volume arrays
Firestore: scans collection → risk scores by date
Moralis cache → holder counts over time
    ↓
Frontend: Recharts visualization
```

### ⚠️ **Current Limitations**

1. **Price History**: Only Mobula (need CoinGecko fallback for better coverage)
2. **Holder History**: No direct API - reconstructed from transfer events
3. **Liquidity History**: Not implemented yet
4. **Token Age**: Missing from all tokens (shows "unknown")
5. **Volume Accuracy**: Single source (Mobula) - need cross-verification

---

## 🎯 Recommended API Stack (Based on Your Research)

### **Tier 1: Essential Real-Time Data**

#### **1. CoinGecko API** ⭐ PRIMARY FOR CHARTS
**Purpose**: Historical price, market cap, volume  
**Endpoints to Use:**
```
GET /coins/{id}/market_chart
  - Parameters: vs_currency=usd, days=7/30/90/365
  - Returns: price[], market_caps[], total_volumes[]
  - Rate Limit: 10-50 calls/min (FREE tier)

GET /coins/{id}/ohlc
  - Candlestick data (Open, High, Low, Close)
  - For advanced trading charts
  - Days: 1/7/14/30/90/180/365
```

**Integration Priority**: HIGH  
**Status**: Not yet integrated  
**Use Cases**:
- Price history charts (7D/30D/90D/1Y)
- Market cap trends
- Volume verification (cross-check with Mobula)

**Token ID Resolution**:
```javascript
// Need to map contract addresses to CoinGecko IDs
const addressToId = {
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'uniswap',
  '0x514910771AF9Ca656af840dff83E8264EcF986CA': 'chainlink',
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'weth'
}

// Or use: GET /coins/{chain}/contract/{address}
```

---

#### **2. Mobula API** 🔥 CURRENT + BACKUP
**Purpose**: Multi-chain market data, liquidity history  
**Current Status**: ✅ ACTIVE (market/data endpoint)  
**Additional Endpoints to Add:**
```
GET /api/1/market/history
  - Historical price, volume, market cap
  - Better for new/obscure tokens than CoinGecko
  - Liquidity history (unique feature!)

GET /api/1/market/multi-data
  - Batch fetch multiple tokens
  - Efficient for portfolio tracking
```

**Integration Priority**: MEDIUM (expand existing integration)  
**Use Cases**:
- Backup when CoinGecko doesn't have token
- Liquidity depth charts (UNIQUE - CoinGecko doesn't provide)
- New token discovery (faster listing than CoinGecko)

---

#### **3. DexScreener API** 📈 REAL-TIME DEX DATA
**Purpose**: Multi-DEX aggregated data, new token tracking  
**Endpoints:**
```
GET /latest/dex/tokens/{tokenAddress}
  - Returns all DEX pools for a token
  - Price, volume (h24, h6, h1, m5)
  - Liquidity {usd, base, quote}
  - priceChange percentages

GET /latest/dex/pairs/{pairAddress}
  - Specific pool data with history
```

**Rate Limit**: 300 requests/minute (NO API KEY!)  
**Integration Priority**: HIGH  
**Status**: Not yet integrated  
**Use Cases**:
- Real-time liquidity monitoring
- Multi-DEX volume aggregation
- 5min/1h/6h/24h price changes
- Early detection of new tokens

---

### **Tier 2: Advanced Analytics**

#### **4. Moralis API** 🎯 CURRENT + EXPAND
**Current Status**: ✅ ACTIVE (holder history, tx patterns)  
**Current Implementation**:
```typescript
// Already using:
getMoralisHolderHistory() // Fetches holder changes over time
getMoralisTransactionPatterns() // Unique buyers/sellers
getMoralisAverageHolderAge() // Wallet age analysis
```

**Additional Endpoints to Add:**
```
GET /{address}/erc20/transfers
  - All token transfer events
  - Build holder count history from transfers
  - Calculate holder velocity

GET /erc20/{address}/owners
  - Current holder list
  - Top holder analysis
  - Distribution metrics
```

**Integration Priority**: MEDIUM (expand behavioral data)  
**Use Cases**:
- Reconstruct historical holder count (no direct API)
- Holder distribution over time
- Whale wallet tracking
- Transfer pattern analysis

---

#### **5. The Graph Protocol** 🌐 DEX-SPECIFIC DATA
**Purpose**: Uniswap, SushiSwap, PancakeSwap pool history  
**Status**: Not yet integrated  
**GraphQL Queries:**
```graphql
# Uniswap V3 pool hourly data (last 7 days)
{
  pool(id: "0x...") {
    poolHourData(first: 168, orderBy: periodStartUnix, orderDirection: desc) {
      periodStartUnix
      liquidity
      volumeUSD
      close
      token0Price
      token1Price
    }
  }
}
```

**Integration Priority**: LOW (Nice to have)  
**Rate Limit**: ~1000 queries/day (FREE, decentralized)  
**Use Cases**:
- DEX-specific liquidity depth charts
- Trading volume per pool
- Impermanent loss calculations
- Pool fee tracking

---

### **Tier 3: Research & Compliance**

#### **6. Dune Analytics API** 📊 CUSTOM QUERIES
**Purpose**: Custom blockchain data analysis  
**Status**: Not yet integrated  
**Example Queries:**
```sql
-- Holder count per day (last 30 days)
SELECT 
  DATE(block_timestamp) as date,
  COUNT(DISTINCT holder_address) as holder_count
FROM ethereum.token_transfers
WHERE token_address = '0x...'
  AND block_timestamp > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;

-- Liquidity pool changes
SELECT 
  DATE(evt_block_time) as date,
  AVG(reserve0) as avg_reserve0,
  AVG(reserve1) as avg_reserve1
FROM uniswap_v2."Pair_evt_Sync"
WHERE pair = '0x...'
GROUP BY date;
```

**Integration Priority**: LOW (expensive, slow)  
**Pricing**: FREE tier = 25 execution credits/month  
**Use Cases**:
- Deep dive research on specific tokens
- Custom metrics not available in standard APIs
- Regulatory compliance reporting
- Historical snapshots at specific blocks

---

## 🏗️ Implementation Roadmap

### **Phase 1: Enhance Current APIs** (Week 1)

**Priority: HIGH**

1. **Add CoinGecko Integration**
   ```typescript
   // lib/api/coingecko.ts
   export async function getCoinGeckoPriceHistory(tokenId: string, days: number) {
     const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`
     const response = await fetch(url)
     const data = await response.json()
     return {
       prices: data.prices.map(([timestamp, price]) => ({
         date: new Date(timestamp),
         price
       })),
       volumes: data.total_volumes.map(([timestamp, volume]) => ({
         date: new Date(timestamp),
         volume
       })),
       marketCaps: data.market_caps.map(([timestamp, cap]) => ({
         date: new Date(timestamp),
         marketCap: cap
       }))
     }
   }
   ```

2. **Add DexScreener Integration**
   ```typescript
   // lib/api/dexscreener.ts
   export async function getDexScreenerData(tokenAddress: string) {
     const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
     const response = await fetch(url)
     const data = await response.json()
     return {
       pairs: data.pairs.map(pair => ({
         dex: pair.dexId,
         price: pair.priceUsd,
         liquidity: pair.liquidity.usd,
         volume24h: pair.volume.h24,
         priceChange24h: pair.priceChange.h24
       }))
     }
   }
   ```

3. **Update `/api/token/history` Route**
   - Add fallback chain: Mobula → CoinGecko → DexScreener
   - Cross-verify volume data from multiple sources
   - Return data source in response

### **Phase 2: Liquidity Tracking** (Week 2)

**Priority: MEDIUM**

1. **Add Liquidity History Endpoint**
   ```typescript
   // app/api/token/liquidity/route.ts
   export async function GET(req: NextRequest) {
     const { address, timeframe } = req.nextUrl.searchParams
     
     // Primary: Mobula (has liquidity_history)
     const mobulaLiquidity = await getMobulaLiquidityHistory(address, timeframe)
     
     // Backup: DexScreener (current liquidity only)
     const dexLiquidity = await getDexScreenerLiquidity(address)
     
     // Combine and return
     return NextResponse.json({
       success: true,
       data: mobulaLiquidity || [{ date: new Date(), liquidity: dexLiquidity }]
     })
   }
   ```

2. **Add Liquidity Chart to Premium Dashboard**
   - New card in premium/dashboard
   - AreaChart with liquidity USD over time
   - Alert when liquidity drops >20% in 24h

### **Phase 3: Token Age Detection** (Week 2)

**Priority: HIGH (affects risk scoring)**

1. **Add Blockchain Contract Creation Detection**
   ```typescript
   // lib/api/contract-age.ts
   export async function getContractCreationDate(address: string, chainId: string) {
     // Option 1: Etherscan API
     const etherscanKey = process.env.ETHERSCAN_API_KEY
     const url = `https://api.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${etherscanKey}`
     
     // Option 2: Moralis getDateCreated
     const moralisData = await getMoralisTokenMetadata(address, chainId)
     return moralisData.block_timestamp // Contract creation timestamp
     
     // Calculate age in days
     const ageMs = Date.now() - creationTimestamp
     const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
     return ageDays
   }
   ```

2. **Update Risk Calculator**
   - Fix "Token age unknown" warning
   - Improve tokenAge factor scoring

### **Phase 4: Holder Distribution Timeline** (Week 3)

**Priority: MEDIUM**

1. **Build Transfer Event Tracker**
   ```typescript
   // lib/api/holder-tracker.ts
   export async function buildHolderHistory(tokenAddress: string, chainId: string) {
     // Fetch all transfers (Moralis or Etherscan)
     const transfers = await getMoralisTransfers(tokenAddress, chainId)
     
     // Group by day and calculate net holder changes
     const holdersByDay = {}
     const holders = new Set()
     
     transfers.forEach(tx => {
       const day = getDay(tx.timestamp)
       if (tx.to !== '0x000...') holders.add(tx.to)
       if (tx.from !== '0x000...') holders.add(tx.from)
       holdersByDay[day] = holders.size
     })
     
     // Cache results in Firestore (expensive computation)
     await cacheHolderHistory(tokenAddress, holdersByDay)
     return holdersByDay
   }
   ```

2. **Update Holder Chart**
   - Use cached holder history
   - Rebuild on demand (button to refresh)
   - Show "Building holder history..." loading state

### **Phase 5: Advanced Charting** (Week 4)

**Priority**: LOW (Nice to have)

1. **Add OHLC Candlestick Charts**
   - Use CoinGecko `/ohlc` endpoint
   - TradingView Lightweight Charts library
   - Premium feature for PREMIUM users

2. **Add The Graph Integration**
   - Uniswap V3 pool-specific data
   - SushiSwap pool analytics
   - Separate "Pool Analytics" section

---

## 📊 Data Quality Matrix

| Metric | Primary Source | Backup Source | Accuracy | Latency |
|--------|---------------|---------------|----------|---------|
| **Price History** | CoinGecko | Mobula | 99% | 5-15 min |
| **Volume 24h** | CoinGecko | Mobula + DexScreener | 95% | 5-15 min |
| **Market Cap** | CoinGecko | Mobula | 99% | 5-15 min |
| **Liquidity** | Mobula | DexScreener | 90% | 1-5 min |
| **Holder Count** | GoPlus | Moralis (transfers) | 85% | 30 min |
| **Holder History** | Moralis (transfers) | Manual tracking | 80% | 1 hour |
| **Transaction Count** | Moralis | Firestore cache | 90% | 5 min |
| **Token Age** | Etherscan | Moralis metadata | 99% | N/A |

---

## 💰 API Cost Analysis

### **Free Tier Limits**

| API | Free Tier | Cost When Exceeded |
|-----|-----------|-------------------|
| **CoinGecko** | 10-50 calls/min | $129/month (Pro) |
| **Mobula** | Generous (undisclosed) | Contact for pricing |
| **DexScreener** | 300 calls/min | FREE (no paid tier) |
| **Moralis** | 40,000 compute units/month | $49/month (Pro) |
| **The Graph** | 1000 queries/day | FREE (decentralized) |
| **Dune Analytics** | 25 executions/month | $390/month (Plus) |

### **Estimated Monthly Usage (Premium Dashboard)**

**Assumptions**:
- 1000 active premium users
- 10 token scans per user per day
- 5 chart views per scan

**API Calls per Month**:
- CoinGecko: 1000 * 10 * 5 * 30 = 1,500,000 calls/month → **Need Pro ($129/month)**
- Mobula: Same as CoinGecko → **Within free tier (likely)**
- DexScreener: 300 calls/min = 12,960,000 calls/month → **FREE**
- Moralis: 1000 * 10 * 2 * 30 = 600,000 calls → **Need Pro ($49/month)**

**Total Additional Cost**: $178/month for 1000 premium users

---

## 🚀 Quick Wins (Implement First)

### **1. Add CoinGecko Price Charts** (2 hours)
- Create `lib/api/coingecko.ts`
- Update `/api/token/history` route
- Fallback: Mobula → CoinGecko → DexScreener
- **Impact**: Better price data coverage

### **2. Add DexScreener Real-Time Data** (1 hour)
- Create `lib/api/dexscreener.ts`
- New endpoint: `/api/token/dex-data`
- Display liquidity from all DEXes
- **Impact**: Real-time liquidity tracking

### **3. Fix Token Age Detection** (3 hours)
- Add Etherscan contract creation API
- Update Moralis metadata to include creation date
- Fix "Token age unknown" warnings in risk scores
- **Impact**: More accurate risk scoring

### **4. Add Liquidity History** (4 hours)
- Use Mobula `liquidity_history` endpoint
- New chart in premium dashboard
- Alert system for liquidity drops
- **Impact**: Detect rug pulls early

---

## 📝 Next Steps

1. **Create API key accounts**:
   - CoinGecko (register for API key)
   - Etherscan (for contract age detection)
   - Optional: Dune Analytics (for research)

2. **Add environment variables**:
   ```env
   COINGECKO_API_KEY=your_key
   ETHERSCAN_API_KEY=your_key
   DUNE_API_KEY=your_key (optional)
   ```

3. **Implement Phase 1** (CoinGecko + DexScreener)
   - Estimated time: 1 day
   - Files to create: 2 new API libs
   - Files to update: 1 route

4. **Test with multiple tokens**:
   - Verify data accuracy
   - Check rate limits
   - Monitor API costs

5. **Deploy to production**:
   - Update README with new data sources
   - Document API key setup
   - Add rate limit monitoring

---

**Status**: Ready for implementation  
**Estimated Total Time**: 2-3 weeks  
**Estimated Cost**: $178/month for 1000 users  
**ROI**: Better data = Higher confidence scores = More premium conversions
