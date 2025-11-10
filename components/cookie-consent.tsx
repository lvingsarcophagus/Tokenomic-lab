'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, Shield, X } from 'lucide-react'

interface CookieConsent {
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('tokenomicslab-cookie-consent')
    if (!consent) {
      // Show banner after 1 second delay (better UX)
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load analytics if previously consented
      const consentData: CookieConsent = JSON.parse(consent)
      if (consentData.analytics) {
        loadAnalytics()
      }
    }
  }, [])
  
  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    }
    
    localStorage.setItem('tokenomicslab-cookie-consent', JSON.stringify(consent))
    loadAnalytics()
    setShowBanner(false)
  }
  
  const handleEssentialOnly = () => {
    const consent: CookieConsent = {
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    }
    
    localStorage.setItem('tokenomicslab-cookie-consent', JSON.stringify(consent))
    setShowBanner(false)
  }
  
  const handleCustomize = (analytics: boolean, marketing: boolean) => {
    const consent: CookieConsent = {
      analytics,
      marketing,
      timestamp: Date.now()
    }
    
    localStorage.setItem('tokenomicslab-cookie-consent', JSON.stringify(consent))
    
    if (analytics) {
      loadAnalytics()
    }
    
    setShowBanner(false)
    setShowDetails(false)
  }
  
  const loadAnalytics = () => {
    // Load Firebase Analytics only after user consent
    if (typeof window !== 'undefined') {
      console.log('[Cookie Consent] Analytics loaded with user consent')
      // Firebase Analytics will be loaded from firebase-analytics.ts if consent is given
    }
  }
  
  if (!showBanner) return null
  
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40" />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-xl rounded-none border-2 border-white/20 shadow-2xl shadow-white/5">
          
          {showDetails ? (
            // Detailed cookie settings
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-mono tracking-wider">
                  <Cookie className="w-5 h-5 text-white" />
                  COOKIE SETTINGS
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white/60 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 mb-8">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-5 bg-white/5 border-2 border-white/20 hover:border-white/30 transition">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2 font-mono text-sm tracking-wider">
                      <Shield className="w-4 h-4 text-white" />
                      ESSENTIAL COOKIES (REQUIRED)
                    </h4>
                    <p className="text-xs text-white/60 font-mono leading-relaxed">
                      NECESSARY FOR AUTHENTICATION AND CORE FUNCTIONALITY. CANNOT BE DISABLED.
                    </p>
                  </div>
                  <div className="ml-4 px-3 py-1 border border-white/50 text-white text-xs font-bold font-mono tracking-wider">
                    ALWAYS ACTIVE
                  </div>
                </div>
                
                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-5 bg-white/5 border-2 border-white/20 hover:border-white/30 transition">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2 font-mono text-sm tracking-wider">
                      ANALYTICS COOKIES
                    </h4>
                    <p className="text-xs text-white/60 font-mono leading-relaxed">
                      HELP US UNDERSTAND HOW YOU USE THE PLATFORM TO IMPROVE FEATURES.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      id="analytics-toggle"
                      className="sr-only peer"
                      defaultChecked={false}
                    />
                    <div className="w-12 h-6 bg-white/10 border-2 border-white/30 peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-2 after:border-white after:h-6 after:w-6 after:transition-all peer-checked:bg-white/20"></div>
                  </label>
                </div>
                
                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-5 bg-white/5 border-2 border-white/20 hover:border-white/30 transition">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2 font-mono text-sm tracking-wider">
                      MARKETING COOKIES
                    </h4>
                    <p className="text-xs text-white/60 font-mono leading-relaxed">
                      TRACK REFERRALS AND CAMPAIGNS. NO PERSONAL DATA SOLD TO THIRD PARTIES.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      id="marketing-toggle"
                      className="sr-only peer"
                      defaultChecked={false}
                    />
                    <div className="w-12 h-6 bg-white/10 border-2 border-white/30 peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-2 after:border-white after:h-6 after:w-6 after:transition-all peer-checked:bg-white/20"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 transition font-mono font-bold tracking-wider"
                >
                  BACK
                </button>
                <button
                  onClick={() => {
                    const analytics = (document.getElementById('analytics-toggle') as HTMLInputElement).checked
                    const marketing = (document.getElementById('marketing-toggle') as HTMLInputElement).checked
                    handleCustomize(analytics, marketing)
                  }}
                  className="flex-1 px-6 py-3 bg-white text-black hover:bg-white/90 font-mono font-bold tracking-wider transition"
                >
                  SAVE PREFERENCES
                </button>
              </div>
            </div>
          ) : (
            // Simple consent banner
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl opacity-80">🍪</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 font-mono tracking-wider">
                    WE VALUE YOUR PRIVACY
                  </h3>
                  <p className="text-sm text-white/70 mb-6 font-mono leading-relaxed tracking-wide">
                    TOKENOMICS LAB USES COOKIES TO PROVIDE ESSENTIAL FUNCTIONALITY AND IMPROVE YOUR EXPERIENCE. 
                    WE NEVER SELL YOUR DATA. LEARN MORE IN OUR{' '}
                    <Link href="/privacy" className="text-white underline hover:text-white/80 font-bold">
                      PRIVACY POLICY
                    </Link>.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-3 bg-white text-black hover:bg-white/90 font-bold transition font-mono tracking-wider"
                    >
                      ACCEPT ALL
                    </button>
                    <button
                      onClick={handleEssentialOnly}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 font-bold transition font-mono tracking-wider"
                    >
                      ESSENTIAL ONLY
                    </button>
                    <button
                      onClick={() => setShowDetails(true)}
                      className="px-6 py-3 text-white/70 hover:text-white font-bold transition font-mono tracking-wider underline"
                    >
                      CUSTOMIZE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
