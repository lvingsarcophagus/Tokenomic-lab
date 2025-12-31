"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Shield, Zap, Crown, CheckCircle, X, Infinity } from "lucide-react"
import Navbar from "@/components/navbar"

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-20 border-b border-white/10">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link href="/">
              <Button 
                variant="outline" 
                className="mb-8 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-mono tracking-wider transition-all group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                BACK TO HOME
              </Button>
            </Link>

            <div className="flex items-center gap-2 mb-6 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">ACCESS LEVELS</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 font-mono tracking-wider">
              PRICING TIERS
            </h1>
            
            <p className="text-white/70 text-lg font-mono leading-relaxed mb-8 max-w-3xl">
              Three-tier hybrid monetization model designed for sustainable fraud reduction. 
              Start free, upgrade when you need advanced features.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="relative px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Tier 1: Free */}
              <Card className="bg-black/60 backdrop-blur-xl border border-white/20 shadow-xl hover:border-white/40 transition-all group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4 opacity-60">
                    <div className="w-6 h-px bg-white"></div>
                    <span className="text-white text-[9px] font-mono tracking-wider">TIER.01</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-green-500/50 bg-green-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-wider">FREE</h2>
                  </div>
                  
                  <div className="text-4xl font-bold text-white mb-2 font-mono">
                    $0<span className="text-lg text-white/60 font-mono">/MONTH</span>
                  </div>
                  <p className="text-white/60 text-sm font-mono mb-6">Public Utility • Beginners & Social Sharers</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Honeypot Check (Basic safety)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Risk Score (0-100)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Standard Charts (OHLCV)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">PDF Export (Watermarked)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <X className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-white/40 text-sm font-mono">AI Risk Analyst</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <X className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-white/40 text-sm font-mono">Portfolio Audit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <X className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-white/40 text-sm font-mono">Smart Alerts</span>
                    </div>
                  </div>
                  
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-white text-black hover:bg-white/90 font-mono tracking-wider font-bold">
                      GET STARTED
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Tier 2: Pay-As-You-Go */}
              <Card className="bg-black/60 backdrop-blur-xl border-2 border-blue-500/50 shadow-xl hover:border-blue-500/70 transition-all group relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 text-xs font-mono tracking-wider font-bold">
                  x402 INNOVATION
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4 opacity-60">
                    <div className="w-6 h-px bg-white"></div>
                    <span className="text-white text-[9px] font-mono tracking-wider">TIER.02</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-blue-500/50 bg-blue-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-wider">PAY-AS-YOU-GO</h2>
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-1 font-mono">
                    $0.10<span className="text-lg text-white/60 font-mono">/AI REPORT</span>
                  </div>
                  <div className="text-lg font-bold text-blue-400 mb-2 font-mono">
                    $0.05<span className="text-sm text-white/60 font-mono">/TOKEN AUDIT</span>
                  </div>
                  <p className="text-white/60 text-sm font-mono mb-6">USDC on Base • Weekend Traders</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Honeypot Check (Full access)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Risk Score (Full access)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Enhanced Charts (Risk overlay)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Unbranded PDF Export</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">AI Risk Analyst ($0.10)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Portfolio Audit ($0.05/token)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <X className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-white/40 text-sm font-mono">Smart Alerts (Pro exclusive)</span>
                    </div>
                  </div>
                  
                  <Link href="/pay-per-scan" className="block">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-mono tracking-wider font-bold">
                      START PAYING
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Tier 3: Pro Plan */}
              <Card className="bg-black/60 backdrop-blur-xl border-2 border-white/50 shadow-xl hover:border-white/70 transition-all group relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 text-xs font-mono tracking-wider font-bold">
                  RECOMMENDED
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4 opacity-60">
                    <div className="w-6 h-px bg-white"></div>
                    <span className="text-white text-[9px] font-mono tracking-wider">TIER.03</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-white/50 bg-white/10 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-wider">PRO PLAN</h2>
                  </div>
                  
                  <div className="text-4xl font-bold text-white mb-2 font-mono">
                    $29<span className="text-lg text-white/60 font-mono">/MONTH</span>
                  </div>
                  <p className="text-white/60 text-sm font-mono mb-6">Subscription • Active Daily Traders</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">All Free & Pay-per-use features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Infinity className="w-4 h-4 text-white flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Unlimited AI Reports</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Infinity className="w-4 h-4 text-white flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Unlimited Portfolio Audits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Custom Branding (PDF)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Smart Alerts (24/7 monitoring)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Always Ad-Free</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-mono">Priority Support</span>
                    </div>
                  </div>
                  
                  <Link href="/premium-signup" className="block">
                    <Button className="w-full bg-white text-black hover:bg-white/90 font-mono tracking-wider font-bold">
                      UPGRADE TO PRO
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* x402 Protocol Explanation */}
        <section className="relative px-6 py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-blue-500/50 bg-blue-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white font-mono tracking-wider">x402 MICROPAYMENT PROTOCOL</h3>
              </div>
              
              <p className="text-white/70 font-mono text-sm mb-8 leading-relaxed">
                Revolutionary micropayment system that solves the $0.10 transaction problem. Traditional payment processors 
                can't handle small payments profitably due to fixed fees (~$0.30 + 2.9%). x402 enables profitable 
                micropayments using USDC on Base blockchain.
              </p>

              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white font-mono font-bold">
                    1
                  </div>
                  <h4 className="text-white font-mono text-sm font-bold mb-2">CONNECT WALLET</h4>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    Sign in with your Web3 wallet via secure Firebase authentication
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white font-mono font-bold">
                    2
                  </div>
                  <h4 className="text-white font-mono text-sm font-bold mb-2">PAY WITH USDC</h4>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    Use x402 protocol to pay $0.10 for AI reports or $0.05 per token audit
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white font-mono font-bold">
                    3
                  </div>
                  <h4 className="text-white font-mono text-sm font-bold mb-2">INSTANT ACCESS</h4>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    No wallet popups needed after payment. Features unlock immediately
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white font-mono font-bold">
                    4
                  </div>
                  <h4 className="text-white font-mono text-sm font-bold mb-2">AD-FREE 24H</h4>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    Any payment removes ads for 24 hours across the entire platform
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/10 p-6">
                  <h4 className="text-white font-mono text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">🤖</span> AI RISK ANALYST
                  </h4>
                  <p className="text-white/70 text-xs font-mono mb-2">$0.10 per report</p>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    Natural language risk explanation powered by Groq Llama 3.3 70B. 
                    Converts complex risk data into human-readable insights.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-6">
                  <h4 className="text-white font-mono text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span> PORTFOLIO AUDIT
                  </h4>
                  <p className="text-white/70 text-xs font-mono mb-2">$0.05 per token</p>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    Batch scan your entire wallet. Dynamic pricing: 10 tokens = $0.50, 
                    20 tokens = $1.00. Perfect for portfolio risk assessment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom decorative line */}
        <section className="relative px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 opacity-40">
              <span className="text-white text-[10px] font-mono">∞</span>
              <div className="flex-1 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">TOKENOMICS.LAB</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
