"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Bell, TrendingUp, Lock, BarChart3, Search, Eye, Activity, Database, Globe, CheckCircle, ArrowRight, Flame, Target, Users, AlertTriangle, Menu, X } from "lucide-react"
import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"

// Dynamically import the 3D scene to avoid SSR issues
const GenerativeArtScene = dynamic(
  () => import("@/components/generative-art-scene"),
  { ssr: false }
)

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Landing Page Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <img 
                src="/Logo.png" 
                alt="Tokenomics Lab" 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] group-hover:rotate-[5deg]" 
              />
              <div className="hidden sm:block">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-white font-mono tracking-widest group-hover:text-white/90 transition-colors drop-shadow-lg">
                  TOKENOMICS LAB
                </span>
                <div className="text-[7px] sm:text-[8px] text-white/60 font-mono -mt-0.5 tracking-wider group-hover:text-white/80 transition-colors">ANALYTICS.PLATFORM</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/pricing">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 border border-white/20 text-xs font-mono px-3 py-1.5 h-8">
                  PRICING
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 border border-white/20 text-xs font-mono px-3 py-1.5 h-8">
                  LOGIN
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-black text-xs font-mono px-3 py-1.5 h-8 transition-all">
                  SIGN UP
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border-2 border-white/20 hover:border-white/40 hover:bg-white/10 backdrop-blur-md transition-all duration-300 group hover:shadow-lg hover:shadow-white/5 h-9 w-9 flex items-center justify-center"
            >
              {mobileMenuOpen ? 
                <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" /> : 
                <Menu className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-black/40 backdrop-blur-xl animate-in slide-in-from-top-2">
            <div className="px-3 py-4 space-y-2">
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-3 py-2.5 border-2 border-white/20 hover:border-white/30 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all duration-300 font-mono text-[10px]">
                  PRICING
                </button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-3 py-2.5 border-2 border-white/20 hover:border-white/30 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all duration-300 font-mono text-[10px]">
                  LOGIN
                </button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-3 py-2.5 border-2 border-white/40 bg-white/5 hover:bg-white/15 backdrop-blur-md text-white transition-all duration-300 font-mono text-[10px] font-bold">
                  SIGN UP
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20"></div>
      
      {/* 3D Generative Art Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <GenerativeArtScene />
        </Suspense>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl w-full">
          {/* Top decorative line */}
          <div className="flex items-center gap-2 mb-8 opacity-60">
            <div className="w-8 lg:w-12 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">∞</span>
            <div className="flex-1 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">TOKENOMICS.LAB</span>
          </div>

          {/* Main Title - Enhanced */}
          <div className="relative mb-8">
            <div className="hidden lg:block absolute -right-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
            <h1 className="text-4xl lg:text-6xl xl:text-8xl font-bold text-white mb-6 leading-tight font-mono tracking-wider">
              PROFESSIONAL
              <br />
              <span className="text-white/80">TOKENOMICS</span> ANALYSIS
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-white/10 border border-white/30 backdrop-blur-sm">
                <span className="text-white text-xs font-mono tracking-wider">MULTI-CHAIN</span>
              </div>
              <div className="px-3 py-1 bg-white/10 border border-white/30 backdrop-blur-sm">
                <span className="text-white text-xs font-mono tracking-wider">REAL-TIME</span>
              </div>
              <div className="px-3 py-1 bg-white/10 border border-white/30 backdrop-blur-sm">
                <span className="text-white text-xs font-mono tracking-wider">AI-POWERED</span>
              </div>
            </div>
          </div>

          {/* Decorative dots pattern */}
          <div className="flex gap-1 mb-8 opacity-40">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 bg-white"></div>
            ))}
          </div>

          {/* Description - Enhanced */}
          <div className="relative max-w-3xl mb-10">
            <p className="text-base lg:text-lg text-white/90 mb-6 leading-relaxed font-mono">
              COMPREHENSIVE TOKENOMICS ANALYSIS PLATFORM. REAL-TIME RISK ASSESSMENT & SECURITY AUDITS. 
              PROFESSIONAL-GRADE ANALYTICS ACROSS 7+ BLOCKCHAINS.
            </p>
            <p className="text-sm lg:text-base text-white/70 mb-8 leading-relaxed font-mono">
              Powered by 5+ premium APIs including GoPlus, DexScreener, and Moralis. 
              Advanced 7-factor risk scoring with behavioral analysis. Expert insights for informed trading decisions.
            </p>
            
            <div className="hidden lg:block absolute -left-4 top-1/2 w-3 h-3 border border-white opacity-30" style={{ transform: 'translateY(-50%)' }}>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white" style={{ transform: 'translate(-50%, -50%)' }}></div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="border border-white/20 bg-black/40 backdrop-blur-sm p-4">
              <div className="text-2xl lg:text-3xl font-bold text-white font-mono mb-1">7+</div>
              <div className="text-xs text-white/60 font-mono">BLOCKCHAINS</div>
            </div>
            <div className="border border-white/20 bg-black/40 backdrop-blur-sm p-4">
              <div className="text-2xl lg:text-3xl font-bold text-white font-mono mb-1">5</div>
              <div className="text-xs text-white/60 font-mono">API SOURCES</div>
            </div>
            <div className="border border-white/20 bg-black/40 backdrop-blur-sm p-4">
              <div className="text-2xl lg:text-3xl font-bold text-white font-mono mb-1">7</div>
              <div className="text-xs text-white/60 font-mono">RISK FACTORS</div>
            </div>
            <div className="border border-white/20 bg-black/40 backdrop-blur-sm p-4">
              <div className="text-2xl lg:text-3xl font-bold text-white font-mono mb-1">24/7</div>
              <div className="text-xs text-white/60 font-mono">MONITORING</div>
            </div>
          </div>

          {/* CTA Buttons - Enhanced */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <button className="relative px-10 py-5 bg-white text-black font-mono text-base lg:text-lg border-2 border-white hover:bg-transparent hover:text-white transition-all duration-200 group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2 justify-center font-bold">
                  ACCESS SYSTEM
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
              </button>
            </Link>
            
            <Link href="/signup">
              <button className="relative px-10 py-5 bg-transparent border-2 border-white text-white font-mono text-base lg:text-lg hover:bg-white/10 transition-all duration-200 group">
                <span className="flex items-center gap-2 justify-center">
                  GET STARTED FREE
                  <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </span>
              </button>
            </Link>
          </div>

          {/* Bottom technical notation */}
          <div className="flex items-center gap-2 opacity-40">
            <span className="text-white text-[9px] font-mono">∞</span>
            <div className="flex-1 h-px bg-white max-w-xs"></div>
            <span className="text-white text-[9px] font-mono">SECURITY.PROTOCOL.V1.0</span>
            <div className="flex-1 h-px bg-white max-w-xs"></div>
            <span className="text-white text-[9px] font-mono">∞</span>
          </div>
        </div>
      </section>

      {/* Core Technology Section - NEW */}
      <section className="relative px-6 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">CORE.TECHNOLOGY</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white font-mono tracking-wider mb-4">
              POWERED BY INDUSTRY LEADERS
            </h2>
            <p className="text-white/60 text-sm lg:text-base font-mono max-w-3xl">
              Our advanced risk engine aggregates data from multiple premium sources for comprehensive token analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-white" />
                  <h4 className="text-lg font-bold text-white font-mono">GOPLUS</h4>
                </div>
                <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
                  Smart contract security analysis, honeypot detection, and token safety verification.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-white/40 font-mono">PRIMARY SECURITY</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-white" />
                  <h4 className="text-lg font-bold text-white font-mono">DEXSCREENER</h4>
                </div>
                <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
                  Real-time DEX data aggregation, liquidity tracking, and price monitoring across chains.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-white/40 font-mono">MARKET DATA</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-white" />
                  <h4 className="text-lg font-bold text-white font-mono">MOBULA</h4>
                </div>
                <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
                  Multi-chain token search, metadata aggregation, and cross-chain discovery.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-white/40 font-mono">TOKEN SEARCH</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-white" />
                  <h4 className="text-lg font-bold text-white font-mono">MORALIS</h4>
                </div>
                <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
                  Blockchain indexing, token metadata, holder analytics, and transaction tracking.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-white/40 font-mono">BLOCKCHAIN DATA</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <h4 className="text-lg font-bold text-white font-mono">COINGECKO</h4>
                </div>
                <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
                  Historical price data, market metrics, volume tracking, and token rankings.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-white/40 font-mono">PRICE HISTORY</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-white" />
                  <h4 className="text-lg font-bold text-white font-mono">CUSTOM AI</h4>
                </div>
                <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
                  Proprietary 7-factor risk algorithm with confidence scoring and behavioral analysis.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-white/40 font-mono">RISK ENGINE</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="relative px-6 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">CAPABILITIES</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white font-mono tracking-wider mb-4">
              ADVANCED FEATURES
            </h2>
            <p className="text-white/60 text-sm lg:text-base font-mono max-w-3xl">
              Comprehensive security analysis toolkit designed for both novice and professional crypto traders.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-200">
                  <Search className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-lg font-bold text-white font-mono tracking-wider">MULTI-CHAIN SEARCH</h4>
                </div>
                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  Search tokens across Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, and Base with real-time suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-200">
                  <AlertTriangle className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-lg font-bold text-white font-mono tracking-wider">SCAM DETECTION</h4>
                </div>
                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  Advanced honeypot detection, rug pull identification, and malicious contract analysis with 93%+ confidence.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-200">
                  <BarChart3 className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-lg font-bold text-white font-mono tracking-wider">RISK SCORING</h4>
                </div>
                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  7-factor algorithm analyzing contract security, supply distribution, liquidity, whale concentration, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-200">
                  <Eye className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-lg font-bold text-white font-mono tracking-wider">WATCHLIST</h4>
                </div>
                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  Track unlimited tokens with real-time price updates, risk monitoring, and customizable alerts for portfolio management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-200">
                  <Activity className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-lg font-bold text-white font-mono tracking-wider">LIVE CHARTS</h4>
                </div>
                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  Historical analytics with 6 comprehensive charts: risk timeline, price history, holder trends, volume, and whale activity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-200">
                  <Bell className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-lg font-bold text-white font-mono tracking-wider">SMART ALERTS</h4>
                </div>
                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  Instant notifications for risk increases, price changes, liquidity drops, and suspicious holder activity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section - NEW */}
      <section className="relative px-6 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">PROCESS</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white font-mono tracking-wider mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-white/60 text-sm lg:text-base font-mono max-w-3xl">
              Three simple steps to secure your investments and avoid scams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -left-4 top-0 text-6xl font-bold text-white/10 font-mono">01</div>
              <div className="relative z-10">
                <div className="w-16 h-16 border-2 border-white/30 bg-black/80 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white font-mono mb-3 tracking-wider">SEARCH TOKEN</h3>
                <p className="text-white/60 text-sm font-mono leading-relaxed mb-4">
                  Enter any token symbol or contract address. Our system searches across 7+ blockchains with intelligent auto-suggestions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white/10 border border-white/20 text-[10px] font-mono text-white">ETHEREUM</span>
                  <span className="px-2 py-1 bg-white/10 border border-white/20 text-[10px] font-mono text-white">BSC</span>
                  <span className="px-2 py-1 bg-white/10 border border-white/20 text-[10px] font-mono text-white">POLYGON</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 text-6xl font-bold text-white/10 font-mono">02</div>
              <div className="relative z-10">
                <div className="w-16 h-16 border-2 border-white/30 bg-black/80 flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white font-mono mb-3 tracking-wider">ANALYZE</h3>
                <p className="text-white/60 text-sm font-mono leading-relaxed mb-4">
                  Our AI engine analyzes 7 risk factors using data from 5 premium APIs, delivering results in seconds with confidence scores.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white"></div>
                    <span className="text-[10px] font-mono text-white/60">CONTRACT SECURITY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white"></div>
                    <span className="text-[10px] font-mono text-white/60">SUPPLY DISTRIBUTION</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white"></div>
                    <span className="text-[10px] font-mono text-white/60">WHALE CONCENTRATION</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 text-6xl font-bold text-white/10 font-mono">03</div>
              <div className="relative z-10">
                <div className="w-16 h-16 border-2 border-white/30 bg-black/80 flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white font-mono mb-3 tracking-wider">MONITOR</h3>
                <p className="text-white/60 text-sm font-mono leading-relaxed mb-4">
                  Add tokens to your watchlist for 24/7 monitoring. Receive instant alerts on risk changes, price movements, and suspicious activity.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-mono text-white/60">REAL-TIME UPDATES</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-mono text-white/60">CUSTOM ALERTS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-mono text-white/60">HISTORICAL CHARTS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Enhanced */}
      <section className="relative px-6 py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="flex items-center gap-2 mb-4 opacity-60 justify-center">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">ACCESS LEVELS</span>
              <div className="w-8 h-px bg-white"></div>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white font-mono tracking-wider mb-4">
              CHOOSE YOUR PLAN
            </h2>
            <p className="text-white/60 text-sm lg:text-base font-mono max-w-2xl mx-auto">
              Start with our free tier and upgrade when you need advanced features. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all">
              <CardContent className="p-8 lg:p-10">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className="text-white text-[9px] font-mono">TIER.01</span>
                </div>
                <h4 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-mono tracking-wider">FREE</h4>
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2 font-mono">
                  $0
                </div>
                <p className="text-sm text-white/40 font-mono mb-8">PERFECT FOR GETTING STARTED</p>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">20 SCANS PER DAY</div>
                      <div className="text-white/60 text-xs font-mono">Analyze up to 20 tokens daily</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">BASIC RISK SCORE</div>
                      <div className="text-white/60 text-xs font-mono">7-factor risk analysis with confidence</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">MULTI-CHAIN SUPPORT</div>
                      <div className="text-white/60 text-xs font-mono">Access all 7+ supported chains</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">COMMUNITY ALERTS</div>
                      <div className="text-white/60 text-xs font-mono">General market notifications</div>
                    </div>
                  </li>
                </ul>

                <Link href="/signup" className="block">
                  <button className="w-full px-6 py-4 bg-transparent border-2 border-white text-white font-mono text-sm hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2 group">
                    START FREE
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-lg border-2 border-white relative overflow-hidden">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 text-xs font-mono tracking-wider border-2 border-white z-10">
                ⚡ RECOMMENDED
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              
              <CardContent className="p-8 lg:p-10 relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className="text-white text-[9px] font-mono">TIER.02</span>
                </div>
                <h4 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-mono tracking-wider">PREMIUM</h4>
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2 font-mono">
                  $29
                </div>
                <p className="text-sm text-white/40 font-mono mb-8">FOR SERIOUS TRADERS</p>

                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">UNLIMITED SCANS</div>
                      <div className="text-white/60 text-xs font-mono">Analyze as many tokens as you need</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">ADVANCED AI INSIGHTS</div>
                      <div className="text-white/60 text-xs font-mono">Deep behavioral analysis & predictions</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">UNLIMITED WATCHLIST</div>
                      <div className="text-white/60 text-xs font-mono">Track portfolio with custom alerts</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">HISTORICAL CHARTS</div>
                      <div className="text-white/60 text-xs font-mono">6 comprehensive analytics charts</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">PRIORITY SUPPORT</div>
                      <div className="text-white/60 text-xs font-mono">24/7 dedicated assistance</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-mono text-sm font-bold mb-1">API ACCESS</div>
                      <div className="text-white/60 text-xs font-mono">Integrate with your tools</div>
                    </div>
                  </li>
                </ul>

                <Link href="/pricing" className="block">
                  <button className="w-full px-6 py-4 bg-white text-black font-mono text-sm hover:bg-transparent hover:text-white border-2 border-white transition-all duration-200 flex items-center justify-center gap-2 group font-bold">
                    UPGRADE TO PREMIUM
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Money-back guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/20 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-mono">30-DAY MONEY-BACK GUARANTEE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-6 py-32 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white font-mono tracking-wider mb-6">
            ELEVATE YOUR TOKEN RESEARCH
          </h2>
          <p className="text-white/70 text-base lg:text-lg font-mono mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of traders using Tokenomics Lab for comprehensive token analysis, risk assessment, and data-driven investment decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <button className="px-10 py-5 bg-white text-black font-mono text-base border-2 border-white hover:bg-transparent hover:text-white transition-all duration-200 group font-bold">
                <span className="flex items-center gap-2 justify-center">
                  GET STARTED FREE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className="px-10 py-5 bg-transparent border-2 border-white text-white font-mono text-base hover:bg-white/10 transition-all duration-200">
                VIEW DEMO
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-white/40 text-xs font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>NO CREDIT CARD</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>FREE FOREVER</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>INSTANT ACCESS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
