'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface APITestResult {
  api: string
  success: boolean
  error?: string
  responseTime: number
  data?: any
}

export default function TestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<APITestResult[]>([])
  const [solanaTest, setSolanaTest] = useState(false)

  const testAllAPIs = async () => {
    setTesting(true)
    setResults([])

    try {
      const response = await fetch('/api/test')
      const data = await response.json()

      if (data.success) {
        setResults(data.results || [])
      } else {
        setResults([{
          api: 'Test Error',
          success: false,
          error: data.error || 'Failed to run tests',
          responseTime: 0,
        }])
      }
    } catch (error) {
      setResults([{
        api: 'Network Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 0,
      }])
    } finally {
      setTesting(false)
    }
  }

  const testSolana = async () => {
    setSolanaTest(true)

    try {
      // Test with USDC on Solana
      const solanaAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      const response = await fetch(`/api/test?solana=${solanaAddress}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Solana test error:', error)
    } finally {
      setSolanaTest(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20"></div>

      <main className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">∞</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono tracking-wider">
              API TESTING SUITE
            </h1>
            <p className="text-gray-400 text-sm font-mono">TEST ALL INTEGRATED APIs</p>
          </div>

          {/* Test Controls */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-px bg-white"></div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wider">TEST ALL APIS</h3>
                </div>
                <p className="text-xs text-white/60 font-mono mb-4">
                  TEST MOBULA, GOPLUS, COINMARKETCAP, AND COINGECKO
                </p>
                <Button
                  onClick={testAllAPIs}
                  disabled={testing}
                  className="w-full bg-transparent border border-white text-white font-mono text-xs hover:bg-white hover:text-black transition-all disabled:opacity-30"
                >
                  {testing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>TESTING...</span>
                    </div>
                  ) : (
                    'RUN ALL TESTS'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-px bg-white"></div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wider">TEST SOLANA</h3>
                </div>
                <p className="text-xs text-white/60 font-mono mb-4">
                  TEST SOLANA TOKEN SCANNING (USDC)
                </p>
                <Button
                  onClick={testSolana}
                  disabled={solanaTest}
                  className="w-full bg-transparent border border-white text-white font-mono text-xs hover:bg-white hover:text-black transition-all disabled:opacity-30"
                >
                  {solanaTest ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>TESTING...</span>
                    </div>
                  ) : (
                    'TEST SOLANA'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px bg-white"></div>
                  <CardTitle className="text-white font-mono tracking-wider text-sm">TEST RESULTS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 border ${
                        result.success
                          ? 'border-white/20 bg-black/40'
                          : 'border-white/20 bg-black/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                          <span className="text-sm font-bold text-white font-mono">{result.api}</span>
                        </div>
                        <div className="text-xs text-white/60 font-mono">
                          {result.responseTime}MS
                        </div>
                      </div>
                      {result.error && (
                        <div className="text-xs text-white/60 font-mono mt-2">
                          ERROR: {result.error}
                        </div>
                      )}
                      {result.data && (
                        <div className="text-xs text-white/40 font-mono mt-2">
                          DATA: {JSON.stringify(result.data)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-black/60 backdrop-blur-lg border border-white/20 mt-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-px bg-white"></div>
                <CardTitle className="text-white font-mono tracking-wider text-sm">TESTING GUIDE</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-white/60 font-mono">
                <p>• TESTS ALL INTEGRATED APIS: MOBULA, GOPLUS, COINMARKETCAP, COINGECKO</p>
                <p>• VERIFIES API ENDPOINTS ARE WORKING CORRECTLY</p>
                <p>• CHECKS RESPONSE TIMES AND ERROR HANDLING</p>
                <p>• SOLANA TEST VERIFIES NON-EVM CHAIN SUPPORT</p>
                <p>• USE THIS PAGE TO DEBUG API CONNECTION ISSUES</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}






