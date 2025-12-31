# Level 1 DFD Generation Prompt for Tokenomics Lab

## System Overview
Create a Level 1 Data Flow Diagram (DFD) for **Tokenomics Lab**, a multi-chain cryptocurrency token risk analysis platform. Focus specifically on the **RBAC (Role-Based Access Control)** and **Payment Processing** subsystems.

## System Context
Tokenomics Lab is a Next.js web application that provides AI-powered security assessments for cryptocurrency tokens across multiple blockchain networks (Ethereum, BSC, Solana, Polygon, etc.).

## Key Components to Include in Level 1 DFD

### 1. External Entities (Rectangles)
- **Free Users** - Basic tier users (beginners, social sharers)
- **Pay-Per-Use Users** - Casual traders using x402 micropayments
- **Premium Users** - Active daily traders with subscriptions
- **Admin Users** - Platform administrators
- **x402 Payment Network** - USDC on Base blockchain payment processor
- **Firebase Auth** - Authentication service
- **Firestore Database** - User data and transaction storage
- **External APIs** - Groq AI, Mobula, Moralis, GoPlus, Helius

### 2. Main Processes (Circles) - Focus Areas

#### RBAC Processes:
1. **User Authentication** (Process 1.0)
   - Login/Signup with email/password or Google OAuth
   - 2FA for admin users (TOTP)
   - Session management and token validation

2. **Role Authorization** (Process 2.0)
   - Tier-based access control (FREE, PAY_PER_USE, PREMIUM)
   - Feature permission checking
   - Admin role verification

3. **User Management** (Process 3.0)
   - Profile creation and updates
   - Tier upgrades/downgrades
   - Account deletion and data export

#### Payment Processes:
4. **Credit Management** (Process 4.0)
   - x402 credit purchases ($5 = 50 credits)
   - Credit balance tracking
   - Credit deduction for services

5. **Subscription Processing** (Process 5.0)
   - Premium plan subscriptions ($29/month)
   - Recurring billing management
   - Plan cancellation and refunds

6. **Usage Tracking** (Process 6.0)
   - API call counting
   - Feature usage monitoring
   - Rate limiting enforcement

### 3. Data Stores (Open Rectangles)
- **D1: Users** - User profiles, roles, tiers, preferences
- **D2: Credits** - Credit balances, transaction history
- **D3: Subscriptions** - Premium plan data, billing cycles
- **D4: Usage Logs** - API usage, feature access logs
- **D5: Admin Settings** - Platform configuration, auto-premium settings
- **D6: Payment History** - x402 transactions, subscription payments

### 4. Data Flows (Arrows with Labels)

#### Authentication Flows:
- User credentials → Authentication Process
- Auth tokens ← Authentication Process
- User profile data ↔ Users data store
- 2FA codes → Admin authentication

#### Authorization Flows:
- Access requests → Role Authorization
- Permission grants/denials ← Role Authorization
- User tier data ← Users data store
- Feature access logs → Usage Logs data store

#### Payment Flows:
- Credit purchase requests → Credit Management
- x402 payment data ↔ x402 Payment Network
- Credit transactions → Credits data store
- Subscription payments → Subscription Processing
- Billing data → Subscriptions data store

#### Usage Flows:
- API requests → Usage Tracking
- Usage metrics → Usage Logs data store
- Rate limit checks ← Usage Tracking
- Credit deductions → Credits data store

## Specific RBAC Rules to Illustrate

### Tier-Based Access Control:
1. **FREE Tier**:
   - Honeypot checks (unlimited)
   - Risk scores (10 per day limit)
   - PDF exports (watermarked)
   - No AI analysis, portfolio audits, or smart alerts

2. **PAY_PER_USE Tier**:
   - All FREE features
   - AI Risk Analyst (1 credit per report)
   - Portfolio Audit (0.5 credits per token)
   - Enhanced charts and unbranded PDFs
   - 24-hour ad-free experience after payment

3. **PREMIUM Tier**:
   - Unlimited access to all features
   - Smart Alerts (exclusive)
   - Custom branding on PDFs
   - Always ad-free experience
   - Priority support

### Admin Access Control:
- **Admin Dashboard**: User management, analytics, system settings
- **2FA Required**: TOTP authentication for admin access
- **Audit Logging**: All admin actions logged with timestamps
- **Role Management**: Ability to upgrade/downgrade user tiers

## Payment System Architecture

### x402 Micropayments (Pay-Per-Use):
1. **Credit Purchase Flow**:
   - User initiates $5 USDC payment
   - x402 protocol processes on Base blockchain
   - 50 credits added to user account
   - Transaction logged in payment history

2. **Credit Consumption Flow**:
   - User requests premium feature
   - System checks credit balance
   - Credits deducted if sufficient
   - Feature access granted
   - Usage logged for analytics

### Subscription Payments (Premium):
1. **Subscription Flow**:
   - User selects $29/month plan
   - Payment processed via traditional gateway
   - Premium tier activated immediately
   - Recurring billing scheduled
   - Access to all premium features

## Security Considerations to Show
- **Authentication**: Firebase Auth with secure token management
- **Authorization**: Middleware checks on every API request
- **Payment Security**: x402 protocol for secure micropayments
- **Data Protection**: Firestore security rules enforce access control
- **Audit Trail**: All user actions and admin changes logged

## Technical Implementation Details
- **Framework**: Next.js 16 with App Router
- **Database**: Firebase Firestore with security rules
- **Authentication**: Firebase Auth + custom middleware
- **Payments**: x402 protocol (USDC on Base) + traditional subscriptions
- **API Architecture**: RESTful endpoints with role-based middleware

## DFD Notation Standards
- Use Gane-Sarson notation
- Number processes hierarchically (1.0, 2.0, etc.)
- Show data flow directions clearly
- Label all data flows with descriptive names
- Use consistent symbols throughout

## Expected Outputs
The Level 1 DFD should clearly show:
1. How users of different tiers interact with the system
2. The flow of authentication and authorization data
3. Payment processing for both micropayments and subscriptions
4. Data storage and retrieval patterns
5. Integration points with external services
6. Security boundaries and access controls

## Additional Context
- The system serves thousands of users across three distinct tiers
- Payment processing must handle both traditional subscriptions and blockchain micropayments
- RBAC must be enforced at both UI and API levels
- All user actions must be auditable for compliance
- The system must scale to handle high API usage from premium users

This DFD will serve as documentation for developers, security auditors, and stakeholders to understand the system's access control and payment architecture at a high level.