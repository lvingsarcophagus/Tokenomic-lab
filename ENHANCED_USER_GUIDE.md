# Tokenomics Lab - Complete User Guide

## Table of Contents

1. [Getting Started & Registration](#1-getting-started--registration)
2. [Analyzing a Single Token](#2-analyzing-a-single-token)
3. [Understanding Risk Scores & AI Analysis](#3-understanding-risk-scores--ai-analysis)
4. [Portfolio Audit (Premium Feature)](#4-portfolio-audit-premium-feature)
5. [Plan Upgrading & Payments](#5-plan-upgrading--payments)
6. [User Profile Management](#6-user-profile-management)
7. [Advanced Features](#7-advanced-features)
8. [Admin Panel (Admin Users Only)](#8-admin-panel-admin-users-only)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)

---

## 1. Getting Started & Registration

### Access the Platform
Navigate to https://tokenomiclab.app/ in your web browser.

### Sign Up / Login
1. Click the "Sign Up" button from the navbar (mobile: hamburger menu → Sign Up)
2. You can create an account using one of two methods:
   - **OAuth**: Click "Continue with Google" for one-click access
   - **Manual Sign Up**: Enter your email address and create a password
3. **Free Tier Access**: Upon registration, you are automatically assigned to the Free Tier

### Account Verification
- Check your email for a verification link
- Click the link to activate your account
- You can now access the dashboard

---

## 2. Analyzing a Single Token

### Token Search Methods

#### Method 1: Direct Address Entry
- Paste a contract address (e.g., `0xdac17f958d2ee523a2206206994597c13d831ec7`) directly into the search bar
- Supports all EVM chains and Solana addresses

#### Method 2: Search by Name/Symbol
- Type a token name (e.g., "Pepe", "Bitcoin", "Ethereum")
- Select the correct token from the CoinMarketCap-powered dropdown
- Auto-fills the contract address

#### Method 3: Token Explorer
- Browse suggested tokens from the Token Explorer
- Popular tokens are pre-loaded for quick analysis

### Supported Blockchains
- **Ethereum (ETH)** - Chain ID: 1
- **Binance Smart Chain (BSC)** - Chain ID: 56  
- **Polygon (MATIC)** - Chain ID: 137
- **Avalanche (AVAX)** - Chain ID: 43114
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10
- **Base** - Chain ID: 8453
- **Solana (SOL)** - Chain ID: 501

### Analysis Results
After scanning, you'll receive:
- **Risk Score (0-100)** with color-coded risk level
- **10-Factor Risk Breakdown** with detailed explanations
- **AI-Powered Meme Detection** and classification
- **Security Flags** (honeypot, mint authority, freeze authority)
- **Market Data** (price, volume, market cap, liquidity)
- **Holder Distribution** analysis
- **Contract Security** checks

---

## 3. Understanding Risk Scores & AI Analysis

### Risk Levels

| Score Range | Risk Level | Color | Description |
|-------------|------------|-------|-------------|
| 0-30 | **LOW RISK** | 🟢 Green | Safe to invest. Strong fundamentals, verified contracts, good liquidity |
| 31-60 | **MEDIUM RISK** | 🟡 Yellow | Proceed with caution. Some concerning factors detected |
| 61-80 | **HIGH RISK** | 🟠 Orange | High risk detected. Multiple red flags present |
| 81-100 | **CRITICAL RISK** | 🔴 Red | Avoid investment. Likely scam, honeypot, or rug pull |

### 10 Risk Factors Analyzed

1. **Supply Dilution** - FDV/Market Cap ratio, mintable tokens, unlimited supply risks
2. **Holder Concentration** - Top 10/50/100 holder percentages, unique buyers, wash trading
3. **Liquidity Depth** - Liquidity amount, MC/Liq ratio, LP lock status, liquidity drops
4. **Vesting & Unlocks** - Upcoming token unlocks, team vesting schedules
5. **Contract Control** - Honeypot detection, mintable flags, ownership, freeze authority
6. **Tax & Fees** - Buy/sell taxes, modifiable tax rates
7. **Distribution** - Team allocation, holder distribution fairness
8. **Burn & Deflation** - Burn rate, deflationary mechanisms, supply cap
9. **Adoption & Usage** - Transaction count, volume/MC ratio, age-adjusted metrics
10. **Audit & Transparency** - Contract verification, open source status, audit reports

### AI Meme Detection
- **Powered by Groq Llama 3.3 70B** for accurate classification
- **Automatic Detection**: Analyzes token name, symbol, and metadata
- **Classifications**: MEME_TOKEN, UTILITY_TOKEN, GOVERNANCE_TOKEN, UNKNOWN
- **Meme Penalty**: +15 risk points automatically applied to meme tokens
- **Manual Override**: Force classification if you disagree with AI

### AI Risk Explanation (Premium/Pay-Per-Use)
- **Natural Language Analysis**: Plain English explanation of risks
- **Key Insights**: Bullet-point summary of critical factors
- **Investment Recommendation**: Clear guidance on whether to invest
- **Technical Details**: Chain-specific information and contract analysis

---

## 4. Portfolio Audit (Premium Feature)

### Supported Wallets
- **Phantom Wallet** (Solana) - Primary support
- **MetaMask** (EVM chains) - Coming soon
- **WalletConnect** integration - Planned

### How to Run a Portfolio Audit

#### Step 1: Connect Wallet
1. Navigate to the "Portfolio" tab or click "Connect Wallet" in the dashboard
2. Select Phantom Wallet from the popup
3. Approve the connection in your wallet

#### Step 2: Automatic Scanning
1. System automatically detects all tokens in your wallet
2. Displays tokens with their Risk Scores and Trust Levels
3. Shows portfolio risk distribution (Low/Medium/High/Critical)

#### Step 3: Detailed Analysis
- **Pro Users**: Unlimited portfolio audits
- **Pay-As-You-Go Users**: 0.5 credits per token analyzed
- **Free Users**: Not available (upgrade required)

### Portfolio Features
- **Risk Distribution Chart** - Visual breakdown of portfolio risk
- **Critical Token Alerts** - Immediate warnings for high-risk holdings
- **Recommendations** - Suggested actions for each token
- **Export Reports** - Download portfolio analysis as PDF

---

## 5. Plan Upgrading & Payments

### Tier 1: Free ($0/month)
**Target**: Beginners and Social Sharers

✅ **Included Features**:
- Honeypot Check (unlimited)
- Risk Score (0-100) for any token
- Standard Charts (basic OHLCV)
- PDF Export (with "Tokenomics Lab" watermark)
- Multi-chain support

❌ **Not Included**:
- AI Risk Analyst
- Portfolio Audit
- Enhanced Charts with risk overlay
- Smart Alerts
- Unbranded PDF exports

### Tier 2: Pay-As-You-Go (x402 Credits)
**Target**: Casual/weekend traders

**Credit System**:
- $5.00 = 50 Credits (via USDC on Base using x402 protocol)
- **AI Risk Analyst**: 1 credit per report
- **Portfolio Audit**: 0.5 credits per token
- **Ad-Free Experience**: 24 hours after any payment

✅ **Features**:
- All Free tier features
- AI Risk Analyst ($0.10/report)
- Portfolio Audit ($0.05/token)
- Enhanced Charts with risk overlay
- Unbranded PDF exports
- Ad-free experience

### Tier 3: Premium ($29/month)
**Target**: Active daily traders and power users

✅ **Features**:
- **Unlimited Access**: All features without credit limits
- **Smart Alerts (Exclusive)**: 24/7 blockchain monitoring with notifications for:
  - Risk score increases (>15 points)
  - New critical flags detected
  - Liquidity drops (>30% decrease)
  - Holder concentration changes (>10% increase)
- **Custom Branding**: Add custom logo to PDF exports
- **Always Ad-Free**: Permanent ad-free experience
- **Priority Support**: Faster response times

### Payment Process
1. **Select Plan**: Click "Get Credits" or "Upgrade"
2. **Choose Payment Method**: USDC or SOL (Solana)
3. **Connect Wallet**: Phantom or MetaMask
4. **Sign Transaction**: Credits added instantly upon blockchain confirmation

---

## 6. User Profile Management

### Profile Settings
Access via avatar in navigation bar → Profile Page

#### Account Information
- **Profile Image**: Upload custom avatar (Firebase Storage)
- **Full Name**: Display name for your account
- **Email**: Account email (cannot be changed)
- **Company**: Optional company information
- **Country**: Optional location information

#### Plan & Billing Management
- **Current Plan Display**: Shows active tier and billing info
- **Credit Balance**: For Pay-Per-Use users, shows remaining credits
- **Plan Switching**: Easy switching between Free/Pay-Per-Use/Premium
- **Billing History**: View past transactions and payments

#### Connected Wallets
- **Wallet Connection**: Link MetaMask or Phantom wallet
- **Address Display**: Shows connected wallet address
- **Disconnect Option**: Remove wallet connection
- **Portfolio Tracking**: Enables personalized alerts

#### Security & Two-Factor Authentication
- **2FA Setup**: Enable TOTP-based two-factor authentication
- **QR Code Generation**: Scan with authenticator apps
- **Backup Codes**: Download recovery codes
- **Security Status**: View current security settings

#### Privacy & Data Rights
- **Export Data**: Download complete account data in JSON format
- **Delete Account**: Permanent account deletion with confirmation
- **Privacy Policy**: Link to data handling information

---

## 7. Advanced Features

### Watchlist Management
- **Add Tokens**: Save tokens for monitoring after analysis
- **Capacity**: Free (5 tokens), Premium (unlimited)
- **Auto-Updates**: Risk scores refresh automatically
- **Dashboard View**: See all watchlist tokens at once

### Smart Alerts (Premium Only)
- **Real-Time Monitoring**: 24/7 blockchain surveillance
- **Alert Types**:
  - Risk score increases significantly
  - New critical flags detected
  - Liquidity drops below threshold
  - Holder concentration changes
- **Notification Methods**: Email, in-app notifications
- **Custom Thresholds**: Set personalized alert triggers

### Enhanced Charts & Analytics
- **Risk Overlay Charts**: Plot security events against price history
- **Historical Data**: Track risk score changes over time
- **Volume Analysis**: Correlate trading volume with risk factors
- **Holder Trends**: Monitor holder distribution changes

### API Integration (Coming Soon)
- **REST API**: Programmatic access to risk analysis
- **Webhooks**: Real-time notifications for portfolio changes
- **Rate Limits**: Based on subscription tier
- **Documentation**: Comprehensive API docs

### Multi-Chain DEX Integration
- **DEX Search**: Find tokens across multiple DEXs
- **Price Comparison**: Compare prices across exchanges
- **Liquidity Sources**: Identify primary liquidity pools
- **Trading Links**: Direct links to trade on DEXs

---

## 8. Admin Panel (Admin Users Only)

### Accessing the Admin Panel
1. Navigate to `/admin/login`
2. Enter admin credentials
3. Complete 2FA verification (if enabled)
4. Access granted to admin dashboard at `/admin/dashboard`

### Admin Dashboard Overview

#### System Status
- **Real-Time Metrics**: Live system performance indicators
- **API Status**: Monitor all external API connections
  - Mobula API (market data)
  - Moralis API (blockchain data)
  - GoPlus API (security analysis)
  - Helius API (Solana data)
- **Database Status**: Firebase Auth, Firestore, Storage connectivity
- **Operational Status**: Green/Red indicators for all services

#### User Management
- **User List**: Complete database of all registered users
- **Search & Filter**: Find users by email, name, or UID
- **User Details**: View complete user profiles and activity
- **Tier Management**: Change user tiers (Free/Pay-Per-Use/Premium/Admin)
- **Account Actions**:
  - Edit user information
  - Ban/unban users
  - Delete accounts permanently
  - Force tier upgrades
- **Bulk Operations**: Mass user management tools

#### Analytics & Insights
- **User Growth Chart**: 30-day user registration trends
- **Scan Activity**: 7-day token analysis volume
- **Tier Distribution**: Pie chart of user plan distribution
- **Chain Usage**: Popular blockchain analysis breakdown
- **Revenue Metrics**: Credit purchases and subscription revenue

#### System Settings
- **Maintenance Mode**: Enable/disable platform access
- **Maintenance Message**: Custom message for downtime
- **System Limits**: Configure free tier daily limits
- **Cache Settings**: Set cache expiration times
- **API Configuration**: Monitor API key status and usage

#### Security Management
- **Admin 2FA**: Enable two-factor authentication for admin account
- **TOTP Configuration**: System-wide 2FA settings
- **Security Logs**: Monitor login attempts and security events
- **Access Control**: Manage admin permissions

#### Activity Logs
- **Real-Time Monitoring**: Live feed of user activities
- **Filter Options**: Filter by action type:
  - User login/logout/signup
  - Token scans
  - Watchlist modifications
  - Tier upgrades/downgrades
  - Profile updates
  - 2FA enable/disable
- **Export Logs**: Download activity data for analysis
- **Retention Settings**: Configure log storage duration

#### Payment Management
- **Transaction History**: All credit purchases and subscriptions
- **x402 Settings**: Configure micropayment parameters
- **Revenue Analytics**: Track payment trends and conversion rates
- **Refund Management**: Process refunds and disputes
- **Payment Gateway Status**: Monitor payment processor health

#### Smart Alerts Administration
- **Alert Configuration**: System-wide alert settings
- **Monitoring Status**: Check alert system health
- **User Alert Stats**: See alert engagement metrics
- **Alert Templates**: Manage notification templates
- **Delivery Monitoring**: Track alert delivery success rates

#### Cache Management
- **Cache Viewer**: Inspect cached token data
- **Cache Statistics**: Hit/miss ratios and performance metrics
- **Manual Cache Control**: Clear specific cache entries
- **Cache Optimization**: Performance tuning tools

### Admin Mobile Interface
- **Responsive Design**: Full functionality on mobile devices
- **Touch-Friendly**: Optimized buttons and navigation
- **Horizontal Scrolling**: Mobile-optimized table views
- **Compact Stats**: Mobile-friendly metric displays

---

## 9. Troubleshooting & FAQ

### Common Issues

#### Token Not Found
- **Cause**: Token address incorrect or not supported on selected chain
- **Solution**: 
  - Verify contract address is correct
  - Ensure you've selected the right blockchain
  - Try searching by token name instead

#### Wallet Connection Failed
- **Cause**: Wallet extension not installed or not unlocked
- **Solution**:
  - Install Phantom (Solana) or MetaMask (EVM)
  - Unlock your wallet
  - Refresh the page and try again

#### Analysis Taking Too Long
- **Cause**: High network traffic or API rate limits
- **Solution**:
  - Wait 30-60 seconds and try again
  - Check system status on admin panel
  - Contact support if issue persists

#### Credits Not Deducted
- **Cause**: Payment processing delay or network congestion
- **Solution**:
  - Wait for blockchain confirmation
  - Check transaction status in wallet
  - Contact support with transaction hash

### Frequently Asked Questions

#### Q: How accurate are the risk scores?
A: Our algorithm analyzes 10 different risk factors and has been calibrated against thousands of tokens. While highly accurate, it should be used as one factor in your investment decision, not the sole determinant.

#### Q: Can I get refunds for credits?
A: Credits are non-refundable once purchased, but we may consider refunds in exceptional circumstances. Contact support for assistance.

#### Q: How often are risk scores updated?
A: Risk scores are recalculated in real-time when you scan a token. Watchlist tokens are updated every 24 hours for Premium users.

#### Q: Is my wallet data stored?
A: We only store your wallet address if you choose to connect it. We never store private keys or have access to your funds.

#### Q: Can I use the platform without connecting a wallet?
A: Yes! You can analyze any token by entering its contract address or searching by name. Wallet connection is only needed for portfolio audits.

#### Q: What happens if I downgrade my plan?
A: You'll lose access to premium features but retain your account and basic functionality. Credits are preserved if you switch back to Pay-Per-Use.

### Contact Support
- **Email**: support@tokenomiclab.app
- **Response Time**: 
  - Premium users: 24 hours
  - Free users: 48-72 hours
- **Documentation**: https://tokenomiclab.app/docs
- **Status Page**: Check system status and known issues

---

## Additional Resources

### Educational Content
- **Risk Algorithm Explanation**: Detailed breakdown of our 10-factor analysis
- **Blockchain Security Guide**: Learn about common crypto scams
- **DeFi Safety Tips**: Best practices for decentralized finance
- **Token Analysis Tutorials**: Step-by-step analysis guides

### API Documentation (Coming Soon)
- **REST API Reference**: Complete endpoint documentation
- **Rate Limits**: Usage limits by subscription tier
- **Authentication**: API key management
- **Code Examples**: Sample implementations in multiple languages

### Community
- **Discord Server**: Join our community for discussions
- **Twitter**: Follow @TokenomicsLab for updates
- **Blog**: Regular posts about crypto security and analysis
- **Newsletter**: Weekly market insights and platform updates

---

*Last Updated: December 2024*
*Version: 2.0*