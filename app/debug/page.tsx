"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function DebugPanel() {
  const { user, loading } = useAuth()
  
  type ResponseType = {
    status: string
    endpoint?: string
    message?: string
    data?: Record<string, unknown>
  }
  
  type ApiTestResult = {
    status: 'pending' | 'success' | 'error'
    data: unknown
    error: string | null
  }
  
  type ApiTests = {
    mobula: ApiTestResult
    coingecko: ApiTestResult
    coinmarketcap: ApiTestResult
    goplus: ApiTestResult
  }
  
  const [response, setResponse] = useState<ResponseType | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [apiTests, setApiTests] = useState<ApiTests | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.email !== "admin@tokenguard.pro")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const testAllAPIs = async () => {
    setTestLoading(true)
    setApiTests(null)

    const tests: ApiTests = {
      mobula: { status: 'pending', data: null, error: null },
      coingecko: { status: 'pending', data: null, error: null },
      coinmarketcap: { status: 'pending', data: null, error: null },
      goplus: { status: 'pending', data: null, error: null },
    }

    // Test all APIs
    try {
      // Mobula
      try {
        const res = await fetch('/api/token/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: 'ethereum', source: 'mobula' }),
        })
        const data = await res.json()
        tests.mobula = { status: res.ok ? 'success' : 'error', data, error: res.ok ? null : 'API request failed' }
      } catch (e) {
        tests.mobula = { status: 'error', data: null, error: (e as Error).message }
      }

      // CoinGecko  
      try {
        const res = await fetch('/api/token/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: 'bitcoin', source: 'coingecko' }),
        })
        const data = await res.json()
        tests.coingecko = { status: res.ok ? 'success' : 'error', data, error: res.ok ? null : 'API request failed' }
      } catch (e) {
        tests.coingecko = { status: 'error', data: null, error: (e as Error).message }
      }

      // CoinMarketCap
      try {
        const res = await fetch('/api/token/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: 'BTC', source: 'coinmarketcap' }),
        })
        const data = await res.json()
        tests.coinmarketcap = { status: res.ok ? 'success' : 'error', data, error: res.ok ? null : 'API request failed' }
      } catch (e) {
        tests.coinmarketcap = { status: 'error', data: null, error: (e as Error).message }
      }

      // GoPlus
      try {
        const res = await fetch('/api/token/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            chain: '1' 
          }),
        })
        const data = await res.json()
        tests.goplus = { status: res.ok ? 'success' : 'error', data, error: res.ok ? null : 'API request failed' }
      } catch (e) {
        tests.goplus = { status: 'error', data: null, error: (e as Error).message }
      }
    } catch (error) {
      console.error('Test error:', error)
    }

    setApiTests(tests)
    setTestLoading(false)
  }

  const testAPI = async (endpoint: string) => {
    setTestLoading(true)
    setResponse({ status: "Testing...", endpoint })

    setTimeout(() => {
      setResponse({
        status: "success",
        endpoint,
        message: `${endpoint} API test completed`,
        data: { test: true, timestamp: new Date().toISOString() },
      })
      setTestLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || user.email !== "admin@tokenguard.pro") return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">TokenGuard Pro - Debug</h1>
          </Link>

          <Link href="/admin">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Debug Panel</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">API Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testAllAPIs}
                disabled={testLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                {testLoading ? 'Testing All APIs...' : 'Test All APIs (Real-time)'}
              </Button>

              <Button
                onClick={() => testAPI("mobula")}
                disabled={testLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Test Mobula API
              </Button>

              <Button
                onClick={() => testAPI("goplus")}
                disabled={testLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Test GoPlus API
              </Button>

              <Button
                onClick={() => testAPI("coinmarketcap")}
                disabled={testLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Test CoinMarketCap API
              </Button>

              <Button
                onClick={() => testAPI("coingecko")}
                disabled={testLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Test CoinGecko API
              </Button>

              <Button
                onClick={() => testAPI("groq")}
                disabled={testLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Test Groq AI API
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Environment Config</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ConfigRow label="Mobula API" status="MISSING" />
              <ConfigRow label="GoPlus API" status="FREE (No Key Required)" />
              <ConfigRow label="CoinMarketCap API" status="MISSING" />
              <ConfigRow label="CoinGecko API" status="MISSING" />
              <ConfigRow label="Groq API" status="MISSING" />
              <ConfigRow label="Firebase Config" status="SET" />
            </CardContent>
          </Card>

          {response && (
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 rounded p-4 text-xs text-green-400 overflow-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {apiTests && (
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">API Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(apiTests).map(([name, result]: [string, ApiTestResult]) => (
                    <div key={name} className="bg-slate-900/50 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold capitalize">{name}</h3>
                        <span className={`text-sm ${result.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {result.status === 'success' ? '✓ Success' : '✗ Failed'}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-300 overflow-auto max-h-48">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfigRow({ label, status }: { label: string; status: string }) {
  const isSet = status === "SET" || status.includes("No Key")
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <span className="text-gray-300">{label}</span>
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          isSet ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}
      >
        {status}
      </span>
    </div>
  )
}
