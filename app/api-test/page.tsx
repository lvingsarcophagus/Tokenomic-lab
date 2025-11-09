"use client"

import { useState } from "react"
import { theme } from "@/lib/theme"
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface APIStatus {
  name: string
  status: 'idle' | 'loading' | 'success' | 'error'
  data?: Record<string, unknown>
  error?: string
  timestamp?: string
}

export default function APITestPage() {
  const [testAddress, setTestAddress] = useState("0xdac17f958d2ee523a2206206994597c13d831ec7") // USDT
  const [apis, setApis] = useState<APIStatus[]>([
    { name: "Mobula API", status: 'idle' },
    { name: "CoinGecko API", status: 'idle' },
    { name: "CoinMarketCap API", status: 'idle' },
    { name: "GoPlus Security API", status: 'idle' },
  ])

  const updateAPIStatus = (index: number, update: Partial<APIStatus>) => {
    setApis(prev => {
      const newApis = [...prev]
      newApis[index] = { ...newApis[index], ...update }
      return newApis
    })
  }

  const testMobula = async () => {
    const index = 0
    updateAPIStatus(index, { status: 'loading', timestamp: new Date().toISOString() })
    
    try {
      const response = await fetch(`https://api.mobula.io/api/1/market/data?asset=${testAddress}`, {
        headers: { 'Authorization': process.env.NEXT_PUBLIC_MOBULA_API_KEY || '' }
      })
      
      const data = await response.json()
      
      if (response.ok && data.data) {
        updateAPIStatus(index, { 
          status: 'success', 
          data: {
            name: data.data.name,
            symbol: data.data.symbol,
            price: data.data.price,
            marketCap: data.data.market_cap,
            volume: data.data.volume
          }
        })
      } else {
        updateAPIStatus(index, { status: 'error', error: data.error || 'Failed to fetch data' })
      }
    } catch (error) {
      updateAPIStatus(index, { status: 'error', error: (error as Error).message })
    }
  }

  const testCoinGecko = async () => {
    const index = 1
    updateAPIStatus(index, { status: 'loading', timestamp: new Date().toISOString() })
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${testAddress}`,
        {
          headers: {
            'accept': 'application/json',
            'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY || ''
          }
        }
      )
      
      const data = await response.json()
      
      if (response.ok && data.id) {
        updateAPIStatus(index, { 
          status: 'success', 
          data: {
            name: data.name,
            symbol: data.symbol,
            price: data.market_data?.current_price?.usd,
            marketCap: data.market_data?.market_cap?.usd,
            volume: data.market_data?.total_volume?.usd
          }
        })
      } else {
        updateAPIStatus(index, { status: 'error', error: data.error || 'Failed to fetch data' })
      }
    } catch (error) {
      updateAPIStatus(index, { status: 'error', error: (error as Error).message })
    }
  }

  const testCoinMarketCap = async () => {
    const index = 2
    updateAPIStatus(index, { status: 'loading', timestamp: new Date().toISOString() })
    
    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?address=${testAddress}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      )
      
      const data = await response.json()
      
      if (response.ok && data.data) {
        const tokenData = Object.values(data.data)[0] as { name: string; symbol: string }
        updateAPIStatus(index, { 
          status: 'success', 
          data: {
            name: tokenData.name,
            symbol: tokenData.symbol,
            platform: 'CoinMarketCap'
          }
        })
      } else {
        updateAPIStatus(index, { status: 'error', error: data.status?.error_message || 'Failed to fetch data' })
      }
    } catch (error) {
      updateAPIStatus(index, { status: 'error', error: (error as Error).message })
    }
  }

  const testGoPlus = async () => {
    const index = 3
    updateAPIStatus(index, { status: 'loading', timestamp: new Date().toISOString() })
    
    try {
      const response = await fetch(
        `https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${testAddress}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      const data = await response.json()
      
      if (response.ok && data.result) {
        const tokenData = data.result[testAddress.toLowerCase()]
        updateAPIStatus(index, { 
          status: 'success', 
          data: {
            isProxy: tokenData.is_proxy,
            isOpenSource: tokenData.is_open_source,
            canTakeBackOwnership: tokenData.can_take_back_ownership,
            ownerChangeBalance: tokenData.owner_change_balance,
            hiddenOwner: tokenData.hidden_owner,
            buyTax: tokenData.buy_tax,
            sellTax: tokenData.sell_tax
          }
        })
      } else {
        updateAPIStatus(index, { status: 'error', error: 'Failed to fetch security data' })
      }
    } catch (error) {
      updateAPIStatus(index, { status: 'error', error: (error as Error).message })
    }
  }

  const testAllAPIs = async () => {
    await Promise.all([
      testMobula(),
      testCoinGecko(),
      testCoinMarketCap(),
      testGoPlus()
    ])
  }

  const getStatusIcon = (status: APIStatus['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 text-white animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />
      default:
        return <div className="w-5 h-5 border border-white/30"></div>
    }
  }

  return (
    <div className={`relative min-h-screen ${theme.backgrounds.main} overflow-hidden`}>
      {/* Stars background */}
      <div className="fixed inset-0 stars-bg pointer-events-none"></div>

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20"></div>

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <div className={theme.decorative.divider}></div>
            <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>API DIAGNOSTICS</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-white" />
            <h1 className={`text-3xl ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>
              API TESTING PANEL
            </h1>
          </div>
          <p className={`mt-2 ${theme.text.secondary} ${theme.fonts.mono} ${theme.text.base}`}>
            Test all integrated APIs and verify functionality
          </p>
        </div>

        {/* Test Input */}
        <Card className={`${theme.backgrounds.card} border ${theme.borders.default} mb-6`}>
          <CardHeader>
            <CardTitle className={`${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>
              TEST CONFIGURATION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase block mb-2`}>
                Contract Address
              </label>
              <Input
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                className={theme.inputs.boxed}
                placeholder="0x..."
              />
              <p className={`mt-2 ${theme.text.muted} ${theme.text.small} ${theme.fonts.mono}`}>
                Default: USDT (0xdac17f958d2ee523a2206206994597c13d831ec7)
              </p>
            </div>
            
            <Button
              onClick={testAllAPIs}
              className={`w-full ${theme.buttons.primary} uppercase`}
            >
              RUN ALL TESTS
            </Button>
          </CardContent>
        </Card>

        {/* API Status Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {apis.map((api, index) => (
            <Card key={api.name} className={`${theme.backgrounds.card} border ${theme.borders.default}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${theme.text.primary} ${theme.fonts.mono} ${theme.text.base} ${theme.fonts.tracking}`}>
                    {api.name}
                  </CardTitle>
                  {getStatusIcon(api.status)}
                </div>
                {api.timestamp && (
                  <p className={`${theme.text.muted} ${theme.text.small} ${theme.fonts.mono} mt-1`}>
                    {new Date(api.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {api.status === 'idle' && (
                  <p className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small}`}>
                    READY TO TEST
                  </p>
                )}
                
                {api.status === 'loading' && (
                  <p className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small}`}>
                    TESTING API CONNECTION...
                  </p>
                )}
                
                {api.status === 'success' && api.data && (
                  <div className="space-y-2">
                    <div className={`p-3 border ${theme.borders.light} ${theme.backgrounds.overlay}`}>
                      <pre className={`${theme.text.primary} ${theme.fonts.mono} ${theme.text.small} overflow-x-auto`}>
                        {(() => JSON.stringify(api.data, null, 2))()}
                      </pre>
                    </div>
                    <p className={`${theme.text.primary} ${theme.fonts.mono} ${theme.text.small}`}>
                      ✓ API OPERATIONAL
                    </p>
                  </div>
                )}
                
                {api.status === 'error' && (
                  <div className="space-y-2">
                    <p className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small}`}>
                      ✗ ERROR: {api.error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    switch (index) {
                      case 0: testMobula(); break
                      case 1: testCoinGecko(); break
                      case 2: testCoinMarketCap(); break
                      case 3: testGoPlus(); break
                    }
                  }}
                  disabled={api.status === 'loading'}
                  className={`w-full mt-4 ${theme.buttons.ghost} uppercase`}
                >
                  {api.status === 'loading' ? 'TESTING...' : 'TEST INDIVIDUAL'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Environment Variables Check */}
        <Card className={`${theme.backgrounds.card} border ${theme.borders.default} mt-6`}>
          <CardHeader>
            <CardTitle className={`${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>
              ENVIRONMENT CONFIGURATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.secondary}`}>MOBULA_API_KEY</span>
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.primary}`}>
                  {process.env.NEXT_PUBLIC_MOBULA_API_KEY ? '✓ CONFIGURED' : '✗ MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.secondary}`}>COINGECKO_API_KEY</span>
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.primary}`}>
                  {process.env.NEXT_PUBLIC_COINGECKO_API_KEY ? '✓ CONFIGURED' : '✗ MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.secondary}`}>COINMARKETCAP_API_KEY</span>
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.primary}`}>
                  {process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY ? '✓ CONFIGURED' : '✗ MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.secondary}`}>GOPLUS (No Key Required)</span>
                <span className={`${theme.fonts.mono} ${theme.text.small} ${theme.text.primary}`}>✓ READY</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
  )
}
