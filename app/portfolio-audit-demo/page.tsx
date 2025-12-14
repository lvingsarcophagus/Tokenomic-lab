'use client'

import { PortfolioAuditResults } from "@/components/portfolio-audit-results"

// Mock data for demonstration
const mockAuditResults = {
  success: true,
  totalTokens: 12,
  analyzed: 11,
  failed: 1,
  processingTime: 8500,
  plan: 'PREMIUM',
  userId: 'demo-user',
  results: [
    {
      address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      symbol: 'UNI',
      name: 'Uniswap',
      balance: 1250,
      riskScore: 25,
      riskLevel: 'LOW' as const,
      success: true,
      criticalFlags: [],
      chain: 'ethereum'
    },
    {
      address: '0x514910771af9ca656af840dff83e8264ecf986ca',
      symbol: 'LINK',
      name: 'Chainlink',
      balance: 850,
      riskScore: 18,
      riskLevel: 'LOW' as const,
      success: true,
      criticalFlags: [],
      chain: 'ethereum'
    },
    {
      address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      symbol: 'AAVE',
      name: 'Aave Token',
      balance: 45,
      riskScore: 22,
      riskLevel: 'LOW' as const,
      success: true,
      criticalFlags: [],
      chain: 'ethereum'
    },
    {
      address: '0xscam123456789abcdef',
      symbol: 'SCAM',
      name: 'ScamToken',
      balance: 1000000,
      riskScore: 95,
      riskLevel: 'CRITICAL' as const,
      success: true,
      criticalFlags: ['Honeypot detected', 'Extreme sell tax (>90%)', 'LP tokens in owner wallet'],
      chain: 'bsc'
    },
    {
      address: '0xrug987654321fedcba',
      symbol: 'RUG',
      name: 'RugPull Token',
      balance: 500000,
      riskScore: 88,
      riskLevel: 'CRITICAL' as const,
      success: true,
      criticalFlags: ['LP tokens in owner wallet', 'Owner not renounced'],
      chain: 'bsc'
    },
    {
      address: '0xmeme111222333444555',
      symbol: 'MEME',
      name: 'MemeToken',
      balance: 75000,
      riskScore: 65,
      riskLevel: 'HIGH' as const,
      success: true,
      criticalFlags: ['High volatility meme token'],
      chain: 'solana'
    },
    {
      address: '0xmedium666777888999',
      symbol: 'MED',
      name: 'MediumRisk Token',
      balance: 2500,
      riskScore: 45,
      riskLevel: 'MEDIUM' as const,
      success: true,
      criticalFlags: [],
      chain: 'polygon'
    },
    {
      address: '0xgood123456789abcdef',
      symbol: 'GOOD',
      name: 'GoodToken',
      balance: 1800,
      riskScore: 28,
      riskLevel: 'LOW' as const,
      success: true,
      criticalFlags: [],
      chain: 'ethereum'
    },
    {
      address: '0xrisky999888777666',
      symbol: 'RISKY',
      name: 'RiskyToken',
      balance: 12000,
      riskScore: 72,
      riskLevel: 'HIGH' as const,
      success: true,
      criticalFlags: ['High holder concentration'],
      chain: 'bsc'
    },
    {
      address: '0xstable111222333444',
      symbol: 'STABLE',
      name: 'StableToken',
      balance: 5000,
      riskScore: 15,
      riskLevel: 'LOW' as const,
      success: true,
      criticalFlags: [],
      chain: 'ethereum'
    },
    {
      address: '0xok555666777888999',
      symbol: 'OK',
      name: 'OkayToken',
      balance: 3200,
      riskScore: 38,
      riskLevel: 'MEDIUM' as const,
      success: true,
      criticalFlags: [],
      chain: 'polygon'
    },
    {
      address: '0xfailed000111222333',
      symbol: 'FAIL',
      name: 'FailedToken',
      balance: 1000,
      riskScore: null,
      riskLevel: 'UNKNOWN' as const,
      success: false,
      error: 'API rate limit exceeded',
      chain: 'arbitrum'
    }
  ]
}

const mockAnalysis = {
  portfolio: 'MIXED_PORTFOLIO',
  totalTokens: 12,
  successRate: '91.7',
  processingTime: 8500,
  riskDistribution: {
    LOW: 5,
    MEDIUM: 2,
    HIGH: 2,
    CRITICAL: 2,
    UNKNOWN: 1
  },
  averageRiskScore: '42.3',
  criticalTokens: [
    {
      symbol: 'SCAM',
      riskScore: 95,
      criticalFlags: ['Honeypot detected', 'Extreme sell tax (>90%)', 'LP tokens in owner wallet']
    },
    {
      symbol: 'RUG',
      riskScore: 88,
      criticalFlags: ['LP tokens in owner wallet', 'Owner not renounced']
    }
  ],
  recommendations: [
    '🚨 URGENT: 2 critical risk token(s) detected - consider immediate review',
    '⚠️ High risk exposure: 2 tokens with high risk scores',
    '💡 Consider diversifying with more established tokens',
    '🔧 1 tokens failed analysis - may need manual review'
  ]
}

export default function PortfolioAuditDemoPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white font-mono tracking-wider mb-4">
              PORTFOLIO AUDIT DEMO
            </h1>
            <p className="text-white/60 font-mono text-lg max-w-3xl mx-auto">
              This demonstrates how portfolio audit results would be rendered in the UI.
              The simulation tested a mixed portfolio with 12 tokens across multiple chains.
            </p>
          </div>

          {/* Results Component */}
          <PortfolioAuditResults 
            auditResults={mockAuditResults}
            analysis={mockAnalysis}
            walletType="MIXED_PORTFOLIO"
          />

          {/* Back Button */}
          <div className="mt-12 text-center">
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-mono hover:bg-white hover:text-black transition-all duration-300"
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}