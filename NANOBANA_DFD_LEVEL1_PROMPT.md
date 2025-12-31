# Nanobana Level 1 DFD Generation Prompt

## SYSTEM: Tokenomics Lab - RBAC & Payment Architecture

### INSTRUCTION FOR NANOBANA:
Generate a Level 1 Data Flow Diagram (DFD) using Gane-Sarson notation that illustrates the Role-Based Access Control (RBAC) and Payment Processing systems for Tokenomics Lab, a multi-chain cryptocurrency token risk analysis platform.

---

## 🎯 DIAGRAM FOCUS AREAS
**Primary Systems**: RBAC (Role-Based Access Control) + Payment Processing  
**Secondary Systems**: User Management + Usage Tracking  
**Architecture**: Next.js 16 + Firebase + x402 Protocol + External APIs

---

## 📋 EXTERNAL ENTITIES (Rectangles)

### User Types:
- **FREE_USERS** - Basic tier (beginners, social sharing)
- **PAY_PER_USE_USERS** - Casual traders (x402 micropayments)  
- **PREMIUM_USERS** - Active traders ($29/month subscription)
- **ADMIN_USERS** - Platform administrators (2FA required)

### External Systems:
- **X402_PAYMENT_NETWORK** - USDC on Base blockchain processor
- **FIREBASE_AUTH** - Google authentication service
- **FIRESTORE_DB** - NoSQL database (user data, transactions)
- **EXTERNAL_APIS** - Groq AI, Mobula, Moralis, GoPlus, Helius
- **TRADITIONAL_PAYMENT_GATEWAY** - Stripe/PayPal for subscriptions

---

## ⚙️ CORE PROCESSES (Circles)

### RBAC Processes:
**1.0 USER_AUTHENTICATION**
- Email/password login + Google OAuth
- TOTP 2FA for admin users
- JWT token generation and validation
- Session management

**2.0 ROLE_AUTHORIZATION** 
- Tier-based permission checking (FREE/PAY_PER_USE/PREMIUM)
- Feature access validation
- Admin privilege verification
- API endpoint protection

**3.0 USER_MANAGEMENT**
- Profile creation and updates
- Tier upgrades/downgrades
- Account deletion with data export
- Preference management

### Payment Processes:
**4.0 CREDIT_MANAGEMENT**
- x402 credit purchases ($5 = 50 credits)
- Real-time balance tracking
- Per-feature credit deduction
- Refund processing

**5.0 SUBSCRIPTION_PROCESSING**
- Premium plan enrollment ($29/month)
- Recurring billing automation
- Plan cancellation handling
- Proration calculations

**6.0 USAGE_TRACKING**
- API call metering
- Feature usage analytics
- Rate limiting enforcement
- Billing event generation

---

## 🗄️ DATA STORES (Open Rectangles)

**D1: USERS_COLLECTION**
- User profiles, roles, tiers, preferences
- Authentication tokens, 2FA settings
- Account metadata, signup source

**D2: CREDITS_COLLECTION** 
- Credit balances, transaction history
- x402 payment records, refunds
- Usage deduction logs

**D3: SUBSCRIPTIONS_COLLECTION**
- Premium plan data, billing cycles
- Payment method information
- Cancellation/renewal dates

**D4: USAGE_LOGS_COLLECTION**
- API usage metrics, feature access
- Rate limiting counters
- Performance analytics

**D5: ADMIN_SETTINGS_COLLECTION**
- Platform configuration
- Auto-premium toggle settings
- System maintenance flags

**D6: PAYMENT_HISTORY_COLLECTION**
- All transaction records
- x402 blockchain confirmations
- Traditional payment receipts

---

## 🔄 KEY DATA FLOWS (Labeled Arrows)

### Authentication Flows:
```
FREE_USERS → [login_credentials] → 1.0_USER_AUTHENTICATION
1.0_USER_AUTHENTICATION → [auth_token] → FREE_USERS
1.0_USER_AUTHENTICATION ↔ [user_profile] ↔ D1_USERS_COLLECTION
ADMIN_USERS → [2fa_code] → 1.0_USER_AUTHENTICATION
```

### Authorization Flows:
```
ALL_USERS → [feature_request] → 2.0_ROLE_AUTHORIZATION
2.0_ROLE_AUTHORIZATION → [permission_grant/deny] → ALL_USERS
2.0_ROLE_AUTHORIZATION ← [tier_data] ← D1_USERS_COLLECTION
2.0_ROLE_AUTHORIZATION → [access_log] → D4_USAGE_LOGS_COLLECTION
```

### x402 Payment Flows:
```
PAY_PER_USE_USERS → [credit_purchase_$5] → 4.0_CREDIT_MANAGEMENT
4.0_CREDIT_MANAGEMENT ↔ [usdc_transaction] ↔ X402_PAYMENT_NETWORK
4.0_CREDIT_MANAGEMENT → [credit_balance_+50] → D2_CREDITS_COLLECTION
PAY_PER_USE_USERS → [feature_usage] → 4.0_CREDIT_MANAGEMENT
4.0_CREDIT_MANAGEMENT → [credit_deduction] → D2_CREDITS_COLLECTION
```

### Subscription Payment Flows:
```
PREMIUM_USERS → [subscription_$29] → 5.0_SUBSCRIPTION_PROCESSING
5.0_SUBSCRIPTION_PROCESSING ↔ [payment_data] ↔ TRADITIONAL_PAYMENT_GATEWAY
5.0_SUBSCRIPTION_PROCESSING → [billing_record] → D3_SUBSCRIPTIONS_COLLECTION
5.0_SUBSCRIPTION_PROCESSING → [tier_upgrade] → D1_USERS_COLLECTION
```

### Usage Tracking Flows:
```
ALL_USERS → [api_request] → 6.0_USAGE_TRACKING
6.0_USAGE_TRACKING → [usage_metric] → D4_USAGE_LOGS_COLLECTION
6.0_USAGE_TRACKING ← [rate_limit_check] ← D4_USAGE_LOGS_COLLECTION
6.0_USAGE_TRACKING → [credit_deduction_trigger] → 4.0_CREDIT_MANAGEMENT
```

---

## 🔐 RBAC TIER SPECIFICATIONS

### FREE TIER (Tier 0):
- ✅ Honeypot checks (unlimited)
- ✅ Risk scores (10/day limit)  
- ✅ PDF exports (watermarked)
- ❌ AI analysis, portfolio audits, smart alerts

### PAY_PER_USE TIER (Tier 1):
- ✅ All FREE features
- ✅ AI Risk Analyst (1 credit/report)
- ✅ Portfolio Audit (0.5 credits/token)
- ✅ Enhanced charts, unbranded PDFs
- ✅ 24h ad-free after payment

### PREMIUM TIER (Tier 2):
- ✅ Unlimited access to all features
- ✅ Smart Alerts (exclusive)
- ✅ Custom PDF branding
- ✅ Always ad-free, priority support

### ADMIN TIER (Tier 99):
- ✅ User management dashboard
- ✅ System analytics and settings
- ✅ Force tier upgrades/downgrades
- ✅ Audit log access (TOTP required)

---

## 💳 PAYMENT ARCHITECTURE DETAILS

### x402 Micropayment Flow:
1. User initiates $5 USDC payment
2. x402 protocol processes on Base L2
3. Smart contract confirms transaction
4. 50 credits added to user balance
5. Transaction logged with blockchain hash

### Traditional Subscription Flow:
1. User selects $29/month Premium plan
2. Payment gateway processes card/PayPal
3. Subscription record created in Firestore
4. User tier immediately upgraded to PREMIUM
5. Recurring billing scheduled monthly

---

## 🛡️ SECURITY BOUNDARIES TO HIGHLIGHT

### Authentication Security:
- Firebase Auth JWT validation
- TOTP 2FA for admin access
- Session timeout management
- OAuth 2.0 with Google

### Authorization Security:
- Middleware checks on every API call
- Firestore security rules enforcement
- Role-based UI component rendering
- API rate limiting per tier

### Payment Security:
- x402 protocol cryptographic verification
- PCI DSS compliance for card payments
- Blockchain transaction immutability
- Encrypted payment method storage

---

## 📊 PERFORMANCE & SCALING CONSIDERATIONS

### Load Distribution:
- **Authentication**: ~1000 logins/hour
- **Token Analysis**: ~500 scans/hour  
- **Payment Processing**: ~50 transactions/hour
- **Admin Operations**: ~10 actions/hour

### Data Volume:
- **Users**: ~10K active users
- **Transactions**: ~1K payments/month
- **Usage Logs**: ~100K API calls/day
- **Analysis History**: ~50K scans/month

---

## 🎨 DIAGRAM STYLING INSTRUCTIONS FOR NANOBANA

### Visual Style:
- Use **Gane-Sarson notation** (rounded rectangles for processes)
- **Color coding**: Blue for RBAC, Green for Payments, Gray for Data Stores
- **Process numbering**: 1.0, 2.0, 3.0, etc.
- **Clear directional arrows** with descriptive labels

### Layout Suggestions:
- **Top row**: External entities (users and systems)
- **Middle section**: Core processes (authentication, authorization, payments)
- **Bottom section**: Data stores
- **Logical grouping**: RBAC processes on left, Payment processes on right

### Data Flow Labels:
- Use **[bracket_notation]** for data flow descriptions
- Include **data types** where relevant (credentials, tokens, payments)
- Show **bidirectional flows** with ↔ arrows
- Highlight **critical security flows** with bold arrows

---

## 🔍 VALIDATION CHECKLIST

The generated DFD should clearly show:
- [ ] Three distinct user tiers and their access patterns
- [ ] Authentication and authorization data flows
- [ ] Both x402 and traditional payment processing
- [ ] Data persistence and retrieval patterns
- [ ] External system integration points
- [ ] Security boundaries and access controls
- [ ] Admin functions with elevated privileges
- [ ] Usage tracking and rate limiting mechanisms

---

## 📝 ADDITIONAL CONTEXT FOR NANOBANA

**Business Model**: Freemium with innovative x402 micropayments  
**Target Users**: Crypto investors, DeFi traders, security researchers  
**Compliance**: SOC 2, GDPR, PCI DSS requirements  
**Scalability**: Designed for 100K+ users, 1M+ API calls/month  
**Innovation**: First platform to use x402 protocol for crypto analysis services

**Technical Stack**: Next.js 16, Firebase, TypeScript, Tailwind CSS, x402 SDK  
**Deployment**: Vercel/Netlify with global CDN, Firebase hosting  
**Monitoring**: Real-time analytics, error tracking, performance metrics

This DFD serves as **architectural documentation** for developers, **compliance evidence** for auditors, and **system overview** for stakeholders to understand the platform's access control and payment processing architecture.