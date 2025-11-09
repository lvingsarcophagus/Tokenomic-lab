import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Bell, TrendingUp, Lock, BarChart3 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20"></div>
      
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          {/* Top decorative line */}
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <div className="w-8 lg:w-12 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">∞</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>

          {/* Main Title */}
          <div className="relative mb-6">
            <div className="hidden lg:block absolute -right-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
            <h1 className="text-3xl lg:text-5xl xl:text-7xl font-bold text-white mb-4 leading-tight font-mono tracking-wider">
              ADVANCED TOKEN
              <br />
              SECURITY PROTOCOL
            </h1>
          </div>

          {/* Decorative dots pattern */}
          <div className="flex gap-1 mb-6 opacity-40">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 bg-white"></div>
            ))}
          </div>

          {/* Description */}
          <div className="relative max-w-2xl">
            <p className="text-sm lg:text-base text-white/80 mb-8 leading-relaxed font-mono">
              MILITARY-GRADE TOKEN ANALYSIS SYSTEM. REAL-TIME THREAT DETECTION ACROSS MULTIPLE CHAINS. 
              AI-POWERED RISK ASSESSMENT. ZERO TOLERANCE FOR SCAMS.
            </p>
            
            <div className="hidden lg:block absolute -left-4 top-1/2 w-3 h-3 border border-white opacity-30" style={{ transform: 'translateY(-50%)' }}>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white" style={{ transform: 'translate(-50%, -50%)' }}></div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/signup">
              <button className="relative px-6 py-3 bg-transparent text-white font-mono text-xs lg:text-sm border border-white hover:bg-white hover:text-black transition-all duration-200 group">
                <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                INITIATE PROTOCOL
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className="relative px-6 py-3 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200">
                ACCESS SYSTEM
              </button>
            </Link>
          </div>

          {/* Bottom technical notation */}
          <div className="flex items-center gap-2 opacity-40">
            <span className="text-white text-[9px] font-mono">∞</span>
            <div className="flex-1 h-px bg-white max-w-xs"></div>
            <span className="text-white text-[9px] font-mono">SECURITY.PROTOCOL.V1</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">CAPABILITIES</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white font-mono tracking-wider">
              SYSTEM FEATURES
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all duration-200">
                  <BarChart3 className="w-5 h-5 text-white group-hover:text-black" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-base lg:text-lg font-bold text-white font-mono tracking-wider">MULTI-CHAIN</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  REAL-TIME ANALYSIS ACROSS ETHEREUM, SOLANA, BSC NETWORKS.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all duration-200">
                  <Zap className="w-5 h-5 text-white group-hover:text-black" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-base lg:text-lg font-bold text-white font-mono tracking-wider">AI ANALYSIS</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  NEURAL NETWORK RISK ASSESSMENT WITH PLAIN-LANGUAGE OUTPUT.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all duration-200">
                  <Bell className="w-5 h-5 text-white group-hover:text-black" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-base lg:text-lg font-bold text-white font-mono tracking-wider">ALERTS</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  INSTANT THREAT NOTIFICATIONS FOR WATCHLIST TOKENS.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all duration-200">
                  <TrendingUp className="w-5 h-5 text-white group-hover:text-black" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-base lg:text-lg font-bold text-white font-mono tracking-wider">TRACKING</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  PORTFOLIO MONITORING WITH RISK METRICS AND ANALYTICS.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all duration-200">
                  <Lock className="w-5 h-5 text-white group-hover:text-black" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-base lg:text-lg font-bold text-white font-mono tracking-wider">CONTRACT AUDIT</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  DEEP SMART CONTRACT VULNERABILITY DETECTION SYSTEM.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all duration-200">
                  <Shield className="w-5 h-5 text-white group-hover:text-black" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <h4 className="text-base lg:text-lg font-bold text-white font-mono tracking-wider">SCAM DETECT</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  ADVANCED HONEYPOT AND RUG PULL IDENTIFICATION.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">ACCESS LEVELS</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white font-mono tracking-wider">
              PRICING TIERS
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className="text-white text-[9px] font-mono">TIER.01</span>
                </div>
                <h4 className="text-xl lg:text-2xl font-bold text-white mb-2 font-mono tracking-wider">FREE</h4>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-6 font-mono">
                  $0<span className="text-sm lg:text-lg text-white/40 font-mono">/MONTH</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    20 ANALYSES/DAY
                  </li>
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    BASIC RISK SCORE
                  </li>
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    COMMUNITY ALERTS
                  </li>
                </ul>
                <Link href="/signup">
                  <button className="w-full px-6 py-3 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200">
                    ACTIVATE FREE
                  </button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border-2 border-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 text-[8px] lg:text-xs font-mono tracking-wider border border-white">
                RECOMMENDED
              </div>
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className="text-white text-[9px] font-mono">TIER.02</span>
                </div>
                <h4 className="text-xl lg:text-2xl font-bold text-white mb-2 font-mono tracking-wider">PRO</h4>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-6 font-mono">
                  $29<span className="text-sm lg:text-lg text-white/40 font-mono">/MONTH</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    UNLIMITED ANALYSES
                  </li>
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    ADVANCED AI INSIGHTS
                  </li>
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    CUSTOM ALERTS
                  </li>
                  <li className="flex items-center text-white/80 text-xs lg:text-sm font-mono">
                    <span className="text-white mr-3">▸</span>
                    API ACCESS
                  </li>
                </ul>
                <Link href="/pricing">
                  <button className="w-full px-6 py-3 bg-white text-black font-mono text-xs lg:text-sm hover:bg-transparent hover:text-white border-2 border-white transition-all duration-200">
                    UPGRADE TO PRO
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
