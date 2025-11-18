# Helius Integration - Quick Start Guide

## 🚀 What's New?

Your premium dashboard now displays **comprehensive Solana blockchain data** powered by Helius API when you scan Solana tokens!

## 📋 Setup (One-Time)

1. **Get Helius API Key** (Free)
   - Visit: https://helius.dev
   - Sign up for free account
   - Copy your API key

2. **Add to Environment**
   ```bash
   # Add to .env.local
   HELIUS_API_KEY=your_api_key_here
   ```

3. **Restart Server**
   ```bash
   pnpm dev
   ```

## 🎯 How to Use

### Step 1: Scan a Solana Token
1. Go to Premium Dashboard
2. Click "SCAN TOKEN" button
3. Select "SOLANA" from chain dropdown
4. Enter a Solana token address or symbol

### Step 2: View Helius Data
The Helius panel automatically appears below the chain analysis section showing:
- ✅ Token metadata (name, symbol, supply)
- ✅ Authority status (freeze, mint, update)
- ✅ Holder distribution with chart
- ✅ 24-hour activity metrics
- ✅ Recent transactions

### Step 3: Refresh Data
Click the "REFRESH" button in the Helius panel to get latest data.

## 🧪 Test Tokens

Try these popular Solana tokens:

### BONK
```
DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
```

### WIF (dogwifhat)
```
EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
```

### POPCAT
```
7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr
```

## 📊 What You'll See

### 1. Token Metadata
- Name and symbol
- Decimals
- Total supply (formatted)

### 2. Authority Status
- **Freeze Authority**: Can freeze accounts
  - 🟢 REVOKED = Good (secure)
  - 🟡 ACTIVE = Risk (can freeze)
  
- **Mint Authority**: Can create new tokens
  - 🟢 REVOKED = Good (fixed supply)
  - 🟡 ACTIVE = Risk (can inflate)
  
- **Update Authority**: Can modify metadata
  - 🟢 REVOKED = Good (immutable)
  - 🟡 ACTIVE = Risk (can change)

### 3. Holder Distribution
- Total number of holders
- Top 5 holders with percentages
- Interactive pie chart

### 4. 24-Hour Activity
- Total transactions
- Unique traders
- Volume (when available)

### 5. Recent Transactions
- Last 10 transactions
- Signatures (clickable)
- Timestamps
- Transaction fees

## ⚠️ Troubleshooting

### Panel Not Showing?
- ✅ Make sure you selected "SOLANA" chain
- ✅ Verify token address is valid (32-44 characters)
- ✅ Check you're on PREMIUM tier
- ✅ Confirm `HELIUS_API_KEY` is set

### "API Key Not Configured" Error?
```bash
# Check .env.local file
HELIUS_API_KEY=your_key_here

# Restart server
pnpm dev
```

### "Failed to Fetch" Error?
- Check internet connection
- Verify Helius API status: https://status.helius.dev
- Try refreshing the page

### No Data Showing?
- Token might be new (no holder data yet)
- Try a popular token like BONK first
- Check console for errors (F12)

## 💡 Pro Tips

1. **Compare Tokens**: Scan multiple Solana tokens to compare holder distribution

2. **Security Check**: Look for all authorities to be REVOKED for maximum security

3. **Activity Monitoring**: High transaction count + many unique traders = active token

4. **Whale Watch**: Check top holder percentages - high concentration = risk

5. **Fresh Data**: Use refresh button before making investment decisions

## 📱 Mobile Support

The Helius panel is fully responsive:
- Stacked layout on mobile
- Scrollable transaction feed
- Touch-friendly charts

## 🎓 Understanding the Data

### Good Signs ✅
- All authorities REVOKED
- Many holders (>1000)
- Low top holder concentration (<10%)
- High 24h transaction count
- Many unique traders

### Warning Signs ⚠️
- Active mint/freeze authority
- Few holders (<100)
- High concentration (>50% in top 10)
- Low activity
- Few unique traders

## 🔗 Resources

- **Helius Docs**: https://docs.helius.dev
- **Solana Explorer**: https://explorer.solana.com
- **Token Program**: https://spl.solana.com/token

## 🆘 Need Help?

1. Check the full documentation: `docs/HELIUS_INTEGRATION.md`
2. Review implementation summary: `HELIUS_IMPLEMENTATION_SUMMARY.md`
3. Check console logs (F12 → Console)
4. Verify environment variables
5. Test with known working tokens

---

**Ready to explore Solana tokens? Start scanning! 🚀**
