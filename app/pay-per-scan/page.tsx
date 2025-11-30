/**
 * Pay-Per-Use Credits Page
 * Authenticated users can purchase credits via x402
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Zap, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import Navbar from '@/components/navbar'
import Loader from '@/components/loader'
import { useX402Payment } from '@/hooks/use-x402-payment'
import { toast } from 'sonner'

const PRESET_AMOUNTS = [
  { amount: 5, popular: false },
  { amount: 10, popular: true },
  { amount: 20, popular: false },
  { amount: 50, popular: false },
]

// Approximate conversion rates (should be fetched from API in production)
const EUR_TO_USD = 1.09 // 1 EUR = 1.09 USD
const SOL_PRICE_USD = 140 // Update this with real-time price
const USDC_PRICE_USD = 1 // USDC is pegged to USD

export default function PayPerScanPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { fetchWithPayment, isPaying } = useX402Payment()
  const [selectedPreset, setSelectedPreset] = useState(1)
  const [customAmount, setCustomAmount] = useState('')
  const [useCustomAmount, setUseCustomAmount] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<'SOL' | 'USDC'>('USDC')
  const [purchasing, setPurchasing] = useState(false)
  const [cryptoPrices, setCryptoPrices] = useState({ sol: SOL_PRICE_USD, usdc: USDC_PRICE_USD })
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/pay-per-scan')
    }
  }, [user, authLoading, router])
  
  // Redirect if not PAY_PER_USE user
  useEffect(() => {
    if (!authLoading && user && userProfile?.plan !== 'PAY_PER_USE') {
      router.push('/dashboard')
    }
  }, [user, userProfile, authLoading, router])
  
  const handlePurchase = async () => {
    setPurchasing(true)
    
    const amount = useCustomAmount 
      ? parseFloat(customAmount) 
      : PRESET_AMOUNTS[selectedPreset].amount
    
    if (isNaN(amount) || amount < 0.1) {
      toast.error('Please enter a valid amount (minimum €0.10)')
      setPurchasing(false)
      return
    }
    
    const credits = amount * 10 // $1 = 10 credits
    
    try {
      // Get Firebase auth token
      const token = await user?.getIdToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      
      // Call API with x402 payment - this will trigger the payment modal
      const result = await fetchWithPayment('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Payment-Asset': selectedAsset, // Pass selected asset to backend
        },
        body: JSON.stringify({
          amount,
          credits,
          transactionId: `credit-purchase-${Date.now()}`
        })
      })
      
      toast.success(`Successfully added ${credits} credits!`)
      
      // Refresh user profile to get updated credits
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast.error(error.message || 'Failed to purchase credits')
    } finally {
      setPurchasing(false)
    }
  }
  
  const getAmount = () => {
    if (useCustomAmount) {
      const amount = parseFloat(customAmount)
      return isNaN(amount) ? 0 : amount
    }
    return PRESET_AMOUNTS[selectedPreset].amount
  }
  
  const getCredits = () => getAmount() * 10
  
  // Convert EUR to crypto amount
  const getCryptoAmount = () => {
    const eurAmount = getAmount()
    const usdAmount = eurAmount * EUR_TO_USD
    
    if (selectedAsset === 'SOL') {
      return (usdAmount / cryptoPrices.sol).toFixed(4)
    } else {
      return (usdAmount / cryptoPrices.usdc).toFixed(2)
    }
  }
  
  if (authLoading) {
    return <Loader fullScreen text="Loading..." />
  }
  
  if (!user || userProfile?.plan !== 'PAY_PER_USE') {
    return <Loader fullScreen text="Redirecting..." />
  }
  
  const currentCredits = userProfile?.credits || 0
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-white" />
            <h1 className="text-4xl font-bold font-mono tracking-wider">BUY CREDITS</h1>
          </div>
          <p className="text-white/60 font-mono text-sm">
            Top up your account to use premium features
          </p>
          
          {/* Current Balance */}
          <div className="mt-6 inline-block bg-black/60 border border-white/20 backdrop-blur-lg px-6 py-3">
            <div className="text-white/60 text-xs font-mono mb-1">CURRENT BALANCE</div>
            <div className="text-2xl font-bold text-white font-mono">
              {currentCredits} <span className="text-white/40 text-sm">credits</span>
            </div>
          </div>
        </div>
        
        {/* Amount Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setUseCustomAmount(false)}
              className={`px-4 py-2 border-2 font-mono text-sm transition-all ${
                !useCustomAmount
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/30 text-white/60 hover:border-white/50'
              }`}
            >
              PRESET AMOUNTS
            </button>
            <button
              onClick={() => setUseCustomAmount(true)}
              className={`px-4 py-2 border-2 font-mono text-sm transition-all ${
                useCustomAmount
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/30 text-white/60 hover:border-white/50'
              }`}
            >
              CUSTOM AMOUNT
            </button>
          </div>
          
          {!useCustomAmount ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRESET_AMOUNTS.map((preset, index) => (
                <div
                  key={index}
                  className={`relative bg-black/60 border-2 backdrop-blur-lg p-6 cursor-pointer transition-all ${
                    selectedPreset === index
                      ? 'border-white'
                      : 'border-white/20 hover:border-white/40'
                  } ${preset.popular ? 'ring-2 ring-white/50' : ''}`}
                  onClick={() => setSelectedPreset(index)}
                >
                  {preset.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 text-xs font-mono font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white font-mono mb-2">
                      €{preset.amount}
                    </div>
                    <div className="text-white/60 text-xs font-mono mb-4">
                      {preset.amount * 10} CREDITS
                    </div>
                    
                    {selectedPreset === index && (
                      <CheckCircle className="w-6 h-6 text-white mx-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-black/60 border-2 border-white/20 backdrop-blur-lg p-8">
                <label className="text-white/60 text-xs font-mono uppercase mb-2 block">
                  ENTER AMOUNT (EUR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-mono text-2xl">
                    €
                  </span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="10"
                    className="w-full bg-black border-2 border-white/30 text-white font-mono text-3xl font-bold py-4 pl-12 pr-4 focus:outline-none focus:border-white"
                  />
                </div>
                <div className="text-white/60 text-sm font-mono mt-3 text-center">
                  = {customAmount ? (parseFloat(customAmount) * 10).toFixed(0) : '0'} credits
                </div>
                <div className="text-white/40 text-xs font-mono mt-2 text-center">
                  Minimum: €0.10 (1 credit)
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Purchase Summary & Button */}
        <div className="max-w-md mx-auto mb-12">
          {/* Asset Selection */}
          <div className="mb-6">
            <label className="text-white/60 text-xs font-mono uppercase mb-3 block">
              SELECT PAYMENT ASSET
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedAsset('USDC')}
                className={`p-4 border-2 transition-all ${
                  selectedAsset === 'USDC'
                    ? 'border-white bg-white/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                <div className="text-white font-mono text-sm font-bold">USDC</div>
                <div className="text-white/60 font-mono text-xs mt-1">Stablecoin</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedAsset('SOL')}
                className={`p-4 border-2 transition-all ${
                  selectedAsset === 'SOL'
                    ? 'border-white bg-white/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                <div className="text-white font-mono text-sm font-bold">SOL</div>
                <div className="text-white/60 font-mono text-xs mt-1">Native</div>
              </button>
            </div>
          </div>
          
          <div className="bg-black/40 border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm font-mono">AMOUNT (EUR)</span>
              <span className="text-white text-2xl font-mono font-bold">
                €{getAmount().toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm font-mono">PAY WITH {selectedAsset}</span>
              <span className="text-white text-2xl font-mono font-bold">
                {getCryptoAmount()} {selectedAsset}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm font-mono">CREDITS</span>
              <span className="text-white text-2xl font-mono font-bold">{getCredits()}</span>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs font-mono">RATE</span>
                <span className="text-white/60 text-xs font-mono">€0.10 per credit</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/60 text-xs font-mono">CONVERSION</span>
                <span className="text-white/60 text-xs font-mono">
                  1 {selectedAsset} ≈ €{selectedAsset === 'SOL' ? (cryptoPrices.sol / EUR_TO_USD).toFixed(2) : (cryptoPrices.usdc / EUR_TO_USD).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={purchasing || getAmount() < 0.1}
            className="w-full px-8 py-4 bg-white text-black border-2 border-white font-mono text-sm hover:bg-transparent hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
          >
            {purchasing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                PAY {getCryptoAmount()} {selectedAsset}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-white/40 text-xs font-mono mt-4 text-center">
            Payment via x402 protocol ({selectedAsset} on Solana) • €{getAmount().toFixed(2)} EUR
          </p>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-black/40 border border-white/10 p-6">
            <h3 className="text-white font-mono text-sm font-bold mb-4">WHAT YOU GET</h3>
            <ul className="space-y-3 text-white/60 text-sm font-mono">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>AI Risk Analyst (1 credit per report)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>Portfolio Audit (0.5 credits per token)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>Premium dashboard access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>Credits never expire</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/40 border border-white/10 p-6">
            <h3 className="text-white font-mono text-sm font-bold mb-4">WHY PAY-AS-YOU-GO?</h3>
            <ul className="space-y-3 text-white/60 text-sm font-mono">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>No monthly subscription</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>Pay only for what you use</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>Perfect for casual traders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span>Instant top-up anytime</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
