"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { theme } from "@/lib/theme"
import { ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <div className={`relative min-h-screen ${theme.backgrounds.main} overflow-hidden`}>
      {/* Stars background */}
      <div className="fixed inset-0 stars-bg pointer-events-none"></div>

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20"></div>

      {/* Page Content */}
      <div className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
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

          {/* Section Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 opacity-60">
              <div className={theme.decorative.divider}></div>
              <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>ACCESS LEVELS</span>
              <div className="flex-1 h-px bg-white"></div>
            </div>
            <h1 className={`${theme.text.hero} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} mb-4`}>
              PRICING TIERS
            </h1>
            <p className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.base}`}>
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Tier 1: Free */}
            <Card className={`${theme.backgrounds.card} border ${theme.borders.default}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className={`${theme.text.primary} text-[9px] ${theme.fonts.mono}`}>TIER.01</span>
                </div>
                <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} mb-2 ${theme.fonts.mono} ${theme.fonts.tracking}`}>FREE</h2>
                <div className={`text-4xl ${theme.fonts.bold} ${theme.text.primary} mb-4 ${theme.fonts.mono}`}>
                  $0<span className={`text-sm ${theme.text.secondary} ${theme.fonts.mono}`}>/MONTH</span>
                </div>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} mb-6`}>Casual User / Social Sharer</p>
                
                <ul className="space-y-2 mb-6">
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    Honeypot Check
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    Risk Score (0-100)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    PDF Export (Watermarked)
                  </li>
                  <li className={`flex items-center text-white/40 text-sm ${theme.fonts.mono}`}>
                    <span className={`text-white/30 mr-3`}>✗</span>
                    AI Risk Analyst
                  </li>
                  <li className={`flex items-center text-white/40 text-sm ${theme.fonts.mono}`}>
                    <span className={`text-white/30 mr-3`}>✗</span>
                    Portfolio Audit
                  </li>
                  <li className={`flex items-center text-white/40 text-sm ${theme.fonts.mono}`}>
                    <span className={`text-white/30 mr-3`}>✗</span>
                    Smart Alerts
                  </li>
                </ul>
                
                <Link href="/signup">
                  <Button className={`w-full ${theme.buttons.primary} uppercase text-sm`}>
                    GET STARTED
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tier 2: Pay-As-You-Go */}
            <Card className={`${theme.backgrounds.card} border-2 border-blue-500/30 relative`}>
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 ${theme.text.small} ${theme.fonts.mono} ${theme.fonts.tracking} font-bold`}>
                ⚡ x402 CREDITS
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className={`${theme.text.primary} text-[9px] ${theme.fonts.mono}`}>TIER.02</span>
                </div>
                <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} mb-2 ${theme.fonts.mono} ${theme.fonts.tracking}`}>PAY-AS-YOU-GO</h2>
                <div className={`text-4xl ${theme.fonts.bold} ${theme.text.primary} mb-2 ${theme.fonts.mono}`}>
                  $5<span className={`text-sm ${theme.text.secondary} ${theme.fonts.mono}`}> = 50 Credits</span>
                </div>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} mb-1`}>USDC on Base (x402)</p>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} mb-4`}>Weekend Trader</p>
                
                <ul className="space-y-2 mb-6">
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    Honeypot Check (Free)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    Risk Score (Free)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    PDF Export (No watermark)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`text-blue-400 mr-3`}>⚡</span>
                    AI Risk Analyst (1 Credit)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`text-blue-400 mr-3`}>⚡</span>
                    Portfolio Audit (0.5 Credits/token)
                  </li>
                  <li className={`flex items-center text-white/40 text-sm ${theme.fonts.mono}`}>
                    <span className={`text-white/30 mr-3`}>✗</span>
                    Smart Alerts
                  </li>
                </ul>
                
                <Link href="/pay-per-scan">
                  <Button className={`w-full bg-blue-500 hover:bg-blue-600 text-white border-blue-500 uppercase text-sm font-bold`}>
                    BUY CREDITS
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tier 3: Pro Plan */}
            <Card className={`${theme.backgrounds.card} border-2 ${theme.borders.accent} relative`}>
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 ${theme.text.small} ${theme.fonts.mono} ${theme.fonts.tracking} font-bold`}>
                ⚡ RECOMMENDED
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                  <div className="w-6 h-px bg-white"></div>
                  <span className={`${theme.text.primary} text-[9px] ${theme.fonts.mono}`}>TIER.03</span>
                </div>
                <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} mb-2 ${theme.fonts.mono} ${theme.fonts.tracking}`}>PRO PLAN</h2>
                <div className={`text-4xl ${theme.fonts.bold} ${theme.text.primary} mb-2 ${theme.fonts.mono}`}>
                  $29<span className={`text-sm ${theme.text.secondary} ${theme.fonts.mono}`}>/MONTH</span>
                </div>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} mb-6`}>Active Power User</p>
                
                <ul className="space-y-2 mb-6">
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    Honeypot Check
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    Risk Score
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>✓</span>
                    PDF Export (Custom branding)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>∞</span>
                    AI Risk Analyst (Unlimited)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>∞</span>
                    Portfolio Audit (Unlimited)
                  </li>
                  <li className={`flex items-center ${theme.text.secondary} text-sm ${theme.fonts.mono}`}>
                    <span className={`${theme.text.primary} mr-3`}>⚡</span>
                    Smart Alerts (24/7)
                  </li>
                </ul>
                
                <Link href="/premium-signup">
                  <Button className={`w-full ${theme.buttons.secondary} uppercase text-sm font-bold`}>
                    UPGRADE TO PRO
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* How Credits Work Section */}
          <div className="mt-16 border border-white/20 bg-black/40 backdrop-blur-lg p-8 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-white/30 flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <h3 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>HOW x402 CREDITS WORK</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white/90 font-mono font-bold">
                  1
                </div>
                <h4 className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold mb-2`}>SIGN IN</h4>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} leading-relaxed`}>
                  Log in using your Web3 Wallet via Firebase Authentication
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white/90 font-mono font-bold">
                  2
                </div>
                <h4 className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold mb-2`}>TOP-UP</h4>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} leading-relaxed`}>
                  Click "Add Funds" and select $5.00 (50 Credits). Pay with USDC via x402
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white/90 font-mono font-bold">
                  3
                </div>
                <h4 className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold mb-2`}>TRACK BALANCE</h4>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} leading-relaxed`}>
                  Dashboard displays progress bar: "Credits Remaining: 50 / 50"
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center mx-auto mb-3 text-white/90 font-mono font-bold">
                  4
                </div>
                <h4 className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold mb-2`}>USE INSTANTLY</h4>
                <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono} leading-relaxed`}>
                  Request AI Report (1 credit) or Portfolio Audit (0.5 credits/token). No wallet popup needed
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div>
                  <h5 className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold mb-1`}>AI ANALYST (1 Credit)</h5>
                  <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono}`}>Natural language risk explanation powered by Llama 3.3 70B</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">👁️</span>
                </div>
                <div>
                  <h5 className={`${theme.text.primary} ${theme.fonts.mono} text-sm font-bold mb-1`}>PORTFOLIO AUDIT (0.5 Credits/token)</h5>
                  <p className={`${theme.text.secondary} text-xs ${theme.fonts.mono}`}>Batch scan your wallet. 10 tokens = 5 credits ($0.50)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="flex items-center gap-2 mt-12 opacity-40">
            <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>{theme.decorative.infinity}</span>
            <div className="flex-1 h-px bg-white"></div>
            <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>TOKENGUARD.PROTOCOL</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stars-bg {
          background-image: 
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent),
            radial-gradient(1px 1px at 15% 60%, white, transparent),
            radial-gradient(1px 1px at 70% 40%, white, transparent);
          background-size: 200% 200%, 180% 180%, 250% 250%, 220% 220%, 190% 190%, 240% 240%, 210% 210%, 230% 230%;
          background-position: 0% 0%, 40% 40%, 60% 60%, 20% 20%, 80% 80%, 30% 30%, 70% 70%, 50% 50%;
          opacity: 0.3;
        }
      `}</style>
    </div>
    </>
  )
}
